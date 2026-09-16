// map.ts — 地图交互：相机平移缩放、楼层切换、分类筛选、节点选中、LOD、键盘。
import { NODE, REGION } from '../config/map';

const MIN_K = 0.34;
const MAX_K = 2.6;
const FAR = 0.48;
const NEAR = 0.85;
const EDGE = 40;

interface Camera {
  x: number;
  y: number;
  k: number;
}

interface NodeInfo {
  el: SVGGElement;
  id: string;
  category: string;
  floor: string;
  title: string;
  date: string;
  x: number;
  y: number;
  external: boolean;
}

function initMap() {
  const stage = document.querySelector<HTMLElement>('[data-map-stage]');
  const camera = document.querySelector<HTMLElement>('[data-map-camera]');
  const world = document.querySelector<SVGElement>('[data-map-world]');
  const tip = document.querySelector<HTMLElement>('[data-map-tip]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || !camera || !world) return;
  const nodes: NodeInfo[] = Array.from(world.querySelectorAll<SVGGElement>('.map-node')).map((el) => {
    const match = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(el.getAttribute('transform') ?? '');
    return {
      el,
      id: el.dataset.node ?? '',
      category: el.dataset.category ?? '',
      floor: el.dataset.floor ?? '',
      title: el.dataset.title ?? '',
      date: el.dataset.date ?? '',
      x: Number(match?.[1] ?? 0),
      y: Number(match?.[2] ?? 0),
      external: el.dataset.external === 'true',
    };
  });

  const regions = Array.from(world.querySelectorAll<SVGGElement>('[data-region-plate]')).map((el) => ({
    el,
    id: el.dataset.region ?? '',
    x: Number(el.querySelector('rect')?.getAttribute('x') ?? 0),
    y: Number(el.querySelector('rect')?.getAttribute('y') ?? 0),
  }));

  let state: Camera = { x: 0, y: 0, k: 0.6 };
  let mode: 'floor' | 'all' = (stage.dataset.mode as 'floor' | 'all') ?? 'floor';
  let floor = stage.dataset.floor ?? '';
  let filter = 'all';
  const highlight = new Set<string>(
    Array.from(world.querySelectorAll<SVGGElement>('.map-node[data-highlight="true"]'))
      .map((el) => el.dataset.node ?? ''),
  );
  let selectedId = stage.dataset.selected ?? nodes.at(-1)?.id ?? '';
  let hintGone = false;

  const viewport = () => ({ w: stage.clientWidth, h: stage.clientHeight });

  function apply(animate = false) {
    camera!.classList.toggle('is-animating', animate && !reduced.matches);
    camera!.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) scale(${state.k.toFixed(4)})`;
    const lod = state.k < FAR ? 'far' : state.k < NEAR ? 'mid' : 'near';
    if (world!.dataset.lod !== lod) world!.dataset.lod = lod;
  }

  function setCamera(next: Camera, animate = true) {
    state = {
      k: Math.min(MAX_K, Math.max(MIN_K, next.k)),
      x: next.x,
      y: next.y,
    };
    apply(animate);
  }

  function fitBounds(bounds: { x: number; y: number; width: number; height: number }, animate = true, minK = MIN_K) {
    const { w, h } = viewport();
    const k = Math.min(
      MAX_K,
      Math.max(minK, Math.min((w - EDGE * 2) / bounds.width, (h - EDGE * 2) / bounds.height)),
    );
    setCamera(
      {
        k,
        x: (w - bounds.width * k) / 2 - bounds.x * k,
        y: (h - bounds.height * k) / 2 - bounds.y * k,
      },
      animate,
    );
  }

  function nodeBounds(list: NodeInfo[]) {
    if (!list.length) return { x: 0, y: 0, width: 2880, height: 2160 };
    const padX = NODE.width / 2 + 110;
    const minX = Math.min(...list.map((node) => node.x)) - padX;
    const minY = Math.min(...list.map((node) => node.y)) - 170;
    return {
      x: minX,
      y: minY,
      width: Math.max(...list.map((node) => node.x)) + NODE.width + padX - minX,
      height: Math.max(...list.map((node) => node.y)) + NODE.height + 150 - minY,
    };
  }

  function activeNodes() {
    const floorsActive = mode === 'all' ? null : floor;
    return nodes.filter(
      (node) =>
        (floorsActive === null || node.floor === floorsActive) &&
        (filter === 'all' || node.category === filter) &&
        (highlight.size === 0 || highlight.has(node.id)),
    );
  }

  function fitFloor(animate = true) {
    const list = activeNodes();
    fitBounds(nodeBounds(list.length ? list : nodes), animate, 0.52);
  }

  function focusRegion(regionId: string, animate = true) {
    const region = regions.find((item) => item.id === regionId);
    if (!region) return;
    const size = { width: REGION.width, height: REGION.height };
    fitBounds({ x: region.x - 70, y: region.y - 70, width: size.width + 140, height: size.height + 140 }, animate, MIN_K);
  }

  /* ── 选中 ── */
  function select(id: string, pan = true) {
    selectedId = id;
    for (const node of nodes) {
      const active = node.id === id;
      node.el.classList.toggle('is-selected', active);
    }
    stage!.dataset.selected = id;
    document.querySelectorAll<HTMLElement>('[data-detail-node]').forEach((panel) => {
      panel.hidden = panel.dataset.detailNode !== id;
    });
    const node = nodes.find((item) => item.id === id);
    if (node && pan) ensureVisible(node);
  }

  function ensureVisible(node: NodeInfo) {
    const { w, h } = viewport();
    const sx = node.x * state.k + state.x;
    const sy = node.y * state.k + state.y;
    const pad = 140;
    let dx = 0;
    let dy = 0;
    if (sx < pad) dx = pad - sx;
    else if (sx + NODE.width * state.k > w - pad) dx = w - pad - (sx + NODE.width * state.k);
    if (sy < pad) dy = pad - sy;
    else if (sy + NODE.height * state.k > h - pad) dy = h - pad - (sy + NODE.height * state.k);
    if (dx || dy) setCamera({ ...state, x: state.x + dx, y: state.y + dy }, true);
  }

  function nearest(from: NodeInfo, dx: number, dy: number) {
    const pool = activeNodes().filter((node) => node !== from);
    let best: NodeInfo | undefined;
    let bestScore = Infinity;
    for (const node of pool) {
      const vx = node.x - from.x;
      const vy = node.y - from.y;
      const along = vx * dx + vy * dy;
      if (along <= 0) continue;
      const across = Math.abs(vx * dy - vy * dx);
      const score = along + across * 2.4;
      if (score < bestScore) {
        bestScore = score;
        best = node;
      }
    }
    return best;
  }

  /* ── 楼层与筛选 ── */
  function refreshVisibility() {
    const activeFloors = mode === 'all' ? null : floor;
    for (const node of nodes) {
      const floorMatch = activeFloors === null || node.floor === activeFloors;
      const filterMatch = filter === 'all' || node.category === filter;
      const highlightMatch = highlight.size === 0 || highlight.has(node.id);
      const alive = floorMatch && filterMatch && highlightMatch;
      node.el.classList.toggle('is-dimmed', !alive);
      node.el.style.pointerEvents = alive ? '' : 'none';
    }
    for (const region of regions) {
      const alive = nodes.some(
        (node) =>
          node.category === region.id &&
          (activeFloors === null || node.floor === activeFloors),
      );
      region.el.classList.toggle('is-empty', !alive);
      region.el.classList.toggle('is-dimmed', filter !== 'all' && filter !== region.id);
      const count = nodes.filter(
        (node) =>
          node.category === region.id &&
          (activeFloors === null || node.floor === activeFloors) &&
          (filter === 'all' || node.category === filter),
      ).length;
      const label = region.el.querySelector<SVGTextElement>('[data-region-count]');
      if (label) label.textContent = String(count).padStart(2, '0');
    }
    const floorSelect = document.querySelector<HTMLSelectElement>('[data-floor-select]');
    if (floorSelect && mode !== 'all') floorSelect.value = floor;
    document.querySelectorAll<HTMLElement>('[data-map-filter]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.mapFilter === filter));
    });
  }

  /* ── 交互：平移 ── */
  let pan: { id: number; x: number; y: number; cx: number; cy: number; moved: boolean } | undefined;

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    pan = { id: event.pointerId, x: state.x, y: state.y, cx: event.clientX, cy: event.clientY, moved: false };
  });

  stage.addEventListener('pointermove', (event) => {
    if (!pan || event.pointerId !== pan.id) return;
    const dx = event.clientX - pan.cx;
    const dy = event.clientY - pan.cy;
    if (!pan.moved && Math.hypot(dx, dy) < 4) return;
    if (!pan.moved) {
      pan.moved = true;
      stage.classList.add('is-panning');
      if (!stage.hasPointerCapture(pan.id)) stage.setPointerCapture(pan.id);
    }
    state = { ...state, x: pan.x + dx, y: pan.y + dy };
    apply(false);
    dismissHint();
  });

  function endPan() {
    if (!pan) return;
    if (stage!.hasPointerCapture(pan.id)) stage!.releasePointerCapture(pan.id);
    stage!.classList.remove('is-panning');
    if (pan.moved) suppressClick = true;
    pan = undefined;
  }
  stage.addEventListener('pointerup', endPan);
  stage.addEventListener('pointercancel', endPan);

  /* ── 交互：缩放 ── */
  stage.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0016);
      const next = Math.min(MAX_K, Math.max(MIN_K, state.k * factor));
      const ratio = next / state.k;
      setCamera(
        {
          k: next,
          x: event.clientX - (event.clientX - state.x) * ratio,
          y: event.clientY - (event.clientY - state.y) * ratio,
        },
        false,
      );
      dismissHint();
    },
    { passive: false },
  );

  function zoomBy(factor: number) {
    const { w, h } = viewport();
    const next = Math.min(MAX_K, Math.max(MIN_K, state.k * factor));
    const ratio = next / state.k;
    setCamera({ k: next, x: w / 2 - (w / 2 - state.x) * ratio, y: h / 2 - (h / 2 - state.y) * ratio }, true);
  }

  document.querySelectorAll<HTMLElement>('[data-zoom]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.zoom;
      if (action === 'in') zoomBy(1.3);
      else if (action === 'out') zoomBy(1 / 1.3);
      else if (action === 'fit') fitBounds(nodeBounds(nodes), true, MIN_K);
      else fitFloor(true);
    });
  });

  /* ── 交互：双击分区聚焦 ── */
  stage.addEventListener('dblclick', (event) => {
    const node = (event.target as Element).closest<SVGGElement>('.map-node');
    if (node?.dataset.category) focusRegion(node.dataset.category);
  });

  /* ── 交互：节点点击与悬停提示 ── */
  let suppressClick = false;
  stage.addEventListener('click', (event) => {
    if (suppressClick) {
      event.preventDefault();
      suppressClick = false;
      return;
    }
    const node = (event.target as Element).closest<SVGGElement>('.map-node');
    if (node?.dataset.node) {
      select(node.dataset.node);
      dismissHint();
    }
  });

  for (const node of nodes) {
    node.el.addEventListener('pointerenter', () => {
      if (!tip || pan) return;
      tip.querySelector('[data-tip-title]')!.textContent = node.title;
      tip.querySelector('[data-tip-meta]')!.textContent = node.date
        ? node.date.replaceAll('-', '.')
        : '';
      const rect = node.el.getBoundingClientRect();
      tip.style.left = `${rect.left + rect.width / 2}px`;
      tip.style.top = `${rect.bottom + 8}px`;
      tip.classList.add('is-visible');
    });
    node.el.addEventListener('pointerleave', () => tip?.classList.remove('is-visible'));
  }

  /* ── 视差已移除 ──
     地图上任何持续变化的元素都会让浏览器每帧重算浮窗的 backdrop-filter，
     整页会明显发卡。让"活"的感觉由浮窗自身的流光承担，成本低得多。 */

  /* ── 交互：键盘 ── */
  stage.addEventListener('keydown', (event) => {
    const step = 90;
    const current = nodes.find((node) => node.id === selectedId);
    const vectors: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    if (vectors[event.key]) {
      event.preventDefault();
      const [dx, dy] = vectors[event.key];
      if (event.shiftKey) {
        setCamera({ ...state, x: state.x - dx * step * 2, y: state.y - dy * step * 2 }, true);
        return;
      }
      if (current) {
        const next = nearest(current, dx, dy);
        if (next) select(next.id);
      } else if (activeNodes()[0]) {
        select(activeNodes()[0].id);
      }
      dismissHint();
      return;
    }
    if (event.key === '+' || event.key === '=') zoomBy(1.25);
    else if (event.key === '-' || event.key === '_') zoomBy(1 / 1.25);
    else if (event.key === '0') fitFloor(true);
  });

  /* ── 外部控件：楼层、筛选、复位 ── */
  document.querySelectorAll<HTMLSelectElement>('[data-floor-select]').forEach((select) => {
    select.addEventListener('change', () => {
      floor = select.value;
      mode = 'floor';
      stage.dataset.mode = 'floor';
      stage.dataset.floor = floor;
      refreshVisibility();
      const target = nodes.find((node) => node.floor === floor && node.category === filter);
      if (target) select(target.id, false);
      fitFloor(true);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-map-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      filter = button.dataset.mapFilter ?? 'all';
      refreshVisibility();
      const target = activeNodes().at(-1);
      if (target) select(target.id, false);
      fitFloor(true);
    });
  });

  document.querySelectorAll<HTMLElement>('.legend-row[data-map-filter]').forEach((row) => {
    row.addEventListener('dblclick', () => {
      const id = row.dataset.mapFilter;
      if (id && id !== 'all') focusRegion(id);
    });
  });

  function dismissHint() {
    if (hintGone) return;
    hintGone = true;
    document.querySelector('[data-map-hint]')?.classList.add('is-gone');
  }
  window.setTimeout(dismissHint, 9000);

  /* ── 初始化 ── */
  refreshVisibility();
  select(selectedId, false);
  fitFloor(false);

  let resizeFrame = 0;
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => apply(false));
    }).observe(stage);
  } else {
    window.addEventListener('resize', () => apply(false));
  }
}

initMap();

export {};
