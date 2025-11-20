export interface Point {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Particle extends Point, Velocity {
  id: number;
  baseX: number;
  baseY: number;
  radius: number;
  targetX?: number; // The destination for shape forming
  targetY?: number;
  friction: number;
  ease: number;
  
  // Visual properties
  alpha?: number;
  color?: string;
}

export enum AnimationMode {
  CORE_LOADING = 'CORE_LOADING',
  CORE_SUCCESS = 'CORE_SUCCESS',
  CORE_ERROR = 'CORE_ERROR',
  CORE_WARNING = 'CORE_WARNING',
  CORE_EMPTY = 'CORE_EMPTY'
}

export interface XYTEUseCase {
  id: AnimationMode;
  label: string;
  description: string;
  icon: string; 
  // Defined dimensions for the "Habitat"
  width: number;
  height: number;
}

export interface AnimationConfig {
  particleCount: number;
  baseSpeed: number;
  particleSize: number;
  chaosFactor: number; 
  colorTheme: 'light' | 'dark';
  primaryColor: string; 
  accentColor: string; 
  connectionThreshold: number;
}