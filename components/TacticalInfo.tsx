
import React from 'react';
import { Scenario } from '../types';
import { Shield, Zap, Target, Sparkles } from 'lucide-react';

interface TacticalInfoProps {
  scenario: Scenario;
  onOpenAI: () => void;
}

const TacticalInfo: React.FC<TacticalInfoProps> = ({ scenario, onOpenAI }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 mt-4 relative group">
      
      {/* AI Button - Positioned absolute top right */}
      <button 
        onClick={onOpenAI}
        className="absolute top-4 right-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105 border border-white/10 animate-pulse hover:animate-none"
      >
        <Sparkles size={14} /> AI Thiết kế
      </button>

      <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2 pr-24">
        <Target size={20} />
        {scenario.title}
      </h3>
      
      <p className="text-slate-300 italic mb-4 border-l-4 border-slate-600 pl-3 text-sm">
        "{scenario.desc}"
      </p>

      <div className="space-y-2">
        {scenario.tacticalAnalysis && scenario.tacticalAnalysis.length > 0 ? (
           scenario.tacticalAnalysis.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 min-w-[6px] h-[6px] rounded-full bg-emerald-500 block"></span>
                <span>{point}</span>
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-xs italic">Chưa có phân tích chiến thuật.</div>
        )}
      </div>
    </div>
  );
};

export default TacticalInfo;
