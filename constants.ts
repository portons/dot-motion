import { AnimationMode, XYTEUseCase, AnimationConfig, AnimationStatus, DemoFlow } from './types';

export const MOUSE_RADIUS = 150;
export const CANVAS_PADDING = 50;

export const DEFAULT_CONFIG: AnimationConfig = {
  particleCount: 800,
  baseSpeed: 1.0,
  particleSize: 1.5,
  connectionThreshold: 0, 
  chaosFactor: 0.5,
  colorTheme: 'light',
  primaryColor: '#18181b', // Zinc-900
  accentColor: '#10b981', // Emerald-500
  status: AnimationStatus.IDLE
};

export const XYTE_CASES: XYTEUseCase[] = [
  // --- General UI ---
  {
    id: AnimationMode.IDLE_SWARM,
    label: "System Idle",
    description: "Organic, fluid background motion waiting for input.",
    icon: "activity",
    category: "General UI"
  },
  {
    id: AnimationMode.VOICE_LISTENING,
    label: "Voice Input",
    description: "Audio waveform simulation reacting to simulated sound.",
    icon: "mic",
    category: "General UI"
  },
  {
    id: AnimationMode.PROCESSING_RING,
    label: "Processing",
    description: "Cyclical thinking state for heavy compute tasks.",
    icon: "loader",
    category: "General UI"
  },
  {
    id: AnimationMode.SUCCESS_CHECK,
    label: "Task Complete",
    description: "Particles converging to form a confirmation symbol.",
    icon: "check-circle",
    category: "General UI"
  },
  {
    id: AnimationMode.ALERT_ERROR,
    label: "System Failure",
    description: "Critical system error visualization with unstable geometry.",
    icon: "alert-triangle",
    category: "General UI"
  },

  // --- IoT Core ---
  {
    id: AnimationMode.IOT_TOPOLOGY,
    label: "Device Mesh",
    description: "Visualizing Space > Device relationships and network nodes.",
    icon: "share-2",
    category: "IoT Core"
  },
  {
    id: AnimationMode.IOT_TELEMETRY,
    label: "Live Telemetry",
    description: "Multi-lane sensor data streams and signal processing.",
    icon: "bar-chart-2",
    category: "IoT Core"
  },
  {
    id: AnimationMode.IOT_COMMAND,
    label: "Command Tunnel",
    description: "Secure tunnel command injection states.",
    icon: "terminal",
    category: "IoT Core"
  },
  {
    id: AnimationMode.IOT_INCIDENT,
    label: "Incident Spot",
    description: "Localized anomaly detection and alert pulsing.",
    icon: "zap",
    category: "IoT Core"
  },
  {
    id: AnimationMode.IOT_OTA,
    label: "Firmware OTA",
    description: "Block-based firmware writing visualization.",
    icon: "download-cloud",
    category: "IoT Core"
  },
  {
    id: AnimationMode.IOT_PAIRING,
    label: "Device Pairing",
    description: "Two distinct entities merging into a synchronized state.",
    icon: "link",
    category: "IoT Core"
  },
  {
    id: AnimationMode.IOT_SECURITY,
    label: "Security Scan",
    description: "Radial perimeter scanning and threat detection.",
    icon: "shield",
    category: "IoT Core"
  }
];

export const DEMO_FLOWS: DemoFlow[] = [
  {
    id: 'flow_ota',
    label: 'Firmware Upgrade Cycle',
    description: 'Idle -> Command Sent -> Downloading -> Success',
    steps: [
      { mode: AnimationMode.IOT_TOPOLOGY, status: AnimationStatus.IDLE, duration: 3000, label: 'Monitoring Device Mesh' },
      { mode: AnimationMode.IOT_COMMAND, status: AnimationStatus.ACTIVE, duration: 2000, label: 'Initiating Update Command' },
      { mode: AnimationMode.IOT_OTA, status: AnimationStatus.ACTIVE, duration: 5000, label: 'Flashing Firmware Blocks' },
      { mode: AnimationMode.IOT_OTA, status: AnimationStatus.SUCCESS, duration: 3000, label: 'Update Verified' },
      { mode: AnimationMode.SUCCESS_CHECK, status: AnimationStatus.IDLE, duration: 2000, label: 'System Operational' }
    ]
  },
  {
    id: 'flow_incident',
    label: 'Incident Resolution',
    description: 'Telemetry -> Anomaly -> Alert -> Fix',
    steps: [
      { mode: AnimationMode.IOT_TELEMETRY, status: AnimationStatus.ACTIVE, duration: 4000, label: 'Streaming Sensor Data' },
      { mode: AnimationMode.IOT_INCIDENT, status: AnimationStatus.ACTIVE, duration: 3000, label: 'Anomaly Detected' },
      { mode: AnimationMode.ALERT_ERROR, status: AnimationStatus.ACTIVE, duration: 2000, label: 'Critical Alert Raised' },
      { mode: AnimationMode.IOT_COMMAND, status: AnimationStatus.ACTIVE, duration: 2000, label: 'Auto-Remediation Script' },
      { mode: AnimationMode.IOT_COMMAND, status: AnimationStatus.SUCCESS, duration: 1000, label: 'Script Executed' },
      { mode: AnimationMode.IOT_TOPOLOGY, status: AnimationStatus.IDLE, duration: 3000, label: 'Stability Restored' }
    ]
  }
];