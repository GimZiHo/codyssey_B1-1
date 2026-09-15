# 폼 제출 결과를 성공 안내로 표시하고 해제하기

## 1. 학습 목적

문의 폼의 검증을 통과했을 때 성공 안내를 표시하고, 그 뒤 입력이 바뀌거나 제출이 다시 실패하면 안내를 지운다. 요구사항의 "제출 시 기본 동작을 막고 검증 통과 시 성공 메시지를 표시한다"에서 남아 있던 성공 메시지 부분에 해당한다.

[016](016-form-validation.md)에서 만든 검증은 그대로 두고, 같은 `submit`·`input` 이벤트에 **폼 전체의 결과 상태**를 하나 더 붙이는 단계다. 이번 중심은 상태를 언제 켜는가보다 **언제 꺼야 하는가**다.

실제 이메일 전송은 선택 과제이고 구현하지 않았다. 그래서 안내 문구도 "전송했다"가 아니라 "확인했다"로 쓴다.

## 2. 핵심 개념

### 필드 단위 상태와 폼 단위 상태

016의 검증 상태는 필드마다 있었다. 이름 칸의 오류는 이름 칸 아래에 표시하고, `aria-invalid`도 그 입력 요소에 붙였다. 고칠 대상이 그 필드이기 때문이다.

성공은 성격이 다르다. "이름이 통과했다"가 아니라 **"이번 제출이 통과했다"** 는 폼 전체에 대한 하나의 결과다. 그래서 표시 지점도 개별 필드가 아니라 폼에 하나만 둔다. 상태의 범위가 곧 화면에서 그 상태를 그리는 위치를 정한다.

### 오래된 상태(stale state) 무효화

성공 안내는 "제출한 그 시점의 입력값이 검증을 통과했다"는 뜻이다. 사용자가 이메일을 고치는 순간 안내의 근거가 되는 값은 사라지는데, 문구가 그대로 남아 있으면 화면은 지금 상태가 아니라 과거 상태를 보여 준다. 고친 값이 틀렸을 때도 성공 안내가 남아 있다면 사용자는 잘못된 판단을 하게 된다.

그래서 이런 상태에는 **표시 조건과 함께 해제 조건**을 정해야 한다. 이 프로젝트의 해제 지점은 두 곳이다.

- **`input` 이벤트**: 어느 필드든 값이 바뀌면 직전 제출의 결과는 더 이상 지금 값에 대한 결과가 아니다.
- **실패한 `submit`**: 새 제출이 오류를 냈으므로 이전 성공 안내를 남길 이유가 없다.

실제 사용에서는 값을 고칠 때 `input`이 먼저 안내를 지우므로 두 번째 경로까지 갈 일이 드물다. 그래도 조건을 따로 두는 이유는, 화면 갱신을 "값이 바뀌었을 때"라는 한 가지 가정에만 맡기지 않기 위해서다. 값이 바뀌는 방법은 타이핑만이 아니고(자동완성·붙여넣기·되돌리기 등), 제출 시점의 결과는 제출을 처리하는 곳에서 확정하는 편이 읽기에도 분명하다.

### 라이브 리전 `role="status"`

화면에 새로 나타난 문구는 눈으로 보는 사용자에게는 바로 보이지만, 스크린 리더 사용자에게는 그 사실이 전달되지 않는다. 포커스가 옮겨 가지도 않고 페이지가 바뀌지도 않기 때문이다. **라이브 리전(live region)** 은 "이 영역의 내용이 바뀌면 알려 달라"고 표시해 두는 영역이고, `role="status"`가 그중 하나다.

MDN은 이 역할을 *"defines a live region containing advisory information for the user that is not important enough to be an `alert`"* 로 설명한다. 암묵값은 `aria-live="polite"`와 `aria-atomic="true"`다. `polite`는 *"The screen reader will speak changes whenever the user is idle"* 로, 진행 중인 낭독을 끊지 않고 기다렸다가 읽는다. 검증 통과 안내는 사용자를 즉시 가로막을 일이 아니므로 `alert`(`assertive`)가 아니라 `status`가 맞다.

라이브 리전에는 순서 조건이 있다. MDN의 권고는 *"Establish the live region before updating its content"* 이고, *"The most reliable way to ensure that live regions are registered is to include them in the initial markup"* 이다. 즉 성공했을 때 문구 요소를 새로 만들어 넣는 방식은 알림이 나가지 않을 수 있다. 이 프로젝트가 **비어 있는 `<p>`를 처음부터 HTML에 두고 `textContent`만 바꾸는** 이유가 여기에 있다. `hidden` 속성을 켜고 끄는 방식도 같은 이유로 피했다.

포커스도 옮기지 않는다. MDN은 *"Do not give focus to the status when its content updates"* 라고 안내한다. 실패했을 때 첫 오류 필드로 포커스를 옮기는 것은 사용자가 바로 고쳐야 할 곳이 있어서이고, 성공했을 때는 사용자가 하던 일을 끊을 이유가 없다.

### 없는 기능을 안내하지 않기

성공 안내에서 흔한 문구는 "문의가 전송되었습니다"다. 이 프로젝트에는 서버로 보내는 코드가 없고 `submit`의 기본 동작도 막았으므로, 그렇게 쓰면 화면이 사실과 다른 말을 하게 된다. 검증만 했다는 것을 그대로 쓴다.

## 3. 프로젝트 적용

### HTML — 비어 있는 라이브 리전 준비

[index.html](../../src/index.html)의 문의 폼에서 `<fieldset>` 다음, 즉 제출 버튼 바로 아래에 안내 자리를 둔다.

```html
      <button type="submit">문의하기</button>
    </fieldset>
    <!-- 검증을 통과했을 때만 문구가 채워진다. role="status"로 보조 기술에 변화를 알린다. -->
    <p id="contact-success" role="status"></p>
  </form>
```

필드별 오류 문구는 `<p>` 안에 들어가야 해서 `<span>`을 썼지만(016), 이 안내는 `<p>` 바깥이라 문단 요소를 그대로 쓸 수 있다.

### CSS — 성공 색과 빈 상태

[style.css](../../src/css/style.css)에 오류 색과 같은 방식으로 테마별 성공 색을 두고, 안내 문구에 적용한다.

```css
:root {
  /* 검증 통과 안내 색. 오류 색과 같은 이유로 테마별로 나눈다. */
  --color-success: #15803d;
}

[data-theme="dark"] {
  --color-success: #86efac;
}

/* 성공 안내도 오류 문구처럼 비어 있으면 줄 높이가 생기지 않는다. */
#contact-success {
  max-width: 30rem;
  color: var(--color-success);
}
```

내용이 비어 있으면 줄 상자가 만들어지지 않아 문구가 없을 때 빈 줄이 보이지 않는다. 색만 다르고 구조는 `.field-error`와 같다.

### JavaScript — 한 곳에서만 켜고 끄기

[main.js](../../src/js/main.js)에 안내 요소를 참조하고, 화면 갱신 함수를 하나 만든다. 016의 `renderFieldError`와 같은 원칙으로, 이 상태를 그리는 코드는 여기 한 줄뿐이다.

```js
const contactSuccess = document.querySelector('#contact-success');

// 성공 안내를 켜고 끄는 유일한 지점. 빈 문자열이면 안내가 없는 상태다.
const renderFormSuccess = (message) => {
  contactSuccess.textContent = message;
};
```

`submit` 리스너는 016의 검증 결과에 따라 갈라진다. 오류가 있으면 안내를 지우고 첫 오류 필드로 포커스를 옮긴 뒤 `return`으로 끝내고, 여기까지 오지 않았다면 통과한 제출이다.

```js
contactForm.addEventListener('submit', (event) => {
  // 기본 제출을 막아 페이지 이동 없이 검증 결과만 화면에 반영한다.
  event.preventDefault();

  const invalidFields = contactFields.filter((field) => !validateField(field));

  if (invalidFields.length > 0) {
    // 실패한 제출이므로 이전 제출의 성공 안내는 지운다.
    renderFormSuccess('');
    invalidFields[0].input.focus();
    return;
  }

  // 전송 기능이 없으므로 접수·전송이 아니라 검증 통과만 안내한다.
  renderFormSuccess('입력한 내용을 모두 확인했습니다. 실제 전송 기능은 아직 없어 내용은 전송되지 않았습니다.');
});
```

`input` 리스너에는 해제 한 줄이 앞에 붙는다. 오류 재검사는 016과 같이 이미 오류가 표시된 필드에서만 하지만, **성공 안내 해제는 조건 없이** 한다. 어느 필드를 고쳤든 직전 제출의 결과는 무효가 되기 때문이다.

```js
contactFields.forEach((field) => {
  field.input.addEventListener('input', () => {
    // 입력이 바뀌면 직전 제출의 성공 안내는 더 이상 지금 값에 대한 결과가 아니다.
    renderFormSuccess('');

    if (field.input.getAttribute('aria-invalid') === 'true') {
      validateField(field);
    }
  });
});
```

폼을 `reset()`으로 비우지 않는다. 입력값을 유지하면 사용자가 방금 보낸 내용을 확인할 수 있고, 지금 단계의 요구사항도 화면 안내까지다.

## 4. 실행 흐름

**유효한 입력을 제출할 때**

1. 제출 버튼을 누르면 `submit` 이벤트가 발생하고 `preventDefault()`가 기본 동작을 막는다.
2. `filter`가 세 필드를 검사한다. 모두 통과해 `invalidFields`는 빈 배열이다.
3. 분기를 건너뛰고 `renderFormSuccess`가 안내 문구를 `textContent`에 넣는다.
4. `<p id="contact-success">`에 내용이 생기면서 한 줄이 나타나고, CSS의 성공 색이 적용된다. `role="status"` 영역의 변화이므로 보조 기술에는 낭독 대상으로 전달된다.
5. 포커스는 그대로 둔다.

**성공 안내가 떠 있는 상태에서 입력을 고칠 때**

1. 어느 입력이든 한 글자를 고치면 그 필드의 `input` 이벤트가 발생한다.
2. `renderFormSuccess('')`가 `textContent`를 비운다. 안내 줄이 사라지고 아래 요소가 원래 자리로 돌아온다.
3. 그 필드에 오류가 표시돼 있었다면 이어서 다시 검증한다. 아니면 아무 일도 하지 않는다.

**고친 내용이 틀린 채로 다시 제출할 때**

1. `input` 단계에서 이미 성공 안내는 지워져 있다.
2. `filter`가 오류 필드를 모으고, 분기 안에서 `renderFormSuccess('')`가 한 번 더 확실히 비운다.
3. 오류 문구와 `aria-invalid`가 016과 같은 방식으로 표시되고, 첫 오류 필드로 포커스가 이동한다.

## 5. 확인 방법과 결과

### 직접 확인하는 절차

[README의 실행 방법](../../README.md#실행과-확인)으로 페이지를 열고 문의 영역에서 확인한다.

| 확인 항목 | 기대 동작 |
| --- | --- |
| 빈 폼 제출 | 오류 세 개, 성공 안내 없음 |
| 이메일만 틀린 제출 | 이메일 오류만, 성공 안내 없음 |
| 모두 채우고 제출 | 성공 안내 표시, 페이지 이동 없음, 입력값 유지, 포커스 이동 없음 |
| 성공 안내 상태에서 입력 수정 | 안내 즉시 사라짐 |
| 수정 후 다시 유효 제출 | 안내 다시 표시 |
| 이메일을 지우고 제출 | 안내 없음, 이메일 오류 표시 |
| 다크 모드 | 성공 안내가 배경과 구분되는 색 |

### 실제 검증 결과

Ubuntu 24.04.1, Node.js 24.18.1, Playwright 1.63.0, Chromium 153.0.8010.12(headless shell)에서 `src/`를 임시 HTTP 서버로 띄우고 1280×720 창으로 아래 순서를 실행했다. 단계마다 성공 안내의 `textContent`와 색(computed style), 세 필드의 오류 문구와 `aria-invalid`, 입력값, 포커스, 주소를 읽었다.

- **초기 상태.** 성공 안내 요소가 처음부터 문서에 있고(`role="status"`), `textContent`는 `""`였다. 오류 문구도 비어 있고 `aria-invalid` 속성은 없었다(`null`).
- **빈 제출.** 세 필드에 필수값 오류가 표시되고 성공 안내는 `""`로 유지됐다. 포커스는 `contact-name`, 주소는 변하지 않았다.
- **형식 오류 제출.** 이름 `지호`, 이메일 `jiho@`, 메시지 `포트폴리오 문의드립니다.`로 제출하니 이메일만 `aria-invalid="true"`가 되고 성공 안내는 여전히 `""`였다.
- **이메일 수정.** `jiho@example.com`으로 고치자 `input` 이벤트로 오류가 해제됐고, 이 시점에도 성공 안내는 `""`였다.
- **유효 제출.** 성공 안내가 "입력한 내용을 모두 확인했습니다. 실제 전송 기능은 아직 없어 내용은 전송되지 않았습니다."로 채워졌다. 색은 `rgb(21, 128, 61)`, 주소는 제출 전후가 같았고, 입력값 `["지호", "jiho@example.com", "포트폴리오 문의드립니다."]`가 그대로 남았으며 `document.activeElement`는 `body`(빈 `id`)로 포커스 이동이 없었다.
- **성공 후 입력.** 메시지 칸에 ` 감사합니다.`를 이어 입력하자 성공 안내가 `""`로 돌아갔다. 오류 상태는 그대로 없음이었다.
- **재제출.** 다시 제출하니 같은 안내 문구가 다시 표시됐다.
- **실패 제출로 인한 해제.** 이메일을 지우고 제출하니 성공 안내는 `""`, 이메일에 "이메일을 입력해 주세요."가 표시되고 포커스가 이메일로 갔다. 다만 이때 성공 안내는 **이메일을 지우는 입력 시점에 이미 해제된 상태**였다(지우기 직후 읽은 값이 `""`). 제출 분기 쪽 해제만 따로 확인하려고, `input` 이벤트를 거치지 않고 스크립트로 `value`만 비운 뒤 제출하는 경우를 별도로 실행했다. 값만 비운 직후에는 안내가 남아 있었고(`"입력한 내용을 모두 확인했습니다…"`), 제출 후 `""`로 바뀌며 이름 오류와 포커스 이동이 나타났다.
- **다크 테마.** 테마를 전환한 뒤 유효 제출하니 안내 색이 `rgb(134, 239, 172)`로 바뀌어 어두운 배경에서도 구분됐다.
- **기존 기능 회귀.** 테마를 되돌리고 새로고침하니 `data-theme`와 `localStorage`의 `theme` 모두 `light`, 맨 위로 버튼은 숨김, 폼은 성공 안내와 오류가 모두 빈 초기 상태였다. 콘솔 오류와 페이지 JavaScript 오류는 없었다.

검증은 작업트리 안의 일회성 스크립트 두 개로 실행하고 결과를 기록한 뒤 삭제했다. 공통 도구 환경(`~/.local/share/codex-tools/browser`)의 Playwright·Chromium·런타임 라이브러리·글꼴 설정을 재사용했다.

**직접 확인하지 않은 것**: 실제 스크린 리더가 `role="status"` 영역의 변화를 낭독하는지, 마우스·키보드 수동 조작, Chromium 외의 브라우저. 라이브 리전의 낭독 동작은 DOM 값 검사로는 확인할 수 없다.

## 6. 참고자료

- [MDN — ARIA: status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role): `alert`만큼 급하지 않은 안내용 라이브 리전이라는 정의, 암묵적 `aria-live="polite"`와 `aria-atomic="true"`, 내용이 바뀔 때 포커스를 주지 말라는 권고를 확인했다. 확인일 2026-09-15.
- [MDN — ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions): 내용을 바꾸기 전에 라이브 리전을 먼저 만들어 두라는 권고와 초기 마크업에 포함하는 것이 가장 확실하다는 설명, `polite`가 사용자가 쉴 때 읽는다는 설명을 확인했다. 확인일 2026-09-15.
- [submit·input 이벤트로 문의 폼 검증하기](016-form-validation.md): 이 단계가 이어 쓰는 검증 로직과 `preventDefault()`, `aria-invalid` 상태 관리.
