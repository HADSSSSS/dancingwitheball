"""
배포용 파일 만들기
  src/ 폴더의 여러 파일(HTML, CSS, JS)을 하나의 HTML 파일로 합칩니다.

실행:  python tools/build.py     (프로젝트 폴더에서)
결과:
  dist/<게임이름>.html        ← 파일 하나로 어디서나 실행 (PC 더블클릭, 친구에게 전달)
                                 (이름은 src/index.html의 <title>을 따라감)
  dist/web/                    ← 웹사이트에 올릴 폴더 (오프라인 실행·앱 설치 지원)

필요한 것: Python 3 (추가 설치 없음)
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
WEB = DIST / "web"


def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        sys.exit(f"[오류] 파일을 찾을 수 없어요: {path.relative_to(ROOT)}")


def inline(html: str) -> str:
    # <link rel="stylesheet" href="css/xxx.css"> → <style>내용</style>
    def css(m):
        return "<style>\n" + read(SRC / m.group(1)) + "</style>"
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)

    # <script src="js/xxx.js"></script> → <script>내용</script>  (뒤의 주석은 제거)
    def js(m):
        return f"<script>\n// ----- {m.group(1)} -----\n" + read(SRC / m.group(1)) + "</script>"
    html = re.sub(r'<script src="([^"]+)"></script>[^\n]*', js, html)
    return html


def bump_sw_version(sw: str) -> str:
    # 웹사이트에 다시 올릴 때 새 버전이 바로 반영되도록 캐시 이름에 빌드 시각을 붙임
    from datetime import datetime
    stamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return re.sub(r"const VERSION = '([^']*)';", rf"const VERSION = '\1-{stamp}';", sw, count=1)


def main():
    html = inline(read(SRC / "index.html"))

    DIST.mkdir(exist_ok=True)
    # 파일 이름 = src/index.html의 <title> (파일 이름에 못 쓰는 글자는 빼기)
    m = re.search(r"<title>(.*?)</title>", html)
    name = re.sub(r'[\\/:*?"<>|]', "", m.group(1)).strip() if m else "game"
    single = DIST / f"{name}.html"
    single.write_text(html, encoding="utf-8")

    if WEB.exists():
        shutil.rmtree(WEB)
    (WEB / "icons").mkdir(parents=True)
    (WEB / "index.html").write_text(html, encoding="utf-8")
    shutil.copy(SRC / "manifest.webmanifest", WEB)
    (WEB / "sw.js").write_text(bump_sw_version(read(SRC / "sw.js")), encoding="utf-8")
    for icon in (SRC / "icons").glob("*.png"):
        shutil.copy(icon, WEB / "icons")

    kb = single.stat().st_size // 1024
    print(f"완료!\n  {single.relative_to(ROOT)}  ({kb} KB)\n  {WEB.relative_to(ROOT)}/  (웹사이트용)")


if __name__ == "__main__":
    main()
