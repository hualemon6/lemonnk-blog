# LemonNK Blog — 项目对接文档

> 用途：给接手/协作的 Agent（或人类开发者）快速了解本项目全貌。
> 最近更新：2026-09-16（全站重构为「时间树地图 + 液态玻璃浮窗」）

## 1. 项目一句话

一个部署在 **GitHub Pages** 的个人技术博客。**全站是一张可平移缩放的时间树地图**，身份、图例、指标、详情、文章正文全部是浮在地图上的**液态玻璃浮窗**，浮窗可自由拖拽、吸附并记住位置。附带一个本地写作/发布工具（LemonNK Studio）。

| 项 | 值 |
|---|---|
| 线上地址 | https://hualemon6.github.io/lemonnk-blog/ |
| GitHub 仓库 | https://github.com/hualemon6/lemonnk-blog |
| 作者（站点署名） | LemonNK（GitHub 用户名 `hualemon6`） |
| 作者背景 | 南京大学 智能科学与技术学院 本科 |
| 部署方式 | GitHub Actions 自动构建 → GitHub Pages（项目型仓库，`base=/lemonnk-blog/`） |

## 2. 技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| Astro | ^7.2.0 | 静态站点生成 |
| @astrojs/markdown-remark | ^7.2.2 | remark / rehype Markdown 插件处理器 |
| remark-math | ^6.0.0 | Markdown 数学公式解析 |
| rehype-katex | ^7.0.1 | 公式渲染（构建时，无客户端 JS） |
| rehype-external-links | ^3.0.0 | 外链自动加 `target=_blank` |
| katex | ^0.16.47 | KaTeX 渲染核心 |
| @fontsource-variable/inter | ^5.3.0 | UI 字体（本地，不在线加载） |
| Shiki | Astro 内置 | 代码语法高亮（双主题） |
| 本地工具 | Node 内置 http / child_process | LemonNK Studio 后端 |

**scripts**：`npm run dev` / `npm run build` / `npm run preview`。

**环境**：Windows（win32）、Node v24.15.0、npm 11.12.1、git 2.33。未安装 `gh` CLI。

**未引入任何运行时依赖**：地图是 SVG + 原生 JS，浮窗系统是原生 Pointer Events。

## 3. 目录结构

```
D:\blog\
├── .github\workflows\deploy.yml   # push 到 main 后自动 build + 部署 Pages
├── astro.config.mjs               # site/base、KaTeX、Shiki 配置
├── docs\superpowers\specs\        # 设计文档
├── public\
│   ├── favicon.svg
│   └── images\                    # 头像与文章配图
├── src\
│   ├── components\
│   │   ├── Header.astro           # 顶部导航胶囊（站名 / 导航 / 楼层切换 / 主题语言）
│   │   ├── Icon.astro             # 线性图标集（单文件 path 表）
│   │   ├── MapShell.astro         # 地图壳：地图 + 浮窗层 + 窗柜 + 缩放控件 + 提示卡
│   │   ├── MapStage.astro         # ★ SVG 地图本体（地块 / 干线 / 节点 / LOD）
│   │   ├── Window.astro           # ★ 通用浮窗外壳（标题栏 / 收起 / 关闭 / 插槽）
│   │   ├── JourneyArtwork.astro   # 经历插图（详情窗复用）
│   │   ├── PostMeta.astro         # 「日期 · 约N分钟 · 标签」行
│   │   └── windows\               # 浮窗内容
│   │       ├── IdentityWindow.astro   # 身份
│   │       ├── LegendWindow.astro     # 图例 + 分类筛选
│   │       ├── StatsWindow.astro      # 条数 / 年份 / 阅读分钟
│   │       ├── DetailWindow.astro     # 选中经历详情
│   │       ├── RecentWindow.astro     # 最近文章
│   │       └── ListWindow.astro       # 通用列表窗（归档 / 项目 / 标签用插槽填充）
│   ├── config\
│   │   ├── site.ts                # 站点信息（name/github/leetcode）
│   │   ├── i18n.ts                # 中英文 UI 文案字典
│   │   ├── journey.ts             # 经历数据校验 + 聚合（getJourney）
│   │   ├── projects.ts            # 项目数据入口
│   │   ├── map.ts                 # ★ 地图几何、回形产线布局、楼层、包围盒、浮窗规格
│   │   └── model.ts               # ★ 服务端聚合 loadMap()，所有页面共用
│   ├── content.config.ts          # 文章集合 schema（zod 校验）
│   ├── content\posts\             # ★ 所有文章（.md）
│   ├── content\post-versions\     # AI 版正文
│   ├── data\
│   │   ├── journey.json           # 经历元数据（分类 / 标题 / 摘要 / 详情 / 插图）
│   │   ├── projects.json          # 项目数据
│   │   ├── about.json             # 关于我
│   │   └── post-editions.json     # ME/AI 双版本配置
│   ├── layouts\
│   │   ├── Layout.astro           # 全站外壳（head / 导航 / 兜底脚本）
│   │   └── PostLayout.astro       # 文章外壳（地图 + 阅读浮窗）
│   ├── pages\                     # ★ 路由 = 文件名
│   │   ├── index.astro            # /            地图 + 身份/图例/指标/详情/最近
│   │   ├── archive.astro          # /archive/    全楼层地图 + 归档列表窗
│   │   ├── about.astro            # /about/      关于窗
│   │   ├── projects.astro         # /projects/   项目集楼层 + 项目列表窗
│   │   ├── posts\[slug].astro     # /posts/:slug/ 聚焦节点 + 阅读窗
│   │   └── tags\index.astro、[tag].astro
│   ├── styles\
│   │   ├── tokens.css             # ★ 设计变量（玻璃 / 分类色 / 地图 / 明暗主题）
│   │   ├── global.css             # reset、基础样式、导入 map/windows
│   │   ├── map.css                # 地图层样式 + LOD
│   │   ├── windows.css            # 玻璃浮窗 / 窗柜 / 缩放控件 / 导航胶囊
│   │   └── prose.css              # 文章排版 + 代码块工具栏 + KaTeX
│   └── utils\
│       ├── path.ts                # 内部链接统一加 base 前缀（必须用）
│       ├── reading-time.ts        # 阅读时长估算
│       ├── client.ts              # 主题 / 语言切换、代码块工具栏
│       ├── map.ts                 # ★ 相机平移缩放、楼层、筛选、选中、LOD、键盘
│       └── windows.ts             # ★ 浮窗拖拽、吸附、持久化、窗柜、层级
├── studio\ tools\ start-studio.cmd  # 本地写作工具（gitignore）
└── dist\                          # 构建产物（gitignore）
```

## 4. 核心机制（改代码前必读）

### 4.1 部署与 `base`
- `astro.config.mjs`：`site: 'https://hualemon6.github.io'`，`base: '/lemonnk-blog/'`。
- Astro 只给**生成的资源**自动加 base，**硬编码的 `<a href="/...">` 不会**。
- 所有内部链接必须走 `src/utils/path.ts` 的 `path('/xxx/')`。
- push 到 `main` → Actions `npm ci` → `npm run build` → 部署 `dist`。Settings → Pages → Source 必须是 **GitHub Actions**。

### 4.2 地图：两层坐标系
```
.map-stage            固定铺满视口，接收平移/缩放/点击
└─ .map-camera        transform: translate3d(x,y,0) scale(k)  ← 唯一的"相机"
   └─ svg.map-world   2880 × 2160 固定世界（地块 + 干线 + 节点）
.window-layer         屏幕层，浮窗在此，不随地图移动
```
- **铁律：地图动，浮窗不动。** 浮窗活在屏幕坐标，平移地图时纹丝不动。
- 相机范围 `k ∈ [0.34, 2.6]`；滚轮以指针为锚点缩放；拖拽空白平移；双击节点聚焦其分区。
- **LOD**：`k < 0.48` → `data-lod="far"`（只显示色块）；`< 0.85` → `mid`（加日期与标题）；`≥ 0.85` → `near`（加缩略图）。分级写在 `map.css`。
- 空闲视差（鼠标反向位移 1–2px）在 `prefers-reduced-motion` 下自动关闭。

### 4.3 分区、回形产线与楼层
- 四个分区 = 四个分类，四块地固定在世界四象限（见 `config/map.ts` 的 `REGION_ORIGIN`）。
- 分区内节点沿**回形产线**排布：3 列网格，奇数行反向，不足一行居中（`layoutRegion()`），**单个记录跨全部条目只布局一次**，因此任何楼层视图下节点都不重叠。
- 楼层 = 年份；无日期的项目进 `collection`（项目集）层。**切楼层不是重新布局，而是"高亮该层 + 相机 fit 该层 + 其余淡化"**。改动前请先理解这一点。
- `project` 分类天然在 `collection` 层（项目无日期）。

### 4.4 浮窗系统
- 每个浮窗是 `<section class="float-window" data-window="id" data-side="tl|tr|tc|bc|center">`，位置由 CSS 变量 `--wx/--wy` 驱动。
- 行为（`utils/windows.ts`）：整窗空白处可拖拽；视口边缘 26px 吸附、窗与窗之间 9px 对齐；吸附时显示 `.snap-guide` 提示线；按住 `Alt` 拖拽可临时禁用吸附。
- 位置、收起、关闭、层级写入 `localStorage` 的 `lemonnk:map:v1`。窗口不能被拖到完全离开视口（至少保留 48px）。
- 底部**窗柜**列出本页所有浮窗，点击在开/关之间切换，`aria-pressed` 反映状态；旁边是「复位布局」。
- 层级：地图 0 → 常驻浮窗 10 → 拖拽/聚焦 20 → 阅读窗 30 → 窗柜与缩放控件 35 → 吸附线 38 → 提示卡 39 → 导航胶囊 40。

### 4.5 每个页面打开哪些窗
| 路由 | 模式 | 相机 | 默认浮窗 |
|---|---|---|---|
| `/` | floor | fit 最新年份 | identity, legend, stats, detail, recent |
| `/archive/` | all | fit 全部 | identity, legend, list, detail |
| `/projects/` | floor(collection) | fit 项目集 | identity, list, detail |
| `/about/` | all | fit 全部 | identity, about |
| `/posts/:slug/` | floor(该年) | fit 该年 | reader（正文，服务端渲染） |
| `/tags/` | all | fit 全部 | identity, legend, list |
| `/tags/:tag/` | all | fit 全部，高亮该标签节点 | identity, legend, list |

> 窗柜里的按钮必须与本页实际渲染的浮窗一一对应，否则点了没反应。

### 4.6 设计语言（改视觉前必读）
- 材质基线取自 `awesome-design-md` 的 `design-md/apple`：`blur + saturate` 玻璃、菲涅尔亮边、跟随鼠标的流光、**阴影只给实体**。
- 全站颜色/字号/间距/玻璃参数只在 `tokens.css` 定义，深色主题用 `:root[data-theme='dark']` 覆盖同一批变量。
- 分类色四个：`--color-learning`（蓝）/ `--color-research`（绿）/ `--color-project`（紫）/ `--color-life`（暖沙）。
- 正文阅读宽度 680px、17px / 1.7；标题负字距。
- **玻璃的美感来自它背后有什么**：地图底纹（渐变 + 网格 + 地块色块）不是装饰，删掉玻璃就退化成白纸。

### 4.7 主题（亮/暗）
`<html data-theme="dark">` 切换，`tokens.css` 覆盖颜色变量；`Layout.astro` 的内联防闪烁脚本 + `client.ts` 管理 `localStorage`（key `theme`）。

### 4.8 中英切换（UI 文案，不含正文）
`src/config/i18n.ts` 定义 `ui.zh / ui.en`；元素标 `data-i18n="key"`（`data-i18n-title` / `data-i18n-aria` 亦可），`client.ts` 的 `applyLang()` 替换 textContent。支持 `{n}` 占位符（配合 `data-n`）。**注意：SVG `<text>` 也支持这套机制。**

### 4.9 代码块（语言标签 + 明暗切换）与数学公式
- Shiki 双主题，`client.ts` 包 `.code-block` 工具栏；三态逻辑：同色联动、异色锁定（key `code-theme`）。
- KaTeX 在 `astro.config.mjs` 配置（`singleDollarTextMath: true`、`throwOnError: false`），CSS 在 `prose.css`。

## 5. 写作与发布

### 5.1 手动
`src/content/posts/*.md` 写 frontmatter + 正文 → `git add . && git commit -m "post: xxx" && git push` → Actions 自动部署（1–3 分钟，浏览器需强刷）。

### 5.2 LemonNK Studio（本地写作 IDE）
双击 `start-studio.cmd` → `http://127.0.0.1:4177/studio/`。后端 `tools/studio-server.mjs` 只监听 `127.0.0.1`，固定管理 `src/content/posts`。功能：文章列表、写作区、设置抽屉、800ms 防抖自动保存、Ctrl+S/N/F、预览 iframe、发布（build → commit → push）。shell 操作用固定 allowlist + 参数数组，不用 shell 拼接。

## 6. 页面清单（当前）

| 路由 | 页面 | 默认浮窗 |
|---|---|---|
| `/` | 经历地图首页 | 身份 / 图例 / 指标 / 详情 / 最近 |
| `/archive/` | 全部文章（列表窗） | 身份 / 图例 / 列表 / 详情 |
| `/posts/:slug/` | 文章（阅读窗） | 正文 |
| `/tags/`、`/tags/:tag/` | 标签 | 身份 / 图例 / 列表 |
| `/projects/` | 项目（项目集楼层） | 身份 / 列表 / 详情 |
| `/about/` | 关于我 | 身份 / 关于 |

共 14 个静态路由（含 5 篇文章、4 个标签页）。

## 7. 内容状态

- 文章 5 篇：`hello-world`、`math-formula-test`（接雨水）、`20260814大模型横评`、`最近一直在准备科研进组的事情`、`rnn-lstm-gru`。
- 经历 5 条（`journey.json`）+ 4 个项目（`projects.json`）= 地图上 9 个节点。
- 楼层：`2026`（5 个节点）+ `collection`（4 个项目）。
- `math-formula-test` 与 `rnn-lstm-gru` 有 ME/AI 双版本。

## 8. 待办 / 已知边界

- **移动端未做**（本轮明确不做）。当前是桌面优先：`body { overflow: hidden }`，浮窗拖拽基于 Pointer Events，触屏体验未设计。窄屏需要专门一轮：建议地图支持双指缩放、浮窗退化为底部抽屉。
- **浮窗不支持缩放**（只能拖拽 / 收起 / 关闭）。阅读窗固定 760px 宽。
- 阅读窗正文最大高度 `min(78vh, 820px)`；超长文需要滚动。
- Studio 第二阶段待办：正文编辑器换 CodeMirror 6；图片拖放自动落盘。
- Studio 预览对 `$$` 公式仍显示灰块。
- 项目无独立详情页。
- 中英切换只切 UI 文案，正文不翻译。
- 同时开太多浮窗时 `backdrop-filter` 有性能开销（当前每页最多 5 个窗）。

## 9. 给对接 Agent 的硬性注意事项

1. **不要重构** Astro 结构；不要为单个页面引入 UI 框架（Tailwind/Bootstrap 等）或在线字体。
2. **内部链接必须用 `path()`**（`src/utils/path.ts`），严禁硬编码 `/xxx`。
3. 新 UI 文案要进 `i18n.ts`（zh/en）并标 `data-i18n`，否则中英切换不生效。
4. 颜色/字号/间距只能用 `tokens.css` 变量，禁止组件内自造字体大小。
5. 深色模式必须沿用 `data-theme` + token 覆盖，禁止单独写一套 dark theme。
6. 外部链接统一 `target="_blank" rel="noopener noreferrer"`。
7. **不要在任何 `if` / `for` 块内声明客户端函数。** 客户端脚本用「具名 `initXxx()` 函数 + 末尾调用」的结构。曾经因为在 `if (stage && …) { function … }` 里声明函数，生产压缩构建把变量名撞掉，导致线上点节点直接报错（未压缩构建却是好的）——**上线前必须用压缩构建做交互测试**。
8. 浮窗的 `data-side` 决定默认锚位，`--ww` 决定宽度；新增浮窗要在 `config/map.ts` 的 `WINDOW_SPECS` 和 `config/model.ts` 的 `DOCK_WINDOWS` 同步登记，并只在本页 `windows` 列表里传实际渲染的窗。
9. 新增地图节点不需要改组件：往 `src/data/journey.json` 加记录即可（分类用 `category`，有 `postId` 自动取文章日期与链接）。项目从 `projects.json` 复用，**无日期，不得编造时间**。
10. 改动后必须 `npm run build` 通过再交付；本地预览用 `npm run dev`（地址带 `/lemonnk-blog/` 前缀）。
11. 只在你被明确要求时才 commit / push。
12. 仓库主页用户是 `hualemon6`，文章署名 `LemonNK`，不要用真名。
