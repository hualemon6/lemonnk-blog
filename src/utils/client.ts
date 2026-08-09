// client.ts — 浏览器端交互：主题切换、界面语言切换、滚动收起导航、代码块增强
import { ui } from '../config/i18n';

const THEME_KEY = 'theme';
const LANG_KEY = 'lang';
const CODE_THEME_KEY = 'code-theme';

// 代码语言 → 显示名
const LANG_NAMES: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  cpp: 'C++',
  'c++': 'C++',
  c: 'C',
  'c#': 'C#',
  sh: 'Bash',
  bash: 'Bash',
  shell: 'Bash',
  zsh: 'Bash',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  md: 'Markdown',
  markdown: 'Markdown',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  swift: 'Swift',
  kotlin: 'Kotlin',
  yaml: 'YAML',
  sql: 'SQL',
};

function stored(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function applyTheme() {
  const theme = stored(THEME_KEY, 'light');
  document.documentElement.dataset.theme = theme;
}

function applyLang() {
  const lang = stored(LANG_KEY, 'zh') === 'en' ? 'en' : 'zh';
  const dict = ui[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as keyof typeof dict;
    if (key in dict) {
      el.textContent = dict[key].replace(/\{n\}/g, el.dataset.n ?? '');
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as keyof typeof dict;
    if (key in dict) el.title = dict[key];
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria as keyof typeof dict;
    if (key in dict) el.setAttribute('aria-label', dict[key]);
  });

  const langBtn = document.querySelector<HTMLElement>('[data-action="lang"]');
  if (langBtn) langBtn.textContent = lang === 'zh' ? 'EN' : '中';
}

document.querySelectorAll<HTMLElement>('[data-action="theme"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const siteBefore = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const newSite = siteBefore === 'dark' ? 'light' : 'dark';
    const code = stored(CODE_THEME_KEY, 'light');
    // 同色 → 代码跟随站点一起切；异色 → 用户手动调过，保持代码不动
    if (code === siteBefore) {
      save(CODE_THEME_KEY, newSite);
    }
    save(THEME_KEY, newSite);
    applyTheme();
    applyCodeTheme();
  });
});

document.querySelectorAll<HTMLElement>('[data-action="lang"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = stored(LANG_KEY, 'zh') === 'en' ? 'zh' : 'en';
    save(LANG_KEY, next);
    applyLang();
  });
});

// 代码块增强：给每个代码块加工具栏（语言名 + 明暗切换），切换作用于全页并持久化
// 代码主题：light/dark 两态。首次访问跟随站点主题（同色），此后「同色联动、异色锁定」
function applyCodeTheme() {
  // 首次访问（无存储值）：默认与站点主题一致
  if (localStorage.getItem(CODE_THEME_KEY) === null) {
    const site = document.documentElement.dataset.theme;
    save(CODE_THEME_KEY, site === 'dark' ? 'dark' : 'light');
  }
  const theme = stored(CODE_THEME_KEY, 'light');
  document.querySelectorAll<HTMLElement>('.code-block').forEach((el) => {
    el.classList.toggle('code-dark', theme === 'dark');
  });
}

document.querySelectorAll<HTMLElement>('pre.astro-code').forEach((pre) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';
  pre.parentNode?.insertBefore(wrapper, pre);
  wrapper.appendChild(pre);

  const header = document.createElement('div');
  header.className = 'code-block-header';

  const label = document.createElement('span');
  label.className = 'code-block-lang';
  const raw = pre.dataset.language ?? '';
  label.textContent = LANG_NAMES[raw] ?? raw;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'code-block-toggle';
  toggle.textContent = '◐';
  toggle.dataset.i18nTitle = 'code.theme';
  toggle.dataset.i18nAria = 'code.theme';
  toggle.title = '切换代码主题';
  toggle.setAttribute('aria-label', '切换代码主题');
  toggle.addEventListener('click', () => {
    // 手动切换：基于当前显示颜色取反
    const current = stored(CODE_THEME_KEY, 'light') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    save(CODE_THEME_KEY, next);
    applyCodeTheme();
  });

  header.appendChild(label);
  header.appendChild(toggle);
  wrapper.prepend(header);
});

applyCodeTheme();

// 滚动超过阈值后，给导航加 .scrolled：隐藏中间导航项，保留站名和工具按钮
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

applyTheme();
applyLang();
