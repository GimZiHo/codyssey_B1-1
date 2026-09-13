# Intersection Observer로 섹션 등장 효과 만들기

## 1. 학습 목적

각 섹션이 화면에 들어올 때 한 번씩 나타나는 스크롤 등장 애니메이션을 만든다. `scroll` 이벤트에서 직접 위치를 계산하는 대신, 브라우저가 알려주는 **교차 정보**를 클래스 변경에 연결하고 실제 움직임은 CSS가 맡는 구조를 익힌다.

## 2. 핵심 개념

### 뷰포트와 교차 면적 비율

**뷰포트(viewport)** 는 페이지에서 지금 화면에 보이는 영역이다. Intersection Observer API는 대상 요소가 조상 요소 또는 최상위 문서의 뷰포트와 겹치는 정도가 바뀌는 것을 **비동기로** 관찰한다. 여기서 "비동기"는 스크롤할 때마다 내 코드가 위치를 재는 것이 아니라, 브라우저가 계산한 뒤 나중에 콜백으로 알려준다는 뜻이다.

겹치는 정도는 **교차 비율(intersection ratio)** 로 표현한다. 대상 요소 중 보이는 부분의 비율이며 0.0부터 1.0 사이의 값이다. 0.2는 요소의 20%가 보이는 상태다.

`threshold`(임계값)는 "이 비율을 넘나들 때 알려 달라"고 지정하는 기준선이다. 기본값은 `0`이고, 이때는 대상과 기준 영역의 경계가 맞닿는 순간에도 교차 알림이 올 수 있다. 이 프로젝트는 과제 권장값인 `0.2`를 사용한다.

### 생성자: `new IntersectionObserver(callback, options)`

생성자는 관찰자 객체를 반환한다. 반환된 객체의 `observe()`를 호출해야 실제 관찰이 시작된다.

- `callback`: 임계값을 넘나들 때 호출할 함수. `(entries, observer)` 두 인자를 받는다.
- `options`: `root`(기준 요소, 생략하면 문서 뷰포트), `rootMargin`(기준 영역에 더할 여백, 기본 `"0px 0px 0px 0px"`), `threshold`(임계값, 기본 `0`).

`threshold`에 0.0~1.0 밖의 값을 주면 `RangeError`가 발생한다.

### `entries`와 entry의 값들

`callback`의 첫 인자 `entries`는 `IntersectionObserverEntry` 객체의 배열이다. 한 번의 호출에 여러 요소의 정보가 함께 들어올 수 있으므로 배열이다.

- `entry.target`: 관찰 대상 요소. `observe()`에 넘겼던 그 요소다.
- `entry.isIntersecting`: 기준 영역과 겹치고 있으면 `true`, 아니면 `false`.
- `entry.intersectionRatio`: 앞에서 설명한 교차 비율.

**틀리기 쉬운 지점 — 최초 알림.** 콜백은 `observe()` 호출 뒤 첫 렌더 주기에 항상 한 번 실행된다. 요소가 임계값을 넘었는지와 무관하다. 화면 밖에 있으면 `isIntersecting`이 `false`인 entry가, 화면 안에 있으면 `true`인 entry가 비동기로 전달된다. 즉 **0.2 미만인 상태에서도 콜백은 호출될 수 있다.** 그래서 `entry.isIntersecting`만 믿지 않고 `entry.intersectionRatio >= 0.2`를 함께 확인한다.

### 대상 등록과 해제: `observe()` / `unobserve()`

`document.querySelectorAll(선택자)`는 조건에 맞는 요소를 모두 담은 목록을 반환하고, `forEach`로 하나씩 순회한다. 관찰자는 요소를 자동으로 모아 주지 않으므로 대상마다 `observe()`를 호출해야 한다.

- `observe(targetElement)`: 요소 하나를 인자로 받아 관찰을 시작한다. 반환값은 `undefined`다. 이미 관찰 중인 요소면 아무 일도 하지 않는다.
- `unobserve(target)`: 요소 하나를 인자로 받아 관찰을 멈춘다. 반환값은 `undefined`다. 관찰 중이 아닌 요소를 넘겨도 예외를 던지지 않고 아무 일도 하지 않는다.

한 번만 등장시키려면 클래스를 붙인 직후 `unobserve()`로 그 요소의 관찰을 끝낸다. 이렇게 하면 다시 화면 밖으로 나갔다 들어와도 콜백이 호출되지 않아 상태가 그대로 유지된다.

## 3. 프로젝트 적용

### 대기 상태와 표시 상태

움직임은 CSS가 담당한다. [style.css](../../src/css/style.css)에 두 상태를 정의했다.

```css
/* 등장 전 대기 상태. JavaScript가 reveal을 붙였을 때만 적용된다. */
main section.reveal {
  opacity: 0;
  transform: translateY(2rem);
  transition: opacity 0.6s, transform 0.6s;
}

/* 화면에 20% 이상 들어온 뒤의 표시 상태. */
main section.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- `opacity`: 불투명도. `0`은 완전히 투명해 보이지 않고, `1`은 원래대로 보인다. 자리는 그대로 차지하므로 레이아웃이 흔들리지 않는다.
- `transform: translateY(2rem)`: 요소를 아래로 `2rem`만큼 옮겨 둔다. 표시 상태의 `translateY(0)`으로 되돌아오며 위로 올라오는 느낌을 만든다.
- `transition: opacity 0.6s, transform 0.6s`: 두 속성이 바뀔 때 0.6초에 걸쳐 변하게 한다. 이 선언이 없으면 값이 즉시 바뀌어 애니메이션이 보이지 않는다.

`transition`은 대기 상태 쪽에 선언했다. 두 클래스가 함께 있을 때도 `main section.reveal` 선택자에 일치하므로 표시 상태에서도 적용된다. 이는 부모로부터의 상속이 아니라 같은 요소에 두 CSS 규칙이 함께 적용되는 것이다.

### 대기 클래스를 JavaScript에서 붙이는 이유

`reveal`을 HTML에 직접 쓰면 JavaScript가 비활성화된 환경에서 `opacity: 0`이 그대로 남아 본문을 읽을 수 없다. 그래서 [main.js](../../src/js/main.js)에서 `observe()`와 같은 자리에서 클래스를 붙인다. 스크립트가 실행되지 않으면 `reveal`이 없으므로 위 규칙이 적용되지 않고 본문이 평소대로 보인다.

### 핵심 코드

[main.js](../../src/js/main.js)의 마지막 부분이다.

```js
const sections = document.querySelectorAll('main section');

// 20% 이상 보이는 섹션에 표시 클래스를 붙이고 감시를 끝내 한 번만 등장시킨다.
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
      entry.target.classList.add('visible');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

// 대기 클래스를 JavaScript에서만 붙여 스크립트가 없으면 본문이 그대로 보이게 한다.
sections.forEach((section) => {
  section.classList.add('reveal');
  sectionObserver.observe(section);
});
```

대상은 [index.html](../../src/index.html)의 `main` 안에 있는 다섯 섹션(`#hero`, `#about`, `#skills`, `#projects`, `#contact`)이다. `footer`는 `main` 밖에 있어 선택자에 걸리지 않는다.

## 4. 실행 흐름

화면 아래쪽에 있는 `#contact`를 예로 들면 다음 순서로 진행된다.

1. **페이지 로드** — `forEach`가 `#contact`에 `reveal`을 붙이고 `observe(#contact)`를 호출한다. CSS가 `opacity: 0`, `translateY(2rem)`을 적용해 보이지 않는 대기 상태가 된다.
2. **최초 알림** — 첫 렌더 주기에 콜백이 실행된다. `#contact`는 화면 밖이므로 `isIntersecting`은 `false`, `intersectionRatio`는 `0`이다. 조건이 거짓이라 아무 일도 일어나지 않는다.
3. **스크롤로 진입** — 섹션 윗부분이 화면에 걸치기 시작한다. 이때 `isIntersecting`은 `true`지만 비율이 아직 0.2 미만이면 알림이 오더라도 조건이 거짓이라 대기 상태가 유지된다.
4. **20% 도달** — 비율이 0.2를 넘어서면 콜백이 호출되고 조건이 참이 된다. `entry.target.classList.add('visible')`로 `#contact`에 `visible`이 붙는다.
5. **화면 변화** — 선택자 `main section.reveal.visible`이 적용되어 `opacity`가 `1`로, `transform`이 `translateY(0)`으로 바뀐다. `transition`이 이 변화를 0.6초 동안 진행해 아래에서 떠오르며 나타난다.
6. **관찰 종료** — 이어서 `unobserve(entry.target)`이 실행되어 `#contact`의 관찰이 끝난다. 다시 위로 올라갔다 내려와도 콜백이 오지 않으므로 표시 상태가 그대로 남는다.

첫 화면에 이미 20% 이상 보이는 `#hero`는 2단계의 최초 알림에서 바로 조건을 만족해 4~6단계가 곧장 이어진다.

주소창에 `#contact`를 직접 입력해 접속한 경우에도 관찰 시작과 브라우저의 앵커 이동 순서에 따라 최초 알림 또는 이후 교차 알림에서 표시 상태가 된다.

## 5. 확인 방법과 결과

[README의 HTTP 서버 실행 방법](../../README.md#실행과-확인)으로 페이지를 연다. 개발자 도구 Elements에서 섹션의 `class` 값을, Console에서 아래 식을 확인한다.

```js
document.querySelector('#contact').className;
getComputedStyle(document.querySelector('#contact')).opacity;
```

확인할 항목과 선택 이유는 다음과 같다.

| 확인 항목 | 기대 동작 | 확인하는 이유 |
| --- | --- | --- |
| 첫 화면의 `#hero` | `reveal visible`, `opacity: 1` | 최초 알림만으로도 표시되는지 |
| 첫 화면 밖의 `#contact` | `reveal`만, `opacity: 0` | 대기 상태가 실제로 적용되는지 |
| 교차 20% 미만 | `visible` 없음 | `isIntersecting`만으로 판단하지 않는지 |
| 교차 20% 이상 | `visible` 추가, `opacity: 1` | 임계값 조건이 동작하는지 |
| 위로 올라갔다 다시 내려오기 | 표시 유지 | `unobserve`로 한 번만 등장하는지 |
| `#contact` 직접 접속 | 표시됨 | 스크롤 없이 진입해도 동작하는지 |
| JavaScript 비활성화 | 다섯 섹션 모두 보임 | 대기 클래스를 JS에서만 붙인 효과 |
| 기존 메뉴·테마·맨 위로 버튼 | 이전과 동일 | 회귀 여부 |
| Console | 오류 없음 | |

검증 환경은 1280×720과 375×720 두 화면 크기다. 좁은 화면에서는 섹션 높이가 달라져 20%에 도달하는 스크롤 위치가 바뀌므로 함께 확인한다.

### 실제 검증 결과

Ubuntu 24.04, Node.js 24.18.1, Playwright 1.63.0, Chromium 153.0.8010.12에서 임시 HTTP 서버로 실행하고 1280×720·375×720 두 크기를 검사했다.

- 첫 화면 Hero의 불투명도 `1`, 화면 밖 Contact의 표시 클래스 없음 확인.
- Contact의 변형된 경계 상자를 기준으로 교차 비율 약 19%와 21%가 되게 스크롤했다. 19%에서는 대기했고 21%에서 표시 클래스를 추가했다.
- 등장 중간의 불투명도는 약 `0.163`, 전환이 끝난 뒤에는 `1`이었다. 클래스 변경뿐 아니라 실제 중간 프레임도 확인했다.
- 화면 밖으로 이동한 뒤 재진입해도 표시 상태 유지, 새 페이지의 `#contact` 직접 접속 시 표시, JavaScript 비활성화 시 다섯 섹션의 불투명도 `1` 확인.
- 맨 위로 버튼의 상단 복귀, 다크 테마 새로고침 복원, 모바일 메뉴 열림을 확인했다. 두 화면 크기 모두 페이지 JavaScript 오류가 없었다.
- `node --check src/js/main.js`, `git diff --check` 통과.

검증 스크립트는 일회성 `/tmp/codyssey-check-observer.cjs`를 사용했다. 기존 공통 Playwright 환경의 브라우저·라이브러리·글꼴 경로를 지정하고 `node /tmp/codyssey-check-observer.cjs`로 실행했다. 스크립트는 임시 서버를 열고 검증 후 서버와 브라우저를 종료한다. 다시 직접 확인할 때는 위 표의 절차를 사용한다.

현재는 섹션 전체를 관찰하므로, 나중에 API 카드가 늘어 섹션이 아주 길어지면 화면에 들어오는 면적이 20%에 도달하지 못할 수 있다. API 단계에서 실제 카드 수와 섹션 높이를 기준으로 관찰 대상을 다시 확인한다.

## 6. 참고자료

- [MDN — Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API): 뷰포트와의 교차를 비동기로 관찰한다는 정의, 교차 비율이 0.0~1.0이라는 점, `threshold`의 의미를 확인했다. 확인일 2026-09-13.
- [MDN — IntersectionObserver() 생성자](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver): `callback(entries, observer)`의 인자, `root`·`rootMargin`·`threshold`의 기본값, 반환값과 `RangeError` 조건을 확인했다. 확인일 2026-09-13.
- [MDN — IntersectionObserver.observe()](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/observe): 인자와 `undefined` 반환, 그리고 "콜백은 `observe()` 이후 첫 렌더 주기에 임계값과 무관하게 항상 실행된다"는 설명을 확인해 `intersectionRatio` 조건을 함께 두는 근거로 삼았다. 확인일 2026-09-13.
- [MDN — IntersectionObserver.unobserve()](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/unobserve): 인자와 `undefined` 반환, 관찰 중이 아닌 요소에도 예외를 던지지 않는다는 점을 확인했다. 확인일 2026-09-13.
- [조건에 따른 클래스 적용 학습 기록](012-conditional-class-toggle.md): 클래스 변경을 CSS에 연결하는 같은 구조를 `scroll` 이벤트로 다룬 기록.
