# 内容维护

## 编辑入口

| 要修改什么 | 文件 |
|---|---|
| 个人介绍、邮箱、电话、简历同步日期 | `src/data/portfolio.ts` 的 `profile` |
| 指标、项目时间、Paper 案例版本 | 同文件的 `facts` |
| 项目名、摘要、职责、链接、结果说明 | 同文件的 `projects` |
| 首页三个案例 | `featuredProjectIds`，本轮固定网易、Inky Paper、URAI；HV 只在总览 |
| 首页和 CV 的任职经历 | `experiences`，引用项目时间和描述 |
| 能力概览与技能 | `highlights`、`skills` |
| 三篇案例正文 | `src/content/cases/*.mdx` |
| 下载简历 | `public/resume.pdf` |

项目数据只存一份；`ProjectCard`、首页时间线、CV 和案例头部读取相同字段。案例结果通过 `ProjectResults` 引用同一份数值与限定条件，正文尽量不重复写数字。

新增普通项目时，在 `projects` 中增加记录，使用现有分类即可出现在总览；无需写长文。只有具有正文的项目才设置 `hasCase: true`，其 MDX 文件名必须与项目 ID 相同，并填写 `projectId` 与 `updatedDate`。

重点案例保持七段：问题与背景、用户和约束、我的职责、方案与关键取舍、实施与验证、结果及局限、下一步。模板见 `case-study-template.md`。维持现有首页和导航结构。

## 本轮事实依据

- 履历与结果：用户明确提供的 `杨黄旭哲_简历_.pdf`，2026-09-16 同步。网站 PDF 保持源文件字节不变，SHA-256：`D0440B3CFA671B6B56F3C70023891463AE5C11100F3D0A4BCB267CFBE96DBA39`。
- 网易效果：沿用简历的前后比较数值及同期对照说明；没有重新计算业务原表，不添加显著性或纯模型因果归因。
- Inky Paper：固定到 0.6.4 交付记录。`public/project-inky-paper.png` 和 `public/inky-paper-tasks.png` 来自该版 `workbench-records.png` 与 `paper-home.png`，页面注明验证数据。后续案例更新时同步版本、链接、配图与验证范围。
- 网易流程图：根据项目工作流绘制的示意，不是内部平台截图。
- 集钉：2026-09-17 用户提供小程序口令、发布工作台与发现任务截图、登记号为 `2026SR0945487` 的软著证书，并确认本人负责产品设计、小程序开发与测试，属于合作开发。著作权人为香港中文大学（深圳）。截图含测试任务，不能据此声称实际用户规模、采集量或业务效果；未进行小程序端到端验证。证书和两张截图原样保存在 `public/geopin-*`；口令、归属和截图说明统一维护在 `projects` 的 `geopin.miniProgram` 中。该项目仅加入总览，不扩展为长案例。
- 其他历史项目：保留原站资料；节水调研的旧地理表述冲突，暂省略具体地名，未猜测补写。

## 更新与检查

1. 用户提供新版简历时，用新版更新履历和 `public/resume.pdf`，再调整 `resumeSyncedAt`。产品进展可独立更新，CV 中已注明 Paper 近期进展另见案例。
2. 先改共享事实，再改相关案例叙事；数值与限定条件一起更新。履历时间与个人贡献不能由新版本发布时间推导。
3. 运行 `npm run build`。本地已有依赖时也可以直接用 Node 运行 `node_modules/astro/astro.js build`。
4. 运行 `npm run check:content`，检查实际构建产物中的精选项目、保留项目、七段案例、关键事实、内部链接和 PDF 完整性。检查失败先修内容再预览。
5. 预览首页、项目总览、CV 与三个案例，检查手机排版、图片、导航与下载入口。

自动检查保证约定与内容引用没有明显退化，不能证明业务效果或事实本身。涉及结果变更时仍需核对来源。

## worktree 与提交

本次实现位于 `codex/content-refresh-20260916`，基于 `af79442`。用户确认前不创建 commit、不推送、不部署。原 `main` 工作区不作页面修改。

本机 worktree 通过被 Git 忽略的 `node_modules` Junction 复用原目录依赖；页面源码与构建目录独立，未修改依赖版本或锁文件。
