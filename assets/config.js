/* TETRA 사이트 설정
   - OP_START: 작전 경과시간(T+)을 0부터 재기 시작하는 기준 날짜·시각 (한국 시간 +09:00)
     HUB 상단 OPERATION 의 T+ 가 이 시각부터 누적 시간(HH:MM:SS)으로 올라가고 OP_DAYS 일(14일 = 336:00:00)에서 멈춘다.
     이 시각 전에는 0 으로 표시
   - OP_DAYS: 작전 일수. DAY 와 T+ 모두 여기까지만 센다
     DAY 는 시간이 아니라 한국 날짜 기준: 시작한 날 = DAY 01, 다음 날 = DAY 02 … DAY 14 에서 멈춤 (시작 전 DAY 00)
   - VITALS: 체력현황(status-board)과 HUB 요약이 함께 쓰는 설정
     API_URL 은 Apps Script 웹앱 주소(…/exec)만. 구글 시트 주소·ID 는 절대 여기에 넣지 않는다 (Code.gs 스크립트 속성에만)
*/
window.TETRA_CONFIG = Object.freeze({
  // ※ OP_START · OP_DAYS 는 작업용 임시값. 작업 완료 후 실제 값으로 바꾼다
  OP_START: '2026-11-19T21:00:00+09:00',
  OP_DAYS: 14,

  VITALS: Object.freeze({
    API_URL: 'https://script.google.com/macros/s/AKfycbzHDNJ2ydEX6RzDKE1VChC8Xfyl_5yTDdquj0nj8xltgz4VUSvNtEmw-ZaQdubFVIrQ/exec',
    TITLE: 'TETRA VITALS',
    REFRESH_SEC: 10,      // 갱신 주기(초, 최소 3)
    DEFAULT_MAX_HP: 100,  // 최대치 열이 없을 때
    DEFAULT_MAX_SP: 100,
    DANGER_PCT: 25,       // 이 % 이하면 WARN / CRIT
    SEGMENTS: 20          // 막대 칸 수
  })
});
