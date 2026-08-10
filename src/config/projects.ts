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
      '在不重新训练或替换开放词汇检测器的情况下，利用冻结 CLIP 提供区域语义证据，对候选框置信度进行重新排序。',
    tech: 'Python · Grounding DINO · CLIP · Computer Vision',
    metric: 'COCO val2017 · AP 48.61 → 49.64 · +1.03',
    url: 'https://github.com/hualemon6/OpenVocabDet',
    year: '2026',
    ownership: 'personal',
  },
  {
    name: 'NJU Rule RAG',
    description:
      '南京大学本科校规与教务流程 RAG 问答系统。基于校规、办事指南和校园生活文档构建，支持自然语言提问、来源引用、风险分级和拒答机制。',
    tech: 'RAG · BGE-M3 · Qwen3 · FastAPI',
    metric: '220 docs · 3,441 chunks · 1.76s latency',
    url: 'https://github.com/Mr-tree013/nju-rule-rag',
    ownership: 'collaborative',
  },
  {
    name: 'CIFAR-10 CNN',
    subtitle: '从基础 CNN 到 90%+ 的优化实验',
    description:
      '基于 PyTorch，从基础 CNN 出发，通过数据增强、BatchNorm、Dropout、学习率策略和残差结构逐步优化 CIFAR-10 图像分类性能。',
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
      '用于在浏览器中填写课程作业、本地保存内容并生成答题卡 PDF 的轻量网页工具。',
    tech: 'HTML · Browser · Local Storage · PDF Export',
    url: 'https://github.com/hualemon6/OnlineQuiz',
    year: '2026',
    ownership: 'personal',
  },
];
