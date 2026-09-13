# codyssey_B1-1

순수 HTML, CSS, JavaScript로 나를 소개하는 반응형 포트폴리오 웹사이트를 만드는 학습 프로젝트입니다. DOM 조작, 이벤트, 비동기 요청을 통해 사용자 입력이 상태와 화면 변화로 이어지는 과정을 학습합니다.

현재는 여섯 섹션의 HTML 구조, CSS 변수와 다크 모드 색상, Flexbox·Grid 배치, 768px·1024px 미디어 쿼리, 모바일 메뉴, 부드러운 섹션 이동, 맨 위로 버튼과 스크롤에 따른 내비게이션 배경색 변경, 테마 전환과 선택 저장·복원을 구현했습니다. 나머지 스타일·인터랙션, 폼 검증, API 연동과 배포는 이후 구현합니다.

- [과제 요구사항 원문](docs/assignment-requirements.pdf)
- [프로젝트 작업 지침](AGENTS.md)
- [진행 상태와 요구사항 체크리스트](docs/progress.md)

주요 디렉터리:

- `docs/`: 과제 PDF와 프로젝트 문서를 보관합니다.
- `docs/learning/`: 실제 코드에 적용한 개념과 검증 결과를 기록합니다.
- `src/index.html`: Hero, About, Skills, Projects, Contact, Footer와 섹션 이동 링크를 정의합니다.
- `src/css/`: 스타일시트를 보관합니다. 색상·글꼴·간격을 CSS 변수로 관리하며 최소 스타일을 적용했습니다.
- `src/js/`: JavaScript를 보관합니다. 모바일 메뉴의 클릭과 스크롤 위치에 따른 맨 위로 버튼·내비게이션 배경 변경, 테마 선택 저장·복원을 연결합니다.
- `src/images/`: 웹사이트에서 사용하는 이미지를 보관합니다. 현재 프로필은 직접 작성한 임시 SVG입니다.

## 실행과 확인

1. VS Code에서 저장소 폴더를 엽니다.
2. 확장에서 **Live Server (Ritwick Dey)**를 설치합니다.
3. `src/index.html`을 우클릭하고 **Open with Live Server**를 선택합니다.
4. 브라우저에서 여섯 영역과 프로필 대체 이미지가 보이는지 확인합니다.
5. 내비게이션과 Hero의 링크를 눌러 주소의 `#` 뒤 값과 이동한 영역이 일치하는지 확인합니다. CSS로 부드럽게 이동합니다. 모바일에서는 먼저 메뉴 버튼으로 내비게이션을 엽니다.
6. 개발자 도구의 Network에서 `style.css`, `main.js`, `profile-placeholder.svg`가 정상적으로 로드되는지 확인합니다.
7. 300px 이상 내려가면 오른쪽 아래에 나타나는 ‘맨 위로’ 버튼을 누릅니다. 페이지 맨 위로 이동하고, 300px 미만으로 올라오면 버튼이 숨겨지는지 확인합니다. 이 기능은 JavaScript를 사용합니다.
8. 내비게이션 배경은 60px 이상에서 바뀝니다. 내비게이션은 페이지와 함께 스크롤되므로, 직접 색을 비교할 때는 모바일 너비에서 메뉴를 펼쳐 확인합니다. [비교 방법과 화면](docs/learning/012-conditional-class-toggle.md#5-확인-방법과-결과)

9. 테마 버튼을 누르고 새로고침해 선택이 유지되는지 확인합니다. 다시 누르면 라이트로 돌아가며 이 선택도 저장됩니다.

Live Server를 사용할 수 없다면 저장소 루트에서 `python3 -m http.server 8000 --directory src`를 실행한 뒤 `http://localhost:8000`에 접속할 수 있습니다. 종료는 `Ctrl+C`입니다.

## 현재 구현 범위와 학습 포인트

- 내비게이션은 모바일에서 세로로, 768px 이상에서 가로로 배치합니다. 1024px 이상에서는 메뉴 간격을 넓힙니다. 모바일에서는 햄버거 버튼으로 메뉴를 열고 닫습니다.

- `html`의 `data-theme="dark"` 속성으로 본문 배경·글자·링크 색상을 전환합니다. 테마 버튼으로 전환하고 `localStorage`의 `theme` 키에 선택을 저장해 새로고침 후 복원합니다. 기본값은 라이트입니다. 저장소 사용이 허용된 HTTP 환경을 기준으로 하며 저장 실패 예외 처리는 없습니다. 입력 컨트롤·임시 SVG의 테마 적용은 아직 구현하지 않았습니다.

- `header`는 상단 소개·메뉴, `nav`는 이동 링크, `main`은 본문, `section`은 주제별 영역, `article`은 독립적으로 읽을 수 있는 프로젝트, `footer`는 저작권·소셜 링크를 나타냅니다.
- `href="#about"`은 `id="about"`인 영역으로 이동합니다. `:root`의 `scroll-behavior: smooth`가 이동을 부드럽게 합니다. 앵커 이동을 위한 JavaScript는 필요하지 않습니다. 과제 범위에 맞춰 동작 줄이기 선호에 따라 이동 방식을 바꾸는 처리는 구현 범위에서 제외했습니다.
- 제목은 페이지의 `h1`, 섹션의 `h2`, 프로젝트의 `h3` 순서로 구성했습니다.
- Projects는 현재 저장소를 소개하는 정적 카드입니다. API 결과가 아닙니다. Grid가 화면 폭과 카드 수에 따라 열 수를 정합니다. 현재 카드 하나는 전체 폭을 사용합니다.
- Contact는 이름·이메일·메시지와 연결된 label을 갖춘 구조만 준비했습니다. 검증과 제출 동작을 구현할 때까지 입력과 제출을 비활성화했습니다.
- 자기소개 문구와 임시 프로필 이미지는 추후 실제 소개 내용으로 보완합니다.

## 스크롤 기준값

| 기능 | 기준과 동작 |
| --- | --- |
| 내비게이션 배경 | 60px 이상이면 `scrolled` 클래스로 배경 변경, 60px 미만이면 기본 배경으로 복원 |
| 맨 위로 버튼 | 300px 이상이면 표시, 300px 미만이면 숨김 |

맨 위로 버튼을 클릭하면 `window.scrollTo({ top: 0, behavior: 'smooth' })`로 상단으로 이동합니다. [버튼의 실행 흐름](docs/learning/011-scroll-event.md), [내비게이션 클래스 조건](docs/learning/012-conditional-class-toggle.md)

## 검증 상태

- HTML의 ID 중복 여부, 내부 앵커 대상, label 연결, 로컬 리소스 경로, JavaScript 문법 검사와 SVG 구문 검사를 통과했습니다.
- Chromium 153.0.8010.12, 1280×720, JavaScript 비활성화 조건에서 내부 링크 아홉 개의 클릭, 소개 링크의 Enter 키 이동, `#projects` 직접 접속을 검증했습니다. [검증 조건과 실습 절차](docs/learning/002-anchor-links.md#5-확인-방법과-결과)
- 같은 브라우저·화면 크기에서 JavaScript를 활성화하고 CSS·JavaScript의 200 응답, CSS 적용과 `defer` 실행 시점을 확인했습니다. [외부 파일 연결 검증](docs/learning/003-external-css-javascript.md#5-확인-방법과-결과)
- CSS 변수 변경 시 링크 11개의 색상과 다섯 섹션의 여백이 함께 변경되고 새로고침으로 복원되는지 확인했습니다. [조건과 결과](docs/learning/004-css-custom-properties.md#5-확인-방법과-결과)

- `data-theme`를 dark로 지정했을 때의 색상 변화와 light 지정·속성 제거 시 복원을 검증했습니다. [다크 모드 색상 검증](docs/learning/005-theme-attribute-selector.md#5-확인-방법과-결과)

- 1280×720과 375×720에서 내비게이션 정렬·줄바꿈·가로 넘침과 링크 이동을 검증했습니다. [실행 화면과 결과](docs/learning/006-flexbox-navigation.md#5-확인-방법과-결과)

- 임시 실습 카드 네 개로 1280·768·375·320px 화면에서 Grid의 3·2·1·1열 배치와 가로 넘침을 검증했습니다. [실습 캡처와 결과](docs/learning/007-grid-projects.md#5-확인-방법과-결과)

- 320·375·767·768·1023·1024·1280px에서 미디어 쿼리 조건, 정렬, 가로 넘침을 검증했습니다. [경계 전후 캡처와 결과](docs/learning/008-media-queries.md#5-확인-방법과-결과)

- 모바일 메뉴의 클릭·Enter·Space 조작, 화면 폭에 따른 표시, JavaScript 비활성화 시 링크 사용을 검증했습니다. [메뉴 열림·닫힘 캡처](docs/learning/009-menu-click-event.md#5-확인-방법과-결과)

- 부드러운 스크롤의 중간 위치와 앵커 목적지 도착을 검증했습니다. 모바일 메뉴에서의 이동과 동작 줄이기 분기 제거 후의 동작도 확인했습니다. [검증 목적과 결과](docs/learning/010-smooth-scrolling.md#5-확인-방법과-결과)

- 1280×720과 375×720에서 맨 위로 버튼의 299·300·301px 경계, 상단 이동과 다시 숨김, 앵커 직접 접속·새로고침 시 표시를 검증했습니다. [검증 목적·결과와 표시 화면](docs/learning/011-scroll-event.md#5-확인-방법과-결과)

- 같은 두 화면 크기의 기본·dark 테마에서 내비게이션의 59·60px 경계, 61·62px에서 상태 유지, 기본색 복원과 기존 메뉴·상단 이동 동작을 확인했습니다. [조건별 결과와 배경 비교](docs/learning/012-conditional-class-toggle.md#5-확인-방법과-결과)

- 1280×720·375×720에서 테마 전환과 양방향 새로고침 복원, 저장값·버튼 문구·배경색 일치를 확인했습니다. [검증 절차와 화면](docs/learning/013-local-storage-theme.md#5-확인-방법과-결과)

## 학습 기록

[학습 목록](docs/learning/README.md)에서 개념별 기록을 확인할 수 있습니다.

- [시맨틱 HTML로 페이지 구조 표현하기](docs/learning/001-semantic-html.md): `src/index.html`의 상단 메뉴, 본문, 프로젝트 카드와 하단 정보에 태그를 선택한 이유를 정리했습니다.
- [앵커 링크로 페이지 안에서 이동하기](docs/learning/002-anchor-links.md): 내비게이션과 Hero의 `href`를 각 영역의 `id`에 연결하고, 클릭·키보드 이동 원리와 확인 방법을 정리했습니다.
- [HTML에 외부 CSS와 JavaScript 연결하기](docs/learning/003-external-css-javascript.md): `head`의 파일 경로, 스타일 적용과 `defer` 실행 흐름을 확인했습니다.
- [CSS 변수로 공통 스타일 값 관리하기](docs/learning/004-css-custom-properties.md): `:root`에서 정의한 색상·글꼴·간격을 `var()`로 참조합니다.
- [속성 선택자로 다크 모드 색상 적용하기](docs/learning/005-theme-attribute-selector.md): `data-theme` 값으로 색상 변수의 적용 조건을 정합니다.
- [Flexbox로 내비게이션 배치하기](docs/learning/006-flexbox-navigation.md): nav와 ul의 직접 자식을 각각 정렬하며, 넓은 화면과 좁은 화면 캡처를 제공합니다.
- [Grid로 프로젝트 카드 자동 배치하기](docs/learning/007-grid-projects.md): `auto-fit`과 `minmax()`로 카드 열 너비와 개수를 결정합니다.
- [미디어 쿼리로 화면 폭에 맞게 배치 바꾸기](docs/learning/008-media-queries.md): 모바일을 기본으로 두고 768px·1024px에서 내비게이션 스타일을 추가합니다.
- [클릭 이벤트로 모바일 메뉴 열고 닫기](docs/learning/009-menu-click-event.md): addEventListener와 classList.toggle로 사용자 조작을 화면 변화에 연결합니다.
- [CSS로 앵커 이동을 부드럽게 만들기](docs/learning/010-smooth-scrolling.md): scroll-behavior로 이동 방식을 정합니다. 동작 줄이기의 의미와 도입 배경, 과제 범위에 따라 제외한 이유도 정리했습니다.
- [스크롤 이벤트로 맨 위로 버튼 표시하기](docs/learning/011-scroll-event.md): scroll 이벤트에서 scrollY를 읽고 hidden을 갱신하며, 버튼 클릭을 상단 이동으로 연결합니다.
- [조건에 따라 클래스를 적용해 내비게이션 배경 바꾸기](docs/learning/012-conditional-class-toggle.md): classList.toggle의 조건 인자로 클래스를 적용하고 CSS 배경색을 연결합니다. 구현은 Claude Code에 위임하고 검토·검증·학습 기록은 Codex가 수행했습니다.
- [localStorage로 테마 선택 저장하고 복원하기](docs/learning/013-local-storage-theme.md): 테마 버튼의 클릭을 속성 변경·저장·초기 복원으로 연결합니다. 구현은 Claude Code에 위임하고 검토·검증·학습 기록은 Codex가 수행했습니다.
