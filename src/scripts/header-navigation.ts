// Keep normal links and full document navigation so each page's interactive
// scenes retain their existing initialization and cleanup behavior.
const nav = document.querySelector<HTMLElement>('[data-mori-nav]');
if (nav) {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href]')];
  const current = Math.max(0, links.findIndex(link => link.getAttribute('aria-current') === 'page'));
  let pointerIndex: number | null = null;
  let pendingIndex: number | null = null;

  const highlight = (index: number) => {
    nav.style.setProperty('--nav-index', String(index));
    links.forEach((link, i) => {
      if (i === index) link.dataset.highlighted = 'true';
      else delete link.dataset.highlighted;
    });
  };
  const restore = () => {
    const focused = links.findIndex(link => link === document.activeElement && link.matches(':focus-visible'));
    highlight(pendingIndex ?? (focused >= 0 ? focused : pointerIndex ?? current));
  };

  links.forEach((link, index) => {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      pointerIndex = index;
      restore();
    });
    link.addEventListener('focus', restore);
  });
  nav.addEventListener('pointerleave', () => { pointerIndex = null; restore(); });
  nav.addEventListener('focusout', () => queueMicrotask(restore));
  // A restored back/forward-cache page must show its own current route.
  const reset = () => {
    pendingIndex = null;
    pointerIndex = null;
    highlight(current);
  };
  document.addEventListener('mori:navigation-start', event => {
    const pathname = (event as CustomEvent<{ pathname: string }>).detail.pathname;
    const index = links.findIndex(link => {
      const path = new URL(link.href).pathname;
      return path === '/' ? pathname === '/' : pathname.startsWith(path);
    });
    pendingIndex = index >= 0 ? index : null;
    restore();
  });
  document.addEventListener('mori:navigation-reset', reset);
  window.addEventListener('pageshow', reset);
}
