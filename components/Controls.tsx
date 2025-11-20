import React, { useState } from 'react';
import { X, Settings2, RefreshCw, Play, Check, AlertTriangle, Pause } from 'lucide-react';
import { AnimationConfig, AnimationStatus } from '../types';

interface ControlsProps {
  config: AnimationConfig;
  onChange: (config: AnimationConfig) => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(true);

  const update = (key: keyof AnimationConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
      >
        <Settings2 size={20} className="text-zinc-700" />
      </button>
    );
  }

  return (
    <div className="absolute top-6 right-6 z-50 w-72 bg-white/90 backdrop-blur-xl border border-zinc-200/80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-10 duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-white/50">
        <div className="flex items-center gap-2">
          <Settings2 size={16} className="text-zinc-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Parameters</span>
        </div>
        <div className="flex items-center gap-1">
             <button onClick={onReset} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-colors" title="Reset Defaults">
                <RefreshCw size={14} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={14} />
            </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        
        {/* Section: Simulation Status */}
        <div className="space-y-3">
           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Simulation State</label>
           <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => update('status', AnimationStatus.IDLE)}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${config.status === AnimationStatus.IDLE ? 'bg-zinc-100 border-zinc-400' : 'border-zinc-100 hover:bg-zinc-50'}`}
                title="Idle"
              >
                <Pause size={12} />
              </button>
              <button 
                onClick={() => update('status', AnimationStatus.ACTIVE)}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${config.status === AnimationStatus.ACTIVE ? 'bg-blue-50 border-blue-200 text-blue-500' : 'border-zinc-100 hover:bg-zinc-50'}`}
                title="Active / In Progress"
              >
                <Play size={12} />
              </button>
              <button 
                onClick={() => update('status', AnimationStatus.SUCCESS)}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${config.status === AnimationStatus.SUCCESS ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'border-zinc-100 hover:bg-zinc-50'}`}
                title="Success"
              >
                <Check size={12} />
              </button>
              <button 
                onClick={() => update('status', AnimationStatus.ERROR)}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${config.status === AnimationStatus.ERROR ? 'bg-red-50 border-red-200 text-red-500' : 'border-zinc-100 hover:bg-zinc-50'}`}
                title="Error"
              >
                <AlertTriangle size={12} />
              </button>
           </div>
        </div>

        {/* Section: Physics */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Physics Engine</label>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Simulation Speed</span>
              <span className="font-mono text-zinc-500">{config.baseSpeed.toFixed(1)}x</span>
            </div>
            <input 
              type="range" min="0.1" max="3.0" step="0.1" 
              value={config.baseSpeed}
              onChange={(e) => update('baseSpeed', parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Chaos Factor</span>
              <span className="font-mono text-zinc-500">{(config.chaosFactor * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1.0" step="0.05" 
              value={config.chaosFactor}
              onChange={(e) => update('chaosFactor', parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>

        {/* Section: Visuals */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Visuals</label>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Particle Density</span>
              <span className="font-mono text-zinc-500">{config.particleCount}</span>
            </div>
            <input 
              type="range" min="100" max="1500" step="50" 
              value={config.particleCount}
              onChange={(e) => update('particleCount', parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Dot Size</span>
              <span className="font-mono text-zinc-500">{config.particleSize.toFixed(1)}px</span>
            </div>
            <input 
              type="range" min="0.5" max="4.0" step="0.1" 
              value={config.particleSize}
              onChange={(e) => update('particleSize', parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Connection Mesh</span>
              <span className="font-mono text-zinc-500">{config.connectionThreshold > 0 ? 'On' : 'Off'}</span>
            </div>
            <input 
              type="range" min="0" max="100" step="10" 
              value={config.connectionThreshold}
              onChange={(e) => update('connectionThreshold', parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>

        {/* Section: Colors */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Theme</label>
          
          <div className="flex gap-2">
            <button 
               onClick={() => update('colorTheme', 'light')}
               className={`flex-1 py-2 text-xs rounded border ${config.colorTheme === 'light' ? 'bg-zinc-100 border-zinc-300 font-bold' : 'border-zinc-100 hover:bg-zinc-50'}`}
            >
              Light
            </button>
            <button 
               onClick={() => update('colorTheme', 'dark')}
               className={`flex-1 py-2 text-xs rounded border ${config.colorTheme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700 font-bold' : 'border-zinc-100 hover:bg-zinc-50'}`}
            >
              Dark
            </button>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Accent Color</span>
            </div>
            <div className="flex gap-2 flex-wrap">
                {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                    <button
                        key={color}
                        onClick={() => update('accentColor', color)}
                        className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${config.accentColor === color ? 'ring-2 ring-offset-2 ring-black/20 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Controls;