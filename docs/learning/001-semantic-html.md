# 시맨틱 HTML로 페이지 구조 표현하기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 3쪽은 시맨틱 태그와 여섯 영역을 요구한다. 이번에는 기존 HTML 뼈대에서 **내용의 역할에 따라 태그를 선택하는 기준**을 학습한다. CSS, 앵커 동작, 폼과 JavaScript는 별도 학습 단위로 다룬다.

## 2. 핵심 개념

HTML은 콘텐츠의 구조와 의미를 표시하는 언어다. `<section>` 같은 시작 태그와 `</section>` 같은 끝 태그로 내용을 감싸면 하나의 요소가 된다. 요소 안에 다른 요소를 넣어 포함 관계를 나타낼 수 있다.

시맨틱(semantic)은 '의미를 담은'이라는 뜻이다. 태그는 화면에서의 위치나 모양만이 아니라 내용의 역할을 기준으로 고른다.

| 태그 | 의미 | 이 프로젝트의 적용 |
| --- | --- | --- |
| `header` | 도입부 또는 탐색을 돕는 콘텐츠 | 페이지 상단의 이름과 메뉴 |
| `nav` | 주요 탐색 링크 영역 | 각 영역으로 이동하는 메뉴 |
| `main` | 페이지의 주된 콘텐츠 | 인사말부터 문의까지의 본문 |
| `section` | 하나의 주제로 묶인 영역 | 소개, 기술, 프로젝트 등 |
| `article` | 독립적으로 읽거나 재사용할 수 있는 콘텐츠 | 제목·설명·링크를 갖춘 프로젝트 한 개 |
| `footer` | 관련 영역의 저작권 등 마무리 정보 | 페이지 저작권과 GitHub 링크 |

`header`와 `footer`는 태그 자체가 화면 상단·하단 고정을 지정하는 것은 아니다. 여기서는 문서 순서상 앞뒤에 배치했다. 과제의 여섯 영역은 다섯 `section`과 하나의 `footer`로 구성한다.

`h1`, `h2`, `h3`는 제목의 단계다. 이 페이지는 대표 제목 → 주제별 제목 → 개별 프로젝트 제목 순서로 사용한다. `section`은 제목으로 주제를 드러내고, `article`은 그 내용만 따로 읽어도 의미가 있는지 판단해 선택했다.

## 3. 프로젝트 적용

관련 소스: [src/index.html](../../src/index.html). 이번 개념에는 함수나 라이브러리를 추가하지 않았다.

실제 Projects 영역의 핵심 부분은 다음과 같다. 설명을 위해 속성과 카드의 본문은 생략했다.

```html
<section id="projects">
  <h2>프로젝트</h2>
  <div id="project-list">
    <article>
      <h3>나를 소개하는 웹페이지</h3>
    </article>
  </div>
</section>
```

`section`은 프로젝트라는 주제를, `article`은 개별 프로젝트를 나타낸다. `div`는 목록을 담는 일반적인 묶음이다. 특별한 의미를 추가할 필요가 없는 묶음까지 모두 `section`으로 바꾸지는 않는다. 현재 카드는 정적 HTML이며 GitHub API 결과가 아니다.

## 4. 실행 흐름

1. 입력은 `src/index.html`의 태그와 텍스트다.
2. 브라우저는 HTML을 읽어 요소의 포함 관계를 DOM(Document Object Model, 문서를 객체의 트리로 표현한 구조)으로 만든다.
3. Projects 부분은 `section` 안에 `h2`와 `div`, 그 `div` 안에 `article`이 들어 있는 구조가 된다.
4. 브라우저는 이 구조와 스타일을 이용해 제목과 내용을 화면에 표시한다. 태그의 의미는 보조 기술이 콘텐츠 구조를 파악하는 데에도 활용된다.

이번 흐름에는 함수의 인자나 반환값이 없다. HTML 문서를 브라우저가 해석하는 과정이다.

## 5. 확인 방법과 결과

직접 확인할 방법:

1. VS Code에서 `src/index.html`을 Live Server로 연다. 자세한 실행 방법은 [루트 README](../../README.md#실행과-확인)를 따른다.
2. Chrome 개발자 도구의 Elements(요소) 탭에서 `body`를 펼친다.
3. `header`, `main`, `footer`가 나란히 있는지 확인한다.
4. `main`을 펼치면 다섯 `section`이, `section id="projects"` 안의 `div`를 펼치면 `article`이 나타나는지 확인한다.
5. 화면의 '프로젝트' 제목이 `h2`, '나를 소개하는 웹페이지' 제목이 `h3`에 대응하는지 확인한다.

2026-09-07 Codex 검증: Python 표준 라이브러리의 HTML 파서로 위 포함 관계와 제목 단계를 검사했다. `body`의 자식은 `header`, `main`, `footer`이며 `main` 안에 다섯 `section`, Projects 안에 한 `article`이 있음을 확인했다. 이는 소스 구조 검사이며 HTML 표준 전체에 대한 적합성 검사는 아니다.

현재 도구 환경에는 브라우저가 없어 실제 Chrome 화면과 Elements 확인은 수행하지 않았다. 사용자 직접 실습 결과도 아직 확인되지 않았다.

## 6. 질문과 추가 확인

아직 이 개념에 대한 사용자 질문이나 이해 확인 결과는 없다. 다음 실습에서 'Projects 전체를 section으로, 개별 카드를 article로 표현한 이유'를 자신의 말로 설명할 수 있는지 확인한다.

## 7. 참고자료

아래 자료는 Codex가 설명을 정리할 때 확인했다. 사용자가 읽었다는 의미는 아니다.

- [과제 요구사항 PDF 3쪽](../assignment-requirements.pdf): 필수 시맨틱 태그와 화면 영역 확인.
- [WHATWG HTML Living Standard — Sections](https://html.spec.whatwg.org/multipage/sections.html): 4.3.2~4.3.4, 4.3.6, 4.3.8~4.3.9의 article·section·nav·제목·header·footer 의미를 태그 선택에 적용.
- [WHATWG HTML Living Standard — main](https://html.spec.whatwg.org/multipage/grouping-content.html#the-main-element): 주된 콘텐츠를 main으로 묶는 기준에 적용.

HTML 표준은 계속 갱신되는 Living Standard이며 2026-09-07에 확인했다.
