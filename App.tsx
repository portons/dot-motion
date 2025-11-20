
import React, { useState, useEffect, useRef } from 'react';
import DotCanvas from './components/DotCanvas';
import Controls from './components/Controls';
import { AnimationMode, AnimationConfig, EntityState, GraphData } from './types';
import { DEFAULT_CONFIG } from './constants';
import { 
  Activity, Wifi, HardDrive, ShieldCheck, Search, Bell,
  CornerDownRight, MessageSquare, Box
} from 'lucide-react';

// --- FOCUS OVERLAY COMPONENT ---
const FocusOverlay: React.FC<{ targetRect: DOMRect | null, isScanMode: boolean }> = ({ targetRect, isScanMode }) => {
    if (!targetRect) return null;
    const borderPadding = 12; 
    
    return (
        <div 
            className="fixed pointer-events-none z-40 transition-all duration-300 ease-out"
            style={{
                top: targetRect.top - borderPadding,
                left: targetRect.left - borderPadding,
                width: targetRect.width + (borderPadding * 2),
                height: targetRect.height + (borderPadding * 2),
            }}
        >
            <svg className="w-full h-full overflow-visible">
                <rect 
                    x="0" y="0" 
                    width="100%" height="100%" 
                    rx="16" ry="16"
                    fill="none"
                    stroke={isScanMode ? "black" : "#0ea5e9"} 
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    className="opacity-50"
                />
            </svg>
        </div>
    );
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG);
  const [isScanMode, setIsScanMode] = useState(false);
  const [focusedRect, setFocusedRect] = useState<DOMRect | null>(null);

  // --- ENTITY STATE ---
  const [entity, setEntity] = useState<EntityState>({
    mode: AnimationMode.CORE_LOADING,
    position: { bottom: 32, right: 32, width: 160, height: 120, top: 'auto', left: 'auto' },
    isResting: true,
    targetLabel: "Idle"
  });

  const restingPos = { bottom: '2rem', right: '2rem', width: '180px', height: '130px', top: 'auto', left: 'auto' };
  const itemRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // --- DATA MOCKS (Based on User Schema) ---
  const MOCK_GRAPHS: Record<string, GraphData> = {
      'card1': {
          center: { id: 'd1', label: 'Poly Studio X50', type: 'device' },
          neighbors: [
              { node: { id: 's1', label: 'Huddle Room A', type: 'space' }, relation: 'Located In' },
              { node: { id: 'i1', label: 'High Latency', type: 'incident' }, relation: 'Active Incident' },
              { node: { id: 'c1', label: 'Reboot Device', type: 'command' }, relation: 'Suggested Action' },
              { node: { id: 'a1', label: 'Serial #99X', type: 'asset' }, relation: 'Asset Tag' },
          ]
      },
      'card2': {
          center: { id: 'd2', label: 'Corporate Network', type: 'device' },
          neighbors: [
              { node: { id: 's2', label: 'NYC Office', type: 'space' }, relation: 'Region' },
              { node: { id: 'p1', label: 'QoS Policy', type: 'policy' }, relation: 'Governed By' },
              { node: { id: 'd3', label: 'Lobby Switch', type: 'device' }, relation: 'Connected Peer' },
          ]
      },
      'card3': {
          center: { id: 'd4', label: 'Firewall Gateway', type: 'device' },
          neighbors: [
              { node: { id: 's3', label: 'Server Room', type: 'space' }, relation: 'Location' },
              { node: { id: 'c2', label: 'Firmware Update', type: 'command' }, relation: 'Pending' },
          ]
      }
  };

  // --- HOVER HANDLERS (MIND MAP) ---
  const handleMouseEnter = (id: string) => {
      const element = itemRefs.current[id];
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setFocusedRect(rect);

      // Determine Graph Data
      const graph = MOCK_GRAPHS[id];

      // Position Logic: Center of screen or near object?
      // For "Globe" effect, let's make it float near the object but LARGE.
      const floatGap = 24;
      const entityWidth = 400; // Wider for graph
      const entityHeight = 320;

      let targetTop = rect.top + (rect.height / 2) - (entityHeight / 2);
      let targetLeft = rect.right + floatGap;

      // Check screen bounds
      if (targetLeft + entityWidth > window.innerWidth) {
          targetLeft = rect.left - entityWidth - floatGap;
      }
      // Clamp Vertical
      targetTop = Math.max(20, Math.min(window.innerHeight - entityHeight - 20, targetTop));

      if (graph) {
          setEntity({
              mode: AnimationMode.CORE_MINDMAP,
              isResting: false,
              targetLabel: graph.center.label,
              position: {
                  top: targetTop,
                  left: targetLeft,
                  width: entityWidth,
                  height: entityHeight,
                  bottom: 'auto',
                  right: 'auto'
              },
              graphData: graph
          });
      } else {
          // Fallback for generic hover
          setEntity({
              mode: AnimationMode.CORE_EMPTY,
              isResting: false,
              targetLabel: "Scanning...",
              position: {
                  top: targetTop,
                  left: targetLeft,
                  width: 200,
                  height: 150,
                  bottom: 'auto',
                  right: 'auto'
              }
          });
      }
  };

  const handleMouseLeave = () => {
      setFocusedRect(null);
      setEntity(prev => ({
          ...prev,
          mode: AnimationMode.CORE_LOADING, // Go back to idle brain
          isResting: true,
          targetLabel: "Idle",
          position: restingPos,
          graphData: undefined
      }));
  };

  // --- KEYBOARD LISTENERS (SCAN MODE) ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Alt') setIsScanMode(true);
      };
      const handleKeyUp = (e: KeyboardEvent) => {
          if (e.key === 'Alt') setIsScanMode(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, []);

  return (
    <div className={`min-h-screen w-screen overflow-hidden flex flex-col transition-colors duration-500 font-sans selection:bg-black/10 ${config.colorTheme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      <FocusOverlay targetRect={focusedRect} isScanMode={isScanMode} />

      {/* Header */}
      <header className={`h-16 border-b px-6 flex items-center justify-between z-0 ${config.colorTheme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white/50'}`}>
         <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                 <Box size={16} />
             </div>
             <nav className="hidden md:flex gap-6 text-sm font-medium opacity-60">
                 <a href="#" className="hover:opacity-100 text-black">Organization</a>
                 <a href="#" className="hover:opacity-100">Spaces</a>
                 <a href="#" className="hover:opacity-100">Devices</a>
                 <a href="#" className="hover:opacity-100">Incidents</a>
             </nav>
         </div>
         <div className="flex items-center gap-4">
             <button className="p-2 rounded-full hover:bg-black/5"><Search size={18} /></button>
             <div className="w-8 h-8 rounded-full bg-zinc-300" />
         </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto z-0 relative">
          <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Hero Section */}
              <div className="flex justify-between items-end">
                  <div>
                      <h1 className="text-3xl font-light tracking-tight mb-2">Dashboard</h1>
                      <p className="opacity-50">System Health: 98%. Hover cards to analyze entities.</p>
                  </div>
                  <div className="flex gap-2">
                       <div className="px-3 py-1 rounded-full border text-xs font-mono flex items-center gap-2 opacity-60 bg-white">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           LIVE
                       </div>
                  </div>
              </div>

              {/* Grid of Interactable Items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: Device with Incident */}
                  <div 
                    ref={el => { itemRefs.current['card1'] = el; }}
                    onMouseEnter={() => handleMouseEnter('card1')}
                    onMouseLeave={handleMouseLeave}
                    className={`p-6 rounded-2xl border transition-all duration-300 relative group hover:shadow-lg cursor-pointer bg-white border-zinc-200`}
                  >
                      <div className="flex justify-between items-start mb-8">
                          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                              <HardDrive size={24} />
                          </div>
                          <div className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-100">Incident</div>
                      </div>
                      <div className="space-y-1">
                          <div className="text-xl font-bold">Poly Studio X50</div>
                          <div className="text-sm opacity-50">Huddle Room A</div>
                      </div>
                  </div>

                  {/* Card 2: Network */}
                  <div 
                    ref={el => { itemRefs.current['card2'] = el; }}
                    onMouseEnter={() => handleMouseEnter('card2')}
                    onMouseLeave={handleMouseLeave}
                    className={`p-6 rounded-2xl border transition-all duration-300 relative group hover:shadow-lg cursor-pointer bg-white border-zinc-200`}
                  >
                      <div className="flex justify-between items-start mb-8">
                          <div className="p-3 rounded-xl bg-zinc-100 text-zinc-600">
                              <Wifi size={24} />
                          </div>
                          <div className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded border border-green-100">Online</div>
                      </div>
                      <div className="space-y-1">
                          <div className="text-xl font-bold">Corp Network</div>
                          <div className="text-sm opacity-50">NYC Office</div>
                      </div>
                  </div>

                  {/* Card 3: Security */}
                  <div 
                    ref={el => { itemRefs.current['card3'] = el; }}
                    onMouseEnter={() => handleMouseEnter('card3')}
                    onMouseLeave={handleMouseLeave}
                    className={`p-6 rounded-2xl border transition-all duration-300 relative group hover:shadow-lg cursor-pointer bg-white border-zinc-200`}
                  >
                      <div className="flex justify-between items-start mb-8">
                          <div className="p-3 rounded-xl bg-zinc-100 text-zinc-600">
                              <ShieldCheck size={24} />
                          </div>
                          <div className="px-2 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase rounded border border-zinc-200">Checking</div>
                      </div>
                      <div className="space-y-1">
                          <div className="text-xl font-bold">Firewall Gateway</div>
                          <div className="text-sm opacity-50">Server Room</div>
                      </div>
                  </div>

              </div>

              {/* Example List */}
              <div className={`rounded-2xl border overflow-hidden bg-white border-zinc-200`}>
                  <div className="p-4 border-b opacity-50 text-sm font-medium bg-zinc-50/50">Recent Incidents</div>
                  {[1,2,3].map((i) => (
                      <div 
                        key={i} 
                        className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-zinc-50 transition-colors group cursor-default"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-amber-400" />
                              <span className="text-sm font-medium text-zinc-700">High CPU Usage detected on Zoom Room {i}</span>
                          </div>
                          <div className="text-xs text-zinc-400">2m ago</div>
                      </div>
                  ))}
              </div>

              {/* Instructions */}
              <div className="text-center opacity-30 text-sm mt-12">
                  Interaction: Hover cards to activate Entity Graph.
              </div>
          </div>
      </main>

      {/* --- THE ENTITY (MIND MAP GLOBE) --- */}
      <div 
        className={`fixed z-50 transition-all duration-500 ease-out shadow-2xl overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] ${
            entity.isResting 
                ? 'rounded-[32px] backdrop-blur-md border bg-white/90 border-zinc-200' 
                : 'rounded-3xl shadow-2xl bg-white/95 border-zinc-200 ring-1 ring-black/5' 
        }`}
        style={{
            top: entity.position.top,
            left: entity.position.left,
            bottom: entity.position.bottom,
            right: entity.position.right,
            width: entity.position.width,
            height: entity.position.height
        }}
      >
          {/* The Canvas */}
          <div className="absolute inset-0">
              <DotCanvas mode={entity.mode} config={config} graphData={entity.graphData} />
          </div>

          {/* Interaction Layer (Ask AI) - Only visible in MindMap */}
          {!entity.isResting && entity.mode === AnimationMode.CORE_MINDMAP && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                  <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                      <MessageSquare size={14} />
                      <span className="text-xs font-bold">Ask Assistant</span>
                  </button>
              </div>
          )}

          {/* Status Text (Resting) */}
          {entity.isResting && (
             <div className="absolute bottom-3 left-6 flex items-center gap-2 opacity-40">
                 <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">System Active</span>
             </div>
          )}
      </div>

      <Controls config={config} onChange={setConfig} onReset={() => setConfig(DEFAULT_CONFIG)} />

    </div>
  );
};

export default App;
