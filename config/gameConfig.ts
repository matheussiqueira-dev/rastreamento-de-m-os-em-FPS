import {
  CombatGesture,
  DifficultyLevel,
  DifficultyProfile,
  HandState,
  MovementGesture,
  TrackerCalibration,
} from '../types';

export const DEFAULT_HAND_STATE: HandState = {
  movement: MovementGesture.STOP,
  combat: CombatGesture.IDLE,
  leftHandPresent: false,
  rightHandPresent: false,
};

export const DEFAULT_TRACKER_CALIBRATION: TrackerCalibration = {
  movementCenterX: 0.25,
  movementCenterY: 0.5,
  movementDeadzone: 0.085,
  fistStopThreshold: 0.14,
  indexExtendedThreshold: 0.3,
  fireCurlThreshold: 0.12,
  openHandThreshold: 0.31,
  smoothingFrames: 2,
};

export const DIFFICULTY_PROFILES: Record<DifficultyLevel, DifficultyProfile> = {
  EASY: {
    level: 'EASY',
    label: 'Muito Fácil',
    description: 'Modo treino: inimigos lentos, dano mínimo, tempo para aprender os gestos.',
    spawnIntervalMs: 8000,
    maxEnemies: 2,
    enemyDamage: 3,
    enemySpeedScale: 0.4,
    enemyAttackCooldownMs: 5000,
    scoreMultiplier: 0.5,
  },
  CASUAL: {
    level: 'CASUAL',
    label: 'Casual',
    description: 'Entrada ideal para testes de gesto e adaptação inicial.',
    spawnIntervalMs: 3700,
    maxEnemies: 5,
    enemyDamage: 9,
    enemySpeedScale: 0.9,
    enemyAttackCooldownMs: 2100,
    scoreMultiplier: 1,
  },
  TACTICAL: {
    level: 'TACTICAL',
    label: 'Tactical',
    description: 'Ritmo equilibrado entre coordenação, precisão e leitura de cenário.',
    spawnIntervalMs: 2900,
    maxEnemies: 7,
    enemyDamage: 12,
    enemySpeedScale: 1.05,
    enemyAttackCooldownMs: 1700,
    scoreMultiplier: 1.3,
  },
  INSANE: {
    level: 'INSANE',
    label: 'Insane',
    description: 'Alta pressão com maior agressividade de IA e menor margem de erro.',
    spawnIntervalMs: 2100,
    maxEnemies: 9,
    enemyDamage: 16,
    enemySpeedScale: 1.2,
    enemyAttackCooldownMs: 1300,
    scoreMultiplier: 1.7,
  },
};

export const HAPTIC_PATTERNS = {
  FIRE: [35],
  RELOAD: [45, 65, 45, 120, 90],
  DAMAGE: [150, 80, 180],
  WALK_SOFT: [10],
  WALK_HARD: [7, 15, 7],
} as const;

export const MAX_HEALTH = 100;
export const BASE_AMMO = 12;
export const WAVE_ENEMY_STEP = 6;
