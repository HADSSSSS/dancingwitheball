// ===== 효과음 =====
// 소리 파일 없이 브라우저가 직접 '삑' 소리를 만들어 냄 (Web Audio).
let actx = null;
let soundOn = store.get(SAVE_KEYS.sound, true);
let lastBlip = 0;

// 브라우저 정책상 첫 터치/클릭 때 소리 장치를 켜야 함 (사파리는 멈췄다가 다시 켜야 할 때도 있음)
function ensureAudio() {
  if (actx) { if (actx.state === 'suspended') actx.resume().catch(() => {}); return; }
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { actx = null; }
}

// freq: 음 높이(Hz), dur: 길이(초), type: 음색, vol: 크기
function blip(freq, dur = 0.05, type = 'triangle', vol = 0.05) {
  if (!soundOn || !actx) return;
  const now = actx.currentTime;
  if (now - lastBlip < 0.025) return; // 너무 잦은 재생 방지
  lastBlip = now;
  try {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(actx.destination);
    o.start(now); o.stop(now + dur);
  } catch {}
}
