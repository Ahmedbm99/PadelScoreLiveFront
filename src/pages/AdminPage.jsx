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
        const [playersData, supervisorsData, terrainsData, categoriesData, pairsData] = await Promise.all([
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

        const matches = await Promise.all(terrainsData.map((t) => apiClient.get(`/match/${t.id}`, token).catch(() => null)));
        const initialAssignments = {};
        matches.forEach((m) => {
          if (m) initialAssignments[m.terrain_id] = { team1_pair_id: m.team1_pair_id || '', team2_pair_id: m.team2_pair_id || '' };
        });
        setAssignments(initialAssignments);
      } catch (e) {
        setError(e.message || 'Erreur chargement admin');
      }
    };
    load();
  }, [token, user]);

  if (!user || user.role !== 'admin') {
    return <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-slate-100">Acces reserve a l'administrateur.</div>;
  }

  const card = 'rounded-3xl border border-white/15 bg-slate-950/40 p-4 shadow-xl shadow-fuchsia-900/15 backdrop-blur-xl sm:p-5';
  const input = 'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-300';
  const button = 'rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/25';

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const newPlayer = await apiClient.post('/players', { first_name: firstName, last_name: lastName }, token);
      setPlayers([newPlayer, ...players]);
      setFirstName('');
      setLastName('');
      setMessage('Joueur ajoute');
    } catch (e) {
      setError(e.message || 'Erreur ajout joueur');
    }
  };

  const handleAddSupervisor = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const newSup = await apiClient.post('/users/supervisors', { username: supUsername, password: supPassword, terrain_id: Number(supTerrainId) }, token);
      setSupervisors([newSup, ...supervisors]);
      setSupUsername('');
      setSupPassword('');
      setSupTerrainId('');
      setMessage('Superviseur ajoute');
    } catch (e) {
      setError(e.message || 'Erreur ajout superviseur');
    }
  };

  const handleAddPair = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiClient.post('/pairs', { player1_id: Number(pairPlayer1Id), player2_id: Number(pairPlayer2Id), category_id: Number(pairCategoryId) }, token);
      setPairs(await apiClient.get('/pairs', token));
      setPairPlayer1Id('');
      setPairPlayer2Id('');
      setPairCategoryId('');
      setMessage('Equipe ajoutee');
    } catch (e) {
      setError(e.message || 'Erreur ajout paire');
    }
  };

  const handleAssignmentChange = (terrainId, key, value) => {
    setAssignments((prev) => ({ ...prev, [terrainId]: { ...(prev[terrainId] || { team1_pair_id: '', team2_pair_id: '' }), [key]: value } }));
  };

  const handleSaveAssignment = async (terrainId) => {
    setError('');
    setMessage('');
    const current = assignments[terrainId] || {};
    if (!current.team1_pair_id || !current.team2_pair_id) return setError('Selectionne une paire pour chaque equipe.');
    try {
      await apiClient.put(`/match/${terrainId}/players`, { team1_pair_id: Number(current.team1_pair_id), team2_pair_id: Number(current.team2_pair_id) }, token);
      setMessage(`Paires assignees au terrain ${terrainId}`);
    } catch (e) {
      setError(e.message || 'Erreur assignation');
    }
  };

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-5">
      <h2 className="text-2xl font-extrabold tracking-tight text-white">Administration</h2>
      {error && <p className="text-sm text-rose-200">{error}</p>}
      {message && <p className="text-sm text-emerald-200">{message}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h3 className="mb-3 text-lg font-bold text-white">Ajouter un joueur</h3>
          <form onSubmit={handleAddPlayer} className="space-y-2">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prenom" className={input} />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className={input} />
            <button type="submit" className={button}>Ajouter</button>
          </form>
        </section>

        <section className={card}>
          <h3 className="mb-3 text-lg font-bold text-white">Ajouter un superviseur</h3>
          <form onSubmit={handleAddSupervisor} className="space-y-2">
            <input value={supUsername} onChange={(e) => setSupUsername(e.target.value)} placeholder="Username" className={input} />
            <input type="password" value={supPassword} onChange={(e) => setSupPassword(e.target.value)} placeholder="Mot de passe" className={input} />
            <select value={supTerrainId} onChange={(e) => setSupTerrainId(e.target.value)} className={input}>
              <option value="">Terrain</option>
              {terrains.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button type="submit" className={button}>Ajouter</button>
          </form>
        </section>
      </div>

      <section className={card}>
        <h3 className="mb-3 text-lg font-bold text-white">Creer une equipe</h3>
        <form onSubmit={handleAddPair} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select value={pairPlayer1Id} onChange={(e) => setPairPlayer1Id(e.target.value)} className={input}><option value="">Joueur 1</option>{players.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}</select>
          <select value={pairPlayer2Id} onChange={(e) => setPairPlayer2Id(e.target.value)} className={input}><option value="">Joueur 2</option>{players.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}</select>
          <select value={pairCategoryId} onChange={(e) => setPairCategoryId(e.target.value)} className={input}><option value="">Categorie</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
          <button type="submit" className={button}>Creer</button>
        </form>
      </section>

      <section className={card}>
        <h3 className="mb-3 text-lg font-bold text-white">Assigner les equipes aux terrains</h3>
        <div className="space-y-3">
          {terrains.map((t) => {
            const a = assignments[t.id] || { team1_pair_id: '', team2_pair_id: '' };
            return (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 font-semibold text-white">{t.name}</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <select value={a.team1_pair_id} onChange={(e) => handleAssignmentChange(t.id, 'team1_pair_id', e.target.value)} className={input}><option value="">Equipe 1</option>{pairs.map((p) => <option key={p.id} value={p.id}>{p.player1} & {p.player2} ({p.category_label})</option>)}</select>
                  <select value={a.team2_pair_id} onChange={(e) => handleAssignmentChange(t.id, 'team2_pair_id', e.target.value)} className={input}><option value="">Equipe 2</option>{pairs.map((p) => <option key={p.id} value={p.id}>{p.player1} & {p.player2} ({p.category_label})</option>)}</select>
                  <button type="button" onClick={() => handleSaveAssignment(t.id)} className={button}>Sauvegarder</button>
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
