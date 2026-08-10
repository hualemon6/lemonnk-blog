// config.ts — 内容集合的「数据结构定义」
// 声明每篇文章必须有哪些字段、什么类型，写错会直接报错

import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),                              // 标题（必填）
    description: z.string().optional(),             // 摘要（可选，用于 SEO）
    pubDate: z.coerce.date(),                       // 发布日期
    tags: z.array(z.string()).default([]),          // 标签，默认空数组
    image: z.string().optional(),                   // 封面图，可选（非必需）
    draft: z.boolean().default(false),              // 草稿，true 则不发布
  }),
});

export const collections = { posts };
