# prefers-color-scheme으로 시스템 테마 감지하기

## 1. 학습 목적

저장된 사용자 선택이 없을 때 운영체제·브라우저의 다크/라이트 설정을 초기 테마로 쓰고, 시스템 설정이 바뀌면 그 변경도 같은 조건에서 반영한다. 기존 [localStorage 테마 저장·복원](013-local-storage-theme.md)의 `applyTheme` 흐름은 그대로 재사용한다.

## 2. 핵심 개념

- `window.matchMedia(query)`: CSS 미디어 쿼리 문자열을 인자로 받아 `MediaQueryList` 객체를 반환한다. `.matches`는 현재 조건 충족 여부(`boolean`)를 담고, `change` 이벤트로 조건이 바뀔 때마다 알려준다.
- `prefers-color-scheme: dark`: 사용자가 운영체제·브라우저에서 어두운 배색을 선호하는지 나타내는 미디어 특성이다. `light`·`dark`·`no-preference`가 있으며, 여기서는 `dark` 일치 여부만 쓴다.
- `change` 이벤트 콜백은 `MediaQueryListEvent`를 받고, `event.matches`로 변경 후 상태를 확인한다.

## 3. 프로젝트 적용

[main.js](../../src/js/main.js) 41~53행이다. 초기 테마는 저장된 값이 유효할 때만 그 값을, 아니면 시스템 설정을 쓴다.

```js
const storedTheme = localStorage.getItem('theme');
const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const isValidTheme = (theme) => theme === 'dark' || theme === 'light';

applyTheme(isValidTheme(storedTheme) ? storedTheme : (prefersDarkQuery.matches ? 'dark' : 'light'));
```

`isValidTheme`는 `localStorage`에 키가 없어 `null`이거나 다른 값이 들어간 경우를 걸러 우선순위(저장된 유효한 선택 > 시스템 설정)를 명확히 한다.

시스템 설정 변경 시에도 같은 우선순위를 적용한다. 사용자가 이미 수동으로 선택해 저장값이 있으면 시스템 변경을 무시한다.

```js
prefersDarkQuery.addEventListener('change', (event) => {
  if (!isValidTheme(localStorage.getItem('theme'))) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});
```

기존 클릭 토글([013](013-local-storage-theme.md))은 그대로 두었다. 토글 시 `localStorage.setItem('theme', nextTheme)`으로 저장값이 생기므로, 그 뒤로는 `change` 리스너의 조건에서 걸러져 시스템 변경이 화면에 반영되지 않는다.

## 4. 실행 흐름

이벤트 → 상태 → 화면 순서로 보면 세 가지 경로가 있다.

1. **초기 로드**: 저장값 확인 → 유효하면 그 값, 아니면 `prefersDarkQuery.matches` 확인 → `applyTheme` 1회 호출.
2. **저장값 없을 때 시스템 변경**: OS 설정 변경 → `change` 이벤트 발생 → `localStorage`에 유효값 없음 확인 → `applyTheme`로 화면 갱신.
3. **수동 토글 후 시스템 변경**: 버튼 클릭 → `applyTheme` 실행과 `localStorage.setItem`으로 저장값 생성 → 이후 시스템 설정이 바뀌어 `change` 이벤트가 와도 저장값이 유효하므로 `applyTheme`를 호출하지 않아 사용자 선택이 유지된다.

## 5. 확인 방법과 결과

Playwright의 `page.emulateMedia({ colorScheme })`로 시스템 설정을 흉내 내고, `page.evaluate`로 `localStorage`를 미리 설정하거나 지운 뒤 페이지를 열어 확인했다.

2026-09-22, 임시 스크립트 `src/tests/tmp-theme-system-check.js`, Playwright 1.63.0·Chromium 153.0.8010.12 headless shell로 다음 6개 시나리오를 실행해 모두 통과했다(0건 실패).

1. 저장값 없음 + 시스템 `dark` → 초기 화면이 다크로 적용된다.
2. 저장값 없음 + 시스템 `light` → 초기 화면이 라이트로 적용된다.
3. 저장값 `dark` + 시스템 `light` → 저장값이 우선해 다크로 적용된다.
4. 저장값 없음 + 시스템 `light`로 로드 후 `dark`로 변경 → `change` 이벤트로 다크로 갱신된다.
5. 시스템 `dark`로 로드 후 버튼으로 라이트 선택(저장값 `light` 생성) → 이후 시스템을 `dark`로 바꿔도 라이트가 유지된다.
6. 저장값 `dark`로 로드 → 다크 화면과 ‘라이트 모드로 전환’ 버튼 문구가 복원된다.

기존 전체 회귀(462건)는 이번 변경이 초기 테마 결정과 `change` 리스너 조건에 한정되어 직접 영향이 없는 시나리오라 재실행하지 않고 기존 통과 근거를 재사용했다.

## 6. 참고자료

- [MDN — Window: matchMedia() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia): `MediaQueryList` 반환값과 `change` 이벤트 사용법을 확인했다. 확인일 2026-09-22.
- [MDN — prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme): `dark`·`light`·`no-preference` 값의 의미를 확인했다. 확인일 2026-09-22.
- [기존 localStorage 테마 저장·복원 학습 기록](013-local-storage-theme.md): `applyTheme`와 저장 흐름의 기반 구조.
