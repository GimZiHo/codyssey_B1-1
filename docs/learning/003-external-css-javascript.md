# HTML에 외부 CSS와 JavaScript 연결하기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 3~4쪽의 외부 스타일시트·JavaScript 연결과 `defer` 요구사항을 다룬다. HTML은 내용의 구조, CSS는 표현, JavaScript는 동작을 맡도록 파일을 나누고 브라우저가 이 파일들을 읽는 과정을 확인한다.

## 2. 핵심 개념

외부 파일은 HTML 밖에 별도로 저장한 파일을 뜻한다. 외부 라이브러리를 사용한다는 의미가 아니다.

| 코드 | 역할 |
| --- | --- |
| `link` | HTML과 다른 리소스의 관계를 선언한다. |
| `rel="stylesheet"` | 연결한 파일을 스타일시트로 사용하도록 지정한다. |
| `href="css/style.css"` | CSS 파일의 경로를 지정한다. |
| `script` | JavaScript를 연결한다. 끝 태그가 필요하다. |
| `src="js/main.js"` | 실행할 JavaScript 파일의 경로를 지정한다. |
| `defer` | 외부 일반 스크립트를 HTML 분석이 끝난 뒤 실행하도록 한다. |

상대경로는 기준 위치에서 파일을 찾는 경로다. 이 프로젝트는 `base` 요소를 지정하지 않았으므로 HTML 문서의 주소를 기준으로 경로를 해석한다. `src/index.html`과 나란히 있는 `css` 폴더를 가리키려면 `css/style.css`를 쓴다. `src/css/style.css`라고 쓰면 `src`를 한 번 더 찾는 잘못된 경로가 될 수 있다.

`defer`가 있는 현재의 일반 외부 스크립트는 HTML을 분석하는 동안 내려받고, 문서 분석이 끝난 뒤 실행한다. 따라서 본문 요소가 아직 만들어지지 않은 시점에 접근하는 문제를 피할 수 있다. 이미지 등 모든 리소스의 로드가 끝날 때까지 기다린다는 뜻은 아니다.

## 3. 프로젝트 적용

이 문서의 주석뿐인 JavaScript와 실행 결과는 외부 파일 연결 당시의 상태다. 현재 main.js에는 [모바일 메뉴 클릭 이벤트](009-menu-click-event.md)가 추가되어 있으며 Network에서 해당 코드를 확인할 수 있다.

[src/index.html](../../src/index.html)의 `head`에 다음 두 줄이 있다.

```html
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js" defer></script>
```

- [src/css/style.css](../../src/css/style.css): 본문 여백과 입력 요소의 기본 표시 등 최소 스타일을 정의한다.
- [src/js/main.js](../../src/js/main.js): 현재 주석만 있다. 파일은 로드되지만 화면을 변경하는 실행 코드는 없다. 이벤트 기능은 이후 이 파일에 작성한다.

CSS 적용을 관찰할 때는 `body` 규칙의 `padding: var(--space-page)` (`--space-page: 1rem`)을 사용한다. `padding`은 요소 안쪽의 여백이며, `rem`은 루트 요소의 글자 크기를 기준으로 하는 단위다. 루트 글자 크기가 16px인 검증 환경에서 `1rem`은 16px이다.

## 4. 실행 흐름

1. 브라우저가 `index.html`을 받아 구조를 분석한다.
2. `link`와 `script`의 경로를 해석해 CSS와 JavaScript 파일을 요청한다.
3. CSS의 규칙이 해당 요소에 적용되어 본문 여백 등이 표시된다.
4. HTML 분석이 끝나면 `defer`로 연결한 JavaScript를 실행한다. 현재는 주석뿐이므로 추가 동작이 없다.

입력은 HTML의 파일 경로와 각 파일의 내용이다. 결과는 CSS가 적용된 화면과 연결된 JavaScript의 실행이다. CSS와 JavaScript 요청이 언제 완료되는지는 네트워크 상황에 따라 달라질 수 있다.

## 5. 확인 방법과 결과

실습 절차와 예상 동작:

1. [README의 실행 방법](../../README.md#실행과-확인)에 따라 페이지를 연다.
2. 개발자 도구의 Network(네트워크) 탭을 연 뒤 새로고침한다. `style.css`와 `main.js` 요청이 나타나는지 확인한다.
3. 각 요청의 Response(응답)에서 실제 파일 내용이 맞는지 확인한다. 캐시를 끈 새 요청은 200, 캐시 재검증 시에는 304가 표시될 수 있다. 404는 경로에 해당하는 파일을 찾지 못했다는 뜻이다.
4. Elements(요소) 탭에서 `body`를 선택하고 Styles(스타일)에서 `padding: var(--space-page)` 왼쪽 체크를 해제한다. 본문 안쪽 여백이 줄어든다. 다시 체크하면 복원된다. 이 조작은 개발자 도구에서의 임시 변경이다.
5. `main.js` 응답에 주석만 있는지 확인한다. 이 단계에서 화면 동작이나 콘솔 메시지가 추가되지 않는 것은 정상이다.

2026-09-07 검증 결과: 로컬 HTTP 서버와 Chromium 153.0.8010.12, 화면 크기 1280×720, JavaScript 활성화 조건에서 Playwright 1.63.0으로 확인했다.

- CSS와 JavaScript 모두 200으로 응답했고 페이지 JavaScript 오류는 없었다.
- 적용된 본문 위쪽 padding은 16px, label의 display는 block이었다.
- 브라우저에서 스타일시트 전체를 임시로 비활성화하자 각각 0px, inline으로 바뀌었다. 외부 CSS의 실제 적용을 확인했다.
- 별도 페이지에서 `main.js` 응답 끝에 문서 상태를 기록하는 임시 관찰 코드를 붙였다. 실행 시 문서 상태는 `interactive`(HTML 분석 완료)였고 Footer 요소가 존재했다. 프로젝트 파일은 변경하지 않았다.

## 6. 질문과 추가 확인

질문: Network 탭의 Status 코드는 무엇을 뜻하는가?

HTTP 상태 코드는 서버가 요청의 처리 결과를 알려주는 세 자리 숫자다. 각 행은 HTML, CSS, JavaScript 등 개별 리소스 요청에 해당한다. 첫 자리가 1이면 중간 안내, 2이면 성공, 3이면 리다이렉션 등 추가 처리, 4이면 요청 관련 오류, 5이면 서버 오류를 뜻한다.

| 코드 | 의미 | 파일 연결에서 확인할 점 |
| --- | --- | --- |
| 200 OK | 요청 성공 | Response에서 요청한 파일 내용이 맞는지 확인한다. |
| 304 Not Modified | 조건부 요청에서 파일이 변경되지 않음 | 브라우저에 저장한 캐시를 재사용한다. 오류가 아니다. |
| 301 / 302 | 다른 주소로 이동하도록 응답 | 이어지는 요청의 주소와 결과를 확인한다. |
| 403 Forbidden | 서버가 요청 처리를 거부 | 접근 제한 등을 확인한다. |
| 404 Not Found | 요청한 리소스를 찾지 못함 | 파일 경로·이름·대소문자를 확인한다. |
| 500 Internal Server Error | 서버 내부에서 예상하지 못한 오류 발생 | 서버 로그를 확인한다. |

캐시는 이미 받은 내용을 저장해 재사용하는 방식이다. 예를 들어 `style.css`가 304이면 서버가 새 파일 본문을 보내지 않고 기존 사본을 사용하게 한다. 200은 요청 성공을 뜻하며 CSS나 JavaScript 코드 자체의 올바른 동작까지 보장하지 않는다. 요청을 클릭해 Headers의 Request URL과 Status Code, Response의 내용을 함께 확인한다. 위 표는 코드의 의미 설명이며, 이 프로젝트에서 실제 확인한 응답은 5절의 200이다.

- CSS가 적용되지 않으면 파일이 존재하는지만 보지 말고 Network의 요청 주소와 응답 내용도 확인한다.
- `defer`는 파일 로드 실패를 해결하는 속성이 아니다. 경로가 틀리면 먼저 경로를 수정한다.

## 7. 참고자료

- [과제 PDF 3~4쪽](../assignment-requirements.pdf): 외부 파일 분리·연결과 defer 요구사항.
- [WHATWG HTML — The link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): 스타일시트 연결에 사용하는 rel과 href.
- [WHATWG HTML — defer](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer): 일반 외부 스크립트의 다운로드와 실행 시점.
- [RFC 9110 — Status Codes, 15절](https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes): Network에서 확인하는 HTTP 상태 코드의 분류와 의미.

HTML Living Standard를 2026-09-07에 확인했다.
