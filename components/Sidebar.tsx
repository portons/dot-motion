import React from 'react';
import { 
  Loader, CheckCircle, AlertTriangle, XCircle, Search
} from 'lucide-react';
import { XYTE_CASES } from '../constants';
import { AnimationMode } from '../types';

interface SidebarProps {
  currentMode: AnimationMode;
  onModeChange: (mode: AnimationMode) => void;
}

const IconMap: Record<string, React.ElementType> = {
  'loader': Loader,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  'search': Search
};

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  return (
    <aside className="w-80 bg-zinc-50 h-full border-r border-zinc-200 flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tighter mb-1">XYTE</h1>
        <p className="text-xs text-zinc-400 uppercase tracking-widest">Core States</p>
      </div>

      <div className="flex-1 space-y-2">
        {XYTE_CASES.map((useCase) => {
          const Icon = IconMap[useCase.icon];
          const isActive = currentMode === useCase.id;
          
          return (
            <button
              key={useCase.id}
              onClick={() => onModeChange(useCase.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden border ${
                isActive 
                  ? 'bg-white border-zinc-300 shadow-xl shadow-zinc-200/50 scale-[1.02]' 
                  : 'bg-transparent border-transparent hover:bg-white hover:border-zinc-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 group-hover:text-zinc-900'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <span className={`font-bold text-sm block ${isActive ? 'text-zinc-900' : 'text-zinc-600'}`}>{useCase.label}</span>
                  <span className="text-xs text-zinc-400 mt-1 leading-tight block pr-2">{useCase.description}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-zinc-200">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span>System Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;