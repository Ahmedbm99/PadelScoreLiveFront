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
        setError(e.message || 'Unable to load courts');
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
    <section className="max-w-xl">
      <div className="rounded-2xl border border-slate-700 bg-slate-500/75 p-3 sm:p-4">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Court</label>
        <select
          value={terrainId || ''}
          onChange={handleChange}
          className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          disabled={user.role === 'supervisor' && user.terrain_id}
        >
          <option value="">Select court</option>
          {terrains.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </div>
    </section>
  );
}

export default CourtSelector;
