(function() {
  function formatMeaning() {
    var blocks = document.querySelectorAll('.meaning-block');
    blocks.forEach(function(block) {
      var items = block.querySelectorAll('.meaning-item');
      if (items.length === 0) {
        items = [block];
      }
      items.forEach(function(item) {
        if (item.textContent.indexOf('＝') !== -1 && !item.querySelector('.equal-sub')) {
          var posEl = item.querySelector('.pos-tag');
          var posHtml = posEl ? posEl.outerHTML : '';
          
          var clone = item.cloneNode(true);
          var clonePos = clone.querySelector('.pos-tag');
          if (clonePos && clonePos.parentNode) {
            clonePos.parentNode.removeChild(clonePos);
          }
          
          var text = clone.innerHTML.trim();
          var eqIdx = text.indexOf('＝');
          if (eqIdx !== -1) {
            var main = text.substring(0, eqIdx).trim();
            var sub = text.substring(eqIdx).trim();
            item.innerHTML = (posHtml ? posHtml + ' ' : '') + main + ' <span class="equal-sub">' + sub + '</span>';
          }
        }
      });

      function wrapBrackets(node) {
        if (node.nodeType === 3) {
          var text = node.nodeValue;
          if (/[（\(［\[][^）\)］\]]+[）\)］\]]/.test(text)) {
            var span = document.createElement('span');
            span.innerHTML = text.replace(/([（\(［\[][^）\)］\]]+[）\)］\]])/g, '<span class="bracket-sub"></span>');
            node.parentNode.replaceChild(span, node);
          }
        } else if (node.nodeType === 1) {
          if (!node.classList.contains('bracket-sub') && !node.classList.contains('pos-tag')) {
            var children = Array.from(node.childNodes);
            children.forEach(wrapBrackets);
          }
        }
      }
      wrapBrackets(block);
    });
  }

  function getVerbForms(verb) {
    var forms = [verb];
    if (verb.endsWith('する')) {
      var b = verb.replace(/する$/, '');
      forms.push(b, b + 'し', b + 'した', b + 'して', b + 'している', b + 'される');
    } else if (verb.endsWith('す')) {
      var b = verb.slice(0, -1);
      forms.push(b + 'した', b + 'して', b + 'している', b + 'させる', b + 'される');
    } else if (verb.endsWith('く')) {
      var b = verb.slice(0, -1);
      forms.push(b + 'いた', b + 'いて', b + 'いている');
    } else if (verb.endsWith('ぐ')) {
      var b = verb.slice(0, -1);
      forms.push(b + 'いだ', b + 'いで', b + 'いでいる');
    } else if (verb.endsWith('む') || verb.endsWith('ぶ') || verb.endsWith('ぬ')) {
      var b = verb.slice(0, -1);
      forms.push(b + 'んだ', b + 'んで', b + 'んでいる');
    } else if (verb.endsWith('る')) {
      var b = verb.slice(0, -1);
      forms.push(b + 'った', b + 'って', b + 'っている', b + 'た', b + 'て', b + 'ている');
    } else if (verb.endsWith('う') || verb.endsWith('つ')) {
      var b = verb.slice(0, -1);
      forms.push(b + 'った', b + 'って', b + 'っている');
    }
    return forms;
  }

  function highlightTargetInExampleJA() {
    var jaEl = document.querySelector('.phrase-ja');
    var mBlock = document.querySelector('.meaning-block');
    if (!jaEl || !mBlock) return;
    if (jaEl.querySelector('.target-word-ja')) return;

    var exJa = jaEl.textContent.trim();
    if (!exJa) return;

    var clone = mBlock.cloneNode(true);
    var posTags = clone.querySelectorAll('.pos-tag');
    posTags.forEach(function(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    var clean = clone.textContent.trim();
    clean = clean.replace(/^[他自名形副助代前接間感冠略句動]\s+/, '').trim();
    var parts = clean.split(/[＝=]/);

    // Pattern 1: Double placeholder: …を〜の状態にする, …を〜にする
    for (var pi = 0; pi < parts.length; pi++) {
      var raw = parts[pi].trim();
      var core = raw.replace(/[（\(［\[][^）\)］\]]*[）\)］\]]/g, '').trim();
      if (!core) continue;
      core = core.replace(/[…‥\.]+/g, '…').replace(/[〜～~]/g, '〜');

      var phPattern = /^[…\s]*(?:(を|に|で|へ|と|から|より))?[…\s]*〜[…\s]*(.*)$/;
      var phMatch = core.match(phPattern);
      if (phMatch) {
        var p1 = phMatch[1] || '';
        var p2 = phMatch[2] || '';
        var p2Candidates = [];
        if (p2) {
          p2Candidates.push(p2);
          if (p2.startsWith('の') || p2.startsWith('な')) {
            p2Candidates.push(p2.substring(1));
          }
          var baseList = p2Candidates.slice();
          baseList.forEach(function(item) {
            getVerbForms(item).forEach(function(f) { p2Candidates.push(f); });
          });
        }
        p2Candidates.sort(function(a, b) { return b.length - a.length; });

        for (var k = 0; k < p2Candidates.length; k++) {
          var cand2 = p2Candidates[k];
          if (!cand2 || cand2.length < 2) continue;
          var idx2 = exJa.lastIndexOf(cand2);
          if (idx2 !== -1) {
            if (p1) {
              var idx1 = exJa.substring(0, idx2).lastIndexOf(p1);
              if (idx1 !== -1) {
                jaEl.innerHTML = exJa.substring(0, idx1) +
                       '<span class="target-word-ja">' + p1 + '</span>' +
                       exJa.substring(idx1 + p1.length, idx2) +
                       '<span class="target-word-ja">' + cand2 + '</span>' +
                       exJa.substring(idx2 + cand2.length);
                return;
              }
            }
            jaEl.innerHTML = exJa.substring(0, idx2) + '<span class="target-word-ja">' + cand2 + '</span>' + exJa.substring(idx2 + cand2.length);
            return;
          }
        }
      }

      // Pattern 2: Auxiliary forms with dummy verb: …してしまった
      if (/^[…\s]*(?:して|しな|した|し|す)/.test(core)) {
        var s = core.replace(/^[…\s]+/, '');
        var auxList = [];
        if (s.startsWith('して')) {
          var tail = s.substring(2);
          auxList.push('して' + tail, 'て' + tail, 'で' + tail);
        } else if (s.startsWith('しな')) {
          var tail = s.substring(2);
          auxList.push('しな' + tail, 'な' + tail);
        } else if (s.startsWith('した')) {
          var tail = s.substring(2);
          auxList.push('した' + tail, 'た' + tail, 'だ' + tail);
        } else if (s.startsWith('し')) {
          var tail = s.substring(1);
          auxList.push('し' + tail, tail);
        } else if (s.startsWith('す')) {
          var tail = s.substring(1);
          auxList.push('す' + tail, tail);
        }
        var more = [];
        auxList.forEach(function(c) {
          if (c.endsWith('である')) {
            more.push(c.replace(/である$/, 'だ'));
            more.push(c.replace(/である$/, ''));
          }
        });
        auxList = auxList.concat(more);
        auxList.sort(function(a, b) { return b.length - a.length; });
        for (var ai = 0; ai < auxList.length; ai++) {
          var aCand = auxList[ai];
          if (!aCand || aCand.length < 2) continue;
          var aIdx = exJa.indexOf(aCand);
          if (aIdx !== -1) {
            jaEl.innerHTML = exJa.substring(0, aIdx) + '<span class="target-word-ja">' + aCand + '</span>' + exJa.substring(aIdx + aCand.length);
            return;
          }
        }
      }

      // Pattern 3: Single placeholder: …を押す, …を豊かにする, …と, …へ
      var singlePh = core.match(/^[…\s]*(?:(を|に|で|へ|と|から|より))?[…\s]*(.*)$/);
      if (singlePh && (singlePh[1] || singlePh[2])) {
        var particle = singlePh[1] || '';
        var rest = singlePh[2] || '';
        var cands = [];
        var restForms = getVerbForms(rest);
        if (rest.length >= 3 && rest.endsWith('い')) restForms.push(rest.slice(0, -1));
        if (rest.length >= 2 && /[うくぐすずつぬふぶむる]$/.test(rest)) restForms.push(rest.slice(0, -1));

        if (particle && rest) {
          restForms.forEach(function(rf) { cands.push(particle + rf); });
        }
        if (rest) {
          restForms.forEach(function(rf) { cands.push(rf); });
        }
        if (particle && !rest) {
          cands.push(particle);
          if (particle === 'へ') cands.push('ヘ');
          if (particle === 'ヘ') cands.push('へ');
        }

        cands.sort(function(a, b) { return b.length - a.length; });
        for (var c = 0; c < cands.length; c++) {
          var cand = cands[c];
          if (!cand) continue;
          var minLen = (cand.length === 1 && !rest && particle) ? 1 : 2;
          if (cand.length < minLen) continue;
          var idx = exJa.indexOf(cand);
          if (idx !== -1) {
            jaEl.innerHTML = exJa.substring(0, idx) + '<span class="target-word-ja">' + cand + '</span>' + exJa.substring(idx + cand.length);
            return;
          }
        }
      }
    }

    // Pattern 4: Smart candidate matching with parentheses & brackets expansion
    var allCands = [];
    for (var pi = 0; pi < parts.length; pi++) {
      var raw = parts[pi].trim();
      if (!raw) continue;

      var s = raw.replace(/（/g, '(').replace(/）/g, ')').replace(/［/g, '[').replace(/］/g, ']');
      s = s.replace(/[…‥\.]+/g, '…').replace(/[〜～~]/g, '〜');

      var v1 = s.replace(/\([^)]*\)/g, '');
      var v2 = s.replace(/[()]/g, '');

      var forms = [raw, s];
      [v1, v2].forEach(function(v) {
        if (!v) return;
        var bMatch = v.match(/\[([^\]]+)\]/);
        if (bMatch) {
          var pre = v.substring(0, bMatch.index);
          var post = v.substring(bMatch.index + bMatch[0].length);
          var opts = bMatch[1].split(/[・,]/);
          opts.forEach(function(opt) {
            var o = opt.trim();
            forms.push(pre + o + post);
            forms.push(o + post);
            forms.push(o);
            
            // Replace previous word after particle (e.g. 8番目の[もの] -> 8番目のもの, 反対の[こと] -> 反対のこと)
            var pMatch = pre.match(/^(.*?)([はにをがへとでからよりの])([^はにをがへとでからよりの]+)$/);
            if (pMatch) {
              forms.push(pMatch[1] + pMatch[2] + o + post);
            }
          });
          forms.push(pre + post);
        } else {
          forms.push(v);
          var strippedP = v.replace(/[はにをがへとでからよりの]+$/, '');
          if (strippedP && strippedP !== v) forms.push(strippedP);
        }

        // Also split on ellipsis/tilde (e.g. どんなに…でも -> どんなに)
        if (v.indexOf('…') !== -1 || v.indexOf('〜') !== -1) {
          var subParts = v.split(/[…〜]+/);
          subParts.forEach(function(sp) {
            var spClean = sp.trim();
            if (spClean.length >= 2) forms.push(spClean);
          });
        }
      });

      forms.forEach(function(f) {
        var c = f.replace(/^[…‥\.\s〜～~]+|[…‥\.\s〜～~]+$/g, '').trim();
        if (!c) return;

        var variants = [c];
        // Strip leading particles (e.g. を変える -> 変える, に尋ねる -> 尋ねる)
        var noLeadP = c.replace(/^[をにへとでからよりが]\s*/, '').trim();
        if (noLeadP && noLeadP !== c) variants.push(noLeadP);

        // Strip plural / suffix (e.g. 子どもたち -> 子ども)
        var noPlural = c.replace(/(たち|ら|がた)$/, '').trim();
        if (noPlural && noPlural !== c) variants.push(noPlural);

        // Convert -み noun to -む verb (e.g. 楽しみ -> 楽しむ)
        if (c.endsWith('み') && c.length >= 3) {
          variants.push(c.slice(0, -1) + 'む');
        }

        variants.forEach(function(vItem) {
          if (allCands.indexOf(vItem) === -1) {
            allCands.push(vItem);
            getVerbForms(vItem).forEach(function(vf) {
              if (allCands.indexOf(vf) === -1) allCands.push(vf);
            });
            if (vItem.length >= 3 && vItem.endsWith('い')) {
              var stem = vItem.slice(0, -1);
              if (allCands.indexOf(stem) === -1) allCands.push(stem);
            }
            if (vItem.length >= 3 && vItem.endsWith('だ')) {
              var stem = vItem.slice(0, -1);
              if (allCands.indexOf(stem) === -1) allCands.push(stem);
            }
            if (vItem === 'へ' && allCands.indexOf('ヘ') === -1) allCands.push('ヘ');
            if (vItem === 'ヘ' && allCands.indexOf('へ') === -1) allCands.push('へ');
          }
        });
      });
    }

    // Filter out short generic words like "もの", "こと", "ひと" if longer compounds containing them exist
    allCands = allCands.filter(function(cand) {
      if ((cand === 'もの' || cand === 'こと' || cand === 'ひと') && allCands.some(function(c) { return c.length > 2 && c.indexOf(cand) !== -1; })) {
        return false;
      }
      return true;
    });

    allCands.sort(function(a, b) { return b.length - a.length; });

    for (var sc = 0; sc < allCands.length; sc++) {
      var sCand = allCands[sc];
      var minLen = /[一-龯]/.test(sCand) ? 1 : 2;
      if (sCand.length === 1 && allCands.indexOf(sCand) !== -1) {
        for (var pi = 0; pi < parts.length; pi++) {
          var basePart = parts[pi].replace(/[（\(［\[][^）\)］\]]*[）\)］\]]/g, '').replace(/^[…‥\.\s〜～~]+|[…‥\.\s〜～~]+$/g, '').trim();
          if (basePart.length === 1 || basePart === 'へ' || basePart === 'ヘ') {
            minLen = 1;
            break;
          }
        }
      }
      if (sCand.length >= minLen) {
        var sIdx = exJa.indexOf(sCand);
        if (sIdx !== -1) {
          jaEl.innerHTML = exJa.substring(0, sIdx) + '<span class="target-word-ja">' + sCand + '</span>' + exJa.substring(sIdx + sCand.length);
          return;
        }
      }
    }
  }

  function runAll() {
    formatMeaning();
    highlightTargetInExampleJA();
  }

  runAll();
  setTimeout(runAll, 0);
  setTimeout(runAll, 50);
})();