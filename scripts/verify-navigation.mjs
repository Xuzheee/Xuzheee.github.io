// Browser-level navigation regression check against the production build.
// Run after `npm run build`. Uses the project's existing zero-dependency CDP client.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { Browser, sleep } from '../skills/taste-skill/scripts/lib/cdp.mjs';

const dist = resolve('dist');
const output = resolve('output/playwright/navigation');
mkdirSync(output, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const server = createServer((request, response) => {
  let path = resolve(dist, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (path !== dist && !path.startsWith(dist + sep)) { response.writeHead(403).end(); return; }
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, 'index.html');
  if (!existsSync(path)) { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' });
  response.end(readFileSync(path));
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const checks = [];
const check = (name, result) => { assert.ok(result, name); checks.push(name); console.log('PASS ' + name); };
const browser = await Browser.launch();
async function waitFor(page, expression, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await page.eval(expression)) {
        if (expression.includes('location.pathname')) await sleep(500);
        return;
      }
    } catch {}
    await sleep(80);
  }
  throw new Error('Timed out: ' + expression);
}
async function click(page, selector) {
  const point = await page.eval(async selector => {
    await document.fonts.ready;
    const element = document.querySelector(selector);
    element.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
    const box = element.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }, selector);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function townContext(page) {
  await waitFor(page, `document.querySelector('[data-town]').dataset.ready==='true'`);
  const { frameTree } = await page.send('Page.getFrameTree');
  const child = frameTree.childFrames?.find(frame => frame.frame.url === 'about:srcdoc');
  let send = page.send.bind(page);
  let frameId = child?.frame.id;
  if (!frameId) {
    // Chrome isolates the sandboxed model in its own renderer process.
    const { targetInfos } = await browser.send('Target.getTargets');
    const target = targetInfos.find(target => target.type === 'iframe' && target.url === 'about:srcdoc' && target.parentId === page.targetId);
    assert.ok(target, 'Town target exists');
    const { sessionId } = await browser.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    send = (method, params) => browser.send(method, params, sessionId);
    await send('Page.enable');
    await send('Runtime.enable');
    const tree = await send('Page.getFrameTree');
    frameId = tree.frameTree.frame.id;
  }
  // CDP media emulation is target-local; mirror the OS preference into the OOPIF.
  if (await page.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  }
  const { executionContextId } = await send('Page.createIsolatedWorld', { frameId, worldName: 'navigation-check' });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, contextId: executionContextId, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  for (let i = 0; i < 80; i++) {
    if (await evaluate(`document.querySelectorAll('#nav button').length===5`)) return evaluate;
    await sleep(100);
  }
  throw new Error('Town failed to initialize');
}
async function clickTown(page, evaluate, key) {
  const point = await evaluate(`(()=>{const b=document.querySelector('#nav button[data-k="${key}"]').getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
  const frame = await page.eval(() => { const b=document.querySelector('[data-town-frame]').getBoundingClientRect(); return {x:b.x,y:b.y}; });
  const position = { x: point.x + frame.x, y: point.y + frame.y };
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...position });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...position });
}

try {
  const page = await browser.newPage({ width: 1440, height: 900 });
  await page.goto(origin, { settleMs: 700 });
  check('desktop has no horizontal overflow', await page.eval(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: resolve(output, 'desktop-header.jpg') });
  await click(page, 'a[href="#explore"]');
  await sleep(750);
  check('explore anchor aligns and transfers focus', await page.eval(() => location.hash==='#explore' && Math.abs(document.querySelector('#explore').getBoundingClientRect().top)<3 && document.activeElement.id==='explore'));
  let town = await townContext(page);
  await page.screenshot({ path: resolve(output, 'desktop-town.jpg') });
  await clickTown(page, town, 'about');
  await sleep(100);
  check('town immediately announces destination', await town(`document.querySelector('[data-k="about"]').getAttribute('aria-busy')==='true' && document.querySelector('[data-k="about"] small').textContent==='正在前往…'`));
  check('town synchronizes top navigation', await page.eval(() => document.querySelector('[data-mori-nav] [data-highlighted]').textContent==='About'));
  await clickTown(page, town, 'works');
  await waitFor(page, `location.pathname==='/projects/'`);
  check('rapid town selection opens latest destination', await page.eval(() => location.pathname==='/projects/' && document.querySelector('[aria-current="page"]').textContent==='Work'));
  await click(page, '[data-section-nav] a[href="#tools"]');
  await sleep(750);
  const directory = await page.eval(() => ({ hash:location.hash, current:document.querySelector('[data-section-nav] [aria-current="location"]').hash, top:document.querySelector('#tools').getBoundingClientRect().top }));
  assert.ok(directory.hash==='#tools' && directory.current==='#tools', JSON.stringify(directory));
  check('work directory follows the visible section', true);
  await page.eval(() => window.scrollTo({top:0,behavior:'instant'}));
  await sleep(100);
  await click(page, '.m-header-contact');
  await sleep(750);
  check('contact anchor transfers focus', await page.eval(() => location.hash==='#contact' && document.activeElement.id==='contact'));
  await click(page, '.m-closing-bottom a');
  await sleep(750);
  check('return-to-top reaches document start', await page.eval(() => scrollY===0 && location.hash==='#top'));
  await click(page, '[data-mori-nav] a[href="/interests/"]');
  await waitFor(page, `location.pathname==='/interests/'`);
  check('top navigation updates current route', await page.eval(() => document.querySelector('[aria-current="page"]').textContent==='Interests'));
  await page.send('Page.navigate', { url: origin + '/interests/?game=cs2#games' });
  await waitFor(page, `location.hash==='#games' && !!document.querySelector('[data-games]')`);
  await sleep(800);
  check('cross-page anchor remains visible', await page.eval(() => { const box=document.querySelector('#games').getBoundingClientRect(); return box.top<innerHeight && box.bottom>0; }));
  check('cross-page query selects requested game', await page.eval(() => document.querySelector('[data-game="0"]').getAttribute('aria-pressed')==='true'));
  await page.goto(origin + '/projects/inky-paper/', { settleMs: 400 });
  await click(page, '.case-study > a');
  await waitFor(page, `(location.pathname==='/projects/' || location.pathname==='/projects') && location.hash==='#inky-paper'`);
  check('case return preserves project anchor', true);
  await page.goto(origin, { settleMs: 500 });
  await click(page, 'a[href="#explore"]');
  await sleep(750);
  town = await townContext(page);
  await clickTown(page, town, 'about');
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(1400);
  check('Escape cancels town navigation', await page.eval(() => location.pathname==='/' && !document.documentElement.dataset.navigation));
  await clickTown(page, town, 'home');
  await waitFor(page, `location.pathname==='/' && scrollY===0 && document.activeElement.id==='main'`);
  check('town home scrolls to opening', await page.eval(() => location.pathname==='/' && scrollY===0));
  await click(page, '[data-mori-nav] a[href="/about/"]');
  await waitFor(page, `location.pathname==='/about/'`);
  const history = await page.send('Page.getNavigationHistory');
  await page.send('Page.navigateToHistoryEntry', { entryId: history.entries[history.currentIndex-1].id });
  await waitFor(page, `location.pathname==='/' && !document.documentElement.dataset.navigation`);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 10, y: 10 });
  await sleep(100);
  check('browser back clears pending state and current indicator', await page.eval(() => document.querySelector('[data-mori-nav] [data-highlighted]').textContent==='Home'));
  assert.deepEqual(page.consoleErrors, [], 'desktop runtime exceptions');
  check('desktop has no runtime exceptions', true);

  const mobile = await browser.newPage({ width: 390, height: 844, mobile: true });
  await mobile.goto(origin, { settleMs: 500 });
  check('mobile has no horizontal overflow', await mobile.eval(() => document.documentElement.scrollWidth<=innerWidth));
  await mobile.screenshot({ path: resolve(output, 'mobile-header.jpg') });
  await click(mobile, 'a[href="#explore"]');
  await sleep(750);
  const mobileTown = await townContext(mobile);
  check('mobile canvas permits vertical pan', await mobileTown(`document.querySelector('canvas').style.touchAction==='pan-y'`));
  await mobile.screenshot({ path: resolve(output, 'mobile-town.jpg') });
  await clickTown(mobile, mobileTown, 'interests');
  await waitFor(mobile, `location.pathname==='/interests/'`);
  check('mobile town navigation works', true);
  check('mobile has no runtime exceptions', mobile.consoleErrors.length===0);

  const reduced = await browser.newPage({ width: 1440, height: 900, reducedMotion: true });
  await reduced.goto(origin, { settleMs: 500 });
  await click(reduced, 'a[href="#explore"]');
  await sleep(80);
  check('reduced motion anchor scroll is immediate', await reduced.eval(() => document.activeElement.id==='explore' && !document.documentElement.classList.contains('m-home-paging')));
  const reducedTown = await townContext(reduced);
  await reduced.eval(() => {
    window.__townNavigationTimes = [];
    addEventListener('message', event => {
      if (['mori-town-depart', 'mori-town-navigate'].includes(event.data?.type)) window.__townNavigationTimes.push({ type: event.data.type, time: performance.now() });
    });
    addEventListener('pagehide', () => sessionStorage.setItem('townNavigationTimes', JSON.stringify(window.__townNavigationTimes)), { once: true });
  });
  await clickTown(reduced, reducedTown, 'works');
  await waitFor(reduced, `location.pathname==='/projects/'`);
  check('reduced motion town skips journey', await reduced.eval(() => {
    const times=JSON.parse(sessionStorage.getItem('townNavigationTimes'));
    return times.length===2 && times[1].time-times[0].time<100;
  }));
  check('reduced motion has no runtime exceptions', reduced.consoleErrors.length===0);
  writeFileSync(resolve(output, 'results.json'), JSON.stringify({ result: 'NAVIGATION_VERIFY_PASS', checks }, null, 2));
  console.log(`NAVIGATION_VERIFY_PASS (${checks.length} checks)`);
} finally {
  await browser.close();
  server.close();
}
