(function() {
  var CURRENT_WORD_NO = "{{Word_No}}".trim();
  var CURRENT_WORD = "{{Word}}".replace(/<[^>]*>/g, '').trim();
  var KEY_POCKET = 'anki_pocket_list';

  function getStockList() {
    try { return JSON.parse(localStorage.getItem(KEY_POCKET) || '[]'); } catch(e) { return []; }
  }

  function setStockList(list) {
    try { localStorage.setItem(KEY_POCKET, JSON.stringify(list)); } catch(e) {}
  }

  window.handleClipClick = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var itemStr = CURRENT_WORD_NO + ' ' + CURRENT_WORD;
    var list = getStockList();
    var btn = document.getElementById('hdr-clip-btn');

    var now = Date.now();
    var lastTime = parseInt(sessionStorage.getItem('anki_clip_time') || '0', 10);
    var lastWord = sessionStorage.getItem('anki_clip_word') || '';

    // Prevent double click within 10 seconds for the EXACT same string, 
    // but allow saving if it's the same word on a different card seen later.
    if (itemStr === lastWord && (now - lastTime) < 10000) {
      window.toggleStockPanel(e);
      return false;
    }

    list.push(itemStr);
    setStockList(list);
    try {
      sessionStorage.setItem('anki_clip_time', now.toString());
      sessionStorage.setItem('anki_clip_word', itemStr);
    } catch(err) {}

    if (btn) {
      btn.textContent = '✅';
      setTimeout(function() { btn.textContent = '📎'; }, 800);
    }
    return false;
  };

  window.toggleStockPanel = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var panel = document.getElementById('hdr-stock-panel');
    if (!panel) return false;
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
    } else {
      renderStockPanel();
      panel.style.display = 'block';
    }
    return false;
  };

  function renderStockPanel() {
    var ul = document.getElementById('hdr-stock-ul');
    if (!ul) return;
    var list = getStockList();
    if (list.length === 0) {
      ul.innerHTML = '<li class="stock-empty">保存された単語はありません</li>';
      return;
    }
    ul.innerHTML = list.map(function(item, idx) {
      return '<li class="stock-item">' +
        '<span>' + item + '</span>' +
        '<button type="button" class="stock-item-del" onclick="window.deleteStockItem(event, ' + idx + ')">×</button>' +
      '</li>';
    }).join('');
  }

  window.deleteStockItem = function(e, idx) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var list = getStockList();
    if (idx >= 0 && idx < list.length) {
      list.splice(idx, 1);
      setStockList(list);
      renderStockPanel();
    }
    return false;
  };

  window.clearStockList = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (confirm('保存した単語リストをすべて削除しますか？')) {
      setStockList([]);
      renderStockPanel();
    }
    return false;
  };

  window.copyStockList = function(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    var list = getStockList();
    if (list.length === 0) return false;
    var text = list.join('\n');
    var btn = document.getElementById('hdr-copy-btn');

    var successCb = function() {
      if (btn) btn.textContent = 'COPIED!';
      setTimeout(function() { if (btn) btn.textContent = '📋 COPY'; }, 1000);
    };
    var failCb = function() {
      if (btn) btn.textContent = 'FAIL';
      setTimeout(function() { if (btn) btn.textContent = '📋 COPY'; }, 1000);
    };

    var fallbackCopy = function() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.width = '2em';
      ta.style.height = '2em';
      ta.style.padding = '0';
      ta.style.border = 'none';
      ta.style.outline = 'none';
      ta.style.boxShadow = 'none';
      ta.style.background = 'transparent';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { ta.setSelectionRange(0, 99999); } catch(err) {}
      try {
        var successful = document.execCommand('copy');
        if (successful) successCb();
        else failCb();
      } catch (err) {
        failCb();
      }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(successCb).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    return false;
  };
})();
