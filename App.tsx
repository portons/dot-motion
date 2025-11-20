import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DotCanvas from './components/DotCanvas';
import Controls from './components/Controls';
import { AnimationMode, AnimationConfig } from './types';
import { XYTE_CASES, DEFAULT_CONFIG } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AnimationMode>(AnimationMode.CORE_LOADING);
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG);

  const currentCase = XYTE_CASES.find(c => c.id === mode);

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 ${config.colorTheme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-black'}`}>
      
      {/* Left Panel: Navigation */}
      <Sidebar currentMode={mode} onModeChange={setMode} />

      {/* Right Panel: Visualization Stage */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-12">
        
        {/* Controls Panel (Floating) */}
        <Controls 
          config={config} 
          onChange={setConfig} 
          onReset={() => setConfig(DEFAULT_CONFIG)}
        />

        {/* Dynamic Habitat Container */}
        {/* This container reshapes itself based on the "use case" to show context */}
        <div className="relative flex flex-col items-center gap-8">
          
          <div 
             className={`relative overflow-hidden transition-all duration-700 ease-spring ${config.colorTheme === 'dark' ? 'bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/50' : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50'}`}
             style={{
               width: currentCase?.width || 500,
               height: currentCase?.height || 400,
               borderRadius: 24,
               borderWidth: 1
             }}
          >
             <DotCanvas mode={mode} config={config} />
          </div>

          {/* Caption */}
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-light tracking-tight">{currentCase?.label}</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
               {currentCase?.description}
            </p>
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;