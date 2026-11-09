# dancingwitheball

드래그(스와이프)로 공을 쏴서 벽돌을 깨는 게임이에요.
HTML · CSS · JavaScript만 써서 만들었고, 설치할 것 없이 브라우저에서 바로 돌아가요.

---

## 바로 실행

| 하고 싶은 것 | 열 파일 |
|---|---|
| 그냥 게임하기 / 친구에게 보내기 | `dist/dancingwitheball.html` (파일 하나로 끝) |
| 코드 고치면서 확인하기 | `src/index.html` |
| 웹사이트에 올리기 | `dist/web/` 폴더 통째로 (아래 '웹사이트 올리기' 참고) |

> Windows에서 '스마트 앱 컨트롤' 경고가 뜨면: 크롬/엣지 창을 먼저 열고 파일을 끌어다 놓으세요.

---

## 폴더 구조

```
dancingwitheball/
├─ README.md                ← 지금 보는 설명서
├─ src/                     ← ★ 원본 코드 (여기를 고쳐요)
│  ├─ index.html            ← 화면 구성 (버튼, 게임판)
│  ├─ css/
│  │  ├─ style.css          ← 디자인 (색, 크기, 배치)
│  │  └─ fonts.css          ← 내장 폰트 (자동 생성, 수정 X)
│  ├─ js/                   ← 게임 동작 (아래 순서대로 불러옴)
│  │  ├─ config.js          ← ★ 설정값: 난이도, 판 크기, 공 속도
│  │  ├─ storage.js         ← 저장/불러오기 도우미
│  │  ├─ audio.js           ← 효과음
│  │  ├─ state.js           ← 게임 상태, 새 게임, 자동 저장
│  │  ├─ level.js           ← 벽돌 줄 만들기, 벽돌 색
│  │  ├─ physics.js         ← 공 충돌·반사
│  │  ├─ aim.js             ← 조준 방향, 조준선, 발사
│  │  ├─ input.js           ← 마우스·터치·키보드
│  │  ├─ ui.js              ← 버튼, 점수판, 화면 크기
│  │  ├─ game.js            ← 매 프레임 진행, 턴 종료, 게임 오버
│  │  ├─ render.js          ← 화면 그리기, 파편 효과
│  │  └─ main.js            ← 게임 시작
│  ├─ manifest.webmanifest  ← 앱 설치 정보 (이름, 아이콘)
│  ├─ sw.js                 ← 오프라인 실행 (웹사이트용)
│  └─ icons/                ← 앱 아이콘
├─ tools/
│  └─ build.py              ← src → dist 로 합치는 스크립트
└─ dist/                    ← 배포용 결과물 (build.py가 만듦)
   ├─ dancingwitheball.html
   └─ web/
```

---

## 자주 고치는 곳

거의 다 **`src/js/config.js`** 한 파일에 모여 있어요.

| 바꾸고 싶은 것 | 파일 | 찾을 이름 |
|---|---|---|
| 벽돌 체력 | config.js | `brickHP` |
| 한 줄 벽돌 수 / 5개 줄 확률 | config.js | `FULL_ROW_CHANCE`, `OTHER_ROW_WEIGHTS` |
| 처음 공 개수 | config.js | `START_BALLS` |
| 아이템 1개당 늘어나는 공 | config.js | `BALLS_PER_PICKUP` |
| 가로 칸 수 | config.js | `COLS` (판 너비는 자동 계산) |
| 게임 오버까지 버틸 줄 수 | config.js | `ROWS` |
| 공 속도 / 발사 간격 | config.js | `SPEED`, `FIRE_GAP` |
| 부활 횟수 / 부활 시 지워지는 줄 수 | config.js | `REVIVES_PER_GAME`, `REVIVE_CLEAR_ROWS` |
| 게임 버전 (화면 오른쪽 아래) | config.js | `GAME_VERSION` |
| 화면 색 (배경, 버튼) | css/style.css | 맨 위 `:root` |
| 벽돌 색 | js/level.js | `brickColor` |
| 아이템·공·조준선 색 | js/render.js | `COLORS` |
| 효과음 | js/game.js | `blip(...)` 숫자 |

**예시 — 101~500 스테이지의 5개 줄 확률을 40% → 35%로**
```js
{ after: 100,  chance: 0.35 },   //  101 ~ 500
```

**예시 — 벽돌 체력을 스테이지의 1.5배로**
```js
function brickHP(level) {
  return Math.ceil(level * 1.5);
}
```

고친 뒤에는: **저장 → 브라우저 새로고침(F5) → 게임 안의 ↺새로 버튼 두 번**
(이어하기 저장 때문에 새 게임을 시작해야 바뀐 설정이 전부 보여요)

---

## 배포용 파일 다시 만들기

`src`를 고친 뒤 `dist`에도 반영하려면 (Python 3 필요):

```bash
cd dancingwitheball
python tools/build.py
```

- Python이 없으면: [python.org](https://www.python.org/downloads/)에서 설치 (설치 화면에서 *Add python.exe to PATH* 체크)
- `src/index.html`만으로도 게임은 똑같이 돌아가요. `dist`는 남에게 주거나 웹사이트에 올릴 때만 필요해요.

---

## 게임 이름 바꾸기

이름은 아래 4곳에 있어요. 모두 같은 이름으로 바꾸세요.

| # | 파일 | 바꿀 곳 | 어디에 보이나 |
|---|---|---|---|
| ① | `src/index.html` | `<title>dancingwitheball</title>` | 브라우저 탭 제목, 즐겨찾기 이름, **배포 파일 이름** |
| ② | `src/index.html` | `apple-mobile-web-app-title` 의 `content` | 아이폰 홈 화면 아이콘 아래 |
| ③ | `src/manifest.webmanifest` | `"name"` | PC 크롬/엣지 앱 설치 창, 앱 창 제목 |
| ④ | `src/manifest.webmanifest` | `"short_name"` | 안드로이드 홈 화면 아이콘 아래 (짧을수록 좋음, 12자 이내 권장) |

바꾼 뒤 `python tools/build.py` → Netlify에 `dist/web` 올리기.
이미 홈 화면에 추가했거나 앱으로 설치한 경우, 아이콘 이름은 지우고 다시 추가해야 바뀌어요.

---

## 패치(업데이트) 올리기

1. `src` 안의 파일 수정 → `src/index.html`로 확인
2. `src/js/config.js`의 `GAME_VERSION` 올리기 (예: `1.1.0` → `1.1.1`)
3. `CHANGELOG.md`에 바뀐 내용 한 줄 적기
4. `python tools/build.py`
5. Netlify → 내 사이트 → **Deploys** → `dist/web` 폴더 끌어다 놓기
6. 사이트 오른쪽 아래 버전 번호가 바뀌었는지 확인

문제가 생기면 Netlify **Deploys**에서 예전 배포 클릭 → **Publish deploy**로 되돌리기.

---

## 웹사이트 올리기

`python tools/build.py` 실행 후 `dist/web` 폴더를:
- **Netlify Drop**: https://app.netlify.com/drop 에 끌어다 놓기 → 주소 생성
- **GitHub Pages**: 저장소에 올리고 Settings → Pages 켜기

올린 뒤에는 아이폰 사파리 *공유 → 홈 화면에 추가*, PC 크롬 *주소창 설치 아이콘*으로 앱처럼 쓸 수 있어요.

---

## 조작법

| 입력 | 동작 |
|---|---|
| 드래그 후 놓기 | 조준 → 발사 (↑ 버튼으로 '새총' 방식 전환) |
| ← / → (Shift: 미세) | 조준 각도 |
| ↑ | 정중앙 조준 |
| Space / Enter | 발사 (게임 오버 시: 부활 가능하면 부활, 아니면 다시 시작) |
| F / R / M | 2배속 / 공 회수 / 소리 |

진행 상황은 매 턴 자동 저장돼요 (같은 브라우저에서만 이어짐).

---

## 라이선스 메모
- 폰트: Jua (SIL Open Font License 1.1) — 상업적 사용 가능
