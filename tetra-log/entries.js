/* TETRA LOG 데이터 (작전 기록) — 작성법: _private/설명서.md 6장
   ※ 내용은 임시, 형식은 확정 */
window.LOG_CONFIG = {
  start: "2026-11-01",
  days: 14,
  warnAt: -75,
  personnel: 20
};

window.ENTRIES = [
  {
    date: "2026-11-01", unit: "TETRA-ALPHA-1", author: "JIWOO HAN", time: "08:10", temp: "-58°C",
    title: "전진기지 도착",
    body: `[상황]
- 08:10 보급선 하선 후 전진기지 도착. 보급선 즉시 귀환.
- 출입문 경첩 결빙. 개방에 20분 소요.

[조치]
- 기지 난방 가동.
- 전 대원 동상 여부 확인. 이상 없음.

[특이사항]
- 금일부터 14일간 일일 보고 실시.`
  },
  {
    date: "2026-11-01", unit: "TETRA-ALPHA-2", author: "DOYUN SEO", time: "09:00", temp: "-57°C",
    title: "통신 장비 설치",
    body: `[상황]
- 09:00 기지 통신 장비 설치. 본부 연결 불안정.

[조치]
- 안테나 위치 2회 변경. 약한 신호 수신 확인.`
  },
  {
    date: "2026-11-01", unit: "TETRA-ALPHA-3", author: "MINJAE KIM", time: "10:20", temp: "-57°C",
    title: "기지 점검",
    body: `[상황]
- 10:20 기지 외벽 균열 2곳 확인.

[조치]
- 단열재로 임시 보수 완료.`
  },
  {
    date: "2026-11-01", unit: "TETRA-ALPHA-4", author: "ERIK LINDQVIST", time: "11:40", temp: "-56°C",
    title: "주변 지형 정찰",
    body: `[상황]
- 11:40 기지 반경 500m 지형 정찰. 크레바스 의심 구역 1곳.

[조치]
- 깃발 3개로 위험 구역 표시.`
  },
  {
    date: "2026-11-01", unit: "TETRA-ALPHA-5", author: "SORA PARK", time: "13:00", temp: "-55°C",
    title: "대원 건강 점검",
    body: `[상황]
- 13:00 전 대원 건강 검진 실시.

[조치]
- 경미한 동상 2명. 처치 완료.`
  },
  {
    date: "2026-11-01", unit: "TETRA-BRAVO-1", author: "MARIE", time: "14:10", temp: "-55°C",
    title: "발전기 설치",
    body: `[상황]
- 14:10 주 발전기 및 예비 발전기 설치.

[조치]
- 시험 가동 결과 정상.`
  },
  {
    date: "2026-11-01", unit: "TETRA-BRAVO-2", author: "HYUNWOO LEE", time: "15:30", temp: "-56°C",
    title: "보급품 하역",
    body: `[상황]
- 15:30 보급품 48상자 하역.

[조치]
- 식량, 연료, 의약품 분리 보관.`
  },
  {
    date: "2026-11-01", unit: "TETRA-BRAVO-3", author: "NADIA PETROVA", time: "16:45", temp: "-57°C",
    title: "기상 관측 개시",
    body: `[상황]
- 16:45 기상 관측 장비 설치. 풍속 18m/s.

[조치]
- 3시간 간격 정기 관측 시작.`
  },
  {
    date: "2026-11-01", unit: "TETRA-BRAVO-4", author: "TAEHO JUNG", time: "18:00", temp: "-58°C",
    title: "설상차 점검",
    body: `[상황]
- 18:00 설상차 2대 점검. 2호차 시동 불량.

[조치]
- 배터리 보온 후 시동 성공.`
  },
  {
    date: "2026-11-01", unit: "TETRA-BRAVO-5", author: "YUNA CHOI", time: "20:30", temp: "-58°C",
    title: "수색 계획 수립",
    body: `[상황]
- 20:30 수색 구역 지도 작성. 총 8개 섹터.

[조치]
- 명일부터 4개 조로 분할 수색 실시.`
  },

  {
    date: "2026-11-02", unit: "TETRA-ALPHA-1", author: "JIWOO HAN", time: "07:00", temp: "-63°C",
    title: "섹터 A1 수색",
    body: `[상황]
- 07:00 A1 섹터 수색 개시.

[조치]
- 4시간 수색. 특이 흔적 없음.`
  },
  {
    date: "2026-11-02", unit: "TETRA-ALPHA-2", author: "DOYUN SEO", time: "22:30", temp: "-64°C",
    title: "급수 계획",
    body: `[상황]
- 융설 급수 시 연료 소모량 예상치 초과.

[조치]
- 1인 1일 급수량 2L로 제한.

[특이사항]
- 야간 풍속 증가. 기지 외벽 소음 지속.`
  },
  {
    date: "2026-11-02", unit: "TETRA-ALPHA-3", author: "MINJAE KIM", time: "11:30", temp: "-62°C",
    title: "섹터 A2 수색",
    body: `[상황]
- 11:30 A2 섹터에서 눈에 덮인 썰매 자국 발견.

[조치]
- 좌표 기록 및 사진 촬영.`
  },
  {
    date: "2026-11-02", unit: "TETRA-ALPHA-4", author: "ERIK LINDQVIST", time: "12:10", temp: "-61°C",
    title: "진입로 확보",
    body: `[상황]
- 12:10 A2 진입로에서 크레바스 확인.

[조치]
- 우회로 설정. 고정 로프 설치.`
  },
  {
    date: "2026-11-02", unit: "TETRA-ALPHA-5", author: "SORA PARK", time: "18:40", temp: "-65°C",
    title: "의무 보고",
    body: `[상황]
- 18:40 수색 복귀 대원 2명 저체온 초기 증상.

[조치]
- 재가온 처치 후 회복 확인.`
  },
  {
    date: "2026-11-02", unit: "TETRA-BRAVO-1", author: "MARIE", time: "08:20", temp: "-63°C",
    title: "발전기 상태",
    body: `[상황]
- 08:20 야간 연료 소모량 정상 범위.

[조치]
- 연료 라인 보온재 추가.`
  },
  {
    date: "2026-11-02", unit: "TETRA-BRAVO-2", author: "HYUNWOO LEE", time: "09:50", temp: "-62°C",
    title: "섹터 B1 수색",
    body: `[상황]
- 09:50 B1 섹터에서 텐트 잔해 1점 발견.

[조치]
- 회수 후 기지 보관.`
  },
  {
    date: "2026-11-02", unit: "TETRA-BRAVO-3", author: "NADIA PETROVA", time: "10:00", temp: "-62°C",
    title: "기상 보고",
    body: `[상황]
- 10:00 오후 풍속 25m/s 예상.

[조치]
- 전 조 15시 이전 복귀 권고.`
  },
  {
    date: "2026-11-02", unit: "TETRA-BRAVO-4", author: "TAEHO JUNG", time: "13:30", temp: "-60°C",
    title: "설상차 운행",
    body: `[상황]
- 13:30 설상차 1호 B2 섹터 운행 중 궤도 이탈.

[조치]
- 2시간 작업 후 복구.`
  },
  {
    date: "2026-11-02", unit: "TETRA-BRAVO-5", author: "YUNA CHOI", time: "21:00", temp: "-66°C",
    title: "일일 종합",
    body: `[상황]
- 21:00 8개 섹터 중 3개 수색 완료.

[조치]
- 명일 C, D 섹터 우선 수색.`
  },
  {
    date: "2026-11-02", unit: "TETRA-CHARLIE-1", author: "OLIVER GRANT", time: "08:00", temp: "-63°C",
    title: "섹터 C1 수색",
    body: `[상황]
- 08:00 C1 섹터 수색 개시. 시계 50m.

[조치]
- 대원 간 로프 연결 후 이동.`
  },
  {
    date: "2026-11-02", unit: "TETRA-CHARLIE-2", author: "SEOYEON KANG", time: "10:40", temp: "-62°C",
    title: "통신 중계",
    body: `[상황]
- 10:40 C 섹터 무전 음영 지역 확인.

[조치]
- 중계기 1대 설치.`
  },
  {
    date: "2026-11-02", unit: "TETRA-CHARLIE-3", author: "JUNHO YOON", time: "12:20", temp: "-61°C",
    title: "섹터 C2 수색",
    body: `[상황]
- 12:20 C2 섹터 금속 탐지기 반응 1회.

[조치]
- 발굴 결과 장비 파편. 좌표 기록.`
  },
  {
    date: "2026-11-02", unit: "TETRA-CHARLIE-4", author: "AIKO TANAKA", time: "14:50", temp: "-61°C",
    title: "장비 보고",
    body: `[상황]
- 14:50 고글 결빙 3건 보고.

[조치]
- 예비 고글 교체 지급.`
  },
  {
    date: "2026-11-02", unit: "TETRA-CHARLIE-5", author: "MAXIMILIAN ALEXANDER VAN DER BERG", time: "16:10", temp: "-63°C",
    title: "C조 복귀",
    body: `[상황]
- 16:10 C조 전원 기지 복귀.

[조치]
- 장비 해빙 및 건조.`
  },
  {
    date: "2026-11-02", unit: "TETRA-DELTA-1", author: "KAI NIELSEN", time: "07:30", temp: "-63°C",
    title: "섹터 D1 수색",
    body: `[상황]
- 07:30 D1 섹터 수색 개시. 빙원 표면 경화.

[조치]
- 아이젠 착용 후 이동.`
  },
  {
    date: "2026-11-02", unit: "TETRA-DELTA-2", author: "HAEUN LIM", time: "09:10", temp: "-62°C",
    title: "드론 정찰",
    body: `[상황]
- 09:10 드론 정찰 시도. 배터리 저온 방전.

[조치]
- 비행 12분 후 회수.

[특이사항]
- 배터리 보온 케이스 제작 필요.`
  },
  {
    date: "2026-11-02", unit: "TETRA-DELTA-3", author: "SUNGMIN CHO", time: "11:00", temp: "-62°C",
    title: "섹터 D2 수색",
    body: `[상황]
- 11:00 D2 섹터 눈 속 발자국 흔적 일부 확인.

[조치]
- 방향 측정. 북동쪽 이동 추정.`
  },
  {
    date: "2026-11-02", unit: "TETRA-DELTA-4", author: "LENA FISCHER", time: "15:20", temp: "-61°C",
    title: "행동식 배급",
    body: `[상황]
- 15:20 수색조 행동식 배급.

[조치]
- 1인 2,400kcal 기준 지급.`
  },
  {
    date: "2026-11-02", unit: "TETRA-DELTA-5", author: "JAEWON SHIN", time: "19:50", temp: "-65°C",
    title: "야간 경계",
    body: `[상황]
- 19:50 야간 경계 편성.

[조치]
- 2인 1조, 2시간 교대.`
  },

  {
    date: "2026-11-03", unit: "TETRA-BRAVO-1", author: "MARIE", time: "14:00", temp: "-67°C",
    title: "발전기 정지",
    body: `[상황]
- 14:00 발전기 2회 정지. 원인: 연료 라인 결빙.

[조치]
- 연료 라인 해빙 후 재가동 완료.

[특이사항]
- 정비 중 장갑 탈착 3분. 보고자 손끝 백화 발생.
- 온수 사용 금지, 체온 재가온 처치.`
  },
  {
    date: "2026-11-07", unit: "TETRA-ALPHA-1", author: "JIWOO HAN", time: "06:40", temp: "-79°C",
    title: "화이트아웃",
    body: `[상황]
- 06:40 화이트아웃 발생. 가시거리 2m 미만.

[조치]
- 전 대원 외부 수색 중지, 기지 대기.
- 무전기 배터리 체온 보온 조치.

[특이사항]
- 본부 통신 두절 지속.`
  },
  {
    date: "2026-11-07", unit: "TETRA-BRAVO-1", author: "MARIE", time: "13:15", temp: "-84°C",
    title: "보급 현황",
    body: `[상황]
- 13:15 잔여 식량 점검. 절약 배급 시 9일분.

[조치]
- 고열량 식품 비상용 별도 보관.
- 금일부터 배급량 20% 감축.`
  },
  {
    date: "2026-11-07", unit: "TETRA-ALPHA-2", author: "DOYUN SEO", time: "23:50", temp: "-88°C",
    title: "야간 경계",
    body: `[상황]
- 23:50 외기 -88°C. 작전 기간 중 최저 기온.

[조치]
- 난방 유지를 위해 2시간 교대 불침번 편성.

[특이사항]
- 전 대원 상태 이상 없음.`
  },
  {
    date: "2026-11-07", unit: "TETRA-CHARLIE-5", author: "MAXIMILIAN ALEXANDER VAN DER BERG", time: "19:20", temp: "-86°C",
    title: "장비 손상",
    body: `[상황]
- 19:20 수색용 썰매 활주부 균열 확인.

[조치]
- 테이프 3중 보강. 임시 사용 가능.

[특이사항]
- 고글 내부 결빙으로 시야 확보 곤란. 예비 고글 지급 요청.`
  },
  {
    date: "2026-11-14", unit: "TETRA-ALPHA-2", author: "DOYUN SEO", time: "09:00", temp: "-61°C",
    title: "통신 복구",
    body: `[상황]
- 09:00 본부 무전 수신. 통신 두절 14일 만에 복구.

[조치]
- 현 위치 및 대원 상태 보고 완료.

[특이사항]
- 풍속 감소, 시계 양호.`
  },
  {
    date: "2026-11-14", unit: "TETRA-ALPHA-1", author: "JIWOO HAN", time: "17:30", temp: "-59°C",
    title: "작전 종료",
    body: `[상황]
- 17:30 회수 헬기 도착.

[조치]
- 전 대원 탑승 완료. 기록 장비 회수.

[특이사항]
- 일일 보고 14일분 제출 완료. 작전 종료.`
  }
];
