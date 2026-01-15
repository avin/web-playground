import './main.scss';

document.querySelectorAll('.open-dialog').forEach((el) => {
  el.addEventListener('click', () => {
    const dialog = document.querySelector('.dialog');
    if (dialog) {
      dialog.classList.remove('dialog_hidden');
    }
  });
});

document.querySelectorAll('.close-dialog, .dialog__wrapper').forEach((el) => {
  el.addEventListener('click', () => {
    const dialog = document.querySelector('.dialog');
    if (dialog) {
      dialog.classList.add('dialog_hidden');
    }
  });
});

document.querySelectorAll('.dialog__window').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});
