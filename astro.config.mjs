// @ts-check
import { defineConfig } from 'astro/config';

// 站点地址：用户是 hualemon6，仓库是 lemonnk-blog
// 项目型仓库（非 <username>.github.io）需要 base 指向 /<repo-name>/
export default defineConfig({
  site: 'https://hualemon6.github.io',
  base: '/lemonnk-blog/',
  markdown: {
    shikiConfig: {
      // 双主题：代码块颜色用 CSS 变量输出，配合明暗切换按钮使用
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
