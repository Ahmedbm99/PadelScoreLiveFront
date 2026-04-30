import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';
import SpectatorCourt from '../components/SpectatorCourt.jsx';

function SpectatorPage() {
  const [terrains, setTerrains] = useState([]);
  const [error, setError] = useState('');
  const [selectedTerrainId, setSelectedTerrainId] = useState(null);

  useEffect(() => {
    apiClient
      .get('/terrains')
      .then((data) => {
        setTerrains(data);
        if (data.length > 0) {
          setSelectedTerrainId((prev) => prev ?? data[0].id);
        }
      })
      .catch((e) => setError(e.message || 'Erreur chargement terrains'));
  }, []);

  const selectedTerrain = useMemo(
    () => terrains.find((t) => t.id === selectedTerrainId) || null,
    [terrains, selectedTerrainId]
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-3 space-y-4 sm:px-4 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Vue spectateur TV</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {terrains.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTerrainId(t.id)}
              className={`rounded-full px-3 py-1.5 border transition ${
                selectedTerrainId === t.id
                  ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white border-transparent'
                  : 'bg-white/5 text-slate-200 border-white/20 hover:bg-white/10'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {selectedTerrain ? (
        <div className="w-full">
          <SpectatorCourt terrain={selectedTerrain} />
        </div>
      ) : (
        !error && <p className="text-sm text-slate-300">Aucun terrain disponible.</p>
      )}
    </div>
  );
}

export default SpectatorPage;
