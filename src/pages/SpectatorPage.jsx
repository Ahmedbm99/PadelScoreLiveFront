import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import SpectatorCourt from '../components/SpectatorCourt.jsx';

function SpectatorPage() {
  const [terrains, setTerrains] = useState([]);
  const [error, setError] = useState('');
  const [groupIndex, setGroupIndex] = useState(0); 

  useEffect(() => {
    apiClient
      .get('/terrains')
      .then(setTerrains)
      .catch((e) => setError(e.message || 'Erreur chargement terrains'));
  }, []);

  const groups = [
    { label: 'Terrains 1 & 2', start: 0 },
    { label: 'Terrains 3 & 4', start: 2 }
  ];

  const currentGroup = groups[groupIndex];
  const visibleTerrains = terrains.slice(currentGroup.start, currentGroup.start + 2);

  return (
    <div className="mx-auto max-w-7xl px-6 py-2 space-y-4 md:px-8 lg:px-10">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-100">Vue spectateur TV</h2>
        <div className="flex gap-2 text-xs">
          {groups.map((g, idx) => (
            <button
              key={g.label}
              type="button"
              onClick={() => setGroupIndex(idx)}
              className={`rounded-md px-3 py-1 ${
                groupIndex === idx
                  ? 'bg-slate-800 text-slate-50'
                  : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleTerrains.map((t) => (
          <SpectatorCourt key={t.id} terrain={t} />
        ))}
      </div>
    </div>
  );
}

export default SpectatorPage;


