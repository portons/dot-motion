
import { AnimationMode, XYTEUseCase, AnimationConfig } from './types';

export const MOUSE_RADIUS = 100;

export const DEFAULT_CONFIG: AnimationConfig = {
  particleCount: 800,
  baseSpeed: 1.0,
  particleSize: 2.0, // Slightly larger for better visibility
  chaosFactor: 0.15,
  colorTheme: 'light',
  primaryColor: '#18181b', // Zinc-900
  accentColor: '#0ea5e9', // Sky-500
  connectionThreshold: 0,
};

export const XYTE_CASES: XYTEUseCase[] = [
  {
    id: AnimationMode.CORE_LOADING,
    label: "Processing",
    description: "Centralized data aggregation.",
    icon: "loader",
    width: 500,
    height: 500
  },
  {
    id: AnimationMode.CORE_MINDMAP,
    label: "Entity Graph",
    description: "Visualizing relationships.",
    icon: "share-2",
    width: 600,
    height: 450
  },
  {
    id: AnimationMode.CORE_SUCCESS,
    label: "Success",
    description: "Verification complete.",
    icon: "check-circle",
    width: 320, // Smaller, toast-like
    height: 320
  },
  {
    id: AnimationMode.CORE_WARNING,
    label: "System Warning",
    description: "Stability compromised.",
    icon: "alert-triangle",
    width: 400,
    height: 350
  },
  {
    id: AnimationMode.CORE_ERROR,
    label: "Critical Failure",
    description: "Containment breach / Entropy.",
    icon: "x-circle",
    width: 450, // Alert box
    height: 450
  },
  {
    id: AnimationMode.CORE_EMPTY,
    label: "Scanning",
    description: "Searching for signals.",
    icon: "search",
    width: 600, // Wide area scan
    height: 400
  }
];
