// map.ts — 地图几何、楼层、节点布局与浮窗默认位。服务端渲染与客户端共用。
import type { JourneyCategory, JourneyEvent } from './journey';

/* ── 世界与分区几何 ── */
export const WORLD = { width: 2880, height: 2160 };
export const REGION = { width: 1140, height: 760 };
export const NODE = { width: 160, height: 98 };

const REGION_PAD_X = 160;
const REGION_PAD_TOP = 160;
const REGION_PAD_BOTTOM = 200;
const NODE_COLS = 3;
const BLOCK_H = NODE.height + 58;

export const REGION_ORDER: JourneyCategory[] = ['learning', 'research', 'project', 'life'];

export const REGION_ORIGIN: Record<JourneyCategory, { x: number; y: number }> = {
  learning: { x: 170, y: 170 },
  research: { x: 1570, y: 170 },
  project: { x: 170, y: 1230 },
  life: { x: 1570, y: 1230 },
};

export const COLLECTION_FLOOR = 'collection';

/* 中央竖脊与四条支线的连接点 */
const SPINE_X = WORLD.width / 2;
const TOP_Y = REGION_ORIGIN.learning.y + REGION.height / 2;
const BOTTOM_Y = REGION_ORIGIN.project.y + REGION.height / 2;
export const TRUNK = {
  spineX: SPINE_X,
  topY: TOP_Y,
  bottomY: BOTTOM_Y,
  junctions: [
    { x: SPINE_X, y: TOP_Y },
    { x: SPINE_X, y: BOTTOM_Y },
  ],
  d: `M${REGION_ORIGIN.learning.x + REGION.width} ${TOP_Y}H${SPINE_X}` +
    `M${REGION_ORIGIN.research.x} ${TOP_Y}H${SPINE_X}` +
    `M${SPINE_X} ${TOP_Y}V${BOTTOM_Y}` +
    `M${REGION_ORIGIN.project.x + REGION.width} ${BOTTOM_Y}H${SPINE_X}` +
    `M${REGION_ORIGIN.life.x} ${BOTTOM_Y}H${SPINE_X}`,
};

export interface MapNode {
  id: string;
  category: JourneyCategory;
  title: string;
  date?: string;
  floor: string;
  summary: string;
  detail: string;
  image?: string;
  visual: string;
  url?: string;
  external: boolean;
  x: number;
  y: number;
}

export interface MapRegion {
  id: JourneyCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  count: number;
}

export interface MapFloor {
  id: string;
  label: string;
  count: number;
}

export interface MapBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapModel {
  world: typeof WORLD;
  regions: MapRegion[];
  nodes: MapNode[];
  floors: MapFloor[];
  floorBounds: Record<string, MapBounds>;
}

/* 回形产线：3 列网格，奇数行反向，不足一行的居中 */
export function layoutRegion(originX: number, originY: number, count: number) {
  const innerW = REGION.width - REGION_PAD_X * 2;
  const innerH = REGION.height - REGION_PAD_TOP - REGION_PAD_BOTTOM;
  const rows = Math.max(1, Math.ceil(count / NODE_COLS));
  const stepX = innerW / (NODE_COLS - 1);
  const stepY = rows > 1 ? innerH / (rows - 1) : 0;
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / NODE_COLS);
    const column = index % NODE_COLS;
    const inRow = Math.min(NODE_COLS, count - row * NODE_COLS);
    const slot = row % 2 === 1 ? inRow - 1 - column : column;
    const rowWidth = (inRow - 1) * stepX;
    points.push({
      x: originX + REGION_PAD_X + (innerW - rowWidth) / 2 + slot * stepX,
      y: rows > 1
        ? originY + REGION_PAD_TOP + row * stepY
        : originY + (REGION.height - BLOCK_H) / 2,
    });
  }
  return points;
}

function floorOf(entry: JourneyEvent): string {
  return entry.date ? entry.date.slice(0, 4) : COLLECTION_FLOOR;
}

function boundsOf(nodes: MapNode[]): MapBounds {
  if (!nodes.length) return { x: 0, y: 0, width: WORLD.width, height: WORLD.height };
  const pad = { x: NODE.width / 2 + 130, top: 190, bottom: 150 };
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const x = Math.min(...xs) - pad.x;
  const y = Math.min(...ys) - pad.top;
  return {
    x,
    y,
    width: Math.max(...xs) + NODE.width + pad.x - x,
    height: Math.max(...ys) + BLOCK_H + pad.bottom - y,
  };
}

export function buildMapModel(entries: JourneyEvent[]): MapModel {
  const floorIds = [...new Set(entries.map(floorOf))];
  const years = floorIds.filter((id) => id !== COLLECTION_FLOOR).sort((a, b) => b.localeCompare(a));
  const ordered = floorIds.includes(COLLECTION_FLOOR) ? [...years, COLLECTION_FLOOR] : years;

  /* 每个分区跨全部记录只布局一次：保证任何楼层视图下节点都不重叠 */
  const nodes: MapNode[] = [];
  for (const category of REGION_ORDER) {
    const bucket = entries
      .filter((entry) => entry.category === category)
      .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.id.localeCompare(b.id));
    const points = layoutRegion(REGION_ORIGIN[category].x, REGION_ORIGIN[category].y, bucket.length);
    bucket.forEach((entry, index) => {
      nodes.push({
        id: entry.id,
        category: entry.category,
        title: entry.title,
        date: entry.date,
        floor: floorOf(entry),
        summary: entry.summary,
        detail: entry.detail,
        image: entry.image,
        visual: entry.visual,
        url: entry.url,
        external: entry.external,
        x: points[index].x,
        y: points[index].y,
      });
    });
  }

  const floors: MapFloor[] = ordered.map((floorId) => ({
    id: floorId,
    label: floorId === COLLECTION_FLOOR ? 'collection' : floorId,
    count: nodes.filter((node) => node.floor === floorId).length,
  }));

  const floorBounds: Record<string, MapBounds> = {};
  for (const floor of floors) {
    floorBounds[floor.id] = boundsOf(nodes.filter((node) => node.floor === floor.id));
  }
  floorBounds.all = boundsOf(nodes);

  const regions: MapRegion[] = REGION_ORDER.map((category) => ({
    id: category,
    x: REGION_ORIGIN[category].x,
    y: REGION_ORIGIN[category].y,
    width: REGION.width,
    height: REGION.height,
    count: entries.filter((entry) => entry.category === category).length,
  }));

  return { world: WORLD, regions, nodes, floors, floorBounds };
}

/* ── 浮窗默认位 ──
   side 决定锚角，index 决定同侧堆叠顺序；像素位置在客户端按视口算一次后持久化。 */
export type WindowSide = 'tl' | 'tr' | 'tc' | 'bl' | 'br' | 'bc' | 'center';

export interface WindowSpec {
  side: WindowSide;
  width?: number;
  index?: number;
  collapsible?: boolean;
}

export const WINDOW_SPECS: Record<string, WindowSpec> = {
  identity: { side: 'tl', width: 252, index: 0 },
  legend: { side: 'tl', width: 252, index: 1 },
  stats: { side: 'tc', width: 392 },
  recent: { side: 'tr', width: 248, index: 0 },
  list: { side: 'tr', width: 384, index: 0 },
  detail: { side: 'bc', width: 520 },
  about: { side: 'center', width: 640 },
  reader: { side: 'center', width: 760 },
};

export const WINDOW_ORDER = [
  'identity',
  'legend',
  'stats',
  'recent',
  'list',
  'detail',
  'about',
  'reader',
] as const;

export type WindowId = (typeof WINDOW_ORDER)[number];

export const LAYOUT_STORAGE_KEY = 'lemonnk:map:v1';
