# 프로필 이미지를 대체 텍스트·원본 비율과 함께 배치하기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 2~3쪽의 "About에 자기소개와 프로필 이미지를 배치한다"와 "모든 이미지에 의미 있는 `alt`를 지정한다"를 적용한다. 이 문서는 `<img>`가 가진 `src`·`alt`·`width`·`height` 속성이 각각 무엇을 정하는지, 왜 CSS에서 `height: auto`를 함께 써야 원본 비율이 유지되는지, 사진과 글을 화면 폭에 따라 세로·가로로 바꿔 놓는 방법을 실제 코드와 이어서 기록한다.

## 2. 핵심 개념

### `<img>`와 대체 텍스트

`<img>`는 **대체 요소**(replaced element)다. 태그 자체에는 내용이 없고, 브라우저가 `src`로 받은 외부 리소스를 그 자리에 대신 그린다. 끝 태그가 없다.

`alt`는 **이미지를 볼 수 없을 때 대신 쓰이는 텍스트**다. 세 가지 상황에서 쓰인다.

- 스크린 리더가 이미지 자리에서 읽는 내용
- 파일을 받지 못했을 때(404·네트워크 오류) 화면에 표시되는 내용
- 이미지 로딩을 끄거나 텍스트만 추출하는 환경에서 남는 내용

HTML 표준은 `alt`가 **이미지를 대신할 수 있는 텍스트**여야 한다고 규정한다. "사진", "이미지" 같은 형식적인 값이나 파일명이 아니라, 그 자리에 무엇이 있는지 알 수 있는 말을 적는다. 순수하게 장식용이어서 대신할 내용이 없을 때만 `alt=""`(빈 문자열)로 두어 보조 기술이 건너뛰게 한다. 이 프로젝트의 프로필 사진은 내용이 있는 이미지이므로 빈 값을 쓰지 않는다.

### `width`·`height` 속성은 표시 크기가 아니라 원본 크기

`<img>`의 `width`·`height` 속성은 단위 없는 정수이며 **원본 이미지의 픽셀 크기**를 적는다. 이 두 값이 모두 있으면 브라우저는 그 비(여기서는 936:1247)를 요소의 기본 **종횡비**(aspect ratio, 가로:세로 비율)로 삼는다. 덕분에 이미지 파일이 아직 도착하지 않아도 **자리를 미리 확보**할 수 있고, 이미지가 나중에 도착하면서 아래 내용이 밀려 내려가는 **레이아웃 이동**이 줄어든다.

동시에 이 두 속성은 CSS의 `width`·`height` 속성에 대한 **프레젠테이션 힌트**(presentational hint)로도 적용된다. 프레젠테이션 힌트는 저자 스타일시트의 맨 앞에 특정도(specificity) 0으로 놓인 규칙처럼 취급되므로, 저자가 쓴 CSS 규칙이 언제나 이긴다. 여기서 중요한 결과가 하나 나온다.

- CSS에서 `width`만 지정하면 → `height`는 힌트에 남아 있는 **1247px**이 그대로 쓰여 사진이 세로로 길게 늘어난다.
- CSS에서 `height: auto`를 함께 지정하면 → 힌트가 무효가 되고, 브라우저가 종횡비로 높이를 계산한다.

즉 `height: auto`는 "높이를 신경 쓰지 않는다"가 아니라 **"높이는 비율에서 구하라"**는 지시다.

### 세로·가로 배치 전환과 `flex-shrink`

사진과 글을 하나의 flex 컨테이너에 담으면 `flex-direction` 한 줄로 방향을 바꿀 수 있다. 모바일에서는 `column`(세로로 쌓기), 768px 이상에서는 `row`(가로로 나란히)다. 브레이크포인트 동작은 [미디어 쿼리로 화면 폭에 맞게 배치 바꾸기](008-media-queries.md)와 같다.

가로 배치에서는 공간이 부족하면 flex 항목이 기본값(`flex-shrink: 1`)에 따라 **줄어든다**. 사진 너비를 고정하고 싶으면 `flex-shrink: 0`으로 줄어들지 않게 막는다. 이때 글 쪽만 남은 공간을 차지한다.

## 3. 프로젝트 적용

### 파일 위치

원본은 `docs/images/증명사진.jpg`에 있었고 `src/images/profile.jpg`로 옮겼다. 두 가지 이유다.

- 페이지가 사용하는 이미지는 `src/images/`에 둔다([AGENTS.md](../../AGENTS.md)의 프로젝트 공통 조건). `docs/`는 학습 기록용이라 배포 대상에 포함하지 않는다.
- 파일명을 영문 소문자로 바꿨다. 한글 파일명은 URL에서 퍼센트 인코딩(`%EC%A6%9D…`)으로 요청되어 경로를 눈으로 확인하기 어렵다.

### HTML

[src/index.html](../../src/index.html)의 `#about`:

```html
<section id="about" aria-labelledby="about-title">
  <h2 id="about-title">소개</h2>
  <div class="about-body">
    <img src="images/profile.jpg" width="936" height="1247" alt="증명사진">
    <div class="about-text">
      <p>…</p>
      <p>…</p>
      <p>…</p>
    </div>
  </div>
</section>
```

`div` 두 개는 의미를 더하지 않는 **배치용 묶음**이다. `.about-body`는 사진과 글을 한 묶음으로 만들어 flex 컨테이너가 되고, `.about-text`는 문단 세 개를 하나의 flex 항목으로 묶는다. 이 묶음이 없으면 문단 세 개가 각각 flex 항목이 되어 사진 옆에 세 칸으로 늘어선다. 의미가 필요 없는 묶음까지 `section`으로 바꾸지 않는 기준은 [시맨틱 HTML로 페이지 구조 표현하기](001-semantic-html.md)와 같다.

`src`는 문서 위치(`src/index.html`) 기준의 상대 경로이므로 실제 요청은 `src/images/profile.jpg`로 나간다([HTML에 외부 CSS와 JavaScript 연결하기](003-external-css-javascript.md)).

본문 세 문단은 지금까지 실제로 한 작업만 적었다. 라이브러리 없이 구현한 이유, 이벤트 → 상태 → 화면 흐름으로 만든 기능(테마·GitHub API·폼 검증), 브라우저로 확인하고 기록을 남기는 방식이다. 확인되지 않은 경력이나 성과는 넣지 않았다.

### CSS

[src/css/style.css](../../src/css/style.css):

```css
.about-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-page);
}

.about-body img {
  flex-shrink: 0;
  width: 12rem;
  height: auto;
}

.about-text p:first-child {
  margin-block-start: 0;
}

@media (min-width: 768px) {
  .about-body {
    flex-direction: row;
    align-items: flex-start;
  }
}
```

- `width: 12rem`: 기본 글자 크기 16px 기준으로 192px다. 표시 크기는 CSS가 정하고, HTML 속성은 원본 크기만 알려 준다.
- `height: auto`: 936:1247 비율이 적용되어 계산 높이는 192 × 1247 ÷ 936 ≈ **256px**이 된다.
- `align-items: flex-start`: 가로 배치에서 사진과 글을 위쪽에 맞춘다. 기본값 `stretch`면 사진 칸이 글 높이만큼 늘어난다.
- `.about-text p:first-child`의 위쪽 여백 제거: `p`의 기본 여백 때문에 글 첫 줄이 사진보다 내려가는 것을 맞춘다.

## 4. 실행 흐름

1. 브라우저가 HTML을 위에서 아래로 해석하다 `<img>`를 만난다.
2. `images/profile.jpg`를 요청하고, 기다리는 동안 `width`·`height` 속성에서 얻은 비율과 CSS의 `width: 12rem`으로 **192 × 약 256px 자리를 먼저 잡는다**.
3. 응답이 도착하면 그 자리에 사진을 그린다. 자리 크기가 이미 정해져 있어 아래 문단이 밀리지 않는다.
4. 화면 폭이 768px 미만이면 `.about-body`는 `column`이라 사진 아래에 글이 놓인다. 768px 이상이면 `row`가 적용되어 사진이 왼쪽, 글이 오른쪽에 놓이고, `flex-shrink: 0` 때문에 사진 너비 192px는 유지된다.
5. `#about` 섹션이 화면에 20% 이상 들어오면 Intersection Observer가 `visible`을 붙이고, 섹션 전체(사진 포함)가 함께 나타난다([Intersection Observer로 섹션 등장 효과 만들기](014-intersection-observer.md)).

## 5. 확인 방법과 결과

실습: 페이지를 열고 개발자 도구의 기기 도구 모음에서 폭을 375 → 768 → 1280px로 바꾸며 사진과 글의 방향을 비교한다. Elements에서 `img`를 선택해 계산된 `width`·`height`가 192 × 약 256px인지 보고, Network 탭에서 `profile.jpg` 요청이 200으로 오는지 확인한다. `height: auto`를 잠시 꺼 보면 세로로 늘어난 사진을 직접 볼 수 있다.

2026-09-18 Ubuntu 24.04, Node.js 24.18.1, Playwright 1.63.0, Chromium 153.0.8010.12 헤드리스 셸에서 `src/`를 임시 HTTP 서버로 열고 375·768·1280px에서 검사했다. **검사 20건이 모두 통과했고 실패는 없다.**

확인한 것

- `images/profile.jpg` 요청이 성공하고 이미지가 실제로 로드된다.
- `alt` 값이 `증명사진`이다.
- `.about-body` 안에 문단 세 개가 있고 내용이 비어 있지 않다.
- 375px에서는 사진 아래에 글이 놓이고(세로), 768·1280px에서는 사진과 글이 나란히 놓인다(가로).
- 표시 크기가 원본 936:1247 비율을 유지한다.
- `#about`의 등장 효과가 사진을 포함해 동작한다.
- 이 페이지에서 콘솔 오류가 없다.

아직 확인하지 않은 것

- **최신 정식 Chrome에서의 표시.** 위 검증은 Chromium 헤드리스 셸이며, 과제 6장의 최신 Chrome 확인은 사용자 확인 항목으로 남아 있다.
- **Live Server에서 저장 후 자동 새로고침과 실제 화면.** [Live Server로 로컬 개발 서버 실행하기](020-live-server.md)의 확인 절차를 따른다.
- **스크린 리더가 `alt`를 읽는지.** 값이 들어 있다는 것만 확인했다.
- GitHub 저장소 목록은 이번 범위가 아니다. 검증 환경이 오프라인이라 실제 API 요청 실패는 결과에서 제외했다.

## 6. 질문과 추가 확인

- **왜 `width`·`height` 속성에 표시 크기(192)를 적지 않았나.** 이 속성의 역할은 브라우저에 원본 비율을 알려 주는 것이다. 표시 크기를 적으면 원본과 비율이 어긋날 수 있고, 표시 크기를 바꿀 때마다 HTML도 함께 고쳐야 한다. 크기는 CSS에서 정하는 편이 한 곳만 바뀐다.
- **원본 파일이 크다.** `src/images/profile.jpg`는 936 × 1247px, 약 618KB다. 실제 표시 폭 192px에 비해 크지만 이미지 최적화는 이번 학습 범위가 아니다.
- `src/images/profile-placeholder.svg`는 이번 변경으로 더 이상 참조되지 않는다.

## 7. 참고자료

- [WHATWG HTML Living Standard — The `img` element](https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element): `src`·`alt`의 의미와 대체 텍스트 요구사항.
- [같은 표준 — Attributes for embedded content and images](https://html.spec.whatwg.org/multipage/rendering.html#attributes-for-embedded-content-and-images): `width`·`height` 속성이 종횡비와 프레젠테이션 힌트로 적용되는 규칙.
- [CSS Cascading and Inheritance Level 5 — Precedence of non-CSS presentational hints](https://www.w3.org/TR/css-cascade-5/#preshint): 저자 CSS가 프레젠테이션 힌트를 이기는 이유.
- [CSS Box Sizing Level 4 — `aspect-ratio`](https://www.w3.org/TR/css-sizing-4/#aspect-ratio): 한 축의 크기와 비율로 나머지 축을 구하는 방식.
- [CSS Flexible Box Layout Level 1 — `flex-direction`](https://www.w3.org/TR/css-flexbox-1/#flex-direction-property), [같은 명세 — `flex-shrink`](https://www.w3.org/TR/css-flexbox-1/#flex-shrink-property): 배치 방향과 항목이 줄어드는 정도.
