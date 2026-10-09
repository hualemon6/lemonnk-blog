// metrics.ts — 发展指数维度类型与数据入口；数值由 Studio / 手动写入 data/metrics.json。
// 轴标签属于界面文案，放在 config/i18n.ts 的 radar.dim.<key>，不写进 JSON。
import metricsData from '../data/metrics.json';

export type MetricDimension = {
  key: string;
  value: number;
};

export type Metrics = {
  /** 最近一次自评日期，展示在图表标题右侧 */
  updated: string;
  /** 全维度统一的满值，所有轴共用，不做各自归一化 */
  scale: number;
  dimensions: MetricDimension[];
};

export const metrics = metricsData as Metrics;
