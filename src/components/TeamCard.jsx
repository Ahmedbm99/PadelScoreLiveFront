import React, { useState, useEffect } from 'react';
import { useMatch } from '../context/MatchContext.jsx';
import { formatPoints } from '../services/scoreEngine.js';

function TeamCard({ team, name, isEditable, highlightServing, scoreState: externalScoreState }) {
  const matchCtx = useMatch();
  const players = matchCtx?.players;
  const setPlayers = matchCtx?.setPlayers;
  const savePlayers = matchCtx?.savePlayers;
  const scoreState = externalScoreState || matchCtx?.scoreState;
  const [localName, setLocalName] = useState(name);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  const handleBlur = async () => {
    if (!isEditable || !players || !setPlayers || !savePlayers) return;
    const updated = { ...players, [team]: localName };
    setPlayers(updated);
    await savePlayers(updated);
  };

  if (!scoreState) return null;

  const displayScore = formatPoints(scoreState, team);
  const finishedSets = Array.isArray(scoreState.sets) ? scoreState.sets : [];
  const currentSet = scoreState.games || { team1: 0, team2: 0 };
  const displaySets = [...finishedSets, currentSet];
const setsScore = finishedSets.reduce(
  (acc, set) => {
    if (set.team1 > set.team2) acc.team1 += 1;
    if (set.team2 > set.team1) acc.team2 += 1;
    return acc;
  },
  { team1: 0, team2: 0 }
);

  const label =
    typeof name === 'string' ? name : name?.label || `Équipe ${team === 'team1' ? '1' : '2'}`;
  const player1 =
    name && typeof name === 'object' && name.player1 ? name.player1 : null;
  const player2 =
    name && typeof name === 'object' && name.player2 ? name.player2 : null;
  const category =
    name && typeof name === 'object' && name.category ? name.category : null;

  return (
    <div
      className={`relative rounded-3xl border mr px-4 py-2 shadow-sm transition ${
        highlightServing
          ? 'border-accent/70 bg-slate-800/80 shadow-accent/25'
          : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      {highlightServing && (
        <div className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 mt-16  text-[15px] font-semibold uppercase text-slate-900">
          Service
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        {isEditable ? (
          <input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleBlur}
            placeholder={`Équipe ${team === 'team1' ? '1' : '2'}`}
            className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        ) : (
          <h2 className="text-[25px] font-medium text-slate-100">
              {label.replace(/\s*\([^)]*\)/g, '')}
          </h2>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-bold text-slate-50 tabular-nums">
            {displayScore}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-5x text-slate-400">
        {(player1 || player2) && (
          <div className="flex flex-col leading-tight">
         
            {category && <span className="text-[17px] mb-3 text-slate-400">P-{category}</span>}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wide">Sets</span>
          <div className="flex items-center gap-3">
  {/* Sets */}
  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-l font-semibold text-slate-100 tabular-nums">
    {displaySets.length
      ? displaySets.map((s, idx) => (
          <span key={idx}>
            {idx > 0 && ' | '} {s.team1} - {s.team2}
          </span>
        ))
      : '--'}
  </span>

  {/* Score */}
{/* Score sets pour cette équipe */}
<div className="flex items-center gap-4 ml-60">
  <div className="flex flex-col items-center rounded-md bg-accent/80 px-4 py-2">
    <span className="text-3xl font-normal text-slate-900 tabular-nums">
      {team === 'team1' ? setsScore.team1 : setsScore.team2}
      
    </span>
  </div>
  
</div>

</div>


            
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamCard;


