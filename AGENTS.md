# 포트폴리오 프로젝트 — Codex 지침

전역 AGENTS.md의 역할·위임·검토·커밋 규칙을 따른다. 이 파일은 프로젝트 공통 조건과 Codex의 확인 경로만 정의한다.

## 프로젝트 공통 조건

- 순수 HTML·CSS·JavaScript로 반응형 자기소개 포트폴리오를 만든다. 시각적 완성도보다 DOM 조작·이벤트·비동기 처리와 **이벤트 → 상태 변경 → 화면 업데이트** 흐름의 이해를 우선한다.
- 요구사항과 진행 상태의 원본은 [docs/progress.md](docs/progress.md)다. 누락·불명확한 부분만 [과제 PDF](docs/assignment-requirements.pdf)로 확인한다.
- 외부 라이브러리·프레임워크(React, Vue, jQuery, Bootstrap, Tailwind CSS 등)는 금지한다. Font Awesome 아이콘과 Google Fonts는 허용한다.
- `var`, HTML의 `onclick`, 인라인 `style`은 사용하지 않는다.
- 접근성은 과제에서 요구한 이미지 `alt`, 폼 `label` 연결 등을 구현하며 요구사항 밖의 보완으로 범위를 넓히지 않는다.
- 소스는 `src/index.html`, `src/css/style.css`, `src/js/`, `src/images/`에 둔다. 테스트는 필요할 때 `src/tests/`에 둔다.
- 동작은 브라우저 실행으로 상태·시간에 따른 변화를 검사한다. 구현 단계에서는 정지 화면을 캡처하지 않는다. GIF·영상은 필요한 경우만 검토하고 최종 제출용 스크린샷은 제출 단계에 준비한다.

## 작업 시작과 위임

- `docs/progress.md`의 현재 상태와 해당 작업 체크리스트를 확인해 하나의 학습 단위를 정한다.
- Claude Code에 구현·검증·학습자료 작성과 진행 상태 갱신을 맡긴다.
- `CLAUDE.md`와 그 문서가 참조하는 구현·학습자료 지침은 Claude Code가 직접 읽고 따른다. Codex는 사용자가 해당 지침의 확인·수정을 명시적으로 요청한 경우에만 읽는다.
- 사용자는 이 프로젝트의 구현·검증·학습자료 작성에 필요한 소스와 지침을 Claude Code를 통해 Anthropic API로 전송하는 것을 승인한다. 같은 범위의 위임은 매번 확인하지 않고 진행한다.
- 학습 문서의 상세 작성은 Claude Code에 맡긴다. Codex는 소스와 필요한 검증 근거를 검토하고 자료 반영 여부는 완료 보고로 확인한다.
