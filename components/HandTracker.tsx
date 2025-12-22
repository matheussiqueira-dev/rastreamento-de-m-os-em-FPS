
import React, { useRef, useEffect, useState } from 'react';
import { HandState, MovementGesture, CombatGesture } from '../types';

interface HandTrackerProps {
  onUpdate: (state: HandState) => void;
  onError?: (message: string) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastStateRef = useRef<HandState | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    let camera: any = null;

    // Use any casting for window to access MediaPipe global variables
    const hands = new (window as any).Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    const onResults = (results: any) => {
      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

      let newState: HandState = {
        movement: MovementGesture.STOP,
        combat: CombatGesture.IDLE,
        leftHandPresent: false,
        rightHandPresent: false,
      };

      if (results.multiHandLandmarks && results.multiHandedness) {
        const drawingUtils = window as any;
        results.multiHandLandmarks.forEach((landmarks: any, index: number) => {
          const handedness = results.multiHandedness[index].label; 
          const isActuallyLeft = handedness === 'Right'; 

          drawingUtils.drawConnectors(ctx, landmarks, (window as any).HAND_CONNECTIONS, { color: isActuallyLeft ? '#3b82f6' : '#ef4444', lineWidth: 2 });
          drawingUtils.drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });

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

      if (JSON.stringify(lastStateRef.current) !== JSON.stringify(newState)) {
        onUpdate(newState);
        lastStateRef.current = newState;
      }
    };

    hands.onResults(onResults);

    const initCamera = async () => {
      try {
        // First check if any camera exists
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        
        if (!hasCamera) {
          throw new Error("No video input devices found. Please connect a camera.");
        }

        // Initialize Camera using global window object
        camera = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        await camera.start();
        setCameraActive(true);
      } catch (err: any) {
        console.error("HandTracker Camera Error:", err);
        let message = "Could not access camera.";
        if (err.name === 'NotFoundError') {
          message = "Requested camera device not found. If you are on a mobile device or using a virtual camera, ensure it is active.";
        } else if (err.name === 'NotAllowedError') {
          message = "Camera access denied. Please allow camera permissions in your browser settings.";
        } else if (err.message) {
          message = err.message;
        }
        if (onError) onError(message);
      }
    };

    initCamera();

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, [onUpdate, onError]);

  const detectMovement = (landmarks: any): MovementGesture => {
    const wrist = landmarks[0];
    const isFist = [8, 12, 16, 20].every(idx => getDistance(landmarks[idx], landmarks[0]) < 0.15);
    if (isFist) return MovementGesture.STOP;

    const centerX = 0.25;
    const centerY = 0.5;
    const threshold = 0.08;

    if (wrist.y < centerY - threshold) return MovementGesture.FORWARD;
    if (wrist.y > centerY + threshold) return MovementGesture.BACKWARD;
    if (wrist.x < centerX - threshold) return MovementGesture.RIGHT; 
    if (wrist.x > centerX + threshold) return MovementGesture.LEFT;  

    return MovementGesture.STOP;
  };

  const detectCombat = (landmarks: any): CombatGesture => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexBase = landmarks[5];
    const middleTip = landmarks[12];

    const indexExtended = getDistance(indexTip, landmarks[0]) > 0.3;
    const middleExtended = getDistance(middleTip, landmarks[0]) > 0.3;
    const thumbUp = thumbTip.y < indexBase.y;
    const othersCurled = [16, 20].every(idx => getDistance(landmarks[idx], landmarks[0]) < 0.2);

    const isFullHand = [8, 12, 16, 20].every(idx => getDistance(landmarks[idx], landmarks[0]) > 0.3);
    if (isFullHand) return CombatGesture.RELOAD;

    if (indexExtended && thumbUp && othersCurled) {
      const indexCurvature = getDistance(indexTip, indexBase);
      if (indexCurvature < 0.12) return CombatGesture.FIRE;
      if (middleExtended) return CombatGesture.IRON_SIGHT;
      return CombatGesture.AIM;
    }

    return CombatGesture.IDLE;
  };

  const getDistance = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video ref={videoRef} className="hidden" playsInline muted />
      {!cameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full object-cover scale-x-[-1]" width={640} height={480} />
    </div>
  );
};

export default HandTracker;
