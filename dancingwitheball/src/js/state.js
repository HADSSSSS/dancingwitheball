// ===== 게임 상태 =====
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const $ = id => document.getElementById(id);

let bricks;        // 판 위의 벽돌과 아이템 [{type:'brick'|'pickup', c:열, r:행, hp, max, ...}]
let balls;         // 날아가는 공
let particles;     // 벽돌 깨질 때 파편
let level;         // 현재 스테이지
let ballCount;     // 가진 공 개수
let pendingBalls;  // 이번 턴에 먹은 아이템 수 (턴 끝나면 공에 더해짐)
let launchX;       // 발사 위치
let landedX;       // 이번 턴에 처음 바닥에 닿은 공 위치 (다음 발사 위치)

let state;         // 'aim'(조준 중) | 'run'(공 날아가는 중) | 'over'(게임 오버)
let fired, fireTimer, runTime;
let fastOn = false;                                  // 2배속 버튼
let aimMode = store.get(SAVE_KEYS.mode, 'swipe');    // 'swipe'(밀기) | 'sling'(새총)
let best = store.get(SAVE_KEYS.best, 1);
let revivesLeft = REVIVES_PER_GAME; // 남은 부활 횟수
let aim = null;    // 조준 정보 (마우스: {sx,sy,dx,dy} / 키보드: {kb:true, angle})

// ----- 새 게임 -----
function reset() {
  bricks = []; balls = []; particles = [];
  level = 1; ballCount = START_BALLS; pendingBalls = 0;
  launchX = W / 2; landedX = null;
  revivesLeft = REVIVES_PER_GAME;
  state = 'aim';
  spawnRow();
  bricks.forEach(b => b.dy = b.r * CELL);
  $('over').classList.remove('show');
  updateHud();
  saveGame();
}

// ----- 자동 저장: 조준 단계마다 저장 → 창을 닫아도 이어하기 -----
function saveGame() {
  if (state !== 'aim') return;
  store.set(SAVE_KEYS.save, {
    level, ballCount, launchX, revivesLeft,
    bricks: bricks.map(b => b.type === 'brick'
      ? { type: 'brick', c: b.c, r: b.r, hp: b.hp, max: b.max }
      : { type: 'pickup', c: b.c, r: b.r }),
  });
}

function loadGame() {
  const d = store.get(SAVE_KEYS.save, null);
  if (!d || !Array.isArray(d.bricks) || !d.level) return false;
  if (d.bricks.some(b => b.c >= COLS) || d.launchX > W) return false; // 판 크기가 바뀐 예전 저장은 무시
  bricks = d.bricks.map(b => ({ ...b, dy: b.r * CELL, flash: 0, pulse: Math.random() * 6 }));
  balls = []; particles = [];
  level = d.level; ballCount = d.ballCount; pendingBalls = 0;
  launchX = d.launchX; landedX = null; state = 'aim';
  revivesLeft = d.revivesLeft ?? REVIVES_PER_GAME; // 예전 저장에는 값이 없으면 기본값
  updateHud();
  return true;
}

function clearSave() {
  store.set(SAVE_KEYS.save, null);
}
