const navigation = document.querySelector('nav');
const menuButton = document.querySelector('#menu-toggle');
const navigationMenu = document.querySelector('#navigation-menu');

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
