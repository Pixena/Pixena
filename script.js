const GITHUB_USER = 'Pixena';
const API = 'https://api.github.com';
const REPO_URL = `https://github.com/${GITHUB_USER}`;

const FILE_ICONS = {
  py: 'icons/file-type-python.svg',
  js: 'icons/file-type-js.svg',
  ts: 'icons/file-type-typescript.svg',
  html: 'icons/file-type-html.svg',
  css: 'icons/file-type-css.svg',
  json: 'icons/file-type-json.svg',
  md: 'icons/file-type-markdown.svg',
  vue: 'icons/file-type-vue.svg',
  java: 'icons/file-type-java.svg',
  cpp: 'icons/file-type-cpp.svg',
  c: 'icons/file-type-c.svg',
  go: 'icons/file-type-go.svg',
  php: 'icons/file-type-php.svg',
  sh: 'icons/file-type-shell.svg',
  yml: 'icons/file-type-yaml.svg',
  yaml: 'icons/file-type-yaml.svg',
  lock: 'icons/file-type-lock.svg',
  svg: 'icons/file-type-svg.svg',
  dockerfile: 'icons/file-type-docker.svg',
  node: 'icons/file-type-node.svg',
  txt: 'icons/file.svg',
  eye: 'icons/eye.svg',
  default: 'icons/file.svg',
};
const ICONS = {
  github: 'icons/github.svg',
  star: 'icons/star.svg',
  fork: 'icons/fork.svg',
  code: 'icons/code.svg',
  mail: 'icons/mail.svg',
  telegram: 'icons/telegram.svg',
  folder: 'icons/folder.svg',
  file: 'icons/file.svg',
  download: 'icons/download.svg',
  idea: 'icons/idea.svg',
  eye: 'icons/eye.svg'
};

window.addEventListener('DOMContentLoaded', () => {
  const githubAnim = document.getElementById('github-anim');
  if (githubAnim) {
    githubAnim.innerHTML = `<div class="loader-bg"><svg class="loader-spin" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" stroke="#238636" stroke-width="8" fill="none" opacity="0.2"/><circle cx="60" cy="60" r="54" stroke="#FFD700" stroke-width="8" fill="none" stroke-dasharray="339.292" stroke-dashoffset="169.646"/><image href="icons/github.svg" x="30" y="30" height="60" width="60"/></svg><div class="loader-text">Загрузка Pixena...</div></div>`;
    githubAnim.style.opacity = '1';
    githubAnim.style.pointerEvents = 'all';
    setTimeout(() => {
      githubAnim.style.transition = 'opacity 1.2s cubic-bezier(.68,-0.55,.27,1.55)';
      githubAnim.style.opacity = '0';
      githubAnim.style.pointerEvents = 'none';
      setTimeout(() => {
        githubAnim.style.display = 'none';
      }, 1300);
    }, 1800);
  }
  renderRepos();
  renderAbout();
  renderContacts();
  renderPortfolio();
  route('home');
  document.getElementById('footer-date').textContent = new Date().toLocaleDateString();
});

function showHints() {
  document.getElementById('hints-modal').style.display = 'flex';
}
function closeHints() {
  document.getElementById('hints-modal').style.display = 'none';
}
window.showHints = showHints;
window.closeHints = closeHints;

function zoomAvatar() {
  const avatar = document.getElementById('main-avatar');
  const modal = document.getElementById('avatar-modal');
  document.getElementById('zoomed-avatar').src = avatar.src;
  modal.style.display = 'flex';
}
function closeAvatarModal() {
  document.getElementById('avatar-modal').style.display = 'none';
}
window.zoomAvatar = zoomAvatar;
window.closeAvatarModal = closeAvatarModal;

function route(page) {
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const nav = document.querySelector(`nav a[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const section = document.getElementById(page);
  if (section) {
    section.style.display = '';
    section.scrollIntoView({behavior:'smooth', block:'start'});
  }
  document.querySelectorAll('main > section').forEach(s => s.classList.remove('active-section'));
  if (section) section.classList.add('active-section');
}
window.route = route;

async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Fetch error: ${error.message}`);
    throw error;
  }
}

async function fetchUser() {
  try {
    return await fetchWithTimeout(`${API}/users/${GITHUB_USER}`);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return { login: GITHUB_USER, name: GITHUB_USER, avatar_url: ICONS.github, bio: '', location: '', public_repos: 0, followers: 0, following: 0 };
  }
}

async function fetchRepos() {
  try {
    return await fetchWithTimeout(`${API}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
  } catch (error) {
    console.error('Failed to fetch repos:', error);
    return [];
  }
}

async function fetchRepoFiles(repo, path = '') {
  try {
    return await fetchWithTimeout(`${API}/repos/${GITHUB_USER}/${repo}/contents/${path}`);
  } catch (error) {
    console.error(`Failed to fetch files for ${repo}:`, error);
    return [];
  }
}

async function fetchFileContent(repo, path) {
  try {
    const data = await fetchWithTimeout(`${API}/repos/${GITHUB_USER}/${repo}/contents/${path}`);
    return data.content ? atob(data.content.replace(/\n/g, '')) : '';
  } catch (error) {
    console.error(`Failed to fetch file content for ${path}:`, error);
    return '';
  }
}

let activeRepoCard = null;
async function renderRepos() {
  const list = document.getElementById('repo-list');
  list.innerHTML = '<div style="color:#8b949e">Загрузка...</div>';
  let repos = await fetchRepos();
  if (!Array.isArray(repos)) repos = [];
  list.innerHTML = repos.length ? '' : '<div style="color:#8b949e">Репозитории недоступны</div>';
  for (const repo of repos) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.innerHTML = `
      <div class="repo-title">${repo.name}</div>
      <div class="repo-desc">${repo.description || ''}</div>
      <div class="repo-meta">
        <span class="lang"><span class="lang-dot" style="background:${langColor(repo.language)}"></span>${repo.language || '—'}</span>
        <span><img class="icon" src="${ICONS.star}"/>${repo.stargazers_count}</span>
        <span><img class="icon" src="${ICONS.fork}"/>${repo.forks_count}</span>
      </div>
      <div class="repo-actions">
        <button onclick="window.open('${repo.html_url}','_blank')">Перейти</button>
        <button onclick="downloadRepoZip('${repo.name}')" title="Скачать .zip"><img src="${ICONS.download}" style="width:1.1em;vertical-align:middle;margin-right:0.3em;">.zip</button>
        <button class="files-btn" title="Показать файлы"><img src="${ICONS.folder}" style="width:1.1em;vertical-align:middle;margin-right:0.3em;">Файлы</button>
      </div>
    `;

    const filesBtn = card.querySelector('.files-btn');
    filesBtn.onclick = async (e) => {
      e.stopPropagation();
      const modal = document.createElement('div');
      modal.className = 'viewer-modal';
      modal.innerHTML = `<div class="viewer-content file-viewer-slide"><button class="close-btn" style="position:absolute;top:1.2rem;right:1.2rem;" title="Закрыть">×</button><div class="file-list-modal" style="min-width:260px;min-height:120px;"></div></div>`;
      document.body.appendChild(modal);
      const fileList = modal.querySelector('.file-list-modal');
      fileList.innerHTML = '<span style="color:#8b949e">Загрузка...</span>';
      let files = await fetchRepoFiles(repo.name);
      if (!Array.isArray(files)) files = [];
      fileList.innerHTML = files.length ? '' : '<span style="color:#8b949e">Файлы недоступны</span>';
      for (const file of files) {
        const el = document.createElement('div');
        el.className = 'file-item';
        el.innerHTML = `<img src="${file.type==='dir'?ICONS.folder:getFileIcon(file.name)}" style="width:1em;vertical-align:middle;margin-right:0.5em;">${file.name}
          <button class="preview-btn" title="Предпросмотр">
            <img src="${ICONS.eye}" alt="Предпросмотр">
          </button>`;
        el.querySelector('.preview-btn').onclick = ev => {
          ev.stopPropagation();
          openViewer(repo.name, file.path, file.type);
        };
        el.onclick = ev => {
          if (ev.target.closest('.preview-btn')) return;
          openViewer(repo.name, file.path, file.type);
        };
        fileList.appendChild(el);
      }
      modal.querySelector('.close-btn').onclick = () => modal.remove();
      modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
    };
    list.appendChild(card);
  }
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (FILE_ICONS[ext]) return FILE_ICONS[ext];
  if (filename.toLowerCase() === 'dockerfile') return FILE_ICONS['dockerfile'];
  return FILE_ICONS['default'];
}

async function openViewer(repo, path, type) {
  let content = '';
  let structure = '';
  if (type === 'dir') {
    const files = await fetchRepoFiles(repo, path);
    structure = `<div style="margin-bottom:1em;font-weight:600">${path}/</div>`;
    for (const file of files) {
      structure += `<div class="file-item" style="margin-left:1em" onclick="openViewer('${repo}','${file.path}','${file.type}')"><img src="${file.type==='dir'?ICONS.folder:getFileIcon(file.name)}" style="width:1em;vertical-align:middle;margin-right:0.5em;">${file.name}
      <button class="preview-btn" title="Предпросмотр"><img src="${ICONS.eye}" alt="Предпросмотр"></button>
      </div>`;
    }
  } else {
    content = await fetchFileContent(repo, path);
    structure = `<div style="margin-bottom:1em;font-weight:600">${path}</div>`;
  }
  const modal = document.createElement('div');
  modal.className = 'viewer-modal';
  modal.innerHTML = `<div class="viewer-content file-viewer-slide"><button class="close-btn" onclick="this.closest('.viewer-modal').remove()">×</button><div>${structure}</div>${content?`<pre>${escapeHtml(content)}</pre>`:'<div style="color:#8b949e">Содержимое недоступно</div>'}</div>`;
  document.body.appendChild(modal);
}
window.openViewer = openViewer;

async function downloadRepoZip(repo) {
  window.open(`https://github.com/${GITHUB_USER}/${repo}/archive/refs/heads/master.zip`, '_blank');
}
window.downloadRepoZip = downloadRepoZip;

async function downloadRar() {
  let repos = await fetchRepos();
  if (!Array.isArray(repos) || !repos.length) {
    alert('Нет репозиториев для скачивания!');
    return;
  }
  window.open(`https://download-directory.github.io/?url=https://github.com/${GITHUB_USER}`, '_blank');
}
window.downloadRar = downloadRar;

let githubAvatar = null;
async function renderAbout() {
  const about = document.getElementById('about');
  const aboutAvatar = document.getElementById('about-avatar');
  const mainAvatar = document.getElementById('main-avatar');
  const zoomedAvatar = document.getElementById('zoomed-avatar');

  const user = await fetchUser();
  githubAvatar = user.avatar_url || ICONS.github;
  if (aboutAvatar) aboutAvatar.src = githubAvatar;
  if (mainAvatar) mainAvatar.src = githubAvatar;
  if (zoomedAvatar) zoomedAvatar.src = githubAvatar;

  document.getElementById('about-name').textContent = user.name || user.login || 'Pixena';
  document.getElementById('about-location').textContent = user.location ? `📍 ${user.location}` : '—';
  document.getElementById('about-bio').textContent = user.bio || 'Fullstack Developer, Open Source Enthusiast';
  document.getElementById('about-repos').innerHTML = `Репозиториев: <b>${user.public_repos || 0}</b>`;
  document.getElementById('about-followers').innerHTML = `Подписчиков: <b>${user.followers || 0}</b>`;
  document.getElementById('about-following').innerHTML = `Подписок: <b>${user.following || 0}</b>`;
  let langs = await fetchUserLangs();
  document.getElementById('about-langs').innerHTML = `Топ языки: ${langs || '—'}`;

  document.getElementById('about-skills').innerHTML = `
    <li>Python, TypeScript, JavaScript, HTML, CSS, Bash</li>
    <li>FastAPI, Flask, Django, React, Vue, Tkinter</li>
    <li>UI/UX, Figma, SVG, Git, CI/CD</li>
    <li>REST API, WebSocket, OAuth, Docker</li>
  `;
  document.getElementById('about-interests').innerHTML = `
    <li>Open Source проекты</li>
    <li>Автоматизация и боты</li>
    <li>Дизайн интерфейсов</li>
    <li>Образование и менторство</li>
  `;

  document.getElementById('user-bio').textContent = user.bio || 'Fullstack Developer, Open Source Enthusiast';
  document.getElementById('user-desc').innerHTML = `
    <span style="color:var(--text-secondary);font-size:1.1em;">${user.location ? `📍 ${user.location}<br>` : ''}</span>
    Создаю современные приложения, автоматизирую процессы, делаю мир проще и красивее с помощью кода.<br>
    Люблю Python, TypeScript, UI/UX и open source.
  `;
}

async function fetchUserLangs() {
  let repos = await fetchRepos();
  if (!Array.isArray(repos) || !repos.length) return '—';
  const langCount = {};
  for (const r of repos) {
    if (!r.language) continue;
    langCount[r.language] = (langCount[r.language] || 0) + 1;
  }
  return Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([l, c]) => `${l} <span style='color:#8b949e'>(${c})</span>`)
    .join(', ') || '—';
}

async function renderPortfolio() {
  const list = document.getElementById('portfolio-list');
  list.innerHTML = '<div style="color:#8b949e">Загрузка...</div>';
  let repos = await fetchRepos();
  if (!Array.isArray(repos)) repos = [];
  repos = repos.filter(r => !r.fork && !r.archived);
  repos.sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)));
  list.innerHTML = repos.length ? '' : '<div style="color:#8b949e">Репозитории недоступны</div>';
  for (const repo of repos.slice(0, 12)) {
    const card = document.createElement('div');
    card.className = 'portfolio-card';
    card.innerHTML = `
      <img src="${ICONS.code}" alt="Project" class="portfolio-icon">
      <div>
        <h3>${repo.name}</h3>
        <p>${repo.description || '—'}</p>
        <div style="margin-bottom:0.7em;">
          <span class="lang-dot" style="background:${langColor(repo.language)}"></span>
          <span style="color:var(--text-secondary);margin-right:1em;">${repo.language || '—'}</span>
          <span style="color:var(--accent);margin-right:1em;">★ ${repo.stargazers_count}</span>
          <span style="color:var(--text-secondary);">Обновлено: ${new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
        <a href="${repo.html_url}" target="_blank">GitHub</a>
      </div>
    `;
    list.appendChild(card);
  }
}

function renderContacts() {
  const contacts = [
    {
      icon: ICONS.github,
      title: 'GitHub',
      link: `https://github.com/${GITHUB_USER}`,
      desc: 'Мои проекты, код и open source',
      display: `@${GITHUB_USER}`
    },
    {
      icon: ICONS.telegram,
      title: 'Telegram',
      link: 'https://t.me/pixenadev',
      desc: 'Связь, вопросы, предложения',
      display: '@pixenadev'
    },
    {
      icon: ICONS.mail,
      title: 'Email',
      link: 'mailto:rustem4uz.dev@gmail.com',
      desc: 'Почта для связи и сотрудничества',
      display: 'rustem4uz.dev@gmail.com'
    }
  ];
  const list = document.getElementById('contacts-list');
  list.innerHTML = '';
  for (const c of contacts) {
    const el = document.createElement('div');
    el.className = 'contact-banner';
    el.innerHTML = `
      <div class="contact-icon"><img src="${c.icon}" style="width:2.5em;height:2.5em;"></div>
      <div class="contact-info">
        <div class="contact-title">${c.title}</div>
        <a class="contact-link" href="${c.link}" target="_blank">${c.display}</a>
        <div class="contact-desc">${c.desc}</div>
      </div>
    `;
    list.appendChild(el);
  }
}

function langColor(lang) {
  const colors = {
    Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', C: '#555', "C++": '#f34b7d', Jupyter: '#DA5B0B', Go: '#00ADD8', Java: '#b07219', PHP: '#4F5D95', Ruby: '#701516', Rust: '#dea584', Dart: '#00B4AB', Swift: '#ffac45', Kotlin: '#A97BFF', Vue: '#41b883', SCSS: '#c6538c', Svelte: '#ff3e00', Markdown: '#083fa1', Other: '#8b949e'
  };
  return colors[lang] || '#8b949e';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
}