// ===== 저장 도우미 =====
// 브라우저 저장소(localStorage)에 값을 저장/불러오기.
// 저장소를 쓸 수 없는 환경(일부 사생활 보호 모드 등)에서도 게임이 멈추지 않도록 try/catch로 감쌈.
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};
