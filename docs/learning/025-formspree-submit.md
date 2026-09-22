# Formspree로 문의 폼을 실제로 전송하기

## 1. 학습 목적

문의 폼의 마지막 선택 과제로, 검증을 통과한 입력을 외부 이메일 전송 서비스 [Formspree](https://formspree.io/)로 실제 전송한다. [017](017-form-success-state.md)까지는 "검증만 하고 전송하지 않는다"는 전제였고, 이번 단계에서 그 전제가 바뀐다. 핵심은 두 가지다. `fetch`로 폼 데이터를 보내고 응답에 따라 성공·실패를 가르는 것, 그리고 전송이 끝나기 전까지 사용자가 같은 요청을 두 번 보내지 못하게 막는 것이다.

## 2. 핵심 개념

### 세 값이 아니라 네 값을 가지는 상태

017의 성공 안내는 "통과했다 / 안 했다"의 두 값이면 충분했다. 실제 전송은 그 사이에 **기다리는 시간**이 생긴다. `fetch`가 응답을 받기까지는 성공도 실패도 아니다. 그래서 `contactState`는 `idle`·`submitting`·`success`·`error` 네 가지 상태를 갖는 하나의 객체다([main.js:158](../../src/js/main.js#L158)).

```js
let contactState = { status: 'idle', errorMessage: '' };
```

`renderContactState`는 이 상태 하나만 보고 버튼 텍스트·비활성화·안내 문구·오류 색을 전부 결정한다([main.js:161](../../src/js/main.js#L161)). 상태를 바꾸는 곳은 `setContactState` 한 곳뿐이고, 바꾼 직후 바로 렌더링한다([main.js:181](../../src/js/main.js#L181)). 017의 "표시 지점은 하나"라는 원칙이 그대로 이어진다.

### 버튼 잠금으로 중복 요청 막기

`submitting` 상태에서는 두 가지를 동시에 한다.

```js
contactSubmitButton.disabled = state.status === 'submitting';
contactSubmitButton.textContent = state.status === 'submitting' ? '전송 중...' : '문의하기';
```

버튼을 비활성화하면 마우스로 두 번 눌러도 두 번째 클릭은 `submit` 이벤트 자체를 만들지 않는다. 그래도 `submit` 리스너 맨 앞에 한 번 더 확인한다.

```js
if (contactState.status === 'submitting') {
  return;
}
```

버튼 비활성화는 화면 상태고, 이 확인은 로직 상태다. 키보드로 폼 안에서 Enter를 눌러 제출하는 경로는 버튼을 거치지 않으므로, 화면만 믿지 않고 상태값도 같이 확인해야 두 경로 모두 막힌다.

### fetch로 폼 데이터 보내고 상태 코드로 가르기

```js
const response = await fetch(contactEndpoint, {
  method: 'POST',
  headers: { Accept: 'application/json' },
  body: new FormData(contactForm),
});

if (!response.ok) {
  throw new Error('Formspree가 요청을 거부했습니다. 잠시 후 다시 시도해 주세요.');
}
```

`new FormData(폼요소)`는 폼 안의 `name` 속성이 있는 입력을 모두 모아 `multipart/form-data`로 보낼 준비를 한다. `response.ok`는 상태 코드가 200~299일 때만 참이다([MDN Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)). `fetch`는 404·422 같은 오류 응답을 받아도 거부(reject)하지 않고 이행(resolve)하므로, 실패를 잡으려면 `response.ok`를 직접 확인해야 한다 — [MDN Fetch 사용하기](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)의 "fetch() will only reject a promise if the request could not be made... it will not reject on an HTTP error status" 설명대로다.

`Accept: application/json`은 Formspree 쪽 설정이다. 이 헤더가 없으면 Formspree는 성공 시 자신의 안내 페이지로 리다이렉트하는데, 그러면 `fetch`가 그 리다이렉트 응답을 그대로 받아 이 프로젝트의 상태 UI를 쓸 수 없다. JSON을 요청하면 리다이렉트 대신 상태 코드가 있는 JSON 응답이 온다.

### 두 가지 실패를 구분해서 잡기

```js
} catch (error) {
  const reason = error instanceof TypeError ? '네트워크에 연결하지 못했습니다.' : error.message;
  setContactState({ status: 'error', errorMessage: `문의를 보내지 못했습니다. ${reason}` });
}
```

`catch`에 들어오는 오류는 출처가 둘이다. 요청이 아예 나가지 못하면(오프라인, DNS 실패 등) `fetch` 자체가 `TypeError`로 거부한다. 응답은 받았지만 `response.ok`가 거짓이면 위에서 직접 던진 `Error`가 잡힌다. `error instanceof TypeError`로 이 둘을 가르는 이유는, 두 경우의 원인이 달라서다 — 네트워크 문제는 재시도해 볼 만하고, 서버가 거부한 요청은 입력값이나 설정 문제일 수 있다. [[requirement-literal-and-accurate-messages]]의 기준대로, 실제로 구분할 수 있는 범위까지만 안내하고 원인을 더 단정하지 않는다.

## 3. 프로젝트 적용

### HTML — 외부 서비스 전송 고지

[index.html:78](../../src/index.html#L78)에 실제 전송 대상을 알리는 문구를 둔다.

```html
<p id="contact-notice">입력한 내용은 Formspree(외부 서비스)로 전송되어 이메일 알림에 쓰입니다.</p>
```

017까지는 전송 기능이 없어 "전송되지 않는다"고 썼지만, 이제는 실제로 외부 서버에 개인정보(이름·이메일·메시지)가 전달되므로 그 사실을 먼저 알려야 한다.

### CSS — 실패 상태 색 재사용

[style.css:269](../../src/css/style.css#L269)는 017의 성공 색 스타일에 오류용 클래스를 더한 것으로, 새 변수를 만들지 않았다.

```css
#contact-success.error {
  color: var(--color-error);
}
```

`renderContactState`가 `classList.toggle('error', state.status === 'error')`로 이 클래스를 붙이고 뗀다. 같은 요소(`#contact-success`)가 성공·실패 문구를 둘 다 담당하므로, 표시할 문구 없이 색만 바뀐다.

### JavaScript — 경쟁 조건(race condition) 보완

처음 구현에서는 `input` 이벤트가 조건 없이 상태를 `idle`로 되돌렸다. 검토에서 발견된 문제는, `submitting` 상태에서 사용자가 다른 입력칸을 건드리면 이 리스너가 상태를 `idle`로 바꾸면서 버튼 잠금이 풀린다는 것이었다. 그 순간 원래의 `fetch` 요청은 아직 서버 응답을 기다리는 중이므로, 사용자가 다시 제출 버튼을 누르면 같은 내용의 요청이 하나 더 나간다. **두 개의 비동기 흐름(진행 중인 fetch와 사용자의 새 입력)이 같은 상태값을 두고 경쟁하는** 경쟁 조건이다.

```js
if (contactState.status === 'success' || contactState.status === 'error') {
  setContactState({ status: 'idle', errorMessage: '' });
}
```

`submitting`을 조건에서 제외해 이 경로를 막는다. 전송 중에는 아직 확정된 결과가 없으므로 입력이 바뀌어도 되돌릴 상태가 없고, `fetch`가 끝나야 `success`나 `error`로 정해진다. 017의 "오래된 상태 무효화"는 이번에도 같은 원리이지만, 무효화해야 하는 대상이 **이미 확정된 이전 결과**로 좁혀진 점이 다르다. 진행 중인 요청은 무효화 대상이 아니라 완료를 기다려야 하는 대상이다.

## 4. 실행 흐름

**정상 전송**

1. 검증을 통과하면 `setContactState({ status: 'submitting' })`이 실행돼 버튼이 "전송 중..."으로 바뀌고 비활성화된다.
2. `fetch`가 Formspree에 `POST`로 폼 데이터를 보낸다.
3. `response.ok`가 참이면 상태가 `success`로 바뀌어 "문의를 보냈습니다..." 문구가 뜨고, `contactForm.reset()`으로 입력을 비운다.

**서버가 요청을 거부할 때**

1. `response.ok`가 거짓이면 `Error`를 던진다.
2. `catch`가 `error.message`를 그대로 안내 문구에 쓴다. 상태는 `error`, 안내 색은 오류 색으로 바뀐다.

**전송 중 다른 입력칸 수정 (보완된 경로)**

1. 이름 필드가 전송 중인 상태에서 메시지 필드에 타이핑한다.
2. `input` 리스너가 실행되지만 `contactState.status`가 `submitting`이라 조건을 만족하지 않아 상태를 바꾸지 않는다.
3. 버튼은 계속 비활성화 상태로 남고, `fetch` 응답이 온 뒤에야 `success`나 `error`로 넘어간다.

## 5. 확인 방법과 결과

### 직접 확인하는 절차

| 확인 항목 | 기대 동작 |
| --- | --- |
| 유효한 내용 제출 | 버튼이 "전송 중..."으로 잠겼다가 성공 안내로 바뀌고 폼이 비워짐 |
| 전송 중 다른 필드 수정 | 버튼이 잠긴 채 유지, 상태가 `idle`로 풀리지 않음 |
| 전송 중 버튼 재클릭·Enter 재제출 | 새 요청이 나가지 않음 |
| 서버 오류(4xx) 응답 | 오류 색 안내, 입력값 유지 |
| 네트워크 연결 실패 | "네트워크에 연결하지 못했습니다." 안내 |
| 성공/실패 안내 상태에서 입력 수정 | 안내가 `idle`로 해제됨 |

### 실제 검증 결과

`node src/tests/final-browser-check.cjs -s contact-form`, Chromium Headless Shell 153.0.8010.12, Playwright 1.63.0, Node.js 24.18.1로 mobile(375px)·tablet(768px)·desktop(1280px) 각 35건씩 총 105건을 실행해 모두 통과했다(실패 0건). 이 테스트는 `contactEndpoint`로 나가는 요청을 가로채 모킹한 응답으로 성공·실패·네트워크 오류를 재현했고, 경쟁 조건 보완 뒤의 "전송 중 입력 수정" 시나리오도 이 안에서 확인했다.

### 실제 엔드포인트 호출 확인

개인정보 없는 합성 데이터(이름 "Codex 검증", 이메일 `test@example.com`, 메시지 "포트폴리오 문의 폼 자동 검증 테스트입니다.")로 실제 `https://formspree.io/f/xbglopny`에 `POST`를 정확히 1회 실행했다. 응답은 HTTP 200, 본문 `{"next":"/thanks","ok":true}`였다. `response.ok`가 참이 되는 상태 코드이므로 `renderContactState`의 `success` 분기가 실제로도 이 경로를 타는 것을 확인했다.

**직접 확인하지 않은 것**: 실제 이메일 수신 여부, 서버 오류(4xx)·네트워크 실패 시 Formspree가 실제로 반환하는 값, 사람이 직접 조작하며 보는 확인, Chromium 외 브라우저 확인.

## 6. 참고자료

- [Formspree — AJAX 폼 제출 문서](https://formspree.io/docs/plugins/ajax/): `Accept: application/json` 헤더로 리다이렉트 대신 JSON 응답을 받는 방식을 확인했다. 확인일 2026-09-22.
- [MDN — fetch() 사용하기](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch): `fetch`가 HTTP 오류 상태 코드에서는 거부하지 않고 `response.ok`로 직접 확인해야 한다는 설명을 확인했다. 확인일 2026-09-22.
- [MDN — Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok): 상태 코드 200~299 범위에서만 참이라는 정의를 확인했다. 확인일 2026-09-22.
- [MDN — FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData): 폼 요소를 인자로 넘기면 `name` 속성이 있는 입력을 모아 준다는 설명을 확인했다. 확인일 2026-09-22.
- [폼 제출 결과를 성공 안내로 표시하고 해제하기](017-form-success-state.md): 상태 단일 렌더링 지점과 오래된 상태 무효화 원칙을 이어받은 이전 단계.
