/**
 * 2026 양평 사제동행 배구대회 - 실시간 스마트 점수판 (Scorekeeper)
 * - 9인제 배구 포지션 완벽 지원
 * - 득점 클릭 시 LIVE 진행 중 자동 전환 & 타이머 가동
 * - 점수판을 절대 찌그러뜨리지 않는 독립 사이드 명단 패널
 */

class ScoreboardController {
  constructor() {
    this.currentMatch = null;
    this.historyStack = [];
    this.timeoutTimer = null;
    this.timeoutSecondsLeft = 30;
    this.courtFlipped = false;
    this.matchDurationSeconds = 0;
    this.matchDurationTimer = null;
    this.isTimerRunning = false;
    this.rosterVisible = {
      left: false,
      right: false
    };
  }

  init() {
    this.bindEvents();
    this.loadActiveMatch();
    this.setupMatchTimer();
  }

  setupMatchTimer() {
    if (this.matchDurationTimer) clearInterval(this.matchDurationTimer);
    this.matchDurationTimer = setInterval(() => {
      if (this.isTimerRunning && this.currentMatch && this.currentMatch.status === 'in_progress') {
        this.matchDurationSeconds++;
        this.updateTimerDisplay();
      }
    }, 1000);
  }

  startMatchTimer() {
    this.isTimerRunning = true;
    const btn = document.getElementById('timerToggleBtn');
    if (btn) {
      btn.innerHTML = `<i data-lucide="pause" class="w-3.5 h-3.5 mr-1"></i>일시정지`;
      btn.classList.add('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40');
      btn.classList.remove('bg-slate-800', 'text-slate-200');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  pauseMatchTimer() {
    this.isTimerRunning = false;
    const btn = document.getElementById('timerToggleBtn');
    if (btn) {
      btn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 mr-1"></i>타이머 시작`;
      btn.classList.remove('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40');
      btn.classList.add('bg-slate-800', 'text-slate-200');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  toggleMatchTimer() {
    if (this.isTimerRunning) {
      this.pauseMatchTimer();
    } else {
      if (this.currentMatch && this.currentMatch.status === 'ready') {
        this.startMatchLive();
      } else {
        this.startMatchTimer();
      }
    }
  }

  resetMatchTimer() {
    this.matchDurationSeconds = 0;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const el = document.getElementById('matchTimerText');
    if (!el) return;
    const min = Math.floor(this.matchDurationSeconds / 60);
    const sec = this.matchDurationSeconds % 60;
    el.innerText = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  loadActiveMatch(matchId = null) {
    const data = window.storageManager.loadData();
    const targetId = matchId || data.activeMatchId || (data.matches[0] ? data.matches[0].id : null);
    
    if (!targetId) return;
    
    const match = data.matches.find(m => m.id === targetId);
    if (!match) return;

    data.activeMatchId = targetId;
    window.storageManager.saveData(data);

    if (!match.currentSet) match.currentSet = 1;
    if (!match.currentPoints) match.currentPoints = { home: 0, away: 0 };
    if (!match.sets) match.sets = [];
    if (!match.timeouts) match.timeouts = { home: 0, away: 0 };
    if (!match.server) match.server = 'home';
    if (!match.homeSetsWon) match.homeSetsWon = 0;
    if (!match.awaySetsWon) match.awaySetsWon = 0;

    this.currentMatch = match;
    this.historyStack = [];

    if (match.status === 'ready') {
      this.isTimerRunning = false;
      this.matchDurationSeconds = 0;
    } else if (match.status === 'in_progress') {
      this.isTimerRunning = true;
    } else {
      this.isTimerRunning = false;
    }

    this.updateTimerDisplay();
    this.renderScoreboard();
    this.broadcastState();
  }

  startMatchLive() {
    if (!this.currentMatch) return;
    this.currentMatch.status = 'in_progress';
    this.startMatchTimer();
    this.saveAndSync();
    this.renderScoreboard();
    window.soundSystem.playShortWhistle();
  }

  toggleRoster(side) {
    this.rosterVisible[side] = !this.rosterVisible[side];
    this.renderRosterSidePanel(side);
  }

  // 점수판 옆 공간에 뜨는 9인제 선수 명단 패널 (점수판 폭 절대 불변)
  renderRosterSidePanel(side) {
    const panel = document.getElementById(`sbRosterSidePanel_${side}`);
    const toggleBtn = document.getElementById(`sbRosterToggleBtn_${side}`);
    if (!panel || !this.currentMatch) return;

    const isOpen = this.rosterVisible[side];
    const data = window.storageManager.loadData();

    const role = (side === 'left') 
      ? (this.courtFlipped ? 'away' : 'home')
      : (this.courtFlipped ? 'home' : 'away');
    
    const teamId = role === 'home' ? this.currentMatch.homeTeamId : this.currentMatch.awayTeamId;
    const team = data.teams.find(t => t.id === teamId) || { name: "팀", players: [] };
    const players = team.players || [];

    if (toggleBtn) {
      if (isOpen) {
        toggleBtn.classList.add('bg-emerald-500', 'text-slate-950', 'border-emerald-400');
        toggleBtn.classList.remove('bg-slate-800', 'text-slate-300');
        toggleBtn.innerHTML = `<i data-lucide="x" class="w-3.5 h-3.5 mr-1"></i> 명단 닫기`;
      } else {
        toggleBtn.classList.remove('bg-emerald-500', 'text-slate-950', 'border-emerald-400');
        toggleBtn.classList.add('bg-slate-800', 'text-slate-300');
        toggleBtn.innerHTML = `<i data-lucide="users" class="w-3.5 h-3.5 mr-1"></i> 선수 명단 (${players.length})`;
      }
    }

    if (!isOpen) {
      panel.classList.add('hidden');
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    panel.classList.remove('hidden');

    const teachers = players.filter(p => p.role === 'teacher');
    const students = players.filter(p => p.role === 'student');

    panel.innerHTML = `
      <div class="w-72 bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col justify-between h-[520px] space-y-3 shrink-0">
        <!-- 헤더 -->
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full" style="background-color: ${team.primaryColor || '#10b981'};"></span>
            <h4 class="font-bold text-sm text-white truncate max-w-[170px]">${team.name}</h4>
          </div>
          <button onclick="scoreboardController.toggleRoster('${side}')" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="text-[11px] text-slate-400 flex items-center justify-between px-1">
          <span class="font-bold text-slate-300">9인제 라인업 (${players.length}명)</span>
          <div class="space-x-1">
            ${teachers.length > 0 ? `<span class="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">교 ${teachers.length}</span>` : ''}
            ${students.length > 0 ? `<span class="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">학 ${students.length}</span>` : ''}
          </div>
        </div>

        <!-- 9인제 선수 리스트 -->
        <div class="flex-1 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
          ${players.map(p => `
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs hover:border-slate-700 transition">
              <div class="flex items-center space-x-2">
                <span class="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-black flex items-center justify-center font-mono text-xs border border-slate-700">
                  ${p.number}
                </span>
                <div>
                  <div class="font-bold text-white flex items-center space-x-1">
                    <span class="truncate max-w-[85px]">${p.name}</span>
                    <span class="text-[9px] px-1 py-0.2 rounded ${p.role === 'teacher' ? 'bg-indigo-900/60 text-indigo-300' : 'bg-amber-900/60 text-amber-300'}">
                      ${p.role === 'teacher' ? '교' : '학'}
                    </span>
                  </div>
                  <span class="text-[10px] text-slate-400 block truncate max-w-[90px]">${p.memo || '-'}</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/90 text-slate-200 border border-slate-700/60 whitespace-nowrap">
                ${p.position}
              </span>
            </div>
          `).join('')}
        </div>

        <div class="pt-2 border-t border-slate-800 text-center">
          <span class="text-[10px] text-slate-400 font-medium">점수판 옆 공간에 배치된 9인제 명단</span>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderScoreboard() {
    if (!this.currentMatch) return;

    const data = window.storageManager.loadData();
    const homeTeam = data.teams.find(t => t.id === this.currentMatch.homeTeamId) || {
      name: "홈팀 (미정)",
      school: "-",
      primaryColor: "#059669"
    };
    const awayTeam = data.teams.find(t => t.id === this.currentMatch.awayTeamId) || {
      name: "원정팀 (미정)",
      school: "-",
      primaryColor: "#2563eb"
    };

    const leftTeam = this.courtFlipped ? awayTeam : homeTeam;
    const rightTeam = this.courtFlipped ? homeTeam : awayTeam;
    const leftRole = this.courtFlipped ? 'away' : 'home';
    const rightRole = this.courtFlipped ? 'home' : 'away';

    const titleEl = document.getElementById('sbMatchTitle');
    const roundEl = document.getElementById('sbMatchRound');
    const courtEl = document.getElementById('sbMatchCourt');
    const divisionEl = document.getElementById('sbMatchDivision');
    const statusBadge = document.getElementById('sbMatchStatusBadge');
    
    if (titleEl) titleEl.innerText = `${homeTeam.name} VS ${awayTeam.name}`;
    if (roundEl) roundEl.innerText = this.currentMatch.round || '리그 경기';
    if (courtEl) courtEl.innerText = `${this.currentMatch.court || '물맑은 메인코트'} (${this.currentMatch.time || ''})`;

    if (divisionEl) {
      const divName = this.currentMatch.division === 'mixed' ? '사제동행 매치' : (this.currentMatch.division === 'female' ? '여자부 리그' : '남자부 풀리그');
      divisionEl.innerText = divName;
    }

    if (statusBadge) {
      if (this.currentMatch.status === 'in_progress') {
        statusBadge.innerHTML = `● LIVE 진행 중`;
        statusBadge.className = "px-3 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse";
      } else if (this.currentMatch.status === 'finished') {
        statusBadge.innerHTML = `✓ 경기 종료`;
        statusBadge.className = "px-3 py-1 rounded-lg text-xs font-black bg-slate-800 text-slate-400 border border-slate-700";
      } else {
        statusBadge.innerHTML = `⏳ 대기 중 (경기 시작 전)`;
        statusBadge.className = "px-3 py-1 rounded-lg text-xs font-bold bg-slate-800/90 text-amber-300 border border-slate-700";
      }
    }

    const currentSetEl = document.getElementById('sbCurrentSetNum');
    if (currentSetEl) currentSetEl.innerText = `${this.currentMatch.currentSet} SET`;

    this.renderTeamSide('left', leftTeam, leftRole);
    this.renderTeamSide('right', rightTeam, rightRole);

    this.renderRosterSidePanel('left');
    this.renderRosterSidePanel('right');

    this.renderSetScoresTable(homeTeam, awayTeam);
    this.checkDeuceState();

    if (window.lucide) window.lucide.createIcons();
  }

  renderTeamSide(side, team, role) {
    const isHome = role === 'home';
    const points = isHome ? this.currentMatch.currentPoints.home : this.currentMatch.currentPoints.away;
    const setsWon = isHome ? this.currentMatch.homeSetsWon : this.currentMatch.awaySetsWon;
    const timeouts = isHome ? (this.currentMatch.timeouts.home || 0) : (this.currentMatch.timeouts.away || 0);
    const isServing = this.currentMatch.server === role;

    const nameEl = document.getElementById(`sbTeamName_${side}`);
    const schoolEl = document.getElementById(`sbTeamSchool_${side}`);
    const colorBar = document.getElementById(`sbColorBar_${side}`);
    const pointsEl = document.getElementById(`sbPoints_${side}`);
    const setsBadge = document.getElementById(`sbSetsWon_${side}`);
    const serveBadge = document.getElementById(`sbServeBadge_${side}`);
    const timeoutsContainer = document.getElementById(`sbTimeouts_${side}`);

    if (nameEl) nameEl.innerText = team.name;
    if (schoolEl) schoolEl.innerText = team.school;
    if (colorBar) colorBar.style.backgroundColor = team.primaryColor || '#059669';
    if (pointsEl) {
      pointsEl.innerText = points;
      pointsEl.style.color = isServing ? '#fbbf24' : '#ffffff';
    }
    if (setsBadge) setsBadge.innerText = `${setsWon} SET`;

    if (serveBadge) {
      if (isServing) {
        serveBadge.classList.remove('hidden');
        serveBadge.classList.add('flex');
      } else {
        serveBadge.classList.add('hidden');
        serveBadge.classList.remove('flex');
      }
    }

    if (timeoutsContainer) {
      timeoutsContainer.innerHTML = `
        <div class="flex items-center space-x-1.5" title="남은 작전타임: ${2 - timeouts}회">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-amber-400 ${timeouts >= 1 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-transparent'}"></div>
          <div class="w-3.5 h-3.5 rounded-full border-2 border-amber-400 ${timeouts >= 2 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-transparent'}"></div>
        </div>
      `;
    }
  }

  renderSetScoresTable(homeTeam, awayTeam) {
    const container = document.getElementById('sbSetHistoryContainer');
    if (!container) return;

    const sets = this.currentMatch.sets || [];
    const maxSets = 3;

    let html = `
      <div class="flex items-center justify-center space-x-6 text-sm">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">세트별 득점표:</span>
    `;

    for (let s = 1; s <= maxSets; s++) {
      const setData = sets[s - 1];
      const isCurrent = s === this.currentMatch.currentSet;
      let scoreText = "- : -";

      if (setData) {
        scoreText = `${setData.home} : ${setData.away}`;
      } else if (isCurrent) {
        scoreText = `${this.currentMatch.currentPoints.home} : ${this.currentMatch.currentPoints.away}`;
      }

      html += `
        <div class="px-3.5 py-1.5 rounded-xl border ${isCurrent ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'} flex items-center space-x-2">
          <span class="text-xs font-semibold opacity-70">${s}세트</span>
          <span class="font-mono font-bold">${scoreText}</span>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  }

  checkDeuceState() {
    const badge = document.getElementById('sbDeuceBadge');
    if (!badge || !this.currentMatch) return;

    const data = window.storageManager.loadData();
    const isFinalSet = this.currentMatch.currentSet >= 3;
    const targetPoints = isFinalSet ? data.settings.finalSetPoints : data.settings.setPoints;
    const deuceStartPoint = targetPoints - 1;

    const h = this.currentMatch.currentPoints.home;
    const a = this.currentMatch.currentPoints.away;

    if (h >= deuceStartPoint && a >= deuceStartPoint) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }

  addPoint(role) {
    if (!this.currentMatch) return;
    if (this.currentMatch.status === 'finished') {
      alert("이미 종료된 경기입니다.");
      return;
    }

    // 사용자가 점수를 클릭해야 비로소 '진행 중'으로 변경 및 타이머 가동!
    if (this.currentMatch.status === 'ready') {
      this.currentMatch.status = 'in_progress';
      this.startMatchTimer();
    }

    this.pushHistory('point', role);

    if (role === 'home') {
      this.currentMatch.currentPoints.home += 1;
    } else {
      this.currentMatch.currentPoints.away += 1;
    }

    const prevServer = this.currentMatch.server;
    this.currentMatch.server = role;

    window.soundSystem.playPoint();
    if (prevServer !== role) {
      setTimeout(() => window.soundSystem.playShortWhistle(), 200);
    }

    this.checkSetWin();

    this.saveAndSync();
    this.renderScoreboard();
  }

  subtractPoint(role) {
    if (!this.currentMatch) return;
    const current = role === 'home' ? this.currentMatch.currentPoints.home : this.currentMatch.currentPoints.away;
    if (current <= 0) return;

    this.pushHistory('sub_point', role);

    if (role === 'home') {
      this.currentMatch.currentPoints.home -= 1;
    } else {
      this.currentMatch.currentPoints.away -= 1;
    }

    this.saveAndSync();
    this.renderScoreboard();
  }

  toggleServer() {
    if (!this.currentMatch) return;
    this.currentMatch.server = this.currentMatch.server === 'home' ? 'away' : 'home';
    window.soundSystem.playShortWhistle();
    this.saveAndSync();
    this.renderScoreboard();
  }

  checkSetWin() {
    const data = window.storageManager.loadData();
    const isFinalSet = this.currentMatch.currentSet >= 3;
    const targetPoints = isFinalSet ? data.settings.finalSetPoints : data.settings.setPoints;
    const margin = data.settings.deuceMargin || 2;

    const h = this.currentMatch.currentPoints.home;
    const a = this.currentMatch.currentPoints.away;

    let winnerRole = null;

    if (h >= targetPoints && (h - a) >= margin) {
      winnerRole = 'home';
    } else if (a >= targetPoints && (a - h) >= margin) {
      winnerRole = 'away';
    }

    if (winnerRole) {
      this.handleSetWon(winnerRole, h, a);
    }
  }

  handleSetWon(winnerRole, homeScore, awayScore) {
    const data = window.storageManager.loadData();
    const homeTeam = data.teams.find(t => t.id === this.currentMatch.homeTeamId);
    const awayTeam = data.teams.find(t => t.id === this.currentMatch.awayTeamId);
    const winnerTeam = winnerRole === 'home' ? homeTeam : awayTeam;

    this.currentMatch.sets.push({
      home: homeScore,
      away: awayScore,
      winner: winnerRole
    });

    if (winnerRole === 'home') {
      this.currentMatch.homeSetsWon += 1;
    } else {
      this.currentMatch.awaySetsWon += 1;
    }

    window.soundSystem.playWhistle();
    setTimeout(() => window.soundSystem.playFanfare(), 300);

    const neededSetsToWin = 2;
    const matchFinished = this.currentMatch.homeSetsWon >= neededSetsToWin || this.currentMatch.awaySetsWon >= neededSetsToWin;

    if (matchFinished) {
      this.currentMatch.status = 'finished';
      this.pauseMatchTimer();
      this.currentMatch.winnerId = winnerTeam ? winnerTeam.id : (winnerRole === 'home' ? this.currentMatch.homeTeamId : this.currentMatch.awayTeamId);
      this.saveAndSync();
      this.renderScoreboard();

      this.showMatchWonModal(winnerTeam, this.currentMatch.homeSetsWon, this.currentMatch.awaySetsWon);
    } else {
      const currentSetNum = this.currentMatch.currentSet;
      this.showSetWonModal(winnerTeam, currentSetNum, homeScore, awayScore, () => {
        this.nextSet();
      });
    }
  }

  nextSet() {
    this.currentMatch.currentSet += 1;
    this.currentMatch.currentPoints = { home: 0, away: 0 };
    this.currentMatch.timeouts = { home: 0, away: 0 };
    this.courtFlipped = !this.courtFlipped;
    this.historyStack = [];
    this.saveAndSync();
    this.renderScoreboard();
    window.soundSystem.playWhistle();
  }

  flipCourt() {
    this.courtFlipped = !this.courtFlipped;
    this.renderScoreboard();
  }

  startTimeOut(role) {
    if (!this.currentMatch) return;
    const currentCount = this.currentMatch.timeouts[role] || 0;
    if (currentCount >= 2) {
      alert("이번 세트 작전타임(2회)을 모두 소진하였습니다.");
      return;
    }

    this.currentMatch.timeouts[role] = currentCount + 1;
    this.saveAndSync();
    this.renderScoreboard();
    this.openTimeoutModal(role);
  }

  openTimeoutModal(role) {
    const modal = document.getElementById('timeoutModal');
    const timerText = document.getElementById('timeoutTimerText');
    const callerText = document.getElementById('timeoutCallerText');
    const progressBar = document.getElementById('timeoutProgressBar');

    if (!modal) return;

    const data = window.storageManager.loadData();
    const team = data.teams.find(t => t.id === (role === 'home' ? this.currentMatch.homeTeamId : this.currentMatch.awayTeamId));
    if (callerText) callerText.innerText = `${team ? team.name : '팀'} 작전타임 요청`;

    this.timeoutSecondsLeft = 30;
    if (timerText) timerText.innerText = "30";
    if (progressBar) progressBar.style.width = "100%";

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    window.soundSystem.playWhistle();

    if (this.timeoutTimer) clearInterval(this.timeoutTimer);
    this.timeoutTimer = setInterval(() => {
      this.timeoutSecondsLeft--;
      if (timerText) timerText.innerText = String(this.timeoutSecondsLeft);
      if (progressBar) {
        const percent = (this.timeoutSecondsLeft / 30) * 100;
        progressBar.style.width = `${percent}%`;
      }

      if (this.timeoutSecondsLeft === 10) {
        window.soundSystem.playWarningBeep();
      }

      if (this.timeoutSecondsLeft <= 0) {
        clearInterval(this.timeoutTimer);
        window.soundSystem.playBuzzer();
        setTimeout(() => {
          this.closeTimeoutModal();
        }, 1200);
      }
    }, 1000);
  }

  closeTimeoutModal() {
    if (this.timeoutTimer) clearInterval(this.timeoutTimer);
    const modal = document.getElementById('timeoutModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  undo() {
    if (this.historyStack.length === 0) {
      alert("되돌릴 기록이 없습니다.");
      return;
    }

    const last = this.historyStack.pop();
    this.currentMatch.currentPoints = JSON.parse(JSON.stringify(last.points));
    this.currentMatch.server = last.server;
    this.saveAndSync();
    this.renderScoreboard();
  }

  pushHistory(type, role) {
    this.historyStack.push({
      type,
      role,
      points: JSON.parse(JSON.stringify(this.currentMatch.currentPoints)),
      server: this.currentMatch.server,
      timestamp: Date.now()
    });
    if (this.historyStack.length > 50) this.historyStack.shift();
  }

  saveAndSync() {
    const data = window.storageManager.loadData();
    const idx = data.matches.findIndex(m => m.id === this.currentMatch.id);
    if (idx !== -1) {
      data.matches[idx] = this.currentMatch;
    }
    data.activeMatchId = this.currentMatch.id;
    window.storageManager.saveData(data);
    this.broadcastState();
  }

  broadcastState() {
    window.storageManager.broadcast('SCOREBOARD_STATE', {
      match: this.currentMatch,
      courtFlipped: this.courtFlipped,
      matchDurationSeconds: this.matchDurationSeconds
    });
  }

  showSetWonModal(winnerTeam, setNum, hScore, aScore, onNext) {
    const modal = document.getElementById('setWonModal');
    if (!modal) {
      if (onNext) onNext();
      return;
    }

    document.getElementById('setWonTitle').innerText = `${setNum}세트 종료!`;
    document.getElementById('setWonTeamName').innerText = `${winnerTeam ? winnerTeam.name : '승리팀'} 승리!`;
    document.getElementById('setWonScore').innerText = `${hScore} : ${aScore}`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const nextBtn = document.getElementById('setWonNextBtn');
    nextBtn.onclick = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (onNext) onNext();
    };
  }

  showMatchWonModal(winnerTeam, hSets, aSets) {
    const modal = document.getElementById('matchWonModal');
    if (!modal) return;

    document.getElementById('matchWonTeamName').innerText = `🏆 ${winnerTeam ? winnerTeam.name : '팀'} 경기 승리!`;
    document.getElementById('matchWonFinalScore').innerText = `최종 세트스코어 ${hSets} : ${aSets}`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    document.getElementById('matchWonCloseBtn').onclick = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();
      const leftRole = this.courtFlipped ? 'away' : 'home';
      const rightRole = this.courtFlipped ? 'home' : 'away';

      switch (key) {
        case 'Q':
          this.addPoint(leftRole);
          break;
        case 'A':
          this.subtractPoint(leftRole);
          break;
        case 'W':
          this.currentMatch.server = leftRole;
          this.saveAndSync();
          this.renderScoreboard();
          window.soundSystem.playShortWhistle();
          break;
        case 'P':
          this.addPoint(rightRole);
          break;
        case 'L':
          this.subtractPoint(rightRole);
          break;
        case 'O':
          this.currentMatch.server = rightRole;
          this.saveAndSync();
          this.renderScoreboard();
          window.soundSystem.playShortWhistle();
          break;
        case ' ':
          e.preventDefault();
          this.toggleMatchTimer();
          break;
        case 'Z':
          this.undo();
          break;
        case 'C':
          this.flipCourt();
          break;
      }
    });
  }
}

window.scoreboardController = new ScoreboardController();
