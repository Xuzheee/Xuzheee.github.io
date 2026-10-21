# Mori 网页复刻验收 · 2026-10-17

final result: passed

本轮完成：首页、关于我、作品、兴趣爱好四个页面，对应参考图 01、01b、02–12 共 13 个板块。没有尚待修复的 P0 / P1 / P2 问题。这里的通过指本轮范围内的视觉与功能验收，不表示生成参考图与浏览器逐像素相同。

## 对照依据与方法

- 视觉真源：`output/mori-vermilion-v2-20261016/`；首页采用最新 `01-home-hero.png`，MORI 在下方。内容与原图边界依照同目录 `source-notes.md`。
- 实现：`src/layouts/MoriLayout.astro`、`src/styles/mori.css`、`src/components/mori/` 和四个页面。
- 原参考：1536 × 1024 px。浏览器对照：1536 × 1024 CSS px、DPR 1；单板块截图保持 1536 px 宽及其实际内容高度，不为匹配参考强行拉伸。参考图中的重复页头只在每个真实页面出现一次，局部对照时扣除约 68 px 页头。
- 响应式：390 × 844、768 × 900、1280 × 900 CSS px，DPR 1；检查全部四页。390 px 唱片装饰允许超出自身容器，但由容器裁切，不产生页面横向滚动。
- 首先使用内置浏览器；中途浏览器运行环境异常，改用 Playwright Chromium 获取原尺寸截图、运行交互检查。收尾时内置浏览器恢复，已重新刷新首页，实际点击首页 → 作品 → 兴趣爱好，验证“下一个游戏”将链接更新到 Cyberpunk 2077，并返回首页保留预览。
- 使用 `view_image` 打开接受的参考图和最新浏览器截图，同一轮直接比较。完整视图检查构图，独立板块截图检查字体、间距、图像与控件；手机端另查项目图、流程标签、教育经历和唱片列表。

## 最终视觉证据

以下路径均相对于仓库根目录；文件是最终交付证据，调试截图和中间截图已清理。

| 页面/板块 | 参考 | 最终渲染证据 | 对照结果 |
| --- | --- | --- | --- |
| 首页首屏 | 01-home-hero.png | `output/playwright/mori/home-desktop.png` | 左侧两行介绍、CTA、下方 MORI 与右侧单张照片保持同一结构；无首页教育内容 |
| 模型空间 | 01b-home-interactive-hub.png | `output/playwright/mori/home-section-2.png` | 椭圆舞台、三个跳转入口与下方普通导航保留 |
| 首页作品 | 02-home-work.png | `output/playwright/mori/home-section-3.png` | 主项目占左侧，流程示意与陪审团占右侧；显示真实应用截图 |
| 最近喜欢 | 03-home-favorites.png | `output/playwright/mori/home-section-4.png` | 深色背景、唱片层次与游戏列表保留；溢出已修复 |
| 屏幕之外 | 04-home-offscreen.png | `output/playwright/mori/home-section-5.png` | 大标题、篮球横图和海岸竖图保留 |
| 联系页脚 | 05-home-contact.png | `output/playwright/mori/home-section-6.png` | 大邮箱、复制入口、GitHub 和大字 MORI；点击不再被装饰文字拦截 |
| 重点作品 | 06-work-featured.png | `output/playwright/mori/projects-section-1.png` | 左侧目录与三行案例；风险文字完整，URAI 原截图正确裁切 |
| 作品目录 | 07-work-archive.png | `output/playwright/mori/projects-section-2.png` | 两列目录、悬停预览与浏览/目录切换 |
| 游戏 | 08-interest-games.png | `output/playwright/mori/interests-section-1.png` | 三张封面、中间选中、名称与切换操作 |
| 音乐 | 09-interest-music.png | `output/playwright/mori/interests-section-2.png` | 左侧封面和黑胶、右侧三张专辑、下方标题及播放链接 |
| 生活照片 | 10-interest-offscreen.png | `output/playwright/mori/interests-section-3.png` | 三张错落照片、下方大标题；原照片可放大浏览 |
| 关于我 | 11-about-profile.png | `output/playwright/mori/about-desktop.png` | 左文右图与下方教育经历带；段落换行已校正 |
| 经历与联系 | 12-about-experience-contact.png | `output/playwright/mori/about-section-2.png` | 两段经历、联系与简历入口 |

手机证据：`home-390-viewport.png`、`projects-390-section-1.png`、`interests-390-section-2.png`、`about-390-section-1.png`，均位于 `output/playwright/mori/`。平板首页证据：`home-768-viewport.png`。

## 五项必查表面

| 表面 | 检查与结论 |
| --- | --- |
| 字体与层级 | Noto Sans SC 可变字体用于中文，Switzer 用于常规拉丁字，Anton 用于 MORI。检查标题、正文、项目标签、按钮、专辑歌手及手机换行；修复作品标题意外竖排、关于我末行溢出。自托管中文子集约 263 KB，避免系统字体漂移。 |
| 布局与节奏 | 桌面约 56 px 边距、68 px 页头；保留左右分栏、主次比例、照片矩形及大字层级。手机按阅读顺序重排，流程图和目录均不截断。 |
| 配色与控件 | 使用已确定的 `#F6F4EE`、`#E84632`、`#292825`、`#756F6B`、`#EAE7DF`。没有给原照片添加色罩。箭头方向、线宽、圆形与胶囊按钮、选中状态一致。生成图中的微弱纸纹与像素色差不作为新增纹理。 |
| 图像与素材 | 使用原始生活照片、真实应用截图和官方游戏/专辑封面。唱片、桌面、空舞台、长桌与风险分层为独立生成素材；没有把整张参考图作为网页。所有图片解码成功；手机风险图两侧文字与 URAI 图片黑边已修复。 |
| 文案与内容 | 首页首屏对允许文案作逐字比较，忽略 HTML 换行和空白后完全一致，无新增标签、教育经历或成果数字。作品事实沿用现有数据，简历保持原文件并显示日期。 |

首屏允许文案：Mori；首页；关于我；作品；兴趣爱好；你好，我是杨黄旭哲；也可以叫我 Mori。；喜欢游戏、音乐、电影，；也喜欢和 AI 伙伴一起动手做点东西。；看看我的作品；MORI；向下探索互动空间。

## 修复记录与复验

| 级别 | 较早发现 | 实施修复 | 修复后证据 |
| --- | --- | --- | --- |
| P1 | 流程组件导致页面渲染报错 | 修正 Astro 条件表达式与包裹结构 | 四路由返回 200；全部页面截图成功 |
| P1 | 页脚大字拦截复制邮箱点击 | 装饰大字关闭 pointer events，操作区明确层级 | 邮箱写入剪贴板且显示成功提示 |
| P2 | “作品”意外换为两行、关于我末行拥挤 | 目录比例、字号、字距与正文列宽校正 | `projects-section-1.png`、`about-desktop.png` |
| P2 | 专辑封面使用横向社交预览、游戏图不清楚 | 替换官方方形专辑封面及更大 Steam 封面 | `interests-section-1.png`、`interests-section-2.png` |
| P2 | 桌面风险图裁字、URAI 上方黑边 | 按素材自身比例与内部样本位置设置裁切 | `projects-section-1.png` |
| P2 | 390 px 唱片引起横向滚动、流程卡片超出宽度 | 装饰裁切与手机流程间距、字号调整 | 四页 scrollWidth 均等于视口宽度 |
| P2 | 手机风险图裁掉高/低风险文字，URAI 仍露黑边 | 手机单独采用 3:1 风险图框和 2.5:1 图像样本裁切 | `projects-390-section-1.png` |
| P2 | 手机首页作品右边距沿用桌面补偿值 | 恢复 20 px 对称边距 | 390 px 首页作品复验通过 |

## 功能与构建

- Astro 最终构建通过，输出 14 条现有与新页面路由。
- 内容检查通过：四个主页面、六个首页板块、13 个作品条目、既有案例/事实、PDF 完整性、RSS 和 256 个内部资源。
- 13 项核心检查通过：模型区导航；经历锚点/简历下载；游戏按钮；游戏键盘；游戏滑动；专辑封面/标题/链接同步；照片下一张/Escape/焦点恢复；首页专辑和游戏深链接；作品浏览/目录切换；集钉摘要/小程序口令复制/关闭；目录悬停预览；邮箱复制提示；减少动态效果设置。
- 390、768、1280 px 下四页均无页面横向溢出。原尺寸渲染无缺失图片；无浏览器脚本错误。`git diff --check` 通过。
- 机器验收结果：`output/playwright/mori/render-check.json`、`output/playwright/mori/functional-check.json`。
- 外部音乐、游戏与项目链接验证了对应地址和切换结果；没有代替用户完成第三方播放、登录或外部服务全流程。

## 明确保留的差异与范围

1. 按内容来源要求使用原照片及应用截图，原图与生成参考图的细节和清晰度不同；不伪造更高清的项目证据或个人生活记录。
2. 生成参考图没有可提取的真实字体文件。当前字体重现了层级和轮廓气质，字形及抗锯齿有细微差异，不宣称逐像素一致。
3. 四页统一采用用户最新导航顺序与“兴趣爱好”名称；单页不重复插入参考图各板块顶部的页头。
4. 3D / 2.5D 位置已预留，导航热点可用；实际模型未接入，因此未提供虚假的拖动模型操作。
5. 用户指定的第 13、14、15 张项目详情暂不复刻。既有详情页保留并继续可访问；摘要弹窗只显示现有数据。
6. 简历使用已有 2026.09.16 版本。音乐不伪装内置播放器，操作会打开实际作品页面。

## 完成清单

- [x] 四页及 13 个参考板块实现
- [x] 原尺寸和手机直接视觉对照
- [x] 首屏文案差异检查
- [x] 关键交互、内容与构建验证
- [x] 素材/字体来源记录
- [x] 临时调试文件清理，保留最终验收证据
- [x] 本地预览保留，未发布

后续精修仅涉及生成图无法精确还原的字形及素材微观差别（P3）；本轮无待决策事项。
