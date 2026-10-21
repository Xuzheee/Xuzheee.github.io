function initializeRecordPlayers() {
  const frames = [...document.querySelectorAll<HTMLIFrameElement>('[data-player-frame]')];
  if (!frames.length) return;
  window.addEventListener('message', event => {
    if (event.data?.type !== 'mori-record-player-height') return;
    const frame = frames.find(candidate => candidate.contentWindow === event.source);
    const height = Number(event.data.height);
    if (!frame || !Number.isFinite(height) || height < 200 || height > 2400) return;
    frame.style.height = `${Math.ceil(height) + 2}px`;
    frame.closest<HTMLElement>('[data-record-player]')!.dataset.ready = 'true';
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeRecordPlayers, { once: true });
else initializeRecordPlayers();
