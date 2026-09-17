# 杨黄旭哲个人网站

这是我的个人主页项目，基于 Astro 构建，用于展示个人简介、简历、项目和后续博客内容。

## 本地开发

```powershell
npm install
npm run dev
```

## 构建

```powershell
npm run build
```

## 目录说明

- `src/pages/`：站点页面
- `src/components/`：页面组件
- `src/content/blog/`：博客文章内容
- `public/`：静态资源

## 内容维护

- `src/data/portfolio.ts`：个人资料、履历、项目事实、结果与首页精选；首页、项目总览、CV 和案例共用。
- `src/content/cases/`：三个重点案例的正文；普通项目只需在共享数据中维护短介绍。
- `public/resume.pdf`：用户提供的最新简历，保持固定下载地址。

修改后先构建，再运行 `npm run check:content`，核对精选数量、原项目保留、案例结构、跨页口径与内部资源。
详细说明见 [内容维护](docs/content-maintenance.md)，本轮范围见 [增量更新方案](docs/website-content-update-plan.md)。
