(() => {
  const root = document.documentElement;
  const card = document.getElementById('card');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const THEME_COLORS = { green: '#06110b', light: '#ececec' };

  /* ---------- theme ---------- */
  const setTheme = (t) => {
    root.dataset.theme = t;
    themeMeta.content = THEME_COLORS[t];
    try { localStorage.setItem('bio-theme', t); } catch {}
  };
  try {
    const saved = localStorage.getItem('bio-theme');
    if (saved in THEME_COLORS) setTheme(saved);
  } catch {}
  document.getElementById('themeToggle').addEventListener('click', () => {
    setTheme(root.dataset.theme === 'green' ? 'light' : 'green');
  });

  /* ---------- fit into the viewport: never scroll ---------- */
  const fit = () => {
    card.style.setProperty('--s', 1);
    const pad = 20;
    const s = Math.min(
      1,
      (window.innerHeight - pad) / card.offsetHeight,
      (window.innerWidth - pad) / card.offsetWidth
    );
    card.style.setProperty('--s', s.toFixed(4));
  };
  fit();
  addEventListener('resize', fit);
  addEventListener('orientationchange', fit);
  document.fonts?.ready.then(fit);

  /* ---------- mesh parallax ---------- */
  if (matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', (e) => {
      card.style.setProperty('--px', (e.clientX / innerWidth - .5).toFixed(3));
      card.style.setProperty('--py', (e.clientY / innerHeight - .5).toFixed(3));
    });
  }

  /* ---------- copy link ---------- */
  const toast = document.getElementById('toast');
  const shareBtn = document.getElementById('shareBtn');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  shareBtn.addEventListener('click', async () => {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: url });
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
    shareBtn.classList.remove('done');
    void shareBtn.offsetWidth;
    shareBtn.classList.add('done');
    showToast('Ссылка скопирована');
  });

  /* ---------- live GitHub stats (falls back to the static numbers) ---------- */
  const countUp = (el, to) => {
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 900, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const setStat = (id, value) => {
    const el = document.getElementById(id);
    if (el && Number.isFinite(value)) countUp(el, value);
  };

  const USER = 'pxdxx';
  Promise.all([
    fetch(`https://api.github.com/users/${USER}`).then((r) => r.ok ? r.json() : Promise.reject()),
    fetch(`https://api.github.com/users/${USER}/repos?per_page=100`).then((r) => r.ok ? r.json() : Promise.reject()),
  ]).then(([user, repos]) => {
    setStat('statRepos', user.public_repos);
    setStat('statFollowers', user.followers);
    setStat('statStars', repos.reduce((sum, r) => sum + r.stargazers_count, 0));
  }).catch(() => {});
})();
