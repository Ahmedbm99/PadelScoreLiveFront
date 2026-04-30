import React from 'react';
import { getPointStatusLabel } from '../services/scoreEngine.js';

function MatchInfo({ scoreState, phase }) {
  const totalSets = scoreState.sets?.length || 0;
  const status = getPointStatusLabel(scoreState);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">{phase || 'Friendly'}</span>
        <span className="rounded-full border border-cyan-200/35 bg-cyan-400/15 px-3 py-1 text-cyan-100">
          {scoreState.format === 'super_tiebreak' ? 'Best of 3 (Super TB 3rd)' : 'Best of 3 sets'}
        </span>
        <span className="rounded-full border border-fuchsia-200/35 bg-fuchsia-400/15 px-3 py-1 text-fuchsia-100">{status}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-100 sm:gap-3">
        <span>Set {totalSets + 1}</span>
        <span>Team to Serve : {scoreState.currentServer === 'team1' ? 'Team 1' : 'Team 2'}</span>
        {scoreState.isTieBreak && (
          <>
            <span className="text-slate-300/60">�</span>
            <span>Tie-break {scoreState.tieBreakPoints.team1}-{scoreState.tieBreakPoints.team2}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default MatchInfo;
