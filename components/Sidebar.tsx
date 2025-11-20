import React from 'react';
import { 
  Activity, Mic, Loader, ArrowUp, CheckCircle, AlertTriangle, 
  Share2, BarChart2, Terminal, Zap, DownloadCloud, Link, Shield,
  PlayCircle
} from 'lucide-react';
import { XYTE_CASES, DEMO_FLOWS } from '../constants';
import { AnimationMode } from '../types';

interface SidebarProps {
  currentMode: AnimationMode | string;
  onModeChange: (mode: AnimationMode) => void;
  onFlowStart: (flowId: string) => void;
}

const IconMap: Record<string, React.ElementType> = {
  'activity': Activity,
  'mic': Mic,
  'loader': Loader,
  'arrow-up': ArrowUp,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'share-2': Share2,
  'bar-chart-2': BarChart2,
  'terminal': Terminal,
  'zap': Zap,
  'download-cloud': DownloadCloud,
  'link': Link,
  'shield': Shield
};

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, onFlowStart }) => {
  // Group cases by category
  const categories = Array.from(new Set(XYTE_CASES.map(c => c.category)));

  return (
    <aside className="w-80 bg-zinc-50 h-full border-r border-zinc-200 flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tighter mb-1">XYTE</h1>
        <p className="text-xs text-zinc-400 uppercase tracking-widest">Dot Motion Lib</p>
      </div>

      <div className="flex-1 space-y-8">
        {categories.map(category => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-2">
              {category}
            </h3>
            <nav className="space-y-1">
              {XYTE_CASES.filter(c => c.category === category).map((useCase) => {
                const Icon = IconMap[useCase.icon];
                const isActive = currentMode === useCase.id;
                
                return (
                  <button
                    key={useCase.id}
                    onClick={() => onModeChange(useCase.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-black text-white shadow-lg shadow-zinc-300' 
                        : 'hover:bg-white hover:shadow-sm text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-zinc-400 group-hover:text-black'} />
                      <span className="font-medium text-sm">{useCase.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Flows Section */}
        <div>
             <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-2">
              Demo Flows
            </h3>
            <nav className="space-y-1">
                {DEMO_FLOWS.map((flow) => {
                    const isActive = currentMode === flow.id;
                    return (
                        <button
                            key={flow.id}
                            onClick={() => onFlowStart(flow.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                                isActive 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200' 
                                    : 'hover:bg-white hover:shadow-sm text-zinc-600'
                            }`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <PlayCircle size={16} className={isActive ? 'text-white' : 'text-blue-400 group-hover:text-blue-600'} />
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{flow.label}</span>
                                    <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-zinc-400'}`}>Automated Sequence</span>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </nav>
        </div>

      </div>

      <div className="mt-auto pt-6 border-t border-zinc-200">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span>Connected to Engine</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;