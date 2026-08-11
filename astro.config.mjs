// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';

// 站点地址：用户是 hualemon6，仓库是 lemonnk-blog
// 项目型仓库（非 <username>.github.io）需要 base 指向 /<repo-name>/
export default defineConfig({
  site: 'https://hualemon6.github.io',
  base: '/lemonnk-blog/',
  markdown: {
    processor: unified({
      remarkPlugins: [
        // singleDollarTextMath 必须显式开启：remark-math v6 默认不处理 $...$ 行内公式
        [remarkMath, { singleDollarTextMath: true }],
      ],
      rehypePlugins: [
        // throwOnError 关闭：个别公式写错不会导致整个构建失败
        [rehypeKatex, { throwOnError: false }],
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
    shikiConfig: {
      // 双主题：代码块颜色用 CSS 变量输出，配合明暗切换按钮使用
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
