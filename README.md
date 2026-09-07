# codyssey_B1-1

순수 HTML, CSS, JavaScript로 나를 소개하는 반응형 포트폴리오 웹사이트를 만드는 학습 프로젝트입니다. DOM 조작, 이벤트, 비동기 요청을 통해 사용자 입력이 상태와 화면 변화로 이어지는 과정을 학습합니다.

현재는 여섯 섹션의 시맨틱 HTML 뼈대와 외부 CSS·JavaScript 연결을 구현한 단계입니다. 반응형 디자인, 인터랙션, API 연동과 배포는 아직 구현하지 않았습니다.

- [과제 요구사항 원문](docs/assignment-requirements.pdf)
- [프로젝트 작업 지침과 요구사항 체크리스트](AGENTS.md)

주요 디렉터리:

- `docs/`: 과제 PDF와 프로젝트 문서를 보관합니다.
- `docs/learning/`: 실제 코드에 적용한 개념과 검증 결과를 기록합니다.
- `src/index.html`: Hero, About, Skills, Projects, Contact, Footer와 섹션 이동 링크를 정의합니다.
- `src/css/`: 스타일시트를 보관합니다. 현재는 가독성을 위한 최소 스타일만 적용했습니다.
- `src/js/`: JavaScript를 보관합니다. 현재는 `defer`로 연결한 파일만 준비했습니다.
- `src/images/`: 웹사이트에서 사용하는 이미지를 보관합니다. 현재 프로필은 직접 작성한 임시 SVG입니다.

## 실행과 확인

1. VS Code에서 저장소 폴더를 엽니다.
2. 확장에서 **Live Server (Ritwick Dey)**를 설치합니다.
3. `src/index.html`을 우클릭하고 **Open with Live Server**를 선택합니다.
4. 브라우저에서 여섯 영역과 프로필 대체 이미지가 보이는지 확인합니다.
5. 내비게이션과 Hero의 링크를 눌러 주소의 `#` 뒤 값과 이동한 영역이 일치하는지 확인합니다. 현재 이동은 기본 HTML 앵커 동작입니다.
6. 개발자 도구의 Network에서 `style.css`, `main.js`, `profile-placeholder.svg`가 정상적으로 로드되는지 확인합니다.

Live Server를 사용할 수 없다면 저장소 루트에서 `python3 -m http.server 8000 --directory src`를 실행한 뒤 `http://localhost:8000`에 접속할 수 있습니다. 종료는 `Ctrl+C`입니다.

## 현재 구현 범위와 학습 포인트

- `header`는 상단 소개·메뉴, `nav`는 이동 링크, `main`은 본문, `section`은 주제별 영역, `article`은 독립적으로 읽을 수 있는 프로젝트, `footer`는 저작권·소셜 링크를 나타냅니다.
- `href="#about"`은 `id="about"`인 영역으로 이동합니다. 기본 앵커 이동에는 JavaScript가 필요하지 않습니다.
- 제목은 페이지의 `h1`, 섹션의 `h2`, 프로젝트의 `h3` 순서로 구성했습니다.
- Projects는 현재 저장소를 소개하는 정적 카드입니다. API 결과가 아닙니다.
- Contact는 이름·이메일·메시지와 연결된 label을 갖춘 구조만 준비했습니다. 검증과 제출 동작을 구현할 때까지 입력과 제출을 비활성화했습니다.
- 자기소개 문구와 임시 프로필 이미지는 추후 실제 소개 내용으로 보완합니다.

## 검증 상태

- HTML의 ID 중복 여부, 내부 앵커 대상, label 연결, 로컬 리소스 경로, JavaScript 문법 검사와 SVG 구문 검사를 통과했습니다.
- Chromium 153.0.8010.12, 1280×720, JavaScript 비활성화 조건에서 내부 링크 아홉 개의 클릭, 소개 링크의 Enter 키 이동, `#projects` 직접 접속을 검증했습니다. [검증 조건과 실습 절차](docs/learning/002-anchor-links.md#5-확인-방법과-결과)
- 같은 브라우저·화면 크기에서 JavaScript를 활성화하고 CSS·JavaScript의 200 응답, CSS 적용과 `defer` 실행 시점을 확인했습니다. [외부 파일 연결 검증](docs/learning/003-external-css-javascript.md#5-확인-방법과-결과)

## 학습 기록

[학습 목록](docs/learning/README.md)에서 개념별 기록을 확인할 수 있습니다.

- [시맨틱 HTML로 페이지 구조 표현하기](docs/learning/001-semantic-html.md): `src/index.html`의 상단 메뉴, 본문, 프로젝트 카드와 하단 정보에 태그를 선택한 이유를 정리했습니다.
- [앵커 링크로 페이지 안에서 이동하기](docs/learning/002-anchor-links.md): 내비게이션과 Hero의 `href`를 각 영역의 `id`에 연결하고, 클릭·키보드 이동 원리와 확인 방법을 정리했습니다.
- [HTML에 외부 CSS와 JavaScript 연결하기](docs/learning/003-external-css-javascript.md): `head`의 파일 경로, 스타일 적용과 `defer` 실행 흐름을 확인했습니다.
