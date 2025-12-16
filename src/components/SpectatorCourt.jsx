import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import MatchInfo from './MatchInfo.jsx';
import TeamCard from './TeamCard.jsx';

function SpectatorCourt({ terrain }) {
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.get(`/match/${terrain.id}`);
        setMatch(data);
        setError('');
      } catch (e) {
        setError(e.message || 'Erreur match');
      }
    };

    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [terrain.id]);

  if (!match) {
    return (
      <div className="rounded-6xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-400">
        Chargement du terrain {terrain.name}...
      </div>
    );
  }

  const { score_state, players } = match;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold">{terrain.name}</span>
        <MatchInfo scoreState={score_state} phase={match.phase} />
      </div>
      {error && <p className="mb-2 text-[11px] text-red-400">{error}</p>}
      <div className="grid gap-3">
        <TeamCard
          team="team1"
          name={players.team1}
          isEditable={false}
          highlightServing={score_state.currentServer === 'team1'}
          scoreState={score_state}
        />
        <TeamCard
          team="team2"
          name={players.team2}
          isEditable={false}
          highlightServing={score_state.currentServer === 'team2'}
          scoreState={score_state}
        />
      </div>
    </div>
  );
}

export default SpectatorCourt;


