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
  const scoreRef = useRef(scoreState);
  const isSavingRef = useRef(false);

  useEffect(() => {
    scoreRef.current = scoreState;
  }, [scoreState]);

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
      isSavingRef.current = true;
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
    } finally {
      isSavingRef.current = false;
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

  useEffect(() => {
    if (!terrainId || !token) return;

    const poll = async () => {
      try {
        if (isSavingRef.current) return;

        const data = await apiClient.get(`/match/${terrainId}`, token);
        const incomingScoreStr = JSON.stringify(data.score_state);
        const currentScoreStr = JSON.stringify(scoreRef.current);

        if (incomingScoreStr !== currentScoreStr) {
          setScoreState(data.score_state);
        }

        setPlayers((prev) => {
          const prevStr = JSON.stringify(prev);
          const nextStr = JSON.stringify(data.players);
          return prevStr === nextStr ? prev : data.players;
        });

        setPhase((prev) => (prev === (data.phase || '') ? prev : data.phase || ''));
      } catch (e) {
        // silent polling failure
      }
    };

    poll();
    pollRef.current = setInterval(poll, 300);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [terrainId, token]);

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
