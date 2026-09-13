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
