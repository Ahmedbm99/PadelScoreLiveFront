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

  const canEdit = user?.role === 'supervisor' || user?.role === 'admin';

  return (
    <section className="mt-2">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-2 shadow-2xl shadow-fuchsia-700/20 backdrop-blur-xl sm:p-4">
        <div className="rounded-2xl border border-cyan-200/20 bg-cyan-400/10 p-3 sm:p-4">
          <MatchInfo scoreState={scoreState} phase={phase} />
        </div>

        <div className="mt-3 grid gap-3 sm:gap-4 md:grid-cols-2">
          <TeamCard team="team1" name={players.team1} highlightServing={scoreState.currentServer === 'team1'} scoreState={scoreState} />
          <TeamCard team="team2" name={players.team2} highlightServing={scoreState.currentServer === 'team2'} scoreState={scoreState} />
        </div>

        {canEdit ? (
          <div className="mt-3 rounded-2xl border border-fuchsia-200/20 bg-fuchsia-500/10 p-3 sm:p-4">
            <ScoreControls />
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200">
            Spectator mode: read-only.
          </div>
        )}
      </div>
    </section>
  );
}

export default Scoreboard;
