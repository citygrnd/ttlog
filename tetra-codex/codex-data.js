/* TETRA CODEX 데이터 (이상 기록) — 작성법: _private/설명서.md 8장
   ※ 내용은 임시, 형식은 확정
   - CODEX 페이지와 HUB 메뉴 요약(LOCKED 수)이 이 파일을 읽는다
   - 항목 순서는 자유 (code 순으로 자동 정렬). 주소: tetra-codex/#CDX-003

   항목 필드
     code   번호 (CDX-003 의 3)
     name   영문 이름 (목록·파일명)          title  한글 제목
     by     기록자 'TETRA-조-번호 이름'
     loc    장소
     date   'YYYY-MM-DD'  time 'HH:MM'     요일은 화면에서 날짜로 자동 계산
     img    이미지 경로 'img/cdx-007.png' (파일은 tetra-codex/img/, 비우면 NO IMAGE), alt 이미지 설명
     s      본문 [[태그, 내용], …]
     locked:true → 미열람 (목록에만 표시, 열람 불가. code 만 있으면 됨) */
window.CODEX_DATA = [
  {code:3,name:"WHITE STALKER",img:"",alt:"눈보라 속 흰 형체",by:"TETRA-ALPHA-1 JIWOO HAN",loc:"SECTOR 7 / ICE RIDGE",date:"2026-11-03",time:"21:40",
   title:"화이트 스토커",s:[["특징","눈보라 속에서 열원 없이 이동하는 개체. 시야 확보 불가 구간에서만 접촉됨."],["대응","단독 접근 금지. 2인 1조 이동, 조명탄 상시 휴대."],["특이사항","접촉 후 3시간 내 통신 불능 사례 2건."]]},
  {code:5,locked:true},
  {code:7,name:"FROST MIMIC",img:"",alt:"",by:"TETRA-BRAVO-2 HYUNWOO LEE",loc:"RELAY STATION B",date:"2026-11-05",time:"02:15",
   title:"프로스트 미믹",s:[["특징","무선 통신 음성을 모방하는 개체. 대원 호출 신호와 구분이 어려움."],["대응","응답 요청에는 응하지 말 것. 코드워드 확인 후 교신."],["특이사항","모방 지속 시간 평균 11분."]]},
  {code:9,name:"PALE HOUND",img:"",alt:"",by:"TETRA-ALPHA-3 MINJAE KIM",loc:"SECTOR 2 / SNOWFIELD",date:"2026-11-08",time:"15:05",
   title:"페일 하운드",s:[["특징","흰 털로 눈밭에 은폐하는 소형 개체. 무리 단위로 이동."],["대응","정지 상태 유지 시 접근하지 않음. 급한 움직임 금지."],["특이사항","소음에 반응하지 않음."]]},
  {code:12,name:"CRACKLE FIELD",img:"",alt:"",by:"TETRA-ALPHA-2 DOYUN SEO",loc:"LAKE BED / NORTH",date:"2026-11-07",time:"09:20",
   title:"크랙클 필드",s:[["상황","빙판 전체에 균열음이 번지는 현상."],["조치","발생 후 약 8분간 진입 금지."],["특이사항","발생 직전 기온이 2도 상승."]]},
  {code:15,locked:true},
  {code:18,name:"DEEP BREATH",img:"",alt:"",by:"TETRA-ALPHA-1 JIWOO HAN",loc:"TUNNEL / LOWER",date:"2026-11-12",time:"04:50",
   title:"딥 브레스",s:[["상황","터널 하부에서 주기적으로 공기가 빨려 들어가는 현상."],["조치","산소 잔량 점검 필수. 하부 진입 시 로프 연결."],["특이사항","주기는 약 40분."]]},
  {code:23,name:"HEAT BEACON",img:"",alt:"",by:"TETRA-CHARLIE-1 OLIVER GRANT",loc:"SECTOR 3 / WRECK",date:"2026-11-09",time:"13:30",
   title:"히트 비콘",s:[["특징","발열 신호를 내는 금속 구조물. 구조 신호로 오인하기 쉬움."],["대응","회수 보류. 좌표만 기록."],["특이사항","표면 온도 일정하게 31도."]]},
  {code:26,locked:true},
  {code:28,name:"SUPPLY CRATE 9",img:"",alt:"",by:"TETRA-BRAVO-1 MARIE",loc:"CAMP 2",date:"2026-11-10",time:"10:10",
   title:"보급 상자 9호",s:[["특징","식량과 연료가 봉인된 상태로 발견됨."],["대응","전량 캠프 2 보관 완료."],["특이사항","봉인 날짜가 작전 개시 이전."]]},
  {code:34,name:"SNOW LEDGER",img:"",alt:"",by:"TETRA-BRAVO-5 YUNA CHOI",loc:"CAMP 2",date:"2026-11-14",time:"17:30",
   title:"스노 레저",s:[["상황","눈 속에서 발견된 수기 기록. 날짜가 실제보다 앞서 있음."],["조치","원본은 보관함 4번에 격리."],["특이사항","필적 대조 결과 대원 중 일치자 없음."]]},
  {code:38,locked:true}
];
