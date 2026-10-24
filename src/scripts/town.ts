import { navigate, prepareNavigation, clearNavigation } from './navigation';

const townFrame = document.querySelector<HTMLIFrameElement>('[data-town-frame]');
if (townFrame) {
  // Only these existing site pages can be opened by the isolated model.
  const routes: Record<string, string> = { home: '/', about: '/about/', works: '/projects/', interests: '/interests/', blog: '/blog/' };
  let visible = false;
  const reportVisibility = () => townFrame.contentWindow?.postMessage({ type: 'mori-town-visibility', visible: visible && !document.hidden }, '*');
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    reportVisibility();
  });
  observer.observe(townFrame);
  document.addEventListener('visibilitychange', reportVisibility);
  townFrame.addEventListener('load', reportVisibility);
  window.addEventListener('message', event => {
    if (event.source !== townFrame.contentWindow) return;
    if (event.data?.type === 'mori-town-ready') {
      townFrame.closest<HTMLElement>('[data-town]')!.dataset.ready = 'true';
      reportVisibility();
    } else if (event.data?.type === 'mori-town-depart') {
      const route = Object.hasOwn(routes, event.data.key) ? routes[event.data.key] : null;
      if (route) prepareNavigation(route);
    } else if (event.data?.type === 'mori-town-cancel') {
      clearNavigation();
    } else if (event.data?.type === 'mori-town-navigate') {
      const route = Object.hasOwn(routes, event.data.key) ? routes[event.data.key] : null;
      if (route) navigate(route);
    } else if (event.data?.type === 'mori-town-wheel') {
      const deltaY = Number(event.data.deltaY);
      const deltaMode = Number(event.data.deltaMode);
      if (!Number.isFinite(deltaY) || ![0, 1, 2].includes(deltaMode)) return;
      const wheel = new WheelEvent('wheel', { deltaY, deltaMode, bubbles: true, cancelable: true });
      // Desktop paging handles the event; other layouts keep natural page scrolling.
      if (townFrame.dispatchEvent(wheel)) {
        window.scrollBy({ top: deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? innerHeight : 1), behavior: 'instant' });
      }
    }
  });
}
