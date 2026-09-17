# 포트폴리오 작업 도구 환경

여러 프로젝트의 PDF 확인과 브라우저 검증에 사용하는 도구를 사용자 전용 공통 경로에 설치한다. 프로젝트 자체의 실행 의존성은 각 프로젝트에서 관리한다.

## 설치된 도구

2026-09-13 기준:

| 도구 | 버전 | 용도 |
| --- | --- | --- |
| pypdf | 6.18.0 | PDF 페이지와 텍스트 읽기 |
| Playwright (Node.js) | 1.63.0 | 웹페이지 실행·DOM·스타일 검증과 화면 캡처 |
| Chromium Headless Shell | 153.0.8010.12 (v1243) | Playwright 브라우저 실행 |

Python 환경 경로는 `~/.local/share/codex-tools/venv`이며, 설치 파일은 저장소에 포함하지 않는다. Python 도구 버전은 [tool-requirements.txt](../config/tool-requirements.txt)에 기록한다. 브라우저 도구의 경로와 버전은 아래 별도 항목에 정리한다.

## 기존 설치 확인

```bash
~/.local/share/codex-tools/venv/bin/python -m pip show pypdf
~/.local/share/codex-tools/venv/bin/python -m pip check
```

정상 동작하면 다시 설치하지 않는다. 다른 도구가 필요하면 먼저 `command -v <실행파일>`과 기존 환경을 확인한다.

## 새 컴퓨터에서 설치 또는 환경 복구

프로젝트 루트에서 Python 3의 `venv` 기능이 있는 환경으로 다음 명령을 실행한다. 기존 환경이 정상이라면 실행할 필요가 없다.

```bash
python3 -m venv ~/.local/share/codex-tools/venv
~/.local/share/codex-tools/venv/bin/python -m pip install -r config/tool-requirements.txt
```

저장소 위치가 다르면 요구사항 파일 경로를 조정한다. 저장소를 복제하거나 pull하는 것만으로 도구가 설치되지는 않는다.

## PDF 읽기

과제 프로젝트의 루트에서 실행한다.

```bash
~/.local/share/codex-tools/venv/bin/python - <<'PY'
from pypdf import PdfReader

reader = PdfReader('docs/assignment-requirements.pdf')
for number, page in enumerate(reader.pages, start=1):
    print(f'--- {number}페이지 ---')
    print(page.extract_text() or '')
PY
```

이 명령은 텍스트 추출용이다. 스캔 이미지의 OCR이나 표·그림의 시각 확인은 별도 도구로 수행한다. 추가 도구가 필요해지면 기존 설치를 확인한 뒤 지속적인 설치 위치, 버전, 사용 방법을 이 문서에 기록한다.

## 브라우저 검증 도구

2026-09-13 Ubuntu 24.04 x86_64, Node.js 24.18.1에서 준비했다. 설치 경로는 `~/.local/share/codex-tools/browser`이다. 이 경로의 `package.json`과 `package-lock.json`에 Playwright 1.63.0을 고정했다. 프로젝트 소스에는 실행 의존성을 추가하지 않는다.

- `node_modules/`: Playwright 패키지
- `browsers/`: Chromium Headless Shell과 Playwright가 설치한 FFmpeg
- `runtime-packages/`: Ubuntu 배포판에서 내려받은 공유 라이브러리·글꼴 패키지
- `runtime/`: 위 패키지를 사용자 경로에 압축 해제한 내용
- `fonts.conf`, `font-cache/`: 한글 글꼴 설정과 캐시

시스템에 없던 패키지는 `apt-get download` 후 `dpkg-deb --extract`로 사용자 경로에 풀었다. 시스템 패키지는 변경하지 않았다.

| 패키지 | 준비한 버전 |
| --- | --- |
| libnspr4 | 2:4.35-1.1build1 |
| libnss3 | 2:3.98-1ubuntu0.2 |
| libasound2t64 | 1.2.11-1ubuntu0.3 |
| fonts-nanum | 20200506-1 |

### 설치 상태 확인과 실행

```bash
npm list --prefix "$HOME/.local/share/codex-tools/browser" --depth=0
```

검증용 Node.js 스크립트는 다음 경로에서 Playwright를 불러온다.

```js
const { chromium } = require('/home/jiho/.local/share/codex-tools/browser/node_modules/playwright');
```

사용자 경로의 브라우저·라이브러리·글꼴을 지정해 스크립트를 실행한다. 마지막 스크립트 경로는 실제 검증 파일로 바꾼다.

```bash
PLAYWRIGHT_BROWSERS_PATH="$HOME/.local/share/codex-tools/browser/browsers" \
LD_LIBRARY_PATH="$HOME/.local/share/codex-tools/browser/runtime/usr/lib/x86_64-linux-gnu" \
FONTCONFIG_FILE="$HOME/.local/share/codex-tools/browser/fonts.conf" \
node /path/to/browser-check.cjs
```

포트폴리오 프로젝트의 1280×720·375×720 화면에서 스크롤 경계값, CSS 배경색, 모바일 메뉴와 상단 이동을 검증하고 한글 화면을 캡처했다.

### 새 환경에서 복구

같은 Ubuntu 24.04 x86_64 환경에서 사용하는 절차다. 먼저 기존 설치를 확인한다.

```bash
codex_browser_tools="$HOME/.local/share/codex-tools/browser"
npm install --prefix "$codex_browser_tools" --save-exact playwright@1.63.0
PLAYWRIGHT_BROWSERS_PATH="$codex_browser_tools/browsers" \
  "$codex_browser_tools/node_modules/.bin/playwright" install chromium --only-shell
mkdir -p "$codex_browser_tools/runtime-packages" "$codex_browser_tools/runtime" "$codex_browser_tools/font-cache"
cd "$codex_browser_tools/runtime-packages"
apt-get download libnspr4 libnss3 libasound2t64 fonts-nanum
for package in ./*.deb; do
  dpkg-deb --extract "$package" "$codex_browser_tools/runtime"
done
```

`apt-get download`는 해당 환경의 패키지 목록에 있는 버전을 받으므로 위 버전과 달라지면 설치 목록을 갱신한다. `fonts.conf`는 아래 내용으로 만들고 `/home/jiho` 부분을 자신의 홈 디렉터리로 바꾼다.

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>
  <dir>/home/jiho/.local/share/codex-tools/browser/runtime/usr/share/fonts/truetype/nanum</dir>
  <cachedir>/home/jiho/.local/share/codex-tools/browser/font-cache</cachedir>
</fontconfig>
```

## Claude Code에서 반복 검증

Claude Code는 이 문서의 해당 도구 실행법을 확인한 뒤 작업트리 안의 검증 스크립트를 실행한다. 실행 권한은 지침과 별도로 관리한다. 권한 설정은 사용자의 현재 도구 설정을 따르며 이 문서는 권한을 부여하거나 변경하지 않는다.

권한 거부와 실행 환경 오류를 구분한다. Playwright 모듈을 찾지 못하면 `browser/node_modules/playwright` 경로를, `libnspr4.so` 로드 실패는 위 `LD_LIBRARY_PATH`를 확인한다. 정상 설치를 다시 설치하지 않는다. 검증 근거는 검토·보완·자료 반영까지 보존하고 인계가 끝난 뒤 일회성 파일을 정리한다.
