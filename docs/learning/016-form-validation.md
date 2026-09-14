# submit·input 이벤트로 문의 폼 검증하기

## 1. 학습 목적

문의 폼의 입력을 활성화하고, 제출할 때 이름·이메일·메시지를 직접 검증해 오류를 해당 필드 옆에 표시한다. 브라우저의 기본 제출 동작을 막고, 사용자가 입력을 고치면 오류 표시가 따라 바뀌게 만든다.

요구사항의 "필수값과 이메일 형식을 검증하고 오류를 해당 필드 근처에 표시한다", "제출 시 기본 동작을 막는다"에 해당한다. 검증을 통과했을 때의 **성공 메시지와 실제 전송은 다음 단계**이므로 이번에는 구현하지 않았다.

이 단계의 중심은 **이벤트 → 검증 상태 → 화면 업데이트**의 흐름이다. `submit`과 `input`이라는 두 이벤트가 같은 검증 함수를 부르고, 그 결과가 오류 문구와 `aria-invalid` 속성으로 화면에 나타난다.

## 2. 핵심 개념

### `submit` 이벤트와 기본 동작

`submit`은 폼이 제출될 때 `<form>` 요소에서 발생하는 이벤트다. MDN은 발생 조건을 세 가지로 정리한다.

- 사용자가 submit 버튼을 누를 때
- 사용자가 암묵적으로 제출할 때(입력란에서 Enter)
- 스크립트가 `form.requestSubmit()`을 호출할 때

반대로 스크립트가 `form.submit()`을 직접 부르면 이벤트는 발생하지 않는다. 그래서 검증 로직을 `submit` 리스너에만 두면 `form.submit()`으로 우회할 수 있다는 점도 함께 알아 둘 필요가 있다.

폼의 **기본 동작(default action)** 은 입력값을 `action` 주소로 보내고 그 응답으로 페이지를 이동하는 것이다. `action`을 적지 않으면 현재 주소로 보내므로 페이지가 다시 로드된다. 지금은 보낼 서버가 없고 화면에서 오류만 보여 주면 되므로 이 동작을 막아야 한다.

### `event.preventDefault()`

`preventDefault()`는 "이 이벤트는 내가 처리했으니 기본 동작을 하지 말라"고 브라우저에 알린다. MDN의 표현으로는 *"tells the user agent that the event is being explicitly handled, so its default action, such as page scrolling, link navigation, or pasting text, should not be taken"* 이다.

주의할 점 두 가지가 있다.

- **취소할 수 있는 이벤트에만 통한다.** `Event.cancelable`이 `false`면 호출해도 아무 효과가 없다. `submit`은 취소할 수 있는 이벤트다.
- **전파는 막지 않는다.** 이벤트는 평소대로 상위 요소로 계속 퍼진다. 전파를 멈추려면 `stopPropagation()`이 따로 필요하다. 기본 동작 취소와 전파 중단은 서로 다른 일이다.

### `novalidate` — 브라우저 기본 검증을 끄고 직접 검사하기

HTML의 `required`, `type="email"` 같은 속성은 **제약 검증(constraint validation)** 대상이 된다. 이 상태에서 검증에 실패한 폼을 제출하려고 하면 브라우저가 제출을 막고 자체 메시지 풍선을 띄운다. 이때 MDN의 설명처럼 *"the validation prevents form submission, and thus there is no `submit` event"* — **`submit` 이벤트 자체가 발생하지 않는다.** 대신 `invalid` 이벤트가 발생한다.

즉 `novalidate` 없이 `submit`에서만 검증을 구현하면, 빈 채로 제출했을 때 내 코드는 한 줄도 실행되지 않고 브라우저 기본 풍선만 뜬다. 이번 단계의 목표는 검증 흐름을 직접 만드는 것이므로 `<form novalidate>`로 기본 검증을 끈다. `novalidate`는 불린 속성이고, 붙이지 않으면 검증하는 쪽이 기본값이다.

`required`와 `type="email"`은 그대로 남겼다. 브라우저가 제출을 막지는 않지만 입력의 의미를 문서에 남기고, 이메일 입력의 키보드 최적화나 자동완성 같은 동작은 `type`에서 나오기 때문이다.

### 필수값 검증과 공백

`required`는 값이 빈 문자열인지만 본다. 스페이스 한 칸은 빈 문자열이 아니라서 통과한다. 사람이 보기에 아무것도 쓰지 않은 것과 같은 입력을 걸러내려면 **앞뒤 공백을 제거한 뒤** 비었는지 봐야 한다. `String.prototype.trim()`이 앞뒤 공백과 줄바꿈을 제거한 새 문자열을 돌려주므로 `value.trim() === ''`로 검사한다. 원본 `value`는 바뀌지 않는다.

이메일 입력에는 브라우저가 값을 한 번 다듬는 단계가 더 있다. `<input type="email">`은 줄바꿈을 지우고 앞뒤 공백을 제거한 값을 `value`로 돌려준다. 그래서 이메일 칸에 스페이스만 넣으면 스크립트가 읽는 시점에는 이미 빈 문자열이 된다. 이 동작은 `type="email"`에만 있으므로, 이름(`type="text"`)과 메시지(`textarea`)에서는 `trim()`이 직접 공백을 걸러낸다.

### 이메일 형식과 정규식

정규식(regular expression)은 문자열이 특정 패턴에 맞는지 검사하는 표현식이다. `정규식.test(문자열)`은 일치 여부를 `true`/`false`로 돌려준다.

이 프로젝트가 쓰는 패턴은 다음과 같다.

```js
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

- `^`와 `$`는 문자열의 처음과 끝이다. 중간 어딘가에 이메일처럼 보이는 부분이 있는 것으로는 통과하지 못한다.
- `[^\s@]+`는 공백도 `@`도 아닌 글자가 한 자 이상이라는 뜻이다.
- 전체로 읽으면 `@` 앞뒤에 글자가 있고, 뒷부분에 점이 하나 이상 있어 도메인 형태를 갖춘 문자열이다.

브라우저가 `type="email"` 검증에 쓰는 패턴은 이보다 훨씬 길다. MDN이 소개하는 동등한 정규식은 도메인 각 구간의 길이 제한(최대 63자)까지 표현한다.

```js
/^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i
```

학습 단계에서는 읽을 수 있는 짧은 패턴을 쓰고, 대신 **정규식으로 무엇을 보장할 수 없는지**를 분명히 해 두는 편이 낫다. 형식이 맞아도 실제로 존재하는 주소인지는 알 수 없고, MDN도 국제화 도메인 등 명세 수준의 알려진 문제를 안내한다. 또 HTML 검증은 사용자가 개발자 도구로 바꿀 수 있으므로 *"HTML form validation is not a substitute for scripts that ensure that the entered data is in the proper format"* 이라는 경고가 붙는다. 실제 전송을 붙이는 단계에서는 서버 쪽 확인이 따로 필요하다.

### `input` 이벤트 — 고치는 즉시 반응하기

`input`은 사용자의 직접적인 조작으로 `<input>`, `<select>`, `<textarea>`의 값이 바뀔 때 발생한다. 텍스트 입력에서는 *"the `input` event is fired as the user edits the value"* 로, 한 글자 입력할 때마다 발생한다. `change`는 값이 확정될 때(대개 포커스를 잃을 때) 한 번만 발생하므로, 오류 문구를 입력에 맞춰 즉시 갱신하려면 `input`을 써야 한다.

다만 처음 작성하는 중에도 매번 검증하면 이메일 첫 글자를 입력한 순간부터 "형식이 올바르지 않습니다"가 뜬다. 그래서 이 프로젝트는 **오류가 이미 표시된 필드만** `input`에서 다시 검사한다. 오류를 보여 준 뒤에는 고치는 즉시 반응하고, 아직 오류를 내지 않은 필드는 제출할 때까지 조용한 방식이다.

### 검증 상태를 어디에 두는가

검증 결과는 "필드마다 오류 문구 한 줄"이고, 이 프로젝트에서는 별도의 변수 대신 화면에 그대로 반영한다. 반영 지점은 두 곳이다.

- **오류 문구**: 필드 아래 `<span>`의 `textContent`. 빈 문자열이면 오류 없음이다.
- **`aria-invalid` 속성**: 입력값이 애플리케이션이 받아들이는 형식이 아님을 보조 기술에 알리는 ARIA 속성이다. 값은 `true`/`false`이고, 속성이 없으면 `false`로 본다.

`aria-invalid`는 접근성 정보인 동시에 **CSS 선택자와 JavaScript 조건의 기준**이 된다. 별도의 클래스를 만들지 않고 `input[aria-invalid="true"]`로 테두리를 칠하고, `input` 이벤트에서 "지금 오류가 표시된 필드인가"를 같은 속성으로 판단한다. 상태를 한 군데에만 기록하면 화면과 속성이 어긋날 일이 없다.

MDN은 여기에 더해 오류 문구를 `aria-errormessage`로 연결하는 방법을 권한다. 이 프로젝트는 지원 범위가 넓은 `aria-describedby`로 입력과 오류 문구를 연결했다. 둘 다 "이 입력의 설명은 저 요소"라는 연결을 만들고, `aria-errormessage`는 `aria-invalid="true"`일 때만 오류로 전달된다는 차이가 있다.

## 3. 프로젝트 적용

### HTML — 입력 활성화와 오류 자리 만들기

[index.html](../../src/index.html)에서 `<fieldset disabled>`의 `disabled`를 제거해 입력을 활성화하고, 폼에 `id`와 `novalidate`를 붙였다. 각 입력 뒤에는 비어 있는 오류 문구 자리를 두고 `aria-describedby`로 연결했다.

```html
<!-- novalidate로 브라우저 기본 검증 UI를 끄고 submit 이벤트에서 직접 검사한다. -->
<form id="contact-form" aria-describedby="contact-notice" novalidate>
  <fieldset>
    <legend>문의 내용</legend>
    <p>
      <label for="contact-name">이름 (필수)</label>
      <input id="contact-name" name="name" type="text" autocomplete="name" required
        aria-describedby="contact-name-error">
      <!-- 오류 문구는 비어 있다가 검증 결과에 따라 채워진다. -->
      <span class="field-error" id="contact-name-error"></span>
    </p>
```

오류 자리를 `<span>`으로 둔 이유는 각 입력이 `<p>` 안에 있기 때문이다. `<p>` 안에는 다른 `<p>`를 넣을 수 없으므로, 인라인 요소인 `<span>`을 CSS에서 `display: block`으로 바꿔 한 줄을 차지하게 했다.

안내 문구도 실제 동작에 맞게 고쳤다. 검증은 하지만 전송은 하지 않는다는 사실을 그대로 적는다.

```html
<p id="contact-notice">입력한 내용은 검증만 하며, 아직 실제로 전송되지 않습니다.</p>
```

### CSS — 오류 색과 상태 선택자

[style.css](../../src/css/style.css)에 오류 색 변수를 테마별로 두고, 오류 문구와 입력 테두리에 적용했다.

```css
:root {
  /* 폼 검증 오류 색. 배경 대비를 맞추려고 테마별로 나눈다. */
  --color-error: #b91c1c;
}

[data-theme="dark"] {
  --color-error: #fca5a5;
}

/* 오류 문구는 입력 바로 아래 줄에 둔다. 내용이 비어 있으면 줄 높이도 생기지 않는다. */
.field-error {
  display: block;
  max-width: 30rem;
  color: var(--color-error);
}

/* 검증 상태는 aria-invalid 속성에 기록하고, 같은 속성을 선택자로 써서 테두리를 바꾼다. */
input[aria-invalid="true"],
textarea[aria-invalid="true"] {
  border: 1px solid var(--color-error);
}
```

`.field-error`는 내용이 없을 때 줄 상자가 만들어지지 않아 높이를 차지하지 않는다. 오류가 생기면 그만큼 아래 요소가 밀린다. 속성 선택자는 [다크 모드](005-theme-attribute-selector.md)에서 쓴 `[data-theme="dark"]`와 같은 방식이며, 이번에는 JavaScript가 값을 바꾸는 속성을 그대로 스타일 조건으로 쓴다.

### JavaScript — 필드 정의, 검증, 화면 반영

[main.js](../../src/js/main.js)는 필드마다 **입력 요소·오류 표시 요소·검증 규칙**을 한 묶음으로 정의한다. 규칙은 오류 문구를 돌려주고, 빈 문자열이면 통과를 뜻한다.

```js
// @ 앞뒤에 공백이 없는 글자가 있고, 도메인에 점이 하나 이상 있는지만 확인한다.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactFields = [
  {
    input: document.querySelector('#contact-name'),
    errorText: document.querySelector('#contact-name-error'),
    validate: (value) => (value.trim() === '' ? '이름을 입력해 주세요.' : ''),
  },
  {
    input: document.querySelector('#contact-email'),
    errorText: document.querySelector('#contact-email-error'),
    validate: (value) => {
      if (value.trim() === '') {
        return '이메일을 입력해 주세요.';
      }

      return emailPattern.test(value.trim()) ? '' : '이메일 형식이 올바르지 않습니다. 예: name@example.com';
    },
  },
  // 메시지 필드도 이름과 같은 방식이다.
];
```

세 필드가 같은 구조를 가지므로 검증과 화면 반영은 함수 두 개로 끝난다.

```js
// 검증 결과를 오류 문구와 aria-invalid 속성에 반영한다. 화면 갱신은 여기서만 한다.
const renderFieldError = (field, message) => {
  field.errorText.textContent = message;
  field.input.setAttribute('aria-invalid', String(message !== ''));
};

// 현재 입력값을 검사해 화면에 반영하고 통과 여부를 돌려준다.
const validateField = (field) => {
  const message = field.validate(field.input.value);

  renderFieldError(field, message);

  return message === '';
};
```

`textContent`를 쓰는 이유는 오류 문구가 글자이기 때문이다. `innerHTML`은 문자열을 HTML로 해석하므로 글자만 넣을 때 쓸 이유가 없다.

제출과 입력 두 이벤트가 이 함수를 공유한다.

```js
contactForm.addEventListener('submit', (event) => {
  // 기본 제출을 막아 페이지 이동 없이 검증 결과만 화면에 반영한다.
  event.preventDefault();

  const invalidFields = contactFields.filter((field) => !validateField(field));

  // 통과했을 때의 성공 메시지는 다음 단계에서 구현한다.
  if (invalidFields.length > 0) {
    invalidFields[0].input.focus();
  }
});

// 오류가 표시된 필드만 입력에 맞춰 다시 검사한다. 처음 작성하는 동안에는 오류를 띄우지 않는다.
contactFields.forEach((field) => {
  field.input.addEventListener('input', () => {
    if (field.input.getAttribute('aria-invalid') === 'true') {
      validateField(field);
    }
  });
});
```

`filter`는 조건을 만족하는 요소만 모은 새 배열을 돌려준다. 여기서는 `validateField`가 `false`를 돌려준 필드, 즉 **오류가 있는 필드만** 모은다. `some`이나 `every`로 통과 여부만 확인하면 중간에 검사를 멈춰 나머지 필드의 오류가 화면에 표시되지 않는다. `filter`는 모든 요소를 한 번씩 검사하므로 세 필드의 오류가 동시에 나타난다.

첫 번째 오류 필드에 `focus()`를 주면 키보드 사용자가 곧바로 고칠 수 있고, 화면이 해당 위치로 이동한다.

## 4. 실행 흐름

**빈 폼을 제출했을 때**

1. 사용자가 '문의하기' 버튼을 누른다. 버튼의 `type`이 `submit`이므로 폼 제출이 시작된다.
2. `novalidate`가 있어 브라우저는 `required` 검증을 건너뛰고, 폼에서 `submit` 이벤트가 발생한다.
3. 리스너가 `event.preventDefault()`로 기본 동작을 막는다. 페이지는 이동하지 않고 입력값도 그대로 남는다.
4. `filter`가 세 필드를 차례로 `validateField`에 넘긴다. 각 필드의 규칙이 `value.trim() === ''`을 만족해 오류 문구를 돌려준다.
5. `renderFieldError`가 `<span>`의 `textContent`에 문구를 넣고 `aria-invalid`를 `"true"`로 바꾼다. 이 시점에 CSS의 `input[aria-invalid="true"]`가 적용되어 테두리도 오류 색이 된다.
6. 오류 필드가 세 개이므로 첫 번째인 이름 입력에 포커스가 간다.

**오류를 고칠 때**

1. 이메일 칸에 `jiho@`까지 입력한 상태에서 제출하면 형식 오류 문구가 뜬다.
2. 이어서 한 글자를 더 입력하면 `input` 이벤트가 발생한다.
3. 리스너가 `aria-invalid`를 확인한다. `"true"`이므로 다시 검증한다.
4. `jiho@e`는 아직 점이 없어 패턴에 맞지 않는다. 같은 문구가 다시 그려지고 `aria-invalid`는 `"true"`로 유지된다.
5. `jiho@example.com`까지 입력하면 패턴에 맞아 규칙이 빈 문자열을 돌려준다. `textContent`가 비워지고 `aria-invalid`가 `"false"`가 되어 테두리 색도 돌아온다.
6. 이후의 입력에서는 `aria-invalid`가 `"false"`이므로 검증을 건너뛴다. 다시 검사하는 시점은 다음 제출이다.

**모두 유효할 때**

`preventDefault()`는 그대로 호출되므로 페이지는 이동하지 않는다. 세 필드 모두 빈 문자열을 돌려받아 오류 표시가 지워지고, `invalidFields`가 빈 배열이라 포커스 이동도 없다. 화면상 눈에 띄는 변화가 없는 것이 현재 단계의 정상 동작이며, 여기에 성공 메시지를 붙이는 것이 다음 단계다.

## 5. 확인 방법과 결과

### 직접 확인하는 절차

[README의 실행 방법](../../README.md#실행과-확인)으로 페이지를 열고 문의 영역에서 확인한다.

| 확인 항목 | 기대 동작 |
| --- | --- |
| 빈 폼 제출 | 세 필드 모두 오류 문구 표시, 페이지 이동·새로고침 없음, 이름 칸에 포커스 |
| 공백만 입력하고 제출 | 여전히 필수값 오류 |
| `jiho@`처럼 잘못된 이메일 | 이메일 칸만 형식 오류, 이름·메시지는 오류 없음 |
| 오류 상태에서 이어서 입력 | 형식에 맞는 순간 오류 문구와 테두리 색이 사라짐 |
| 모두 채우고 제출 | 오류 없음, 페이지 이동 없음, 입력값 유지 |
| 다크 모드 | 오류 문구가 배경과 구분되는 색 |
| 기존 기능 | 테마 전환·저장, 메뉴, 맨 위로 버튼 이상 없음 |
| Console | 오류 없음 |

브라우저 기본 검증과 직접 만든 검증을 구분해 보려면 개발자 도구에서 `<form>`의 `novalidate`를 지운 뒤 빈 폼을 제출해 본다. 브라우저 기본 풍선이 뜨고 내 오류 문구는 나타나지 않는다. `submit` 이벤트가 발생하지 않기 때문이다.

### 실제 검증 결과

Ubuntu 24.04.1, Node.js 24.18.1, Playwright 1.63.0, Chromium 153.0.8010.12(headless shell)에서 `src/`를 임시 HTTP 서버로 띄우고 1280×720 창으로 아래 순서를 실행했다. 매 단계마다 세 필드의 오류 문구, `aria-invalid`, 오류 문구 색과 입력 테두리 색(computed style), 주소, 포커스를 읽었다.

- **초기 상태.** 세 입력과 제출 버튼 모두 `disabled`가 아니고(`fieldset`의 `disabled` 제거 확인), 폼에 `novalidate` 속성이 있으며, 오류 문구는 비어 있고 `aria-invalid` 속성 자체가 없었다(`null`). 테두리는 브라우저 기본값 `rgb(118, 118, 118)`이었다.
- **빈 제출.** 세 필드 모두 `aria-invalid="true"`가 되고 각각 "이름을 입력해 주세요.", "이메일을 입력해 주세요.", "메시지를 입력해 주세요."가 표시됐다. 테두리는 오류 색 `rgb(185, 28, 28)`으로 바뀌었고, 포커스는 첫 오류 필드인 `contact-name`으로 이동했다. 주소는 `http://127.0.0.1:<포트>/index.html` 그대로였다 — 기본 동작이 일어났다면 `?name=&email=&message=` 형태의 질의 문자열이 붙고 페이지가 다시 로드됐을 것이므로, `preventDefault()`가 실제로 제출을 막았다는 근거가 된다.
- **공백만 입력.** 이름에 `"   "`, 이메일에 `"  "`, 메시지에 `"\t  \n "`를 넣고 제출했더니 세 필드 모두 같은 필수값 오류가 유지됐다. 이때 읽은 원시 `value`는 이름 `"   "`, 메시지 `"\t  \n "`로 입력한 그대로였지만 **이메일은 `""`** 였다. 위에서 설명한 `type="email"`의 값 정리가 실제로 동작해, 스크립트가 읽기 전에 이미 공백이 제거된다는 것을 확인했다.
- **잘못된 이메일 형식.** 이름 `지호`, 메시지 `포트폴리오 문의드립니다.`, 이메일 `jiho@`로 제출하니 이메일만 `aria-invalid="true"`와 "이메일 형식이 올바르지 않습니다. 예: name@example.com"이 남고, 이름·메시지는 `aria-invalid="false"`에 문구가 비워지고 테두리도 기본색으로 돌아왔다. 포커스는 유일한 오류 필드인 `contact-email`로 갔다.
- **수정에 따른 오류 갱신.** 오류가 표시된 상태에서 `e`를 한 글자 입력하자(`jiho@e`) `input` 이벤트로 다시 검사되어 형식 오류가 그대로 유지됐다. 이어서 `xample.com`을 입력해 `jiho@example.com`이 되는 순간 오류 문구가 비워지고 `aria-invalid`가 `"false"`, 테두리가 기본색으로 돌아왔다. 제출을 다시 하지 않고 입력만으로 해제된다는 뜻이다.
- **유효 입력 제출.** 세 필드 모두 오류 없음(`aria-invalid="false"`, 빈 문구)이었고, 주소는 제출 전후가 같았으며(`urlUnchanged: true`), 입력값 `["지호", "jiho@example.com", "포트폴리오 문의드립니다."]`가 그대로 남아 있었다. 포커스 이동도 없었다. 성공 메시지는 아직 구현하지 않았으므로 화면 변화가 없는 것이 예상된 결과다.
- **다크 테마.** 테마를 전환한 뒤 이메일을 비우고 제출하니 오류 문구와 테두리 색이 `rgb(252, 165, 165)`로 바뀌어 어두운 배경에서도 구분됐다. 라이트 테마의 `rgb(185, 28, 28)`과 서로 다른 값이라는 것을 같은 방식으로 확인했다.
- **기존 기능 회귀.** 테마를 되돌리고 새로고침한 뒤 `data-theme`와 `localStorage`의 `theme` 모두 `light`, 맨 위로 버튼은 상단에서 숨김, 햄버거 버튼은 표시 상태였다. 새로고침 후 폼은 `aria-invalid` 속성이 없는 초기 상태로 돌아왔다. 페이지 JavaScript 오류와 콘솔 오류는 없었다.

검증은 일회성 스크립트로 실행한 뒤 스크립트와 결과 파일을 삭제했다. 스크립트는 `src/`를 임시 서버로 제공하고 위 순서를 자동으로 거치며, 공통 도구 환경(`~/.local/share/codex-tools/browser`)의 Playwright·Chromium·런타임 라이브러리·글꼴 설정을 재사용한다.

**직접 확인하지 않은 것**: 실제 마우스·키보드를 쓰는 수동 조작, 보조 기술(스크린 리더)이 `aria-invalid`와 오류 문구를 읽어 주는 방식, Chromium 외의 브라우저. 특히 스크린 리더 동작은 화면 값 검사로는 확인할 수 없다.

## 6. 참고자료

- [MDN — HTMLFormElement: submit 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event): 이벤트가 발생하는 세 가지 경우와 `form.submit()` 호출 시에는 발생하지 않는다는 점, 제약 검증에 실패하면 제출이 막혀 `submit` 이벤트가 발생하지 않고 `invalid` 이벤트가 발생한다는 설명을 확인했다. 확인일 2026-09-14.
- [MDN — `Event.preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault): 기본 동작을 취소한다는 정의, `cancelable`이 `false`면 효과가 없다는 점, 전파는 계속된다는 점을 확인했다. 확인일 2026-09-14.
- [MDN — `<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form): `novalidate`가 불린 속성이며 지정하지 않으면 제출 시 검증한다는 기본값을 확인했다. 확인일 2026-09-14.
- [MDN — `<input type="email">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email): 값이 비었거나 올바른 형식일 때만 제출되도록 자동 검증된다는 설명, 브라우저가 쓰는 정규식, 앞뒤 공백이 제거된다는 설명, HTML 검증이 스크립트·서버 검증을 대신할 수 없다는 경고를 확인했다. 확인일 2026-09-14.
- [MDN — Element: input 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event): 사용자의 직접 조작으로 값이 바뀔 때 발생하며, 텍스트 입력에서는 편집하는 동안 발생해 값이 확정될 때만 발생하는 `change`와 다르다는 설명을 확인했다. 확인일 2026-09-14.
- [MDN — `aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid): 값의 종류와 기본값 `false`, 직접 만든 검증 스크립트에서 `aria-invalid`를 붙이고 `[aria-invalid="true"]` 속성 선택자로 스타일을 주라는 권고를 확인했다. 확인일 2026-09-14.
- [속성 선택자로 다크 모드 색상 적용하기](005-theme-attribute-selector.md), [클릭 이벤트로 모바일 메뉴 열고 닫기](009-menu-click-event.md): 속성 선택자와 이벤트 연결 방식의 배경.
