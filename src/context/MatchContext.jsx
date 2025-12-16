import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import { apiClient } from '../services/apiClient.js';
import {
  createInitialState,
  incrementPoint,
  decrementPoint,
  resetMatch,
  setFormat
} from '../services/scoreEngine.js';

const MatchContext = createContext(null);

export function MatchProvider({ children }) {
  const { token, user } = useAuth();
  const [terrainId, setTerrainId] = useState(user?.terrain_id || null);
  const [scoreState, setScoreState] = useState(createInitialState());
  const [players, setPlayers] = useState({ team1: '', team2: '' });
  const [phase, setPhase] = useState('');
  const pollRef = useRef(null);

  const loadMatch = async (tid) => {
    const data = await apiClient.get(`/match/${tid}`, token);
    setTerrainId(tid);
    setScoreState(data.score_state);
    setPlayers(data.players);
    setPhase(data.phase || '');
  };

  const saveScore = async (newScore) => {
    if (!terrainId) return;
    await apiClient.put(`/match/${terrainId}/score`, { score_state: newScore }, token);
  };

  const savePlayers = async (newPlayers) => {
    if (!terrainId) return;
    await apiClient.put(`/match/${terrainId}/players`, { players: newPlayers }, token);
  };

  const handleIncrementPoint = async (team) => {
    const updated = incrementPoint(scoreState, team);
    setScoreState(updated);
    await saveScore(updated);
  };

  const handleDecrementPoint = async (team) => {
    const updated = decrementPoint(scoreState, team);
    setScoreState(updated);
    await saveScore(updated);
  };

  const handleResetMatch = async () => {
    const updated = resetMatch();
    setScoreState(updated);
    await saveScore(updated);
    if (terrainId) {
      await loadMatch(terrainId);
    }
  };

  const handleSetFormat = async (format) => {
    const updated = setFormat(scoreState, format);
    setScoreState(updated);
    await saveScore(updated);
  };

  // Polling pour garder la page score sync avec la DB (et donc avec la vue spectateur)
  // Note: le polling ne doit pas écraser les modifications locales en cours
  useEffect(() => {
    if (!terrainId || !token) return;

    const poll = async () => {
      try {
        const data = await apiClient.get(`/match/${terrainId}`, token);
        // Mise à jour uniquement si le score a vraiment changé (évite les rerenders inutiles)
        const incomingScoreStr = JSON.stringify(data.score_state);
        const currentScoreStr = JSON.stringify(scoreState);
        if (incomingScoreStr !== currentScoreStr) {
          setScoreState(data.score_state);
        }
        setPlayers(data.players);
        setPhase(data.phase || '');
      } catch (e) {
        // silencieux pour ne pas gêner l'UI
      }
    };

    poll();
    pollRef.current = setInterval(poll, 1000); // 1s pour le superviseur (suffisant)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [terrainId, token, scoreState]);

  return (
    <MatchContext.Provider
      value={{
        terrainId,
        setTerrainId,
        scoreState,
        players,
        setPlayers,
        phase,
        loadMatch,
        savePlayers,
        handleIncrementPoint,
        handleDecrementPoint,
        handleResetMatch,
        handleSetFormat
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export const useMatch = () => useContext(MatchContext);


