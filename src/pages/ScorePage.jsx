import React from 'react';
import { MatchProvider } from '../context/MatchContext.jsx';
import Scoreboard from '../components/Scoreboard.jsx';
import CourtSelector from '../components/CourtSelector.jsx';

function ScorePage() {
  return (
    <MatchProvider>
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <CourtSelector />
        <Scoreboard />
      </div>
    </MatchProvider>
  );
}

export default ScorePage;


