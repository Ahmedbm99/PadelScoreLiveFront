import React from 'react';
import { formatPoints } from '../services/scoreEngine.js';

function TeamCard({ team, name, highlightServing, scoreState }) {
  if (!scoreState) return null;

  const displayScore = formatPoints(scoreState, team);
  const setsWon = (scoreState.sets || []).reduce((acc, setScore) => {
    if (setScore.team1 > setScore.team2 && team === 'team1') return acc + 1;
    if (setScore.team2 > setScore.team1 && team === 'team2') return acc + 1;
    return acc;
  }, 0);

  const other = team === 'team1' ? 'team2' : 'team1';
  const currentGames = `${scoreState.games[team]}-${scoreState.games[other]}`;
  const fallbackName = team === 'team1' ? 'Team 1' : 'Team 2';
  const teamLabel =
    typeof name === 'string'
      ? name
      : name && typeof name === 'object'
      ? name.label || fallbackName
      : fallbackName;
  const player1 =
    name && typeof name === 'object' && name.player1 ? name.player1 : '';
  const player2 =
    name && typeof name === 'object' && name.player2 ? name.player2 : '';
  const category =
    name && typeof name === 'object' && name.category ? name.category : '';

  return (
    <article className={`relative overflow-hidden rounded-3xl border p-4 shadow-xl transition-all duration-300 sm:p-5 ${highlightServing ? 'border-emerald-200/70 bg-emerald-300/15 shadow-emerald-700/20' : 'border-white/10 bg-white/5 shadow-fuchsia-900/20'}`}>
      <div className="pointer-events-none absolute -top-20 right-0 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-0 h-28 w-28 rounded-full bg-fuchsia-300/20 blur-2xl" />

      <div className="relative flex items-center justify-between gap-3">
        <h2 className="max-w-[70%] truncate text-lg font-semibold uppercase tracking-wide text-white">{teamLabel}</h2>
        {highlightServing && <span className="rounded-full bg-emerald-200 px-2 py-1 text-[10px] font-bold uppercase text-slate-900">Serving</span>}
      </div>

      <div className="relative mt-3 flex items-end justify-between">
        <p className="text-5xl font-bold leading-none text-white tabular-nums transition-all duration-200 ease-out sm:text-6xl">{displayScore}</p>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-200/80">Sets won</p>
          <p className="text-2xl font-bold text-cyan-200 tabular-nums">{setsWon}</p>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-slate-200/80">Current set games</span>
        <span className="text-lg font-semibold text-white tabular-nums">{currentGames}</span>
      </div>

      {(player1 || player2 || category) && (
        <div className="relative mt-2 space-y-1 text-xs text-slate-200/85">
          {player1 && <p className="truncate">{player1}</p>}
          {player2 && <p className="truncate">{player2}</p>}
          {category && <p className="inline-block rounded-full border border-cyan-200/30 bg-cyan-400/15 px-2 py-0.5 text-[11px] text-cyan-100">{category}</p>}
        </div>
      )}
    </article>
  );
}

export default TeamCard;
