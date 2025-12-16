import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMatch } from '../context/MatchContext.jsx';
import TeamCard from './TeamCard.jsx';
import ScoreControls from './ScoreControls.jsx';
import MatchInfo from './MatchInfo.jsx';

function Scoreboard() {
  const { user } = useAuth();
  const { scoreState, players, phase } = useMatch();

  if (!scoreState) return null;

  const isSupervisor = user?.role === 'supervisor';
  const isAdmin = user?.role === 'admin';
  const isSpectator = user?.role === 'spectator';

  return (
    <section className="mt-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/40 backdrop-blur">
        <div className="border-b border-slate-800 px-6 py-4">
          <MatchInfo scoreState={scoreState} phase={phase} />
        </div>

        <div className="grid gap-9 px-6 py-5 md:grid-cols-2">
          <TeamCard
            team="team1"
            name={players.team1}
            isEditable={false}
            highlightServing={scoreState.currentServer === 'team1'}
            scoreState={scoreState}
          />
          <TeamCard
            team="team2"
            name={players.team2}
            isEditable={false}
            highlightServing={scoreState.currentServer === 'team2'}
            scoreState={scoreState}
          />
        </div>

        {(isSupervisor || isAdmin) && (
          <div className="border-t border-slate-800 px-6 py-4">
            <ScoreControls />
          </div>
        )}

        {isSpectator && (
          <div className="border-t border-slate-800 bg-slate-900 px-6 py-3 text-xs text-slate-400">
            Mode spectateur : lecture seule.
          </div>
        )}
      </div>
    </section>
  );
}

export default Scoreboard;


