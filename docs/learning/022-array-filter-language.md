# Array.filter로 언어별 프로젝트 필터링하기

## 1. 학습 목적

[과제 PDF](../assignment-requirements.pdf) 6~7쪽 선택 과제의 "`filter`를 활용한 언어별 프로젝트 필터링"을 적용한다. 이미 구현한 저장소 목록 렌더링([018](018-async-fetch-states.md))에 select 하나를 더해 `Array.prototype.filter`로 원본 배열은 바꾸지 않고 화면에 그릴 부분 배열만 만드는 흐름을 기록한다.

## 2. 핵심 개념

### `Array.prototype.filter`

`filter(callback)`은 배열의 각 요소로 `callback`을 호출해 반환값이 참인 요소만 모은 **새 배열**을 돌려준다. 원본 배열은 건드리지 않는다. 이 프로젝트에서는 이미 [018](018-async-fetch-states.md)에서 `map`으로 API 응답을 카드로 바꾸는 데 배열 메서드를 썼고, 여기서는 그리기 전에 `filter`로 대상만 줄인다.

### 원본을 유지해야 하는 이유

`projectState.repositories`는 API가 준 원본 목록이다. 필터를 select로 바꿀 때마다 이 원본에서 다시 걸러야 "전체"를 다시 선택했을 때 처음 받은 목록을 그대로 쓸 수 있다. `filter`가 새 배열을 돌려주는 성질이 이를 가능하게 한다. 만약 원본 배열 자체를 줄였다면 "전체" 옵션을 다시 고를 방법이 없다.

## 3. 프로젝트 적용

### 상태에 선택값 추가

[src/js/main.js](../../src/js/main.js):

```js
let projectState = {
  status: 'idle',
  repositories: [],
  errorMessage: '',
  selectedLanguage: ALL_LANGUAGES,
};
```

`selectedLanguage`는 API 요청 상태(`status`)와 별개인 필터 상태다. 새로 `loadProjects`를 호출할 때마다(`main.js:341,353,361`) `ALL_LANGUAGES`로 되돌려, 이전 요청에서 고른 언어가 새 목록에 없을 수 있는 경우를 없앤다.

### 선택지 만들기와 거르기

```js
const filterRepositoriesByLanguage = (repositories, selectedLanguage) => {
  if (selectedLanguage === ALL_LANGUAGES) {
    return repositories;
  }
  if (selectedLanguage === UNSPECIFIED_LANGUAGE) {
    return repositories.filter(({ language }) => language === null);
  }
  return repositories.filter(({ language }) => language === selectedLanguage);
};
```

`buildLanguageOptions`(`main.js:207`)는 원본 목록을 한 번 순회해 중복 없는 언어 이름을 모은다. GitHub API는 언어가 없는 저장소에 `language: null`을 주므로, 실제 언어 이름과 겹치지 않는 상수 `UNSPECIFIED_LANGUAGE`로 따로 묶어 "미지정" 선택지를 만든다.

### 렌더링 흐름

`renderProjects`(`main.js:261`)는 상태 하나만 보고 화면을 그리는 유일한 지점이라는 기존 원칙을 그대로 따른다. 언어 select 표시 여부는 `renderLanguageFilter`가 맡고, `status === 'success'`이고 저장소가 있을 때만 보인다(`#project-filter`의 `hidden` 속성 토글). 카드는 `filterRepositoriesByLanguage`가 돌려준 배열에만 `map`을 적용해서 그린다(`main.js:290,298`).

select의 `change` 이벤트는 새 요청 없이 상태만 바꾼다.

```js
projectLanguageSelect.addEventListener('change', () => {
  setProjectState({ ...projectState, selectedLanguage: projectLanguageSelect.value });
});
```

`...projectState`로 기존 `repositories`·`status`는 그대로 두고 `selectedLanguage`만 바꿔 `setProjectState`에 넘긴다. `setProjectState`는 상태를 바꾼 뒤 `renderProjects`를 호출하므로([018](018-async-fetch-states.md)의 상태 → 렌더링 원칙과 동일) fetch 없이 화면만 다시 그려진다.

### CSS: hidden과 display의 충돌

[src/css/style.css](../../src/css/style.css):

```css
#project-filter:not([hidden]) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-block-end: var(--space-page);
}
```

`hidden` 속성은 브라우저 기본 스타일로 `display: none`을 주지만, 다른 규칙이 그 요소에 `display: flex`를 지정하면 특정도에 따라 `hidden`을 덮어써 감춰지지 않는 문제가 있었다(아래 확인 결과 참고). `:not([hidden])`으로 `hidden`이 없을 때만 `display: flex`가 적용되도록 선택자를 바꿔 두 상태가 항상 일치하게 했다.

## 4. 실행 흐름

1. `loadProjects`가 성공하면 `selectedLanguage: ALL_LANGUAGES`로 상태를 바꾸고 `renderProjects`가 호출된다.
2. `renderLanguageFilter`가 원본 목록에서 고유 언어 선택지를 만들어 `#project-language`에 채우고 `#project-filter`의 `hidden`을 지운다.
3. 사용자가 select에서 언어를 고르면 `change` 이벤트가 발생해 `projectState.selectedLanguage`만 바뀐다.
4. `renderProjects`가 다시 실행되며 `filterRepositoriesByLanguage`로 원본 `repositories`에서 새로 거른 배열을 `map`으로 카드로 바꿔 그린다. 요청은 다시 나가지 않는다.

## 5. 확인 방법과 결과

정식 Google Chrome 153.0.8010.52로 375·768·1280px에서 검증 스크립트(`src/tests/final-browser-check.cjs -s language-filter`, 로컬 임시 파일이며 Git 추적 대상 아님)를 실행해 105건 모두 통과했다. 같은 검증 라운드에서 기존 회귀 항목(`assets+responsive+theme+github-api`) 210건도 통과해 새 필터가 기존 기능을 깨뜨리지 않음을 확인했다(합계 315건, 반복 실행분은 제외).

확인한 것

- 로딩·빈 목록·실패 상태에서는 `#project-filter`가 실제로 화면에 보이지 않는다(`hidden` 속성과 계산된 `display` 값이 일치).
- 성공하고 저장소가 있을 때만 select가 나타나고, 옵션에 "전체"·실제 언어·"미지정"이 들어간다.
- 언어를 바꾸면 카드 개수가 줄고, "전체"로 되돌리면 원래 목록이 그대로 돌아온다(원본 배열이 바뀌지 않았다는 뜻).
- 언어 변경 시 새 네트워크 요청이 나가지 않는다.
- 선택한 언어에 해당하는 저장소가 없으면 "선택한 언어의 프로젝트가 없습니다." 문구가 뜬다.

수정 전 확인(참고용, 원인 기록): 보완 전 검사(`before-fix-language-filter@mobile.json`, 32건 중 3건 실패)에서 로딩·빈 목록·실패 상태에 `hidden=true`이지만 `display: flex`로 표시되는 문제를 발견했다. `#project-filter { display: flex; }`가 `[hidden]`보다 특정도가 같거나 높은 위치에 있어 `hidden` 기본 스타일을 덮어썼기 때문이다. `:not([hidden])`로 선택자를 바꿔 통과시켰다.

아직 확인하지 않은 것: 실제 배포 URL에서의 재확인(이번 변경은 로컬 구현이며 배포는 다시 하지 않았다), 실제 `api.github.com` 응답을 쓴 확인(이번 검증은 API 모킹).

## 6. 참고자료

- [MDN — Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter): 콜백이 참을 반환한 요소만 모은 새 배열을 돌려주는 동작.
- [WHATWG HTML Living Standard — The hidden attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute): `hidden`이 기본적으로 `display: none`을 주는 사용자 에이전트 스타일시트 규칙과, 다른 CSS로 덮어쓸 수 있다는 점.
