import './main.scss';

const updateProgress = () => {
  const body = document.body;
  const html = document.documentElement;

  const pageHeight = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight,
  );

  const scrollPosition = html.scrollTop;

  const value = (scrollPosition / (pageHeight - window.outerHeight)) * 100;

  const fillEl = document.querySelector(
    '.progress-scroll__fill',
  ) as HTMLElement;
  if (fillEl) {
    fillEl.style.width = `${value}%`;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', updateProgress);
  });
} else {
  window.addEventListener('scroll', updateProgress);
}
