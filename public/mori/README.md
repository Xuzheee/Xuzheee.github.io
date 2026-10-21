# Mori image assets

`mech/` contains the user-supplied homepage animation from `D:/a/mori-mech-hero.zip`: the original WebM and MP4, standby poster, and online still. The full 4:5 frame is preserved. An SVG color key removes the light neutral backdrop so the page paper shows through; the source assets stay intact. The animation starts on mouse hover or the play button and returns to the still on mouse leave; it also stops outside the viewport or in a hidden tab. Reduced-motion visitors see the online still without downloading video, and no-script visitors see the standby still.

Official game and music covers are listed with their page and download URL in `sources.json`. These images represent the original works, not Mori's own artwork. Square album covers and high-resolution Steam covers are used without repainting.

The following standalone assets were generated for the accepted vermilion reference direction on 2026-10-17:

| Asset | Purpose and generation brief |
| --- | --- |
| `jury-room.png` | Monochrome cinematic long jury table, cream paper background; conceptual illustration for the multi-agent jury project. |
| `model-stage.png` | Empty pale elliptical stage with a quiet wireframe surround; reserved home navigation space for a future model. |
| `vinyl.png` | Transparent black vinyl record with restrained cream center label, for layering behind the real album sleeve. |
| `inky-desk.png` | Warm desk and blank computer monitor; the website overlays the original Inky Paper screenshot. |
| `risk-segmentation.png` | Three pale paper panels labeled 高风险 / 中风险 / 低风险; conceptual segmentation illustration, not measured results. |

Original project and personal photographs remain in `public/project-inky-paper.png`, `public/project3.png`, and `public/hobbies/`. They are rendered directly, rather than extracted from the generated website reference images. No full reference screenshot is shipped as website UI.
