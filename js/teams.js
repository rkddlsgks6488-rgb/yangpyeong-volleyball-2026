/**
 * 2026 양평 사제동행 배구대회 - 팀 및 선수 등록/관리 모듈
 * (9인제 배구 표준 포지션 적용)
 */

class TeamsManager {
  constructor() {
    this.currentEditingTeamId = null;
    this.selectedDivisionFilter = 'all';
  }

  setDivisionFilter(div) {
    this.selectedDivisionFilter = div;
    this.renderTeamsList();
  }

  renderTeamsList() {
    const container = document.getElementById('teamsContainer');
    if (!container) return;

    const data = window.storageManager.loadData();
    let teams = data.teams || [];

    if (this.selectedDivisionFilter !== 'all') {
      teams = teams.filter(t => t.division === this.selectedDivisionFilter);
    }

    if (teams.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          <i data-lucide="users" class="w-16 h-16 mx-auto mb-4 opacity-40"></i>
          <p class="text-lg font-medium">해당 부문에 등록된 팀이 없습니다.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = teams.map(team => {
      const teachers = (team.players || []).filter(p => p.role === 'teacher');
      const students = (team.players || []).filter(p => p.role === 'student');
      const totalPlayers = (team.players || []).length;
      
      const divBadgeText = team.division === 'mixed' ? '사제동행' : (team.division === 'female' ? '여자부' : '남자부');
      const divBadgeClass = team.division === 'mixed' 
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
        : (team.division === 'female' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30');

      return `
        <div class="bg-slate-900/80 rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden hover:border-emerald-500/50 transition duration-300 group">
          <!-- 상단 헤더 배너 -->
          <div class="p-5 border-b border-slate-800 flex items-start justify-between relative" style="background: linear-gradient(135deg, ${team.primaryColor}22 0%, rgba(15, 23, 42, 0.9) 100%);">
            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg border border-white/20 text-white" style="background-color: ${team.primaryColor};">
                ${team.name.charAt(0)}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${divBadgeClass}">
                    ${divBadgeText}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">${team.school}</span>
                </div>
                <h3 class="text-lg font-bold text-white mt-0.5 group-hover:text-emerald-400 transition">${team.name}</h3>
              </div>
            </div>
            
            <div class="flex items-center space-x-1.5">
              <button onclick="teamsManager.openEditModal('${team.id}')" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition" title="팀 및 선수 수정">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="teamsManager.deleteTeam('${team.id}')" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition" title="팀 삭제">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- 팀 메타 정보 -->
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                <span class="text-slate-400 block mb-0.5">대표자/단장</span>
                <span class="font-bold text-slate-200">${team.headTeacher || '-'}</span>
              </div>
              <div class="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                <span class="text-slate-400 block mb-0.5">주장/연락처</span>
                <span class="font-bold text-slate-200">${team.captainStudent !== '-' ? team.captainStudent : (team.contact || '-')}</span>
              </div>
            </div>

            <!-- 9인제 로스터 구성 현황 -->
            <div class="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-300">
              <span class="flex items-center">
                <i data-lucide="users" class="w-4 h-4 mr-1.5 text-emerald-400"></i>
                9인제 구성: 교직원 ${teachers.length}명 ${students.length > 0 ? `/ 학생 ${students.length}명` : ''}
              </span>
              <span class="font-bold text-amber-400">총 ${totalPlayers}명 등록</span>
            </div>

            <!-- 선수 명단 요약 뱃지들 -->
            <div class="space-y-1.5">
              <span class="text-xs font-semibold text-slate-400 block">선수 로스터:</span>
              <div class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                ${(team.players || []).map(p => `
                  <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs ${p.role === 'teacher' ? 'bg-indigo-950/70 text-indigo-200 border border-indigo-700/50' : 'bg-amber-950/70 text-amber-200 border border-amber-700/50'}">
                    <span class="font-black text-amber-400 mr-1">#${p.number}</span>
                    <span>${p.name}</span>
                    <span class="text-[10px] ml-1 opacity-70">(${p.position})</span>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  openEditModal(teamId = null) {
    this.currentEditingTeamId = teamId;
    const modal = document.getElementById('teamModal');
    const modalTitle = document.getElementById('teamModalTitle');
    const form = document.getElementById('teamForm');
    if (!modal || !form) return;

    if (teamId) {
      modalTitle.innerText = "팀 및 9인제 선수 로스터 수정";
      const data = window.storageManager.loadData();
      const team = data.teams.find(t => t.id === teamId);
      if (team) {
        document.getElementById('teamNameInput').value = team.name;
        document.getElementById('schoolNameInput').value = team.school;
        document.getElementById('divisionSelect').value = team.division || 'male';
        document.getElementById('primaryColorInput').value = team.primaryColor || '#059669';
        document.getElementById('headTeacherInput').value = team.headTeacher || '';
        document.getElementById('captainStudentInput').value = team.captainStudent || '';
        this.renderPlayersTable(team.players || []);
      }
    } else {
      modalTitle.innerText = "신규 9인제 배구 팀 등록";
      form.reset();
      document.getElementById('primaryColorInput').value = '#2563eb';
      // 9인제 기본 엔트리 9명 템플릿 제공
      this.renderPlayersTable([
        { id: "new_1", name: "", number: 1, role: "teacher", position: "전위 좌(공격)", memo: "" },
        { id: "new_2", name: "", number: 2, role: "teacher", position: "전위 중(블로커)", memo: "" },
        { id: "new_3", name: "", number: 3, role: "teacher", position: "전위 우(공격)", memo: "" },
        { id: "new_4", name: "", number: 4, role: "teacher", position: "중위 좌(수비)", memo: "" },
        { id: "new_5", name: "", number: 5, role: "teacher", position: "세터(토스)", memo: "주장" },
        { id: "new_6", name: "", number: 6, role: "teacher", position: "중위 우(수비)", memo: "" },
        { id: "new_7", name: "", number: 7, role: "teacher", position: "후위 좌(수비)", memo: "" },
        { id: "new_8", name: "", number: 8, role: "teacher", position: "후위 중(백센터)", memo: "" },
        { id: "new_9", name: "", number: 9, role: "teacher", position: "후위 우(수비)", memo: "" }
      ]);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }

  closeModal() {
    const modal = document.getElementById('teamModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // 9인제 배구 포지션 셀렉트박스 옵션 생성기
  getPositionSelectOptions(selectedPos) {
    const positions = [
      "전위 좌(공격)",
      "전위 중(블로커)",
      "전위 우(공격)",
      "중위 좌(수비)",
      "세터(토스)",
      "중위 우(수비)",
      "후위 좌(수비)",
      "후위 중(백센터)",
      "후위 우(수비)",
      "후보(교체선수)"
    ];
    return positions.map(pos => `<option value="${pos}" ${selectedPos === pos ? 'selected' : ''}>${pos}</option>`).join('');
  }

  renderPlayersTable(players) {
    const tbody = document.getElementById('playersTableBody');
    if (!tbody) return;

    tbody.innerHTML = players.map((p, idx) => `
      <tr class="border-b border-slate-800 text-sm">
        <td class="py-2 px-2">
          <input type="number" value="${p.number}" min="1" max="99" class="player-number w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-amber-400 focus:outline-none focus:border-emerald-500" />
        </td>
        <td class="py-2 px-2">
          <input type="text" value="${p.name}" placeholder="선수명" class="player-name w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-emerald-500" />
        </td>
        <td class="py-2 px-2">
          <select class="player-role bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
            <option value="teacher" ${p.role === 'teacher' ? 'selected' : ''}>👨‍🏫 교직원</option>
            <option value="student" ${p.role === 'student' ? 'selected' : ''}>🧑‍🎓 학생</option>
          </select>
        </td>
        <td class="py-2 px-2">
          <select class="player-position bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
            ${this.getPositionSelectOptions(p.position)}
          </select>
        </td>
        <td class="py-2 px-2 text-center">
          <button type="button" onclick="teamsManager.removePlayerRow(this)" class="p-1 text-slate-400 hover:text-rose-400 transition" title="선수 삭제">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  addPlayerRow() {
    const tbody = document.getElementById('playersTableBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.className = "border-b border-slate-800 text-sm";
    row.innerHTML = `
      <td class="py-2 px-2">
        <input type="number" value="10" min="1" max="99" class="player-number w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-amber-400 focus:outline-none focus:border-emerald-500" />
      </td>
      <td class="py-2 px-2">
        <input type="text" placeholder="선수명" class="player-name w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-emerald-500" />
      </td>
      <td class="py-2 px-2">
        <select class="player-role bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="teacher">👨‍🏫 교직원</option>
          <option value="student">🧑‍🎓 학생</option>
        </select>
      </td>
      <td class="py-2 px-2">
        <select class="player-position bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
          ${this.getPositionSelectOptions("전위 좌(공격)")}
        </select>
      </td>
      <td class="py-2 px-2 text-center">
        <button type="button" onclick="teamsManager.removePlayerRow(this)" class="p-1 text-slate-400 hover:text-rose-400 transition" title="선수 삭제">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
    if (window.lucide) window.lucide.createIcons();
  }

  removePlayerRow(btn) {
    const tr = btn.closest('tr');
    if (tr) tr.remove();
  }

  saveTeamForm(e) {
    if (e) e.preventDefault();
    const data = window.storageManager.loadData();

    const name = document.getElementById('teamNameInput').value.trim();
    const school = document.getElementById('schoolNameInput').value.trim();
    const division = document.getElementById('divisionSelect').value;
    const primaryColor = document.getElementById('primaryColorInput').value;
    const headTeacher = document.getElementById('headTeacherInput').value.trim();
    const captainStudent = document.getElementById('captainStudentInput').value.trim();

    if (!name || !school) {
      alert("팀명과 소속을 모두 입력해주세요.");
      return;
    }

    const playerRows = document.querySelectorAll('#playersTableBody tr');
    const players = [];
    playerRows.forEach((row, idx) => {
      const pName = row.querySelector('.player-name')?.value.trim();
      const pNumber = parseInt(row.querySelector('.player-number')?.value, 10) || (idx + 1);
      const pRole = row.querySelector('.player-role')?.value || 'teacher';
      const pPosition = row.querySelector('.player-position')?.value || '전위 좌(공격)';

      if (pName) {
        players.push({
          id: `p-${Date.now()}-${idx}`,
          name: pName,
          number: pNumber,
          role: pRole,
          position: pPosition
        });
      }
    });

    if (this.currentEditingTeamId) {
      const teamIdx = data.teams.findIndex(t => t.id === this.currentEditingTeamId);
      if (teamIdx !== -1) {
        data.teams[teamIdx] = {
          ...data.teams[teamIdx],
          name,
          school,
          division,
          group: division === 'mixed' ? '사제동행' : (division === 'female' ? '여자부' : '남자부'),
          primaryColor,
          headTeacher,
          captainStudent,
          players
        };
      }
    } else {
      const newId = `team-${Date.now()}`;
      data.teams.push({
        id: newId,
        name,
        school,
        division,
        group: division === 'mixed' ? '사제동행' : (division === 'female' ? '여자부' : '남자부'),
        primaryColor,
        headTeacher,
        captainStudent,
        players
      });
    }

    window.storageManager.saveData(data);
    this.closeModal();
    this.renderTeamsList();
    if (window.app) window.app.updateAllViews();
  }

  deleteTeam(teamId) {
    if (!confirm("정말 이 팀을 삭제하시겠습니까?")) {
      return;
    }
    const data = window.storageManager.loadData();
    data.teams = data.teams.filter(t => t.id !== teamId);
    window.storageManager.saveData(data);
    this.renderTeamsList();
    if (window.app) window.app.updateAllViews();
  }
}

window.teamsManager = new TeamsManager();
