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
  targetX?: number;
  targetY?: number;
  friction: number;
  ease: number;
  group?: number; 
  angle?: number;
  // For advanced effects
  alpha?: number;
  hue?: number;
  life?: number; // For temporary particles like debris
  locked?: boolean; // For grid effects
}

export enum AnimationMode {
  // General UI
  IDLE_SWARM = 'IDLE_SWARM',
  VOICE_LISTENING = 'VOICE_LISTENING',
  PROCESSING_RING = 'PROCESSING_RING',
  SUCCESS_CHECK = 'SUCCESS_CHECK',
  ALERT_ERROR = 'ALERT_ERROR',
  
  // IoT Core
  IOT_TOPOLOGY = 'IOT_TOPOLOGY',
  IOT_TELEMETRY = 'IOT_TELEMETRY', // Updated look
  IOT_COMMAND = 'IOT_COMMAND', // Added states
  IOT_OTA = 'IOT_OTA', // Updated look
  IOT_INCIDENT = 'IOT_INCIDENT',
  IOT_PAIRING = 'IOT_PAIRING', // New
  IOT_SECURITY = 'IOT_SECURITY' // New
}

export enum AnimationStatus {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface XYTEUseCase {
  id: AnimationMode;
  label: string;
  description: string;
  icon: string; 
  category: 'General UI' | 'IoT Core' | 'Demo Flows';
}

export interface DemoFlow {
  id: string;
  label: string;
  description: string;
  steps: FlowStep[];
}

export interface FlowStep {
  mode: AnimationMode;
  status: AnimationStatus;
  duration: number; // ms
  label?: string; // Description of step
}

export interface AnimationConfig {
  particleCount: number;
  baseSpeed: number;
  particleSize: number;
  connectionThreshold: number; 
  chaosFactor: number; 
  colorTheme: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  status: AnimationStatus; // Current state of the animation
}