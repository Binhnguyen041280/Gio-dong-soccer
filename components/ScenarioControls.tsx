
import React from 'react';
import { Scenario } from '../types';
import { RotateCcw, Plus } from 'lucide-react';

interface ScenarioControlsProps {
  scenarios: Record<number, Scenario>; // Receive dynamic list
  currentId: number;
  onSelect: (id: number) => void;
  onReset: () => void;
  onAdd: () => void;
}

const ScenarioControls: React.FC<ScenarioControlsProps> = ({ scenarios, currentId, onSelect, onReset, onAdd }) => {
  return (
    <div className="flex flex-row items-center gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
      <div className="flex gap-2">
        {/* Fix: Cast Object.values to Scenario[] to ensure the compiler knows the properties available on each scenario object */}
        {(Object.values(scenarios) as Scenario[]).map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`
              px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 border whitespace-nowrap flex flex-col items-center justify-center min-w-[80px]
              ${currentId === s.id 
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
            `}
          >
            <span>Bài {s.id}</span>
            <span className="text-[9px] opacity-70 truncate max-w-[100px] font-normal">{s.title.replace(`Bài ${s.id}:`, '').trim()}</span>
          </button>
        ))}
      </div>
      
      <div className="w-px h-6 bg-slate-700 mx-1"></div>

      <button
        onClick={onAdd}
        className="px-3 py-2 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-dashed border-emerald-500/50 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
        title="Thêm bài tập mới"
      >
        <Plus size={14} /> <span className="text-xs font-bold">Thêm</span>
      </button>

      <button
        onClick={onReset}
        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg transition-colors"
        title="Reset trạng thái"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};

export default ScenarioControls;
