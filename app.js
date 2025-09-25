const gamesUrl = 'games.json';
const teachersUrl = 'teachers.json';

const state = {
  games: [],
  prefs: {}
};

function applyThemeFromPrefs(p) {
  if (!p) return;
  if (p.primary) document.documentElement.style.setProperty('--primary', p.primary);
  if (p.accent) document.documentElement.style.setProperty('--accent', p.accent);
  if (p.bg) document.documentElement.style.setProperty('--bg', p.bg);
  if (p.panel) document.documentElement.style.setProperty('--panel', p.panel);
  if (p.text) document.documentElement.style.setProperty('--text', p.text);
  if (p.iframeHeight) document.documentElement.style.setProperty('--iframe-height', p.iframeHeight + 'px');
}

function loadGames() {
  return fetch(gamesUrl).then(r => r.json()).then(list => {
    state.games = list;
    return list;
  });
}

function buildGameCard(g){
  const card = document.createElement('div');
  card.className = 'game-card';
  const t = document.createElement('div');
  t.className = 'game-title';
  t.textContent = g.title;
  const meta = document.createElement('div');
  meta.className = 'game-meta';
  meta.textContent = g.category || '';
  const desc = document.createElement('div');
  desc.textContent = g.description || '';
  const actions = document.createElement('div');
  actions.className = 'game-actions';
  const play = document.createElement('button');
  play.className = 'btn btn-primary';
  play.textContent = 'Open';
  play.onclick = () => openGame(g);
  const info = document.createElement('button');
  info.className = 'btn btn-ghost';
  info.textContent = 'Info';
  info.onclick = () => alert(g.description || 'No description');
  actions.append(play, info);
  card.append(t, meta, desc, actions);
  return card;
}

function renderLibrary(container, list) {
  container.innerHTML = '';
  list.forEach(g => container.appendChild(buildGameCard(g)));
}

function openGame(g) {
  const url = new URL(window.location.href);
  if (window.location.pathname.endsWith('games.html')) {
    document.getElementById('gameTitle').textContent = g.title;
    const frame = document.getElementById('gameFrame');
    frame.src = g.src;
  } else {
    window.location.href = `games.html#play:${encodeURIComponent(g.id)}`;
  }
}

function initIndex() {
  const gamesContainer = document.getElementById('gamesContainer');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const layoutSelect = document.getElementById('layoutSelect');
  const themeSelect = document.getElementById('themeSelect');

  loadGames().then(list => {
    const cats = Array.from(new Set(list.map(g => g.category).filter(Boolean))).sort();
    cats.forEach(c => {
      const o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      categoryFilter.appendChild(o);
    });
    renderLibrary(gamesContainer, list);
  });

  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = state.games.filter(g => (g.title + ' ' + (g.category||'') + ' ' + (g.description||'')).toLowerCase().includes(q));
    renderLibrary(gamesContainer, filtered);
  });

  categoryFilter.addEventListener('change', e => {
    const v = e.target.value;
    const filtered = state.games.filter(g => !v || g.category === v);
    renderLibrary(gamesContainer, filtered);
  });

  layoutSelect.addEventListener('change', e => {
    document.getElementById('gamesContainer').className = e.target.value === 'list' ? 'games-grid list' : 'games-grid';
  });

  themeSelect.addEventListener('change', e => {
    const v = e.target.value;
    if (v === 'classic') {
      applyThemeFromPrefs({primary:'#0b3b5e',accent:'#2a6f97',bg:'#f4f8fb',panel:'#ffffff',text:'#12232f'});
    } else if (v === 'muted') {
      applyThemeFromPrefs({primary:'#4b5563',accent:'#6b7280',bg:'#f5f6f7',panel:'#ffffff',text:'#222831'});
    } else if (v === 'highcontrast') {
      applyThemeFromPrefs({primary:'#000000',accent:'#ffbe00',bg:'#ffffff',panel:'#000000',text:'#000000'});
    } else {
      applyThemeFromPrefs(JSON.parse(localStorage.getItem('pl_prefs') || '{}'));
    }
  });

  const primaryColor = document.getElementById('primaryColor');
  const accentColor = document.getElementById('accentColor');
  const iframeHeight = document.getElementById('iframeHeight');
  document.getElementById('savePrefs').addEventListener('click', () => {
    const p = {primary:primaryColor.value,accent:accentColor.value,iframeHeight:iframeHeight.value};
    localStorage.setItem('pl_prefs', JSON.stringify(p));
    applyThemeFromPrefs(p);
    alert('Preferences saved (local demo).');
  });
  document.getElementById('resetPrefs').addEventListener('click', () => {
    localStorage.removeItem('pl_prefs');
    location.reload();
  });

  const saved = JSON.parse(localStorage.getItem('pl_prefs') || '{}');
  if (saved.primary) primaryColor.value = saved.primary;
  if (saved.accent) accentColor.value = saved.accent;
  if (saved.iframeHeight) iframeHeight.value = saved.iframeHeight;
  applyThemeFromPrefs(saved);
}

function initGamesPage() {
  const libraryPanel = document.getElementById('libraryPanel');
  const openLibrary = document.getElementById('openLibrary');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const scaleRange = document.getElementById('scaleRange');
  const frame = document.getElementById('gameFrame');

  loadGames().then(() => {
    renderLibrary(libraryPanel, state.games);
    const hash = location.hash;
    if (hash.startsWith('#play:')) {
      const id = decodeURIComponent(hash.slice(6));
      const g = state.games.find(x => x.id === id);
      if (g) openGame(g);
    }
  });

  openLibrary.addEventListener('click', () => {
    document.querySelector('.library-panel').classList.toggle('hidden');
  });

  fullscreenBtn.addEventListener('click', () => {
    const f = document.getElementById('gameFrame');
    if (f.requestFullscreen) f.requestFullscreen();
    else if (f.webkitRequestFullscreen) f.webkitRequestFullscreen();
  });

  scaleRange.addEventListener('input', e => {
    frame.style.transform = `scale(${e.target.value})`;
    frame.style.transformOrigin = 'top left';
  });

  const saved = JSON.parse(localStorage.getItem('pl_prefs') || '{}');
  if (saved.iframeHeight) document.documentElement.style.setProperty('--iframe-height', saved.iframeHeight + 'px');
}

function initAdmin() {
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');
  const loginSection = document.getElementById('loginSection');
  const panelSection = document.getElementById('panelSection');
  const welcome = document.getElementById('welcomeTeacher');
  const logoutBtn = document.getElementById('logoutBtn');
  const featuredList = document.getElementById('featuredList');

  let currentTeacher = null;

  function showPanelFor(teacher) {
    currentTeacher = teacher;
    welcome.textContent = `Welcome, ${teacher.displayName || teacher.username}`;
    loginSection.classList.add('hidden');
    panelSection.classList.remove('hidden');
    renderFeatured();
  }

  fetch(teachersUrl).then(r => r.json()).then(teachers => {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const u = document.getElementById('user').value;
      const p = document.getElementById('pass').value;
      const match = teachers.find(t => t.username === u && t.password === p);
      if (match) {
        showPanelFor(match);
      } else {
        loginMsg.textContent = 'Invalid credentials (demo file).';
      }
    });
  });

  function renderFeatured() {
    featuredList.innerHTML = '';
    state.games.forEach(g => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.marginBottom = '8px';
      const left = document.createElement('div');
      left.textContent = g.title;
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!g.featured;
      cb.onchange = () => {
        g.featured = cb.checked;
        localStorage.setItem('pl_games', JSON.stringify(state.games));
        alert('Featured updated (demo).');
      };
      div.append(left, cb);
      featuredList.appendChild(div);
    });
  }

  document.getElementById('applyTheme').addEventListener('click', () => {
    const p = {primary:document.getElementById('adminPrimary').value, accent:document.getElementById('adminAccent').value};
    localStorage.setItem('pl_prefs', JSON.stringify(p));
    applyThemeFromPrefs(p);
    alert('Theme applied (saved to local demo prefs).');
  });

  document.getElementById('addGame').addEventListener('click', () => {
    const nTitle = document.getElementById('newTitle').value.trim();
    const nSrc = document.getElementById('newSrc').value.trim();
    const nCat = document.getElementById('newCategory').value.trim();
    if (!nTitle || !nSrc) return alert('Title and Src required');
    const newGame = {id: 'g' + (Date.now()), title: nTitle, src: nSrc, category: nCat};
    state.games.push(newGame);
    localStorage.setItem('pl_games', JSON.stringify(state.games));
    renderFeatured();
    alert('Game added (demo; not written to server).');
  });

  logoutBtn.addEventListener('click', () => {
    currentTeacher = null;
    loginSection.classList.remove('hidden');
    panelSection.classList.add('hidden');
    document.getElementById('user').value = '';
    document.getElementById('pass').value = '';
  });

  loadGames().then(() => {
    const saved = JSON.parse(localStorage.getItem('pl_prefs') || '{}');
    if (saved.primary) document.getElementById('adminPrimary').value = saved.primary;
    if (saved.accent) document.getElementById('adminAccent').value = saved.accent;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.endsWith('index.html') || path.endsWith('/')) initIndex();
  if (path.endsWith('games.html')) initGamesPage();
  if (path.endsWith('admin.html')) initAdmin();
});
