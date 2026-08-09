// i18n.ts — UI 界面文案字典（中/英）
// 第一阶段只切换界面文字，不切换文章内容或 URL，即「界面语言切换」
import { site } from './site';

export const ui = {
  zh: {
    'nav.writing': '文章',
    'nav.archive': '归档',
    'nav.projects': '项目',
    'nav.about': '关于',
    'welcome': `欢迎来到 ${site.name} 的博客`,
    'intro.description': site.description,
    'intro.github': 'GitHub',
    'intro.leetcode': 'LeetCode',
    'intro.about': '关于我',
    'archive.title': '归档',
    'tags.title': '标签',
    'tag.prefix': '标签',
    'minRead': '约 {n} 分钟',
    'toggle.theme': '切换主题',
    'code.theme': '切换代码主题',
  },
  en: {
    'nav.writing': 'Writing',
    'nav.archive': 'Archive',
    'nav.projects': 'Projects',
    'nav.about': 'About',
    'welcome': `Welcome to ${site.name}'s Blog`,
    'intro.description': 'I write about AI, programming, and things I am learning.',
    'intro.github': 'GitHub',
    'intro.leetcode': 'LeetCode',
    'intro.about': 'About',
    'archive.title': 'Archive',
    'tags.title': 'Tags',
    'tag.prefix': 'Tag',
    'minRead': '{n} min',
    'toggle.theme': 'Toggle theme',
    'code.theme': 'Toggle code theme',
  },
} as const;

export type Lang = keyof typeof ui;
export type I18nKey = keyof (typeof ui)['zh'];
