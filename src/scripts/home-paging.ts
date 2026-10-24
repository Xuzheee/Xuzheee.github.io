// Progressive desktop paging; the document remains the only scroll container.
const home = document.querySelector<HTMLElement>('.m-home');
if (home) {
  const sections = [...document.querySelectorAll<HTMLElement>('.m-home > section.m-scene, .m-home-site > .m-site-closing')];
  const desktop = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let enabled = false;
  let frame = 0;
  let animating = false;
  let lastWheel = -Infinity;
  let lastDirection = 0;
  let gestureUsed = false;
  let accumulated = 0;

  const cancelAnimation = () => {
    cancelAnimationFrame(frame);
    animating = false;
  };
  const refresh = () => {
    cancelAnimation();
    enabled = desktop.matches && !reducedMotion.matches;
    root.classList.toggle('m-home-paging', enabled);
    root.style.setProperty('--home-first-screen-height', `${Math.max(0, innerHeight - (home.getBoundingClientRect().top + scrollY))}px`);
    lastWheel = -Infinity;
    gestureUsed = false;
  };
  const ranges = () => sections.map((section, index) => {
    const box = section.getBoundingClientRect();
    // The compact shared footer can start below the last reachable scroll position.
    const start = index === 0 ? 0 : Math.min(box.top + scrollY, Math.max(0, root.scrollHeight - innerHeight));
    return { start, end: Math.max(start, box.bottom + scrollY - innerHeight) };
  });
  const scrollToPage = (position: number) => {
    cancelAnimation();
    const start = scrollY;
    const end = Math.max(0, Math.min(position, root.scrollHeight - innerHeight));
    if (Math.abs(end - start) < 1) return;
    const began = performance.now();
    const duration = 620;
    animating = true;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo({ top: start + (end - start) * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(tick);
      else animating = false;
    };
    frame = requestAnimationFrame(tick);
  };
  const navigate = (direction: number, distance: number) => {
    const pages = ranges();
    let index = pages.findLastIndex(page => scrollY >= page.start - 2);
    index = Math.max(0, index);
    const current = pages[index];
    // Read tall sections in the document before advancing to the next chapter.
    const boundary = direction > 0 ? current.end : current.start;
    if ((direction > 0 && scrollY < boundary - 2) || (direction < 0 && scrollY > boundary + 2)) {
      const next = direction > 0 ? Math.min(boundary, scrollY + distance) : Math.max(boundary, scrollY - distance);
      window.scrollTo({ top: next, behavior: 'instant' });
      return Math.abs(next - boundary) < 2;
    }
    const adjacent = pages[index + direction];
    if (adjacent) {
      const target = direction > 0 || index + direction === 0 ? adjacent.start : adjacent.end;
      scrollToPage(target);
    }
    return true;
  };
  const isInteractive = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('input, textarea, select, button, [contenteditable]:not([contenteditable="false"]), dialog[open], [role="slider"]'));
  const nestedScrollCanMove = (target: EventTarget | null, direction: number) => {
    let element = target instanceof Element ? target : null;
    while (element && element !== home && element !== document.body) {
      if (element instanceof HTMLElement && /auto|scroll/.test(getComputedStyle(element).overflowY)) {
        const remaining = direction > 0 ? element.scrollHeight - element.clientHeight - element.scrollTop : element.scrollTop;
        if (remaining > 2) return true;
      }
      element = element.parentElement;
    }
    return false;
  };
  window.addEventListener('wheel', event => {
    if (!enabled || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || document.querySelector('dialog[open]')) return;
    if (Math.abs(event.deltaX) >= Math.abs(event.deltaY) || event.deltaY === 0) return;
    const direction = Math.sign(event.deltaY);
    if ((isInteractive(event.target) && !(event.target instanceof Element && event.target.closest('button'))) || nestedScrollCanMove(event.target, direction)) return;
    const now = performance.now();
    if (now - lastWheel > 220 || direction !== lastDirection) {
      gestureUsed = false;
      accumulated = 0;
    }
    lastWheel = now;
    lastDirection = direction;
    event.preventDefault();
    if (animating || gestureUsed) return;
    const distance = Math.abs(event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    accumulated += distance;
    if (accumulated < 24) return;
    gestureUsed = navigate(direction, accumulated);
    accumulated = 0;
  }, { passive: false });
  window.addEventListener('keydown', event => {
    if (!enabled || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || isInteractive(event.target) || document.querySelector('dialog[open]')) return;
    const direction = event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey) ? 1 : event.key === 'PageUp' || (event.key === ' ' && event.shiftKey) ? -1 : 0;
    if (!direction) {
      // Native arrows, Home/End, Tab, and browser shortcuts keep their behavior.
      cancelAnimation();
      return;
    }
    if (nestedScrollCanMove(event.target, direction)) return;
    event.preventDefault();
    if (!animating) navigate(direction, innerHeight * 0.85);
  });
  // Anchor navigation owns its animation; never let a paging frame pull it back.
  document.addEventListener('mori:before-scroll', () => {
    cancelAnimation();
    gestureUsed = true;
  });
  window.addEventListener('pointerdown', cancelAnimation, { passive: true });
  window.addEventListener('hashchange', cancelAnimation);
  window.addEventListener('popstate', cancelAnimation);
  window.addEventListener('resize', refresh);
  desktop.addEventListener('change', refresh);
  reducedMotion.addEventListener('change', refresh);
  new ResizeObserver(() => {
    root.style.setProperty('--home-first-screen-height', `${Math.max(0, innerHeight - (home.getBoundingClientRect().top + scrollY))}px`);
  }).observe(document.querySelector('.m-header')!);
  refresh();
}
