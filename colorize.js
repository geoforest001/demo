/* ─── 施業班 色分け機能 ─── */

// 視認性の高いカテゴリ色パレット
var _CZ_PALETTE = [
  '#e53935','#43a047','#1e88e5','#fb8c00','#8e24aa',
  '#00897b','#f4511e','#3949ab','#00acc1','#7cb342',
  '#fdd835','#d81b60','#6d4c41','#546e7a','#c0ca33',
  '#26a69a','#5c6bc0','#ef6c00','#558b2f','#ad1457',
];

function _czPalette(n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    out.push(_CZ_PALETTE[i % _CZ_PALETTE.length]);
  }
  return out;
}

// 施業班レイヤ一覧（dataLayer === 'segyohan'）
function _segyoLayers() {
  return _FOREST_LAYERS.filter(function(lc) { return lc.dataLayer === 'segyohan'; });
}

// 現在のビューポート内の施業班フィーチャから属性値を収集
function _collectVals(attr) {
  var vals = new Set();
  var center = map.getCenter();
  var bounds = map.getBounds();
  var pts = [
    center,
    bounds.getNorthWest(), bounds.getNorthEast(),
    bounds.getSouthWest(), bounds.getSouthEast(),
    L.latLng((center.lat + bounds.getNorth()) / 2, center.lng),
    L.latLng((center.lat + bounds.getSouth()) / 2, center.lng),
    L.latLng(center.lat, (center.lng + bounds.getEast()) / 2),
    L.latLng(center.lat, (center.lng + bounds.getWest()) / 2),
  ];
  _segyoLayers().forEach(function(lc) {
    var pmInfo = window.pmLayers && window.pmLayers[lc.name];
    if (!pmInfo || !pmInfo.layer) return;
    pts.forEach(function(pt) {
      try {
        var results = pmInfo.layer.queryTileFeaturesDebug(pt);
        (results || []).forEach(function(r) {
          if (r.dataLayer === lc.dataLayer && r.feature && r.feature.props) {
            var v = r.feature.props[attr];
            if (v !== undefined && v !== null && v !== '') vals.add(String(v));
          }
        });
      } catch (_) {}
    });
  });
  return Array.from(vals).sort();
}

// 色分け適用
function _czApply(attr) {
  var vals = _collectVals(attr);
  if (!vals.length) {
    alert('施業班ポリゴンが取得できませんでした。\n施業班レイヤをONにして、地図をポリゴンが表示されているエリアに移動してから再試行してください。');
    return;
  }
  var colors = _czPalette(vals.length);
  var colorMap = {};
  vals.forEach(function(v, i) { colorMap[v] = colors[i]; });

  _segyoLayers().forEach(function(lc) {
    var pmInfo = window.pmLayers && window.pmLayers[lc.name];
    if (!pmInfo) return;
    var strokeColor = lc.strokeColor || '#e65100';
    var strokeWidth = lc.strokeWidth || 1.5;

    // paintRules を色分けルール（値ごと）＋アウトラインに入れ替え
    var newRules = vals.map(function(v) {
      return {
        dataLayer: lc.dataLayer,
        filter: (function(val) {
          return function(z, f) { return String((f.props || {})[attr] || '') === val; };
        })(v),
        symbolizer: new protomapsL.PolygonSymbolizer({ fill: colorMap[v], opacity: 0.65, stroke: strokeColor, width: strokeWidth }),
      };
    });
    // アウトライン（塗りなし）を先頭に置き、値マッチしないポリゴンにも枠を出す
    newRules.unshift({
      dataLayer: lc.dataLayer,
      symbolizer: new protomapsL.PolygonSymbolizer({ fill: 'rgba(0,0,0,0)', stroke: strokeColor, width: strokeWidth }),
    });

    pmInfo._paintRules.length = 0;
    newRules.forEach(function(r) { pmInfo._paintRules.push(r); });
    if (map.hasLayer(pmInfo.layer)) pmInfo.layer.redraw();
  });

  _czShowLegend(attr, colorMap);
}

// 色分け解除
function _czClear() {
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

// 凡例表示
function _czShowLegend(attr, colorMap) {
  var old = document.getElementById('czLegend');
  if (old) old.remove();
  var leg = document.createElement('div');
  leg.id = 'czLegend';
  var rows = Object.keys(colorMap).map(function(v) {
    return '<div class="cz-leg-row"><span class="cz-leg-sw" style="background:' + colorMap[v] + '"></span><span class="cz-leg-lbl">' + v + '</span></div>';
  }).join('');
  leg.innerHTML =
    '<div class="cz-leg-head"><span>🎨 ' + attr + '</span><button id="czLegClose">×</button></div>' +
    '<div class="cz-leg-body">' + rows + '</div>' +
    '<div class="cz-leg-foot"><button id="czLegClear">色分けを解除</button></div>';
  document.body.appendChild(leg);
  document.getElementById('czLegClose').onclick = function() { leg.remove(); };
  document.getElementById('czLegClear').onclick = function() { _czClear(); };
}

// 属性選択モーダルを開く
window.openColorizePanel = function() {
  // 施業班の keys を取得（最初に見つかったものを使用）
  var segyoLc = _segyoLayers()[0];
  var attrs = segyoLc ? (segyoLc.keys || []).filter(function(k) { return k; }) : [];
  if (!attrs.length) {
    alert('色分けに使用できる属性情報が設定されていません。');
    return;
  }

  var old = document.getElementById('czModal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'czModal';
  modal.innerHTML =
    '<div id="czModalBox">' +
      '<div class="cz-modal-title">🎨 施業班 色分け</div>' +
      '<div class="cz-modal-note">属性を選んで「適用」を押してください</div>' +
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
  document.getElementById('czModalClear').onclick = function() { _czClear(); modal.remove(); };
  document.getElementById('czModalApply').onclick = function() {
    var attr = document.getElementById('czAttrSel').value;
    if (!attr) { alert('属性を選択してください。'); return; }
    modal.remove();
    _czApply(attr);
  };
};
