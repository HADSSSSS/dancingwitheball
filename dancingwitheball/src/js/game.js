// ===== 게임 진행 =====

// ----- 매 프레임 상태 갱신 (dt: 60fps 기준 1) -----
function update(dt) {
  // 벽돌이 한 줄 내려올 때 부드럽게 이동
  for (const b of bricks) b.dy += (b.r * CELL - b.dy) * Math.min(1, 0.2 * dt);

  if (state === 'run') {
    runTime += dt;
    const mult = (fastOn ? 2 : 1) * (runTime > AUTO_FAST_AFTER ? AUTO_FAST_MULT : 1);
    const fdt = dt * mult;

    launchBalls(fdt);
    for (const p of balls) moveBall(p, fdt);

    balls = balls.filter(p => !p.done);
    if (fired >= ballCount && balls.length === 0) endTurn();
  }

  // 반짝임, 파편
  for (const b of bricks) if (b.flash) b.flash = Math.max(0, b.flash - 0.12 * dt);
  for (const q of particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 0.25 * dt; q.life -= 0.03 * dt; }
  particles = particles.filter(q => q.life > 0);
}

// ----- 공을 하나씩 순서대로 발사 -----
function launchBalls(fdt) {
  fireTimer -= fdt;
  while (fired < ballCount && fireTimer <= 0) {
    balls.push({ x: launchX, y: FLOOR - R, vx: aim.dir.x * SPEED, vy: aim.dir.y * SPEED, ret: false });
    fired++; fireTimer += FIRE_GAP;
  }
}

// ----- 공 하나 이동 -----
function moveBall(p, fdt) {
  // 바닥에 닿은 공은 착지 지점으로 굴러가서 모임
  if (p.ret) {
    const tx = landedX ?? launchX;
    p.y = FLOOR - R;
    p.x += Math.sign(tx - p.x) * Math.min(Math.abs(tx - p.x), 14 * fdt);
    if (Math.abs(tx - p.x) < 0.5) p.done = true;
    return;
  }

  // 빠른 공이 벽돌을 뚫고 지나가지 않도록 잘게 나눠서 이동
  const steps = Math.ceil(SPEED * fdt / (R * 0.5));
  const k = fdt / steps;
  for (let s = 0; s < steps; s++) {
    p.x += p.vx * k; p.y += p.vy * k;
    if (wallBounce(p)) blip(330, 0.03, 'sine', 0.02);

    // 바닥 도착
    if (p.y >= FLOOR - R && p.vy > 0) {
      p.ret = true;
      if (landedX === null) landedX = Math.max(R, Math.min(W - R, p.x));
      break;
    }
    hitBricks(p);
  }
}

// ----- 벽돌/아이템과 부딪힘 처리 (한 번에 벽돌 하나만) -----
function hitBricks(p) {
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];

    // 아이템: 지나가기만 해도 획득
    if (b.type === 'pickup') {
      const cx = b.c * CELL + CELL / 2, cy = b.r * CELL + CELL / 2;
      if (Math.hypot(p.x - cx, p.y - cy) < R + 20) {
        bricks.splice(i, 1); i--;
        pendingBalls += BALLS_PER_PICKUP;
        burst(cx, cy, '#7CFFB2');
        blip(880, 0.12, 'sine', 0.06);
      }
      continue;
    }

    // 벽돌: 튕기고 체력 1 감소
    if (collideRect(p, rectOf(b))) {
      b.hp--; b.flash = 1;
      blip(420 + Math.min(600, b.max * 4), 0.04);
      if (b.hp <= 0) {
        const rc = rectOf(b);
        burst(rc.x + rc.w / 2, rc.y + rc.h / 2, brickColor({ hp: b.max }));
        bricks.splice(i, 1);
        blip(240, 0.1, 'square', 0.04);
      }
      fixAngle(p);
      break;
    }
  }
}

// ----- 턴 종료: 공 개수 정산 → 벽돌 한 줄 내리기 → 게임 오버 확인 → 새 줄 -----
function endTurn() {
  launchX = landedX ?? launchX;
  ballCount += pendingBalls; pendingBalls = 0;
  level++;

  for (const b of bricks) b.r++;
  bricks = bricks.filter(b => !(b.type === 'pickup' && b.r >= ROWS)); // 바닥까지 온 아이템은 사라짐

  if (bricks.some(b => b.type === 'brick' && b.r >= ROWS)) {
    gameOver();
  } else {
    spawnRow();
    state = 'aim';
    updateHud();
    saveGame();
  }
  aim = null;
  $('recallBtn').disabled = true;
}

function gameOver() {
  state = 'over';
  level--; // 마지막으로 클리어한 스테이지 기준
  updateHud();
  $('overMsg').textContent = `스테이지 ${level}까지 도달! (최고 ${best})`;

  // 부활 버튼: 남은 횟수가 있을 때만 표시
  const canRevive = revivesLeft > 0;
  $('revive').classList.toggle('hidden', !canRevive);
  $('reviveInfo').classList.toggle('hidden', !canRevive);
  $('reviveLeft').textContent = `(${revivesLeft}회 남음)`;
  $('reviveInfo').textContent = `아래쪽 ${REVIVE_CLEAR_ROWS}줄이 사라지고 이어서 할 수 있어요`;

  $('over').classList.add('show');
  clearSave();
  blip(160, 0.4, 'sawtooth', 0.05);
}

// ----- 부활: 아래쪽 줄을 지우고 같은 스테이지에서 이어하기 -----
function revive() {
  if (state !== 'over' || revivesLeft <= 0) return;
  revivesLeft--;
  level++; // gameOver에서 내렸던 스테이지 되돌리기

  // 아래쪽 REVIVE_CLEAR_ROWS 줄 (+ 바닥을 넘친 줄) 제거, 파편 효과
  const limit = ROWS - REVIVE_CLEAR_ROWS;
  for (const b of bricks) {
    if (b.r >= limit && b.type === 'brick') {
      const rc = rectOf(b);
      burst(rc.x + rc.w / 2, Math.min(rc.y, FLOOR - CELL) + rc.h / 2, brickColor(b));
    }
  }
  bricks = bricks.filter(b => b.r < limit);

  spawnRow();
  state = 'aim';
  $('over').classList.remove('show');
  updateHud();
  saveGame();
  blip(660, 0.15, 'sine', 0.07);
  setTimeout(() => blip(990, 0.2, 'sine', 0.07), 120);
}
