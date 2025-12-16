import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../services/apiClient';

function AdminPage() {
  const { user, token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [terrains, setTerrains] = useState([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [supUsername, setSupUsername] = useState('');
  const [supPassword, setSupPassword] = useState('');
  const [supTerrainId, setSupTerrainId] = useState('');

  const [pairPlayer1Id, setPairPlayer1Id] = useState('');
  const [pairPlayer2Id, setPairPlayer2Id] = useState('');
  const [pairCategoryId, setPairCategoryId] = useState('');

  const [assignments, setAssignments] = useState({});

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;

    const load = async () => {
      try {
        const [playersData, supervisorsData, terrainsData, categoriesData, pairsData] =
          await Promise.all([
            apiClient.get('/players', token),
            apiClient.get('/users/supervisors', token),
            apiClient.get('/terrains', token),
            apiClient.get('/categories', token),
            apiClient.get('/pairs', token)
          ]);
        setPlayers(playersData);
        setSupervisors(supervisorsData);
        setTerrains(terrainsData);
        setCategories(categoriesData);
        setPairs(pairsData);

        // Charger les paires actuellement assignées à chaque terrain
        const matchPromises = terrainsData.map((t) =>
          apiClient
            .get(`/match/${t.id}`, token)
            .catch(() => null)
        );
        const matches = await Promise.all(matchPromises);
        const initialAssignments = {};
        matches.forEach((m) => {
          if (m) {
            initialAssignments[m.terrain_id] = {
              team1_pair_id: m.team1_pair_id || '',
              team2_pair_id: m.team2_pair_id || ''
            };
          }
        });
        setAssignments(initialAssignments);
      } catch (e) {
        setError(e.message || 'Erreur chargement admin');
      }
    };
    load();
  }, [token, user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-slate-200">
        Accès réservé à l&apos;administrateur.
      </div>
    );
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const newPlayer = await apiClient.post(
        '/players',
        { first_name: firstName, last_name: lastName },
        token
      );
      setPlayers([newPlayer, ...players]);
      setFirstName('');
      setLastName('');
      setMessage('Joueur ajouté');
    } catch (e) {
      setError(e.message || 'Erreur ajout joueur');
    }
  };

  const handleAddSupervisor = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const newSup = await apiClient.post(
        '/users/supervisors',
        { username: supUsername, password: supPassword, terrain_id: Number(supTerrainId) },
        token
      );
      setSupervisors([newSup, ...supervisors]);
      setSupUsername('');
      setSupPassword('');
      setSupTerrainId('');
      setMessage('Superviseur ajouté');
    } catch (e) {
      setError(e.message || 'Erreur ajout superviseur');
    }
  };

  const handleAddPair = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiClient.post(
        '/pairs',
        {
          player1_id: Number(pairPlayer1Id),
          player2_id: Number(pairPlayer2Id),
          category_id: Number(pairCategoryId)
        },
        token
      );
      const pairsData = await apiClient.get('/pairs', token);
      setPairs(pairsData);
      setPairPlayer1Id('');
      setPairPlayer2Id('');
      setPairCategoryId('');
      setMessage('Équipe (paire) ajoutée');
    } catch (e) {
      setError(e.message || 'Erreur ajout paire');
    }
  };

  const handleAssignmentChange = (terrainId, key, value) => {
    setAssignments((prev) => ({
      ...prev,
      [terrainId]: {
        ...(prev[terrainId] || { team1_pair_id: '', team2_pair_id: '' }),
        [key]: value
      }
    }));
  };

  const handleSaveAssignment = async (terrainId) => {
    setError('');
    setMessage('');
    const current = assignments[terrainId] || {};
    if (!current.team1_pair_id || !current.team2_pair_id) {
      setError('Sélectionne une paire pour chaque équipe avant de sauvegarder.');
      return;
    }
    try {
      await apiClient.put(
        `/match/${terrainId}/players`,
        {
          team1_pair_id: Number(current.team1_pair_id),
          team2_pair_id: Number(current.team2_pair_id)
        },
        token
      );
      setMessage(`Paires assignées au terrain ${terrainId}`);
    } catch (e) {
      setError(e.message || 'Erreur lors de l’assignation des paires');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">Administration</h2>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {message && <p className="text-xs text-emerald-400">{message}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
          <h3 className="mb-3 text-xs font-semibold text-slate-100">Ajouter un joueur</h3>
          <form onSubmit={handleAddPlayer} className="space-y-2">
            <div>
              <label className="block text-[11px] text-slate-300">Prénom</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-300">Nom</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Ajouter
            </button>
          </form>

          <div className="mt-4 max-h-40 overflow-y-auto border-t border-slate-800 pt-2">
            <h4 className="mb-1 text-[11px] font-semibold text-slate-300">Joueurs récents</h4>
            <ul className="space-y-1">
              {players.map((p) => (
                <li key={p.id} className="text-[11px] text-slate-300">
                  #{p.id} {p.first_name} {p.last_name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
          <h3 className="mb-3 text-xs font-semibold text-slate-100">Ajouter un superviseur</h3>
          <form onSubmit={handleAddSupervisor} className="space-y-2">
            <div>
              <label className="block text-[11px] text-slate-300">Nom d&apos;utilisateur</label>
              <input
                value={supUsername}
                onChange={(e) => setSupUsername(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-300">Mot de passe</label>
              <input
                type="password"
                value={supPassword}
                onChange={(e) => setSupPassword(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-300">Terrain</label>
              <select
                value={supTerrainId}
                onChange={(e) => setSupTerrainId(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Sélectionner un terrain</option>
                {terrains.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="mt-2 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Ajouter
            </button>
          </form>

          <div className="mt-4 max-h-40 overflow-y-auto border-t border-slate-800 pt-2">
            <h4 className="mb-1 text-[11px] font-semibold text-slate-300">Superviseurs</h4>
            <ul className="space-y-1">
              {supervisors.map((s) => (
                <li key={s.id} className="text-[11px] text-slate-300">
                  #{s.id} {s.username} (terrain {s.terrain_id})
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
        <h3 className="mb-3 text-xs font-semibold text-slate-100">
          Créer une équipe (paire + catégorie)
        </h3>
        <form onSubmit={handleAddPair} className="grid gap-2 md:grid-cols-4">
          <div className="md:col-span-1">
            <label className="block text-[11px] text-slate-300">Joueur 1</label>
            <select
              value={pairPlayer1Id}
              onChange={(e) => setPairPlayer1Id(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Sélectionner</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-[11px] text-slate-300">Joueur 2</label>
            <select
              value={pairPlayer2Id}
              onChange={(e) => setPairPlayer2Id(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Sélectionner</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-[11px] text-slate-300">Catégorie</label>
            <select
              value={pairCategoryId}
              onChange={(e) => setPairCategoryId(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Sélectionner</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end md:col-span-1">
            <button
              type="submit"
              className="w-full rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Créer la paire
            </button>
          </div>
        </form>

        <div className="mt-4 max-h-40 overflow-y-auto border-t border-slate-800 pt-2">
          <h4 className="mb-1 text-[11px] font-semibold text-slate-300">Paires</h4>
          <ul className="space-y-1">
            {pairs.map((p) => (
              <li key={p.id} className="text-[11px] text-slate-300">
                #{p.id} {p.player1} &amp; {p.player2} ({p.category_label})
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Assignation des paires aux terrains */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
        <h3 className="mb-3 text-xs font-semibold text-slate-100">
          Assigner les équipes à chaque terrain
        </h3>
        <div className="space-y-3">
          {terrains.map((t) => {
            const a = assignments[t.id] || { team1_pair_id: '', team2_pair_id: '' };
            return (
              <div
                key={t.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="text-xs font-semibold text-slate-100">{t.name}</div>
                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-300 mb-0.5">Équipe 1</label>
                    <select
                      value={a.team1_pair_id}
                      onChange={(e) =>
                        handleAssignmentChange(t.id, 'team1_pair_id', e.target.value)
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">Sélectionner une paire</option>
                      {pairs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.player1} &amp; {p.player2} ({p.category_label})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-300 mb-0.5">Équipe 2</label>
                    <select
                      value={a.team2_pair_id}
                      onChange={(e) =>
                        handleAssignmentChange(t.id, 'team2_pair_id', e.target.value)
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">Sélectionner une paire</option>
                      {pairs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.player1} &amp; {p.player2} ({p.category_label})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:w-[120px]">
                    <button
                      type="button"
                      onClick={() => handleSaveAssignment(t.id)}
                      className="mt-1 w-full rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;


