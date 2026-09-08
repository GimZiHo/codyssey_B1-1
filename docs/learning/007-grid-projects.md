# Grid로 프로젝트 카드 자동 배치하기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 3쪽의 Grid·auto-fit·minmax를 이용한 Projects 카드 배치를 구현한다. 화면 폭과 카드 수에 따라 열 수가 달라지는 원리를 확인한다.

## 2. 핵심 개념

Grid는 행과 열을 기준으로 요소를 배치하는 CSS 방식이다. 부모에 `display: grid`를 지정하면 직접 자식이 격자에 배치된다. 내비게이션은 한 방향의 공간 배분이 중심이어서 Flexbox를 사용했고, 프로젝트 목록은 여러 행의 열 정렬을 맞추기 위해 Grid를 사용한다.

| 표현 | 역할 |
| --- | --- |
| `grid-template-columns` | 열의 개수와 너비를 정의한다. |
| `minmax(16rem, 1fr)` | 열의 최소 너비는 16rem, 나머지 공간은 1fr 비율로 배분한다. |
| `1fr` | 남는 공간을 나눌 비율 한 몫이다. 같은 1fr 열들은 같은 몫을 받는다. |
| `repeat(auto-fit, ...)` | 공간에 들어갈 열을 반복하고, 배치 후 완전히 빈 열은 접는다. |
| `gap` | 행과 열 사이 간격을 지정한다. |

루트 글자 크기 16px에서 16rem은 256px이다. 최소 너비와 열 사이 간격을 기준으로 들어갈 열 수를 계산하고, 남는 공간은 카드 열들이 나눠 쓴다. `auto-fit`은 마지막 줄의 빈 칸마다 카드를 늘리는 기능이 아니다. 위쪽 행에서 사용 중인 열은 유지된다.

## 3. 프로젝트 적용

[src/css/style.css](../../src/css/style.css)에 추가했다.

```css
#project-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--space-page);
}
```

[src/index.html](../../src/index.html)의 `div id="project-list"`가 부모이며, 그 안의 `article`이 카드다. 카드의 경계를 볼 수 있도록 안쪽 여백과 테두리도 추가했다. 테두리의 `currentColor`는 해당 요소의 글자색을 사용한다. `overflow-wrap: anywhere`는 긴 문자열을 필요할 때 줄바꿈해 카드 밖으로 넘치는 것을 줄인다.

현재 저장된 카드는 한 개다. 카드가 하나면 비어 있는 열이 접히고 그 카드가 목록 전체 폭을 사용한다. API 연동과 hover·그림자 효과는 이후 구현한다.

## 4. 실행 흐름

예시 입력은 목록 폭 1024px, 카드 네 개, 최소 열 너비 256px, 간격 16px이다.

1. 최소 너비의 세 열과 두 간격은 800px이므로 들어간다.
2. 네 열과 세 간격은 1072px이므로 들어가지 않는다.
3. 세 열이 나머지 폭을 균등하게 사용한다. 각 열은 `(1024 - 16 × 2) / 3 ≈ 330.67px`이다.
4. 첫 세 카드는 첫 행, 네 번째 카드는 다음 행의 첫 열에 배치된다.

폭이 줄면 최소 너비를 만족하는 열 수가 줄어든다. 이번 배치는 미디어 쿼리로 화면 구간을 직접 지정하지 않고 Grid가 계산한다.

## 5. 확인 방법과 결과

실습 절차:

1. [실행 방법](../../README.md#실행과-확인)에 따라 페이지를 열고 Projects 영역을 확인한다. 현재 카드 하나는 전체 폭을 사용한다.
2. 개발자 도구 Elements에서 `#project-list` 안의 `article`을 우클릭해 Duplicate element(요소 복제)를 세 번 선택한다. 총 네 개가 된다.
3. 창 폭을 넓히고 줄이면서 카드 열 수가 바뀌는지 확인한다.
4. 새로고침하면 임시 복제 요소가 사라지고 원래 카드 하나로 돌아온다.

2026-09-08 로컬 HTTP 서버, Chromium 153.0.8010.12, Playwright 1.63.0, 루트 글자 크기 16px, 한글 나눔 글꼴을 사용할 수 있는 환경에서 검증했다. 캡처는 브라우저에서 기존 카드를 복제하고 제목에 '배치 확인용'을 표시한 실습 장면이다. 추가 카드는 저장소 데이터나 API 응답이 아니다.

![실습 카드 네 개가 넓은 화면에서 첫 행 세 개와 다음 행 한 개로 배치된 모습](../images/screenshots/007-grid-projects/desktop-sample-cards.png)

1280px 화면: 목록 폭 1024px, 3열이다. 네 번째 카드도 첫 번째 카드와 열 위치·너비가 일치한다.

![같은 실습 카드 네 개가 좁은 화면에서 한 열로 배치된 모습](../images/screenshots/007-grid-projects/mobile-sample-cards.png)

375px 화면: 목록 폭 343px, 1열이다. 같은 카드들이 위에서 아래로 이어진다.

| 화면 폭 | 열 수 | 카드 너비 |
| --- | --- | --- |
| 1280px | 3 | 약 330.66px |
| 768px | 2 | 360px |
| 375px | 1 | 343px |
| 320px | 1 | 288px |

네 조건에서 열 너비가 균등하고 가로 넘침이 없음을 확인했다. 새로고침 후 원래 카드 하나로 복원됐으며, 1280px 화면에서 카드 하나의 너비는 목록과 같은 1024px였다. 최소 열 너비가 16rem이므로 목록 자체가 그보다 좁아지는 화면은 이 배치의 대응 범위 밖이다.

## 6. 질문과 추가 확인

추가 확인: 넓은 화면에서 카드 한 개만 있을 때와 네 개일 때 너비가 다른 것은 `auto-fit`이 완전히 빈 열을 접기 때문이다. 두 경우의 열 구성을 Elements의 Grid 표시로 비교할 수 있다.

## 7. 참고자료

- [과제 PDF 3쪽](../assignment-requirements.pdf): Projects Grid 요구사항.
- [W3C CSS Grid Level 1 — Automatic Repetitions](https://www.w3.org/TR/css-grid-1/#auto-repeat): auto-fit의 열 반복과 빈 열 처리.
- [같은 명세 — Track Sizes](https://www.w3.org/TR/css-grid-1/#track-sizes): minmax와 열 너비 정의.

2025-03-26 Candidate Recommendation Draft를 2026-09-08에 확인했다.
