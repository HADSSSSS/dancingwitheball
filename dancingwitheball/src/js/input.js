// ===== 입력 =====

// ----- 마우스 / 터치 (Pointer Events 하나로 둘 다 처리) -----
// 화면 좌표 → 게임 좌표
function toLogical(e) {
  const rc = cv.getBoundingClientRect();
  return { x: (e.clientX - rc.left) * W / rc.width, y: (e.clientY - rc.top) * H / rc.height };
}

cv.addEventListener('pointerdown', e => {
  ensureAudio();
  if (state !== 'aim') return;
  cv.setPointerCapture(e.pointerId);
  const p = toLogical(e);
  aim = { sx: p.x, sy: p.y, dx: 0, dy: 0 };
});

cv.addEventListener('pointermove', e => {
  if (!aim || state !== 'aim') return;
  const p = toLogical(e);
  aim.dx = p.x - aim.sx; aim.dy = p.y - aim.sy;
});

cv.addEventListener('pointerup', () => {
  if (!aim || state !== 'aim') { aim = null; return; }
  const dir = aimDir();
  if (dir) fire(dir); else aim = null; // 짧게 놓으면 취소
});

cv.addEventListener('pointercancel', () => { aim = null; });

// ----- PC 키보드 -----
// ←/→ 조준 (Shift: 미세 조정), ↑ 정중앙, Space/Enter 발사, F 배속, R 회수, M 소리
let kbAngle = -Math.PI / 2;
const held = {}; // 누르고 있는 키

window.addEventListener('keydown', e => {
  const k = e.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault(); // 화면 스크롤 방지
  ensureAudio();

  if (k === 'Shift') held.Shift = true;
  if (k === 'ArrowLeft' || k === 'ArrowRight') {
    held[k] = true;
    if (state === 'aim' && (!aim || !aim.kb)) aim = { kb: true, angle: kbAngle };
  } else if (k === 'ArrowUp') {
    if (state === 'aim') { kbAngle = -Math.PI / 2; aim = { kb: true, angle: kbAngle }; }
  } else if (k === ' ' || k === 'Enter') {
    if (state === 'over') return revivesLeft > 0 ? revive() : reset(); // 부활 가능하면 부활
    if (state === 'aim') {
      if (!aim || !aim.kb) aim = { kb: true, angle: kbAngle };
      fire(aimDir());
    }
  } else if (k === 'f' || k === 'F') $('speedBtn').click();
  else if (k === 'r' || k === 'R') $('recallBtn').click();
  else if (k === 'm' || k === 'M') $('soundBtn').click();
});

window.addEventListener('keyup', e => { held[e.key] = false; });

// 매 프레임: 누르고 있는 방향키만큼 조준 각도 이동
function keyboardAim(dt) {
  if (state !== 'aim' || !aim || !aim.kb) return;
  const sp = (held.Shift ? 0.004 : 0.022) * dt;
  if (held.ArrowLeft) kbAngle -= sp;
  if (held.ArrowRight) kbAngle += sp;
  kbAngle = Math.max(-(Math.PI - MIN_ANGLE), Math.min(-MIN_ANGLE, kbAngle));
  aim.angle = kbAngle;
}
