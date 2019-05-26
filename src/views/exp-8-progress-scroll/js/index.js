import '../styles/main.scss';

function ready(fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(() => {
    const body = document.body;
    const html = document.documentElement;

    window.addEventListener('scroll', () => {
        const pageHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
        );

        const scrollPosition = html.scrollTop;

        const value = (scrollPosition / (pageHeight - window.outerHeight)) * 100;

        document.querySelector('.progress-scroll__fill').style.width = `${value}%`;
    });
});
