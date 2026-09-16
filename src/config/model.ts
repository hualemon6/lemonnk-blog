// model.ts — 服务端聚合：文章集合 → 地图模型 + 站点指标。所有页面共用。
import { getCollection } from 'astro:content';
import { getJourney } from './journey';
import { buildMapModel, COLLECTION_FLOOR } from './map';
import { readingTime } from '../utils/reading-time';

export async function loadMap() {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

  const entries = getJourney(posts);
  const model = buildMapModel(entries);
  const latest = posts.at(-1);
  const minutes = posts.reduce((sum, post) => sum + readingTime(post.body), 0);
  const years = model.floors.filter((floor) => floor.id !== COLLECTION_FLOOR).length;
  const defaultFloor = model.floors.find((floor) => floor.id !== COLLECTION_FLOOR)?.id
    ?? model.floors[0]?.id
    ?? COLLECTION_FLOOR;

  return {
    posts,
    entries,
    model,
    latest,
    minutes,
    years,
    defaultFloor,
    floors: model.floors.map((floor) => ({
      id: floor.id,
      label: floor.label,
      count: floor.count,
    })),
    floorLabel: (id: string) => (id === COLLECTION_FLOOR ? '项目集' : id),
  };
}

export const DOCK_WINDOWS = [
  { id: 'identity', titleKey: 'window.identity', title: '身份', icon: 'user' },
  { id: 'legend', titleKey: 'window.legend', title: '图例', icon: 'all' },
  { id: 'stats', titleKey: 'window.stats', title: '指标', icon: 'signal' },
  { id: 'recent', titleKey: 'window.recent', title: '最近的文字', icon: 'compass' },
  { id: 'list', titleKey: 'window.list', title: '列表', icon: 'list' },
  { id: 'detail', titleKey: 'window.detail', title: '经历详情', icon: 'code' },
  { id: 'about', titleKey: 'window.about', title: '关于我', icon: 'life' },
  { id: 'reader', titleKey: 'window.reader', title: '正文', icon: 'project' },
];
