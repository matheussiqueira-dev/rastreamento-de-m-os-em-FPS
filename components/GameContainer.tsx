
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { Sky, Stars, Environment, PerspectiveCamera, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { HandState, MovementGesture, CombatGesture, GameState, Target, EnemyAIState } from '../types';

// Extend the JSX namespace to include Three.js elements used by React Three Fiber
// This fixes the 'Property ... does not exist on type JSX.IntrinsicElements' errors
// by ensuring both global JSX and React.JSX namespaces are extended.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

interface GameContainerProps {
  handState: HandState;
  gameState: GameState;
  onShoot: () => void;
  onScore: (points: number) => void;
  onTakeDamage: (amount: number) => void;
}

const EnemyAIComponent: React.FC<{ 
  target: Target; 
  onHit: (id: string) => void;
  onEnemyShoot: () => void;
}> = ({ target, onHit, onEnemyShoot }) => {
  const meshRef = useRef<THREE.Group>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!meshRef.current || target.state === EnemyAIState.DEAD) return;

    // Pulse animation
    meshRef.current.position.y = target.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    
    // Rotation logic
    if (target.state === EnemyAIState.ALERT || target.state === EnemyAIState.ATTACKING) {
      // Look at player (camera)
      const lookPos = new THREE.Vector3(state.camera.position.x, meshRef.current.position.y, state.camera.position.z);
      meshRef.current.lookAt(lookPos);
      
      // Update eye color based on aggression
      if (eyeRef.current) {
        const color = target.state === EnemyAIState.ATTACKING ? '#ff0000' : '#ffff00';
        (eyeRef.current.material as THREE.MeshStandardMaterial).color.set(color);
        (eyeRef.current.material as THREE.MeshStandardMaterial).emissive.set(color);
      }
    } else {
      // Look towards patrol target
      const lookPos = new THREE.Vector3(target.targetPoint[0], meshRef.current.position.y, target.targetPoint[2]);
      meshRef.current.lookAt(lookPos);
      if (eyeRef.current) {
        (eyeRef.current.material as THREE.MeshStandardMaterial).color.set('#00ff00');
        (eyeRef.current.material as THREE.MeshStandardMaterial).emissive.set('#00ff00');
      }
    }
  });

  return (
    // FIX: group, mesh, geometries, and materials are intrinsic elements provided via ThreeElements extension
    <group ref={meshRef} position={target.position} userData={{ isTarget: true, id: target.id }}>
      {/* Drone Body */}
      <mesh castShadow>
        <octahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Floating Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 32]} />
        <meshStandardMaterial color="#444" emissive="#111" />
      </mesh>
      {/* Eye Sensor */}
      <mesh ref={eyeRef} position={[0, 0, 0.6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

const Projectile: React.FC<{ start: THREE.Vector3; end: THREE.Vector3; color: string }> = ({ start, end, color }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  const distance = start.distanceTo(end);
  const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);

  return (
    // FIX: mesh and boxGeometry intrinsic elements
    <mesh position={midPoint}>
      <boxGeometry args={[0.05, 0.05, distance]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const Weapon: React.FC<{ combat: CombatGesture; isReloading: boolean }> = ({ combat, isReloading }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const targetPos = new THREE.Vector3(0.5, -0.4, -0.8);
    if (combat === CombatGesture.IRON_SIGHT) targetPos.set(0, -0.25, -0.5);
    
    meshRef.current.position.lerp(targetPos, 0.1);
    
    if (combat === CombatGesture.FIRE) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -0.3, 0.2);
    } else {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
    }

    if (isReloading) {
       meshRef.current.position.y -= 0.05;
       meshRef.current.rotation.z += 0.1;
    }
  });

  return (
    // FIX: group, mesh, boxGeometry, and cylinderGeometry intrinsic elements
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.15, 0.25, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.1, -0.3]}>
        <boxGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      {/* Laser Sight */}
      <mesh position={[0, 0.15, -0.7]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 10]} />
        <meshBasicMaterial color="red" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const GameLogic: React.FC<GameContainerProps> = ({ handState, gameState, onShoot, onScore, onTakeDamage }) => {
  const { camera, raycaster, scene } = useThree();
  const [enemies, setEnemies] = useState<Target[]>([]);
  const lastShotTime = useRef(0);

  // AI & Movement Logic
  useFrame((state, delta) => {
    if (gameState.isGameOver) return;

    const moveSpeed = 5 * delta;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const sideDirection = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

    if (handState.movement === MovementGesture.FORWARD) camera.position.add(direction.multiplyScalar(moveSpeed));
    if (handState.movement === MovementGesture.BACKWARD) camera.position.add(direction.multiplyScalar(-moveSpeed));
    if (handState.movement === MovementGesture.LEFT) camera.position.add(sideDirection.multiplyScalar(moveSpeed));
    if (handState.movement === MovementGesture.RIGHT) camera.position.add(sideDirection.multiplyScalar(-moveSpeed));

    // Handle Enemy AI States
    setEnemies(prev => prev.map(enemy => {
      const distToPlayer = new THREE.Vector3(...enemy.position).distanceTo(camera.position);
      let newState = enemy.state;
      let newPos = [...enemy.position] as [number, number, number];
      let newTargetPoint = [...enemy.targetPoint] as [number, number, number];
      let lastAction = enemy.lastActionTime;

      // State Transitions
      if (distToPlayer < 10) newState = EnemyAIState.ATTACKING;
      else if (distToPlayer < 20) newState = EnemyAIState.ALERT;
      else newState = EnemyAIState.PATROLLING;

      // Behavior Logic
      if (newState === EnemyAIState.PATROLLING) {
        const distToTarget = new THREE.Vector3(...enemy.position).distanceTo(new THREE.Vector3(...enemy.targetPoint));
        if (distToTarget < 1) {
           newTargetPoint = [(Math.random() - 0.5) * 50, 1.5, (Math.random() - 0.5) * 50];
        } else {
           const moveDir = new THREE.Vector3(...newTargetPoint).sub(new THREE.Vector3(...enemy.position)).normalize();
           const patrolSpeed = 2 * delta;
           newPos = [
             enemy.position[0] + moveDir.x * patrolSpeed,
             enemy.position[1],
             enemy.position[2] + moveDir.z * patrolSpeed
           ];
        }
      } else if (newState === EnemyAIState.ATTACKING) {
        // Attack logic: shoot every 2 seconds
        if (Date.now() - lastAction > 2000) {
          onTakeDamage(15);
          lastAction = Date.now();
        }
      }

      return { ...enemy, state: newState, position: newPos, targetPoint: newTargetPoint, lastActionTime: lastAction };
    }));

    // Player Shooting Logic
    if (handState.combat === CombatGesture.FIRE && gameState.ammo > 0 && !gameState.isReloading) {
      const now = Date.now();
      if (now - lastShotTime.current > 250) {
        onShoot();
        lastShotTime.current = now;

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const hit = intersects.find(i => {
          let p = i.object.parent;
          while(p) {
            if(p.userData?.isTarget) return true;
            p = p.parent;
          }
          return false;
        });
        
        if (hit) {
          let p = hit.object.parent;
          while(p && !p.userData?.isTarget) p = p.parent;
          const targetId = p?.userData?.id;
          
          onScore(250);
          setEnemies(prev => prev.filter(e => e.id !== targetId));
        }
      }
    }
  });

  // Spawn Enemies
  useEffect(() => {
    const interval = setInterval(() => {
      if (enemies.length < 4 && !gameState.isGameOver) {
        const id = Math.random().toString();
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * 10;
        setEnemies(prev => [...prev, {
          id,
          position: [Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius],
          health: 100,
          state: EnemyAIState.PATROLLING,
          targetPoint: [(Math.random() - 0.5) * 40, 1.5, (Math.random() - 0.5) * 40],
          lastActionTime: Date.now()
        }]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [enemies, gameState.isGameOver]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />
      {!gameState.isGameOver && (
        <Weapon combat={handState.combat} isReloading={gameState.isReloading} />
      )}
      
      {enemies.map(e => (
        <EnemyAIComponent 
          key={e.id} 
          target={e} 
          onHit={() => {}} 
          onEnemyShoot={() => onTakeDamage(10)} 
        />
      ))}

      {/* Environment */}
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />
      {/* FIX: ambientLight and pointLight intrinsic elements */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4444ff" />

      {/* Grid Floor */}
      {/* FIX: mesh, planeGeometry, and gridHelper intrinsic elements */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} metalness={0} />
      </mesh>
      <gridHelper args={[200, 100, "#111", "#050505"]} position={[0, 0.01, 0]} />
    </>
  );
};

const GameContainer: React.FC<GameContainerProps> = (props) => {
  return (
    <div className="w-full h-full cursor-none">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <GameLogic {...props} />
        </Suspense>
      </Canvas>
      
      {/* Crosshair */}
      {!props.gameState.isGameOver && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className={`w-10 h-10 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${props.handState.combat === CombatGesture.AIM || props.handState.combat === CombatGesture.IRON_SIGHT ? 'scale-50 border-cyan-400 rotate-45' : 'scale-100 border-white/20'}`}>
            <div className="w-[1px] h-4 bg-white/40 absolute -top-2" />
            <div className="w-[1px] h-4 bg-white/40 absolute -bottom-2" />
            <div className="w-4 h-[1px] bg-white/40 absolute -left-2" />
            <div className="w-4 h-[1px] bg-white/40 absolute -right-2" />
            <div className={`w-1 h-1 bg-white rounded-full ${props.handState.combat === CombatGesture.FIRE ? 'scale-[5] bg-orange-400' : ''}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameContainer;
