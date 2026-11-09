// ===== 화면 그리기 =====

const COLORS = {
  danger: '#ff4d6d14',   // 게임 오버 직전 줄 (빨간 띠)
  floor: '#2c2f52',      // 바닥선
  pickup: '#7CFFB2',     // 아이템 (초록 링)
  brickText: '#14152a',  // 벽돌 숫자
  ball: '#ffffff',
  ballCount: '#c8cbf0',
  aimDot: '255,209,102', // 조준선 (노랑, rgba용)
};

// ----- 파편 효과 -----
function burst(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color, size: 5 + Math.random() * 7 });
  }
}

// 둥근 사각형 경로
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

let frame = 0; // 아이템 깜빡임 애니메이션용

function draw() {
  frame += 1;
  ctx.clearRect(0, 0, W, H);
  drawBoard();
  drawBricks();
  drawAimLine();
  drawBalls();
  drawParticles();
}

// 위험 구역 + 바닥선
function drawBoard() {
  ctx.fillStyle = COLORS.danger;
  ctx.fillRect(0, (ROWS - 1) * CELL, W, CELL);
  ctx.strokeStyle = COLORS.floor; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.stroke();
}

// 벽돌 + 아이템
function drawBricks() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of bricks) {
    if (b.type === 'pickup') {
      const cx = b.c * CELL + CELL / 2, cy = b.dy + CELL / 2;
      const pr = 16 + Math.sin(frame * 0.08 + b.pulse) * 3;
      ctx.strokeStyle = COLORS.pickup; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = COLORS.pickup;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      continue;
    }
    const x = b.c * CELL + GAP / 2, y = b.dy + GAP / 2, s = CELL - GAP;
    const col = brickColor(b);
    ctx.shadowColor = col; ctx.shadowBlur = 14; // 빛나는 효과
    ctx.fillStyle = col;
    roundRect(x, y, s, s, 12); ctx.fill();
    ctx.shadowBlur = 0;
    if (b.flash) { ctx.fillStyle = `rgba(255,255,255,${b.flash * 0.6})`; roundRect(x, y, s, s, 12); ctx.fill(); }
    ctx.fillStyle = COLORS.brickText;
    ctx.font = `${b.hp >= 100 ? 30 : 36}px Jua, sans-serif`; // 세 자리 숫자는 작게
    ctx.fillText(b.hp, x + s / 2, y + s / 2 + 2);
  }
}

// 조준선 (점선)
function drawAimLine() {
  if (state !== 'aim' || !aim) return;
  const dir = aimDir();
  if (!dir) return;
  for (const p of previewPath(dir)) {
    if (p.hit) continue;
    ctx.fillStyle = `rgba(${COLORS.aimDot},${0.85 * (p.fade ?? 1)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
  }
}

// 대기 중인 공, 다음 발사 위치, 날아가는 공, 남은 개수
function drawBalls() {
  if (state === 'aim' || (state === 'run' && fired < ballCount)) {
    ctx.fillStyle = COLORS.ball;
    ctx.beginPath(); ctx.arc(launchX, FLOOR - R, R, 0, Math.PI * 2); ctx.fill();
    const left = state === 'aim' ? ballCount : ballCount - fired;
    ctx.fillStyle = COLORS.ballCount; ctx.font = '24px Jua, sans-serif';
    ctx.fillText('×' + left, Math.max(40, Math.min(W - 40, launchX)), FLOOR + 22);
  }
  if (state === 'run' && landedX !== null) {
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath(); ctx.arc(landedX, FLOOR - R, R, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = COLORS.ball;
  for (const p of balls) { ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill(); }

  if (pendingBalls > 0 && state === 'run') {
    ctx.fillStyle = COLORS.pickup; ctx.font = '24px Jua, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('+' + pendingBalls + ' 공', W - 16, FLOOR + 22);
    ctx.textAlign = 'center';
  }
}

// 파편
function drawParticles() {
  for (const q of particles) {
    ctx.globalAlpha = Math.max(0, q.life);
    ctx.fillStyle = q.color;
    ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
  }
  ctx.globalAlpha = 1;
}
