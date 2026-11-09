// ===== 조준 & 발사 =====

// 현재 조준 방향 {x, y} (단위 벡터). 조준이 너무 짧으면 null
function aimDir() {
  if (!aim) return null;
  if (aim.kb) return { x: Math.cos(aim.angle), y: Math.sin(aim.angle) }; // 키보드 조준

  let dx = aim.dx, dy = aim.dy;
  if (aimMode === 'sling') { dx = -dx; dy = -dy; } // 새총 모드: 당긴 반대 방향
  if (Math.hypot(dx, dy) < 24) return null;        // 짧은 드래그는 무시

  let ang = Math.atan2(dy, dx); // 위쪽이 음수 각도
  if (dy > 0) ang = dx < 0 ? -(Math.PI - MIN_ANGLE) : -MIN_ANGLE; // 아래로 끌면 수평 근처로 고정
  ang = Math.max(-(Math.PI - MIN_ANGLE), Math.min(-MIN_ANGLE, ang));
  return { x: Math.cos(ang), y: Math.sin(ang) };
}

// 조준선 점 위치 계산: 첫 충돌까지 + 반사 후 조금
function previewPath(dir) {
  const p = { x: launchX, y: FLOOR - R, vx: dir.x, vy: dir.y };
  const pts = [];
  const step = 5;          // 계산 간격
  const DOT_GAP = 26;      // 점 사이 간격
  const AFTER_BOUNCE = 160; // 반사 후 그릴 길이
  let travelled = 0, bounced = false, after = 0, sinceDot = 0;

  while (travelled < 1600) {
    p.x += p.vx * step; p.y += p.vy * step; travelled += step; sinceDot += step;
    let hit = wallBounce(p);
    if (!hit) for (const b of bricks) if (b.type === 'brick' && collideRect(p, rectOf(b))) { hit = true; break; }
    if (p.y > FLOOR - R) break;
    if (hit && !bounced) { bounced = true; pts.push({ x: p.x, y: p.y, hit: true }); }
    if (bounced) { after += step; if (after > AFTER_BOUNCE) break; }
    if (sinceDot >= DOT_GAP) { pts.push({ x: p.x, y: p.y, fade: bounced ? 1 - after / AFTER_BOUNCE : 1 }); sinceDot = 0; }
  }
  return pts;
}

// 발사 시작
function fire(dir) {
  state = 'run'; fired = 0; fireTimer = 0; runTime = 0; landedX = null;
  balls = [];
  aim.dir = dir;
  $('recallBtn').disabled = false;
  blip(520, 0.08, 'sine', 0.06);
}
