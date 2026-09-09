# CSS로 앵커 이동을 부드럽게 만들기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 4쪽의 부드러운 섹션 이동을 구현한다. [앵커 링크](002-anchor-links.md)가 정한 목적지까지 이동하는 방식을 CSS로 지정한다.

과제의 필수 요구사항은 부드러운 이동이다. 동작 줄이기 대응은 화면 움직임을 줄이려는 사용자의 선택을 반영하기 위해 추가한 보완이다. 목적지로 이동하는 기능은 유지하면서, 그 사이의 애니메이션만 생략할 수 있게 한다.

예를 들어 화면 전체가 위아래로 움직이는 효과를 불편하게 느끼는 사용자는 운영체제에서 동작 줄이기를 켤 수 있다. 페이지 내용을 읽고 링크로 이동하는 데 중간 애니메이션은 꼭 필요하지 않으므로, 이 선호가 전달되면 즉시 이동하도록 한다.

## 2. 핵심 개념

`scroll-behavior`는 앵커 이동처럼 브라우저가 수행하는 스크롤의 방식을 지정하는 CSS 속성이다. `smooth`는 중간 위치를 거쳐 부드럽게 이동하고, `auto`는 즉시 이동한다. 마우스 휠이나 손가락으로 직접 스크롤하는 속도를 정하는 속성은 아니다.

`:root`에 지정하면 페이지를 표시하는 영역인 뷰포트의 스크롤에 적용된다. HTML에서는 최상위 `html` 요소가 이에 해당한다. 이 속성은 자식 요소에 상속되지 않으며, body에만 지정한 값은 뷰포트로 전달되지 않는다.

`prefers-reduced-motion: reduce`는 사용자가 불필요한 움직임을 줄이도록 설정했는지 확인하는 미디어 쿼리다. 앞서 화면 폭으로 CSS 적용 여부를 결정했다면, 여기서는 사용자의 동작 줄이기 설정이 조건이다.

일반적으로 운영체제의 접근성 설정에 있는 동작 줄이기 선호가 브라우저에 전달된다. 이 조건은 선호를 알려 줄 뿐, 사이트에 작성한 모든 애니메이션을 자동으로 제거하는 명령은 아니다. 이번에는 조건이 참일 때 `scroll-behavior`를 `auto`로 바꾸는 규칙을 직접 작성했다.

## 3. 프로젝트 적용

[src/css/style.css](../../src/css/style.css)의 기존 `:root`에 다음 속성을 추가했다. 발췌에서는 색상·간격 변수 선언을 생략했다.

```css
:root {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    scroll-behavior: auto;
  }
}
```

조건에 맞으면 뒤에 작성한 동일 선택자의 auto 선언이 적용된다. 움직임을 줄이면서도 목적지 이동은 유지한다.

이 미디어 쿼리가 없다면 동작 줄이기 선호가 전달되어도 이 CSS에는 smooth를 바꿀 규칙이 없다. 비교 테스트는 추가한 조건부 규칙이 실제로 적용되는지 확인한다.

[src/index.html](../../src/index.html)의 `href="#projects"`와 `id="projects"` 연결을 사용한다. 스크롤을 위한 JavaScript 함수나 라이브러리는 추가하지 않았다. 브라우저의 앵커 기능을 사용하므로 주소의 프래그먼트, 링크의 키보드 조작과 방문 기록도 유지된다.

## 4. 실행 흐름

1. 입력: 내비게이션의 '프로젝트' 링크를 클릭한다. 모바일에서는 먼저 메뉴 버튼을 눌러 링크를 연다.
2. 브라우저가 `href="#projects"`에서 이동할 요소를 찾고 주소 끝을 갱신한다.
3. 일반 설정에서는 smooth를 적용해 스크롤 위치가 중간 지점들을 거쳐 변한다.
4. 결과: 프로젝트 영역이 화면에 나타난다. 동작 줄이기 설정에서는 auto를 적용해 바로 이동한다.

이동 시간과 속도 곡선은 브라우저가 결정한다. 코드에서 시간을 지정하지 않았다. `#projects`가 주소에 표시되는 시점과 스크롤이 끝나는 시점은 다를 수 있다.

## 5. 확인 방법과 결과

### 비교하는 목적

같은 링크를 두 설정에서 눌러 다음을 확인한다.

| 확인할 조건 | 기대하는 CSS와 동작 | 검증 목적 |
| --- | --- | --- |
| 동작 줄이기 요청 없음 | smooth로 중간 위치를 거쳐 이동 | 과제의 부드러운 이동이 동작하는지 확인 |
| 동작 줄이기 요청 있음 | auto로 즉시 이동 | 사용자의 선호에 따라 애니메이션을 생략하는지 확인 |
| 두 조건 공통 | `#projects`로 주소가 바뀌고 프로젝트 영역에 도착 | 설정 변경 후에도 링크의 기본 기능이 유지되는지 확인 |

### 개발자 도구의 메뉴와 패널

- **Command Menu(명령 메뉴)**: 개발자 도구의 기능을 이름으로 검색해 실행하는 창이다. Console처럼 JavaScript를 입력하는 곳이 아니며, 상시 표시되는 탭도 아니다.
- **Show Rendering**: Rendering 패널을 여는 명령의 이름이다. 검색창에서 선택하고 Enter를 누르면 된다.
- **Rendering(렌더링) 패널**: 브라우저가 페이지를 화면에 그리는 동작을 관찰하거나 표시 조건을 바꿔 보는 도구다.
- **Emulate CSS media feature prefers-reduced-motion**: 실제 운영체제 설정을 바꾸지 않고, 현재 검사하는 페이지에 동작 줄이기 선호가 전달된 상황을 재현한다. 이렇게 조건을 흉내 내는 것을 에뮬레이션이라고 한다. CSS 파일을 편집하거나 사이트 설정을 저장하는 기능은 아니다.

### 실습 순서

1. [README의 실행 방법](../../README.md#실행과-확인)에 따라 페이지를 연다. 화면 폭은 비교하는 동안 동일하게 유지한다.
2. Chrome에서 `F12` 또는 `Ctrl+Shift+I`로 개발자 도구를 연다. Mac에서는 `Command+Option+I`를 사용한다.
3. 개발자 도구 안을 클릭하고 `Ctrl+Shift+P`를 누른다. Mac에서는 `Command+Shift+P`다. 또는 개발자 도구 오른쪽 위 `⋮` 메뉴의 **Run command**를 선택한다.
4. 열린 명령 메뉴에 `Show Rendering`을 입력하고 해당 명령을 선택해 Enter를 누른다. 한국어 UI에서 검색 결과가 다르면 `Rendering` 또는 `렌더링`으로 검색한다.
5. 열린 Rendering 패널에서 **Emulate CSS media feature prefers-reduced-motion** 항목을 찾는다.
6. `prefers-reduced-motion: no-preference`를 선택해 동작 줄이기를 요청하지 않은 조건으로 맞춘다. 맨 위에서 '프로젝트' 링크를 누르고 부드러운 이동을 관찰한다. 모바일에서는 먼저 메뉴 버튼을 연다.
7. 같은 드롭다운을 `prefers-reduced-motion: reduce`로 바꾼다. 다시 맨 위로 이동한 후 같은 링크를 누른다. 중간 애니메이션 없이 프로젝트 영역에 도착하는지 확인한다.
8. 두 경우 모두 주소 끝이 `#projects`이고 목적지가 동일한지 확인한다. 이미 목적지에 있으면 움직일 거리가 없으므로 매번 출발 위치를 맨 위로 맞춘다.
9. 실습 후 **No emulation**으로 돌린다. 그러면 강제한 조건을 해제하고 실제 환경 설정을 다시 사용한다.

`No emulation`은 에뮬레이션 해제이고 `no-preference`는 동작 줄이기 요청이 없는 조건을 강제하는 값이다. 운영체제가 이미 동작 줄이기를 켜 둔 경우 두 값의 결과가 다를 수 있다. 이 CSS 조건은 설정을 바꾸면 다시 평가되므로 비교를 위해 새로고침할 필요는 없다.

### 확인한 결과

2026-09-09 로컬 HTTP 서버, Chromium 153.0.8010.12, Playwright 1.63.0, 한글 나눔 글꼴을 사용할 수 있는 환경에서 검증했다. 자동 검증에서는 브라우저의 동작 줄이기 조건을 지정하고 스크롤 위치를 관찰했다. 위의 명령 메뉴 조작은 같은 조건을 사람이 직접 비교하기 위한 절차다.

일반 설정에서 클릭 후 관찰한 값 중 일부:

| 클릭 후 경과 시간 | 문서 위쪽으로부터 스크롤 위치 |
| --- | --- |
| 0ms | 0px |
| 88ms | 111px |
| 155ms | 489px |
| 305ms | 732px |
| 455ms | 776px |

위 수치는 해당 실행의 관찰값이며 성능 목표나 고정된 애니메이션 시간은 아니다.

- 768×600 일반 설정: 계산된 scroll-behavior는 smooth이며 여러 중간 위치를 거쳐 약 776px에 도착했다.
- 375×720 모바일: 메뉴를 연 뒤 링크를 누르면 여러 중간 위치를 거쳐 약 954px에 도착했다.
- 768×600 reduce 설정: 계산된 값은 auto이며 첫 관찰 프레임에서 목적지 776px에 도착했다.
- JavaScript 비활성화 조건에서도 부드러운 앵커 이동과 도착을 확인했다.
- 1280×720에서 소개 링크의 Enter 키 이동과 브라우저 뒤로 가기를 확인했다. 검증한 페이지의 JavaScript 오류는 없었다.

## 6. 질문과 추가 확인

질문: 개발자 도구의 명령 메뉴와 Show Rendering은 무엇이며, 동작 줄이기 설정과 비교 테스트를 왜 넣었는가?

명령 메뉴는 Rendering 패널을 찾는 진입점이다. Rendering의 에뮬레이션으로 두 사용자 설정을 같은 환경에서 비교한다. 일반 설정의 부드러운 이동과 동작 줄이기 설정의 즉시 이동이 각각 적용되고, 두 경우 모두 같은 목적지에 도착하는지 확인하는 것이 목적이다. 동작 줄이기 대응은 과제 필수 항목과 구분한 보완이다.

추가 확인: 주소의 `#projects`는 목적지를, scroll-behavior는 이동 방식을 정한다. 부드러운 이동이 보이지 않으면 동작 줄이기 설정과 최상위 요소에 적용된 CSS 값을 확인한다. 목적지가 문서 하단에 가까우면 남은 스크롤 공간 때문에 화면 맨 위까지 올라오지 않을 수 있다.

## 7. 참고자료

- [과제 PDF 4쪽](../assignment-requirements.pdf): 부드러운 스크롤 요구사항.
- [W3C CSS Overflow Level 3 — Smooth Scrolling](https://www.w3.org/TR/css-overflow-3/#smooth-scrolling): scroll-behavior의 값, 최상위 요소 적용과 브라우저가 정하는 이동 시간. 2025-10-07 Working Draft.
- [W3C Media Queries Level 5 — prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion): 동작 줄이기 선호 설정을 감지하는 조건.
- [Chrome DevTools — Command Menu](https://developer.chrome.com/docs/devtools/command-menu#open): 명령 메뉴를 여는 단축키와 Run command 경로.
- [Chrome DevTools — Rendering 패널 개요](https://developer.chrome.com/docs/devtools/rendering): Show Rendering 명령으로 패널을 여는 과정과 실제 환경·코드 변경 없이 표시 조건을 재현하는 역할.
- [Chrome DevTools — 동작 줄이기 에뮬레이션](https://developer.chrome.com/docs/devtools/rendering/emulate-css#emulate_css_media_feature_prefers-reduced-motion): Rendering 패널에서 선호 조건을 바꿔 비교하는 방법.

참고자료 확인일: 2026-09-09.
