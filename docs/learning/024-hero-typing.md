# setInterval로 Hero 타이핑 효과 만들기

## 1. 학습 목적

Hero 제목을 한 번에 보여주지 않고 한 글자씩 채워, 시간에 따라 바뀌는 상태(`typedLength`)가 매번 화면(`textContent`)에 반영되는 흐름을 만든다. `prefers-reduced-motion`으로 애니메이션을 줄이길 원하는 사용자에게는 타이핑을 건너뛰고 완성된 문장을 바로 보여준다.

## 2. 핵심 개념

- `setInterval(callback, delay)`: `delay`밀리초마다 `callback`을 반복 호출하고, 다음 호출을 막을 수 있도록 타이머 ID를 반환한다.
- `clearInterval(id)`: 해당 ID의 반복 호출을 멈춘다. 조건 없이 계속 부르면 문자열 끝에 도달한 뒤에도 불필요하게 호출이 이어진다.
- `String.prototype.slice(0, n)`: 문자열 앞에서 `n`글자까지만 잘라 반환한다. 매 호출마다 `typedLength`만 늘리고 이 값으로 자르면 누적된 글자 수만큼만 보인다.
- `prefers-reduced-motion`: 사용자가 시스템에서 애니메이션 최소화를 선호하는지 나타내는 미디어 특성이다. [023](023-prefers-color-scheme.md)에서 쓴 `matchMedia`와 같은 방식으로 확인한다.

## 3. 프로젝트 적용

[main.js](../../src/js/main.js) 1~30행이다. `heroText`는 HTML에 이미 적힌 완성 문장([index.html](../../src/index.html) 32행 `#hero-typed`)을 그대로 읽어 JavaScript에 다시 쓰지 않는다.

```js
const heroTitle = document.querySelector('#hero-title');
const heroTyped = document.querySelector('#hero-typed');
const heroText = heroTyped.textContent;

heroTitle.setAttribute('aria-label', heroText);

const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
```

`aria-label`은 타이핑 진행과 무관하게 항상 완성 문장을 담아, 스크린 리더가 한 글자씩 끊어 읽지 않고 문장을 바로 전달하게 한다.

애니메이션 축소를 선호하면 타이머 없이 완성 문장을 바로 넣는다. 그렇지 않으면 빈 문자열에서 시작해 `typing` 클래스를 붙이고 100ms 간격으로 글자를 늘린다.

```js
if (prefersReducedMotionQuery.matches) {
  heroTyped.textContent = heroText;
} else {
  heroTyped.textContent = '';
  heroTitle.classList.add('typing');

  let typedLength = 0;

  const typeNextCharacter = () => {
    typedLength += 1;
    heroTyped.textContent = heroText.slice(0, typedLength);

    if (typedLength >= heroText.length) {
      clearInterval(typingIntervalId);
      heroTitle.classList.remove('typing');
    }
  };

  const typingIntervalId = setInterval(typeNextCharacter, 100);
}
```

`typing` 클래스가 붙어 있는 동안만 커서를 보여주도록 [style.css](../../src/css/style.css) 142~152행에서 자손 선택자와 애니메이션을 연결했다.

```css
#hero-title.typing #hero-typed::after {
  content: '|';
  margin-left: 0.1em;
  animation: hero-cursor-blink 1s step-end infinite;
}

@keyframes hero-cursor-blink {
  50% {
    opacity: 0;
  }
}
```

타이핑이 끝나 `typing` 클래스가 빠지면 이 선택자가 더 이상 걸리지 않아 커서(`::after`)와 깜빡임이 함께 사라진다. 애니메이션 축소를 선호하는 경로는 애초에 `typing`을 붙이지 않으므로 커서가 나타나지 않는다.

## 4. 실행 흐름

이벤트 → 상태 → 화면 순서로 두 경로가 있다.

1. **일반 타이핑**: 100ms마다 `typeNextCharacter` 호출 → `typedLength` 1 증가(상태 변경) → `heroTyped.textContent`를 `heroText.slice(0, typedLength)`로 갱신(화면 업데이트) → `typedLength`가 전체 길이에 도달하면 `clearInterval`로 타이머를 멈추고 `typing` 클래스를 제거해 커서를 없앤다.
2. **`prefers-reduced-motion: reduce`**: 타이머를 만들지 않고 `heroTyped.textContent`에 `heroText`를 즉시 대입한다. `typing` 클래스를 붙이지 않으므로 커서 애니메이션도 실행되지 않는다.

## 5. 확인 방법과 결과

2026-09-22, Playwright 1.63.0·Chromium 153.0.8010.12 headless shell로 다음 8개 시나리오를 실행해 모두 통과했다(0건 실패).

일반 타이핑 6건:

1. 로드 직후 `#hero-title`에 `typing` 클래스가 붙는다.
2. 로드 직후 `#hero-typed`의 `textContent`가 빈 문자열이다.
3. 약 300ms 뒤 `#hero-typed`의 `textContent` 길이가 3글자로 늘어난다.
4. 완료 시점(글자 수 × 100ms 경과 후)에 `#hero-typed`의 `textContent`가 원문과 일치한다.
5. 완료 후 `#hero-title`에서 `typing` 클래스가 제거된다.
6. `#hero-title`의 `aria-label`이 로드 직후부터 완성 문장과 일치한다(타이핑 진행 중에도 값이 바뀌지 않는다).

`prefers-reduced-motion` 2건:

7. `page.emulateMedia({ reducedMotion: 'reduce' })` 적용 후 로드하면 `#hero-typed`의 `textContent`가 로드 직후 바로 완성 문장이다.
8. 같은 조건에서 `#hero-title`에 `typing` 클래스가 붙지 않는다.

미확인 사항은 없다.

## 6. 참고자료

- [MDN — setInterval() global function](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval): 반복 호출과 타이머 ID 반환 방식을 확인했다. 확인일 2026-09-22.
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): `reduce` 값의 의미를 확인했다. 확인일 2026-09-22.
- [prefers-color-scheme으로 시스템 테마 감지하기](023-prefers-color-scheme.md): `matchMedia`로 사용자 선호를 확인하는 방식의 기반.
