import React from 'react';
import { SCENARIOS } from '../constants';
import { RotateCcw } from 'lucide-react';

interface ScenarioControlsProps {
  currentId: number;
  onSelect: (id: number) => void;
  onReset: () => void;
}

const ScenarioControls: React.FC<ScenarioControlsProps> = ({ currentId, onSelect, onReset }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex gap-2">
        {Object.values(SCENARIOS).map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`
              px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 border whitespace-nowrap
              ${currentId === s.id 
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
            `}
          >
            Bài {s.id}
          </button>
        ))}
      </div>
      
      {/* Small backup reset button */}
      <button
        onClick={onReset}
        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg transition-colors"
        title="Reset"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};

export default ScenarioControls;