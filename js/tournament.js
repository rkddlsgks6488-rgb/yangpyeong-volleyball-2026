/**
 * 2026 양평 사제동행 배구대회 - 리그전 순위표 계산 로직
 * (남자부 3팀 풀리그 / 여자부 리그전 / 사제동행 특별 매치)
 */

class TournamentManager {
  constructor() {}

  // 부문별 리그 순위 계산 (division: 'male' | 'female' | 'mixed')
  calculateStandings(division = 'male') {
    const data = window.storageManager.loadData();
    const teams = data.teams.filter(t => t.division === division);
    const matches = data.matches.filter(m => m.division === division && m.status === 'finished');

    // 통계 초기화
    const stats = {};
    teams.forEach(t => {
      stats[t.id] = {
        team: t,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,       // 공식 배구 승점 (2:0승 3점, 2:1승 2점, 1:2패 1점, 0:2패 0점)
        setsWon: 0,
        setsLost: 0,
        setRatio: 0,
        scoreWon: 0,
        scoreLost: 0,
        scoreRatio: 0
      };
    });

    // 경기 결과 반영
    matches.forEach(m => {
      const home = stats[m.homeTeamId];
      const away = stats[m.awayTeamId];
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;

      const hSets = m.homeSetsWon || 0;
      const aSets = m.awaySetsWon || 0;

      home.setsWon += hSets;
      home.setsLost += aSets;
      away.setsWon += aSets;
      away.setsLost += hSets;

      if (m.sets && m.sets.length > 0) {
        m.sets.forEach(s => {
          home.scoreWon += s.home || 0;
          home.scoreLost += s.away || 0;
          away.scoreWon += s.away || 0;
          away.scoreLost += s.home || 0;
        });
      }

      // 승패 및 배구 공식 승점
      if (hSets > aSets) {
        home.won += 1;
        away.lost += 1;
        if (hSets === 2 && aSets === 0) {
          home.points += 3;
        } else if (hSets === 2 && aSets === 1) {
          home.points += 2;
          away.points += 1;
        } else {
          home.points += 3;
        }
      } else if (aSets > hSets) {
        away.won += 1;
        home.lost += 1;
        if (aSets === 2 && hSets === 0) {
          away.points += 3;
        } else if (aSets === 2 && hSets === 1) {
          away.points += 2;
          home.points += 1;
        } else {
          away.points += 3;
        }
      }
    });

    // 득실률 계산
    Object.values(stats).forEach(s => {
      s.setRatio = s.setsLost === 0 ? (s.setsWon > 0 ? 99.0 : 0) : (s.setsWon / s.setsLost);
      s.scoreRatio = s.scoreLost === 0 ? (s.scoreWon > 0 ? 99.0 : 0) : (s.scoreWon / s.scoreLost);
    });

    // 공식 순위 산출 정렬 (1.다승 -> 2.승점 -> 3.세트득실률 -> 4.점수득실률)
    const sorted = Object.values(stats).sort((a, b) => {
      if (b.won !== a.won) return b.won - a.won;
      if (b.points !== a.points) return b.points - a.points;
      if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;
      return b.scoreRatio - a.scoreRatio;
    });

    sorted.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return sorted;
  }

  // 기본 리그 대진 일정 복원
  resetOfficialLeagueSchedule() {
    window.storageManager.resetToDefault();
    return window.storageManager.loadData().matches;
  }
}

window.tournamentManager = new TournamentManager();
