/* TETRA SECTOR 데이터 (구역 지도) — 작성법: _private/설명서.md 5장
   ※ 내용은 임시, 형식은 확정
   - SECTOR 페이지와 HUB 메뉴 요약(DANGER 수)이 이 파일을 읽는다
   - 주소: tetra-sector/#A1

   구역 필드
     code   섹터 코드 A1~D2 (기록지 LOG 의 '섹터 A1' 과 같은 체계)
     place  지도 구역 이름 — 지도(index.html)의 data-z 와 똑같이 써야 지도에서 선택된다
     st     CL 수색 완료 / SE 수색 중 / UN 미수색 / DG 위험      pct  수색률(%)
     last   LAST RECORD 날짜 'YYYY-MM-DD' (요일은 화면에서 자동, 링크 없음)
     rel    RELATED — CODEX 항목 ['CDX-003', …] (CODEX 로 링크)
     s      본문 [[태그, 내용], …]
     landmark:true → 지형지물 (수색 구역 아님: st·pct 생략, 상세에서 SEARCHED 숨김, 집계에서 빠짐) */
window.SECTOR_DATA = [
  {code:"A1",place:"ICE RIDGE",st:"DG",pct:55,last:"2026-11-02",rel:["CDX-003"],
   s:[["상황","능선 일대에서 열원 없는 이동체 접촉."],["조치","단독 접근 금지. 2인 1조 이동."]]},
  {code:"A2",place:"SNOWFIELD",st:"SE",pct:62,last:"2026-11-02",rel:["CDX-009"],
   s:[["상황","눈에 덮인 썰매 자국 발견. 진입로에 크레바스."],["조치","우회로 설정, 고정 로프 설치."]]},
  {code:"B1",place:"CAMP 2",st:"CL",pct:100,last:"2026-11-02",rel:["CDX-028","CDX-034"],
   s:[["상황","캠프 2 일대 수색 완료. 텐트 잔해 회수."],["조치","거점으로 유지. 야간 경계 2인."]]},
  {code:"B2",place:"LAKE BED",st:"SE",pct:48,last:"2026-11-02",rel:["CDX-012"],
   s:[["상황","호수 바닥 북측 수색 중. 설상차 궤도 이탈 1회."],["조치","빙판 균열음 발생 시 진입 중지."]]},
  {code:"C1",place:"RELAY B",st:"CL",pct:100,last:"2026-11-02",rel:["CDX-007"],
   s:[["상황","무전 음영 지역에 중계기 설치. 중계소 B 운용."],["조치","교신 재개. 모방 신호 주의."]]},
  {code:"C2",place:"WRECK",st:"CL",pct:100,last:"2026-11-02",rel:["CDX-023"],
   s:[["상황","잔해 구역 수색 완료. 금속 탐지 반응 지점에서 장비 파편 발굴."],["조치","좌표 기록. 접근 시 거리 유지."]]},
  {code:"D1",place:"TUNNEL",st:"DG",pct:30,last:"2026-11-02",rel:["CDX-018"],
   s:[["상황","터널 하부 수색 중단. 주기적 기압 변화 발생."],["조치","산소 잔량 점검 필수. 로프 연결 후 진입."]]},
  {code:"D2",place:"UNKNOWN",st:"SE",pct:20,last:"2026-11-02",rel:[],
   s:[["상황","눈 속 발자국 흔적 일부 확인."],["조치","방향 측정. 북동쪽 이동 추정."]]},

  // 지형지물 (landmark:true) — 수색 구역이 아니라서 st·pct 없음. 구역 수·평균 수색률·HUB 요약에서 빠짐
  {code:"RS",place:"RESEARCH STATION",landmark:true,last:"",rel:[],
   s:[["개요","지도 중앙의 연구소. 레이더 파동의 송신원."],["특이사항","상세 미정."]]}
];
