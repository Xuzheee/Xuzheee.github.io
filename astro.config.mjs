import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // 将此处改为你的 GitHub Pages 网址
  site: 'https://Xuzheee.github.io',
  base: '/', 
  integrations: [mdx(), sitemap(), tailwind()],
});
