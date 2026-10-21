# Taste Skill 本地预览

2026-10-14。本次只生成本地预览。没有 commit、push、远程部署或线上文件写入。

## 查看

预览地址：http://127.0.0.1:4323/

若服务已停止：先执行 `npm run build`、`npm run check:content`，再执行 `npm run preview -- --host 127.0.0.1 --port 4323`。Windows 下重建前先停止旧的 preview，避免构建目录被占用。

## 视觉方向

来源：项目 `skills/taste-skill` 与 `skills/redesign-skill`。下载来源、日期与入口文件校验值见 `skills/README.md`。

抽取方向为 **The name as a monument**，seed **1342794968**。方向记录在 `.taste-skill/direction.json`。

本页将“杨黄旭哲”四字姓名作为首页主要视觉，把个人真实照片、Inky Paper 与 LabelTool 的界面作为个人经历和作品的材料；深绿文字、浅灰背景和黄色主按钮构成统一配色。访客可直接切换 Inky Paper 的工作台与任务清单预览，使用原生单选控件，鼠标、触屏及键盘均可操作，无 JavaScript 也可切换。

使用的个人素材与事实：四字姓名、计算社会科学硕士身份、社会学与统计学背景、网易客服策略经历、独立 Inky Paper 应用、URAI Lab 的多模态工作、厦门 12345 文本分析、农村治理调研、个人湖边照片、已有博客文章。事实仍由共享数据与案例正文维护。

方向调整：抽取的作品布局要求 10–18 个名称，但首页既定范围是三个案例，因此将 work 重抽为 `work-oversized-visual-small-cluster`。字体方案的 Panchang 不覆盖中文，采用同方案的 Switzer 配系统中文无衬线字体。没有引入 stock 图片、占位人物、虚构结果或新业务数据。

## 改动范围

- 首页保留原有六个章节与三个精选案例，重排视觉层级、留白、图片和案例说明。
- 用顶部导航代替占宽侧栏；所有页面共用新的配色、字体、按钮与页脚。
- 作品总览改善图文间距及角色、技术、亮点的排版。
- 博客新增可选 `shortTitle` 用于首页摘要，正文完整标题保持原样；日期按 Asia/Shanghai 显示。
- 补充跳到正文、当前导航状态、键盘焦点与减少动态效果模式，移除博客详情的嵌套 main。
- 保留所有案例结果边界、项目链接和原始简历 PDF。

## 图片与字体

全部图片来自项目已有素材：`profile.jpg`、`project-inky-paper.png`、`inky-paper-tasks.png`、`project3.png`。网易的流程图用 HTML 排版，并明确标注为示意，非内部平台截图。没有外部摄影素材，也没有用示意图冒充软件实拍。

Switzer 本地托管，字体来源见 `public/fonts/README.md`。没有新增 npm 依赖。

## 验证

- `npm run build`：通过，13 个静态页面。
- `npm run check:content`：通过；3 个精选案例、13 个项目、每个案例 7 节、共享事实、PDF 一致性、RSS、213 个内部资源。
- `git diff --check`：通过。
- Taste source lint：0 FAIL、0 WARN。两处 shadow 注释仅说明 `box-shadow: none` 是清除旧库阴影，浏览器检查未豁免任何规则。
- 最终静态预览的 Taste inspector：1440、768、390px，0 FAIL、1 WARN。唯一提醒是没有视频；现有材料没有合适的真实项目录像，保留真实静态截图及克制的图片动态，不填入无关 stock 视频。
- 浏览器行为验证：10 条路由 × 1440、768、390、320px，共 40 组；没有横向溢出、已加载坏图或脚本报错。通过鼠标与键盘切换、无脚本可读、减少动态效果、Astro 页面跳转与选中导航、首页锚点检查。
- 行为验证在开发预览执行；最终截图与视觉检查在正式静态构建上执行。

截图与机器记录保留在本地忽略目录 `output/playwright/`：

- `before/`：改版前。
- `release-preview/`：最终三尺寸截图与 `report.json`。
- `verification/`：页面与交互检查记录，含子页面截图。

## 视觉复核

以下评分是本次 Agent 对截图的自评，不是用户研究或外部评审。

ROUND 1
Seen in one second: 姓名和个人照片，但桌面姓名超过首屏底边。
Idea (one sentence): 以四字姓名建立个人识别，再用真实界面承接工作证据。
Live thing: Inky Paper 的两种真实界面可切换。
Layout words by section: hero=monument / intro=split / work=alternating-visual / experience=two-column / skills=image-list / writing=single-entry
Scores: design 7 · usability 7 · creativity 6.5 · content 8 → overall 6.0
Caps applied: inspector FAIL，分数上限 6.0。
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. after/desktop-fold.jpg：姓名超出首屏；缩短照片高度并调整姓名与简介顺序。
2. after/mobile-page-02.jpg：长博客标题占三行；为摘要增加 shortTitle，保留完整文章标题。
3. after/desktop-page-01.jpg：字号层级偏多；归并为五个字号角色。

ROUND 2
Seen in one second: 完整的四字姓名，首屏行动清楚。
Idea (one sentence): 个人识别与可检查的作品交替展开。
Live thing: 同上。
Layout words by section: 同上。
Scores: design 7.5 · usability 8 · creativity 6.5 · content 8.5 → overall 6.0
Caps applied: inspector 将手机端图片底部说明识别为下一标题的眉题，仍有 FAIL。
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. final/desktop-fold.jpg：人物头部被顶部裁切；调整照片焦点位置。
2. final/mobile-page-01.jpg：图片底部说明贴近下一标题；把截图说明移到图内上方，流程说明放在图示标题之后。
3. final/tablet-page-01.jpg：中间宽度产品图比正文矮；接受自然比例，避免拉伸实际界面。

ROUND 3
Seen in one second: 深绿的四字姓名与真实个人照片。
Idea (one sentence): 大字号姓名建立个人识别，真实产品界面和研究案例提供具体内容。
Live thing: 可用鼠标、触屏或键盘切换工作台与任务清单。
Layout words by section: hero=monument / intro=split / work=alternating-visual / experience=two-column / skills=image-list / writing=single-entry
Scores: design 7.5 · usability 8 · creativity 6.5 · content 8.5 → overall 7.6
Caps applied: 无；最终 inspector 无 FAIL。
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. release-preview/desktop-fold.jpg：原照片本身较柔，宽幅放大会放大这一限制；后续如有高清原片可替换，此次不生成虚构人像。
2. release-preview/tablet-page-01.jpg：平板上的完整产品截图细节较小；保留自然比例，详细内容仍由案例页承接。
3. release-preview/mobile-page-01.jpg：经历较长，移动端阅读距离仍较长；本次保留完整经历与既定章节，不删改事实换取短页面。

## 发布状态

仅本地预览。用户已明确要求不直接修改原网址；后续发布需要新的明确指令。
