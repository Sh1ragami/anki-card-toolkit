  window.togglePredictionPanel = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var panel = document.getElementById('hdr-prediction-panel');
    var timerPanel = document.getElementById('hdr-timer-panel');
    var stockPanel = document.getElementById('hdr-stock-panel');
    if (timerPanel) timerPanel.style.display = 'none';
    if (stockPanel) stockPanel.style.display = 'none';
    if (!panel) return false;
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
    } else {
      try { updatePredictionUI(); } catch(err) {}
      panel.style.display = 'block';
    }
    return false;
  };

  window.setForecastMode = function(mode, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    try {
      localStorage.setItem('anki_forecast_mode', mode);
      updatePredictionUI();
    } catch(err) {}
    return false;
  };

  window.setForecastScope = function(scope, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    try {
      localStorage.setItem('anki_forecast_scope', scope);
      updatePredictionUI();
    } catch(err) {}
    return false;
  };

  /* ============================================================
     4. Dual-Mode Study Completion Forecast (Safe & NaN-Proof)
     ============================================================ */
  var CURRENT_PART = "{{Part}}".replace(/<[^>]*>/g, '').trim();
  var KEY_FC_MODE = 'anki_forecast_mode'; // 'today' or 'all_cards'
  var KEY_FC_SCOPE = 'anki_forecast_scope'; // 'all' (default: 27924 cards) or 'part'
  var KEY_FC_TIMES = 'anki_forecast_recent_times';
  var KEY_CARD_LOAD = 'anki_last_card_load_ts';
  var KEY_CARD_DEC = 'anki_last_card_dec_ts';

  var BASELINE_AGAIN_RATE = 0.458;
  var BASELINE_GOOD_SEC = 3.78;
  var BASELINE_AGAIN_SEC = 5.13;
  var BASELINE_FLIP_SEC = 4.40;
  var BASE_MULTIPLIER = 1 / (1 - BASELINE_AGAIN_RATE); // ~1.845
  var BASE_EXPECTED_SEC_PER_CARD = BASELINE_GOOD_SEC + (BASELINE_AGAIN_RATE / (1 - BASELINE_AGAIN_RATE)) * BASELINE_AGAIN_SEC; // ~8.11s

  function toSafeNum(val, defaultVal) {
    if (typeof val === 'number' && !isNaN(val)) return val;
    var n = parseInt(val, 10);
    return (isNaN(n)) ? (defaultVal || 0) : n;
  }

  function formatNum(val) {
    return toSafeNum(val, 0).toLocaleString();
  }

  function getForecastMode() {
    try {
      return localStorage.getItem(KEY_FC_MODE) || 'today';
    } catch(e) {
      return 'today';
    }
  }

  function getForecastScope() {
    try {
      return localStorage.getItem(KEY_FC_SCOPE) || 'all';
    } catch(e) {
      return 'all';
    }
  }

  function getDeckData() {
    var scope = getForecastScope();
    var fData = (typeof window.__ANKI_FORECAST_DATA__ !== 'undefined' && window.__ANKI_FORECAST_DATA__.decks) ? window.__ANKI_FORECAST_DATA__.decks : null;
    var raw = null;

    if (fData) {
      if (scope === 'part' && fData[CURRENT_PART]) {
        raw = fData[CURRENT_PART];
      } else if (fData['all']) {
        raw = fData['all'];
      }
    }

    if (scope === 'part') {
      var pNew = toSafeNum(raw && raw.newCount, 3956);
      var pRev = toSafeNum(raw && raw.revCount, 3205);
      var pLrn = toSafeNum(raw && raw.lrnCount, 57);
      return {
        name: CURRENT_PART,
        newCount: pNew,
        revCount: pRev,
        lrnCount: pLrn,
        todayTotal: (pNew + pRev + pLrn),
        deckRemaining: toSafeNum(raw && raw.deckRemaining, 7218),
        totalCards: toSafeNum(raw && (raw.totalCards || raw.total), 7613)
      };
    }

    // Default 'all'
    var aNew = toSafeNum(raw && raw.newCount, 6766);
    var aRev = toSafeNum(raw && raw.revCount, 3231);
    var aLrn = toSafeNum(raw && raw.lrnCount, 57);
    return {
      name: '究極の英単語 (全Part)',
      newCount: aNew,
      revCount: aRev,
      lrnCount: aLrn,
      todayTotal: (aNew + aRev + aLrn),
      deckRemaining: toSafeNum(raw && raw.deckRemaining, 27525),
      totalCards: toSafeNum(raw && (raw.totalCards || raw.total), 27924)
    };
  }

  function getCurrentDueCount() {
    var mode = getForecastMode();
    var data = getDeckData();

    var base = (mode === 'all_cards') ? data.deckRemaining : data.todayTotal;
    var baseNum = toSafeNum(base, (mode === 'all_cards') ? 27525 : 10054);

    var sessionKey = 'anki_session_reviewed_cards';
    var reviewed = 0;
    try {
      reviewed = toSafeNum(localStorage.getItem(sessionKey), 0);
    } catch(e) {}

    return Math.max(0, baseNum - reviewed);
  }

  function recordCardPacing() {
    var now = Date.now();
    var lastLoad = 0;
    try {
      lastLoad = toSafeNum(localStorage.getItem(KEY_CARD_LOAD), 0);
      localStorage.setItem(KEY_CARD_LOAD, now.toString());
    } catch(e) {}

    if (lastLoad > 0) {
      var diffSec = (now - lastLoad) / 1000;
      if (diffSec >= 0.8 && diffSec <= 45) {
        var times = [];
        try {
          var raw = JSON.parse(localStorage.getItem(KEY_FC_TIMES) || '[]');
          if (Array.isArray(raw)) times = raw;
        } catch(e) {}
        times.push(diffSec);
        if (times.length > 25) times.shift();
        try {
          localStorage.setItem(KEY_FC_TIMES, JSON.stringify(times));
        } catch(e) {}
      }
    }

    var lastDec = 0;
    try {
      lastDec = toSafeNum(localStorage.getItem(KEY_CARD_DEC), 0);
      if (now - lastDec > 800) {
        var sessionKey = 'anki_session_reviewed_cards';
        var reviewed = toSafeNum(localStorage.getItem(sessionKey), 0);
        localStorage.setItem(sessionKey, (reviewed + 1).toString());
        localStorage.setItem(KEY_CARD_DEC, now.toString());
      }
    } catch(e) {}
  }

  function getEffectivePace() {
    var times = [];
    try {
      var raw = JSON.parse(localStorage.getItem(KEY_FC_TIMES) || '[]');
      if (Array.isArray(raw)) {
        for (var k = 0; k < raw.length; k++) {
          var t = parseFloat(raw[k]);
          if (!isNaN(t) && t >= 0.5 && t <= 60) times.push(t);
        }
      }
    } catch(e) {}

    var paceSecPerCard = BASE_EXPECTED_SEC_PER_CARD;
    var avgFlipSec = BASELINE_FLIP_SEC;

    if (times.length >= 3) {
      var sum = 0;
      for (var i = 0; i < times.length; i++) sum += times[i];
      var calcAvg = sum / times.length;
      if (!isNaN(calcAvg) && calcAvg > 0) {
        avgFlipSec = calcAvg;
        var ratio = avgFlipSec / BASELINE_FLIP_SEC;
        ratio = Math.max(0.5, Math.min(2.0, ratio));
        paceSecPerCard = BASE_EXPECTED_SEC_PER_CARD * (0.7 * ratio + 0.3);
      }
    }

    if (isNaN(paceSecPerCard) || paceSecPerCard <= 0) paceSecPerCard = BASE_EXPECTED_SEC_PER_CARD;
    if (isNaN(avgFlipSec) || avgFlipSec <= 0) avgFlipSec = BASELINE_FLIP_SEC;

    return {
      paceSecPerCard: paceSecPerCard,
      avgFlipSec: avgFlipSec,
      multiplier: BASE_MULTIPLIER
    };
  }

  function formatDuration(totalSec) {
    if (isNaN(totalSec) || totalSec <= 0) return '0分';
    var totalMin = Math.ceil(totalSec / 60);
    if (isNaN(totalMin) || totalMin <= 0) return '0分';
    if (totalMin < 60) {
      return '約' + totalMin + '分';
    }
    var totalH = totalSec / 3600;
    if (totalH >= 10) {
      return '約' + totalH.toFixed(1) + '時間';
    }
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    return '約' + h + '時間' + (m > 0 ? m + '分' : '');
  }

  function formatFinishClock(finishDate) {
    if (!finishDate || isNaN(finishDate.getTime())) return '--:--';
    var now = new Date();
    var diffDays = Math.floor((finishDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    var hh = finishDate.getHours();
    var mm = finishDate.getMinutes();
    var hhStr = (hh < 10 ? '0' : '') + hh;
    var mmStr = (mm < 10 ? '0' : '') + mm;

    if (diffDays === 0 && finishDate.getDate() === now.getDate()) {
      return hhStr + ':' + mmStr;
    } else if (diffDays <= 1) {
      return '明日 ' + hhStr + ':' + mmStr;
    } else {
      return '+' + diffDays + '日後';
    }
  }

  function updatePredictionUI() {
    try {
      var dispEl = document.getElementById('bottom-prediction-display');
      if (!dispEl) return;

      var mode = getForecastMode();
      var scope = getForecastScope();
      var data = getDeckData();
      var due = getCurrentDueCount();

      // Mode tab buttons
      var tabToday = document.getElementById('fc-tab-today');
      var tabDeck = document.getElementById('fc-tab-deck');
      if (tabToday) {
        if (mode === 'today') tabToday.classList.add('active');
        else tabToday.classList.remove('active');
      }
      if (tabDeck) {
        if (mode === 'all_cards') tabDeck.classList.add('active');
        else tabDeck.classList.remove('active');
      }

      // Scope buttons
      var scAll = document.getElementById('fc-scope-all');
      var scPart = document.getElementById('fc-scope-part');
      if (scAll) {
        if (scope === 'all') scAll.classList.add('active');
        else scAll.classList.remove('active');
      }
      if (scPart) {
        if (scope === 'part') scPart.classList.add('active');
        else scPart.classList.remove('active');
      }

      var modePrefix = (mode === 'all_cards') ? '全完走' : '本日';
      var scopeTag = (scope === 'part') ? ' [Part] ' : ' ';

      if (due === 0) {
        dispEl.textContent = '🏁 ' + (mode === 'all_cards' ? '全カード完了!' : '本日分完了!');
        return;
      }

      var paceInfo = getEffectivePace();
      var actualReviews = Math.round(due * paceInfo.multiplier);
      var totalSec = Math.round(due * paceInfo.paceSecPerCard);
      var durationStr = formatDuration(totalSec);
      var finishDate = new Date(Date.now() + totalSec * 1000);
      var clockStr = formatFinishClock(finishDate);

      // Left Bottom Display
      dispEl.textContent = '🏁 ' + modePrefix + '予測:' + scopeTag + durationStr + ' (残' + formatNum(due) + '枚)';

      // Detail Panel elements
      var fFinish = document.getElementById('fc-finish-time');
      var fRemain = document.getElementById('fc-remain-time');
      var fDue = document.getElementById('fc-due-cards');
      var fActual = document.getElementById('fc-actual-reviews');
      var fPace = document.getElementById('fc-pace');
      var fBreakdown = document.getElementById('fc-breakdown');

      if (fFinish) fFinish.textContent = clockStr;
      if (fRemain) fRemain.textContent = durationStr;
      if (fDue) fDue.textContent = formatNum(due) + '枚';
      if (fActual) fActual.textContent = '約' + formatNum(actualReviews) + '回';
      if (fPace) fPace.textContent = paceInfo.avgFlipSec.toFixed(1) + '秒/問';

      if (fBreakdown) {
        if (mode === 'today') {
          fBreakdown.textContent = '本日内訳: 新規' + formatNum(data.newCount) + '枚 / 復習' + formatNum(data.revCount) + '枚' + (data.lrnCount ? ' / 習得中' + data.lrnCount + '枚' : '');
        } else {
          fBreakdown.textContent = '要学習残: ' + formatNum(due) + '枚 (新規未着手・期日分 / 総計' + formatNum(data.totalCards) + '枚中)';
        }
      }
    } catch(err) {}
  }

  window.resetSessionReviewed = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    try {
      localStorage.removeItem('anki_session_reviewed_cards');
      updatePredictionUI();
    } catch(err) {}
    return false;
  };

  recordCardPacing();
  updatePredictionUI();
