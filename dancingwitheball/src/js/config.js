// =====================================================================
//  ★ 게임 설정 — 난이도나 판 크기를 바꾸려면 이 파일만 고치면 돼요.
//  고친 뒤: 저장 → 브라우저 새로고침(F5) → 게임 안의 ↺새로 버튼 두 번
// =====================================================================

// ----- 게임 버전 (패치할 때마다 올려 주세요. 화면 오른쪽 아래에 표시) -----
//   예: 버그 수정 1.1.0 → 1.1.1 / 기능 추가 1.1.1 → 1.2.0
const GAME_VERSION = '1.1.1';

// ----- 부활 -----
const REVIVES_PER_GAME = 1;    // 한 게임에서 부활할 수 있는 횟수
const REVIVE_CLEAR_ROWS = 3;   // 부활하면 사라지는 아래쪽 줄 수 (넘친 벽돌 포함)

// ----- 판 크기 (화면 안의 가상 좌표, 실제 화면 크기와는 무관) -----
const COLS = 6;          // 가로 칸 수
const CELL = 100;        // 한 칸 크기
const W = COLS * CELL;   // 판 너비 (자동 계산)
const H = 1000;          // 판 높이
const ROWS = 9;          // 벽돌이 이 줄 번호에 닿으면 게임 오버 (클수록 오래 버팀, 8~9 추천)
const FLOOR = 960;       // 바닥 위치
const GAP = 6;           // 벽돌 사이 간격

// ----- 공 -----
const R = 11;                          // 공 반지름
const SPEED = 17;                      // 공 속도
const FIRE_GAP = 4.5;                  // 공 발사 간격 (프레임, 작을수록 촘촘히 발사)
const MIN_ANGLE = 8 * Math.PI / 180;   // 최소 발사 각도 (수평으로 무한히 튕기는 것 방지)
const AUTO_FAST_AFTER = 600;           // 한 턴이 이 프레임(60 = 1초)을 넘으면 자동 가속
const AUTO_FAST_MULT = 1.6;            // 자동 가속 배율

// ----- 공 개수 -----
const START_BALLS = 1;        // 처음 공 개수
const BALLS_PER_PICKUP = 1;   // 초록 링(아이템) 하나당 늘어나는 공

// ----- 벽돌 체력 -----
// 지금: 체력 = 스테이지 숫자 (1스테이지 1, 2스테이지 2, ...)
function brickHP(level) {
  return level;
}

// ----- 한 줄에 나오는 벽돌 수 -----
// 한 줄 최대 = 가로 칸 수 - 1 (한 칸은 아이템 자리). 6칸 판이면 최대 5개.
//
// '최대 개수(5개) 줄'이 나올 확률 — 위에서부터 순서대로 확인해요.
//   after: 이 스테이지보다 크면 / chance: 확률 (0.4 = 40%)
const FULL_ROW_CHANCE = [
  { after: 1000, chance: 0.50 },   // 1001 스테이지 ~   : 50%
  { after: 500,  chance: 0.45 },   //  501 ~ 1000       : 45%
  { after: 100,  chance: 0.40 },   //  101 ~ 500        : 40%
  { after: 5,    chance: 0.278 },  //    6 ~ 100        : 약 28% (5스테이지와 같음)
];
// 1~5 스테이지는 처음 설정 그대로 (약 19% → 28%로 점점 증가)
//
// 최대 개수가 아닐 때 2개 : 3개 : 4개 비율
const OTHER_ROW_WEIGHTS = { 2: 1, 3: 6, 4: 6 };

function brickCount(level) {
  const MAX = COLS - 1;
  if (level <= 5) return Math.max(1, Math.min(MAX, Math.round(2 + Math.random() * 3 + level / 15)));

  const tier = FULL_ROW_CHANCE.find(t => level > t.after);
  if (Math.random() < tier.chance) return MAX;

  const total = Object.values(OTHER_ROW_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [count, weight] of Object.entries(OTHER_ROW_WEIGHTS)) {
    if (r < weight) return Math.min(MAX, Number(count));
    r -= weight;
  }
  return MAX - 1;
}

// ----- 저장 이름 (브라우저에 저장되는 키) -----
const SAVE_KEYS = {
  best: 'bb_best',    // 최고 기록
  save: 'bb_save',    // 이어하기
  sound: 'bb_sound',  // 소리 켜짐/꺼짐
  mode: 'bb_mode',    // 조준 방식
};
