// windows.ts — 液态玻璃浮窗：拖拽、吸附、位置记忆、窗柜、层级。
import { LAYOUT_STORAGE_KEY } from '../config/map';

interface WindowState {
  x: number;
  y: number;
  collapsed: boolean;
  closed: boolean;
  z: number;
  estimated?: boolean;
}

function initWindows() {
  const shell = document.querySelector<HTMLElement>('[data-map-shell]');
  const layer = document.querySelector<HTMLElement>('[data-window-layer]');
  if (!shell || !layer) return;
  const panes = Array.from(layer.querySelectorAll<HTMLElement>('[data-window]'));
  const guideX = document.querySelector<HTMLElement>('[data-snap-x]');
  const guideY = document.querySelector<HTMLElement>('[data-snap-y]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MARGIN = 22;
  const TOP = 84;
  // 底部留出窗柜与缩放控件的高度，避免默认位互相压住
  const BOTTOM_GAP = 82;
  const SNAP_EDGE = 26;
  const SNAP_PEER = 9;
  const KEEP_VISIBLE = 48;

  let store: Record<string, WindowState> = {};
  let zCounter = 10;
  const cursors: Record<string, number> = {};

  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) store = JSON.parse(raw) as Record<string, WindowState>;
  } catch {
    store = {};
  }

  function persist() {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* ignore */
    }
  }

  function read(win: HTMLElement, key: string): WindowState {
    const spec = {
      collapsed: win.dataset.collapsed === 'true',
      closed: win.dataset.open === 'false',
    };
    const saved = store[key];
    return {
      x: saved?.x ?? Number.NaN,
      y: saved?.y ?? Number.NaN,
      collapsed: saved?.collapsed ?? spec.collapsed,
      closed: saved?.closed ?? spec.closed,
      z: saved?.z ?? 0,
    };
  }

  function place(win: HTMLElement, x: number, y: number) {
    win.style.setProperty('--wx', `${Math.round(x)}px`);
    win.style.setProperty('--wy', `${Math.round(y)}px`);
  }

  function defaultPosition(win: HTMLElement) {
    const w = win.offsetWidth || 260;
    const h = win.offsetHeight || 160;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const side = win.dataset.side ?? 'tl';
    if (side === 'tl' || side === 'tr') {
      const cursor = cursors[side] ?? TOP;
      cursors[side] = cursor + h + 14;
      return { x: side === 'tl' ? MARGIN : vw - w - MARGIN, y: cursor };
    }
    if (side === 'tc') return { x: (vw - w) / 2, y: TOP };
    if (side === 'bc') return { x: (vw - w) / 2, y: vh - h - BOTTOM_GAP };
    return { x: (vw - w) / 2, y: Math.max(TOP, (vh - h) / 2 - 24) };
  }

  function clamp(win: HTMLElement, x: number, y: number) {
    const w = win.offsetWidth || 260;
    const h = win.offsetHeight || 120;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.min(vw - KEEP_VISIBLE, Math.max(KEEP_VISIBLE - w, x)),
      y: Math.min(vh - KEEP_VISIBLE, Math.max(0, y)),
    };
  }

  function bringToFront(win: HTMLElement, key: string) {
    if (win.dataset.chrome === 'true') return;
    zCounter += 1;
    const state = read(win, key);
    store[key] = { ...state, z: zCounter };
    win.style.zIndex = String(zCounter);
  }

  function apply(win: HTMLElement, key: string) {
    const state = read(win, key);
    win.dataset.collapsed = String(state.collapsed);
    win.hidden = state.closed;
    if (Number.isFinite(state.x) && Number.isFinite(state.y)) {
      const fixed = clamp(win, state.x, state.y);
      place(win, fixed.x, fixed.y);
      store[key] = { ...state, x: fixed.x, y: fixed.y };
    } else {
      const spot = defaultPosition(win);
      place(win, spot.x, spot.y);
      // 隐藏中的窗量不到尺寸，其默认位只是估算，打开时需要重算
      store[key] = { ...state, x: spot.x, y: spot.y, estimated: win.offsetWidth === 0 };
    }
    const z = state.z || ++zCounter;
    win.style.zIndex = String(z);
    store[key].z = z;
  }

  /* ── 吸附 ── */
  function showGuides(x: number | null, y: number | null, win: HTMLElement) {
    if (guideX) {
      if (x === null) guideX.hidden = true;
      else {
        guideX.hidden = false;
        guideX.style.left = `${x}px`;
        guideX.style.top = '0';
        guideX.style.height = '100vh';
      }
    }
    if (guideY) {
      if (y === null) guideY.hidden = true;
      else {
        guideY.hidden = false;
        guideY.style.top = `${y}px`;
        guideY.style.left = '0';
        guideY.style.width = '100vw';
      }
    }
    void win;
  }

  function snap(win: HTMLElement, key: string, x: number, y: number) {
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let gx: number | null = null;
    let gy: number | null = null;

    if (Math.abs(x - MARGIN) < SNAP_EDGE) { x = MARGIN; gx = MARGIN; }
    else if (Math.abs(vw - w - x - MARGIN) < SNAP_EDGE) { x = vw - w - MARGIN; gx = vw - MARGIN; }
    if (Math.abs(y - TOP) < SNAP_EDGE) { y = TOP; gy = TOP; }
    else if (Math.abs(vh - h - y - MARGIN) < SNAP_EDGE) { y = vh - h - MARGIN; gy = vh - MARGIN; }

    for (const other of panes) {
      const otherKey = other.dataset.window ?? '';
      if (otherKey === key || other.hidden) continue;
      const ox = Number.parseFloat(other.style.getPropertyValue('--wx'));
      const oy = Number.parseFloat(other.style.getPropertyValue('--wy'));
      if (!Number.isFinite(ox) || !Number.isFinite(oy)) continue;
      const ow = other.offsetWidth;
      const oh = other.offsetHeight;
      const xTargets: [number, number][] = [
        [ox, ox],
        [ox + ow, ox + ow],
        [ox + ow - w, ox + ow],
        [ox + (ow - w) / 2, ox + ow / 2],
      ];
      for (const [candidate, guide] of xTargets) {
        if (Math.abs(x - candidate) < SNAP_PEER) { x = candidate; gx = guide; break; }
      }
      const yTargets: [number, number][] = [
        [oy, oy],
        [oy + oh, oy + oh],
        [oy + oh - h, oy + oh],
        [oy + (oh - h) / 2, oy + oh / 2],
      ];
      for (const [candidate, guide] of yTargets) {
        if (Math.abs(y - candidate) < SNAP_PEER) { y = candidate; gy = guide; break; }
      }
    }
    return { x, y, gx, gy };
  }

  /* ── 拖拽 ── */
  let drag: {
    win: HTMLElement;
    key: string;
    id: number;
    x: number;
    y: number;
    ox: number;
    oy: number;
    free: boolean;
  } | undefined;

  function move(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.ox;
    const dy = event.clientY - drag.oy;
    let x = drag.x + dx;
    let y = drag.y + dy;
    let gx: number | null = null;
    let gy: number | null = null;
    if (!drag.free) {
      ({ x, y, gx, gy } = snap(drag.win, drag.key, x, y));
    }
    place(drag.win, x, y);
    showGuides(gx, gy, drag.win);
  }

  function endDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const { win, key } = drag;
    win.classList.remove('is-dragging');
    win.style.willChange = '';
    if (win.hasPointerCapture(drag.id)) win.releasePointerCapture(drag.id);
    drag = undefined;
    showGuides(null, null, win);
    const x = Number.parseFloat(win.style.getPropertyValue('--wx'));
    const y = Number.parseFloat(win.style.getPropertyValue('--wy'));
    store[key] = { ...read(win, key), x, y };
    persist();
  }

  function open(win: HTMLElement, key: string, animate = true) {
    const before = read(win, key);
    store[key] = { ...before, closed: false };
    win.hidden = false;
    if (!Number.isFinite(before.x) || before.estimated) {
      const spot = defaultPosition(win);
      store[key].x = spot.x;
      store[key].y = spot.y;
      store[key].estimated = false;
    }
    apply(win, key);
    if (animate) {
      win.classList.remove('is-entering');
      void win.offsetWidth;
      win.classList.add('is-entering');
    }
    bringToFront(win, key);
    persist();
    syncDock();
  }

  function close(win: HTMLElement, key: string) {
    store[key] = { ...read(win, key), closed: true };
    apply(win, key);
    persist();
    syncDock();
  }

  function syncDock() {
    document.querySelectorAll<HTMLElement>('[data-dock]').forEach((button) => {
      const key = button.dataset.dock ?? '';
      const win = panes.find((pane) => pane.dataset.window === key);
      const isOpen = Boolean(win && !win.hidden);
      button.setAttribute('aria-pressed', String(isOpen));
    });
  }

  for (const win of panes) {
    const key = win.dataset.window ?? '';
    if (!key) continue;
    apply(win, key);

    // 流光：高光跟着鼠标在玻璃上走。只改自身的 CSS 变量，不触发背景重算。
    if (!reducedMotion.matches) {
      win.addEventListener('pointermove', (event) => {
        const rect = win.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        win.style.setProperty('--sheen-x', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
        win.style.setProperty('--sheen-y', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      });
    }

    if (win.dataset.editable !== 'true') continue;

    win.tabIndex = -1;

    win.addEventListener('pointerdown', (event) => {
      bringToFront(win, key);
      win.focus({ preventScroll: true });
      const target = event.target as Element;
      if (target.closest('button, a, input, select, textarea, .window-button')) return;
      if (event.button !== 0) return;
      drag = {
        win,
        key,
        id: event.pointerId,
        x: Number.parseFloat(win.style.getPropertyValue('--wx')) || 0,
        y: Number.parseFloat(win.style.getPropertyValue('--wy')) || 0,
        ox: event.clientX,
        oy: event.clientY,
        free: event.altKey,
      };
      win.classList.add('is-dragging');
      win.style.willChange = 'transform';
      win.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    win.addEventListener('pointermove', (event) => {
      if (drag && event.altKey !== drag.free) drag.free = event.altKey;
      move(event);
    });
    win.addEventListener('pointerup', endDrag);
    win.addEventListener('pointercancel', endDrag);

    win.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 32 : 8;
      const deltas: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      if (!deltas[event.key]) {
        if (event.key === 'Escape') close(win, key);
        return;
      }
      if (!(event.target === win || event.target === win.querySelector('.window-bar'))) return;
      event.preventDefault();
      const [dx, dy] = deltas[event.key];
      const x = (Number.parseFloat(win.style.getPropertyValue('--wx')) || 0) + dx;
      const y = (Number.parseFloat(win.style.getPropertyValue('--wy')) || 0) + dy;
      place(win, x, y);
      store[key] = { ...read(win, key), x, y };
      persist();
    });

    win.addEventListener('focusout', () => persist());
  }

  document.querySelectorAll<HTMLElement>('[data-window-collapse]').forEach((button) => {
    button.addEventListener('click', () => {
      const win = button.closest<HTMLElement>('[data-window]');
      if (!win) return;
      const key = win.dataset.window ?? '';
      const next = win.dataset.collapsed !== 'true';
      store[key] = { ...read(win, key), collapsed: next };
      win.dataset.collapsed = String(next);
      persist();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-window-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const win = button.closest<HTMLElement>('[data-window]');
      if (win) close(win, win.dataset.window ?? '');
    });
  });

  document.querySelectorAll<HTMLElement>('[data-dock]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.dock ?? '';
      const win = panes.find((pane) => pane.dataset.window === key);
      if (!win) return;
      if (win.hidden) {
        open(win, key);
      } else {
        close(win, key);
      }
    });
  });

  document.querySelector<HTMLElement>('[data-window-reset]')?.addEventListener('click', () => {
    store = {};
    cursors.tl = TOP;
    cursors.tr = TOP;
    for (const win of panes) {
      const key = win.dataset.window ?? '';
      win.style.removeProperty('--wx');
      win.style.removeProperty('--wy');
      win.style.removeProperty('z-index');
      win.dataset.collapsed = 'false';
      win.classList.remove('is-entering');
      // apply 会按 markup 默认的 data-open 重新决定显隐并重算默认位
      apply(win, key);
    }
    persist();
    syncDock();
  });

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      for (const win of panes) {
        const key = win.dataset.window ?? '';
        if (win.hidden) continue;
        const x = Number.parseFloat(win.style.getPropertyValue('--wx'));
        const y = Number.parseFloat(win.style.getPropertyValue('--wy'));
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        const fixed = clamp(win, x, y);
        place(win, fixed.x, fixed.y);
        store[key] = { ...read(win, key), x: fixed.x, y: fixed.y };
      }
    });
  });

  syncDock();
  persist();
  shell.setAttribute('data-ready', '1');
}

initWindows();

export {};
