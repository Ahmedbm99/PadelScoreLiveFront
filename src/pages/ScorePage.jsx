import React from 'react';
import { MatchProvider } from '../context/MatchContext.jsx';
import Scoreboard from '../components/Scoreboard.jsx';
import CourtSelector from '../components/CourtSelector.jsx';

function ScorePage() {
  return (
    <MatchProvider>
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="space-y-3 sm:space-y-4">
          <CourtSelector />
          <Scoreboard />
        </div>
      </div>
    </MatchProvider>
  );
}

export default ScorePage;
