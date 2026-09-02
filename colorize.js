/* ─── 施業班 色分け機能 ─── */

// 属性値の文字列から決定論的な色を生成
function _czHash(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
    h |= 0;
  }
  h = h & 0x7fffffff;
  var hue = h % 360;
  var sat = 55 + (h >> 8 & 0xf);
  var lit = 40 + (h >> 12 & 0xb);
  return 'hsl(' + hue + ',' + sat + '%,' + lit + '%)';
}

// fill 関数が呼ばれるたびに値を収集するセット
window._czSeenVals = new Set();

// 施業班レイヤ一覧
function _segyoLayers() {
  return _FOREST_LAYERS.filter(function(lc) { return lc.dataLayer === 'segyohan'; });
}

// 色分け適用（ハッシュベース：タイルの事前読み込み不要）
function _czApply(attr) {
  window._czCurrentAttr = attr;

  _segyoLayers().forEach(function(lc) {
    var pmInfo = window.pmLayers && window.pmLayers[lc.name];
    if (!pmInfo) return;
    var strokeColor = lc.strokeColor || '#e65100';
    var strokeWidth = lc.strokeWidth || 1.5;

    // 値ごとにハッシュで色を決定しつつ、見た値を収集するファンクション
    var fillFn = (function(a) {
      return function(zoom, feature) {
        if (!feature || !feature.props) return 'rgba(0,0,0,0)';
        var v = feature.props[a];
        if (v === undefined || v === null || v === '') return 'rgba(150,150,150,0.3)';
        var str = String(v);
        window._czSeenVals.add(str);
        return _czHash(str);
      };
    })(attr);

    pmInfo._paintRules.length = 0;
    pmInfo._paintRules.push({
      dataLayer: lc.dataLayer,
      symbolizer: new protomapsL.PolygonSymbolizer({
        fill: fillFn, opacity: 0.7, stroke: strokeColor, width: strokeWidth,
      }),
    });
    if (map.hasLayer(pmInfo.layer)) pmInfo.layer.redraw();
  });

  // まず「更新中」凡例を表示し、描画後に収集した値で更新
  window._czSeenVals.clear();
  _czShowLegendPending(attr);
  // 描画完了を待ってから凡例を構築（fill 関数が呼ばれると _czSeenVals に蓄積される）
  setTimeout(function() { _czRefreshLegend(attr); }, 800);
}

// 色分け解除
function _czClear() {
  window._czCurrentAttr = null;
  _segyoLayers().forEach(function(lc) {
    var pmInfo = window.pmLayers && window.pmLayers[lc.name];
    if (!pmInfo) return;
    var strokeColor = lc.strokeColor || '#e65100';
    var strokeWidth = lc.strokeWidth || 1.5;
    pmInfo._paintRules.length = 0;
    pmInfo._paintRules.push({
      dataLayer: lc.dataLayer,
      symbolizer: new protomapsL.PolygonSymbolizer({ fill: 'rgba(0,0,0,0)', stroke: strokeColor, width: strokeWidth }),
    });
    if (map.hasLayer(pmInfo.layer)) pmInfo.layer.redraw();
  });
  var leg = document.getElementById('czLegend');
  if (leg) leg.remove();
}

// 凡例（収集中状態）
function _czShowLegendPending(attr) {
  var old = document.getElementById('czLegend');
  if (old) old.remove();
  var leg = document.createElement('div');
  leg.id = 'czLegend';
  leg.innerHTML =
    '<div class="cz-leg-head"><span>🎨 ' + attr + '</span><button id="czLegClose">×</button></div>' +
    '<div class="cz-leg-body" id="czLegBody"><div style="font-size:11px;color:#aaa;padding:6px 0">凡例を収集中...</div></div>' +
    '<div class="cz-leg-foot">' +
      '<button id="czLegRefresh">凡例を更新</button>' +
      '<button id="czLegClear" style="margin-left:6px">色分けを解除</button>' +
    '</div>';
  document.body.appendChild(leg);
  document.getElementById('czLegClose').onclick   = function() { leg.remove(); };
  document.getElementById('czLegClear').onclick   = function() { _czClear(); };
  document.getElementById('czLegRefresh').onclick = function() { _czRefreshLegend(attr); };
}

// 凡例の値部分を更新（fill 関数が収集した _czSeenVals を使用）
function _czRefreshLegend(attr) {
  var body = document.getElementById('czLegBody');
  if (!body) return;
  var vals = Array.from(window._czSeenVals).sort();
  if (!vals.length) {
    body.innerHTML = '<div style="font-size:11px;color:#aaa;padding:6px 0">描画待ち中。少し待って「凡例を更新」を押してください。</div>';
    return;
  }
  body.innerHTML = vals.map(function(v) {
    return '<div class="cz-leg-row"><span class="cz-leg-sw" style="background:' + _czHash(v) + '"></span><span class="cz-leg-lbl">' + v + '</span></div>';
  }).join('');
}

// 属性選択モーダルを開く
window.openColorizePanel = function() {
  var segyoLc = _segyoLayers()[0];
  var attrs = segyoLc ? (segyoLc.keys || []).filter(function(k) { return k; }) : [];
  if (!attrs.length) {
    alert('色分けに使用できる属性情報がありません。');
    return;
  }

  var old = document.getElementById('czModal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'czModal';
  modal.innerHTML =
    '<div id="czModalBox">' +
      '<div class="cz-modal-title">🎨 施業班 色分け</div>' +
      '<div class="cz-modal-note">色分けしたい属性を選択してください</div>' +
      '<select id="czAttrSel">' +
        '<option value="">── 属性を選択 ──</option>' +
        attrs.map(function(a) { return '<option value="' + a + '">' + a + '</option>'; }).join('') +
      '</select>' +
      '<div class="cz-modal-btns">' +
        '<button id="czModalCancel">閉じる</button>' +
        '<button id="czModalClear">解除</button>' +
        '<button id="czModalApply" class="cz-apply-btn">適用</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  document.getElementById('czModalCancel').onclick = function() { modal.remove(); };
  document.getElementById('czModalClear').onclick   = function() { _czClear(); modal.remove(); };
  document.getElementById('czModalApply').onclick   = function() {
    var attr = document.getElementById('czAttrSel').value;
    if (!attr) { alert('属性を選択してください。'); return; }
    modal.remove();
    _czApply(attr);
  };
};
