# CSS 변수로 공통 스타일 값 관리하기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 3쪽은 `:root`에 색상·폰트·간격 변수를 정의하도록 요구한다. 값에 역할을 나타내는 이름을 붙이고, 한곳의 수정이 여러 요소에 적용되는 과정을 확인한다.

## 2. 핵심 개념

CSS 규칙은 `선택자 { 속성: 값; }` 형태다. 선택자는 스타일을 적용할 요소를 고른다. 예를 들어 `a`는 링크 요소를 선택하고 `color`는 글자색을 정한다.

CSS 변수의 정식 이름은 사용자 정의 속성(custom property)이다. 이름은 `--`로 시작한다. `:root`는 문서의 최상위 요소를 선택하며 HTML에서는 `html` 요소에 해당한다. 여기에 선언한 사용자 정의 속성은 기본적으로 하위 요소에 상속되므로 페이지 전체에서 사용할 수 있다.

`var(--color-link)`는 해당 사용자 정의 속성의 값을 가져와 사용하는 CSS 함수다. 첫 번째 인자는 속성 이름이며, 여기서는 색상 값 `#1d4ed8`로 치환된다. JavaScript 함수를 실행하는 것이 아니다. CSS의 `var()`는 과제에서 금지한 JavaScript 변수 선언 키워드 `var`와 다르다.

변수는 선언만으로 화면을 바꾸지 않는다. `color: var(--color-link)`처럼 실제 스타일 속성에서 사용해야 한다. 이름은 대소문자를 구분한다.

## 3. 프로젝트 적용

[src/css/style.css](../../src/css/style.css)의 핵심 연결은 다음과 같다.

```css
:root {
  --color-link: #1d4ed8;
}

a {
  color: var(--color-link);
}
```

모든 링크는 같은 역할의 색상을 사용하므로 `--color-link`로 관리한다. 색 자체를 이름으로 삼기보다 용도를 표현했다.

| 변수 | 적용한 곳 | 기본값 |
| --- | --- | --- |
| `--color-background` | body 배경 | `#ffffff` |
| `--color-text` | body 글자색 | `#1f2937` |
| `--color-link` | a 글자색 | `#1d4ed8` |
| `--font-family` | body 글꼴 | `sans-serif` |
| `--line-height` | body 줄 높이 | `1.6` |
| `--space-page` | body 안쪽 여백 | `1rem` |
| `--space-section` | section의 블록 방향 바깥 여백 | `3rem` |

현재 가로쓰기에서 `margin-block`은 위·아래 바깥 여백을 지정한다. 다크 모드 변수와 반응형 배치는 이후 별도로 구현한다.

## 4. 실행 흐름

1. 브라우저가 CSS를 읽고 `:root`의 `--color-link` 값을 해석한다.
2. 링크의 `color: var(--color-link)`에서 참조한 값을 적용한다.
3. 결과로 링크가 `#1d4ed8` 색상으로 표시된다.
4. `--color-link`를 `#b91c1c`로 수정하면 이를 사용하는 링크들의 글자색도 바뀐다.

## 5. 확인 방법과 결과

실습 절차와 예상 동작:

1. [README의 실행 방법](../../README.md#실행과-확인)에 따라 페이지를 연다.
2. 개발자 도구 Elements에서 `html` 요소를 선택한다.
3. Styles의 `:root` 규칙에서 `--color-link`를 `#b91c1c`로 바꾼다. 메뉴·Hero·GitHub 링크가 함께 붉은색으로 바뀐다.
4. `--space-section`을 `3rem`에서 `4rem`으로 바꾼다. 각 section의 바깥 여백이 커진다.
5. 새로고침하면 파일에 저장된 원래 값으로 복원된다. 위 조작은 브라우저에서의 임시 변경이다.

2026-09-07 Chromium 153.0.8010.12, 1280×720, 루트 글자 크기 16px 환경에서 Playwright 1.63.0으로 검증했다.

- 본문의 배경·글자색·글꼴과 16px 안쪽 여백이 선언한 기본값과 일치했다.
- 링크 11개가 모두 `#1d4ed8`을 사용했고, 변수 수정 후 모두 `#b91c1c`로 바뀌었다.
- 다섯 section의 위쪽 margin이 각각 48px에서 64px로 바뀌었다.
- 새로고침 후 관찰한 스타일 값이 원래 값으로 돌아왔다.

## 6. 질문과 추가 확인

추가 확인: 변수 값을 바꿔도 특정 요소가 변하지 않으면 해당 요소의 스타일이 `var(...)`로 그 변수를 참조하는지 확인한다.

## 7. 참고자료

- [과제 PDF 3쪽](../assignment-requirements.pdf): 색상·폰트·간격 변수 요구사항.
- [W3C CSS Custom Properties Level 1, 2절](https://www.w3.org/TR/css-variables-1/#defining-variables): `--` 속성 정의, 상속과 이름 구분.
- [같은 명세 3절](https://www.w3.org/TR/css-variables-1/#using-variables): `var()`를 통한 값 참조와 치환.

2022-06-16 Candidate Recommendation Snapshot을 2026-09-07에 확인했다.
