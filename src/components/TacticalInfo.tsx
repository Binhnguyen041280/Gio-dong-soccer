import React from 'react';
import { Scenario } from '../types';
import { Shield, Zap, Target } from 'lucide-react';

interface TacticalInfoProps {
  scenario: Scenario;
}

const TacticalInfo: React.FC<TacticalInfoProps> = ({ scenario }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 mt-4">
      <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
        <Target size={20} />
        {scenario.title}
      </h3>
      
      <p className="text-slate-300 italic mb-4 border-l-4 border-slate-600 pl-3">
        "{scenario.desc}"
      </p>

      <div className="space-y-2">
        {scenario.tacticalAnalysis.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 min-w-[6px] h-[6px] rounded-full bg-emerald-500 block"></span>
                <span>{point}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TacticalInfo;