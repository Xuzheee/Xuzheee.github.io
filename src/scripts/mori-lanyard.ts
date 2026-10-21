// Editable badge text and official icons; portrait extracted from the user's selected mockup.
const host = document.querySelector<HTMLElement>('[data-lanyard]');
if (host) {
  const stage = host.querySelector<HTMLElement>('[data-lanyard-stage]')!;
  const status = host.querySelector<HTMLElement>('[role="status"]')!;
  let disposed = false;
  let scene: { dispose: () => void; flip: () => void; reset: () => void } | undefined;
  const image = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image(); img.decoding = 'async';
    img.onload = () => img.decode().then(() => resolve(img), reject); img.onerror = reject; img.src = src;
  });
  const makeCanvas = (width = 1024, height = 1440) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    return { canvas, ctx: canvas.getContext('2d')! };
  };
  const cleanup = () => { disposed = true; scene?.dispose(); };
  window.addEventListener('pagehide', event => { if (!event.persisted) cleanup(); }, { once: true });
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  void (async () => {
    const [{ createLanyard }, portrait, hike, mailIcon, githubIcon] = await Promise.all([
      import('./vendor/lanyard.js'), image('/mori/portrait-selected.png'), image('/hobbies/hike1.jpg'),
      image('/mori/icons/mail.svg'), image('/mori/icons/github.svg'),
      document.fonts.load('800 64px "Mori Sans"'), document.fonts.load('160px Anton')
    ]);
    if (disposed) return;
    const ink = '#292825', paper = '#f6f4ee', red = '#d64d36', card = '#eee7da';
    const { canvas: front, ctx: f } = makeCanvas();
    f.fillStyle = card; f.fillRect(0, 0, 1024, 1440);
    // Fine paper fibres are drawn beneath the printed content, never over the portrait.
    let seed = 31;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    // Tile a small paper sample instead of issuing 115,000 drawing commands at entry.
    const { canvas: fibres, ctx: grain } = makeCanvas(128, 128);
    for (let i = 0; i < 1280; i++) {
      grain.fillStyle = i % 2 ? 'rgba(90,72,44,.065)' : 'rgba(255,255,255,.22)';
      grain.fillRect(random() * 128, random() * 128, .6 + random() * 1.5, .5 + random() * 3);
    }
    f.fillStyle = f.createPattern(fibres, 'repeat')!; f.fillRect(0, 0, 1024, 1440);
    f.fillStyle = red; f.font = '900 184px Arial,sans-serif'; f.fillText('MORI', 110, 245);
    f.fillStyle = ink; f.font = '700 76px "Mori Sans",sans-serif'; f.fillText('杨黄旭哲', 110, 330);
    f.fillStyle = '#625e56'; f.font = '36px "Mori Sans",sans-serif'; f.fillText('游戏 · 音乐 · AI 实验', 110, 382);
    f.save(); f.beginPath(); f.roundRect(110, 414, 804, 780, 24); f.clip();
    const cropHeight = portrait.naturalWidth * 780 / 804;
    f.drawImage(portrait, 0, (portrait.naturalHeight - cropHeight) / 2, portrait.naturalWidth, cropHeight, 110, 414, 804, 780); f.restore();
    f.drawImage(mailIcon, 110, 1230, 64, 64);
    f.drawImage(githubIcon, 110, 1320, 64, 64);
    f.fillStyle = ink; f.font = '56px Arial,sans-serif'; f.fillText(host.dataset.email || '', 202, 1277, 712);
    f.fillText('GitHub / Xuzheee', 202, 1367);
    const { canvas: back, ctx: b } = makeCanvas();
    b.fillStyle = ink; b.fillRect(0, 0, 1024, 1440);
    b.drawImage(hike, 0, 0, hike.width, hike.height, 56, 135, 912, 1115);
    b.fillStyle = paper; b.font = '500 44px "Mori Sans",sans-serif'; b.fillText('对人和系统保持好奇', 70, 1340);
    b.font = '36px Arial,sans-serif'; b.fillText('Mori', 850, 1340);
    const { canvas: strap, ctx: s } = makeCanvas(720, 192);
    s.fillStyle = red; s.fillRect(0, 0, 720, 192); s.fillStyle = paper;
    s.font = '90px Anton,sans-serif'; s.fillText('MORI', 45, 130); s.fillText('MORI', 400, 130);
    s.fillStyle = 'rgba(255,255,255,.12)';
    for (let x = 0; x < 720; x += 4) s.fillRect(x, 0, 1, 192);
    s.fillStyle = 'rgba(61,27,16,.16)';
    for (let y = 0; y < 192; y += 4) s.fillRect(0, y, 720, 1);
    s.strokeStyle = 'rgba(255,234,211,.45)'; s.lineWidth = 2; s.setLineDash([5, 5]);
    s.beginPath(); s.moveTo(0, 10); s.lineTo(720, 10); s.moveTo(0, 182); s.lineTo(720, 182); s.stroke();
    // Pass canvases directly: no PNG encoding, blob URLs or second image decode.
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    if (disposed) return;
    scene = createLanyard(stage, { frontImage: front, backImage: back, strapImage: strap, cardColor: card,
      strapColor: red, finish: 'matte', metal: 'graphite', size: .82, strapLength: .18,
      strapWidth: .65, damping: .65, elasticity: .3, breeze: 0, intro: true });
    if (!scene) { stage.dataset.fallback = 'true'; return; }
    stage.tabIndex = 0;
    stage.setAttribute('role', 'button');
    stage.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); scene?.flip();
        status.textContent = stage.dataset.side === 'back' ? '名牌背面：徒步照片' : '名牌正面：Mori 的个人资料';
      }
    });
  })().catch(error => {
    if (disposed) return;
    stage.dataset.fallback = 'true';
    console.warn('Lanyard: using static badge', error);
  });
}
