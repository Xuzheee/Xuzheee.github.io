function initializeBookshelves() {
  const frames = [...document.querySelectorAll<HTMLIFrameElement>('[data-bookshelf-frame]')];
  if (!frames.length) return;
  const measure = (frame: HTMLIFrameElement) => frame.contentWindow?.postMessage({ type: 'mori-bookshelf-measure' }, '*');
  window.addEventListener('message', event => {
    if (event.data?.type !== 'mori-bookshelf-height') return;
    const frame = frames.find(candidate => candidate.contentWindow === event.source);
    const height = Number(event.data.height);
    if (!frame || !Number.isFinite(height) || height < 200 || height > 2400) return;
    frame.style.height = `${Math.ceil(height) + 2}px`;
    frame.closest<HTMLElement>('[data-bookshelf]')!.dataset.ready = 'true';
  });
  frames.forEach(frame => {
    frame.addEventListener('load', () => measure(frame));
    measure(frame);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeBookshelves, { once: true });
else initializeBookshelves();
