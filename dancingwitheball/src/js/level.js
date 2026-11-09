// ===== 벽돌 줄 생성 =====
// 맨 윗줄(1번 행)에 벽돌 여러 개 + 공 추가 아이템 1개를 무작위 위치에 놓음.
// 개수와 체력 규칙은 config.js의 brickCount / brickHP 에서 정함.
function spawnRow() {
  const cols = [...Array(COLS).keys()].sort(() => Math.random() - 0.5); // 열 순서 섞기
  const n = brickCount(level);
  const brickCols = cols.slice(0, n);
  const pickupCol = cols[n];

  for (const c of brickCols) {
    const hp = brickHP(level);
    bricks.push({ type: 'brick', c, r: 1, hp, max: hp, dy: 0, flash: 0 });
  }
  bricks.push({ type: 'pickup', c: pickupCol, r: 1, dy: 0, pulse: Math.random() * 6 });
}

// 벽돌 한 칸의 실제 사각형 영역
function rectOf(b) {
  return { x: b.c * CELL + GAP / 2, y: b.r * CELL + GAP / 2, w: CELL - GAP, h: CELL - GAP };
}

// 벽돌 색: 새 벽돌(체력 높음)일수록 진한 분홍, 오래된(약한) 벽돌일수록 청록
function brickColor(b) {
  const t = Math.min(1, b.hp / Math.max(1, level));
  const hue = 190 + t * 150;
  return `hsl(${hue % 360}, 85%, ${58 - t * 6}%)`;
}
