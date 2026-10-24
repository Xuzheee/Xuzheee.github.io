// One entry point for ordinary links, anchors and the isolated town scene.
// Cross-page links keep native navigation, history, downloads and new-tab behavior.
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let scrollFrame = 0;
let pendingTimer: ReturnType<typeof setTimeout>;

export function clearNavigation() {
  clearTimeout(pendingTimer);
  delete root.dataset.navigation;
  document.querySelectorAll('[data-navigating]').forEach(element => element.removeAttribute('data-navigating'));
  document.dispatchEvent(new CustomEvent('mori:navigation-reset'));
}

export function prepareNavigation(destination: string) {
  const url = new URL(destination, location.href);
  if (url.origin !== location.origin) return;
  root.dataset.navigation = 'pending';
  document.dispatchEvent(new CustomEvent('mori:navigation-start', { detail: { pathname: url.pathname } }));
  clearTimeout(pendingTimer);
  // Clear feedback if a browser navigation is cancelled or a download is served.
  pendingTimer = setTimeout(clearNavigation, 8000);
}

function stopScroll() {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
}

function focusDestination(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
  target.focus({ preventScroll: true });
}

function scrollToDestination(url: URL) {
  let id: string;
  try { id = decodeURIComponent(url.hash.slice(1)); } catch { return false; }
  const target = id ? document.getElementById(id) : document.querySelector<HTMLElement>('main');
  if (!target) return false;
  document.dispatchEvent(new CustomEvent('mori:before-scroll'));
  stopScroll();
  clearNavigation();
  const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  const top = !id || id === 'top' ? 0 : target.getBoundingClientRect().top + scrollY - padding;
  const end = Math.max(0, Math.min(top, root.scrollHeight - innerHeight));
  const start = scrollY;
  if (url.href !== location.href) history.pushState(null, '', url.href);
  const finish = () => { scrollFrame = 0; focusDestination(target); };
  if (reducedMotion.matches || Math.abs(end - start) < 2) {
    window.scrollTo({ top: end, behavior: 'instant' });
    finish();
    return true;
  }
  const began = performance.now();
  // Long footer jumps stay quick; small moves do not take a full page duration.
  const duration = Math.min(620, 300 + Math.abs(end - start) * .08);
  const tick = (now: number) => {
    const progress = Math.min(1, (now - began) / duration);
    window.scrollTo({ top: start + (end - start) * (1 - Math.pow(1 - progress, 3)), behavior: 'instant' });
    if (progress < 1) scrollFrame = requestAnimationFrame(tick);
    else finish();
  };
  scrollFrame = requestAnimationFrame(tick);
  return true;
}

export function navigate(destination: string) {
  const url = new URL(destination, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search && scrollToDestination(url)) return;
  prepareNavigation(url.href);
  location.assign(url.href);
}

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download') || link.hasAttribute('data-astro-reload')) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
  if (url.pathname === location.pathname && url.search === location.search) {
    if (scrollToDestination(url)) event.preventDefault();
    return;
  }
  link.dataset.navigating = 'true';
  prepareNavigation(url.href);
});

window.addEventListener('wheel', stopScroll, { passive: true });
window.addEventListener('pointerdown', stopScroll, { passive: true });
window.addEventListener('keydown', event => {
  if (['Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stopScroll();
});
window.addEventListener('popstate', () => { stopScroll(); clearNavigation(); });
window.addEventListener('hashchange', stopScroll);
window.addEventListener('pagehide', stopScroll);
window.addEventListener('pageshow', clearNavigation);
document.addEventListener('astro:page-load', clearNavigation);
reducedMotion.addEventListener('change', stopScroll);

let stopSectionTracking = () => {};
function trackSections() {
  stopSectionTracking();
  const entries = [...document.querySelectorAll<HTMLAnchorElement>('[data-section-nav] a[href^="#"]')]
    .map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter((entry): entry is { link: HTMLAnchorElement; section: HTMLElement } => Boolean(entry.section));
  if (!entries.length) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    const threshold = (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + 100;
    let current = entries[0];
    let currentTop = -Infinity;
    for (const entry of entries) {
      const top = entry.section.getBoundingClientRect().top;
      // Two archive columns share a row on desktop. Keep the explicitly chosen column.
      if (top <= threshold && (top > currentTop + 1 || (Math.abs(top - currentTop) <= 1 && entry.link.hash === location.hash))) {
        current = entry;
        currentTop = top;
      }
    }
    entries.forEach(entry => {
      entry.link.classList.toggle('is-current', entry === current);
      if (entry === current) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('mori:before-scroll', schedule);
  stopSectionTracking = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('mori:before-scroll', schedule);
  };
  update();
}
trackSections();
document.addEventListener('astro:page-load', trackSections);
