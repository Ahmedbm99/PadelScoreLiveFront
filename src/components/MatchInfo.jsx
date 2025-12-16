import React from 'react';

function MatchInfo({ scoreState, phase }) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-300">
      <div className="flex items-center gap-2">
        {phase && (
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-100">
            {phase}
          </span>
        )}
        <span className="rounded-full bg-court/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-court">
          Format
        </span>
        <span className="text-slate-100 mr-6 font-medium">
          {scoreState.format === 'super_tiebreak'
            ? 'Super tie-break (3e set à 10)'
            : 'Sets à 7 jeux (TB à 10 en cas de 6-6)'}
        </span>
      </div>
      <div className="text-[13px] text-slate-400 flex items-center gap-1">
        <span>Phase :</span>
        <span className="font-semibold text-slate-100">{phase || 'Amicale'}</span>
        <span className="mx-1 text-slate-600">•</span>
        <span>Service :</span>
        <span className="font-semibold text-slate-100">
          {scoreState.currentServer === 'team1' ? 'Équipe 1' : 'Équipe 2'}
        </span>
      </div>
    </div>
  );
}

export default MatchInfo;


