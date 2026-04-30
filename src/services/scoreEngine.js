const TEAMS = ['team1', 'team2'];
const POINT_TABLE = [0, 15, 30, 40];

function otherTeam(team) {
  return team === 'team1' ? 'team2' : 'team1';
}

function clampInt(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : min;
  return Math.min(max, Math.max(min, n));
}

export function createInitialState() {
  return {
    format: 'third_set',
    currentServer: 'team1',
    points: { team1: 0, team2: 0 },
    games: { team1: 0, team2: 0 },
    sets: [],
    isTieBreak: false,
    tieBreakPoints: { team1: 0, team2: 0 },
    tieBreakStartServer: null,
    matchFinished: false
  };
}

function normalizeSet(setScore) {
  const safe = setScore || {};
  return {
    team1: clampInt(safe.team1),
    team2: clampInt(safe.team2)
  };
}

function normalize(state) {
  const safe = state || createInitialState();
  const normalized = {
    format: safe.format === 'super_tiebreak' ? 'super_tiebreak' : 'third_set',
    currentServer: safe.currentServer === 'team2' ? 'team2' : 'team1',
    points: {
      team1: clampInt(safe.points?.team1, 0, 4),
      team2: clampInt(safe.points?.team2, 0, 4)
    },
    games: {
      team1: clampInt(safe.games?.team1),
      team2: clampInt(safe.games?.team2)
    },
    sets: Array.isArray(safe.sets) ? safe.sets.map(normalizeSet) : [],
    isTieBreak: Boolean(safe.isTieBreak),
    tieBreakPoints: {
      team1: clampInt(safe.tieBreakPoints?.team1),
      team2: clampInt(safe.tieBreakPoints?.team2)
    },
    tieBreakStartServer: safe.tieBreakStartServer === 'team2' ? 'team2' : safe.tieBreakStartServer === 'team1' ? 'team1' : null,
    matchFinished: Boolean(safe.matchFinished)
  };

  if (!normalized.isTieBreak) {
    normalized.tieBreakPoints = { team1: 0, team2: 0 };
    normalized.tieBreakStartServer = null;
  }

  return normalized;
}

function clone(state) {
  return JSON.parse(JSON.stringify(normalize(state)));
}

function countSetsWon(sets) {
  return sets.reduce(
    (acc, setScore) => {
      if (setScore.team1 > setScore.team2) acc.team1 += 1;
      if (setScore.team2 > setScore.team1) acc.team2 += 1;
      return acc;
    },
    { team1: 0, team2: 0 }
  );
}

function startTieBreak(state) {
  const next = clone(state);
  next.isTieBreak = true;
  next.tieBreakPoints = { team1: 0, team2: 0 };
  next.tieBreakStartServer = next.currentServer;
  return next;
}

function completeMatch(state) {
  const next = clone(state);
  next.matchFinished = true;
  return next;
}

function closeSet(state, winner, loserScore, viaTieBreak = false) {
  const next = clone(state);
  const loser = otherTeam(winner);

  if (viaTieBreak) {
    next.games[winner] = 7;
    next.games[loser] = 6;
  } else {
    next.games[winner] = Math.max(next.games[winner], 6);
    next.games[loser] = loserScore;
  }

  next.sets.push({ team1: next.games.team1, team2: next.games.team2 });
  next.games = { team1: 0, team2: 0 };
  next.points = { team1: 0, team2: 0 };
  next.isTieBreak = false;
  next.tieBreakPoints = { team1: 0, team2: 0 };
  next.tieBreakStartServer = null;

  const won = countSetsWon(next.sets);
  if (next.format === 'third_set') {
    if (won.team1 >= 2 || won.team2 >= 2) {
      return completeMatch(next);
    }
    return next;
  }

  if (won.team1 >= 2 || won.team2 >= 2) {
    return completeMatch(next);
  }

  if (won.team1 === 1 && won.team2 === 1) {
    return startTieBreak(next);
  }

  return next;
}

function rotateServerAfterGame(state) {
  const next = clone(state);
  next.currentServer = otherTeam(next.currentServer);
  return next;
}

function resolveGameWin(state, team) {
  const next = clone(state);
  next.games[team] += 1;
  next.points = { team1: 0, team2: 0 };

  const opponent = otherTeam(team);
  const selfGames = next.games[team];
  const opponentGames = next.games[opponent];

  if (selfGames === 6 && opponentGames === 6) {
    const rotated = rotateServerAfterGame(next);
    return startTieBreak(rotated);
  }

  if (selfGames >= 6 && selfGames - opponentGames >= 2) {
    const closedSet = closeSet(next, team, opponentGames, false);
    if (!closedSet.matchFinished && !closedSet.isTieBreak) {
      closedSet.currentServer = otherTeam(next.currentServer);
    }
    return closedSet;
  }

  return rotateServerAfterGame(next);
}

function getTieBreakServer(startServer, totalPointsPlayed) {
  if (!startServer) return 'team1';
  if (totalPointsPlayed === 0) return startServer;

  const cycle = Math.floor((totalPointsPlayed - 1) / 2);
  return cycle % 2 === 0 ? otherTeam(startServer) : startServer;
}

function resolveTieBreakPoint(state, team) {
  const next = clone(state);
  const opponent = otherTeam(team);

  next.tieBreakPoints[team] += 1;

  const target = next.format === 'super_tiebreak' && next.sets.length === 2 ? 10 : 7;
  const self = next.tieBreakPoints[team];
  const opp = next.tieBreakPoints[opponent];

  const totalPlayed = next.tieBreakPoints.team1 + next.tieBreakPoints.team2;
  next.currentServer = getTieBreakServer(next.tieBreakStartServer, totalPlayed);

  if (self >= target && self - opp >= 2) {
    const closedSet = closeSet(next, team, next.games[opponent], true);
    if (!closedSet.matchFinished) {
      closedSet.currentServer = otherTeam(next.tieBreakStartServer || next.currentServer);
    }
    return closedSet;
  }

  return next;
}

export function formatPoints(state, team) {
  const s = normalize(state);

  if (s.isTieBreak) {
    return s.tieBreakPoints[team];
  }

  const self = s.points[team];
  const opp = s.points[otherTeam(team)];

  if (self <= 3 && opp <= 3 && !(self === 3 && opp === 3)) {
    return POINT_TABLE[self];
  }

  if (self === opp) return '40';
  if (self > opp) return 'AD';
  return '40';
}

export function getPointStatusLabel(state) {
  const s = normalize(state);
  if (s.isTieBreak) return 'Tie-break';

  const a = s.points.team1;
  const b = s.points.team2;
  if (a >= 3 && b >= 3) {
    if (a === b) return 'Deuce';
    return a > b ? 'Advantage Team 1' : 'Advantage Team 2';
  }
  return 'In game';
}

export function incrementPoint(state, team) {
  const s = normalize(state);
  if (s.matchFinished || !TEAMS.includes(team)) return s;

  if (s.isTieBreak) {
    return resolveTieBreakPoint(s, team);
  }

  const next = clone(s);
  const opp = otherTeam(team);
  const pSelf = next.points[team];
  const pOpp = next.points[opp];

  if (pSelf <= 2) {
    next.points[team] += 1;
    return next;
  }

  if (pSelf === 3) {
    if (pOpp <= 2) return resolveGameWin(next, team);
    if (pOpp === 3) {
      next.points[team] = 4;
      return next;
    }
    if (pOpp === 4) {
      next.points[opp] = 3;
      return next;
    }
  }

  if (pSelf === 4) {
    return resolveGameWin(next, team);
  }

  return next;
}

export function decrementPoint(state, team) {
  const s = normalize(state);
  if (s.matchFinished || !TEAMS.includes(team)) return s;

  const next = clone(s);
  if (next.isTieBreak) {
    next.tieBreakPoints[team] = Math.max(0, next.tieBreakPoints[team] - 1);
    const totalPlayed = next.tieBreakPoints.team1 + next.tieBreakPoints.team2;
    next.currentServer = getTieBreakServer(next.tieBreakStartServer || next.currentServer, totalPlayed);
    return next;
  }

  next.points[team] = Math.max(0, next.points[team] - 1);
  return next;
}

export function applyScoreCorrection(state, correction) {
  const base = clone(state);
  const incoming = correction || {};
  const updated = clone(base);

  if (incoming.currentServer && TEAMS.includes(incoming.currentServer)) {
    updated.currentServer = incoming.currentServer;
  }

  if (incoming.points) {
    updated.points.team1 = clampInt(incoming.points.team1, 0, 4);
    updated.points.team2 = clampInt(incoming.points.team2, 0, 4);
  }

  if (incoming.games) {
    updated.games.team1 = clampInt(incoming.games.team1, 0, 7);
    updated.games.team2 = clampInt(incoming.games.team2, 0, 7);
  }

  if (incoming.tieBreakPoints) {
    updated.tieBreakPoints.team1 = clampInt(incoming.tieBreakPoints.team1);
    updated.tieBreakPoints.team2 = clampInt(incoming.tieBreakPoints.team2);
  }

  if (typeof incoming.isTieBreak === 'boolean') {
    updated.isTieBreak = incoming.isTieBreak;
    if (!incoming.isTieBreak) {
      updated.tieBreakPoints = { team1: 0, team2: 0 };
      updated.tieBreakStartServer = null;
    } else if (!updated.tieBreakStartServer) {
      updated.tieBreakStartServer = updated.currentServer;
    }
  }

  if (typeof incoming.matchFinished === 'boolean') {
    updated.matchFinished = incoming.matchFinished;
  }

  return normalize(updated);
}

export function resetMatch() {
  return createInitialState();
}

export function setFormat(state, format) {
  const next = clone(state);
  next.format = format === 'super_tiebreak' ? 'super_tiebreak' : 'third_set';
  return next;
}
