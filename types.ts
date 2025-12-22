
export enum MovementGesture {
  NONE = 'NONE',
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  STOP = 'STOP'
}

export enum CombatGesture {
  IDLE = 'IDLE',
  AIM = 'AIM',
  FIRE = 'FIRE',
  IRON_SIGHT = 'IRON_SIGHT',
  RELOAD = 'RELOAD'
}

export enum EnemyAIState {
  PATROLLING = 'PATROLLING',
  ALERT = 'ALERT',
  ATTACKING = 'ATTACKING',
  DEAD = 'DEAD'
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface HandState {
  movement: MovementGesture;
  combat: CombatGesture;
  leftHandPresent: boolean;
  rightHandPresent: boolean;
}

export interface GameState {
  ammo: number;
  score: number;
  health: number;
  status: GameStatus;
  isReloading: boolean;
  lastDamageTime: number;
  isGameOver: boolean;
}

export interface Target {
  id: string;
  position: [number, number, number];
  health: number;
  state: EnemyAIState;
  targetPoint: [number, number, number];
  lastActionTime: number;
}