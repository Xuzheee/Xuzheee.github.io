// Check the generated site, including relationships across pages, with no extra dependencies.
import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const read = (name) => readFile(join(dist, name), 'utf8');
const plain = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const ids = (html) => [...html.matchAll(/data-project-id="([^"]+)"/g)].map((match) => match[1]);
const home = await read('index.html');
const overview = await read('projects/index.html');
const cv = await read('cv/index.html');
const about = await read('about/index.html');
const interests = await read('interests/index.html');
const featured = ['netease-ai-workflow', 'inky-paper', 'urai-lab'];
assert.deepEqual(ids(home), ['inky-paper', 'netease-ai-workflow', 'seven-angry-man'], 'Home follows the approved personal-site selection');
assert(!/HV Deep Research|横纵分析|hv-deep-research/i.test(home), 'HV must not appear anywhere on home');
assert.equal([...home.matchAll(/<section\b/g)].length, 6, 'Home retains six chapters followed by the shared footer');
const headings = [...home.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((match) => plain(match[1]));
assert.deepEqual(headings, ['从这里出发', '作品与探索', '我掌握的 技能', '最近喜欢', '屏幕 之外', 'Nice to meet you.']);
const hero = home.match(/<section[^>]*class="m-hero[\s\S]*?<\/section>/)?.[0];
assert(hero && !/教育|硕士|大学/.test(plain(hero)), 'Education belongs in About, not the home hero');
assert(['社会学法学学士', '计算社会科学（统计学）理学硕士', '2021.9', '2025.7', '2025.9', '2027.7'].every(text => about.includes(text)), 'Preserve the approved degrees and education dates');
assert(about.includes('研究经历') && about.includes('研究助理'), 'URAI must remain research experience');
for (const html of [home, about, overview, interests]) {
  for (const href of ['/', '/about/', '/projects/', '/interests/']) assert(html.includes(`href="${href}"`), `Missing primary route ${href}`);
  const navigation = html.match(/<nav\b[^>]*data-mori-nav[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.deepEqual([...navigation.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(match => plain(match[1])), ['Home', 'About', 'Work', 'Interests'], 'Primary navigation keeps all four English routes');
  assert.equal([...navigation.matchAll(/aria-current="page"/g)].length, 1, 'Exactly one navigation link identifies the current page');
  assert(!html.includes('href="#"'), 'No placeholder links');
}

const originalProjects = ['hv-deep-research', 'seven-angry-man', 'inky-app', 'cookie-cats', 'steam-analytics', 'xiamen-12345', 'urai-lab', 'rural-governance', 'irrigation-research', 'anti-emo'];
const overviewIds = ids(overview);
for (const id of originalProjects) assert(overviewIds.includes(id), `Original project missing: ${id}`);
assert.equal(new Set(overviewIds).size, overviewIds.length, 'Project IDs must be unique');
assert.equal(overviewIds.length, 13, 'Retain existing projects and add GeoPin');
assert(overviewIds.includes('geopin'), 'GeoPin must appear in the overview');
assert(overview.includes('#小程序://集钉/hLldIW6f0oJWevh'), 'Keep the supplied mini-program token');
assert(!overview.includes('href="#小程序:'), 'Mini-program token is not a browser URL');
for (const [label, html] of [['CV', cv]]) {
  assert(plain(html).includes('10,000+'), `${label}: missing consistent Xiamen count`);
  assert(!/\b1000\+/.test(plain(html)), `${label}: outdated Xiamen count`);
  assert(!html.includes('href="#"'), `${label}: placeholder link`);
}
for (const html of [cv]) {
  assert(plain(html).includes('2025.10 - 2026.05'), 'URAI end date must match resume');
  assert(plain(html).includes('2026.06 - 2026.08'), 'Netease dates must match resume');
}

const sections = ['问题与背景', '用户和约束', '我的职责', '方案与关键取舍', '实施与验证', '结果及局限', '下一步'];
for (const id of featured) {
  const html = await read(`projects/${id}/index.html`);
  const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? '';
  const actual = [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((match) => plain(match[1]));
  assert.deepEqual(actual, sections, `${id}: seven case sections required`);
  assert(html.includes(`data-results-for="${id}"`), `${id}: shared results missing`);
}
const netease = await read('projects/netease-ai-workflow/index.html');
const resultBlock = (html) => html.match(/<div[^>]*data-results-for="netease-ai-workflow"[^>]*>([\s\S]*?)<\/dl>([\s\S]*?)<\/div>/)?.[0];
assert(resultBlock(cv) && resultBlock(netease), 'Both CV and case need the result block');
assert.equal(plain(resultBlock(cv)), plain(resultBlock(netease)), 'CV and case metrics and caveats must stay identical');
assert(plain(netease).includes('整体上线前后对比'), 'Netease result needs comparison scope');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}
let checkedLinks = 0;
for (const file of (await walk(dist)).filter((file) => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  if (!file.startsWith(join(dist, 'preview') + sep)) {
    assert.equal([...html.matchAll(/class="m-site-closing"/g)].length, 1, `Shared footer missing or duplicated: ${file}`);
    assert.equal([...html.matchAll(/id="contact"/g)].length, 1, `Contact anchor missing or duplicated: ${file}`);
    assert(html.includes('id="top"'), `Footer back-to-top target missing: ${file}`);
  }
  for (const [, value] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    const url = new URL(value, 'https://portfolio.test');
    const target = resolve(dist, '.' + decodeURIComponent(url.pathname));
    assert(target.startsWith(resolve(dist)), 'Link escapes build output');
    let targetStat;
    try { targetStat = await stat(target); } catch { throw new Error(`Broken internal resource in ${file}: ${value}`); }
    const output = targetStat.isDirectory() ? join(target, 'index.html') : target;
    await stat(output);
    if (url.hash && output.endsWith('.html')) {
      const targetHtml = await readFile(output, 'utf8');
      assert(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor: ${value}`);
    }
    checkedLinks++;
  }
}
const hash = (data) => createHash('sha256').update(data).digest('hex');
assert.equal(hash(await readFile(join(root, 'public/resume.pdf'))), hash(await readFile(join(dist, 'resume.pdf'))), 'Built resume must equal the source PDF');
assert((await read('rss.xml')).includes('<rss'), 'RSS should contain a feed');
console.log(`CONTENT_CHECK_PASS: shared footer on all public pages, 6 home sections, 13 projects, preserved existing cases and shared facts, PDF integrity, RSS, ${checkedLinks} internal resources.`);
