(function() {
  function getTheme() {
    try {
      var t = localStorage.getItem('anki_theme_preference');
      if (t) return t;
    } catch(e) {}
    try {
      var st = sessionStorage.getItem('anki_theme_preference');
      if (st) return st;
    } catch(e) {}
    try {
      if (window.__anki_theme_preference) return window.__anki_theme_preference;
    } catch(e) {}
    return 'green';
  }

  function setTheme(theme) {
    try { localStorage.setItem('anki_theme_preference', theme); } catch(e) {}
    try { sessionStorage.setItem('anki_theme_preference', theme); } catch(e) {}
    try { window.__anki_theme_preference = theme; } catch(e) {}
  }

  function applyThemeDisplay(theme) {
    var isDark = (theme === 'dark');
    var root = document.documentElement;
    if (isDark) {
      root.classList.add('theme-dark');
      root.classList.remove('theme-green');
      if (document.body) {
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-green');
      }
    } else {
      root.classList.remove('theme-dark');
      root.classList.add('theme-green');
      if (document.body) {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-green');
      }
    }
    var icon = document.getElementById('hdr-theme-btn');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  }

  applyThemeDisplay(getTheme());

  window.toggleCardTheme = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var cur = getTheme();
    var next = (cur === 'dark') ? 'green' : 'dark';
    setTheme(next);
    applyThemeDisplay(next);
    return false;
  };
})();
