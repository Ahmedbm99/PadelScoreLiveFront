export function createInitialState() {
  return {
    format: 'third_set', 
    currentServer: 'team1',
    points: { team1: 0, team2: 0 }, 
    games: { team1: 0, team2: 0 },
    sets: [], 
    isTieBreak: false,
    tieBreakPoints: { team1: 0, team2: 0 },
    matchFinished: false
  };
}
function countSetsWon(sets) {
  return sets.reduce(
    (acc, s) => {
      if (s.team1 > s.team2) acc.team1++;
      if (s.team2 > s.team1) acc.team2++;
      return acc;
    },
    { team1: 0, team2: 0 }
  );
}

function normalize(state) {
  const s = { ...state };
  s.points = s.points || { team1: 0, team2: 0 };
  s.points.team1 = s.points.team1 ?? 0;
  s.points.team2 = s.points.team2 ?? 0;
  s.games = s.games || { team1: 0, team2: 0 };
  s.games.team1 = s.games.team1 ?? 0;
  s.games.team2 = s.games.team2 ?? 0;
  s.sets = Array.isArray(s.sets) ? s.sets : [];
  s.tieBreakPoints = s.tieBreakPoints || { team1: 0, team2: 0 };
  s.tieBreakPoints.team1 = s.tieBreakPoints.team1 ?? 0;
  s.tieBreakPoints.team2 = s.tieBreakPoints.team2 ?? 0;
  s.isTieBreak = !!s.isTieBreak;
  s.matchFinished = !!s.matchFinished;
  s.currentServer = s.currentServer === 'team2' ? 'team2' : 'team1';
  return s;
}

function clone(state) {
  return JSON.parse(JSON.stringify(normalize(state)));
}

function otherTeam(team) {
  return team === 'team1' ? 'team2' : 'team1';
}

export function formatPoints(state, team) {
  const s = normalize(state);

  if (s.isTieBreak) {
    return s.tieBreakPoints[team];
  }
  const pSelf = s.points[team];
  const pOpp = s.points[otherTeam(team)];
  const table = [0, 15, 30, 40];

  if (pSelf <= 3 && pOpp <= 3 && !(pSelf === 3 && pOpp === 3)) {
    return table[pSelf];
  }
  if (pSelf === pOpp + 1) return '40';
  return 40;
}

function gameWon(state, team) {
  const base = clone(state);

  base.games[team] += 1;
  base.points = { team1: 0, team2: 0 };

  const gSelf = base.games[team];
  const gOpp = base.games[otherTeam(team)];

  if (gSelf === 6 && gOpp === 6) {
    base.isTieBreak = true;
    base.tieBreakPoints = { team1: 0, team2: 0 };
    base.currentServer = otherTeam(base.currentServer);
    return base;
  }

  // 🎾 Set gagné
  if (gSelf >= 6 && gSelf - gOpp >= 2) {
    base.sets.push({
      team1: base.games.team1,
      team2: base.games.team2
    });

    // 🔥 RESET jeux après un set
    base.games = { team1: 0, team2: 0 };
    base.isTieBreak = false;
    base.tieBreakPoints = { team1: 0, team2: 0 };

    const setsWon = countSetsWon(base.sets);

    // 🎾 FORMAT SUPER TIE-BREAK
    if (base.format === 'super_tiebreak') {
      if (setsWon.team1 === 1 && setsWon.team2 === 1) {
        base.isTieBreak = true;
        base.tieBreakPoints = { team1: 0, team2: 0 };
        base.currentServer = otherTeam(base.currentServer);
        return base;
      }

      if (setsWon.team1 === 2 || setsWon.team2 === 2) {
        base.matchFinished = true;
        return base;
      }
    }

    // 🎾 FORMAT THIRD SET CLASSIQUE
    if (base.format === 'third_set') {
      if (setsWon.team1 === 2 || setsWon.team2 === 2) {
        base.matchFinished = true;
        return base;
      }
    }
  }

  // 🔁 alternance du service (toujours)
  base.currentServer = otherTeam(base.currentServer);
  return base;
}


function handleTieBreakPoint(state, team) {
  const next = clone(state);
  next.tieBreakPoints[team] += 1;

  const pSelf = next.tieBreakPoints[team];
  const pOpp = next.tieBreakPoints[otherTeam(team)];

  // 🎯 seuil selon le type de tie-break
  const isSuperTieBreak =
    next.format === 'super_tiebreak' && next.sets.length === 2;

  const targetPoints = isSuperTieBreak ? 10 : 7;

  // 🎾 victoire du tie-break avec 2 points d’écart
  if (pSelf >= targetPoints && pSelf - pOpp >= 2) {
    const base = clone(next);

    // 🔥 Super tie-break = set symbolique 1–0
    if (isSuperTieBreak) {
      base.games =
        team === 'team1'
          ? { team1: 1, team2: 0 }
          : { team1: 0, team2: 1 };
    } else {
      // tie-break classique → set 7–6
      base.games[team] = 7;
      base.games[otherTeam(team)] = 6;
    }

    // ➕ ajout du set
    base.sets.push({
      team1: base.games.team1,
      team2: base.games.team2
    });

    // 🔄 reset
    base.games = { team1: 0, team2: 0 };
    base.points = { team1: 0, team2: 0 };
    base.isTieBreak = false;
    base.tieBreakPoints = { team1: 0, team2: 0 };

    // 🏁 fin du match
    base.matchFinished = true;
    base.currentServer = otherTeam(base.currentServer);

    return base;
  }

  return next;
}


export function incrementPoint(state, team) {
  if (state.matchFinished) return state;

  if (state.isTieBreak) {
    return handleTieBreakPoint(state, team);
  }

  const next = clone(state);
  const self = team;
  const opp = otherTeam(team);
  let pSelf = next.points[self];
  let pOpp = next.points[opp];

  // 0..3 → 15,30,40
  if (pSelf <= 2) {
    next.points[self] = pSelf + 1;
    return next;
  }

  // pSelf == 3 (40)
  if (pSelf === 3) {
    if (pOpp < 3) {
      // gagne le jeu directement
      return gameWon(next, self);
    }
    if (pOpp === 3) {
      // passe à avantage
      next.points[self] = 4;
      return next;
    }
    if (pOpp === 4) {
      // l'autre a AD → retour à égalité
      next.points[opp] = 3;
      return next;
    }
  }

  // si on est déjà à AD
  if (pSelf === 4) {
    // gagne le jeu
    return gameWon(next, self);
  }

  return next;
}

export function decrementPoint(state, team) {
  // décrémentation simple, sans revenir sur les jeux/sets déjà validés
  const next = clone(state);

  if (next.isTieBreak) {
    next.tieBreakPoints[team] = Math.max(0, next.tieBreakPoints[team] - 1);
    return next;
  }

  next.points[team] = Math.max(0, next.points[team] - 1);
  return next;
}

export function resetMatch() {
  // Remet TOUT à zéro : points, jeux, sets, tie-break, matchFinished
  return createInitialState();
}

export function setFormat(state, format) {
  const next = clone(state);
  next.format = format;
  return next;
}


