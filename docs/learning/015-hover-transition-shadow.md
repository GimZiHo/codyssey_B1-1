# hover와 transition, box-shadow로 버튼과 카드에 반응 만들기

## 1. 학습 목적

포인터를 올렸을 때 버튼·링크·카드가 반응하게 만든다. JavaScript 없이 CSS만으로 상태 변화를 표현하고, 값이 즉시 튀지 않고 정해진 시간 동안 변하도록 `transition`을 연결하는 구조를 익힌다. 카드에는 `box-shadow`로 깊이를 주어 hover에서 떠오르는 느낌을 만든다.

요구사항의 "버튼과 카드에 hover 효과와 transition을, 카드에 box-shadow를 적용한다"에 해당한다.

## 2. 핵심 개념

### `:hover` — 포인터가 올라간 상태를 고르는 선택자

`:hover`는 **의사 클래스(pseudo-class)** 다. 의사 클래스는 HTML에 없는 상태를 선택자에 덧붙여 "이 요소가 지금 이런 상태일 때만"이라는 조건을 만든다. `:hover`는 마우스나 펜 같은 **포인팅 장치**가 요소를 가리키는 동안 일치하며, 보통 버튼을 누르지 않고 커서를 올려놓은 상태를 뜻한다.

중요한 점은 이것이 **JavaScript 이벤트가 아니라는 것**이다. `mouseover` 이벤트를 듣고 클래스를 붙이는 방식과 달리, 브라우저가 포인터 위치에 따라 규칙의 적용 여부를 직접 결정한다. 그래서 이번 단계에서는 `main.js`를 전혀 바꾸지 않았다.

터치스크린에서는 브라우저마다 동작이 달라서 `:hover`가 아예 일치하지 않거나, 터치한 순간에만 잠깐 일치하거나, 다른 요소를 터치할 때까지 계속 남아 있을 수 있다. 그래서 hover는 **있으면 좋은 보조 표현**으로만 쓰고, 클릭·이동 같은 실제 기능은 hover 없이도 동작해야 한다. 이 프로젝트의 hover는 색·위치·그림자만 바꾸고 기능은 바꾸지 않는다.

### `:enabled` — 조작할 수 있는 폼 요소만 고르기

`:enabled`는 `button`, `input`, `select`, `textarea`처럼 활성화될 수 있는 폼 요소 중 **비활성 상태가 아닌 것**에 일치한다. 반대는 `:disabled`다.

문의 폼은 아직 검증·제출을 구현하지 않아 `<fieldset disabled>`로 묶어 두었다. `fieldset`에 `disabled`를 주면 첫 번째 `legend` 안의 컨트롤을 제외한 모든 자손 폼 컨트롤이 비활성화된다. 즉 `<button type="submit">`에 `disabled` 속성을 직접 쓰지 않아도 그 버튼은 비활성 상태이며 `:disabled`에 일치하고 `:enabled`에는 일치하지 않는다.

hover 선택자에 `:enabled`를 함께 쓰면 "지금 누를 수 있는 버튼만 반응한다"는 조건이 선택자에 그대로 드러난다. 누를 수 없는 버튼이 마치 눌릴 것처럼 반응하는 상황을 막는 장치다.

### `transition` — 값이 변하는 과정을 시간에 펼치기

`transition`은 속성값이 바뀔 때 **그 변화를 정해진 시간 동안 중간값으로 채우는** 단축 속성이다. 아래 다섯 속성을 한 줄로 묶는다.

| 구성 속성 | 의미 | 초기값 |
| --- | --- | --- |
| `transition-property` | 전환할 속성 이름 | `all` |
| `transition-duration` | 전환에 걸리는 시간 | `0s` |
| `transition-timing-function` | 시간에 따른 진행 속도 | `ease` |
| `transition-delay` | 시작 전 대기 시간 | `0s` |
| `transition-behavior` | 중간값이 없는 속성의 처리 방식 | `normal` |

단축 표기에서 시간 값은 나온 순서대로 해석한다. 첫 번째 시간이 `duration`, 두 번째 시간이 `delay`다. `transition: color 0.2s ease`는 "`color`가 바뀌면 0.2초 동안 `ease` 곡선으로 변화"라는 뜻이고, `delay`는 기본값 `0s`라 곧바로 시작한다. **`duration`의 초기값이 `0s`라서, 시간을 적지 않으면 전환은 일어나지 않고 값이 즉시 바뀐다.**

`ease`는 기본 timing function으로, 처음에는 천천히 시작해 빠르게 가속한 뒤 끝에서 다시 느려지는 곡선이다. 등속인 `linear`보다 자연스럽게 멈추는 느낌을 준다.

전환할 속성이 여러 개면 쉼표로 나열한다. `transition: color 0.2s ease, background-color 0.2s ease`처럼 각각 시간을 따로 줄 수 있다. `all`로 한 번에 지정할 수도 있지만, 바뀌는 속성을 이름으로 적어 두면 어떤 값이 애니메이션 대상인지 코드에서 바로 읽힌다.

**전환 선언은 기본 상태에 둔다.** 이번 개념에서 가장 틀리기 쉬운 지점이다. `transition`은 "지금 적용 중인 규칙"의 값을 기준으로 동작하므로, `:hover` 안에만 선언하면 포인터를 올릴 때는 `:hover` 규칙이 적용 중이라 전환이 되지만, 포인터를 빼는 순간 `:hover` 규칙이 사라져 `transition` 선언도 함께 사라진다. 그 결과 **들어갈 때는 부드럽고 나올 때는 즉시 되돌아가는** 어색한 동작이 된다. 기본 상태(`button`, `.cta`, `#project-list article`)에 선언하면 진입과 이탈 모두 같은 0.2초가 적용된다.

### `box-shadow` — 그림자의 위치·번짐·색

`box-shadow`의 값은 순서로 구분한다.

```css
box-shadow: <offset-x> <offset-y> <blur-radius> <spread-radius> <color>;
```

| 값 | 의미 | 생략했을 때 |
| --- | --- | --- |
| `offset-x` | 가로 이동 거리. 음수면 왼쪽 | 필수 |
| `offset-y` | 세로 이동 거리. 음수면 위쪽 | 필수 |
| `blur-radius` | 흐림 정도. 클수록 넓고 옅게 퍼진다 | `0`(선명한 그림자) |
| `spread-radius` | 그림자 크기 확대·축소 | `0` |
| `color` | 그림자 색 | 요소의 `color` 값 |

이 프로젝트의 카드는 `0 1px 3px`(기본)와 `0 8px 16px`(hover)를 쓴다. 가로 이동은 0으로 두어 빛이 정면 위에서 내려오는 것처럼 보이게 하고, 세로 거리와 번짐을 함께 키워 **면에서 멀어질수록 그림자가 아래로 내려가고 옅게 퍼진다**는 실제 그림자의 규칙을 따랐다.

`box-shadow`는 박스 모델의 크기에 영향을 주지 않는다. 그림자가 커져도 카드의 너비·높이와 주변 요소의 위치는 그대로이므로, hover할 때 레이아웃이 밀리지 않는다.

그림자 색은 테마마다 달라야 한다. 밝은 배경에서는 어두운 남색 계열 반투명이 자연스럽지만, 다크 테마의 어두운 배경에서 같은 색을 쓰면 배경과 구분되지 않는다. 그래서 색만 `--color-card-shadow` 변수로 분리해 `[data-theme="dark"]`에서 더 진한 검정으로 바꾼다.

### `transform`과 배치

hover에서 요소를 살짝 띄우는 데에는 `transform: translateY()`를 쓴다. `margin`은 여백을 바꿔 주변 요소의 배치에 영향을 줄 수 있다. `transform`은 배치된 요소의 시각적 위치를 옮기므로 문서 흐름에서 차지하는 자리와 주변 요소의 위치가 변하지 않는다. `top`의 영향은 `position` 값에 따라 달라진다. 예를 들어 `position: relative`의 `top`도 주변 요소를 밀지 않으므로, `top`은 언제나 주변 배치를 바꾼다고 이해하면 안 된다. 그래서 카드가 떠올라도 Grid의 열 배치는 흔들리지 않는다.

대신 두 가지 제약이 있다.

- `transform`은 **transformable 요소**에만 적용된다. 비대체 인라인 박스(`display: inline`인 일반 요소), 표의 열·열그룹 박스는 제외다. Hero의 CTA는 `<a>`라 기본이 인라인이므로 `display: inline-block`으로 바꿔야 이동이 적용된다.
- 값이 `none`이 아니면 **스태킹 컨텍스트**가 만들어지고, 그 요소가 자손의 `position: absolute`·`fixed`의 기준(포함 블록)이 된다. 지금은 카드와 CTA 안에 위치 지정 요소가 없어 영향이 없지만, 이후 카드 안에 배지나 오버레이를 겹칠 때 기준이 뷰포트가 아니라 카드가 된다는 점을 기억해야 한다.

## 3. 프로젝트 적용

### 그림자 색 변수

[style.css](../../src/css/style.css)의 `:root`와 다크 테마 블록에 색만 추가했다.

```css
:root {
  /* 카드 그림자 색. 테마마다 밝기가 달라야 보이므로 변수로 분리한다. */
  --color-card-shadow: rgba(15, 23, 42, 0.25);
}

[data-theme="dark"] {
  --color-card-shadow: rgba(0, 0, 0, 0.6);
}
```

### 버튼

전환은 모든 버튼의 기본 상태에 한 번만 선언하고, hover 규칙은 세 버튼을 묶어 색을 서로 바꾼다.

```css
/* 전환은 기본 상태에 선언한다. hover로 들어갈 때와 벗어나 돌아올 때 모두 0.2초가 적용된다. */
button {
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* 포인터가 올라간 버튼의 색을 반전한다. :enabled로 조작 가능한 버튼만 골라 비활성 버튼은 제외한다. */
#menu-toggle:enabled:hover,
#theme-toggle:enabled:hover,
#scroll-top:enabled:hover {
  color: var(--color-background);
  background-color: var(--color-text);
}
```

글자색과 배경색을 테마 변수로 맞바꾸므로 라이트·다크 어느 테마에서도 대비가 유지된다. `#scroll-top`은 기본 글자색이 이미 `--color-background`라서 배경만 링크색에서 글자색으로 바뀐다.

**선택자를 id로 적은 이유**는 명시도 때문이다. `#menu-toggle`의 기본 규칙은 id 선택자를 포함해 명시도가 `(1, 0, 0)`이다. hover 규칙을 `button:enabled:hover`로 쓰면 명시도가 `(0, 2, 1)`이라 기본 규칙에 밀려 색이 바뀌지 않는다. id에 `:enabled:hover`를 붙이면 `(1, 2, 0)`이 되어 기본 규칙을 덮는다.

비활성 상태인 문의 폼의 제출 버튼은 이 선택자에 포함되지 않고, `:enabled`에도 걸리지 않아 hover에서 제외된다.

### Hero CTA

CTA(Call to Action)는 다음 행동을 유도하는 요소다. 여기서는 프로젝트와 문의 영역으로 이동하는 링크 두 개를 뜻한다.

[index.html](../../src/index.html)의 Hero 링크 두 개에 `cta` 클래스를 붙여 선택 대상을 만들었다.

```html
<a class="cta" href="#projects">프로젝트 보기</a>
<a class="cta" href="#contact">문의하기</a>
```

```css
/* Hero의 CTA 링크. transform은 인라인 요소에 적용되지 않아 inline-block으로 바꾼다. */
.cta {
  display: inline-block;
  transition: color 0.2s ease, transform 0.2s ease;
}

.cta:hover {
  color: var(--color-text);
  transform: translateY(-2px);
}
```

CTA는 버튼이 아니라 링크이므로 `:enabled`를 쓰지 않는다. `:enabled`는 폼 컨트롤의 상태를 나타내는 선택자라 `<a>`에는 해당하지 않는다.

### 프로젝트 카드

```css
/* 카드의 평소 그림자. 아래로 1px 내려간 위치에 3px 번짐을 둔다. */
#project-list article {
  padding: var(--space-page);
  border: 1px solid currentColor;
  overflow-wrap: anywhere;
  box-shadow: 0 1px 3px var(--color-card-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* 카드를 4px 띄우고 그림자를 더 멀고 크게 만들어 떠오르는 느낌을 준다. */
#project-list article:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px var(--color-card-shadow);
}
```

카드 그림자 요구사항을 충족하도록 기본 상태에도 그림자를 두었고, hover에서는 값을 키웠다. 위로 4px 올라가는 거리와 그림자가 아래로 내려가는 거리를 함께 키워 카드가 바닥에서 떨어진 것처럼 보이게 했다.

## 4. 실행 흐름

카드에 포인터를 올렸다가 빼는 과정을 시간 순서로 보면 다음과 같다.

1. **진입 전** — `#project-list article` 규칙만 적용된다. `box-shadow`는 `0 1px 3px`, `transform`은 `none`이다.
2. **포인터 진입** — 브라우저가 `:hover` 상태를 만들고 `#project-list article:hover` 규칙을 함께 적용한다. 목표값은 `0 8px 16px`와 `translateY(-4px)`다.
3. **전환 시작** — 기본 상태의 `transition`이 두 속성을 대상으로 지정해 두었으므로 값이 즉시 바뀌지 않는다. 0.2초 동안 `ease` 곡선을 따라 중간값이 계산된다. 약 90ms 시점의 실제 측정값은 `0 6.6px 13.4px`, `translateY(-3.2px)`였다. `ease`는 앞부분이 빠르므로 절반의 시간에 이미 80% 가까이 진행한다.
4. **전환 완료** — 0.2초가 지나면 목표값에 도달해 `0 8px 16px`, `translateY(-4px)`로 멈춘다. 포인터가 그대로 있는 동안 이 상태가 유지된다.
5. **포인터 이탈** — `:hover` 조건이 거짓이 되어 hover 규칙이 빠진다. 기본 상태의 값이 새 목표가 되고, `transition` 선언은 기본 상태에 있으므로 그대로 살아 있다. 약 90ms 시점 측정값은 `0 2.4px 5.6px`, `translateY(-0.79px)`였다.
6. **복귀 완료** — 다시 0.2초 뒤 `0 1px 3px`, `transform: none`으로 돌아온다.

버튼도 같은 순서이며 바뀌는 속성만 `color`·`background-color`다. 라이트 테마의 테마 버튼은 글자 `rgb(31, 41, 55)`·배경 `rgb(255, 255, 255)`에서 시작해 중간에 글자 `rgb(211, 213, 215)`·배경 `rgb(75, 83, 95)`를 거쳐 글자 `rgb(255, 255, 255)`·배경 `rgb(31, 41, 55)`로 뒤집힌다.

## 5. 확인 방법과 결과

### 직접 확인하는 절차

[README의 실행 방법](../../README.md#실행과-확인)으로 페이지를 연 뒤 확인한다. hover는 포인터가 필요하므로 마우스로 확인하고, 개발자 도구 Elements의 **:hov** 패널에서 `:hover` 상태를 강제로 켜 두면 값을 천천히 읽을 수 있다. Styles 패널에서 어떤 규칙이 적용되었는지, Computed 패널에서 실제 값이 얼마인지 본다.

| 확인 항목 | 기대 동작 | 확인하는 이유 |
| --- | --- | --- |
| 메뉴·테마·맨 위로 버튼 hover | 메뉴·테마는 색 반전, 맨 위로는 배경색 변경 | hover 규칙이 기본 규칙의 명시도를 넘는지 |
| 버튼에서 포인터 이탈 | 원래 색으로 되돌아옴 | 전환을 기본 상태에 선언한 효과 |
| 문의 폼 제출 버튼 hover | 아무 변화 없음 | `:enabled`로 비활성 버튼을 제외했는지 |
| Hero CTA hover | 2px 위로 이동하고 글자색이 바뀜 | 인라인 요소의 `transform` 적용 여부 |
| Hero CTA 클릭 | 해당 섹션으로 이동 | hover 스타일이 기존 앵커 기능을 막지 않는지 |
| 카드 기본 상태 | 아래쪽에 옅은 그림자 | 기본 `box-shadow` 적용 여부 |
| 카드 hover | 위로 떠오르며 그림자가 커짐 | 두 속성이 함께 전환되는지 |
| 다크 테마 카드 | 그림자 색이 검정 계열로 바뀜 | 그림자 변수의 테마 전환 |
| 기존 메뉴·테마·맨 위로 | 이전과 동일 | 회귀 여부 |
| Console | 오류 없음 | |

### 실제 검증 결과

Ubuntu 24.04, Node.js 24.18.1, Playwright 1.63.0, Chromium 153.0.8010.12에서 임시 HTTP 서버로 실행하고 **1280×720·375×720 × 라이트·다크 네 조합**을 모두 검사했다. 각 대상마다 포인터를 올리기 전, 진입 90ms, 진입 완료(400ms), 이탈 90ms, 이탈 완료의 computed style을 읽어 다음을 확인했다.

- **전환 시간이 실제로 작동한다.** 네 조합 모두 진입 90ms의 값이 시작값·완료값 어느 쪽과도 달랐고, 이탈 90ms의 값도 hover 값·복귀값과 달랐다. 값이 즉시 바뀌는 것이 아니라 중간값을 거친다는 뜻이다.
- **이탈 후 기본값으로 정확히 복귀했다.** 모든 대상에서 이탈 완료 시점의 값이 진입 전 값과 같았다.
- **버튼 색 반전.** 라이트 테마 테마 버튼은 `rgb(31, 41, 55)`/`rgb(255, 255, 255)` → `rgb(255, 255, 255)`/`rgb(31, 41, 55)`로, 다크 테마에서는 `rgb(243, 244, 246)`/`rgb(17, 24, 39)` → `rgb(17, 24, 39)`/`rgb(243, 244, 246)`로 뒤집혔다. 맨 위로 버튼은 배경이 `rgb(29, 78, 216)` → `rgb(31, 41, 55)`(라이트), `rgb(147, 197, 253)` → `rgb(243, 244, 246)`(다크)로 바뀌었다. 375px에서는 햄버거 버튼도 같은 방식으로 반전했다.
- **비활성 제출 버튼은 제외됐다.** `:disabled`에 일치하고 `:enabled`에는 일치하지 않음을 확인했고, 포인터를 올려도 색·`transform`·`box-shadow`가 `rgba(16, 16, 16, 0.3)`/`rgba(239, 239, 239, 0.3)`/`none`/`none`으로 전혀 변하지 않았다. 진입 90ms 값도 기본값과 같아 전환 자체가 시작되지 않았다.
- **CTA 이동.** `display`가 `inline-block`이고 기본 `transform`이 `none`, hover 완료 시 `matrix(1, 0, 0, 1, 0, -2)`(= `translateY(-2px)`)였다. 중간값은 `-1.60px` 부근이었다. 글자색은 라이트에서 `rgb(29, 78, 216)` → `rgb(31, 41, 55)`로 바뀌었다.
- **CTA 클릭 이동 유지.** '프로젝트 보기'를 클릭해 주소의 해시가 `#projects`가 되고 실제로 스크롤이 이동하는 것을 네 조합에서 확인했다.
- **카드 그림자 변화.** 라이트 기본 `rgba(15, 23, 42, 0.25) 0px 1px 3px 0px` → hover `… 0px 8px 16px 0px`, 다크 기본 `rgba(0, 0, 0, 0.6) 0px 1px 3px 0px` → hover `… 0px 8px 16px 0px`. `transform`은 `none` → `matrix(1, 0, 0, 1, 0, -4)`였다. 테마에 따라 그림자 색이 실제로 달라지는 것도 확인했다.
- **기존 기능 유지.** 첫 화면 Hero의 불투명도 `1`(Observer 등장 효과), 스크롤 60px 이상에서 `nav`의 `scrolled` 유지와 상단 복귀 시 해제, 맨 위로 버튼의 표시·클릭 후 `scrollY` 0·재숨김, 375px 모바일 메뉴 열고 닫기, 새로고침 후 테마 복원, 문의 폼 `fieldset`의 `disabled` 유지를 네 조합에서 확인했다. 페이지 JavaScript 오류는 없었다.
- `git diff --check` 통과. 이번 단계에서 `src/js/main.js`는 변경하지 않았다.

검증 스크립트는 일회성 `/tmp/codyssey-check-hover.cjs`이며 실행 로그는 `/tmp/codyssey-hover-claude.log`, 수집한 computed style 전체는 `/tmp/codyssey-hover-result.json`에 있다. 공통 Playwright 환경의 브라우저·라이브러리·글꼴 경로를 지정해 실행했고, 스크립트는 임시 서버를 열어 검사한 뒤 서버와 브라우저를 닫는다. 포인터 이동은 `mouse.move`로 요소 중심 좌표를 직접 가리키고, hover 해제는 hover 대상이 없는 좌상단 여백(2, 2)으로 포인터를 옮기는 방식으로 처리했다.

터치 전용 환경에서의 `:hover` 동작은 검증하지 않았다. 위에서 설명한 대로 브라우저마다 처리가 달라 기준을 정하기 어렵고, 이번 hover는 기능이 아니라 표현만 담당하므로 동작하지 않아도 사용에 영향이 없다.

## 6. 참고자료

- [MDN — `:hover`](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover): 포인팅 장치로 요소를 가리킬 때 일치한다는 정의와 터치스크린에서 동작이 일정하지 않다는 주의사항을 확인했다. 확인일 2026-09-13.
- [MDN — `transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition): 단축 속성의 구성 요소와 초기값(`duration` `0s`, `timing-function` `ease`), 시간 값이 순서대로 `duration`·`delay`에 배정된다는 규칙, 전환 선언을 기본 상태에 두고 `:hover` 등에서 값을 바꾼다는 사용 방식을 확인했다. 확인일 2026-09-13.
- [MDN — `box-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow): 값의 순서와 각 값의 의미, 생략 시 기본값, "box-shadow does not impact box model dimensions"라는 설명을 확인했다. 확인일 2026-09-13.
- [MDN — `:enabled`](https://developer.mozilla.org/en-US/docs/Web/CSS/:enabled): 활성화될 수 있는 폼 요소 중 비활성이 아닌 것에 일치한다는 정의를 확인했다. 확인일 2026-09-13.
- [MDN — `<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset): `disabled`를 지정하면 첫 번째 `legend` 안의 컨트롤을 제외한 모든 자손 폼 컨트롤이 비활성화된다는 설명을 확인해, 제출 버튼이 `:enabled`에 걸리지 않는 근거로 삼았다. 확인일 2026-09-13.
- [MDN — `transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform): transformable 요소에만 적용되며 비대체 인라인 박스는 제외된다는 점, 값이 `none`이 아니면 스태킹 컨텍스트가 생기고 `position: fixed`·`absolute` 자손의 포함 블록이 된다는 점을 확인했다. 확인일 2026-09-13.
- [CSS 변수로 공통 스타일 값 관리하기](004-css-custom-properties.md), [속성 선택자로 다크 모드 색상 적용하기](005-theme-attribute-selector.md): 그림자 색을 테마별 변수로 나눈 방식의 배경.

- [CSS Easing Functions Level 2 초안 — ease](https://drafts.csswg.org/css-easing/#valdef-cubic-bezier-easing-function-ease): 2.2절의 곡선 정의로 속도 변화 설명을 검토했다. 확인일 2026-09-13.
- [CSS Positioned Layout Level 3 초안 — 상대 위치](https://drafts.csswg.org/css-position/#relative-position): 3절의 상대 위치 이동은 다른 박스의 위치에 영향을 주지 않는다는 설명을 확인해 `top` 비교를 보완했다. 확인일 2026-09-13.
