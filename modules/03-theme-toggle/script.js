(function() {
  var darkCss = [
    'html, body, #qa, .card, .card-box { background-color: #000000 !important; color: #e5e5e5 !important; }',
    '.phrase-en, .word-text-overlay, .word-text-plain, .meaning-block, .meaning-item { color: #f2f2f2 !important; }',
    '.phrase-ja { color: #cccccc !important; }',
    '.target-word, .phrase-ja .target-word-ja { color: #ff5555 !important; }',
    '.header-bar, .word-no, .badge-level, .phonetic, .sound-btn { color: #888888 !important; }'
  ].join('\n');

  function getTheme() {
    try { return localStorage.getItem('anki_theme_preference') || 'green'; } catch(e) { return 'green'; }
  }

  function setTheme(theme) {
    try { localStorage.setItem('anki_theme_preference', theme); } catch(e) {}
  }

  function applyThemeDisplay(theme) {
    var isDark = (theme === 'dark');
    var styleTag = document.getElementById('custom-theme-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-theme-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = isDark ? darkCss : '';
    if (isDark) {
      document.body.classList.add('theme-dark');
      document.documentElement.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.documentElement.classList.remove('theme-dark');
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