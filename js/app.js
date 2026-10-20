/**
 * 2026 양평 사제동행 배구대회 - 메인 애플리케이션 컨트롤러
 * (사제동행, 여자부, 남자부 3팀 풀리그 체제)
 */

class App {
  constructor() {
    this.currentTab = 'dashboard';
  }

  init() {
    this.bindTabNavigation();
    this.updateAllViews();

    window.storageManager.onBroadcast((msg) => {
      if (msg.type === 'DATA_UPDATED') {
        this.updateAllViews(false);
      }
    });

    if (window.scoreboardController) {
      window.scoreboardController.init();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-tab');
      if (target === tabName) {
        btn.classList.add('bg-emerald-500', 'text-slate-950', 'shadow-lg', 'shadow-emerald-500/20');
        btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
      } else {
        btn.classList.remove('bg-emerald-500', 'text-slate-950', 'shadow-lg', 'shadow-emerald-500/20');
        btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
      }
    });

    document.querySelectorAll('.tab-content-section').forEach(sec => {
      sec.classList.add('hidden');
    });

    const activeSection = document.getElementById(`tab_${tabName}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
    }

    if (tabName === 'dashboard') this.renderDashboard();
    if (tabName === 'scoreboard') {
      if (window.scoreboardController) window.scoreboardController.renderScoreboard();
    }
    if (tabName === 'schedule') this.renderSchedule();
    if (tabName === 'standings') this.renderStandings();
    if (tabName === 'teams') {
      if (window.teamsManager) window.teamsManager.renderTeamsList();
    }
    if (tabName === 'scoresheet') this.renderScoresheet();

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindTabNavigation() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });
  }

  updateAllViews(renderScoreboard = true) {
    this.renderDashboard();
    this.renderSchedule();
    this.renderStandings();
    if (window.teamsManager) window.teamsManager.renderTeamsList();
    if (renderScoreboard && window.scoreboardController) {
      window.scoreboardController.renderScoreboard();
    }
    this.renderScoresheet();
    if (window.lucide) window.lucide.createIcons();
  }

  // 1. 대시보드 렌더링
  renderDashboard() {
    const data = window.storageManager.loadData();
    const teams = data.teams || [];
    const matches = data.matches || [];

    const finishedMatches = matches.filter(m => m.status === 'finished').length;
    const inProgressMatches = matches.filter(m => m.status === 'in_progress').length;

    const totalTeamsEl = document.getElementById('dashTotalTeams');
    const totalMatchesEl = document.getElementById('dashTotalMatches');
    const inProgressEl = document.getElementById('dashInProgressMatches');
    const finishedEl = document.getElementById('dashFinishedMatches');

    if (totalTeamsEl) totalTeamsEl.innerText = `${teams.length}개 팀`;
    if (totalMatchesEl) totalMatchesEl.innerText = `${matches.length}경기`;
    if (inProgressEl) inProgressEl.innerText = `${inProgressMatches}경기`;
    if (finishedEl) finishedEl.innerText = `${finishedMatches}경기`;

    // 실시간 / 다음 경기 목록
    const liveContainer = document.getElementById('dashLiveMatchesContainer');
    if (liveContainer) {
      if (matches.length === 0) {
        liveContainer.innerHTML = `<div class="p-6 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">등록된 경기 일정이 없습니다.</div>`;
      } else {
        liveContainer.innerHTML = matches.map(m => {
          const home = teams.find(t => t.id === m.homeTeamId) || { name: "홈팀" };
          const away = teams.find(t => t.id === m.awayTeamId) || { name: "원정팀" };
          const isLive = m.status === 'in_progress';
          const isFinished = m.status === 'finished';

          const divBadgeText = m.division === 'mixed' ? '사제동행' : (m.division === 'female' ? '여자부' : '남자부');
          const divBadgeClass = m.division === 'mixed' 
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
            : (m.division === 'female' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30');

          return `
            <div class="bg-slate-900/80 p-4 rounded-xl border ${isLive ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-slate-800'} flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition">
              <div class="flex items-center space-x-3">
                <span class="px-2.5 py-1 rounded-md text-xs font-bold ${isLive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : (isFinished ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')}">
                  ${isLive ? '● LIVE 진행중' : isFinished ? '✓ 완료' : '대기중'}
                </span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${divBadgeClass}">${divBadgeText}</span>
                <span class="text-xs text-slate-400 font-mono font-bold">${m.time}</span>
                <span class="text-xs text-slate-300 hidden sm:inline">${m.round}</span>
              </div>

              <div class="flex items-center space-x-3">
                <span class="font-bold text-white text-sm md:text-base">${home.name}</span>
                <div class="px-3 py-1 bg-slate-950 rounded-lg font-mono font-black text-amber-400 text-sm border border-slate-800">
                  ${m.homeSetsWon || 0} : ${m.awaySetsWon || 0}
                </div>
                <span class="font-bold text-white text-sm md:text-base">${away.name}</span>
              </div>

              <button onclick="app.openMatchInScoreboard('${m.id}')" class="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition flex items-center">
                <i data-lucide="play" class="w-3.5 h-3.5 mr-1"></i> 점수판 열기
              </button>
            </div>
          `;
        }).join('');
      }
    }
  }

  // 2. 경기 일정 및 결과 목록
  renderSchedule() {
    const container = document.getElementById('scheduleMatchesContainer');
    if (!container) return;

    const data = window.storageManager.loadData();
    const teams = data.teams || [];
    const matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          <i data-lucide="calendar" class="w-16 h-16 mx-auto mb-4 opacity-40"></i>
          <p class="text-lg font-medium">등록된 경기 일정이 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = matches.map((m, idx) => {
      const home = teams.find(t => t.id === m.homeTeamId) || { name: "홈팀", school: "-" };
      const away = teams.find(t => t.id === m.awayTeamId) || { name: "원정팀", school: "-" };
      const isFinished = m.status === 'finished';
      const isInProgress = m.status === 'in_progress';

      const divBadgeText = m.division === 'mixed' ? '사제동행 매치' : (m.division === 'female' ? '여자부 리그' : '남자부 풀리그');
      const divBadgeClass = m.division === 'mixed' 
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
        : (m.division === 'female' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30');

      return `
        <div class="bg-slate-900/80 rounded-2xl border ${isInProgress ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-slate-800'} p-5 hover:border-slate-700 transition">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-1 rounded-lg text-xs font-black ${isInProgress ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : isFinished ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                ${isInProgress ? '● 경기 진행 중' : isFinished ? '✓ 경기 종료' : '대기중'}
              </span>
              <span class="px-2.5 py-0.5 rounded text-xs font-bold border ${divBadgeClass}">${divBadgeText}</span>
              <span class="text-xs font-bold text-slate-300">${m.round}</span>
            </div>
            <div class="text-xs text-slate-400 flex items-center space-x-3">
              <span><i data-lucide="map-pin" class="w-3.5 h-3.5 inline mr-1"></i>${m.court}</span>
              <span class="font-bold text-amber-400 font-mono text-sm"><i data-lucide="clock" class="w-3.5 h-3.5 inline mr-1 text-slate-400"></i>${m.time}</span>
            </div>
          </div>

          <!-- 대진 및 스코어 -->
          <div class="grid grid-cols-1 md:grid-cols-7 items-center gap-4 py-3 border-y border-slate-800/80">
            <!-- 홈팀 -->
            <div class="md:col-span-3 flex items-center space-x-3 justify-start">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white" style="background-color: ${home.primaryColor || '#059669'};">
                ${home.name.charAt(0)}
              </div>
              <div>
                <h4 class="font-bold text-white text-base ${isFinished && m.winnerId === home.id ? 'text-amber-400' : ''}">${home.name}</h4>
                <p class="text-xs text-slate-400">${home.school}</p>
              </div>
            </div>

            <!-- 스코어 / VS -->
            <div class="md:col-span-1 text-center">
              ${isFinished || isInProgress ? `
                <div class="inline-block px-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono font-black text-lg text-amber-400">
                  ${m.homeSetsWon || 0} : ${m.awaySetsWon || 0}
                </div>
              ` : `
                <span class="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs uppercase">VS</span>
              `}
            </div>

            <!-- 어웨이팀 -->
            <div class="md:col-span-3 flex items-center space-x-3 justify-end text-right">
              <div>
                <h4 class="font-bold text-white text-base ${isFinished && m.winnerId === away.id ? 'text-amber-400' : ''}">${away.name}</h4>
                <p class="text-xs text-slate-400">${away.school}</p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white" style="background-color: ${away.primaryColor || '#2563eb'};">
                ${away.name.charAt(0)}
              </div>
            </div>
          </div>

          <!-- 세트 세부 점수 & 액션 버튼 -->
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center space-x-2 text-slate-400">
              ${(m.sets || []).map((s, sIdx) => `
                <span class="px-2 py-0.5 rounded bg-slate-800/80 font-mono text-[11px]">${sIdx+1}세트(${s.home}:${s.away})</span>
              `).join('')}
            </div>

            <div class="flex items-center space-x-2">
              <button onclick="app.openMatchInScoreboard('${m.id}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition flex items-center">
                <i data-lucide="activity" class="w-3.5 h-3.5 mr-1"></i> 점수판 열기
              </button>
              <button onclick="app.openMatchEditModal('${m.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="경기 일정 수정">
                <i data-lucide="edit" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. 순위표 및 리그 결과 렌더링
  renderStandings() {
    if (!window.tournamentManager) return;

    const data = window.storageManager.loadData();
    const maleStandings = window.tournamentManager.calculateStandings('male');

    // 1) 남자부 3팀 풀리그 순위표
    this.renderStandingsTable('standingsTableMale', maleStandings);

    // 2) 여자부 리그 결과 카드
    this.renderDivisionResultCard('femaleResultContainer', 'female');

    // 3) 사제동행 매치 결과 카드
    this.renderDivisionResultCard('mixedResultContainer', 'mixed');
  }

  renderStandingsTable(elementId, list) {
    const tbody = document.getElementById(elementId);
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center py-6 text-slate-500">등록된 팀이 없습니다.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((item, idx) => {
      const isWinner = idx === 0 && item.played > 0;
      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
          <td class="py-3.5 px-3 text-center">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${idx === 0 ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.6)]' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-400'}">
              ${idx === 0 ? '🥇' : item.rank}
            </span>
          </td>
          <td class="py-3.5 px-3 font-bold text-white flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full" style="background-color: ${item.team.primaryColor || '#10b981'};"></span>
            <span class="text-sm">${item.team.name}</span>
            ${isWinner ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">1위</span>` : ''}
          </td>
          <td class="py-3.5 px-2 text-center text-slate-300 font-bold">${item.played}</td>
          <td class="py-3.5 px-2 text-center font-bold text-emerald-400">${item.won}</td>
          <td class="py-3.5 px-2 text-center text-rose-400">${item.lost}</td>
          <td class="py-3.5 px-2 text-center font-black text-amber-400 font-mono text-base">${item.points}</td>
          <td class="py-3.5 px-2 text-center text-slate-300 text-xs">${item.setsWon}:${item.setsLost}</td>
          <td class="py-3.5 px-2 text-center text-slate-300 text-xs font-mono">${item.setRatio.toFixed(2)}</td>
          <td class="py-3.5 px-2 text-center text-slate-300 text-xs">${item.scoreWon}:${item.scoreLost}</td>
          <td class="py-3.5 px-2 text-center text-slate-300 text-xs font-mono">${item.scoreRatio.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  }

  // 여자부 / 사제동행 단판/리그 결과 카드 렌더링
  renderDivisionResultCard(elementId, division) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const data = window.storageManager.loadData();
    const match = data.matches.find(m => m.division === division);
    if (!match) return;

    const home = data.teams.find(t => t.id === match.homeTeamId) || { name: "팀 1" };
    const away = data.teams.find(t => t.id === match.awayTeamId) || { name: "팀 2" };
    const isFinished = match.status === 'finished';
    const isLive = match.status === 'in_progress';

    container.innerHTML = `
      <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-slate-400">${match.time} | ${match.court}</span>
          <span class="px-2.5 py-1 rounded-md font-bold ${isLive ? 'bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30' : (isFinished ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400')}">
            ${isLive ? '● 진행 중' : (isFinished ? '✓ 경기 종료' : '대기 중')}
          </span>
        </div>

        <div class="flex items-center justify-between py-2">
          <div class="text-center flex-1">
            <span class="text-sm font-bold text-white block ${isFinished && match.winnerId === home.id ? 'text-amber-400' : ''}">${home.name}</span>
          </div>
          <div class="px-4 py-1.5 bg-slate-950 rounded-xl font-mono font-black text-lg text-amber-400 border border-slate-800">
            ${match.homeSetsWon || 0} : ${match.awaySetsWon || 0}
          </div>
          <div class="text-center flex-1">
            <span class="text-sm font-bold text-white block ${isFinished && match.winnerId === away.id ? 'text-amber-400' : ''}">${away.name}</span>
          </div>
        </div>

        <button onclick="app.openMatchInScoreboard('${match.id}')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 transition flex items-center justify-center">
          <i data-lucide="play" class="w-3.5 h-3.5 mr-1"></i> 점수판에서 경기 진행하기
        </button>
      </div>
    `;
  }

  // 4. 공식 경기 기록지 (Scoresheet) 생성
  renderScoresheet() {
    const data = window.storageManager.loadData();
    const select = document.getElementById('scoresheetMatchSelect');
    if (!select) return;

    select.innerHTML = data.matches.map(m => {
      const h = data.teams.find(t => t.id === m.homeTeamId)?.name || '홈팀';
      const a = data.teams.find(t => t.id === m.awayTeamId)?.name || '원정팀';
      return `<option value="${m.id}">[${m.time}] ${m.round} - ${h} VS ${a}</option>`;
    }).join('');

    this.updateScoresheetPreview();
  }

  updateScoresheetPreview() {
    const select = document.getElementById('scoresheetMatchSelect');
    const container = document.getElementById('scoresheetPrintContainer');
    if (!select || !container) return;

    const data = window.storageManager.loadData();
    const matchId = select.value;
    const match = data.matches.find(m => m.id === matchId);
    if (!match) return;

    const homeTeam = data.teams.find(t => t.id === match.homeTeamId) || { name: "홈팀", school: "-", players: [] };
    const awayTeam = data.teams.find(t => t.id === match.awayTeamId) || { name: "원정팀", school: "-", players: [] };

    container.innerHTML = `
      <div class="bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto scoresheet-a4 print:shadow-none print:border-none print:p-0">
        <!-- 헤더 -->
        <div class="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h2 class="text-2xl font-black tracking-tight text-slate-900">2026 양평 사제동행 배구대회 공식 경기기록지</h2>
          <p class="text-xs text-slate-600 mt-1">Yangpyeong Teacher-Student Volleyball Official Scoresheet</p>
        </div>

        <!-- 경기 메타 정보 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border border-slate-300 p-3 mb-6 bg-slate-50 font-medium">
          <div><span class="text-slate-500">대회일:</span> ${data.settings.date}</div>
          <div><span class="text-slate-500">장소:</span> ${match.court}</div>
          <div><span class="text-slate-500">구분:</span> ${match.round}</div>
          <div><span class="text-slate-500">경기시간:</span> ${match.time}</div>
        </div>

        <!-- 최종 결과 요약 -->
        <div class="flex items-center justify-between border-2 border-slate-900 p-4 mb-6 bg-slate-100 rounded-xl">
          <div class="text-center flex-1">
            <h3 class="text-lg font-bold text-slate-900">${homeTeam.name}</h3>
            <span class="text-xs text-slate-500">${homeTeam.school}</span>
          </div>
          <div class="text-center px-6">
            <span class="text-2xl font-black font-mono text-emerald-700">${match.homeSetsWon || 0} : ${match.awaySetsWon || 0}</span>
            <span class="block text-[11px] text-slate-500 font-bold mt-0.5">최종 세트스코어</span>
          </div>
          <div class="text-center flex-1">
            <h3 class="text-lg font-bold text-slate-900">${awayTeam.name}</h3>
            <span class="text-xs text-slate-500">${awayTeam.school}</span>
          </div>
        </div>

        <!-- 세트별 점수 상세 테이블 -->
        <div class="mb-6">
          <h4 class="text-xs font-bold text-slate-800 uppercase mb-2">■ 세트별 득점 상세</h4>
          <table class="w-full text-center border-collapse border border-slate-300 text-xs">
            <thead>
              <tr class="bg-slate-200">
                <th class="border border-slate-300 p-2">팀 구분</th>
                <th class="border border-slate-300 p-2">1세트</th>
                <th class="border border-slate-300 p-2">2세트</th>
                <th class="border border-slate-300 p-2">3세트</th>
                <th class="border border-slate-300 p-2 font-bold">세트 승수</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-slate-300 p-2 font-bold text-left pl-3">${homeTeam.name}</td>
                <td class="border border-slate-300 p-2 font-mono">${match.sets?.[0]?.home ?? '-'}</td>
                <td class="border border-slate-300 p-2 font-mono">${match.sets?.[1]?.home ?? '-'}</td>
                <td class="border border-slate-300 p-2 font-mono">${match.sets?.[2]?.home ?? '-'}</td>
                <td class="border border-slate-300 p-2 font-bold font-mono text-emerald-700">${match.homeSetsWon || 0}</td>
              </tr>
              <tr>
                <td class="border border-slate-300 p-2 font-bold text-left pl-3">${awayTeam.name}</td>
                <td class="border border-slate-300 p-2 font-mono">${match.sets?.[0]?.away ?? '-'}</td>
                <td class="border border-slate-300 p-2 font-mono">${match.sets?.[1]?.away ?? '-'}</td>
                <td class="border border-slate-300 p-2 font-mono">${match.sets?.[2]?.away ?? '-'}</td>
                <td class="border border-slate-300 p-2 font-bold font-mono text-emerald-700">${match.awaySetsWon || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 출전 선수 명단 -->
        <div class="grid grid-cols-2 gap-4 mb-6 text-xs">
          <div>
            <h4 class="font-bold text-slate-800 mb-1">■ [홈] ${homeTeam.name} 출전 명단</h4>
            <div class="border border-slate-300 rounded p-2 min-h-[100px] space-y-1">
              ${(homeTeam.players || []).map(p => `
                <div class="flex justify-between text-[11px]">
                  <span>#${p.number} ${p.name} (${p.role === 'teacher' ? '교직원' : '학생'})</span>
                  <span class="text-slate-500">${p.position}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div>
            <h4 class="font-bold text-slate-800 mb-1">■ [원정] ${awayTeam.name} 출전 명단</h4>
            <div class="border border-slate-300 rounded p-2 min-h-[100px] space-y-1">
              ${(awayTeam.players || []).map(p => `
                <div class="flex justify-between text-[11px]">
                  <span>#${p.number} ${p.name} (${p.role === 'teacher' ? '교직원' : '학생'})</span>
                  <span class="text-slate-500">${p.position}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 서명란 -->
        <div class="border-t-2 border-slate-300 pt-4 flex justify-between text-xs text-slate-700">
          <div>주심 서명: ____________________ (인)</div>
          <div>부심 서명: ____________________ (인)</div>
          <div>기록원 서명: ____________________ (인)</div>
        </div>
      </div>
    `;
  }

  printScoresheet() {
    window.print();
  }

  openMatchInScoreboard(matchId) {
    if (window.scoreboardController) {
      window.scoreboardController.loadActiveMatch(matchId);
    }
    this.switchTab('scoreboard');
  }

  openDisplayWindow() {
    const width = 1280;
    const height = 720;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    window.open('scoreboard-display.html', 'YangpyeongVBScoreboard', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`);
  }

  // 공식 리그 일정 복원
  resetOfficialLeagueSchedule() {
    if (confirm("공식 리그 일정(15:30 사제동행, 16:10 여자부, 17:00~18:20 남자부 3경기 풀리그)으로 일정을 복원하시겠습니까?")) {
      window.storageManager.resetToDefault();
      this.updateAllViews();
      alert("공식 리그 일정이 성공적으로 복원되었습니다!");
    }
  }

  // 경기 수정 모달
  openMatchEditModal(matchId) {
    const data = window.storageManager.loadData();
    const match = data.matches.find(m => m.id === matchId);
    if (!match) return;

    const modal = document.getElementById('matchModal');
    if (!modal) return;

    document.getElementById('editMatchId').value = match.id;
    document.getElementById('editMatchRound').value = match.round;
    document.getElementById('editMatchCourt').value = match.court;
    document.getElementById('editMatchTime').value = match.time;

    const homeSel = document.getElementById('editMatchHomeTeam');
    const awaySel = document.getElementById('editMatchAwayTeam');

    const options = data.teams.map(t => `<option value="${t.id}">${t.name} (${t.group})</option>`).join('');
    homeSel.innerHTML = options;
    awaySel.innerHTML = options;

    homeSel.value = match.homeTeamId;
    awaySel.value = match.awayTeamId;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeMatchModal() {
    const modal = document.getElementById('matchModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  saveMatchForm(e) {
    if (e) e.preventDefault();
    const data = window.storageManager.loadData();
    const id = document.getElementById('editMatchId').value;
    const match = data.matches.find(m => m.id === id);
    if (!match) return;

    match.round = document.getElementById('editMatchRound').value;
    match.court = document.getElementById('editMatchCourt').value;
    match.time = document.getElementById('editMatchTime').value;
    match.homeTeamId = document.getElementById('editMatchHomeTeam').value;
    match.awayTeamId = document.getElementById('editMatchAwayTeam').value;

    window.storageManager.saveData(data);
    this.closeMatchModal();
    this.updateAllViews();
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
