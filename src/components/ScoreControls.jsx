import React from 'react';
import { useMatch } from '../context/MatchContext.jsx';

function ScoreControls() {
  const {
    handleIncrementPoint,
    handleDecrementPoint,
    handleResetMatch,
    handleSetFormat,
    scoreState
  } = useMatch();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleIncrementPoint('team1')}
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          + Équipe 1
        </button>
        <button
          onClick={() => handleDecrementPoint('team1')}
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
        >
          - Équipe 1
        </button>

        <button
          onClick={() => handleIncrementPoint('team2')}
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          + Équipe 2
        </button>
        <button
          onClick={() => handleDecrementPoint('team2')}
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
        >
          - Équipe 2
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleResetMatch}
          className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
          title="Remet tous les scores à zéro (points, jeux, sets)"
        >
          Reset score
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Format :</span>
          <select
            value={scoreState?.format || 'third_set'}
            onChange={(e) => handleSetFormat(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="third_set">3e set normal</option>
            <option value="super_tiebreak">Super tie-break</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ScoreControls;


