import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMatch } from '../context/MatchContext.jsx';
import { apiClient } from '../services/apiClient.js';

function CourtSelector() {
  const { user, token } = useAuth();
  const { terrainId, setTerrainId, loadMatch } = useMatch();
  const [terrains, setTerrains] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchTerrains = async () => {
      try {
        const data = await apiClient.get('/terrains', token);
        setTerrains(data);
        if (!terrainId && user?.terrain_id) {
          setTerrainId(user.terrain_id);
          loadMatch(user.terrain_id);
        }
      } catch (e) {
        setError(e.message || 'Erreur chargement terrains');
      }
    };
    fetchTerrains();
  }, [token, user, terrainId, setTerrainId, loadMatch]);

  if (!user) return null;

  const handleChange = async (e) => {
    const tid = Number(e.target.value) || null;
    if (!tid) return;
    setTerrainId(tid);
    await loadMatch(tid);
  };

  return (
    <section className="max-w-md">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">Terrain</span>
          <select
            value={terrainId || ''}
            onChange={handleChange}
            className="min-w-[140px] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            disabled={user.role === 'supervisor' && user.terrain_id}
          >
            <option value="">Sélectionner</option>
            {terrains.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
      </div>
    </section>
  );
}

export default CourtSelector;


