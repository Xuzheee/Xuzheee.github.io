# Mori implementation · 2026-10-17

Visual truth: `output/mori-vermilion-v2-20261016/`, native 1536×1024. Implement 01,01b,02–12. Exclude 13–15 case details; retain existing case files. Routes: /, /about/, /projects/, /interests/. Existing Astro framework retained.

Tokens: #F6F4EE ground; #E84632 accent; #292825 ink; #756F6B muted; #EAE7DF panel. 56px desktop gutter, 68px header. Chinese Noto Sans SC 900 headings, 500–700 copy; Switzer Latin; Anton MORI. Hero greeting 64px, support30px, CTA22px, MORI360px. Large section headings112–160px. Rectangular original photos, pills and underlined links, directional outline icons. No tinted photo overlays.

| Reference | Layout and assets | Interaction |
|---|---|---|
|01|Greeting upper left, MORI lower left, hike4 at x742,y68,w758,h910|Works / hub links|
|01b|Empty elliptical stage with three peripheral entries|Working nav; actual model deferred|
|02|Inky dominant 62%; forest flow + jury right|Existing cases / source links|
|03|Dark field, three sleeve objects left, games right|Album selection / interest links|
|04|Two-line red title, basketball left, tall coast right|Life page link|
|05|Contact, huge email, huge MORI|Copy, mailto, GitHub, top|
|06|Narrow index, three featured rows|Section anchors / existing cases|
|07|Two-column directory with hover image|Hover/focus preview / source links|
|08|Three game sleeves, center selected|Buttons, drag, keyboard, official links|
|09|Sleeve + standalone vinyl, list right|Select album, update official link; no fake player|
|10|Three staggered original photos, lower large heading|Lightbox, prev/next, Escape|
|11|Biography left, hike1 right, education band|Experience anchor|
|12|Two experiences, contact|Projects, existing dated resume|

Original images: public/hobbies/{hike1,hike3,hike4,sport1}.jpg; project-inky-paper.png and project3.png. Official covers copied from output/mori-references-20261016/assets with sources.json. Standalone generated assets: jury-room, model-stage, vinyl, inky-desk. Original app screenshot layered in desk monitor; no generator-repainted UI as project evidence.

Allowed hero copy: Mori; 首页; 关于我; 作品; 兴趣爱好; 你好，我是杨黄旭哲; 也可以叫我 Mori。; 喜欢游戏、音乐、电影，; 也喜欢和 AI 伙伴一起动手做点东西。; 看看我的作品; MORI; 向下探索互动空间. No education or extra badge.

Continuity: one header per page instead of repeated headers in standalone references. Responsive stacked media and preserved reading order. At least44px touch targets; focus states; reduced motion. Photos remain untinted originals. Model drag instruction omitted because model is deferred. Old nav normalized to latest four labels. Resume is existing2026-09-16 version, visibly dated. No deployment.

Local development: `npm run dev -- --host 127.0.0.1 --port 4341`. Build: `npm run build`. Content verification: `npm run check:content`. Final visual and interaction evidence: root `design-qa.md`. Asset provenance: `public/mori/README.md`, `public/mori/sources.json`, `public/fonts/README.md`.
