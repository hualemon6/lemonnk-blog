'use strict';

let posts = [];
let currentSlug = null;
let currentOldSlug = null;
let aboutData = null;
let projects = [];
let currentProjectIndex = null;
let mode = 'posts';
let saveTimer = null;
let saving = false;
let searchQuery = '';
let authoringMode = 'me';
let activeEdition = 'me';
let editionBodies = { me: '', ai: '' };
let newPostMode = 'me';
let newPostFiles = { me: null, ai: null };

const $ = (id) => document.getElementById(id);

async function api(method, path, body) {
  const res = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText);
  }
  return res.json();
}

function slugify(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!item) continue;
    let value = item[2].trim();
    if (value.startsWith('[')) data[item[1]] = value.replace(/^\[|\]$/g, '').split(',').map((tag) => tag.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    else { value = value.replace(/^['"]|['"]$/g, ''); data[item[1]] = value === 'true' ? true : value === 'false' ? false : value; }
  }
  return { data, body: match[2].trim() };
}

function serializeFrontmatter(data, body) {
  const lines = ['---'];
  if (data.title) lines.push(`title: '${String(data.title).replace(/'/g, "\\'")}'`);
  if (data.pubDate) lines.push(`pubDate: ${data.pubDate}`);
  if (data.tags.length) lines.push(`tags: [${data.tags.map((tag) => `'${tag}'`).join(', ')}]`);
  if (data.mode && data.mode !== 'me') lines.push(`mode: ${data.mode}`);
  if (data.draft) lines.push('draft: true');
  return lines.concat(['---', '', body.trim(), '']).join('\n');
}

function readingStats(body) {
  const text = body.replace(/```[\s\S]*?```/g, '');
  const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = text.replace(/[\u4e00-\u9fff]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return { chars: chinese + words, minutes: Math.max(1, Math.round(chinese / 300 + words / 220)) };
}

function setSaveStatus(text, state = '') { $('saveStatus').textContent = text; $('saveStatus').className = `save-status ${state}`.trim(); }
function fmtTime(date) { return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; }

/* 正文 textarea 随内容自动长高（文档式滚动，由外层容器滚动） */
function autoGrow() {
  const el = $('bodyInput');
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

async function checkConn() {
  try { await api('GET', '/api/posts'); $('connDot').className = 'conn-dot ok'; }
  catch { $('connDot').className = 'conn-dot err'; }
}

async function loadPosts() { posts = await api('GET', '/api/posts'); renderList(); }
async function loadProjects() { projects = (await api('GET', '/api/projects')).projects || []; renderProjectList(); }

function esc(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function renderList() {
  const list = $('postList'); list.innerHTML = '';
  const query = searchQuery.trim().toLowerCase();
  const filtered = query ? posts.filter((post) => `${post.title} ${post.slug}`.toLowerCase().includes(query)) : posts;
  if (!filtered.length) { list.innerHTML = `<div class="list-empty">${query ? '没有匹配的文章' : '还没有文章'}</div>`; return; }
  for (const group of [{ label: '草稿', items: filtered.filter((post) => post.draft) }, { label: '已发布', items: filtered.filter((post) => !post.draft) }]) {
    if (!group.items.length) continue;
    const label = document.createElement('div'); label.className = 'group-label'; label.textContent = group.label; list.appendChild(label);
    for (const post of group.items) {
      const item = document.createElement('div'); item.className = `post-item${post.slug === currentSlug ? ' active' : ''}`;
      item.innerHTML = `<div class="t">${esc(post.title)}${post.draft ? '<span class="draft-dot">● 草稿</span>' : ''}</div><div class="m">${post.date || '无日期'}</div>`;
      item.addEventListener('click', () => openPost(post.slug)); list.appendChild(item);
    }
  }
}

function renderProjectList() {
  const list = $('projectList'); list.innerHTML = '';
  if (!projects.length) { list.innerHTML = '<div class="list-empty">还没有项目</div>'; return; }
  projects.forEach((project, index) => {
    const item = document.createElement('div'); item.className = `project-item${index === currentProjectIndex ? ' active' : ''}`;
    const number = String(index + 1).padStart(2, '0');
    item.innerHTML = `<div class="t"><span class="n">${number}</span><span class="name">${esc(project.name || 'Untitled project')}</span></div><div class="m">${esc(project.narrative || 'No narrative yet')}</div>`;
    item.addEventListener('click', () => openProject(index)); list.appendChild(item);
  });
}

async function openPost(slug) {
  await flushSave();
  const post = await api('GET', `/api/posts/${encodeURIComponent(slug)}`);
  currentSlug = currentOldSlug = slug;
  authoringMode = post.data.mode || 'me'; activeEdition = authoringMode === 'ai' ? 'ai' : 'me';
  editionBodies = { me: authoringMode === 'ai' ? '' : post.body, ai: authoringMode === 'ai' ? post.body : (post.aiBody || '') };
  $('titleInput').value = post.data.title || ''; $('bodyInput').value = editionBodies[activeEdition]; $('slugInput').value = slug;
  $('dateInput').value = post.data.pubDate || ''; $('tagsInput').value = Array.isArray(post.data.tags) ? post.data.tags.join(', ') : '';
  const draft = document.querySelector(`input[name="draft"][value="${post.data.draft ? 'true' : 'false'}"]`); if (draft) draft.checked = true;
  updateEditionUI(); $('editorEmpty').style.display = 'none'; enablePostActions(true); updateStats(); renderList(); autoGrow();
}

function prepareNewPost(mode = 'me', files = { me: null, ai: null }) {
  currentSlug = currentOldSlug = null;
  authoringMode = mode; activeEdition = mode === 'ai' ? 'ai' : 'me'; editionBodies = { me: '', ai: '' };
  const initialFile = files[activeEdition] || files.me || files.ai;
  const parsed = initialFile?.parsed || { data: {}, body: '' };
  if (mode === 'ai') editionBodies.ai = parsed.body || ''; else editionBodies.me = files.me?.parsed?.body || '';
  if (mode === 'dual') editionBodies.ai = files.ai?.parsed?.body || '';
  $('titleInput').value = parsed.data.title || initialFile?.title || ''; $('bodyInput').value = editionBodies[activeEdition]; $('slugInput').value = ''; $('dateInput').value = parsed.data.pubDate || new Date().toISOString().slice(0, 10); $('tagsInput').value = Array.isArray(parsed.data.tags) ? parsed.data.tags.join(', ') : '';
  document.querySelector('input[name="draft"][value="true"]').checked = true;
  updateEditionUI(); $('editorEmpty').style.display = 'none'; enablePostActions(true); updateStats(); $('titleInput').focus(); renderList(); autoGrow(); scheduleSave();
}

function openNewPostModal() { newPostMode = 'me'; newPostFiles = { me: null, ai: null }; renderNewPostModal(); $('newPostModal').classList.remove('hidden'); }
function closeNewPostModal() { $('newPostModal').classList.add('hidden'); }
function newModeHint(value) { return value === 'ai' ? 'AI-authored version.' : value === 'dual' ? 'Your original, paired with an AI edition.' : 'Your original writing.'; }
function renderNewPostModal() {
  document.querySelectorAll('[data-new-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.newMode === newPostMode));
  $('newModeHint').textContent = newModeHint(newPostMode);
  const slots = newPostMode === 'dual' ? ['me', 'ai'] : [newPostMode];
  $('newUploads').innerHTML = slots.map((edition) => {
    const file = newPostFiles[edition];
    return `<label class="upload-slot${file ? ' has-file' : ''}" data-upload-edition="${edition}"><strong>${edition.toUpperCase()}</strong><small>${file ? `✓ ${esc(file.name)}` : 'Drop .md or choose a file'}</small><input type="file" accept=".md,text/markdown" data-upload-input="${edition}"></label>`;
  }).join('');
  document.querySelectorAll('[data-upload-input]').forEach((input) => input.addEventListener('change', (event) => loadNewPostFile(input.dataset.uploadInput, event.target.files?.[0])));
  document.querySelectorAll('[data-upload-edition]').forEach((slot) => {
    slot.addEventListener('dragover', (event) => { event.preventDefault(); slot.classList.add('is-dragging'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('is-dragging'));
    slot.addEventListener('drop', (event) => { event.preventDefault(); slot.classList.remove('is-dragging'); loadNewPostFile(slot.dataset.uploadEdition, event.dataTransfer?.files?.[0]); });
  });
}
async function loadNewPostFile(edition, file) {
  if (!file || !/\.md$/i.test(file.name)) return;
  const raw = await file.text(); const parsed = parseFrontmatter(raw);
  newPostFiles[edition] = { name: file.name, title: file.name.replace(/\.md$/i, ''), parsed }; renderNewPostModal();
}
function switchEdition(edition) { if (edition === activeEdition || authoringMode !== 'dual') return; editionBodies[activeEdition] = $('bodyInput').value; activeEdition = edition; $('bodyInput').value = editionBodies[edition]; updateEditionUI(); updateStats(); autoGrow(); }
function updateEditionUI() {
  const dual = authoringMode === 'dual'; $('editorEditions').hidden = !dual;
  document.querySelectorAll('[data-editor-edition]').forEach((button) => button.classList.toggle('is-active', button.dataset.editorEdition === activeEdition));
  const showActions = Boolean(currentSlug); $('versionActions').hidden = !showActions;
  if (!showActions) return;
  const isDual = authoringMode === 'dual'; $('btnAddVersion').hidden = isDual; $('btnRemoveVersion').hidden = !isDual;
  if (!isDual) $('btnAddVersion').textContent = authoringMode === 'ai' ? '+ Add ME version' : '+ Add AI version';
  if (isDual) $('btnRemoveVersion').textContent = `Remove ${activeEdition.toUpperCase()} version`;
}

async function openProject(index) {
  if (index < 0 || index >= projects.length) return;
  await flushSave();
  currentProjectIndex = index;
  const project = projects[index];
  $('projectNameInput').value = project.name || '';
  $('projectUrlInput').value = project.url || '';
  $('projectNarrativeInput').value = project.narrative || '';
  renderProjectList(); updateStats();
}

function newProject() {
  projects.push({ id: '', name: 'Untitled project', narrative: '', url: '' });
  currentProjectIndex = projects.length - 1;
  $('projectNameInput').value = 'Untitled project';
  $('projectUrlInput').value = '';
  $('projectNarrativeInput').value = '';
  renderProjectList(); updateStats(); scheduleSave(); $('projectNameInput').focus();
}

function enablePostActions(on) { $('btnPreview').disabled = !on || mode !== 'posts'; $('btnPublish').disabled = !on || mode !== 'posts'; }
function currentPostData() {
  editionBodies[activeEdition] = $('bodyInput').value;
  const primaryBody = authoringMode === 'ai' ? editionBodies.ai : editionBodies.me;
  return { title: $('titleInput').value.trim(), pubDate: $('dateInput').value, tags: $('tagsInput').value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean), draft: document.querySelector('input[name="draft"]:checked').value === 'true', mode: authoringMode, body: primaryBody, aiBody: editionBodies.ai };
}
function currentAboutData() { return { type: $('aboutTypeInput').value.trim(), major: $('aboutMajorInput').value.trim(), album: $('aboutAlbumInput').value.trim(), avatar: $('aboutAvatarInput').value.trim(), content: $('aboutContentInput').value }; }
function currentProjectData() {
  if (currentProjectIndex === null || !projects[currentProjectIndex]) return null;
  return {
    id: projects[currentProjectIndex].id || '',
    name: $('projectNameInput').value.trim(),
    narrative: $('projectNarrativeInput').value,
    url: $('projectUrlInput').value.trim(),
  };
}

function scheduleSave() { setSaveStatus('正在保存…', 'saving'); clearTimeout(saveTimer); saveTimer = setTimeout(saveCurrent, 800); }
async function flushSave() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; await saveCurrent(); } }
async function saveCurrent() { if (mode === 'about') return saveAbout(); if (mode === 'projects') return saveProjects(); return savePost(); }
async function savePost() {
  if (saving || (!currentOldSlug && !$('slugInput').value.trim() && !$('titleInput').value.trim())) return;
  saving = true; setSaveStatus('正在保存…', 'saving'); const data = currentPostData(); let slug = $('slugInput').value.trim().replace(/\.md$/, '') || slugify(data.title) || 'untitled';
  try { await api('POST', '/api/posts', { slug, oldSlug: currentOldSlug, mode: data.mode, aiContent: data.aiBody, content: serializeFrontmatter(data, data.body) }); const oldSlug = currentOldSlug; currentSlug = currentOldSlug = slug; if (oldSlug !== slug) { $('slugInput').value = slug; await loadPosts(); } updateEditionUI(); setSaveStatus(`已保存 · ${fmtTime(new Date())}`); updateStats(slug); }
  catch (error) { setSaveStatus(`保存失败：${error.message}`, 'error'); }
  finally { saving = false; }
}
async function saveAbout() {
  if (saving) return;
  saving = true; setSaveStatus('正在保存…', 'saving');
  try { aboutData = await api('POST', '/api/about', currentAboutData()).then((result) => result.about); setSaveStatus(`已保存 · ${fmtTime(new Date())}`); updateStats(); }
  catch (error) { setSaveStatus(`保存失败：${error.message}`, 'error'); }
  finally { saving = false; }
}

async function saveProjects() {
  if (saving || currentProjectIndex === null) return;
  const current = currentProjectData(); if (!current) return;
  saving = true; setSaveStatus('正在保存…', 'saving'); projects[currentProjectIndex] = current;
  try {
    projects = (await api('POST', '/api/projects', { projects })).projects || [];
    currentProjectIndex = Math.min(currentProjectIndex, Math.max(0, projects.length - 1));
    setSaveStatus(`已保存 · ${fmtTime(new Date())}`); renderProjectList(); updateStats();
  }
  catch (error) { setSaveStatus(`保存失败：${error.message}`, 'error'); }
  finally { saving = false; }
}

function updateStats(slug) {
  if (mode === 'projects') {
    $('statWords').textContent = `${projects.length} 个项目`; $('statRead').textContent = 'Projects'; $('statFile').textContent = 'src/data/projects.json'; return;
  }
  const body = mode === 'about' ? $('aboutContentInput').value : $('bodyInput').value;
  const { chars, minutes } = readingStats(body); $('statWords').textContent = `${chars} 字`; $('statRead').textContent = `约 ${minutes} 分钟`;
  $('statFile').textContent = mode === 'about' ? 'src/data/about.json' : (currentSlug ? `src/content/posts/${slug || currentSlug}.md` : '');
}
function openDrawer() { if (mode === 'posts') { $('drawer').classList.add('show'); $('drawerBackdrop').classList.add('show'); } }
function closeDrawer() { $('drawer').classList.remove('show'); $('drawerBackdrop').classList.remove('show'); }
function resetEditor() { authoringMode = 'me'; activeEdition = 'me'; editionBodies = { me: '', ai: '' }; $('titleInput').value = ''; $('bodyInput').value = ''; $('slugInput').value = ''; $('dateInput').value = ''; $('tagsInput').value = ''; updateEditionUI(); $('editorEmpty').style.display = 'flex'; enablePostActions(false); updateStats(); autoGrow(); }
async function addVersion() {
  if (!currentSlug || authoringMode === 'dual') return;
  editionBodies[activeEdition] = $('bodyInput').value;
  if (authoringMode === 'me') editionBodies.ai = ''; else editionBodies.me = '';
  const newEdition = authoringMode === 'me' ? 'ai' : 'me'; authoringMode = 'dual'; activeEdition = newEdition;
  $('bodyInput').value = editionBodies[activeEdition]; updateEditionUI(); scheduleSave(); autoGrow();
}
async function removeVersion() {
  if (!currentSlug || authoringMode !== 'dual') return;
  const removed = activeEdition.toUpperCase();
  if (!confirm(`REMOVE ${removed} VERSION?\n\nThe ${removed} Markdown will be removed from this article.`)) return;
  editionBodies[activeEdition] = ''; authoringMode = activeEdition === 'me' ? 'ai' : 'me'; activeEdition = authoringMode;
  $('bodyInput').value = editionBodies[activeEdition]; updateEditionUI(); await savePost(); autoGrow();
}
async function deletePost() { if (!currentSlug || !confirm(`确定删除 ${currentSlug}.md 吗？此操作不可恢复。`)) return; try { await api('DELETE', `/api/posts/${encodeURIComponent(currentSlug)}`); currentSlug = currentOldSlug = null; resetEditor(); await loadPosts(); } catch (error) { alert(`删除失败：${error.message}`); } }

async function moveProject(direction) {
  if (currentProjectIndex === null) return;
  await flushSave();
  const destination = currentProjectIndex + direction;
  if (destination < 0 || destination >= projects.length) return;
  [projects[currentProjectIndex], projects[destination]] = [projects[destination], projects[currentProjectIndex]];
  currentProjectIndex = destination; await saveProjects();
}

async function deleteProject() {
  if (currentProjectIndex === null || !projects[currentProjectIndex]) return;
  const name = projects[currentProjectIndex].name || 'this project';
  if (!confirm(`确定删除项目 “${name}” 吗？此操作不可恢复。`)) return;
  await flushSave(); projects.splice(currentProjectIndex, 1);
  currentProjectIndex = projects.length ? Math.min(currentProjectIndex, projects.length - 1) : null;
  if (currentProjectIndex !== null) {
    const project = projects[currentProjectIndex];
    $('projectNameInput').value = project.name || ''; $('projectUrlInput').value = project.url || ''; $('projectNarrativeInput').value = project.narrative || '';
  } else {
    $('projectNameInput').value = ''; $('projectUrlInput').value = ''; $('projectNarrativeInput').value = '';
  }
  saving = true; setSaveStatus('正在保存…', 'saving');
  try { projects = (await api('POST', '/api/projects', { projects })).projects || []; setSaveStatus(`已保存 · ${fmtTime(new Date())}`); renderProjectList(); updateStats(); }
  catch (error) { setSaveStatus(`保存失败：${error.message}`, 'error'); }
  finally { saving = false; }
}

async function switchMode(nextMode) {
  if (nextMode === mode) return;
  await flushSave(); mode = nextMode; closeDrawer();
  const postsMode = mode === 'posts'; const projectsMode = mode === 'projects'; const aboutMode = mode === 'about';
  $('postSidebar').hidden = !postsMode; $('postEditor').hidden = !postsMode; $('projectSidebar').hidden = !projectsMode; $('projectEditor').hidden = !projectsMode; $('aboutEditor').hidden = !aboutMode;
  $('btnPostsMode').classList.toggle('active', postsMode); $('btnProjectsMode').classList.toggle('active', projectsMode); $('btnAboutMode').classList.toggle('active', aboutMode); enablePostActions(Boolean(currentSlug));
  if (aboutMode) { if (!aboutData) aboutData = await api('GET', '/api/about'); $('aboutTypeInput').value = aboutData.type || ''; $('aboutMajorInput').value = aboutData.major || ''; $('aboutAlbumInput').value = aboutData.album || ''; $('aboutAvatarInput').value = aboutData.avatar || ''; $('aboutContentInput').value = aboutData.content || ''; }
  if (projectsMode) {
    try {
      if (!projects.length) await loadProjects();
      if (projects.length) await openProject(currentProjectIndex === null ? 0 : currentProjectIndex);
      else newProject();
      $('projectEditorHint').textContent = '公开页会将标题与英文叙述作为一整块内容呈现；顺序决定滚动切换的顺序。';
    } catch (error) {
      $('projectEditorHint').textContent = '项目数据无法载入：请关闭旧 Studio 服务后重新启动 start-studio.cmd。';
      setSaveStatus(`项目加载失败：${error.message}`, 'error');
    }
  }
  updateStats();
}

async function openPreview() { if (!currentSlug || mode !== 'posts') return; const modal = $('previewModal'); const frame = $('previewFrame'); const status = $('previewStatus'); modal.classList.remove('hidden'); status.textContent = '正在启动 Astro dev server…'; frame.src = 'about:blank'; try { const result = await api('POST', '/api/preview'); if (!result.ok) { status.textContent = `启动失败：${result.error || '未知错误'}`; return; } status.textContent = '已启动'; frame.src = `${result.url}posts/${currentSlug}/`; } catch (error) { status.textContent = `启动失败：${error.message}`; } }
async function publish() { if (!currentSlug || mode !== 'posts') return; await flushSave(); const modal = $('publishModal'); const log = $('publishLog'); const status = $('publishStatus'); modal.classList.remove('hidden'); log.textContent = ''; status.textContent = '正在构建并发布…'; try { const result = await api('POST', '/api/publish', { message: $('titleInput').value.trim() }); log.textContent = result.logs.map((entry) => entry.s).join(''); status.textContent = result.ok ? '发布完成 ✓' : `发布失败：${result.step}`; status.style.color = result.ok ? 'var(--success)' : 'var(--danger)'; } catch (error) { status.textContent = `发布失败：${error.message}`; status.style.color = 'var(--danger)'; } }

$('search').addEventListener('input', (event) => { searchQuery = event.target.value; renderList(); }); $('btnNew').addEventListener('click', openNewPostModal); $('btnNewProject').addEventListener('click', newProject); $('btnPostsMode').addEventListener('click', () => switchMode('posts')); $('btnProjectsMode').addEventListener('click', () => switchMode('projects')); $('btnAboutMode').addEventListener('click', () => switchMode('about'));
document.querySelectorAll('[data-new-mode]').forEach((button) => button.addEventListener('click', () => { newPostMode = button.dataset.newMode; newPostFiles = { me: null, ai: null }; renderNewPostModal(); }));
document.querySelectorAll('[data-editor-edition]').forEach((button) => button.addEventListener('click', () => switchEdition(button.dataset.editorEdition)));
$('btnCreatePost').addEventListener('click', () => { closeNewPostModal(); prepareNewPost(newPostMode, newPostFiles); }); $('btnCancelNewPost').addEventListener('click', closeNewPostModal); $('btnCloseNewPost').addEventListener('click', closeNewPostModal);
$('btnAddVersion').addEventListener('click', addVersion); $('btnRemoveVersion').addEventListener('click', removeVersion);
['titleInput', 'bodyInput', 'slugInput', 'tagsInput'].forEach((id) => $(id).addEventListener('input', () => { if (id === 'bodyInput') editionBodies[activeEdition] = $('bodyInput').value; scheduleSave(); if (id === 'bodyInput') { updateStats(); autoGrow(); } })); $('dateInput').addEventListener('change', scheduleSave); document.querySelectorAll('input[name="draft"]').forEach((input) => input.addEventListener('change', scheduleSave));
['aboutTypeInput', 'aboutMajorInput', 'aboutAlbumInput', 'aboutAvatarInput', 'aboutContentInput'].forEach((id) => $(id).addEventListener('input', () => { scheduleSave(); if (id === 'aboutContentInput') updateStats(); }));
['projectNameInput', 'projectUrlInput', 'projectNarrativeInput'].forEach((id) => $(id).addEventListener('input', scheduleSave)); $('btnMoveProjectUp').addEventListener('click', () => moveProject(-1)); $('btnMoveProjectDown').addEventListener('click', () => moveProject(1)); $('btnDeleteProject').addEventListener('click', deleteProject);
$('btnSettings').addEventListener('click', openDrawer); $('btnCloseDrawer').addEventListener('click', closeDrawer); $('drawerBackdrop').addEventListener('click', closeDrawer); $('btnDelete').addEventListener('click', deletePost); $('btnPreview').addEventListener('click', openPreview); $('btnClosePreview').addEventListener('click', () => $('previewModal').classList.add('hidden')); $('btnPublish').addEventListener('click', publish); $('btnClosePublish').addEventListener('click', () => $('publishModal').classList.add('hidden'));
document.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); flushSave(); } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n' && mode === 'posts') { event.preventDefault(); openNewPostModal(); } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f' && mode === 'posts') { event.preventDefault(); $('search').focus(); $('search').select(); } else if (event.key === 'Escape') { closeDrawer(); closeNewPostModal(); $('previewModal').classList.add('hidden'); $('publishModal').classList.add('hidden'); } });
window.addEventListener('beforeunload', (event) => { if (saveTimer) { event.preventDefault(); event.returnValue = ''; } });
/* 宽度变化（侧栏收缩/展开、窗口缩放、模式切换）后重算正文高度 */
if (typeof ResizeObserver !== 'undefined') {
  let growTimer = null;
  new ResizeObserver(() => {
    clearTimeout(growTimer);
    growTimer = setTimeout(autoGrow, 200);
  }).observe($('postEditor'));
}

/* ---------- 侧栏收缩 ---------- */
function setSidebarCollapsed(collapsed) {
  document.getElementById('app').classList.toggle('sidebar-collapsed', collapsed);
  try { localStorage.setItem('studio-sidebar-collapsed', collapsed ? '1' : '0'); } catch (e) { /* ignore */ }
  const btn = $('btnToggleSidebar');
  btn.textContent = collapsed ? '▶' : '◀';
  btn.title = collapsed ? '展开侧栏' : '收起侧栏';
  btn.setAttribute('aria-label', collapsed ? '展开侧栏' : '收起侧栏');
}
$('btnToggleSidebar').addEventListener('click', () => {
  setSidebarCollapsed(!document.getElementById('app').classList.contains('sidebar-collapsed'));
});

(async function init() {
  let collapsed = false;
  try { collapsed = localStorage.getItem('studio-sidebar-collapsed') === '1'; } catch (e) { /* ignore */ }
  if (collapsed) setSidebarCollapsed(true);
  await checkConn(); try { await loadPosts(); if (posts.length) await openPost(posts[0].slug); else $('editorEmpty').style.display = 'flex'; } catch (error) { $('editorEmpty').textContent = `无法连接本地服务：${error.message}`; $('editorEmpty').style.display = 'flex'; }
})();
