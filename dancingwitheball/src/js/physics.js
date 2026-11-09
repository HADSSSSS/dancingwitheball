// ===== 공 물리 =====
// p = 공 {x, y, vx, vy}

// 공-벽돌 충돌 (원 vs 사각형). 부딪히면 공을 튕겨내고 true 반환
function collideRect(p, rc) {
  const cx = Math.max(rc.x, Math.min(p.x, rc.x + rc.w)); // 사각형에서 공과 가장 가까운 점
  const cy = Math.max(rc.y, Math.min(p.y, rc.y + rc.h));
  const dx = p.x - cx, dy = p.y - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= R * R) return false;

  let nx, ny; // 부딪힌 면의 방향
  if (d2 === 0) { nx = 0; ny = p.vy > 0 ? -1 : 1; } // 공 중심이 안으로 파고든 경우
  else { const d = Math.sqrt(d2); nx = dx / d; ny = dy / d; }

  const dot = p.vx * nx + p.vy * ny;
  if (dot < 0) { p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny; } // 반사
  p.x = cx + nx * R; p.y = cy + ny * R;                       // 겹친 만큼 밀어내기
  return true;
}

// 좌우 벽과 천장에서 튕기기
function wallBounce(p) {
  let hit = false;
  if (p.x < R)     { p.x = R;     p.vx = Math.abs(p.vx);  hit = true; }
  if (p.x > W - R) { p.x = W - R; p.vx = -Math.abs(p.vx); hit = true; }
  if (p.y < R)     { p.y = R;     p.vy = Math.abs(p.vy);  hit = true; }
  return hit;
}

// 공이 거의 수평으로 날아가며 끝없이 튕기는 것 방지
function fixAngle(p) {
  const sp = Math.hypot(p.vx, p.vy) || SPEED;
  const minVy = sp * Math.sin(MIN_ANGLE);
  if (Math.abs(p.vy) < minVy) {
    p.vy = (p.vy >= 0 ? 1 : -1) * minVy;
    p.vx = Math.sign(p.vx || 1) * Math.sqrt(sp * sp - minVy * minVy);
  }
}
