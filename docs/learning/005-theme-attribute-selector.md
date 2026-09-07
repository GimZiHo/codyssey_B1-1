# 속성 선택자로 다크 모드 색상 적용하기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 3쪽의 `[data-theme="dark"]` 색상 변수 정의를 구현한다. HTML 속성 값에 따라 적용할 CSS를 선택하는 원리를 확인한다.

## 2. 핵심 개념

속성 선택자는 요소에 붙은 속성과 값을 조건으로 선택하는 CSS 문법이다. `[data-theme="dark"]`는 `data-theme` 값이 `dark`인 요소를 선택한다.

`data-theme`는 페이지에서 테마를 표시하려고 정한 사용자 정의 데이터 속성이다. 이 속성 자체에 브라우저가 제공하는 다크 모드 기능은 없다. 속성을 조건으로 작성한 CSS가 화면을 바꾼다.

이 프로젝트에서는 `html`에 속성을 붙인다. 최상위 요소에서 바뀐 CSS 변수 값이 하위 요소에 상속되어 본문과 링크에 적용된다. `:root`와 `[data-theme="dark"]`는 현재 같은 우선순위이므로, 같은 요소에 적용될 때 뒤에 작성한 다크 모드 선언이 같은 이름의 변수를 덮어쓴다.

## 3. 프로젝트 적용

[src/css/style.css](../../src/css/style.css)의 `:root` 다음에 추가했다.

```css
[data-theme="dark"] {
  --color-background: #111827;
  --color-text: #f3f4f6;
  --color-link: #93c5fd;
}
```

기존 `body`와 `a`는 계속 `var(...)`로 색상을 참조한다. 색상 값만 바꾸므로 글꼴과 간격 규칙을 다시 작성할 필요가 없다.

실습에서 HTML을 다음처럼 바꾸면 조건에 맞는다.

```html
<html lang="ko" data-theme="dark">
```

저장된 [src/index.html](../../src/index.html)은 기본 밝은 테마로 시작한다. 현재 구현 범위는 본문 배경·글자·링크의 색상 전환이며, 전환 버튼과 설정 저장은 이후 구현한다. 입력 컨트롤과 임시 SVG의 색상은 아직 테마 변수에 연결하지 않았다.

## 4. 실행 흐름

1. 입력: `html` 요소에 `data-theme="dark"`를 지정한다.
2. 속성 선택자의 조건이 일치해 세 가지 색상 변수 값이 바뀐다.
3. 본문과 링크의 `var(...)`가 바뀐 값을 사용한다.
4. 출력: 어두운 배경, 밝은 글자와 연한 파란 링크가 표시된다.
5. 속성을 제거하거나 값을 `light`로 바꾸면 조건이 일치하지 않아 `:root`의 기본 색상을 사용한다.

## 5. 확인 방법과 결과

실습 절차와 예상 동작:

1. [README의 실행 방법](../../README.md#실행과-확인)에 따라 페이지를 연다.
2. 개발자 도구 Elements에서 `html`을 우클릭하고 Add attribute(속성 추가)를 선택한다.
3. `data-theme="dark"`를 입력한다. 본문 배경·글자·링크 색상이 바뀐다.
4. 값을 `light`로 바꾸거나 속성을 삭제한다. 밝은 테마로 돌아온다.
5. 개발자 도구에서 변경한 속성은 새로고침하면 원래 HTML로 복원된다.

2026-09-07 Chromium 153.0.8010.12, 1280×720에서 Playwright 1.63.0으로 확인했다.

- dark 지정 시 본문 배경은 `#111827`, 글자색은 `#f3f4f6`, 링크 11개의 색상은 `#93c5fd`였다.
- 본문 글꼴·안쪽 여백과 다섯 section의 위쪽 여백은 기존 값과 같았다.
- light 지정과 속성 제거 모두 기본 테마의 관찰한 스타일 값으로 복원됐다.

## 6. 질문과 추가 확인

추가 확인: `data-theme`를 `html` 대신 특정 section에 붙이면 그 section과 하위 요소에만 영향을 줄 수 있다. 페이지 전체 테마는 `html`에 지정한다.

## 7. 참고자료

- [과제 PDF 3쪽](../assignment-requirements.pdf): 다크 모드용 CSS 변수 요구사항.
- [W3C Selectors Level 4 — Attribute selectors](https://www.w3.org/TR/selectors-4/#attribute-selectors): 속성과 값으로 요소를 선택하는 문법. 2026-01-22 Working Draft.
- [W3C CSS Custom Properties Level 1 — Defining Custom Properties](https://www.w3.org/TR/css-variables-1/#defining-variables): 사용자 정의 속성의 상속과 적용. 2022-06-16 Candidate Recommendation Snapshot.

참고자료 확인일: 2026-09-07.
