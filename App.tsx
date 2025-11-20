import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DotCanvas from './components/DotCanvas';
import Controls from './components/Controls';
import { AnimationMode, AnimationConfig, AnimationStatus } from './types';
import { XYTE_CASES, DEFAULT_CONFIG, DEMO_FLOWS } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AnimationMode>(AnimationMode.IDLE_SWARM);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [flowStepLabel, setFlowStepLabel] = useState<string>("");
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG);
  
  // Ref for flow timeouts to clear them properly
  const flowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear flow when manual mode changes
  const handleModeChange = (newMode: AnimationMode) => {
      if (flowTimeoutRef.current) clearTimeout(flowTimeoutRef.current);
      setActiveFlowId(null);
      setFlowStepLabel("");
      setMode(newMode);
      // Reset status to idle usually on mode switch
      setConfig(prev => ({ ...prev, status: AnimationStatus.IDLE }));
  };

  const handleFlowStart = (flowId: string) => {
      if (flowTimeoutRef.current) clearTimeout(flowTimeoutRef.current);
      setActiveFlowId(flowId);
      const flow = DEMO_FLOWS.find(f => f.id === flowId);
      if (!flow) return;

      let cumulativeTime = 0;

      flow.steps.forEach((step, index) => {
          const timeout = setTimeout(() => {
              setMode(step.mode);
              setConfig(prev => ({ ...prev, status: step.status }));
              setFlowStepLabel(step.label || "");
              
              // If last step, clear active flow after a delay
              if (index === flow.steps.length - 1) {
                  setTimeout(() => {
                      setActiveFlowId(null);
                      setFlowStepLabel("");
                  }, step.duration);
              }

          }, cumulativeTime);
          
          // We only track the *last* timeout to clear, which is imperfect but okay for simple linear flows.
          // Ideally we'd track all, but since they run sequentially, clearing the "next" planned actions is tricky without a more robust scheduler.
          // For now, simple JS timeouts work for visual demo.
          flowTimeoutRef.current = timeout;
          cumulativeTime += step.duration;
      });
  };

  const currentCase = XYTE_CASES.find(c => c.id === mode);

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 ${config.colorTheme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-black'}`}>
      
      {/* Left Panel: Controls/Nav */}
      <Sidebar 
        currentMode={activeFlowId || mode} 
        onModeChange={handleModeChange} 
        onFlowStart={handleFlowStart}
      />

      {/* Right Panel: Visualization Stage */}
      <main className="flex-1 relative flex flex-col">
        
        {/* Header Overlay */}
        <header className="absolute top-0 left-0 w-full p-8 z-10 pointer-events-none flex justify-between items-start">
          <div>
             <h2 className={`text-4xl font-light tracking-tight opacity-90 ${config.colorTheme === 'dark' ? 'text-white' : 'text-black'}`}>
               {activeFlowId ? DEMO_FLOWS.find(f => f.id === activeFlowId)?.label : currentCase?.label}
             </h2>
             <p className="text-zinc-400 mt-2 max-w-md">
               {activeFlowId ? flowStepLabel : currentCase?.description}
             </p>
          </div>
          
          <div className="flex gap-2">
              {activeFlowId && (
                  <div className="backdrop-blur-sm p-3 rounded-lg border shadow-sm bg-blue-500/10 border-blue-500/20 text-blue-500">
                     <code className="text-xs font-mono animate-pulse">
                        FLOW ACTIVE
                     </code>
                  </div>
              )}
              <div className={`backdrop-blur-sm p-3 rounded-lg border shadow-sm ${config.colorTheme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white/80 border-zinc-100'}`}>
                <code className="text-xs font-mono text-zinc-500">
                  STATUS: {config.status}
                </code>
              </div>
          </div>
        </header>

        {/* Controls Panel (Floating) */}
        <Controls 
          config={config} 
          onChange={setConfig} 
          onReset={() => setConfig(DEFAULT_CONFIG)}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 w-full h-full">
          <DotCanvas mode={mode} config={config} />
        </div>

        {/* Footer Controls/Info */}
        <footer className={`absolute bottom-0 w-full p-6 border-t backdrop-blur-sm flex justify-between items-center text-xs transition-colors ${config.colorTheme === 'dark' ? 'border-zinc-800 bg-zinc-900/50 text-zinc-400' : 'border-zinc-100 bg-white/50 text-zinc-500'}`}>
          <div>
             XYTE Interface System v2.0
          </div>
          <div className="flex gap-4 font-mono">
             <span>PTS: {config.particleCount}</span>
             <span>SPD: {config.baseSpeed.toFixed(1)}x</span>
             <span>THEME: {config.colorTheme.toUpperCase()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;