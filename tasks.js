/* ─── 業務レイヤ機能 ─── */

var _taskActiveLayers = [];

/* overlaysDiv に業務セレクターを追加（renderLayerControl から呼ぶ） */
async function initTaskSelector(overlaysDiv) {
  var sep = document.createElement('div');
  sep.className = 'leaflet-control-layers-separator';
  overlaysDiv.appendChild(sep);

  var lbl = document.createElement('div');
  lbl.className = 'lc-section-label';
  lbl.textContent = '業務レイヤ';
  overlaysDiv.appendChild(lbl);

  /* select と listDiv を await 前に DOM に追加しておく（weather.js より先に位置確保） */
  var sel = document.createElement('select');
  sel.id = 'taskSel';
  sel.className = 'task-sel';
  sel.innerHTML = '<option value="">── 読み込み中... ──</option>';
  overlaysDiv.appendChild(sel);

  var listDiv = document.createElement('div');
  listDiv.id = 'taskLayerList';
  overlaysDiv.appendChild(listDiv);

  var tasks = [];
  try {
    var resp = await fetch('data/tasks.json');
    if (!resp.ok) throw new Error();
    tasks = await resp.json();
  } catch (_) {
    sel.innerHTML = '<option value="">（読み込み失敗）</option>';
    return;
  }

  sel.innerHTML = '<option value="">── 業務を選択 ──</option>' +
    tasks.map(function(t) {
      return '<option value="' + t.id + '">' + (t.icon || '📁') + ' ' + t.name + '</option>';
    }).join('');

  sel.addEventListener('change', function() {
    _loadTask(this.value, listDiv);
  });
}

/* 業務レイヤを全解除 */
function _clearTaskLayers(listDiv) {
  _taskActiveLayers.forEach(function(l) {
    try { map.removeLayer(l); } catch (_) {}
  });
  _taskActiveLayers = [];
  if (listDiv) listDiv.innerHTML = '';
}

/* 業務を読み込む */
async function _loadTask(taskId, listDiv) {
  _clearTaskLayers(listDiv);
  if (!taskId) return;

  var cfg;
  try {
    var resp = await fetch('data/' + taskId + '/config.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    cfg = await resp.json();
  } catch (_) {
    toast('業務設定ファイルの読み込みに失敗しました', 3000);
    return;
  }

  var layers = cfg.layers || [];
  if (!layers.length) { toast('レイヤが定義されていません', 2500); return; }
  toast((cfg.name || taskId) + ' を読み込み中...', 10000);

  var bounds = null;
  for (var i = 0; i < layers.length; i++) {
    var lc = layers[i];
    var layer = null;
    try {
      if (lc.type === 'pmtiles') {
        layer = _taskLoadPMTiles(lc);
      } else if (lc.type === 'raster') {
        layer = _taskLoadRasterPMTiles(lc);
      } else if (lc.type === 'gpkg') {
        layer = await _taskLoadGPKG(lc);
        if (layer) {
          var b = layer.getBounds();
          if (b.isValid()) bounds = bounds ? bounds.extend(b) : b;
        }
      }
    } catch (e) {
      console.error('[tasks] ' + lc.name, e);
      toast(lc.name + ' の読み込みに失敗', 2000);
      continue;
    }
    if (!layer) continue;
    layer.addTo(map);
    _taskActiveLayers.push(layer);
    _taskAddRow(listDiv, lc, layer);
  }

  if (cfg.center) {
    map.flyTo(cfg.center, cfg.zoom || 13, { duration: 1.2 });
  } else if (bounds) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
  toast((cfg.name || taskId) + ' を読み込みました', 2000);
}

/* チェックボックス行を追加 */
function _taskAddRow(listDiv, lc, layer) {
  var row = document.createElement('label');
  row.className = 'task-layer-row';

  var chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.checked = true;
  (function(l) {
    chk.addEventListener('change', function() {
      if (this.checked) l.addTo(map); else map.removeLayer(l);
    });
  })(layer);

  var sw = document.createElement('span');
  sw.className = 'task-layer-sw';
  sw.style.background = lc.type === 'raster'
    ? 'linear-gradient(to right,#66caff,#f8fc41,#fc0707)'
    : (lc.strokeColor || '#9c27b0');

  var name = document.createElement('span');
  name.textContent = lc.name;

  row.appendChild(chk);
  row.appendChild(sw);
  row.appendChild(name);
  listDiv.appendChild(row);
}

/* ラスタ PMTiles レイヤ生成（Leaflet GridLayer + pmtiles.js） */
function _taskLoadRasterPMTiles(lc) {
  var p = new pmtiles.PMTiles(lc.url);
  var RasterLayer = L.GridLayer.extend({
    createTile: function(coords, done) {
      var img = document.createElement('img');
      img.style.cssText = 'width:256px;height:256px;';
      p.getZxy(coords.z, coords.x, coords.y).then(function(tile) {
        if (!tile || !tile.data) { done(null, img); return; }
        var blob = new Blob([tile.data], { type: 'image/png' });
        img.src = URL.createObjectURL(blob);
        img.onload = function() { done(null, img); };
        img.onerror = function() { done(null, img); };
      }).catch(function() { done(null, img); });
      return img;
    }
  });
  return new RasterLayer({ opacity: lc.opacity !== undefined ? lc.opacity : 0.75, maxZoom: 22 });
}

/* PMTiles レイヤ生成 */
function _taskLoadPMTiles(lc) {
  var geomType = (lc.geometryType || 'polygon').toLowerCase();
  var paintRules = [];
  if (geomType === 'line') {
    paintRules.push({
      dataLayer: lc.dataLayer,
      symbolizer: new protomapsL.LineSymbolizer({
        color: lc.strokeColor || '#1565c0',
        width: lc.strokeWidth || 1.5,
      }),
    });
  } else {
    paintRules.push({
      dataLayer: lc.dataLayer,
      symbolizer: new protomapsL.PolygonSymbolizer({
        fill: lc.fillColor || 'rgba(0,0,0,0)',
        stroke: lc.strokeColor || '#1565c0',
        width: lc.strokeWidth || 1.5,
      }),
    });
  }
  return protomapsL.leafletLayer({ url: lc.url, maxDataZoom: 18, paintRules: paintRules });
}

/* GeoPackage レイヤ生成（URL から fetch して解析） */
async function _taskLoadGPKG(lc) {
  var resp = await fetch(lc.url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var buf = await resp.arrayBuffer();

  if (!window.initSqlJs) {
    await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js');
  }
  if (!window._sqlJs) {
    window._sqlJs = await window.initSqlJs({
      locateFile: function(f) { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/' + f; }
    });
  }

  var db = new window._sqlJs.Database(new Uint8Array(buf));
  var gcRes;
  try { gcRes = db.exec('SELECT table_name, column_name, srs_id FROM gpkg_geometry_columns'); }
  catch (_) { db.close(); throw new Error('GeoPackage 形式が不正です'); }
  if (!gcRes.length || !gcRes[0].values.length) { db.close(); throw new Error('フィーチャレイヤなし'); }

  var features = [];
  for (var ri = 0; ri < gcRes[0].values.length; ri++) {
    var tbl = gcRes[0].values[ri][0], geomCol = gcRes[0].values[ri][1], srsId = gcRes[0].values[ri][2];
    var res = db.exec('SELECT * FROM "' + tbl + '"');
    if (!res.length) continue;
    var cols = res[0].columns;
    var gi = cols.indexOf(geomCol);
    for (var rj = 0; rj < res[0].values.length; rj++) {
      var row = res[0].values[rj];
      if (!row[gi]) continue;
      try {
        var bytes = row[gi] instanceof Uint8Array ? row[gi] : new Uint8Array(row[gi]);
        var geom = _gpkgGeomToGeoJSON(bytes);
        if (!geom) continue;
        var props = { _srs_id: srsId };
        cols.forEach(function(c, ci) { if (ci !== gi) props[c] = row[ci]; });
        features.push({ type: 'Feature', geometry: geom, properties: props });
      } catch (_) {}
    }
  }
  db.close();
  if (!features.length) throw new Error('ジオメトリなし');

  // 座標変換（日本測地系など）
  var testCoord = features[0].geometry.coordinates;
  while (Array.isArray(testCoord[0])) testCoord = testCoord[0];
  if (Math.abs(testCoord[0]) > 180 || Math.abs(testCoord[1]) > 90) {
    var srsId2 = gcRes[0].values[0][2];
    var result = await _resolveJpPlaneTransform(testCoord, srsId2);
    if (!result) throw new Error('座標系 EPSG:' + srsId2 + ' 非対応');
    for (var fi = 0; fi < features.length; fi++) {
      features[fi].geometry = _applyCoordTransform(features[fi].geometry, result.fn);
    }
  }

  var strokeColor = lc.strokeColor || '#9c27b0';
  return L.geoJSON({ type: 'FeatureCollection', features: features }, {
    style: {
      color: strokeColor,
      weight: lc.strokeWidth || 2,
      fillColor: lc.fillColor || strokeColor,
      fillOpacity: lc.fillOpacity !== undefined ? lc.fillOpacity : 0.15,
      opacity: 0.9,
    },
    pointToLayer: function(f, ll) {
      return L.circleMarker(ll, { radius: 5, color: strokeColor, fillOpacity: 0.8 });
    },
    onEachFeature: function(f, layer) {
      if (!f.properties) return;
      var rows = Object.entries(f.properties)
        .filter(function(kv) { return kv[1] !== null && kv[1] !== undefined; })
        .map(function(kv) { return '<tr><th>' + kv[0] + '</th><td>' + kv[1] + '</td></tr>'; }).join('');
      if (rows) layer.bindPopup('<table class="forest-popup">' + rows + '</table>');
    },
  });
}
