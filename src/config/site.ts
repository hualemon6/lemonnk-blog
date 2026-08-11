// site.ts — 站点基本信息。改名、改简介只改这里，不散落在各组件里
// UI 界面文案（中英文）在 ./i18n.ts 里，不放在这里

export const site = {
  name: 'LemonNK',
  title: 'LemonNK 的博客',
  author: 'LemonNK',
  lang: 'zh-CN',
  locale: 'zh-CN',
  // 未来做多语言时在这里扩展，例如：languages: [{ code: 'zh', ... }]
  github: 'https://github.com/hualemon6',
  leetcode: 'https://leetcode.cn/u/mystifying-clarkeoff/',
};

export type SiteConfig = typeof site;
