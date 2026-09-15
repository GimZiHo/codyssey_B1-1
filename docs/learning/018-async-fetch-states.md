# fetch와 async/await로 GitHub 저장소를 불러와 상태별로 화면 그리기

## 1. 학습 목적

Projects 섹션을 미리 적어 둔 카드 대신 GitHub API가 준 저장소 목록으로 채운다. 이번 단계의 핵심은 카드 모양이 아니라 **비동기 요청 → 상태 변경 → 화면 업데이트** 흐름이다.

지금까지의 기능은 모두 "사용자가 무언가를 하면 곧바로 결과를 안다"는 공통점이 있었다. 테마 토글([013](013-local-storage-theme.md))은 클릭 직후 색이 바뀌고, 폼 검증([016](016-form-validation.md))은 제출 즉시 통과 여부를 안다. 네트워크 요청은 다르다. **요청을 보낸 시점에는 결과를 모르고**, 잠시 뒤에 성공이나 실패 중 하나가 도착한다. 그래서 화면에는 "결과를 기다리는 중"이라는 상태가 하나 더 생긴다.

이 단계에서 다루는 상태는 네 가지다.

| 상태 | 화면 |
| --- | --- |
| 로딩 | "프로젝트를 불러오는 중입니다..." |
| 성공 | 저장소 카드 목록 |
| 빈 목록 | "표시할 프로젝트가 없습니다." |
| 실패 | "프로젝트를 불러올 수 없습니다. …" + 다시 불러오기 버튼 |

## 2. 핵심 개념

### 비동기(asynchronous)와 `async`/`await`

**비동기**는 어떤 작업의 결과를 기다리는 동안 다른 일을 계속할 수 있다는 뜻이다. 네트워크 응답은 수십 밀리초에서 수 초가 걸리는데, 그동안 브라우저가 멈춰 있으면 스크롤도 클릭도 되지 않는다. 그래서 `fetch()`는 응답을 기다리지 않고 **프로미스(Promise)** 를 즉시 돌려준다. 프로미스는 "나중에 결과가 정해질 값"을 담는 상자다.

`await`는 그 상자가 열릴 때까지 **이 함수 안에서만** 기다린다. 함수 밖의 브라우저는 그동안 다른 이벤트를 계속 처리한다. `await`를 쓰려면 함수를 `async`로 선언해야 하고, `async` 함수는 항상 프로미스를 돌려준다.

```js
const response = await fetch(repositoriesUrl);   // 응답 헤더가 올 때까지 기다림
const repositories = await response.json();      // 본문을 JSON으로 읽을 때까지 기다림
```

`await`가 두 번인 이유는 응답이 두 단계로 오기 때문이다. 첫 번째 `await`는 상태 코드와 헤더가 도착하면 끝나고, 본문은 아직 다 오지 않았을 수 있다. `response.json()`이 본문을 끝까지 읽어 JavaScript 값으로 바꾼다.

### `fetch`는 404·403에서 실패하지 않는다

가장 헷갈리는 지점이다. MDN은 이렇게 설명한다.

> "A `fetch()` promise only rejects when the request fails, for example, because of a badly-formed request URL or a network error. A `fetch()` promise *does not* reject if the server responds with HTTP status codes that indicate errors (`404`, `504`, etc.)."

즉 서버가 "그런 사용자는 없습니다(404)"라고 **정상적으로 대답한 것**도 fetch 입장에서는 요청 성공이다. 통신 자체는 잘 됐기 때문이다. 그래서 MDN은 이어서 `Response.ok`나 `Response.status`를 직접 확인하라고 안내한다. `ok`는 *"a Boolean stating whether the response was successful (status in the range 200-299) or not"* 이다.

이 프로젝트도 같은 방식으로, 응답을 받은 뒤 `response.ok`를 확인해서 통과하지 못하면 직접 오류를 만들어 던진다.

정리하면 `try`/`catch`의 `catch`로 들어오는 경로는 두 가지다.

| 들어오는 경로 | 예 | 오류 종류 |
| --- | --- | --- |
| fetch가 거부 | 인터넷 끊김, DNS 실패 | `TypeError` |
| 우리가 `throw` | 403, 404, 500 응답 | 직접 만든 `Error` |

`TypeError`인지 아닌지로 두 경로를 구분해 안내 문구를 다르게 쓴다. MDN의 예외 목록에 *"There is a network error (for example, because the device does not have connectivity)"* 가 `TypeError` 조건으로 적혀 있다.

### 레이트 리밋과 403·429

GitHub REST API는 로그인 없이 쓸 수 있지만 횟수 제한이 있다. 공식 문서는 *"The primary rate limit for unauthenticated requests is 60 requests per hour"* 이고, 넘으면 *"you will receive a `403` or `429` response"* 라고 설명한다. 개발 중에 새로고침을 반복하면 실제로 만날 수 있는 오류라서, 다른 오류와 구분해 원인을 알려 준다.

응답 헤더 `x-ratelimit-remaining`이 남은 횟수, `x-ratelimit-reset`이 한도가 초기화되는 시각(UTC epoch 초)이다.

여기서 주의할 점은 **403이 레이트 리밋 전용 코드가 아니라는 것**이다. MDN은 403을 *"the server understood the request but refused to process it"* 로 정의하고, 거부 이유는 *"tied to application logic, such as insufficient permissions to a resource or action"* 이라고 설명한다. 즉 403은 "서버가 이 요청을 처리해 주지 않겠다"는 넓은 뜻이고, 한도 초과는 그중 한 가지 경우일 뿐이다. 접근이 제한된 사용자·저장소를 요청했을 때도 403이 올 수 있다.

반면 429(Too Many Requests)는 요청이 너무 많다는 뜻으로만 쓰이는 코드다. 그래서 안내 문구를 이렇게 나눈다.

| 상태 코드 | 단정할 수 있는 것 | 화면 안내 |
| --- | --- | --- |
| 403 | 서버가 요청을 거부했다는 사실까지만 | 접근 제한과 한도 초과를 모두 가능성으로 안내 |
| 429 | 요청이 한도를 넘었다 | 한도 초과로 안내 |

응답 본문의 `message`("API rate limit exceeded for …")나 `x-ratelimit-remaining: 0` 헤더를 읽으면 403의 원인을 더 좁힐 수 있지만, 이 단계에서는 상태 코드만 보고 **사실을 넘어 단정하지 않는 문구**를 쓰는 것으로 정리했다.

### 상태 하나, 렌더 함수 하나

로딩·성공·실패·빈 목록을 각각 "문구 보이기", "버튼 숨기기"처럼 따로 조작하면 조합이 금방 어긋난다. 예를 들어 재시도를 눌렀을 때 오류 문구는 지웠는데 재시도 버튼을 숨기는 것을 잊으면, 로딩 중인데 버튼이 남아 있는 화면이 된다.

그래서 이 단계는 상태를 **값 하나**로 모으고, 화면을 그리는 함수를 **하나**만 둔다.

```js
let projectState = { status: 'idle', repositories: [], errorMessage: '' };
```

`status`는 `idle`·`loading`·`success`·`error` 중 하나다. 빈 목록은 별도 상태가 아니라 `success`이면서 `repositories.length === 0`인 경우다. 서버가 "저장소가 없다"고 정상 응답한 것이므로 실패가 아니기 때문이다.

화면을 바꾸는 코드는 `renderProjects` 한 곳뿐이고, 상태를 바꾸는 코드는 `setProjectState` 한 곳뿐이다. 016·017에서 `renderFieldError`·`renderFormSuccess`를 각각 한 곳으로 모은 것과 같은 원칙이다.

### 중복 요청 방지

재시도 버튼을 빠르게 두 번 누르면 요청이 두 개 나갈 수 있다. 두 응답이 도착하는 순서는 보장되지 않으므로, 먼저 보낸 요청의 결과가 나중에 도착해 최신 결과를 덮어쓸 수 있다. 레이트 리밋도 그만큼 빨리 닳는다.

이 프로젝트는 **이미 가진 상태를 그대로 잠금장치로 쓴다**. 요청을 시작하면 상태가 `loading`이 되므로, 함수 첫 줄에서 `loading`이면 아무것도 하지 않고 돌아간다. 별도의 플래그 변수를 만들지 않아도 되고, "화면이 로딩이면 요청도 진행 중"이라는 관계가 코드로 드러난다.

```js
if (projectState.status === 'loading') {
  return;
}
```

이 검사가 동작하는 이유는 `async` 함수의 본문이 **첫 `await`를 만나기 전까지 동기적으로 실행**되기 때문이다. 첫 번째 클릭이 `setProjectState({ status: 'loading' … })`까지 끝낸 뒤에야 다음 클릭이 처리되므로, 두 번째 클릭은 반드시 `loading` 상태를 본다.

### `innerHTML`에 API 문자열을 넣을 때

카드는 `map`으로 문자열을 만들어 `innerHTML`에 넣는다. `innerHTML`은 넣은 문자열을 **HTML로 해석**하므로, 저장소 설명에 `<script>`나 `<img onerror="…">`가 들어 있으면 그대로 실행될 수 있다. 이것이 XSS(교차 사이트 스크립팅)다. 저장소 이름과 설명은 GitHub 사용자가 자유롭게 정하는 값이라 내가 통제할 수 없다.

그래서 화면에 글자로 보여야 하는 값은 HTML에서 뜻을 가지는 문자(`&`, `<`, `>`, `"`)를 먼저 문자 참조로 바꾼다. `&`를 가장 먼저 바꾸는 이유는, 나중에 바꾸면 앞에서 만든 `&lt;`의 `&`까지 다시 바꿔 `&amp;lt;`가 되기 때문이다.

링크 주소도 같은 문제를 가진다. `href="javascript:…"`는 클릭할 때 스크립트를 실행한다. 그래서 주소가 `https://github.com/`로 시작할 때만 링크를 만들고, 아니면 링크 없이 카드만 그린다. 링크를 새 탭으로 열지 않으므로(`target="_blank"` 미사용) `rel="noopener"`는 필요하지 않다.

## 3. 프로젝트 적용

### HTML — 상태를 그릴 빈 자리

[index.html](../../src/index.html)의 Projects 섹션에서 예시 카드를 지우고 세 자리를 둔다.

```html
<h2 id="projects-title">프로젝트</h2>
<!-- 로딩·오류·빈 목록 문구가 번갈아 들어가는 자리. 라이브 리전을 먼저 등록해 두려고 빈 채로 둔다. -->
<p id="project-status" role="status"></p>
<!-- 오류 상태에서만 보인다. 표시 여부는 JavaScript가 hidden으로 정한다. -->
<button id="project-retry" type="button" hidden>다시 불러오기</button>
<!-- 성공 상태에서 GitHub API로 받은 저장소 카드가 채워진다. -->
<div id="project-list"></div>
```

문구 요소를 빈 채로 미리 두는 이유는 [017](017-form-success-state.md)에서 정리한 라이브 리전 조건과 같다. 내용을 바꾸기 전에 영역이 문서에 있어야 보조 기술이 변화를 알아챈다. 로딩 문구도 HTML에 미리 적지 않는다. 스크립트가 실행되지 않으면 요청도 나가지 않는데 "불러오는 중"이라고 적혀 있으면 화면이 사실과 달라진다.

### CSS — 실패일 때만 다른 색

[style.css](../../src/css/style.css)에 재시도 버튼 모양과 오류 색만 추가한다. 카드 격자(`auto-fit`, `minmax`)와 그림자·hover는 [007](007-grid-projects.md)·[015](015-hover-transition-shadow.md)에서 만든 `#project-list article` 규칙을 그대로 쓴다.

```css
/* 요청 상태 문구는 한 요소를 돌려 쓰므로, 실패일 때만 오류 색으로 구분한다. */
#project-status.error {
  color: var(--color-error);
}
```

로딩·빈 목록·실패가 같은 `<p>`를 쓰기 때문에 색을 고정할 수 없다. 실패일 때만 클래스를 붙여 016에서 만든 `--color-error`를 재사용하고, 테마별 색도 함께 따라온다.

### JavaScript — 카드 만들기

[main.js](../../src/js/main.js)에서 저장소 객체 하나를 카드 문자열로 바꾼다. 매개변수 자리에서 바로 **구조분해 할당**을 하고, `html_url`은 이 파일의 이름 규칙에 맞게 `htmlUrl`로 바꿔 받는다.

```js
const createProjectCard = ({ name, description, language, html_url: htmlUrl }) => {
  // 설명과 언어는 값이 없으면 null로 오므로 대체 문구를 정해 둔다.
  const cardName = escapeHtml(name);
  const cardDescription = escapeHtml(description ?? '저장소 설명이 아직 없습니다.');
  const cardLanguage = escapeHtml(language ?? '미지정');
  const cardLink = isGithubUrl(htmlUrl)
    ? `<a href="${escapeHtml(htmlUrl)}">GitHub에서 저장소 보기</a>`
    : '';

  return `
    <article>
      <h3>${cardName}</h3>
      <p>${cardDescription}</p>
      <p>주요 언어: ${cardLanguage}</p>
      ${cardLink}
    </article>
  `;
};
```

`??`(널 병합 연산자)는 왼쪽이 `null`이나 `undefined`일 때만 오른쪽을 쓴다. `||`와 달리 빈 문자열이나 `0`은 그대로 두므로, "값이 없음"과 "값이 비어 있음"을 구분해야 할 때 안전하다. 실제 응답에서 `codyssey` 저장소의 `language`가 `null`이라 이 분기가 쓰인다.

### JavaScript — 상태를 화면에 반영

```js
const renderProjects = ({ status, repositories, errorMessage }) => {
  // 실패일 때만 오류 색 클래스를 붙이고, 나머지 상태에서는 지워 이전 실패의 흔적을 남기지 않는다.
  if (status === 'error') {
    projectStatus.classList.add('error');
  } else {
    projectStatus.classList.remove('error');
  }

  projectRetryButton.hidden = status !== 'error';
  // 이전 상태에서 그린 카드는 먼저 지운다.
  projectList.innerHTML = '';

  if (status === 'loading') {
    projectStatus.textContent = '프로젝트를 불러오는 중입니다...';
    return;
  }

  if (status === 'error') {
    projectStatus.textContent = errorMessage;
    return;
  }

  if (repositories.length === 0) {
    projectStatus.textContent = '표시할 프로젝트가 없습니다.';
    return;
  }

  projectStatus.textContent = '';
  projectList.innerHTML = repositories.map(createProjectCard).join('');
};
```

분기 이전의 세 가지 처리(오류 클래스, 재시도 버튼, 카드 비우기)가 중요하다. 상태와 상관없이 **항상 실행되므로**, 이전 상태의 흔적(오류 색, 재시도 버튼, 지난 카드)이 남을 수 없다. 이후 분기는 "지금 상태에서 보여 줄 것"만 정한다.

클래스를 `add`와 `remove`로 나눠 쓴 이유는 두 가지다. 첫째, 과제가 `classList.add/remove/toggle`을 모두 활용하도록 요구한다. 둘째, "실패면 붙이고 아니면 뗀다"가 코드에 그대로 드러난다. 내비게이션 배경([012](012-conditional-class-toggle.md))처럼 `classList.toggle('error', status === 'error')`로 한 줄에 쓸 수도 있고 동작은 같다. 조건 하나로 켜고 끄는 자리에서는 `toggle`의 두 번째 인자가 짧고, 분기마다 할 일이 늘어날 수 있는 자리에서는 `if`/`else`가 읽기 쉽다.

`map`은 배열의 각 원소를 바꾼 **새 배열**을 만든다. 여기서는 저장소 객체 배열이 HTML 문자열 배열이 되고, `join('')`이 그것을 한 문자열로 잇는다. `join('')`을 빠뜨리면 배열이 문자열로 변환되면서 카드 사이에 쉼표가 들어간다.

### JavaScript — 요청과 오류 처리

```js
const loadProjects = async () => {
  // 요청 중이면 상태가 loading이다. 재시도를 연달아 눌러도 요청은 하나만 나간다.
  if (projectState.status === 'loading') {
    return;
  }

  setProjectState({ status: 'loading', repositories: [], errorMessage: '' });

  try {
    // await가 응답을 기다리는 동안 화면은 로딩 상태 그대로 남는다.
    const response = await fetch(repositoriesUrl);

    if (!response.ok) {
      throw new Error(describeResponseError(response.status));
    }

    const repositories = await response.json();

    setProjectState({ status: 'success', repositories, errorMessage: '' });
  } catch (error) {
    // 연결 자체가 실패하면 fetch가 TypeError로 거부하므로 안내를 따로 만든다.
    const reason = error instanceof TypeError ? '네트워크에 연결하지 못했습니다.' : error.message;

    setProjectState({
      status: 'error',
      repositories: [],
      errorMessage: `프로젝트를 불러올 수 없습니다. ${reason}`,
    });
  }
};
```

`throw`가 `try` 안에 있으므로 바로 아래 `catch`가 받는다. 덕분에 "상태 코드가 이상함"과 "연결이 안 됨"을 **한 곳에서** 화면에 반영할 수 있다. `describeResponseError`는 상태 코드를 사람이 읽을 원인 문장으로 바꾸기만 한다.

```js
const describeResponseError = (status) => {
  // 403은 요청 한도 초과 말고 접근 제한에서도 오므로 한쪽으로 단정하지 않고 두 원인을 함께 안내한다.
  if (status === 403) {
    return 'GitHub이 접근을 거부했습니다. 접근이 제한되었거나 요청 한도를 넘었을 수 있습니다. 로그인 없이 보내는 요청은 시간당 60회까지입니다.';
  }

  // 429는 요청이 너무 많을 때만 오는 코드라 한도 안내로 단정할 수 있다.
  if (status === 429) {
    return 'GitHub API 요청 한도를 넘었습니다. 로그인 없이 보내는 요청은 시간당 60회까지입니다.';
  }

  if (status === 404) {
    return `GitHub 사용자 ${githubUsername}의 저장소를 찾을 수 없습니다.`;
  }

  return `GitHub이 ${status} 응답을 보냈습니다.`;
};
```

403과 429를 한 분기로 묶으면 코드는 짧아지지만 화면 문구가 사실을 넘어선다. 403만 보고 "한도를 넘었습니다"라고 단정하면, 실제로는 접근이 막힌 요청이었을 때 사용자가 "한 시간 기다리면 되겠지"라고 잘못 판단한다. 안내 문구는 **상태 코드로 확인할 수 있는 만큼만** 말하는 편이 낫다.

마지막으로 재시도 버튼과 첫 요청을 연결한다. 두 경로가 같은 함수를 부르므로 "처음 불러오기"와 "다시 불러오기"의 동작이 어긋날 일이 없다.

```js
projectRetryButton.addEventListener('click', loadProjects);

// 페이지를 열면 바로 한 번 요청한다.
loadProjects();
```

## 4. 실행 흐름

**페이지를 열고 성공할 때**

1. `defer` 스크립트가 HTML을 다 읽은 뒤 실행되고, 마지막 줄의 `loadProjects()`가 호출된다.
2. 상태가 `idle`이므로 잠금 검사를 통과하고, 상태가 `loading`으로 바뀐다.
3. `renderProjects`가 실행돼 `#project-status`에 "프로젝트를 불러오는 중입니다..."가 들어가고, 재시도 버튼은 숨김, 카드 목록은 비어 있다.
4. `await fetch(...)`에서 함수가 잠시 멈춘다. 이때 브라우저는 스크롤·클릭 등 다른 일을 계속 처리한다.
5. 응답이 도착한다. `response.ok`가 `true`이므로 `await response.json()`이 배열을 만든다.
6. 상태가 `success`로 바뀌고, `renderProjects`가 상태 문구를 비운 뒤 `map`으로 만든 카드 세 개를 `#project-list`에 넣는다.

**한도를 넘겨 403이 올 때**

1. 3번까지는 같다.
2. 응답이 403이라 `response.ok`가 `false`다. `describeResponseError(403)`이 만든 문장을 담아 `throw`한다.
3. `catch`가 받는다. `TypeError`가 아니므로 `error.message`를 그대로 원인으로 쓴다.
4. 상태가 `error`로 바뀌고, `renderProjects`가 `classList.add('error')`로 오류 색을 붙인다. 화면에는 "프로젝트를 불러올 수 없습니다. GitHub이 접근을 거부했습니다. 접근이 제한되었거나 요청 한도를 넘었을 수 있습니다. …"가 표시되고 재시도 버튼의 `hidden`이 풀린다.

**재시도 버튼을 두 번 빠르게 누를 때**

1. 첫 클릭이 `loadProjects`를 부른다. 상태가 `error`라서 잠금 검사를 통과하고, 곧바로 `loading`으로 바뀐다. 이 시점에 `classList.remove('error')`로 오류 색이 지워지고 재시도 버튼은 다시 숨겨진다.
2. 두 번째 클릭이 `loadProjects`를 부른다. 상태가 `loading`이므로 첫 줄에서 돌아간다. 요청은 나가지 않는다.
3. 응답이 도착하면 성공·실패 경로 중 하나로 이어진다.

**저장소가 하나도 없을 때**

1. 응답이 `200`이고 본문이 `[]`이므로 상태는 `success`가 된다.
2. `renderProjects`가 `repositories.length === 0`을 만나 "표시할 프로젝트가 없습니다."를 넣고 끝낸다. 실패가 아니므로 `else` 쪽 `classList.remove('error')`가 실행돼 오류 색이 없고, 재시도 버튼도 숨겨진 채다.

## 5. 확인 방법과 결과

### 직접 확인하는 절차

[README의 실행 방법](../../README.md#실행과-확인)으로 페이지를 열고 Projects 섹션을 본다.

| 확인 항목 | 기대 동작 |
| --- | --- |
| 페이지 열기 | 로딩 문구가 잠깐 보였다가 저장소 카드로 바뀜 |
| 카드 내용 | 저장소 이름, 설명, 주요 언어, GitHub 링크 |
| 네트워크 끊고 새로고침 | 오류 문구와 다시 불러오기 버튼 |
| 네트워크 복구 후 재시도 | 카드가 표시됨 |
| 새로고침 반복(시간당 60회 초과) | 403 안내 문구(접근 제한 또는 한도 초과)와 다시 불러오기 버튼 |
| 다크 모드 | 오류 문구가 배경과 구분되는 색 |
| 모바일 폭 | 카드가 한 열로 쌓이고 가로 스크롤이 생기지 않음 |

브라우저 개발자 도구의 Network 탭에서 응답을 느리게(throttling) 만들면 로딩 문구를 더 오래 볼 수 있다.

### 실제 검증 결과

Ubuntu 24.04.1, Node.js 24.18.1, Playwright 1.63.0, Chromium 153.0.8010.12(headless shell)에서 `src/`를 임시 HTTP 서버로 띄우고 검사했다. 실패·지연·빈 목록은 실제로 만들어 내기 어려우므로 `page.route`로 응답을 **모킹**했고, 성공 경로는 모킹과 실제 API 호출 양쪽으로 확인했다. 검사 65개가 모두 통과했다.

오류 클래스 처리를 `classList.add`/`remove` 분기로 바꾸고 403 안내 문구를 고친 뒤에는, 같은 환경에서 그 두 지점만 다시 확인하는 검사 20개를 실행해 모두 통과했다(실제 API는 호출하지 않고 모두 모킹). 아래 403·재시도·빈 목록 항목의 결과가 그때 확인한 값이다.

- **지연 응답(모킹).** 응답을 400ms 붙잡아 둔 상태에서 요청 URL이 `https://api.github.com/users/GimZiHo/repos`임을 확인했고, 그동안 상태 문구는 "프로젝트를 불러오는 중입니다...", 재시도 버튼은 숨김, 카드 수는 0이었다. 응답을 놓아주자 카드 3개가 표시되고 상태 문구가 `""`로 비워졌다(요청부터 카드 표시까지 580ms).
- **이스케이프(모킹).** 저장소 이름을 `<img src=x onerror="window.__xss=true">`, 설명을 `<script>window.__xss=true</script>`로 준 응답에서 두 값이 **글자 그대로** 표시됐고, `#project-list` 안의 `img`·`script` 요소는 0개, `window.__xss`는 `undefined`였다.
- **링크 검사(모킹).** `html_url`이 `javascript:window.__xss=true`인 저장소는 카드는 그려지고 `<a>`는 만들어지지 않았다(`querySelector('a')`가 `null`). `https://github.com/...`인 저장소는 그 주소가 `href`에 들어갔다.
- **값이 없는 필드(모킹).** `description`과 `language`가 `null`인 저장소에서 "저장소 설명이 아직 없습니다.", "주요 언어: 미지정"이 표시됐다.
- **빈 목록(모킹).** 본문 `[]` 응답에서 "표시할 프로젝트가 없습니다."가 표시되고 카드 0개, 재시도 버튼 숨김, `className`은 `""`였다(`classList.remove` 경로).
- **HTTP 403(모킹).** "프로젝트를 불러올 수 없습니다. GitHub이 접근을 거부했습니다. 접근이 제한되었거나 요청 한도를 넘었을 수 있습니다. 로그인 없이 보내는 요청은 시간당 60회까지입니다."가 표시되고 재시도 버튼이 나타났다. `#project-status`의 `className`이 `"error"`였다(`classList.add` 경로). 문구 색은 라이트에서 `rgb(185, 28, 28)`, 다크로 전환하면 `rgb(252, 165, 165)`였다.
- **HTTP 429(모킹).** "프로젝트를 불러올 수 없습니다. GitHub API 요청 한도를 넘었습니다. 로그인 없이 보내는 요청은 시간당 60회까지입니다."가 표시되고 오류 클래스가 붙었다. 403과 달리 한도 초과로 단정하는 문구다.
- **HTTP 500(모킹).** "프로젝트를 불러올 수 없습니다. GitHub이 500 응답을 보냈습니다."와 재시도 버튼이 표시됐다.
- **네트워크 실패(모킹).** 요청을 `failed`로 중단하니 "프로젝트를 불러올 수 없습니다. 네트워크에 연결하지 못했습니다."가 표시됐다. `TypeError` 분기가 동작한 결과다.
- **재시도와 중복 요청(모킹).** 첫 요청을 403으로 실패시킨 뒤(요청 1회), 재시도 버튼의 `click()`을 같은 실행 흐름에서 연달아 두 번 호출했다. 상태 문구는 즉시 로딩으로 바뀌었고 **요청 수는 2회에서 더 늘지 않았다**(첫 요청 1 + 재시도 1). 로딩 동안 재시도 버튼은 숨겨지고 `className`이 `"error"`에서 `""`로 바뀌었으며(`classList.remove` 경로), 응답을 놓아주자 카드 1개가 표시되고 클래스는 `""`로 유지됐다.
- **실제 API 호출.** 모킹 없이 같은 페이지를 열어 `https://api.github.com/users/GimZiHo/repos`를 호출했다. 응답은 `200`, `x-ratelimit-limit: 60`, `x-ratelimit-remaining: 56`이었고 카드 3개가 표시됐다 — `codex-guidelines`(주요 언어: Python), `codyssey`(주요 언어: 미지정), `codyssey_B1-1`(주요 언어: HTML). 각 카드의 링크는 해당 저장소의 `html_url`이었다.
- **넘침.** 실제 응답이 표시된 상태에서 데스크톱 1280px는 카드 3열, 모바일 375px는 1열이었고, 두 폭 모두 문서와 카드 내부의 가로 넘침이 0이었다.
- **기존 기능 회귀.** 모바일 메뉴 열고 닫기와 `aria-expanded`, 스크롤 59/60px의 `nav.scrolled`, 300px의 맨 위로 버튼, Projects 섹션의 Observer 등장 클래스, 다크 모드 전환·새로고침 복원(`localStorage`의 `theme`), 문의 폼의 빈 제출 오류와 유효 제출 성공 안내가 모두 이전과 같았다. 폼 제출 후에도 프로젝트 카드는 그대로 남았다. 페이지 JavaScript 예외는 없었고, 콘솔 오류는 모킹한 403·500·중단 응답에서 브라우저가 남긴 `Failed to load resource` 4건뿐이었다.

**직접 확인하지 않은 것**: 실제 레이트 리밋 초과(60회 초과 호출을 만들지 않았고, 403·429 화면은 모킹으로 확인했다), 접근 제한으로 인한 실제 403 응답, 실제 오프라인 환경, Chromium 외의 브라우저, 스크린 리더가 `role="status"` 변화를 낭독하는지 여부.

## 6. 참고자료

- [GitHub REST API — List repositories for a user](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repositories-for-a-user): `GET /users/{username}/repos`가 공개 저장소 배열을 돌려주고 기본 정렬이 `full_name`, `per_page` 기본값 30·최대 100임을 확인했다. 확인일 2026-09-15.
- [GitHub REST API — Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28): 비인증 요청이 시간당 60회이고 초과 시 `403` 또는 `429`가 온다는 설명, `x-ratelimit-remaining`·`x-ratelimit-reset` 헤더의 뜻을 확인했다. 확인일 2026-09-15.
- [MDN — Window: fetch() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch): HTTP 오류 상태에서는 프로미스가 거부되지 않으므로 `Response.ok`·`Response.status`를 확인하라는 설명과, 네트워크 오류일 때 `TypeError`가 발생한다는 예외 목록을 확인했다. 확인일 2026-09-15.
- [MDN — Response: ok property](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok): 상태 코드 200–299에서 `true`라는 정의를 확인했다. 확인일 2026-09-15.
- [MDN — 403 Forbidden](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403): 403이 "서버가 요청을 이해했지만 처리를 거부했다"는 뜻이고 거부 사유가 애플리케이션 로직(권한 부족 등)에 달려 있다는 설명, 401과 달리 재인증으로 해결되지 않는다는 점을 확인했다. 403 안내를 한도 초과로 단정하지 않은 근거다. 확인일 2026-09-15.
- [Grid로 프로젝트 카드 자동 배치하기](007-grid-projects.md): 이번에 만든 카드가 들어가는 `auto-fit`·`minmax` 격자.
- [폼 제출 결과를 성공 안내로 표시하고 해제하기](017-form-success-state.md): 상태 문구 요소를 빈 채로 미리 두는 라이브 리전 조건.
