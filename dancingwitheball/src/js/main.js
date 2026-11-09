// ===== 시작 & 메인 루프 =====

let last = performance.now();
function loop(now) {
  const dt = Math.min(3, (now - last) / (1000 / 60)); // 60fps 기준 배율 (탭 전환 후 폭주 방지)
  last = now;
  try { keyboardAim(dt); update(dt); draw(); } catch (err) { console.error(err); }
  requestAnimationFrame(loop);
}

syncMode();
syncSound();
resize();
if (!loadGame()) reset(); // 저장된 게임이 있으면 이어하기

// 웹사이트에 올렸을 때: 오프라인 실행 + 앱 설치 지원 (파일로 직접 열면 자동 생략)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

requestAnimationFrame(loop);
