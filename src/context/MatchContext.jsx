import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import { apiClient } from '../services/apiClient.js';
import {
  createInitialState,
  incrementPoint,
  decrementPoint,
  resetMatch,
  setFormat,
  applyScoreCorrection
} from '../services/scoreEngine.js';

const MatchContext = createContext(null);

export function MatchProvider({ children }) {
  const { token, user } = useAuth();
  const [terrainId, setTerrainId] = useState(user?.terrain_id || null);
  const [scoreState, setScoreState] = useState(createInitialState());
  const [players, setPlayers] = useState({ team1: '', team2: '' });
  const [phase, setPhase] = useState('');
  const [actionError, setActionError] = useState('');
  const pollRef = useRef(null);
  const historyRef = useRef([]);

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

  const pushHistory = (stateSnapshot) => {
    historyRef.current = [...historyRef.current.slice(-39), stateSnapshot];
  };

  const commitScoreUpdate = async (builder) => {
    try {
      setActionError('');
      let nextState;
      setScoreState((prev) => {
        pushHistory(prev);
        nextState = builder(prev);
        return nextState;
      });
      if (nextState) {
        await saveScore(nextState);
      }
    } catch (e) {
      setActionError(e?.message || 'Unable to update score');
    }
  };

  const savePlayers = async (newPlayers) => {
    if (!terrainId) return;
    await apiClient.put(`/match/${terrainId}/players`, { players: newPlayers }, token);
  };

  const handleIncrementPoint = async (team) => {
    await commitScoreUpdate((prev) => incrementPoint(prev, team));
  };

  const handleDecrementPoint = async (team) => {
    await commitScoreUpdate((prev) => decrementPoint(prev, team));
  };

  const handleResetMatch = async () => {
    await commitScoreUpdate(() => resetMatch());
    if (terrainId) {
      await loadMatch(terrainId);
    }
  };

  const handleSetFormat = async (format) => {
    await commitScoreUpdate((prev) => setFormat(prev, format));
  };

  const handleUndoLastAction = async () => {
    const previous = historyRef.current[historyRef.current.length - 1];
    if (!previous) {
      setActionError('No previous action to undo.');
      return;
    }
    historyRef.current = historyRef.current.slice(0, -1);
    setActionError('');
    setScoreState(previous);
    await saveScore(previous);
  };

  const handleApplyCorrection = async (correction) => {
    await commitScoreUpdate((prev) => applyScoreCorrection(prev, correction));
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
    pollRef.current = setInterval(poll, 1000);
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
        actionError,
        loadMatch,
        savePlayers,
        handleIncrementPoint,
        handleDecrementPoint,
        handleResetMatch,
        handleSetFormat,
        handleUndoLastAction,
        handleApplyCorrection
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export const useMatch = () => useContext(MatchContext);


