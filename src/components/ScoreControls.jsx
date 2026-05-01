import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext.jsx';

function ScoreControls() {
  const {
    handleIncrementPoint,
    handleDecrementPoint,
    handleResetMatch,
    handleSetFormat,
    handleUndoLastAction,
    handleApplyCorrection,
    scoreState,
    actionError
  } = useMatch();

  const [showCorrection, setShowCorrection] = useState(false);
  const [manual, setManual] = useState({ games1: '', games2: '', points1: '', points2: '', tiebreak1: '', tiebreak2: '' });

  const handleManualSave = async () => {
    await handleApplyCorrection({
      games: { team1: Number(manual.games1 || scoreState.games.team1), team2: Number(manual.games2 || scoreState.games.team2) },
      points: { team1: Number(manual.points1 || scoreState.points.team1), team2: Number(manual.points2 || scoreState.points.team2) },
      tieBreakPoints: { team1: Number(manual.tiebreak1 || scoreState.tieBreakPoints.team1), team2: Number(manual.tiebreak2 || scoreState.tieBreakPoints.team2) },
      isTieBreak: scoreState.isTieBreak
    });
    setShowCorrection(false);
  };

  const PointButton = ({ team, label }) => (
    <button
      onClick={() => handleIncrementPoint(team)}
      className="min-h-16 flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400 px-4 py-3 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-fuchsia-800/30 transition-all duration-150 ease-out active:scale-[0.97] active:shadow-md sm:min-h-[4.5rem]"
      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
    >
      + {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <PointButton team="team1" label="Team 1" />
        <PointButton team="team2" label="Team 2" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button onClick={() => handleDecrementPoint('team1')} className="min-h-12 rounded-xl border border-cyan-200/35 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition-all duration-150 active:scale-[0.98]" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>- Team 1 Point</button>
        <button onClick={() => handleDecrementPoint('team2')} className="min-h-12 rounded-xl border border-cyan-200/35 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition-all duration-150 active:scale-[0.98]" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>- Team 2 Point</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button onClick={handleUndoLastAction} className="min-h-10 rounded-xl border border-amber-200/40 bg-amber-500/15 px-2 py-2 text-[11px] leading-tight font-semibold text-amber-100 sm:px-3 sm:text-xs">Undo</button>
        <button onClick={() => setShowCorrection((v) => !v)} className="min-h-10 rounded-xl border border-fuchsia-200/40 bg-fuchsia-500/15 px-2 py-2 text-[11px] leading-tight font-semibold text-fuchsia-100 sm:px-3 sm:text-xs">Edit</button>
        <button onClick={handleResetMatch} className="min-h-10 rounded-xl border border-rose-200/45 bg-rose-500/15 px-2 py-2 text-[11px] leading-tight font-semibold text-rose-100 sm:px-3 sm:text-xs">Reset</button>
        <select value={scoreState?.format || 'third_set'} onChange={(e) => handleSetFormat(e.target.value)} className="min-h-10 rounded-xl border border-white/20 bg-slate-950/35 px-2 py-2 text-xs font-semibold text-white">
          <option value="third_set">Best of 3 Sets</option>
          <option value="super_tiebreak">Super TB 3rd</option>
        </select>
      </div>
      {showCorrection && (
        <div className="rounded-2xl border border-white/20 bg-slate-950/35 p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <input placeholder="Games T1" value={manual.games1} onChange={(e) => setManual((p) => ({ ...p, games1: e.target.value }))} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-white placeholder:text-slate-300" />
            <input placeholder="Games T2" value={manual.games2} onChange={(e) => setManual((p) => ({ ...p, games2: e.target.value }))} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-white placeholder:text-slate-300" />
            <input placeholder="Points T1" value={manual.points1} onChange={(e) => setManual((p) => ({ ...p, points1: e.target.value }))} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-white placeholder:text-slate-300" />
            <input placeholder="Points T2" value={manual.points2} onChange={(e) => setManual((p) => ({ ...p, points2: e.target.value }))} className="rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-white placeholder:text-slate-300" />
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={handleManualSave} className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-2 text-xs font-semibold text-white">Save</button>
            <button onClick={() => setShowCorrection(false)} className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">Cancel</button>
          </div>
        </div>
      )}
      {actionError && <p className="text-xs text-rose-200">{actionError}</p>}
    </div>
  );
}

export default ScoreControls;
