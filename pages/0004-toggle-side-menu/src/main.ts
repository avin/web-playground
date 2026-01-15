import './main.scss';

const sideMenuBtn = document.querySelector('.side-menu__btn');
const sideMenu = document.querySelector('.side-menu');

const closeMenu = () => {
  if (sideMenu && sideMenuBtn) {
    sideMenu.classList.remove('side-menu_active');
    sideMenuBtn.classList.remove('side-menu__btn_close');
  }
};

if (sideMenuBtn && sideMenu) {
  sideMenuBtn.addEventListener('click', () => {
    sideMenu.classList.toggle('side-menu_active');
    sideMenuBtn.classList.toggle('side-menu__btn_close');
  });
}

// Закрытие меню при клике на menu-item или html
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('.side-menu__menu-item')) {
    closeMenu();
  } else if (
    sideMenu &&
    !sideMenu.contains(target) &&
    sideMenu.classList.contains('side-menu_active')
  ) {
    closeMenu();
  }
});

if (sideMenu) {
  sideMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}
