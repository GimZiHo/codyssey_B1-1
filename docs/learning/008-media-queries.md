# 미디어 쿼리로 화면 폭에 맞게 배치 바꾸기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 3쪽의 모바일 퍼스트와 768px·1024px 브레이크포인트를 적용한다. 내비게이션을 예로 화면 폭 조건에 따라 CSS 규칙이 추가되는 원리를 확인한다.

## 2. 핵심 개념

미디어 쿼리는 화면 폭 같은 환경 조건이 맞을 때 CSS 규칙을 적용하는 방법이다. `@media (min-width: 768px)`는 뷰포트(웹페이지가 표시되는 영역)의 너비가 768 CSS 픽셀 이상일 때 참이다. 기기 이름이나 모니터의 물리적인 해상도를 판별하는 조건이 아니다.

브레이크포인트는 배치가 달라지는 기준값이다. 모바일 퍼스트는 좁은 화면에 맞는 기본 CSS를 먼저 쓰고, 넓은 화면에 필요한 변경을 추가하는 방식이다.

1024px에서는 두 min-width 조건이 모두 참이다. 768px 규칙이 사라지는 것이 아니라, 기본 규칙과 두 미디어 쿼리의 규칙이 함께 적용된다. 같은 속성이 충돌하면 CSS 우선순위 규칙에 따라 결정된다.

## 3. 프로젝트 적용

[src/css/style.css](../../src/css/style.css)의 핵심 변경:

```css
nav {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

@media (min-width: 768px) {
  nav {
    flex-direction: row;
    align-items: center;
  }
}

@media (min-width: 1024px) {
  nav ul {
    column-gap: var(--space-section);
  }
}
```

발췌에서 기존 gap·wrap·justify-content 규칙은 생략했다. `column`은 이름과 메뉴 묶음을 세로로 나열하고, `row`는 가로로 나열한다. 세로 방향의 `stretch`는 가로 너비를 채우며, 가로 방향의 `center`는 세로 중심을 맞춘다.

기본 메뉴 간격은 `--space-page`(1rem)이고, 넓은 화면에서는 `column-gap`만 `--space-section`(3rem)으로 늘린다. 메뉴의 줄 사이 간격은 기존 1rem을 유지한다. [src/index.html](../../src/index.html)의 viewport 메타 태그는 모바일에서 기기 너비를 기준으로 화면 폭을 사용하도록 이미 지정되어 있다.

## 4. 실행 흐름

1. 입력은 브라우저의 현재 뷰포트 폭이다.
2. 767px에서는 두 조건이 모두 거짓이므로 기본 세로 배치를 사용한다.
3. 768px에서는 첫 조건이 참이 되어 가로 배치로 바뀐다.
4. 1024px에서는 두 조건이 참이 되어 가로 배치를 유지하면서 메뉴 간격이 넓어진다.
5. 폭을 다시 줄이면 브라우저가 조건을 재평가해 해당하지 않는 규칙을 제외한다. JavaScript와 새로고침이 필요하지 않다.

## 5. 확인 방법과 결과

실습: [실행 방법](../../README.md#실행과-확인)에 따라 페이지를 열고 개발자 도구의 기기 도구 모음에서 Responsive를 선택한다. 폭을 767 → 768 → 1023 → 1024px로 바꾸며 이름과 메뉴의 방향, 메뉴 간격을 비교한다. Elements의 nav 스타일에서 어떤 미디어 쿼리가 적용되는지도 확인한다.

2026-09-08 로컬 HTTP 서버, Chromium 153.0.8010.12, Playwright 1.63.0, 화면 높이 720px, 기본 글자 크기 16px와 한글 나눔 글꼴을 사용할 수 있는 환경에서 검증·캡처했다.

![767px에서 이름 아래에 메뉴 목록이 놓인 내비게이션](../images/screenshots/008-media-queries/navigation-767px.png)

767px: 공간이 남아도 기본 column 규칙에 따라 이름과 메뉴를 세로로 배치한다.

![768px에서 이름 왼쪽 메뉴 오른쪽으로 전환된 내비게이션](../images/screenshots/008-media-queries/navigation-768px.png)

768px: 첫 미디어 쿼리가 적용되어 이름과 메뉴가 한 줄 양쪽에 놓인다.

![1024px에서 메뉴 항목 사이 간격이 넓어진 내비게이션](../images/screenshots/008-media-queries/navigation-1024px.png)

1024px: 가로 배치에 메뉴 사이 48px 간격이 추가된다.

| 검증한 화면 폭 | nav 방향 | 메뉴 가로 간격 |
| --- | --- | --- |
| 320, 375, 767px | column | 16px |
| 768, 1023px | row | 16px |
| 1024, 1280px | row | 48px |

일곱 가지 폭에서 가로 넘침이 없고, 가로 배치에서 이름·메뉴가 양쪽 경계에 맞는 것을 확인했다. 1280px에서 375px로 다시 줄이면 column·16px로 복원됐고 프로젝트 링크도 이동했다.

이 단계의 캡처는 모든 메뉴가 보이는 배치다. 이후 [클릭 이벤트 단계](009-menu-click-event.md)에서 모바일 메뉴 숨김·햄버거 버튼을 추가했다. 프로젝트 Grid의 열 수는 미디어 쿼리 대신 기존 auto-fit 계산으로 결정된다.

## 6. 질문과 추가 확인

추가 확인: 1024px에서 가로 배치가 유지되는 이유는 768px 조건도 계속 참이기 때문이다. min-width는 해당 값 이상을 포함한다.

## 7. 참고자료

- [과제 PDF 3쪽](../assignment-requirements.pdf): 모바일 퍼스트와 두 브레이크포인트 요구사항.
- [W3C Media Queries Level 4 — Width](https://www.w3.org/TR/mediaqueries-4/#width): 뷰포트 폭 조건.
- [같은 명세 — min/max 접두사](https://www.w3.org/TR/mediaqueries-4/#mq-min-max): 경계값을 포함하는 범위 조건.

2026-02-19 Candidate Recommendation Draft를 2026-09-08에 확인했다.
