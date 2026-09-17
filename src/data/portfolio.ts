// Shared facts for home, projects, case studies and CV. See docs/content-maintenance.md.
export const profile = {
  name: "杨黄旭哲",
  education: "计算社会科学硕士研究生",
  focus: "AI 策略 / Agent 工作流 / 数据评估",
  description: "社会学与统计学背景，关注 AI 策略、Agent 工作流与数据评估，实践从问题定义、方案落地到效果评估与迭代的完整流程。",
  introduction: "我有社会学与统计学背景，关注 AI 策略、Agent 工作流与数据评估。近期在网易客服策略、Inky 桌面工作助手和多模态研究工具中，实践从问题定义、方案落地到效果评估与迭代的完整流程。",
  background: "本科社会学背景让我关注社会行为、组织治理和人群互动，硕士阶段的统计学与计算社会科学训练让我能够用数据、模型和工具化流程分析这些问题。",
  email: "huangxuzhe12@163.com",
  phone: "13430811082",
  website: "xuzheee.github.io",
  github: "https://github.com/Xuzheee",
  resume: "/resume.pdf",
  resumeSyncedAt: "2026-09-16",
};

export const facts = {
  netease: {
    period: "2026.06 - 2026.08",
    replyRate: "7.2% → 20.8%",
    replyDelta: "+13.6 个百分点",
    conversionRate: "3.4% → 7.3%",
    conversionDelta: "+3.9 个百分点",
    coverage: "4 个重点品类，覆盖 5,000+ 高价值用户",
    comparison: "整体上线前后对比；同期随机分组对照结果与整体趋势一致。",
  },
  urai: { period: "2025.10 - 2026.05", samples: "30万+" },
  xiamen: { period: "2024.07 - 2024.08", records: "10,000+", themes: "6" },
  rural: { period: "2023.08 - 2023.10", surveys: "800+", interviews: "50+", proposals: "3" },
  irrigation: { period: "2024.08", households: "30+" },
  cookieCats: { samples: "90,189", auc: "0.894" },
  paper: { version: "0.6.4", verifiedAt: "2026-09-16" },
};

export type Category = "ai-agent" | "data-analysis" | "research" | "game-hci";
export type Project = {
  id: string;
  title: string;
  category: Category;
  img?: string;
  description: string;
  role: string;
  stack: string;
  result: string;
  badge: string;
  status?: string;
  period?: string;
  hasCase?: boolean;
  links?: { label: string; url: string }[];
  results?: { label: string; value: string; note?: string }[];
  resultNote?: string;
  miniProgram?: { token: string; screenshots: { src: string; caption: string }[]; registration: string; certificate: string };
};

export const projects: Project[] = [
  {
    id: "geopin", title: "集钉：众包地理信息采集小程序", category: "research",
    badge: "微信小程序", role: "合作开发：产品设计、小程序开发与测试", stack: "", status: "已取得软件著作权登记",
    description: "面向实地调研中的任务组织与空间信息采集，连接发布者的调研工作台与参与者的任务发现入口。发布者可设置采集类型与问卷，查看回收进度并导出数据；参与者从任务入口开展点位、路线或区域采集。",
    result: "调研任务发布、空间采集入口与回收管理",
    miniProgram: {
      token: "#小程序://集钉/hLldIW6f0oJWevh",
      screenshots: [
        { src: "/geopin-publisher.jpg", caption: "发布工作台：创建任务、回收进度与导出入口" },
        { src: "/geopin-discover.jpg", caption: "发现任务：点位、路线与区域采集入口（截图含测试任务）" },
      ],
      registration: "软件著作权登记号：2026SR0945487；登记日期：2026 年 9 月 16 日；著作权人：香港中文大学（深圳）。",
      certificate: "/geopin-registration.pdf",
    },
  },
  {
    id: "netease-ai-workflow", title: "网易：客服主动任务 AI 工作流", category: "ai-agent",
    img: "/project-netease.svg", badge: "AI 策略运营", role: "工作流与策略设计 / 效果评估",
    period: facts.netease.period, hasCase: true, status: "实习项目",
    description: "围绕用户理解、策略生成、客服执行与效果反馈，设计字段、Prompt、结构化 Schema 和策略配置，并依托内部平台落地，通过回复与转化数据持续迭代。",
    stack: "Prompt, Schema, 用户分层, 策略评估",
    result: "策略生成、客服执行、效果回收的完整流程",
    results: [
      { label: "48 小时回复率", value: facts.netease.replyRate, note: facts.netease.replyDelta },
      { label: "7 天转化率", value: facts.netease.conversionRate, note: facts.netease.conversionDelta },
      { label: "落地范围", value: facts.netease.coverage },
    ],
    resultNote: `${facts.netease.comparison}以上为简历记载的整体结果，不将前后差值等同于随机对照实验的处理效应。`,
  },
  {
    id: "inky-paper", title: "Inky Paper：桌面专注与工作助手", category: "ai-agent",
    img: "/project-inky-paper.png", badge: "Human-AI Interaction", role: "独立设计与开发",
    hasCase: true, status: `Windows 已交付 · ${facts.paper.version}`,
    description: "用纸面任务清单、番茄钟和独立工作台承接计划与执行。Hermes 按需帮助拆分和复盘，用户决定采用哪一步、何时开始，执行记录回到同一份任务状态。",
    stack: "Tauri, React, TypeScript, Rust, MCP",
    result: "计划采用 → 手动开始 → 执行记录 → 按需复盘",
    links: [
      { label: "查看源码", url: "https://github.com/Xuzheee/Inky-Paper" },
      { label: `下载 ${facts.paper.version}`, url: `https://github.com/Xuzheee/Inky-Paper/releases/tag/v${facts.paper.version}` },
      { label: "查看版本验证", url: `https://github.com/Xuzheee/Inky-Paper/blob/main/docs/verification/${facts.paper.version}/README.md` },
    ],
    results: [
      { label: "已交付", value: `Windows 应用 ${facts.paper.version}`, note: "纸面执行界面与独立工作台" },
      { label: "共同状态", value: "SQLite + Markdown", note: "任务与执行事实共享，个人笔记单独保留" },
    ],
    resultNote: `案例以 ${facts.paper.verifiedAt} 的 ${facts.paper.version} 交付记录为依据。该轮验证覆盖原生交互与记录回流，未重跑真实 Hermes 模型；模型验证见此前版本记录。尚未验证长期专注或产出改善。`,
  },
  {
    id: "hv-deep-research", title: "HV Deep Research：产品研究报告工作台", category: "ai-agent",
    img: "/project-hv-deep-research.png", badge: "Deep Research", role: "独立设计与开发",
    description: "基于“纵向历史演化 + 横向竞品格局”的框架，将主题输入、并行信息收集、证据筛选、结构化报告生成和质量检查整合为产品研究流程。",
    stack: "Next.js, FastAPI, LangGraph, Tavily, Firecrawl",
    result: "Evidence Cards、来源分级、Markdown 导出",
    links: [{ label: "查看演示", url: "https://hv-deep-research-web.onrender.com/" }],
  },
  {
    id: "seven-angry-man", title: "Seven Angry Man：多智能体辩论模拟", category: "ai-agent",
    img: "/project1.png", badge: "LLM Simulation", role: "系统设计与原型开发",
    description: "以经典电影情境为原型，为不同 Agent 设置立场、性格和背景，构建群体讨论原型，探索说服、冲突、立场变化与极化过程。",
    stack: "LangChain, Streamlit, Prompt Engineering", result: "交互式社会模拟 Web 原型",
    links: [{ label: "查看演示", url: "https://seven-angry-agent-f6vjdwtdxgluau6qkvfmxv.streamlit.app/" }],
  },
  {
    id: "inky-app", title: "FocusFlow / Inky：AI 桌面专注助手", category: "ai-agent",
    img: "/project-inky.png", badge: "早期项目", role: "独立设计与开发",
    description: "面向 ADHD / 易分心用户的桌面专注工具，接入 DeepSeek 自然语言解析，将输入转为结构化任务，包含任务捕获、专注计时、情绪提醒和宠物化激励。与独立应用 Inky Paper 分别维护。",
    stack: "Tauri 2, React, TypeScript, Rust, SQLite", result: "自然语言任务解析、悬浮窗、迷你宠物、本地任务管理",
    links: [{ label: "查看源码", url: "https://github.com/Xuzheee/Inky-app" }],
  },
  {
    id: "cookie-cats", title: "Cookie Cats 用户流失预测", category: "data-analysis",
    img: "/post_img.webp", badge: "Churn Modeling", role: "数据分析与建模",
    description: `基于 ${facts.cookieCats.samples} 条用户行为数据构建 7 日流失预测模型，完成特征工程、训练与评估，输出高 / 中 / 低风险用户分层，为差异化挽留策略提供输入。`,
    stack: "Python, Pandas, Scikit-learn, XGBoost", result: `XGBoost 测试集 AUC = ${facts.cookieCats.auc}`,
    links: [{ label: "查看源码", url: "https://github.com/Xuzheee/game_churn_project_plan" }],
  },
  {
    id: "steam-analytics", title: "Steam 游戏市场表现分析", category: "data-analysis",
    img: "/post_img.webp", badge: "Game Analytics", role: "数据分析与策略输出",
    description: "基于 Steam Top Sellers 候选样本构建“市场热度 × 玩家口碑”分析框架，区分高热度与高口碑路径，完成数据清洗、指标设计、EDA、建模评估与运营策略输出。",
    stack: "Python, Regression, Classification, EDA", result: "热度回归与高口碑识别模型",
    links: [{ label: "查看源码", url: "https://github.com/Xuzheee/steam-strategy-ops-portfolio" }],
  },
  {
    id: "xiamen-12345", title: "厦门 12345 平台文本挖掘", category: "data-analysis",
    img: "/post_img.webp", badge: "NLP", role: "数据分析", period: facts.xiamen.period,
    description: `清洗分析厦门 12345 平台 ${facts.xiamen.records} 条用户反馈，基于 TF-IDF 和 K-means 归纳 ${facts.xiamen.themes} 类核心诉求并建立标签体系；通过人工抽样校验，为工单分类与分派规则优化提供支持。`,
    stack: "TF-IDF, K-means, Python", result: `${facts.xiamen.records} 条反馈、${facts.xiamen.themes} 类核心诉求`,
  },
  {
    id: "urai-lab", title: "URAI Lab：多模态数据与模型评测", category: "research",
    img: "/project3.png", badge: "Research Tool", role: "研究助理 / Web 开发",
    period: facts.urai.period, hasCase: true, status: "研究项目",
    description: "面向灾害图像识别、事件要素抽取与策略建议的研究目标，设计多源数据、结构化输出与模型评测流程，并开发部署 LabelTool，让标注和复核在线协作。",
    stack: "Scrapy, Selenium, GPT / Qwen / GLM, WebApp",
    result: `${facts.urai.samples} 多模态样本、Precision / Recall / F1 评测`,
    results: [
      { label: "数据基础", value: `${facts.urai.samples} 多模态样本`, note: "新闻与社交媒体材料；不等同于人工标注量或评测集大小" },
      { label: "交付物", value: "Schema、评测流程、LabelTool", note: "结构化字段、模型比较及云端标注与复核工具" },
    ],
    resultNote: "数据规模与职责依据最新简历。本文没有发布具体模型的 F1 分数，也不将工具部署或数据量等同于研究效果。",
  },
  {
    id: "rural-governance", title: "农村居民满意度治理指标验证", category: "research",
    img: "/post_img.webp", badge: "Survey Research", role: "研究员", period: facts.rural.period,
    description: `参与农业农村部农村治理满意度指标验证调研，主导 ${facts.rural.surveys} 样本问卷与 ${facts.rural.interviews} 农户访谈研究，基于 OLS 回归识别治理效能关键变量。`,
    stack: "问卷调查, 访谈, OLS 回归", result: `${facts.rural.proposals} 项数据驱动的指标优化建议`,
  },
  {
    id: "irrigation-research", title: "节水灌溉社会服务研究", category: "research",
    img: "/post_img.webp", badge: "Qualitative Research", role: "研究员", period: facts.irrigation.period,
    description: `探索用户节水行为与政策激励的关联，结合 ${facts.irrigation.households} 农户调研、访谈和公开数据，分析节水灌溉的社会接受度与实施问题。`,
    stack: "田野调研, 访谈, 公开数据分析", result: `${facts.irrigation.households} 农户调研与政策建议整理`,
  },
  {
    id: "anti-emo", title: "Anti Emo：心理治愈游戏", category: "game-hci",
    img: "/project2.png", badge: "Game & Psychology", role: "游戏机制与 Web 部署协作",
    description: "合作开发包含心理学评估模块的游戏原型，探索游戏机制在情绪支持和自我觉察中的应用。原型功能不代表已验证心理干预效果。",
    stack: "Unity, Web Deployment, Psychological Assessment", result: "心理评估模块与在线体验",
    links: [{ label: "查看演示", url: "https://anti-emo.netlify.app/" }],
  },
];

export function getProject(id: string): Project {
  const project = projects.find((item) => item.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return project;
}

// HV is deliberately kept in the overview only, not as an automatic home fallback.
export const featuredProjectIds = ["netease-ai-workflow", "inky-paper", "urai-lab"] as const;
export const featuredProjects = featuredProjectIds.map(getProject);
export const projectUrl = (project: Project) => project.hasCase ? `/projects/${project.id}/` : project.links?.[0]?.url;

export const categories: { id: Category; title: string; subtitle: string; label: string }[] = [
  { id: "ai-agent", title: "AI Agent 与研究工具", subtitle: "AI Agent & Research Tools", label: "AI Agent" },
  { id: "data-analysis", title: "数据分析与建模", subtitle: "Data Analysis & Modeling", label: "Data Analysis" },
  { id: "research", title: "研究与社会科学项目", subtitle: "Research & Social Science", label: "Research" },
  { id: "game-hci", title: "游戏、心理与交互", subtitle: "Game & Human-AI Interaction", label: "Game & HCI" },
];

export const experiences = [
  { projectId: "netease-ai-workflow", title: "AI 策略运营 | 网易互娱", organization: "", home: true },
  { projectId: "urai-lab", title: "研究助理 | 城市韧性与人工智能实验室（URAI Lab）", organization: "香港中文大学（深圳）", home: true },
  { projectId: "xiamen-12345", title: "数据分析 | 厦门市信息中心", organization: "", home: true },
  { projectId: "rural-governance", title: "研究员 | 农村居民满意度治理指标验证调研", organization: "农业农村部项目", home: true },
  { projectId: "irrigation-research", title: "研究员 | 节水灌溉社会服务研究", organization: "", home: false },
].map((item) => ({ ...item, project: getProject(item.projectId) }));

export const skills = [
  { title: "AI 策略与工作流", description: "用户分层、触达与转化策略、Prompt、结构化 Schema、工具调用、RAG、LangChain / LangGraph、工作流设计与迭代。" },
  { title: "数据分析与效果评估", description: "Python、Pandas、Scikit-learn、SQL、回归 / 分类 / 聚类、指标设计、A/B 实验设计、效果归因与 Bad Case 复盘。" },
  { title: "文本与多模态研究", description: "TF-IDF、文本分析、数据清洗、Scrapy / Selenium、多模态字段设计、Precision / Recall / F1、模型边界与人工复核。" },
  { title: "原型开发与产品实现", description: "React、Tauri、TypeScript、Flask / Django / Streamlit、Web 原型与轻量部署、Claude Code / Cursor / Codex。" },
];

export const highlights = [
  { value: "AI Agent", label: "业务工作流", icon: "bot", desc: "在网易参与客服主动任务工作流设计，将用户理解、策略生成、客服执行与效果反馈连接起来，让业务经验成为可配置、可评估的流程。" },
  { value: "HCI", label: "Human-AI Interaction", icon: "users", desc: "通过 Inky Paper 探索计划与执行中的人机协作：AI 按需提供建议，用户决定采用和开始，执行记录支持后续复盘。" },
  { value: facts.urai.samples, label: "多模态数据样本", icon: "database", desc: "在 URAI Lab 参与灾害多模态数据体系建设，设计结构化字段、模型评测与人工复核流程，并将标注工具部署到云端。" },
  { value: facts.xiamen.records, label: "政务文本分析", icon: "fileSearch", desc: `清洗分析厦门 12345 平台用户反馈，基于 TF-IDF 与 K-means 归纳 ${facts.xiamen.themes} 类核心诉求，为工单分类和分派规则优化提供支持。` },
];
