// reading-time.ts — 根据文章正文估算阅读时长（分钟）
// 简单按字数估算：英文按单词，中文按字符

export function readingTime(body: string): number {
  const text = body.replace(/```[\s\S]*?```/g, ''); // 忽略代码块
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = text.replace(/[\u4e00-\u9fff]/g, ' ').trim().split(/\s+/).length;
  const total = chineseChars / 300 + words / 220; // 中文300字/分，英文220词/分
  return Math.max(1, Math.round(total));
}
