/**
 * 2026 양평 사제동행 배구대회 - 데이터 스토리지 & 기본 데이터 관리
 * (9인제 배구 포지션 기준 & 0:0 대기 상태)
 */

const STORAGE_KEY = 'YANGPYEONG_VB_DATA_2026_V4';
const BROADCAST_CHANNEL_NAME = 'yangpyeong_vb_scoreboard_channel';

// 9인제 배구 표준 포지션:
// 전위 좌(하포/공격), 전위 중(블로커), 전위 우(상포/공격),
// 중위 좌(중위 레프트), 중위 중(세터/배급), 중위 우(중위 라이트),
// 후위 좌(백 레프트), 후위 중(백 센터), 후위 우(백 라이트)

const DEFAULT_DATA = {
  settings: {
    tournamentName: "2026 양평 사제동행 배구대회",
    subTitle: "Yangpyeong Teacher-Student Volleyball League 2026 (9-Man System)",
    venue: "양평 물맑은체육관 메인코트",
    date: "2026년 10월 24일 (토)",
    courtCount: 1,
    maxSets: 3,           // 3세트 2선승제
    setPoints: 21,        // 9인제 배구 21점제 (또는 25점제 설정 가능)
    finalSetPoints: 15,   // 마지막 세트 15점
    deuceMargin: 2,       // 2점 차이 듀스
    maxTimeouts: 2,       // 세트당 타임아웃 2회
    timeoutDuration: 30,  // 타임아웃 30초
    specialRules: "9인제 배구 규정 적용 (로테이션 고정 / 전위·중위·후위 9인 포지션)"
  },
  teams: [
    // 1. 사제동행 부문 (교직원 연합팀 vs 학생 팀) - 9인제 포지션 적용
    {
      id: "team-staff-all",
      name: "교직원 연합팀",
      division: "mixed",
      school: "양평 관내 교직원 연합",
      group: "사제동행",
      primaryColor: "#059669",
      secondaryColor: "#10b981",
      headTeacher: "김철수 (단장)",
      captainStudent: "-",
      contact: "010-1111-2222",
      players: [
        { id: "sp1", name: "김철수", number: 1, role: "teacher", position: "전위 좌(공격)", memo: "체육부장" },
        { id: "sp2", name: "한상우", number: 3, role: "teacher", position: "전위 중(블로커)", memo: "사회교사" },
        { id: "sp3", name: "박성진", number: 5, role: "teacher", position: "전위 우(공격)", memo: "과학교사" },
        { id: "sp4", name: "장동건", number: 9, role: "teacher", position: "중위 좌(수비)", memo: "미술교사" },
        { id: "sp5", name: "이민호", number: 7, role: "teacher", position: "세터(토스)", memo: "수학교사" },
        { id: "sp6", name: "정재훈", number: 11, role: "teacher", position: "중위 우(수비)", memo: "영어교사" },
        { id: "sp7", name: "고명환", number: 14, role: "teacher", position: "후위 좌(수비)", memo: "음악교사" },
        { id: "sp8", name: "유재석", number: 6, role: "teacher", position: "후위 중(백센터)", memo: "연구부장" },
        { id: "sp9", name: "조재현", number: 2, role: "teacher", position: "후위 우(수비)", memo: "체육교사" }
      ]
    },
    {
      id: "team-student-all",
      name: "학생 팀",
      division: "mixed",
      school: "양평 연합 학생대표",
      group: "사제동행",
      primaryColor: "#f59e0b",
      secondaryColor: "#d97706",
      headTeacher: "-",
      captainStudent: "박민우 (3학년 주장)",
      contact: "010-3333-4444",
      players: [
        { id: "stp1", name: "박민우", number: 10, role: "student", position: "전위 좌(공격)", memo: "3학년(주장)" },
        { id: "stp2", name: "송지호", number: 13, role: "student", position: "전위 중(블로커)", memo: "3학년" },
        { id: "stp3", name: "최준혁", number: 8, role: "student", position: "전위 우(공격)", memo: "3학년" },
        { id: "stp4", name: "배진호", number: 6, role: "student", position: "중위 좌(수비)", memo: "2학년" },
        { id: "stp5", name: "강도현", number: 7, role: "student", position: "세터(토스)", memo: "2학년" },
        { id: "stp6", name: "김도현", number: 12, role: "student", position: "중위 우(수비)", memo: "1학년" },
        { id: "stp7", name: "윤태양", number: 4, role: "student", position: "후위 좌(수비)", memo: "2학년" },
        { id: "stp8", name: "임서준", number: 2, role: "student", position: "후위 중(백센터)", memo: "1학년" },
        { id: "stp9", name: "정태양", number: 5, role: "student", position: "후위 우(수비)", memo: "1학년" }
      ]
    },

    // 2. 여자부 부문 (9인제 포지션)
    {
      id: "team-female-1",
      name: "여교직원 1팀",
      division: "female",
      school: "양평 여교직원 배구단 A",
      group: "여자부",
      primaryColor: "#ec4899",
      secondaryColor: "#f43f5e",
      headTeacher: "이영희 (팀장)",
      captainStudent: "-",
      contact: "010-5555-6666",
      players: [
        { id: "fp1", name: "이영희", number: 2, role: "teacher", position: "전위 좌(공격)", memo: "체육교사(주장)" },
        { id: "fp2", name: "한지민", number: 7, role: "teacher", position: "전위 중(블로커)", memo: "국어교사" },
        { id: "fp3", name: "김민서", number: 9, role: "teacher", position: "전위 우(공격)", memo: "보건교사" },
        { id: "fp4", name: "신봉선", number: 5, role: "teacher", position: "중위 좌(수비)", memo: "영어교사" },
        { id: "fp5", name: "오현주", number: 4, role: "teacher", position: "세터(토스)", memo: "음악교사" },
        { id: "fp6", name: "송은이", number: 11, role: "teacher", position: "중위 우(수비)", memo: "행정실" },
        { id: "fp7", name: "김신영", number: 8, role: "teacher", position: "후위 좌(수비)", memo: "사회교사" },
        { id: "fp8", name: "안영미", number: 1, role: "teacher", position: "후위 중(백센터)", memo: "과학교사" },
        { id: "fp9", name: "정경미", number: 10, role: "teacher", position: "후위 우(수비)", memo: "상담교사" }
      ]
    },
    {
      id: "team-female-2",
      name: "여교직원 2팀",
      division: "female",
      school: "양평 여교직원 배구단 B",
      group: "여자부",
      primaryColor: "#8b5cf6",
      secondaryColor: "#a855f7",
      headTeacher: "박선영 (팀장)",
      captainStudent: "-",
      contact: "010-7777-8888",
      players: [
        { id: "fp10", name: "정은지", number: 6, role: "teacher", position: "전위 좌(공격)", memo: "체육교사" },
        { id: "fp11", name: "장도연", number: 12, role: "teacher", position: "전위 중(블로커)", memo: "사회교사" },
        { id: "fp12", name: "박나래", number: 10, role: "teacher", position: "전위 우(공격)", memo: "가정교사" },
        { id: "fp13", name: "홍진경", number: 1, role: "teacher", position: "중위 좌(수비)", memo: "상담교사" },
        { id: "fp14", name: "박선영", number: 3, role: "teacher", position: "세터(토스)", memo: "수학교사(주장)" },
        { id: "fp15", name: "이국주", number: 15, role: "teacher", position: "중위 우(수비)", memo: "영양교사" },
        { id: "fp16", name: "김숙", number: 5, role: "teacher", position: "후위 좌(수비)", memo: "도덕교사" },
        { id: "fp17", name: "김지민", number: 8, role: "teacher", position: "후위 중(백센터)", memo: "음악교사" },
        { id: "fp18", name: "허안나", number: 4, role: "teacher", position: "후위 우(수비)", memo: "미술교사" }
      ]
    },

    // 3. 남자부 부문 (남교직원 1팀, 2팀, 3팀) - 9인제 포지션
    {
      id: "team-male-1",
      name: "남교직원 1팀",
      division: "male",
      school: "양평 남교직원 1조",
      group: "남자부",
      primaryColor: "#2563eb",
      secondaryColor: "#1d4ed8",
      headTeacher: "조재현 (주장)",
      captainStudent: "-",
      contact: "010-9999-0001",
      players: [
        { id: "mp1", name: "조재현", number: 5, role: "teacher", position: "전위 좌(공격)", memo: "체육부장(주장)" },
        { id: "mp2", name: "강호동", number: 10, role: "teacher", position: "전위 중(블로커)", memo: "학생부장" },
        { id: "mp3", name: "서장훈", number: 15, role: "teacher", position: "전위 우(공격)", memo: "교무부장" },
        { id: "mp4", name: "김희철", number: 8, role: "teacher", position: "중위 좌(수비)", memo: "1학년부장" },
        { id: "mp5", name: "이수근", number: 3, role: "teacher", position: "세터(토스)", memo: "진로부장" },
        { id: "mp6", name: "민경훈", number: 7, role: "teacher", position: "중위 우(수비)", memo: "정보부장" },
        { id: "mp7", name: "이상민", number: 2, role: "teacher", position: "후위 좌(수비)", memo: "총무부장" },
        { id: "mp8", name: "김영철", number: 4, role: "teacher", position: "후위 중(백센터)", memo: "영어교사" },
        { id: "mp9", name: "신동엽", number: 9, role: "teacher", position: "후위 우(수비)", memo: "국어교사" }
      ]
    },
    {
      id: "team-male-2",
      name: "남교직원 2팀",
      division: "male",
      school: "양평 남교직원 2조",
      group: "남자부",
      primaryColor: "#0284c7",
      secondaryColor: "#0369a1",
      headTeacher: "유재석 (주장)",
      captainStudent: "-",
      contact: "010-9999-0002",
      players: [
        { id: "mp10", name: "하동훈", number: 4, role: "teacher", position: "전위 좌(공격)", memo: "음악교사" },
        { id: "mp11", name: "양세찬", number: 11, role: "teacher", position: "전위 중(블로커)", memo: "윤리교사" },
        { id: "mp12", name: "김종국", number: 9, role: "teacher", position: "전위 우(공격)", memo: "체육교사" },
        { id: "mp13", name: "지석진", number: 1, role: "teacher", position: "중위 좌(수비)", memo: "역사교사" },
        { id: "mp14", name: "유재석", number: 6, role: "teacher", position: "세터(토스)", memo: "연구부장(주장)" },
        { id: "mp15", name: "송지효", number: 14, role: "teacher", position: "중위 우(수비)", memo: "국어교사" },
        { id: "mp16", name: "이광수", number: 13, role: "teacher", position: "후위 좌(수비)", memo: "생물교사" },
        { id: "mp17", name: "전소민", number: 8, role: "teacher", position: "후위 중(백센터)", memo: "문학교사" },
        { id: "mp18", name: "개리", number: 7, role: "teacher", position: "후위 우(수비)", memo: "체육교사" }
      ]
    },
    {
      id: "team-male-3",
      name: "남교직원 3팀",
      division: "male",
      school: "양평 남교직원 3조",
      group: "남자부",
      primaryColor: "#ea580c",
      secondaryColor: "#c2410c",
      headTeacher: "전현무 (주장)",
      captainStudent: "-",
      contact: "010-9999-0003",
      players: [
        { id: "mp19", name: "이시언", number: 2, role: "teacher", position: "전위 좌(공격)", memo: "체육교사" },
        { id: "mp20", name: "성훈", number: 13, role: "teacher", position: "전위 중(블로커)", memo: "수영교사" },
        { id: "mp21", name: "기안팔사", number: 8, role: "teacher", position: "전위 우(공격)", memo: "미술교사" },
        { id: "mp22", name: "박나래", number: 5, role: "teacher", position: "중위 좌(수비)", memo: "생활지도" },
        { id: "mp23", name: "전현무", number: 7, role: "teacher", position: "세터(토스)", memo: "기획부장(주장)" },
        { id: "mp24", name: "코드쿤스트", number: 10, role: "teacher", position: "중위 우(수비)", memo: "물리교사" },
        { id: "mp25", name: "헨리", number: 1, role: "teacher", position: "후위 좌(수비)", memo: "원어민교사" },
        { id: "mp26", name: "화사", number: 6, role: "teacher", position: "후위 중(백센터)", memo: "보컬교사" },
        { id: "mp27", name: "키", number: 11, role: "teacher", position: "후위 우(수비)", memo: "패션동아리" }
      ]
    }
  ],
  matches: [
    {
      id: "match-1",
      round: "사제동행 특별 매치 🌟",
      division: "mixed",
      court: "물맑은 메인코트",
      time: "15:30",
      homeTeamId: "team-staff-all",
      awayTeamId: "team-student-all",
      status: "ready",
      homeSetsWon: 0,
      awaySetsWon: 0,
      sets: [],
      currentSet: 1,
      currentPoints: { home: 0, away: 0 },
      server: "home",
      timeouts: { home: 0, away: 0 }
    },
    {
      id: "match-2",
      round: "여자부 리그전 🌸",
      division: "female",
      court: "물맑은 메인코트",
      time: "16:10",
      homeTeamId: "team-female-1",
      awayTeamId: "team-female-2",
      status: "ready",
      homeSetsWon: 0,
      awaySetsWon: 0,
      sets: [],
      currentSet: 1,
      currentPoints: { home: 0, away: 0 },
      server: "home",
      timeouts: { home: 0, away: 0 }
    },
    {
      id: "match-3",
      round: "남자부 리그 1경기 🔥",
      division: "male",
      court: "물맑은 메인코트",
      time: "17:00",
      homeTeamId: "team-male-1",
      awayTeamId: "team-male-2",
      status: "ready",
      homeSetsWon: 0,
      awaySetsWon: 0,
      sets: [],
      currentSet: 1,
      currentPoints: { home: 0, away: 0 },
      server: "home",
      timeouts: { home: 0, away: 0 }
    },
    {
      id: "match-4",
      round: "남자부 리그 2경기 🔥",
      division: "male",
      court: "물맑은 메인코트",
      time: "17:40",
      homeTeamId: "team-male-3",
      awayTeamId: "team-male-1",
      status: "ready",
      homeSetsWon: 0,
      awaySetsWon: 0,
      sets: [],
      currentSet: 1,
      currentPoints: { home: 0, away: 0 },
      server: "home",
      timeouts: { home: 0, away: 0 }
    },
    {
      id: "match-5",
      round: "남자부 리그 3경기 (최종전) 🏆",
      division: "male",
      court: "물맑은 메인코트",
      time: "18:20",
      homeTeamId: "team-male-2",
      awayTeamId: "team-male-3",
      status: "ready",
      homeSetsWon: 0,
      awaySetsWon: 0,
      sets: [],
      currentSet: 1,
      currentPoints: { home: 0, away: 0 },
      server: "home",
      timeouts: { home: 0, away: 0 }
    }
  ],
  activeMatchId: "match-3"
};

class StorageManager {
  constructor() {
    this.broadcastChannel = null;
    try {
      if (window.BroadcastChannel) {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported", e);
    }
  }

  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveData(DEFAULT_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error("데이터 로드 실패, 기본값으로 복구합니다.", e);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.broadcast('DATA_UPDATED', data);
    } catch (e) {
      console.error("데이터 저장 실패", e);
    }
  }

  broadcast(type, payload) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }

  onBroadcast(callback) {
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        if (event.data) {
          callback(event.data);
        }
      };
    }
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          callback({ type: 'DATA_UPDATED', payload: JSON.parse(e.newValue), timestamp: Date.now() });
        } catch(err) {}
      }
    });
  }

  resetToDefault() {
    this.saveData(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  exportToJson() {
    const data = this.loadData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `양평사제동행배구_9인제백업_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importFromJson(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.teams && importedData.matches && importedData.settings) {
          this.saveData(importedData);
          if (callback) callback(true, "성공적으로 데이터를 복원했습니다!");
        } else {
          if (callback) callback(false, "유효한 양평 배구대회 데이터 파일 형식이 아닙니다.");
        }
      } catch (err) {
        if (callback) callback(false, "JSON 파싱 오류: 올바른 파일인지 확인해주세요.");
      }
    };
    reader.readAsText(file);
  }
}

window.storageManager = new StorageManager();
