const navigation = document.querySelector('nav');
const menuButton = document.querySelector('#menu-toggle');
const navigationMenu = document.querySelector('#navigation-menu');
const themeToggleButton = document.querySelector('#theme-toggle');

menuButton.addEventListener('click', () => {
  const isOpen = navigationMenu.classList.toggle('active');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

// 클릭 처리를 연결한 뒤 모바일 메뉴를 접고 버튼을 표시한다.
navigation.classList.add('menu-ready');
menuButton.hidden = false;

const scrollTopButton = document.querySelector('#scroll-top');

const updateScrollTopButton = () => {
  scrollTopButton.hidden = window.scrollY < 300;
};

window.addEventListener('scroll', updateScrollTopButton);

scrollTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 처음 실행할 때도 현재 스크롤 위치에 맞게 표시 여부를 정한다.
updateScrollTopButton();

// 현재 테마를 화면과 버튼 문구에 반영한다.
const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;

  if (theme === 'dark') {
    themeToggleButton.textContent = '라이트 모드로 전환';
  } else {
    themeToggleButton.textContent = '다크 모드로 전환';
  }
};

// 저장된 테마가 있으면 복원하고, 없으면 기본값인 light를 사용한다.
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggleButton.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  applyTheme(nextTheme);
  localStorage.setItem('theme', nextTheme);
});

// force 인자로 60px 이상이면 유지, 미만이면 제거한다.
const updateNavigationBackground = () => {
  navigation.classList.toggle('scrolled', window.scrollY >= 60);
};

window.addEventListener('scroll', updateNavigationBackground);

updateNavigationBackground();

const sections = document.querySelectorAll('main section');

// 20% 이상 보이는 섹션에 표시 클래스를 붙이고 감시를 끝내 한 번만 등장시킨다.
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
      entry.target.classList.add('visible');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

// 대기 클래스를 JavaScript에서만 붙여 스크립트가 없으면 본문이 그대로 보이게 한다.
sections.forEach((section) => {
  section.classList.add('reveal');
  sectionObserver.observe(section);
});

const contactForm = document.querySelector('#contact-form');
const contactSuccess = document.querySelector('#contact-success');

// @ 앞뒤에 공백이 없는 글자가 있고, 도메인에 점이 하나 이상 있는지만 확인한다.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 필드마다 입력 요소, 오류를 표시할 요소, 검증 규칙을 함께 둔다.
// 규칙은 오류 문구를 돌려주고, 빈 문자열이면 통과를 뜻한다.
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
  {
    input: document.querySelector('#contact-message'),
    errorText: document.querySelector('#contact-message-error'),
    validate: (value) => (value.trim() === '' ? '메시지를 입력해 주세요.' : ''),
  },
];

// 성공 안내를 켜고 끄는 유일한 지점. 빈 문자열이면 안내가 없는 상태다.
const renderFormSuccess = (message) => {
  contactSuccess.textContent = message;
};

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

// 오류가 표시된 필드만 입력에 맞춰 다시 검사한다. 처음 작성하는 동안에는 오류를 띄우지 않는다.
contactFields.forEach((field) => {
  field.input.addEventListener('input', () => {
    // 입력이 바뀌면 직전 제출의 성공 안내는 더 이상 지금 값에 대한 결과가 아니다.
    renderFormSuccess('');

    if (field.input.getAttribute('aria-invalid') === 'true') {
      validateField(field);
    }
  });
});
