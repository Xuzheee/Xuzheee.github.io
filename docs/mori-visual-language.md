# Mori 自制素材规范

这一版沿用米白纸面与温暖物件的方向。

- 画布：米白 #F6F4EE；封面暖灰 #EAE7DF；次级表面 #DED9CE。
- 线条：炭黑 #292825 / 深暖灰 #55514A；辅助文字 #756F6B。
- 强调：朱红 #E84632，受光/背光侧使用 #CE3C2B、#A83A2C。
- 同一项目复用 ProjectArtwork。网易、Cookie Cats、URAI 的场景来自 FeaturedCards，避免跨页维护独立图形。
- 封面以 3:2 为基准；主体保留安全边距。真实界面可以裁切，但保持其原始颜色。
- 作品图默认暖底，悬停只改变对象动作，不切换整张封面的色彩身份。
- 唱片机与书架复用 mori-object-document.css；暖灰阴影、收敛的手绘抖动、共同字体，手机操作区至少 44px 高。
- 画风滑杆与配色参数不出现在公开界面；音乐/书籍的内容交互保留。
- 游戏封面、唱片封面与摄影作品保持原色。Mori 标志保留已有造型。

维护入口：src/components/mori/ProjectArtwork.astro、FeaturedCards.astro；src/styles/mori-artwork.css、mori-featured-cards.css、mori-object-document.css。
