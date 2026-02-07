
export enum MovementGesture {
  NONE = 'NONE',
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  STOP = 'STOP',
}

export enum CombatGesture {
  IDLE = 'IDLE',
  AIM = 'AIM',
  FIRE = 'FIRE',
  IRON_SIGHT = 'IRON_SIGHT',
  RELOAD = 'RELOAD',
}

export enum EnemyAIState {
  PATROLLING = 'PATROLLING',
  ALERT = 'ALERT',
  ATTACKING = 'ATTACKING',
  DEAD = 'DEAD',
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
}

export type DifficultyLevel = 'EASY' | 'CASUAL' | 'TACTICAL' | 'INSANE';

export interface DifficultyProfile {
  level: DifficultyLevel;
  label: string;
  description: string;
  spawnIntervalMs: number;
  maxEnemies: number;
  enemyDamage: number;
  enemySpeedScale: number;
  enemyAttackCooldownMs: number;
  scoreMultiplier: number;
}

export interface TrackerCalibration {
  movementCenterX: number;
  movementCenterY: number;
  movementDeadzone: number;
  fistStopThreshold: number;
  indexExtendedThreshold: number;
  fireCurlThreshold: number;
  openHandThreshold: number;
  smoothingFrames: number;
}

export interface HandState {
  movement: MovementGesture;
  combat: CombatGesture;
  leftHandPresent: boolean;
  rightHandPresent: boolean;
}

export interface MatchStats {
  shotsFired: number;
  shotsHit: number;
  enemiesDefeated: number;
  highestWave: number;
  currentStreak: number;
  bestStreak: number;
  sessionStartedAt: number | null;
  sessionEndedAt: number | null;
}

export interface GameState {
  ammo: number;
  maxAmmo: number;
  score: number;
  health: number;
  status: GameStatus;
  isReloading: boolean;
  lastDamageTime: number;
  isGameOver: boolean;
  wave: number;
  difficulty: DifficultyLevel;
  stats: MatchStats;
}

export interface Target {
  id: string;
  position: [number, number, number];
  health: number;
  state: EnemyAIState;
  targetPoint: [number, number, number];
  lastActionTime: number;
  strafeSeed: number;
}
