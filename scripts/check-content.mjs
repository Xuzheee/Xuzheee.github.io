// Check the generated site, including relationships across pages, with no extra dependencies.
import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const read = (name) => readFile(join(dist, name), 'utf8');
const plain = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const ids = (html) => [...html.matchAll(/data-project-id="([^"]+)"/g)].map((match) => match[1]);
const home = await read('index.html');
const overview = await read('projects/index.html');
const cv = await read('cv/index.html');
const featured = ['netease-ai-workflow', 'inky-paper', 'urai-lab'];
assert.deepEqual(ids(home), featured, 'Home must have exactly the three selected cases, in order');
assert(!/HV Deep Research|横纵分析|hv-deep-research/i.test(home), 'HV must not appear anywhere on home');
assert.equal([...home.matchAll(/<section\b/g)].length, 6, 'Preserve the six original home sections');
const headings = [...home.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((match) => plain(match[1]));
assert.deepEqual(headings.filter((text) => ['精选项目', '实践经历', '能力结构', '最新文章'].includes(text)), ['精选项目', '实践经历', '能力结构', '最新文章']);

const originalProjects = ['hv-deep-research', 'seven-angry-man', 'inky-app', 'cookie-cats', 'steam-analytics', 'xiamen-12345', 'urai-lab', 'rural-governance', 'irrigation-research', 'anti-emo'];
const overviewIds = ids(overview);
for (const id of originalProjects) assert(overviewIds.includes(id), `Original project missing: ${id}`);
assert.equal(new Set(overviewIds).size, overviewIds.length, 'Project IDs must be unique');
assert.equal(overviewIds.length, 13, 'Retain existing projects and add GeoPin');
assert(overviewIds.includes('geopin'), 'GeoPin must appear in the overview');
assert(overview.includes('#小程序://集钉/hLldIW6f0oJWevh'), 'Keep the supplied mini-program token');
assert(!overview.includes('href="#小程序:'), 'Mini-program token is not a browser URL');
for (const [label, html] of [['home', home], ['overview', overview], ['CV', cv]]) {
  assert(plain(html).includes('10,000+'), `${label}: missing consistent Xiamen count`);
  assert(!/\b1000\+/.test(plain(html)), `${label}: outdated Xiamen count`);
  assert(!html.includes('href="#"'), `${label}: placeholder link`);
}
for (const html of [home, cv]) {
  assert(plain(html).includes('2025.10 - 2026.05'), 'URAI end date must match resume');
  assert(plain(html).includes('2026.06 - 2026.08'), 'Netease dates must match resume');
}

const sections = ['问题与背景', '用户和约束', '我的职责', '方案与关键取舍', '实施与验证', '结果及局限', '下一步'];
for (const id of featured) {
  const html = await read(`projects/${id}/index.html`);
  const actual = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((match) => plain(match[1]));
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
console.log(`CONTENT_CHECK_PASS: 3 featured cases, 13 projects, 7 sections per case, shared facts, PDF integrity, RSS, ${checkedLinks} internal resources.`);
