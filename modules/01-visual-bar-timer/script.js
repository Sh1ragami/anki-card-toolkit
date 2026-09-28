(function() {
  var KEY_END = 'anki_study_session_end';
  var KEY_TOTAL = 'anki_study_session_total';
  var KEY_BAR_MODE = 'anki_bar_mode'; // 'session' or 'card'
  var DEFAULT_MINS = 25;
  var CARD_DURATION_MS = 8000;
  var cardStartTime = Date.now();

  function getBarMode() {
    try { return localStorage.getItem(KEY_BAR_MODE) || 'session'; } catch(e) { return 'session'; }
  }

  function setBarMode(mode) {
    try { localStorage.setItem(KEY_BAR_MODE, mode); } catch(e) {}
    updateBarModeUI();
  }

  function updateBarModeUI() {
    var btn = document.getElementById('hdr-barmode-btn');
    if (btn) {
      var mode = getBarMode();
      btn.textContent = (mode === 'card') ? '📊 表示: ⚡ 1問締め切り (8秒)' : '📊 表示: ⏳ 残り勉強時間 (全体)';
    }
  }

  window.toggleBarMode = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var cur = getBarMode();
    var next = (cur === 'card') ? 'session' : 'card';
    setBarMode(next);
    return false;
  };

  function initSession() {
    var now = Date.now();
    var endTime = parseInt(localStorage.getItem(KEY_END) || '0', 10);
    var totalMs = parseInt(localStorage.getItem(KEY_TOTAL) || '0', 10);

    if (!endTime || now - endTime > 3600000) {
      totalMs = DEFAULT_MINS * 60 * 1000;
      endTime = now + totalMs;
      localStorage.setItem(KEY_END, endTime.toString());
      localStorage.setItem(KEY_TOTAL, totalMs.toString());
    }
    return { endTime: endTime, totalMs: totalMs };
  }

  var session = initSession();

  function formatMinSec(sec) {
    if (sec <= 0) return '00:00';
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  var KEY_HUD_POS = 'anki_hud_position'; // 'bottom', 'top', 'left', 'right'
  var KEY_HUD_THICK = 'anki_hud_thickness'; // 'thin', 'normal', 'thick', 'huge'

  function getHudPosition() {
    try {
      return localStorage.getItem(KEY_HUD_POS) || sessionStorage.getItem(KEY_HUD_POS) || 'bottom';
    } catch(e) {
      return 'bottom';
    }
  }

  function applyHudPosition(pos) {
    var hud = document.getElementById('screen-bottom-hud');
    if (hud) hud.className = 'hud-pos-' + pos;
    document.documentElement.classList.remove('hud-layout-top', 'hud-layout-left', 'hud-layout-right', 'hud-layout-bottom');
    document.documentElement.classList.add('hud-layout-' + pos);
    var positions = ['bottom', 'top', 'left', 'right'];
    positions.forEach(function(p) {
      var btn = document.getElementById('hud-pos-btn-' + p);
      if (btn) {
        if (p === pos) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
  }

  window.setHudPosition = function(pos, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    try { localStorage.setItem(KEY_HUD_POS, pos); } catch(err) {}
    try { sessionStorage.setItem(KEY_HUD_POS, pos); } catch(err) {}
    applyHudPosition(pos);
    tick();
    return false;
  };

  function getHudThickness() {
    try {
      return localStorage.getItem(KEY_HUD_THICK) || sessionStorage.getItem(KEY_HUD_THICK) || 'normal';
    } catch(e) {
      return 'normal';
    }
  }

  function applyHudThickness(thick) {
    var root = document.documentElement;
    root.classList.remove('hud-thick-thin', 'hud-thick-normal', 'hud-thick-thick', 'hud-thick-huge');
    root.classList.add('hud-thick-' + thick);
    var hud = document.getElementById('screen-bottom-hud');
    if (hud) {
      hud.classList.remove('hud-thick-thin', 'hud-thick-normal', 'hud-thick-thick', 'hud-thick-huge');
      hud.classList.add('hud-thick-' + thick);
    }
    var thicknesses = ['thin', 'normal', 'thick', 'huge'];
    thicknesses.forEach(function(t) {
      var btn = document.getElementById('hud-thick-btn-' + t);
      if (btn) {
        if (t === thick) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
  }

  window.setHudThickness = function(thick, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    try { localStorage.setItem(KEY_HUD_THICK, thick); } catch(err) {}
    try { sessionStorage.setItem(KEY_HUD_THICK, thick); } catch(err) {}
    applyHudThickness(thick);
    return false;
  };

  var KEY_HUD_ALERT = 'anki_hud_alert'; // 'on' or 'off'
  var KEY_ALERT_DISMISSED = 'anki_timer_alert_dismissed';
  var dismissedEndTime = 0;

  function getHudAlert() {
    try {
      var val = localStorage.getItem(KEY_HUD_ALERT) || sessionStorage.getItem(KEY_HUD_ALERT);
      return val !== 'off';
    } catch(e) {
      return true;
    }
  }

  function applyHudAlert(enabled) {
    var btnOn = document.getElementById('hud-alert-btn-on');
    var btnOff = document.getElementById('hud-alert-btn-off');
    if (btnOn && btnOff) {
      if (enabled) {
        btnOn.classList.add('active');
        btnOff.classList.remove('active');
      } else {
        btnOn.classList.remove('active');
        btnOff.classList.add('active');
      }
    }
    if (!enabled) {
      hideTimerToast();
      var textEl = document.getElementById('bottom-time-display');
      if (textEl) textEl.classList.remove('timer-finished');
    }
  }

  window.setHudAlert = function(enabled, e) {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }
    var val = enabled ? 'on' : 'off';
    try { localStorage.setItem(KEY_HUD_ALERT, val); } catch(err) {}
    try { sessionStorage.setItem(KEY_HUD_ALERT, val); } catch(err) {}
    applyHudAlert(enabled);
    tick();
    return false;
  };

  var isManuallyDismissed = false;

  function isAlertDismissed() {
    if (isManuallyDismissed) return true;
    if (dismissedEndTime && dismissedEndTime === session.endTime) return true;
    try {
      if (window.__anki_timer_alert_dismissed && window.__anki_timer_alert_dismissed === session.endTime.toString()) return true;
      var dis = localStorage.getItem(KEY_ALERT_DISMISSED) || sessionStorage.getItem(KEY_ALERT_DISMISSED);
      return dis === session.endTime.toString();
    } catch(e) {
      return false;
    }
  }

  function showTimerToast() {
    var toast = document.getElementById('timer-finish-toast');
    if (toast) {
      toast.classList.add('show');
      toast.style.setProperty('display', 'flex', 'important');
    }
  }

  function hideTimerToast() {
    var toast = document.getElementById('timer-finish-toast');
    if (toast) {
      toast.classList.remove('show');
      toast.style.setProperty('display', 'none', 'important');
    }
  }

  window.dismissTimerToast = function(e) {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }
    isManuallyDismissed = true;
    dismissedEndTime = session.endTime;
    try {
      localStorage.setItem(KEY_ALERT_DISMISSED, session.endTime.toString());
      sessionStorage.setItem(KEY_ALERT_DISMISSED, session.endTime.toString());
      window.__anki_timer_alert_dismissed = session.endTime.toString();
    } catch(err) {}
    hideTimerToast();
    return false;
  };

  window.startStudyBreak = function(mins, e) {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }
    window.startStudySession(mins || 5, e);
    window.dismissTimerToast(e);
    return false;
  };

  function bindToastEvents() {
    var closeBtn = document.getElementById('toast-close-btn');
    if (closeBtn) {
      closeBtn.onclick = window.dismissTimerToast;
      closeBtn.ontouchstart = window.dismissTimerToast;
      closeBtn.addEventListener('click', window.dismissTimerToast, true);
      closeBtn.addEventListener('mousedown', window.dismissTimerToast, true);
    }
    var toast = document.getElementById('timer-finish-toast');
    if (toast) {
      toast.addEventListener('click', function(ev) {
        if (ev.target && (ev.target.classList.contains('toast-break-btn') || ev.target.closest('.toast-break-btn'))) return;
        window.dismissTimerToast(ev);
      }, true);
    }
  }

  function setBarProgress(ratio) {
    var bar = document.getElementById('screen-bottom-bar-fill');
    if (!bar) return;
    var clampedRatio = Math.max(0, Math.min(1, ratio));
    var pct = (clampedRatio * 100).toFixed(2);
    var pos = getHudPosition();
    var isVertical = (pos === 'left' || pos === 'right');
    var clip = isVertical ? ('inset(' + (100 - pct) + '% 0 0 0)') : ('inset(0 ' + (100 - pct) + '% 0 0)');
    bar.style.clipPath = clip;
    bar.style.webkitClipPath = clip;
  }

  function tick() {
    var now = Date.now();
    var mode = getBarMode();

    var remainingMs = session.endTime - now;
    var remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    var textEl = document.getElementById('bottom-time-display');
    if (textEl) {
      textEl.textContent = (remainingSec <= 0) ? '00:00' : formatMinSec(remainingSec);
    }

    var isFinished = (session.endTime > 0 && remainingMs <= 0);
    var alertEnabled = getHudAlert();

    if (isFinished && alertEnabled) {
      if (textEl) textEl.classList.add('timer-finished');
      if (!isAlertDismissed()) {
        showTimerToast();
      } else {
        hideTimerToast();
      }
    } else {
      if (textEl) textEl.classList.remove('timer-finished');
      hideTimerToast();
    }

    if (mode === 'card') {
      var elapsed = now - cardStartTime;
      var cardRemaining = Math.max(0, CARD_DURATION_MS - elapsed);
      setBarProgress(cardRemaining / CARD_DURATION_MS);
    } else {
      var sessionRatio = session.totalMs > 0 ? (remainingMs / session.totalMs) : 0;
      setBarProgress(sessionRatio);
    }
  }

  applyHudPosition(getHudPosition());
  applyHudThickness(getHudThickness());
  applyHudAlert(getHudAlert());
  bindToastEvents();
  tick();
  updateBarModeUI();

  function loop() {
    tick();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.toggleSessionMenu = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var menu = document.getElementById('hdr-timer-panel');
    if (!menu) return false;
    updateBarModeUI();
    applyHudPosition(getHudPosition());
    applyHudThickness(getHudThickness());
    applyHudAlert(getHudAlert());
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    return false;
  };

  window.startStudySession = function(mins, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var totalMs = mins * 60 * 1000;
    session.totalMs = totalMs;
    session.endTime = Date.now() + totalMs;
    dismissedEndTime = 0;
    isManuallyDismissed = false;
    try {
      localStorage.setItem(KEY_END, session.endTime.toString());
      localStorage.setItem(KEY_TOTAL, totalMs.toString());
      sessionStorage.setItem(KEY_END, session.endTime.toString());
      sessionStorage.setItem(KEY_TOTAL, totalMs.toString());
      localStorage.removeItem(KEY_ALERT_DISMISSED);
      sessionStorage.removeItem(KEY_ALERT_DISMISSED);
      window.__anki_timer_alert_dismissed = '';
    } catch(err) {}
    hideTimerToast();
    var textEl = document.getElementById('bottom-time-display');
    if (textEl) textEl.classList.remove('timer-finished');
    tick();
    var menu = document.getElementById('hdr-timer-panel');
    if (menu) menu.style.display = 'none';
    return false;
  };

  window.resetStudySession = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    dismissedEndTime = 0;
    isManuallyDismissed = false;
    try {
      localStorage.removeItem(KEY_END);
      localStorage.removeItem(KEY_TOTAL);
      localStorage.removeItem(KEY_ALERT_DISMISSED);
      sessionStorage.removeItem(KEY_END);
      sessionStorage.removeItem(KEY_TOTAL);
      sessionStorage.removeItem(KEY_ALERT_DISMISSED);
      window.__anki_timer_alert_dismissed = '';
    } catch(err) {}
    session = initSession();
    hideTimerToast();
    var textEl = document.getElementById('bottom-time-display');
    if (textEl) textEl.classList.remove('timer-finished');
    tick();
    var menu = document.getElementById('hdr-timer-panel');
    if (menu) menu.style.display = 'none';
    return false;
  };

  document.addEventListener('click', function(e) {
    var timerPanel = document.getElementById('hdr-timer-panel');
    var timeDisplay = document.getElementById('bottom-time-display');
    if (timerPanel && timerPanel.style.display === 'block') {
      if (!timerPanel.contains(e.target) && (!timeDisplay || !timeDisplay.contains(e.target))) {
        timerPanel.style.display = 'none';
      }
    }
  });
})();