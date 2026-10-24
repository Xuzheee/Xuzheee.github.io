// Decorative motion only: no pointer capture, scrolling changes, or interaction required.
const mark = document.querySelector('[data-hero-mark]');
if (mark) {
  const tilt = mark.querySelector('.m-hero-mark-tilt');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let visible = true;
  let frame = 0;
  let x = 0;
  let y = 0;
  const canMove = () => visible && !document.hidden && !reduced.matches;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    x = y = 0;
    for (const property of ['--mark-rx', '--mark-ry', '--mark-x', '--mark-y']) {
      tilt.style.removeProperty(property);
    }
  };
  const refresh = () => {
    mark.classList.toggle('is-moving', canMove());
    if (!canMove() || !finePointer.matches) reset();
  };
  mark.addEventListener('pointermove', event => {
    if (!canMove() || !finePointer.matches || event.pointerType === 'touch') return;
    const box = mark.getBoundingClientRect();
    if (!box.width || !box.height) return;
    x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
    y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      tilt.style.setProperty('--mark-rx', `${-y * 3}deg`);
      tilt.style.setProperty('--mark-ry', `${x * 3}deg`);
      tilt.style.setProperty('--mark-x', `${x * 4}px`);
      tilt.style.setProperty('--mark-y', `${y * 4}px`);
    });
  }, { passive: true });
  mark.addEventListener('pointerleave', reset);
  mark.addEventListener('pointercancel', reset);
  reduced.addEventListener('change', refresh);
  finePointer.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pagehide', reset);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      refresh();
    }, { threshold: 0.05 }).observe(mark);
  }
  refresh();
}
