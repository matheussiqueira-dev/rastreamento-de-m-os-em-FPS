
import React, { useRef, useEffect, useState } from 'react';
import { HandState, MovementGesture, CombatGesture, TrackerCalibration } from '../types';
import { DEFAULT_HAND_STATE } from '../config/gameConfig';

interface HandTrackerProps {
  onUpdate: (state: HandState) => void;
  onError?: (message: string) => void;
  calibration: TrackerCalibration;
  isPaused: boolean;
}

const statesEqual = (a: HandState | null, b: HandState) => {
  if (!a) return false;
  return (
    a.movement === b.movement &&
    a.combat === b.combat &&
    a.leftHandPresent === b.leftHandPresent &&
    a.rightHandPresent === b.rightHandPresent
  );
};

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate, onError, calibration, isPaused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const calibrationRef = useRef<TrackerCalibration>(calibration);
  const isPausedRef = useRef(isPaused);
  const stableStateRef = useRef<HandState | null>(null);
  const candidateStateRef = useRef<HandState | null>(null);
  const candidateFramesRef = useRef(0);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    calibrationRef.current = calibration;
  }, [calibration]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!window.Hands) {
      onError?.('MediaPipe Hands não foi carregado. Verifique o script no index.html.');
      return;
    }

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    const onResults = (results: any) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      let newState: HandState = { ...DEFAULT_HAND_STATE };

      if (results.multiHandLandmarks && results.multiHandedness) {
        results.multiHandLandmarks.forEach((landmarks: any, index: number) => {
          const handedness = results.multiHandedness[index].label;
          const strokeColor = handedness === 'Right' ? '#46b5ff' : '#ff8b6c';
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: strokeColor, lineWidth: 2 });
          window.drawLandmarks(ctx, landmarks, { color: '#f3f6ff', lineWidth: 1, radius: 2 });
          const wrist = landmarks[0];

          if (wrist.x < 0.5) {
            newState.leftHandPresent = true;
            newState.movement = detectMovement(landmarks);
          } else {
            newState.rightHandPresent = true;
            newState.combat = detectCombat(landmarks);
          }
        });
      }

      const previousCandidate = candidateStateRef.current;
      if (statesEqual(previousCandidate, newState)) {
        candidateFramesRef.current += 1;
      } else {
        candidateStateRef.current = newState;
        candidateFramesRef.current = 1;
      }

      const smoothing = Math.max(1, Math.floor(calibrationRef.current.smoothingFrames));
      if (candidateFramesRef.current >= smoothing && !statesEqual(stableStateRef.current, newState)) {
        stableStateRef.current = { ...newState };
        onUpdate(newState);
      }
    };

    hands.onResults(onResults);

    let animationFrameId: number;
    let isDisposed = false;
    let pausedTickTimeout: number | null = null;

    const processFrame = async () => {
      if (isDisposed) return;

      if (isPausedRef.current) {
        pausedTickTimeout = window.setTimeout(() => {
          animationFrameId = requestAnimationFrame(processFrame);
        }, 140);
        return;
      }

      if (videoRef.current && videoRef.current.readyState >= 2) {
        await hands.send({ image: videoRef.current });
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    const initCamera = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraActive(true);
            processFrame();
          };
        }
      } catch (err: any) {
        console.error("HandTracker Camera Error:", err);
        let message = "Could not access camera.";
        
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = "No camera device was found. Please check your hardware connection and ensure no other app is using the camera.";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = "Camera access denied. Please allow camera permissions in your browser settings to play.";
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          message = "Camera is already in use by another application or tab.";
        } else if (err.message) {
          message = err.message;
        }
        
        if (onError) onError(message);
      }
    };

    initCamera();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      if (pausedTickTimeout) window.clearTimeout(pausedTickTimeout);
      stableStateRef.current = null;
      candidateStateRef.current = null;
      candidateFramesRef.current = 0;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      hands.close?.().catch(() => undefined);
    };
  }, [onUpdate, onError]);

  const detectMovement = (landmarks: any): MovementGesture => {
    const trackerConfig = calibrationRef.current;
    const wrist = landmarks[0];
    const isFist = [8, 12, 16, 20].every(
      idx => getDistance(landmarks[idx], landmarks[0]) < trackerConfig.fistStopThreshold,
    );
    if (isFist) return MovementGesture.STOP;

    const centerX = trackerConfig.movementCenterX;
    const centerY = trackerConfig.movementCenterY;
    const threshold = trackerConfig.movementDeadzone;

    if (wrist.y < centerY - threshold) return MovementGesture.FORWARD;
    if (wrist.y > centerY + threshold) return MovementGesture.BACKWARD;
    if (wrist.x < centerX - threshold) return MovementGesture.RIGHT;
    if (wrist.x > centerX + threshold) return MovementGesture.LEFT;

    return MovementGesture.STOP;
  };

  const detectCombat = (landmarks: any): CombatGesture => {
    const trackerConfig = calibrationRef.current;
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexBase = landmarks[5];
    const middleTip = landmarks[12];

    const indexExtended = getDistance(indexTip, landmarks[0]) > trackerConfig.indexExtendedThreshold;
    const middleExtended = getDistance(middleTip, landmarks[0]) > trackerConfig.indexExtendedThreshold;
    const thumbUp = thumbTip.y < indexBase.y;
    const othersCurled = [16, 20].every(idx => getDistance(landmarks[idx], landmarks[0]) < 0.2);

    const isFullHand = [8, 12, 16, 20].every(
      idx => getDistance(landmarks[idx], landmarks[0]) > trackerConfig.openHandThreshold,
    );
    if (isFullHand) return CombatGesture.RELOAD;

    if (indexExtended && thumbUp && othersCurled) {
      const indexCurvature = getDistance(indexTip, indexBase);
      if (indexCurvature < trackerConfig.fireCurlThreshold) return CombatGesture.FIRE;
      if (middleExtended) return CombatGesture.IRON_SIGHT;
      return CombatGesture.AIM;
    }

    return CombatGesture.IDLE;
  };

  const getDistance = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  return (
    <div className="tracker-root">
      <video ref={videoRef} className="tracker-hidden-video" playsInline muted />
      {!cameraActive ? (
        <div className="tracker-loading">
          <div className="tracker-spinner" />
          <span>Iniciando câmera...</span>
        </div>
      ) : null}
      <canvas ref={canvasRef} className="tracker-canvas" width={640} height={480} />
    </div>
  );
};

export default HandTracker;
