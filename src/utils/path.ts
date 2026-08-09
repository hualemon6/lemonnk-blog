// path.ts — 生成带部署 base 前缀的内部链接
// GitHub Pages 项目型仓库（如 /lemonnk-blog/）需要给内部链接加前缀，否则上线后 404

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function path(p: string): string {
  // 外链（http/https）原样返回
  if (/^https?:\/\//.test(p)) return p;
  return base + p;
}
