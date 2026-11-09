// ===== 버튼 & 점수판 & 화면 크기 =====

// ----- 점수판 -----
function updateHud() {
  $('lvl').textContent = level;
  if (level > best) { best = level; store.set(SAVE_KEYS.best, best); }
  $('best').textContent = best;
}

// ----- ⏩ 2배속 -----
$('speedBtn').onclick = () => {
  fastOn = !fastOn;
  $('speedBtn').classList.toggle('on', fastOn);
};

// ----- ⤓ 공 회수 -----
$('recallBtn').onclick = () => {
  if (state !== 'run') return;
  fired = ballCount;
  if (landedX === null) landedX = launchX;
  balls.forEach(b => b.ret = true);
};

// ----- ↑ 조준 방식 (스와이프 / 새총) -----
const isDesktop = window.matchMedia && matchMedia('(pointer: fine)').matches;
function syncMode() {
  $('modeBtn').innerHTML = aimMode === 'swipe' ? '↑<span class="lbl">스와이프</span>' : '↓<span class="lbl">새총</span>';
  const base = aimMode === 'swipe'
    ? '위로 드래그해서 조준, 놓으면 발사!'
    : '새총처럼 아래로 당겨서 조준, 놓으면 발사!';
  $('hint').textContent = isDesktop ? base + '  ·  키보드: ←→ 조준 · Space 발사 · F 배속 · R 회수' : base;
}
$('modeBtn').onclick = () => {
  aimMode = aimMode === 'swipe' ? 'sling' : 'swipe';
  store.set(SAVE_KEYS.mode, aimMode);
  syncMode();
};

// ----- 🔊 소리 -----
function syncSound() { $('soundBtn').textContent = soundOn ? '🔊' : '🔇'; }
$('soundBtn').onclick = () => {
  ensureAudio();
  soundOn = !soundOn;
  store.set(SAVE_KEYS.sound, soundOn);
  syncSound();
};

// ----- 게임 오버 창의 '부활하기' / '다시 하기' -----
$('revive').onclick = () => { ensureAudio(); revive(); };
$('restart').onclick = reset;

// ----- 버전 표시 -----
$('ver').textContent = 'v' + GAME_VERSION;

// ----- ↺ 새 게임 (실수 방지: 2.5초 안에 두 번 눌러야 시작) -----
let newArmed = 0;
function resetNewBtn() {
  newArmed = 0;
  $('newBtn').innerHTML = '↺<span class="lbl">새로</span>';
  $('newBtn').classList.remove('on');
}
$('newBtn').onclick = () => {
  if (state === 'over') return reset();
  if (Date.now() - newArmed < 2500) { resetNewBtn(); reset(); return; }
  newArmed = Date.now();
  $('newBtn').textContent = '한번 더!';
  $('newBtn').classList.add('on');
  setTimeout(() => { if (newArmed && Date.now() - newArmed >= 2500) resetNewBtn(); }, 2600);
};

// ----- 화면 크기에 맞춰 게임판 크기 조절 -----
function resize() {
  const hudH = 110; // 상단 바 + 안내 문구 높이
  const availH = window.innerHeight - hudH, availW = window.innerWidth - 16;
  const cssW = Math.max(240, Math.min(availW, availH * W / H, 560)); // 최대 너비 560px
  const cssH = cssW * H / W;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // 고해상도 화면 선명하게
  cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
  ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  $('hud').style.width = cssW + 'px';
}
window.addEventListener('resize', resize);
