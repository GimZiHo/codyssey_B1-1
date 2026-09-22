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

// 저장된 사용자 선택이 있으면 그것을 우선하고, 없으면 시스템 다크/라이트 설정을 따른다.
const storedTheme = localStorage.getItem('theme');
const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const isValidTheme = (theme) => theme === 'dark' || theme === 'light';

applyTheme(isValidTheme(storedTheme) ? storedTheme : (prefersDarkQuery.matches ? 'dark' : 'light'));

// 사용자가 저장한 선택이 없는 동안에만 시스템 설정 변경을 반영한다.
prefersDarkQuery.addEventListener('change', (event) => {
  if (!isValidTheme(localStorage.getItem('theme'))) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

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

// 관찰 대상은 섹션이 아니라 그 제목이다. 제목은 화면보다 작아서 API 카드가 늘어도 높이가 그대로라
// 20% 기준이 항상 성립한다. 섹션 자체를 관찰하면 목록이 길어질 때 비율이 0.2에 닿지 못한다.
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
      // 표시 클래스는 제목이 아니라 그 제목이 속한 섹션에 붙인다.
      entry.target.closest('section').classList.add('visible');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

// 대기 클래스를 JavaScript에서만 붙여 스크립트가 없으면 본문이 그대로 보이게 한다.
sections.forEach((section) => {
  section.classList.add('reveal');
  sectionObserver.observe(section.querySelector('h1, h2'));
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

const projectStatus = document.querySelector('#project-status');
const projectList = document.querySelector('#project-list');
const projectRetryButton = document.querySelector('#project-retry');
const projectFilter = document.querySelector('#project-filter');
const projectLanguageSelect = document.querySelector('#project-language');

// 언어가 없는 저장소를 고르는 선택지 값. 실제 언어 이름과 겹치지 않도록 별도 상수로 둔다.
const UNSPECIFIED_LANGUAGE = '__unspecified__';
const ALL_LANGUAGES = 'all';

const githubUsername = 'GimZiHo';
const repositoriesUrl = `https://api.github.com/users/${githubUsername}/repos`;

// API가 준 문자열을 innerHTML에 그대로 넣으면 태그로 해석되므로 HTML에서 뜻을 가지는 문자를 먼저 바꾼다.
const escapeHtml = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// 주소도 문자열로 붙으므로 javascript: 같은 스킴이 끼어들지 못하게 GitHub 주소만 링크로 만든다.
const isGithubUrl = (url) => typeof url === 'string' && url.startsWith('https://github.com/');

// 저장소 객체 하나를 카드 HTML 문자열로 바꾼다. 필요한 값만 구조분해로 꺼내고 긴 이름은 바꿔 받는다.
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

// API 원본 목록에서 select에 쓸 고유 언어 선택지를 만든다. null 언어는 '미지정' 하나로 묶는다.
const buildLanguageOptions = (repositories) => {
  const options = [{ value: ALL_LANGUAGES, label: '전체' }];
  const seen = new Set();

  repositories.forEach(({ language }) => {
    if (language === null) {
      if (!seen.has(UNSPECIFIED_LANGUAGE)) {
        seen.add(UNSPECIFIED_LANGUAGE);
        options.push({ value: UNSPECIFIED_LANGUAGE, label: '미지정' });
      }
      return;
    }

    if (!seen.has(language)) {
      seen.add(language);
      options.push({ value: language, label: language });
    }
  });

  return options;
};

// 원본 배열은 그대로 두고 선택된 언어에 맞는 저장소만 걸러 새 배열로 돌려준다.
const filterRepositoriesByLanguage = (repositories, selectedLanguage) => {
  if (selectedLanguage === ALL_LANGUAGES) {
    return repositories;
  }

  if (selectedLanguage === UNSPECIFIED_LANGUAGE) {
    return repositories.filter(({ language }) => language === null);
  }

  return repositories.filter(({ language }) => language === selectedLanguage);
};

// select의 표시 여부와 옵션·선택값을 지금 목록에 맞춘다. 목록이 없을 때는 통째로 숨긴다.
const renderLanguageFilter = (status, repositories, selectedLanguage) => {
  const showFilter = status === 'success' && repositories.length > 0;

  projectFilter.hidden = !showFilter;

  if (!showFilter) {
    return;
  }

  const options = buildLanguageOptions(repositories);

  projectLanguageSelect.innerHTML = options
    .map(({ value, label }) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join('');
  projectLanguageSelect.value = selectedLanguage;
};

// 화면을 그리는 유일한 지점. 지금 상태만 보고 문구·재시도 버튼·카드 목록을 한 번에 맞춘다.
const renderProjects = ({ status, repositories, errorMessage, selectedLanguage }) => {
  // 실패일 때만 오류 색 클래스를 붙이고, 나머지 상태에서는 지워 이전 실패의 흔적을 남기지 않는다.
  if (status === 'error') {
    projectStatus.classList.add('error');
  } else {
    projectStatus.classList.remove('error');
  }

  projectRetryButton.hidden = status !== 'error';
  // 이전 상태에서 그린 카드는 먼저 지운다.
  projectList.innerHTML = '';
  renderLanguageFilter(status, repositories, selectedLanguage);

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

  // 원본 repositories는 그대로 두고, 화면에는 선택한 언어로 거른 결과만 그린다.
  const filteredRepositories = filterRepositoriesByLanguage(repositories, selectedLanguage);

  if (filteredRepositories.length === 0) {
    projectStatus.textContent = '선택한 언어의 프로젝트가 없습니다.';
    return;
  }

  projectStatus.textContent = '';
  projectList.innerHTML = filteredRepositories.map(createProjectCard).join('');
};

// 요청 상태를 담는 하나의 값. 아직 요청하지 않은 상태가 idle이다. selectedLanguage는 필터의 현재 선택값이다.
let projectState = {
  status: 'idle',
  repositories: [],
  errorMessage: '',
  selectedLanguage: ALL_LANGUAGES,
};

// 상태를 바꾸는 유일한 지점. 바꾼 직후에 화면을 다시 그린다.
const setProjectState = (nextState) => {
  projectState = nextState;
  renderProjects(projectState);
};

// fetch는 403·404 같은 오류 응답도 거부하지 않으므로 상태 코드를 직접 보고 안내를 만든다.
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

const loadProjects = async () => {
  // 요청 중이면 상태가 loading이다. 재시도를 연달아 눌러도 요청은 하나만 나간다.
  if (projectState.status === 'loading') {
    return;
  }

  // 새 요청을 시작하면 이전 목록에서 고른 언어는 더 이상 유효하지 않으므로 전체로 되돌린다.
  setProjectState({ status: 'loading', repositories: [], errorMessage: '', selectedLanguage: ALL_LANGUAGES });

  try {
    // await가 응답을 기다리는 동안 화면은 로딩 상태 그대로 남는다.
    const response = await fetch(repositoriesUrl);

    if (!response.ok) {
      throw new Error(describeResponseError(response.status));
    }

    const repositories = await response.json();

    setProjectState({ status: 'success', repositories, errorMessage: '', selectedLanguage: ALL_LANGUAGES });
  } catch (error) {
    // 연결 자체가 실패하면 fetch가 TypeError로 거부하므로 안내를 따로 만든다.
    const reason = error instanceof TypeError ? '네트워크에 연결하지 못했습니다.' : error.message;

    setProjectState({
      status: 'error',
      repositories: [],
      selectedLanguage: ALL_LANGUAGES,
      errorMessage: `프로젝트를 불러올 수 없습니다. ${reason}`,
    });
  }
};

projectRetryButton.addEventListener('click', loadProjects);

// 선택한 언어만 상태에 반영한다. 원본 repositories는 바꾸지 않고 다시 요청하지도 않는다.
projectLanguageSelect.addEventListener('change', () => {
  setProjectState({ ...projectState, selectedLanguage: projectLanguageSelect.value });
});

// 페이지를 열면 바로 한 번 요청한다.
loadProjects();
