// content.config.ts — 文章集合的数据结构与文件加载规则
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),                              // 标题（必填）
    pubDate: z.coerce.date(),                       // 发布日期
    tags: z.array(z.string()).default([]),          // 标签，默认空数组
    image: z.string().optional(),                   // 封面图，可选（非必需）
    draft: z.boolean().default(false),              // 草稿，true 则不发布
  }),
});

export const collections = { posts };
