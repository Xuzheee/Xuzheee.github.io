# 最近在听

三首曲目由 Mori 指定。封面与试听地址来自 Apple 官方 iTunes Lookup API，2026-10-20 核对。音频直接使用 Apple 提供的试听片段，不下载或托管完整歌曲。

| 文件 | 曲目 | 官方曲目页 |
| --- | --- | --- |
| blue.jpg | Blue — MILLENNIUM PARADE, Saya Gray, Daniel Caesar & Daiki Tsuneta | https://music.apple.com/us/album/blue/6787976235?i=6787976426 |
| heibai.jpg | 黑白 — 方大同 | https://music.apple.com/us/album/黑白/313404785?i=313404810 |
| — | Closed on Sunday — Kanye West | https://music.apple.com/us/album/closed-on-sunday/1484936940?i=1484937109 |

唱片机位于兴趣页「最近在听」之后的下一屏 `/interests/#record-player`，直接往下滚动即可看到。曲目、封面路径、试听地址与完整歌曲链接统一维护在 `src/data/mori.ts` 的 `recordTracks`。原来的首页唱片入口与兴趣页专辑展示继续共用 `albums`，保留「在雨后醒来 / BULLY / LSC」。

唱片机基于用户在 2026-10-20 更新的 `唱片机.html`，项目副本在 `src/assets/record-player.html`，原始插画来源为 [Colorfigures](https://april-zhu.com/colorfigures)。按用户后续要求，显示标题改为 `listen with me`，左上角仅保留选片、转速和音量，选片后自动放下唱针，去除操作提示和页面署名。点击画面中的唱臂或聚焦画面后按空格/回车可暂停或继续。不添加网站侧的专辑列表和播放栏。构建时将三个本地音频路径替换为官方试听地址，并注入高度适配。原 HTML 的合成占位旋律仍随源文件保留，真实试听是否播放需要在浏览器中核验。
