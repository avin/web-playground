import './main.scss';

const menu = document.querySelector('.menu');
if (menu) {
  menu.addEventListener('click', (e) => {
    e.preventDefault();
    menu.classList.toggle('menu_active');
  });
}
