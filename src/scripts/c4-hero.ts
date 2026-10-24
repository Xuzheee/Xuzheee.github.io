const hero = document.querySelector<HTMLElement>('[data-c4-hero]');
if (hero) {
  const logo = hero.querySelector<HTMLButtonElement>('[data-c4-replay]')!;
  const state = hero.querySelector<HTMLElement>('[data-c4-state]')!;
  const progress = hero.querySelector<HTMLElement>('[data-c4-progress]')!;
  const announcement = hero.querySelector<HTMLElement>('[data-c4-announcement]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let replay = false;

  const complete = () => {
    state.textContent = 'MORI-01';
    progress.textContent = '● ONLINE';
    hero.dataset.bootState = 'ready';
    if (replay) announcement.textContent = 'Mori 标志启动完成';
    frame = 0;
  };
  const boot = () => {
    cancelAnimationFrame(frame);
    hero.classList.remove('is-booting');
    announcement.textContent = '';
    if (reduced.matches) { complete(); return; }
    // Restart the supplied assembly timeline, including rapid repeated clicks.
    void hero.offsetWidth;
    hero.classList.add('is-booting');
    hero.dataset.bootState = 'booting';
    state.textContent = 'SYS.BOOT';
    progress.textContent = '0%';
    const start = performance.now();
    const tick = (now: number) => {
      const amount = Math.min(1, Math.max(0, (now - start - 200) / 2400));
      progress.textContent = `${Math.round(100 * (1 - Math.pow(1 - amount, 2)))}%`;
      if (now - start < 2950) frame = requestAnimationFrame(tick);
      else complete();
    };
    frame = requestAnimationFrame(tick);
  };
  const resetTilt = () => {
    logo.style.setProperty('--mx', '0');
    logo.style.setProperty('--my', '0');
  };
  logo.addEventListener('click', () => { replay = true; boot(); });
  hero.addEventListener('pointermove', event => {
    if (reduced.matches || event.pointerType === 'touch') return;
    const box = logo.getBoundingClientRect();
    const x = (event.clientX - box.left - box.width / 2) / (innerWidth / 2);
    const y = (event.clientY - box.top - box.height / 2) / (innerHeight / 2);
    logo.style.setProperty('--mx', Math.max(-1, Math.min(1, x)).toFixed(3));
    logo.style.setProperty('--my', Math.max(-1, Math.min(1, y)).toFixed(3));
  });
  hero.addEventListener('pointerleave', resetTilt);
  reduced.addEventListener('change', () => { resetTilt(); replay = false; boot(); });
  let inView = true;
  const updateVisibility = () => hero.classList.toggle('is-paused', !inView || document.hidden);
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updateVisibility(); });
  observer.observe(hero);
  document.addEventListener('visibilitychange', updateVisibility);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); });
  window.addEventListener('pageshow', event => { if (event.persisted) { replay = false; boot(); } });
  boot();
}
