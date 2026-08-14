// projects.ts — 项目类型与数据入口；实际内容由 Studio 写入 projects.json。
import projectData from '../data/projects.json';

export type Project = {
  id: string;
  name: string;
  narrative: string;
  narrativeZh?: string;
  url: string;
};

export const projects = projectData as Project[];
