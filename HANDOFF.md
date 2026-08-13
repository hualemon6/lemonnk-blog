# LemonNK Blog — 项目对接文档

> 用途：给接手/协作的 Agent（或人类开发者）快速了解本项目全貌。
> 最近更新：2026-08-11

## 1. 项目一句话

一个部署在 **GitHub Pages** 的**极简、文字优先**的个人技术博客（Lil'Log × Medium 设计语言），附带一个本地写作/发布工具（LemonNK Studio）。

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
| Astro | ^7.2.0（当前 7.2.0） | 静态站点生成 |
| @astrojs/markdown-remark | ^7.2.2 | remark / rehype Markdown 插件处理器 |
| remark-math | ^6.0.0 | Markdown 数学公式解析 |
| rehype-katex | ^7.0.1 | 公式渲染（构建时，无客户端 JS） |
| katex | ^0.16.47 | KaTeX 渲染核心（与 rehype-katex 版本对齐） |
| Shiki | Astro 内置 | 代码语法高亮（双主题） |
| 本地工具 | Node 内置 http / child_process | LemonNK Studio 后端 |

**scripts**（`package.json`）：

```bash
npm run dev       # 本地开发，http://localhost:4321/lemonnk-blog/
npm run build     # 构建到 dist/
npm run preview   # 预览构建产物
```

**环境**：Windows（win32）、Node v24.15.0、npm 11.12.1、git 2.33。未安装 `gh` CLI。

## 3. 目录结构

```
D:\blog\
├── .github\workflows\deploy.yml   # push 到 main 后自动 build + 部署 Pages
├── astro.config.mjs               # site/base、KaTeX、Shiki 配置
├── package.json / tsconfig.json / .gitignore
├── public\
│   ├── favicon.svg
│   └── images\                    # 站点静态图片（gitkeep 占位）
├── src\
│   ├── components\                # 可复用组件
│   │   ├── Header.astro           # 顶栏（sticky、滚动收起、主题/语言切换按钮）
│   │   ├── SiteIntro.astro        # 首页介绍 + GitHub/LeetCode/关于 图标
│   │   ├── PostItem.astro         # 文章列表项（标题 + metadata，无摘要）
│   │   ├── PostMeta.astro         # 「日期 · 约N分钟 · 标签」行
│   │   └── ProjectItem.astro      # 项目列表项（单列、无卡片）
│   ├── config\
│   │   ├── site.ts                # 站点信息（name/github/leetcode）
│   │   ├── i18n.ts                # 中英文 UI 文案字典
│   │   └── projects.ts            # 项目数据（新增项目只改这里）
│   ├── content.config.ts          # 文章集合 loader 与 frontmatter schema（zod 校验）
│   ├── content\
│   │   └── posts\                 # ★ 所有文章（.md），一个文件一篇
│   ├── layouts\
│   │   ├── Layout.astro           # 全站外壳（head/header/footer/KaTeX CSS）
│   │   └── PostLayout.astro       # 文章页外壳（标题 + 上一篇/下一篇）
│   ├── pages\                     # ★ 路由 = 文件名
│   │   ├── index.astro            # /            首页：介绍 + 文章流
│   │   ├── archive.astro          # /archive/    全部文章
│   │   ├── about.astro            # /about/      关于我
│   │   ├── projects.astro         # /projects/   项目索引
│   │   ├── posts\[slug].astro     # /posts/:slug/ 文章页（动态路由）
│   │   └── tags\index.astro、[tag].astro   # /tags/ 与 /tags/:tag/
│   ├── styles\
│   │   ├── tokens.css             # ★ 设计变量（颜色/宽度/字号/间距 + dark 覆盖）
│   │   ├── global.css             # reset、基础样式、focus-visible、reduced-motion
│   │   └── prose.css              # 文章排版 + 代码块工具栏 + KaTeX 样式
│   └── utils\
│       ├── path.ts                # 内部链接统一加 base 前缀（必须用它，别硬编码 /）
│       ├── reading-time.ts        # 阅读时长估算（中英文）
│       └── client.ts              # 前端交互：主题/语言切换、滚动收起、代码块工具栏
├── studio\                        # ★ 本地写作工具前端（已 gitignore，不发布）
│   ├── index.html / studio.css / studio.js
├── tools\
│   └── studio-server.mjs          # ★ 本地后端（127.0.0.1:4177）
├── start-studio.cmd               # 双击启动 Studio（已 gitignore）
└── dist\                          # 构建产物（gitignore）
```

> `studio/`、`tools/`、`start-studio.cmd` 已加入 `.gitignore`，只本地用，不会发布/提交。

## 4. 核心机制（改代码前必读）

### 4.1 部署与 `base`
- `astro.config.mjs`：`site: 'https://hualemon6.github.io'`，`base: '/lemonnk-blog/'`。
- Astro 只会给**生成的资源**自动加 base，**硬编码的 `<a href="/...">` 不会**。
- 因此所有内部链接必须走 `src/utils/path.ts` 的 `path('/xxx/')`。
- `.github/workflows/deploy.yml`：push 到 `main` → `npm ci` → `npm run build` → 上传 `dist` → 部署。仓库 Settings → Pages → Source 必须为 **GitHub Actions**。

### 4.2 内容与路由
- 文章在 `src/content/posts/*.md`，frontmatter schema 见 `src/content.config.ts`：
  `title`（必填）、`pubDate`、`tags`、`draft`、`image`(预留)。
- `draft: true` 的文章**不会构建**（getStaticPaths 已过滤），本地 dev 也看不到，用于草稿。
- `src/pages/` 文件名即路由；`[slug].astro` / `[tag].astro` 是动态路由。

### 4.3 设计语言（改视觉前必读）
- **原则：Lil'Log × Medium —— 内容优先、文字优先、无卡片、无阴影、无渐变、低装饰。**
- 颜色只用五层：`background / text / muted / border / accent`（`tokens.css`）。
- 强调色唯一：蓝色 `--color-accent: #1a56db`（dark 模式 `#6fa8ff`）。
- 正文宽度 720px，阅读宽度约 680px，正文 17px / 1.75。
- 浅色背景 `#f7f7f5`（偏暖淡灰），文章页更白 `#fbfbfa`。
- **禁止**：大圆角卡片、box-shadow、渐变背景、彩色 tech badge、portfolio card grid、滚动进场动画、每项目不同配色、引入 UI 库/在线字体。
- 交互克制：只允许 `color 150ms`、`transform 150ms`；`prefers-reduced-motion` 已全局处理。

### 4.4 主题（亮/暗）
- 通过 `<html data-theme="dark">` 切换，`tokens.css` 中 `:root[data-theme='dark']` 覆盖颜色变量。
- `client.ts` + `Layout.astro` 防闪烁内联脚本管理 localStorage（key: `theme`）。

### 4.5 中英切换（UI 文案，不含正文）
- 机制：`src/config/i18n.ts` 定义 `ui.zh / ui.en` 字典；HTML 元素标 `data-i18n="key"`；`client.ts` 的 `applyLang()` 按当前语言替换 textContent。
- 支持 `{n}` 占位符（如 `minRead: '约 {n} 分钟'`，元素上加 `data-n={数值}`）。
- 也支持 `data-i18n-title` / `data-i18n-aria`（替换 title / aria-label）。
- **只切界面文字**，文章内容、URL、项目描述不翻译。
- 新增界面文案 → 加到 `i18n.ts` 两个语言 + 元素标 `data-i18n`。

### 4.6 代码块（语言标签 + 明暗切换）
- Shiki 双主题：`themes: { light: 'github-light', dark: 'github-dark' }`。
- 每个 token 同时带浅色 `color` 和 `--shiki-dark` 变量；`client.ts` 给每个代码块包 `.code-block` + 工具栏（左语言名、右 ◐ 按钮）。
- 代码主题三态逻辑：**同色联动、异色锁定**（站点与代码同色→切站点代码跟随；异色→代码保持手动选择）。localStorage key: `code-theme`。
- 样式在 `prose.css`。

### 4.7 数学公式（KaTeX）
- `astro.config.mjs`：通过 `@astrojs/markdown-remark` 的 `unified()` 配置 `remark-math`（必须开 `singleDollarTextMath: true`）+ `rehype-katex`（`throwOnError: false`）。
- 用法：行内 `$E=mc^2$`；块级 `$$ ... $$`。
- CSS 在 `prose.css`：`.katex { color: var(--color-text) }` 跟随主题；块级居中、无背景无边框；超长公式手机端 `.katex-display { overflow-x: auto }`。
- KaTeX CSS 在 `Layout.astro` 顶部 import。

### 4.8 顶部导航
- `Header.astro`：sticky 吸顶、滚动后中间导航淡出只留站名+按钮；导航项：文章/归档/项目/关于（**Tags 不进一级导航**，从文章元信息进入）。
- 站名 `LemonNK` 作为身份，20px/700；工具按钮（☀/🌙 主题、中/EN）弱化设计。

## 5. 写作与发布（两条路）

### 5.1 手动（不依赖 Studio）
1. 在 `src/content/posts/` 新建 `.md`，写 frontmatter + 正文。
2. `git add . && git commit -m "post: xxx" && git push`。
3. GitHub Actions 自动构建部署，1-3 分钟后生效（**浏览器需强刷 Ctrl+Shift+R**）。

### 5.2 LemonNK Studio（本地写作 IDE）
- 启动：双击 `start-studio.cmd` → 自动打开 `http://127.0.0.1:4177/studio/`。
- 后端 `tools/studio-server.mjs`：只监听 `127.0.0.1`，固定管理 `src/content/posts`，**不需要选目录**。
- API：`GET/POST/DELETE /api/posts...`，`POST /api/preview`（拉起 Astro dev）、`POST /api/publish`（build→git commit→push）。
- 功能：左栏文章列表（草稿/已发布分组+搜索）、中间写作区（标题+正文）、右设置抽屉（slug/日期/标签/状态/description/删除）、**800ms 防抖自动保存**、Ctrl+S/Ctrl+N/Ctrl+F、状态栏（字数/阅读时长/文件路径）。
- 预览：弹层 iframe 加载真实 Astro 页面（同一套渲染，不自己实现 Markdown）。
- 发布：save → `npm run build` → `git add/commit/push`，失败即停在日志面板。push 后由 Actions 部署。
- 安全性：shell 操作用固定 allowlist + 参数数组，不用 shell 拼接；npm 通过 `node npm-cli.js` 执行（Windows 不能直接 spawn npm）。

## 6. 页面清单（当前）

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 | SiteIntro + 文章流（标题+metadata，无摘要） |
| `/archive/` | 归档 | 全部文章（带描述） |
| `/posts/:slug/` | 文章 | 标题+metadata+正文+上一篇/下一篇；阅读页背景更白 |
| `/tags/`、`/tags/:tag/` | 标签 | 标签列表 / 标签下文章 |
| `/projects/` | 项目 | 4 个项目，单列无卡片（见 `src/config/projects.ts`） |
| `/about/` | 关于 | 自我介绍 |

## 7. 当前内容状态

- 文章：`hello-world.md`（标题已改为「Hello Blog！！！」）、`math-formula-test.md`（内容已改为「接雨水（保洁一面）」）。
- **未提交改动**：`src/content/posts/math-formula-test.md` 正在继续编辑（标题为「接雨水（保洁一面）」、包含力扣 42/84 及两个题解链接），尚未 commit/push。
- 当前文章不使用 `description` frontmatter；该文 slug 仍是 `math-formula-test`，如要同步 URL 请在文章完成后另行决定。

## 8. 待办 / 已知边界

- **LemonNK Studio 第二阶段待办**：正文编辑器换 **CodeMirror 6**（语法高亮/行号/搜索）；**图片拖放**自动复制到 `public/images/posts/<slug>/` 并插入 Markdown（当前未实现）。
- 编辑器预览对 `$$` 公式仍显示灰块（未集成 KaTeX 到 Studio 预览）。
- 项目页暂无 `case study` 详情页；将来可给 OpenVocabDet、NJU Rule RAG 做 `/projects/:slug/`。
- 中英切换只切 UI 文案；完整双语（正文翻译 + `/zh` `/en` 路由）未做，架构预留了空间。
- 首页「最新文章」标题与「查看归档」入口已移除（设计决策）；如要加回需在 `index.astro` + `i18n.ts` 恢复。
- `dist/`、`studio/`、`tools/`、`.astro/` 均 gitignore。

## 9. 给对接 Agent 的硬性注意事项

1. **不要重构** Astro 结构；不要为单个页面引入 UI 框架（Tailwind/Bootstrap 等）或在线字体。
2. **内部链接必须用 `path()`**（来自 `src/utils/path.ts`），严禁硬编码 `/xxx`。
3. 新 UI 文案要进 `i18n.ts`（zh/en）并标 `data-i18n`，否则中英切换不生效。
4. 颜色/字号/间距只能用 `tokens.css` 里的变量，禁止组件内自造字体大小。
5. 深色模式必须沿用 `data-theme` + tokens 覆盖，禁止单独写一套 dark theme。
6. 外部链接统一 `target="_blank" rel="noopener noreferrer"`。
7. 提交信息风格：`feat: xxx` / `post: xxx` / `chore: xxx`（英文，已沿用）。
8. 改动后必须 `npm run build` 通过再交付；本地预览用 `npm run dev`（地址带 `/lemonnk-blog/` 前缀）。
9. 只在你被明确要求时才 commit / push。
10. 仓库主页用户是 `hualemon6`，文章署名 `LemonNK`，不要用真名。
