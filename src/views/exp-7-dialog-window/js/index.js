import '../styles/main.scss';

document.querySelectorAll('.open-dialog').forEach(el => {
    el.addEventListener('click', () => {
        document.querySelector('.dialog').classList.remove('dialog_hidden');
    });
});

document.querySelectorAll('.close-dialog, .dialog__wrapper').forEach(el => {
    el.addEventListener('click', () => {
        document.querySelector('.dialog').classList.add('dialog_hidden');
    });
});

document.querySelectorAll('.dialog__window').forEach(el => {
    el.addEventListener('click', e => {
        e.stopPropagation();
    });
});
