// projects.ts — 项目数据。新增项目只需在这里加一条，不要复制 HTML

export type Project = {
  name: string;
  subtitle?: string;
  description: string;
  tech: string;
  metric?: string;
  url: string;
  year?: string;
  ownership: 'personal' | 'collaborative';
};

export const projects: Project[] = [
  {
    name: 'OpenVocabDet',
    subtitle: 'Training-Free CLIP Reranking for Open-Vocabulary Detection',
    description:
      '利用冻结 CLIP 为开放词汇检测候选框重新排序。',
    tech: 'Python · Grounding DINO · CLIP · Computer Vision',
    metric: 'COCO val2017 · AP 48.61 → 49.64 · +1.03',
    url: 'https://github.com/hualemon6/OpenVocabDet',
    year: '2026',
    ownership: 'personal',
  },
  {
    name: 'NJU Rule RAG',
    description:
      '面向南大校规与教务流程的 RAG 问答系统。',
    tech: 'RAG · BGE-M3 · Qwen3 · FastAPI',
    metric: '220 docs · 3,441 chunks · 1.76s latency',
    url: 'https://github.com/Mr-tree013/nju-rule-rag',
    ownership: 'collaborative',
  },
  {
    name: 'CIFAR-10 CNN',
    subtitle: '从基础 CNN 到 90%+ 的优化实验',
    description:
      '从基础 CNN 到 90%+ 准确率的实验记录。',
    tech: 'Python · PyTorch · CNN · ResNet',
    metric: 'Accuracy · 63% → 90%+',
    url: 'https://github.com/hualemon6/CIFAR-10-CNN',
    year: '2026',
    ownership: 'personal',
  },
  {
    name: 'OnlineQuiz',
    subtitle: '数字系统设计基础 · 在线作业填写工具',
    description:
      '在浏览器中填写课程作业并生成答题 PDF。',
    tech: 'HTML · Browser · Local Storage · PDF Export',
    url: 'https://github.com/hualemon6/OnlineQuiz',
    year: '2026',
    ownership: 'personal',
  },
];
