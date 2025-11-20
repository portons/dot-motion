
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
  
  // MindMap specific
  orbitAngle?: number; // For orbiting particles
  orbitRadius?: number;
  targetNodeIndex?: number; // Which node this particle belongs to
}

export enum AnimationMode {
  CORE_LOADING = 'CORE_LOADING',
  CORE_SUCCESS = 'CORE_SUCCESS',
  CORE_ERROR = 'CORE_ERROR',
  CORE_WARNING = 'CORE_WARNING',
  CORE_EMPTY = 'CORE_EMPTY',
  CORE_MINDMAP = 'CORE_MINDMAP'
}

export interface XYTEUseCase {
  id: AnimationMode;
  label: string;
  description: string;
  icon: string; 
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

export type EntityType = 'device' | 'space' | 'incident' | 'command' | 'policy' | 'asset';

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  status?: 'ok' | 'warning' | 'error' | 'neutral';
  subLabel?: string;
}

export interface GraphData {
  center: GraphNode;
  neighbors: Array<{
    node: GraphNode;
    relation: string; 
  }>;
}

export interface EntityState {
    mode: AnimationMode;
    position: {
        top: number | string;
        left: number | string;
        width: number | string;
        height: number | string;
        bottom?: number | string;
        right?: number | string;
    };
    isResting: boolean;
    targetLabel?: string;
    graphData?: GraphData;
}
