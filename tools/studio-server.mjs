// studio-server.mjs — LemonNK Studio 本地后端（127.0.0.1:4177）
// 只服务本机，固定管理博客根目录下的 src/content/posts 和 public/images。
// 所有 shell 操作只使用固定 allowlist + 参数数组，绝不允许前端传入任意命令。
import { createServer } from 'node:http';
import { readFile, writeFile, readdir, unlink, stat, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = Number(process.env.STUDIO_PORT) || 4177;
const DEV_PORT = 4321;

// 博客根目录 = tools 的上一级（D:\blog）
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const POST_VERSIONS_DIR = path.join(ROOT, 'src', 'content', 'post-versions');
const POST_EDITIONS_FILE = path.join(ROOT, 'src', 'data', 'post-editions.json');
const ABOUT_FILE = path.join(ROOT, 'src', 'data', 'about.json');
const PROJECTS_FILE = path.join(ROOT, 'src', 'data', 'projects.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const STUDIO_DIR = path.join(ROOT, 'studio');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

// 只允许这类文件名（防止路径穿越）
const SLUG_RE = /^[\w\u4e00-\u9fff-]+$/;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 5e6) { reject(new Error('body too large')); req.destroy(); } });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function safeDecode(value) {
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

/* ---------- frontmatter 解析（与前端一致，做轻量提取） ---------- */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!mm) continue;
    let val = mm[2].trim();
    if (val.startsWith('[')) {
      data[mm[1]] = val.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else {
      val = val.replace(/^['"]|['"]$/g, '');
      if (val === 'true') val = true;
      if (val === 'false') val = false;
      data[mm[1]] = val;
    }
  }
  return { data, body: m[2].trim() };
}

async function listPosts() {
  let files = [];
  try {
    files = await readdir(POSTS_DIR);
  } catch (e) {
    await mkdir(POSTS_DIR, { recursive: true });
  }
  const posts = [];
  let configuredEditions = {};
  try { configuredEditions = JSON.parse(await readFile(POST_EDITIONS_FILE, 'utf8')); } catch (error) { /* optional compatibility mapping */ }
  for (const name of files) {
    if (!name.endsWith('.md')) continue;
    try {
      const raw = await readFile(path.join(POSTS_DIR, name), 'utf8');
      const { data } = parseFrontmatter(raw);
      posts.push({
        slug: name.replace(/\.md$/, ''),
        title: data.title || name.replace(/\.md$/, ''),
        date: data.pubDate || '',
        tags: data.tags || [],
        draft: !!data.draft,
        mode: !data.mode || data.mode === 'me' ? (configuredEditions[name.replace(/\.md$/, '')] || 'me') : data.mode,
      });
    } catch (e) { /* 跳过读失败 */ }
  }
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return posts;
}

async function readPost(slug) {
  const file = path.join(POSTS_DIR, slug + '.md');
  const raw = await readFile(file, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  let aiBody = '';
  try { aiBody = await readFile(path.join(POST_VERSIONS_DIR, slug + '.ai.md'), 'utf8'); } catch (error) { /* no AI edition yet */ }
  let configuredMode = 'me';
  try { configuredMode = JSON.parse(await readFile(POST_EDITIONS_FILE, 'utf8'))[slug] || 'me'; } catch (error) { /* optional compatibility mapping */ }
  return { slug, data: { ...data, mode: !data.mode || data.mode === 'me' ? configuredMode : data.mode }, body, aiBody, raw };
}

async function writePost(slug, oldSlug, content, mode = 'me', aiContent = '') {
  if (!SLUG_RE.test(slug)) throw new Error('非法文件名：' + slug);
  const file = path.join(POSTS_DIR, slug + '.md');
  await writeFile(file, content, 'utf8');
  const aiFile = path.join(POST_VERSIONS_DIR, slug + '.ai.md');
  if (mode === 'dual') {
    await mkdir(POST_VERSIONS_DIR, { recursive: true });
    await writeFile(aiFile, aiContent, 'utf8');
  } else {
    await unlink(aiFile).catch(() => {});
  }
  if (oldSlug && oldSlug !== slug) {
    await unlink(path.join(POSTS_DIR, oldSlug + '.md')).catch(() => {});
    await unlink(path.join(POST_VERSIONS_DIR, oldSlug + '.ai.md')).catch(() => {});
  }
}

async function deletePost(slug) {
  await unlink(path.join(POSTS_DIR, slug + '.md'));
  await unlink(path.join(POST_VERSIONS_DIR, slug + '.ai.md')).catch(() => {});
}

const ABOUT_DEFAULTS = {
  type: 'INFJ',
  major: 'NJU IS',
  album: '新地球',
  avatar: '',
  content: '',
};

function cleanAbout(value) {
  const source = value && typeof value === 'object' ? value : {};
  const limits = { type: 80, major: 120, album: 120, avatar: 500, content: 50000 };
  const result = {};
  for (const key of Object.keys(ABOUT_DEFAULTS)) {
    const candidate = typeof source[key] === 'string' ? source[key] : ABOUT_DEFAULTS[key];
    result[key] = candidate.replace(/\0/g, '').slice(0, limits[key]);
  }
  return result;
}

async function readAbout() {
  try {
    return cleanAbout(JSON.parse(await readFile(ABOUT_FILE, 'utf8')));
  } catch (error) {
    return { ...ABOUT_DEFAULTS };
  }
}

async function writeAbout(value) {
  const about = cleanAbout(value);
  await mkdir(path.dirname(ABOUT_FILE), { recursive: true });
  await writeFile(ABOUT_FILE, JSON.stringify(about, null, 2) + '\n', 'utf8');
  return about;
}

const PROJECT_DEFAULTS = {
  id: '',
  name: 'Untitled project',
  narrative: '',
  narrativeZh: '',
  url: '',
};

function cleanProjectUrl(value) {
  const raw = typeof value === 'string' ? value.trim().slice(0, 1000) : '';
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch (error) {
    return '';
  }
}

function cleanProjects(value) {
  if (!Array.isArray(value)) throw new Error('项目数据必须是数组');
  if (value.length > 30) throw new Error('项目数量不能超过 30 个');
  const usedIds = new Set();
  return value.map((item, index) => {
    const source = item && typeof item === 'object' ? item : {};
    const suggestedId = typeof source.id === 'string' ? source.id.trim().toLowerCase() : '';
    const fallbackId = `project-${index + 1}`;
    let id = /^[a-z0-9-]{1,80}$/.test(suggestedId) ? suggestedId : fallbackId;
    let suffix = 2;
    while (usedIds.has(id)) id = `${id.slice(0, 74)}-${suffix++}`;
    usedIds.add(id);
    return {
      id,
      name: (typeof source.name === 'string' ? source.name : PROJECT_DEFAULTS.name).replace(/\0/g, '').trim().slice(0, 120) || PROJECT_DEFAULTS.name,
      narrative: (typeof source.narrative === 'string' ? source.narrative : PROJECT_DEFAULTS.narrative).replace(/\0/g, '').trim().slice(0, 8000),
      narrativeZh: (typeof source.narrativeZh === 'string' ? source.narrativeZh : PROJECT_DEFAULTS.narrativeZh).replace(/\0/g, '').trim().slice(0, 8000),
      url: cleanProjectUrl(source.url),
    };
  });
}

async function readProjects() {
  try {
    return cleanProjects(JSON.parse(await readFile(PROJECTS_FILE, 'utf8')));
  } catch (error) {
    return [];
  }
}

async function writeProjects(value) {
  const projects = cleanProjects(value);
  await mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
  await writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2) + '\n', 'utf8');
  return projects;
}

/* ---------- 固定 allowlist 的子进程执行 ---------- */
function run(cmd, args, cwd, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: !!opts.shell, windowsHide: true });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d.toString(); opts.onLog && opts.onLog('out', d.toString()); });
    child.stderr.on('data', (d) => { err += d.toString(); opts.onLog && opts.onLog('err', d.toString()); });
    child.on('close', (code) => resolve({ code, out, err }));
    child.on('error', (e) => resolve({ code: -1, out, err: String(e.message || e) }));
  });
}

// npm 在 Windows 上是 .cmd，无法直接 spawn；改为用 node 直接执行 npm 的 cli.js（无 shell）
import { existsSync } from 'node:fs';

function findNpmCli() {
  const candidates = [
    path.join(ROOT, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  for (const c of candidates) {
    try {
      if (existsSync(c)) return c;
    } catch (e) { /* 继续找 */ }
  }
  return null;
}

const NPM_CLI = findNpmCli();

function runNpm(args, cwd, opts = {}) {
  if (NPM_CLI) {
    return run(process.execPath, [NPM_CLI, ...args], cwd, opts);
  }
  // 找不到 cli.js 时的兜底（Windows 需 shell 才能启动 npm.cmd）
  const isWin = process.platform === 'win32';
  return run(isWin ? 'npm.cmd' : 'npm', args, cwd, { ...opts, shell: isWin });
}

const ASTRO_CLI = path.join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs');

async function isDevServerReady() {
  try {
    const res = await fetch(`http://127.0.0.1:${DEV_PORT}/`);
    return res.status === 200 || res.status === 404;
  } catch (e) {
    return false;
  }
}

async function startDevServer(timeoutMs = 10000) {
  if (await isDevServerReady()) return { ok: true };
  if (!existsSync(ASTRO_CLI)) return { ok: false, error: '找不到 Astro CLI，请先运行 npm install' };

  let output = '';
  let exited = null;
  const child = spawn(process.execPath, [ASTRO_CLI, 'dev', '--host', HOST, '--port', String(DEV_PORT), '--strictPort'], {
    cwd: ROOT,
    shell: false,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (data) => { output += data.toString(); });
  child.stderr.on('data', (data) => { output += data.toString(); });
  child.on('error', (error) => { exited = { code: -1, error: error.message }; });
  child.on('close', (code) => { exited = { code }; });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isDevServerReady()) {
      child.unref();
      return { ok: true };
    }
    if (exited) {
      const detail = output.trim() || exited.error || `Astro 以退出码 ${exited.code} 结束`;
      return { ok: false, error: detail };
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  child.unref();
  return { ok: false, error: 'Astro 在 10 秒内未就绪，请检查端口 4321 是否被占用' };
}

function baseFromConfig() {
  try {
    const cfg = readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
    const m = cfg.match(/base:\s*['"]([^'"]+)['"]/);
    if (m && m[1]) return m[1].replace(/\/$/, '');
  } catch (e) {}
  return '';
}

const BASE = baseFromConfig();

/* ---------- HTTP 路由 ---------- */
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const p = url.pathname;
  try {
    /* API */
    if (p === '/api/posts' && req.method === 'GET') {
      return json(res, 200, await listPosts());
    }
    if (p === '/api/about' && req.method === 'GET') {
      return json(res, 200, await readAbout());
    }
    if (p === '/api/about' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      return json(res, 200, { ok: true, about: await writeAbout(body) });
    }
    if (p === '/api/projects' && req.method === 'GET') {
      return json(res, 200, { projects: await readProjects() });
    }
    if (p === '/api/projects' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      if (!Array.isArray(body.projects)) return json(res, 400, { error: '项目数据格式不正确' });
      try {
        return json(res, 200, { ok: true, projects: await writeProjects(body.projects) });
      } catch (error) {
        return json(res, 400, { error: String(error.message || error) });
      }
    }
    if (p === '/api/posts' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      if (!body.slug || !SLUG_RE.test(body.slug)) return json(res, 400, { error: '非法文件名' });
      if (typeof body.content !== 'string') return json(res, 400, { error: '缺少内容' });
      const authoringMode = ['me', 'ai', 'dual'].includes(body.mode) ? body.mode : 'me';
      if (typeof body.aiContent !== 'undefined' && typeof body.aiContent !== 'string') return json(res, 400, { error: 'AI 正文格式不正确' });
      await writePost(body.slug, body.oldSlug, body.content, authoringMode, body.aiContent || '');
      return json(res, 200, { ok: true, slug: body.slug });
    }
    const pm = p.match(/^\/api\/posts\/([^/]+)$/);
    if (pm && req.method === 'GET') {
      const slug = safeDecode(pm[1]);
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: '非法文件名' });
      try {
        return json(res, 200, await readPost(slug));
      } catch (e) { return json(res, 404, { error: 'not found' }); }
    }
    if (pm && req.method === 'DELETE') {
      const slug = safeDecode(pm[1]);
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: '非法文件名' });
      try {
        await deletePost(slug);
        return json(res, 200, { ok: true });
      } catch (e) { return json(res, 404, { error: 'not found' }); }
    }
    if (p === '/api/preview' && req.method === 'POST') {
      const result = await startDevServer();
      return json(res, 200, { ...result, url: `http://127.0.0.1:${DEV_PORT}${BASE}/` });
    }
    if (p === '/api/publish' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      const msg = String(body.message || 'post').replace(/[^\w\u4e00-\u9fff-]/g, '').slice(0, 50) || 'post';
      const logs = [];
      const onLog = (k, s) => logs.push({ k, s });
      logs.push({ k: 'out', s: '[1/4] npm run build\n' });
      const build = await runNpm(['run', 'build'], ROOT, { onLog });
      if (build.code !== 0) {
        logs.push({ k: 'err', s: '\n[失败] 构建未通过，已停止发布\n' });
        return json(res, 200, { ok: false, step: 'build', logs });
      }
      logs.push({ k: 'out', s: '\n[2/4] git add .\n' });
      const add = await run('git', ['add', '.'], ROOT, { onLog });
      logs.push({ k: 'out', s: '\n[3/4] git commit\n' });
      const commit = await run('git', ['commit', '-m', 'post: ' + msg], ROOT, { onLog });
      logs.push({ k: 'out', s: '\n[4/4] git push\n' });
      const push = await run('git', ['push'], ROOT, { onLog });
      const ok = push.code === 0;
      logs.push({ k: ok ? 'out' : 'err', s: ok ? '\n[完成] 已推送，GitHub Actions 将自动部署\n' : '\n[失败] 推送失败\n' });
      return json(res, 200, { ok, step: 'push', logs });
    }

    /* 静态文件：只允许 studio/ 目录 */
    if (p === '/' || p === '/studio') {
      res.writeHead(302, { Location: '/studio/' });
      return res.end();
    }
    if (p.startsWith('/studio/')) {
      let rel = p.slice('/studio/'.length) || 'index.html';
      const filePath = path.normalize(path.join(STUDIO_DIR, rel));
      if (!filePath.startsWith(STUDIO_DIR)) {
        res.writeHead(403); return res.end('Forbidden');
      }
      const s = await stat(filePath);
      if (s.isDirectory()) {
        const idx = path.join(filePath, 'index.html');
        const data = await readFile(idx);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      }
      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      return res.end(data);
    }

    json(res, 404, { error: 'not found' });
  } catch (e) {
    if (!res.headersSent) json(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  LemonNK Studio');
  console.log('  ' + 'http://127.0.0.1:' + PORT + '/studio/');
  console.log('  博客根目录: ' + ROOT);
  console.log('  关闭此窗口即停止服务');
  console.log('');
});
