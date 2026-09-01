/**
 * 林業事業体マップ 設定ファイル
 * ここを各事業体向けにカスタマイズしてください。
 */
const APP_CONFIG = {
  /* ───────── 基本設定 ───────── */
  title:   'デモ用マップアプリ',        // アプリタイトル（例: '○○事業体 森林調査アプリ'）
  center:  [35.83, 137.93],            // 初期表示中心 [緯度, 経度]（伊那谷）
  zoom:    11,                         // 初期ズームレベル
  idbName: 'forestry-surveys',        // IndexedDB名（事業体ごとに変更を推奨）

  /* ───────── 追加ベースマップ ───────── */
  /* CS立体図など独自タイルがある場合に設定。不要なら null のまま */
  csRelief: null,
  // csRelief: 'https://example.com/map/CSM/{z}/{x}/{y}.png',
  csReliefAttribution: '',
  csReliefMaxNativeZoom: 17,

  /* ───────── 森林 PMTiles レイヤ ───────── */
  /*
   * url:         PMTilesファイルのパス
   * dataLayer:   PMTiles 内のレイヤ名
   * name:        レイヤメニューに表示する名前
   * strokeColor: 境界線の色
   * strokeWidth: 境界線の太さ
   * zIndex:      重なり順（大きいほど上に来る）
   * fillColor:   塗りつぶし色（省略可。省略時は透明）
   * keys:        Excel連携で使うフィールド名リスト
   * popup:       クリック時のポップアップ生成関数(props) => HTMLString
   *              省略時は全プロパティをテーブル表示
   */
  forestLayers: [
    // ── 伊那市 ──
    { group: '伊那市',   url: 'data/ina_rinpan.pmtiles',          dataLayer: 'rinpan',   name: '伊那市 林班',   strokeColor: '#8d6ca2', strokeWidth: 3,   zIndex: 410, keys: ['RIN'] },
    { group: '伊那市',   url: 'data/ina_shohan.pmtiles',          dataLayer: 'shohan',   name: '伊那市 小班',   strokeColor: '#1565c0', strokeWidth: 1.2, zIndex: 420, keys: ['SHO','林種','育成区分','施業区分','樹種','林齢','面積'] },
    { group: '伊那市',   url: 'data/ina_segyohan.pmtiles',        dataLayer: 'segyohan', name: '伊那市 施業班', strokeColor: '#00838f', strokeWidth: 1.5, zIndex: 415, keys: ['KEY_02','SEGYOHANID','林種','育成区分','施業区分','樹種','林齢','面積'] },
    // ── 辰野町 ──
    { group: '辰野町',   url: 'data/tatsuno_rinpan.pmtiles',      dataLayer: 'rinpan',   name: '辰野町 林班',   strokeColor: '#8d6ca2', strokeWidth: 3,   zIndex: 410, keys: ['RIN'] },
    { group: '辰野町',   url: 'data/tatsuno_shohan.pmtiles',      dataLayer: 'shohan',   name: '辰野町 小班',   strokeColor: '#1565c0', strokeWidth: 1.2, zIndex: 420, keys: ['SHO','林種','育成区分','施業区分','樹種','林齢','面積'] },
    { group: '辰野町',   url: 'data/tatsuno_segyohan.pmtiles',    dataLayer: 'segyohan', name: '辰野町 施業班', strokeColor: '#00838f', strokeWidth: 1.5, zIndex: 415, keys: ['KEY_02','SEGYOHANID','林種','育成区分','施業区分','樹種','林齢','面積'] },
    // ── 箕輪町 ──
    { group: '箕輪町',   url: 'data/minowa_rinpan.pmtiles',       dataLayer: 'rinpan',   name: '箕輪町 林班',   strokeColor: '#8d6ca2', strokeWidth: 3,   zIndex: 410, keys: ['RIN'] },
    { group: '箕輪町',   url: 'data/minowa_shohan.pmtiles',       dataLayer: 'shohan',   name: '箕輪町 小班',   strokeColor: '#1565c0', strokeWidth: 1.2, zIndex: 420, keys: ['SHO','林種','育成区分','施業区分','樹種','林齢','面積'] },
    { group: '箕輪町',   url: 'data/minowa_segyohan.pmtiles',     dataLayer: 'segyohan', name: '箕輪町 施業班', strokeColor: '#00838f', strokeWidth: 1.5, zIndex: 415, keys: ['KEY_02','SEGYOHANID','林種','育成区分','施業区分','樹種','林齢','面積'] },
    // ── 南箕輪村 ──
    { group: '南箕輪村', url: 'data/minamiminowa_rinpan.pmtiles', dataLayer: 'rinpan',   name: '南箕輪村 林班',   strokeColor: '#8d6ca2', strokeWidth: 3,   zIndex: 410, keys: ['RIN'] },
    { group: '南箕輪村', url: 'data/minamiminowa_shohan.pmtiles', dataLayer: 'shohan',   name: '南箕輪村 小班',   strokeColor: '#1565c0', strokeWidth: 1.2, zIndex: 420, keys: ['SHO','林種','育成区分','施業区分','樹種','林齢','面積'] },
    { group: '南箕輪村', url: 'data/minamiminowa_segyohan.pmtiles',dataLayer: 'segyohan',name: '南箕輪村 施業班', strokeColor: '#00838f', strokeWidth: 1.5, zIndex: 415, keys: ['KEY_02','SEGYOHANID','林種','育成区分','施業区分','樹種','林齢','面積'] },
    // ── 宮田村 ──
    { group: '宮田村',   url: 'data/miyada_rinpan.pmtiles',       dataLayer: 'rinpan',   name: '宮田村 林班',   strokeColor: '#8d6ca2', strokeWidth: 3,   zIndex: 410, keys: ['RIN'] },
    { group: '宮田村',   url: 'data/miyada_shohan.pmtiles',       dataLayer: 'shohan',   name: '宮田村 小班',   strokeColor: '#1565c0', strokeWidth: 1.2, zIndex: 420, keys: ['SHO','林種','育成区分','施業区分','樹種','林齢','面積'] },
    { group: '宮田村',   url: 'data/miyada_segyohan.pmtiles',     dataLayer: 'segyohan', name: '宮田村 施業班', strokeColor: '#00838f', strokeWidth: 1.5, zIndex: 415, keys: ['KEY_02','SEGYOHANID','林種','育成区分','施業区分','樹種','林齢','面積'] },
    // ── 国有林 ──
    { group: '国有林',   url: 'data/inadani_kokuyuurin_rinpan.pmtiles', dataLayer: 'kokuyuurin_rinpan', name: '国有林 林班', strokeColor: '#558b2f', strokeWidth: 3,   zIndex: 411, keys: ['RIN'] },
    { group: '国有林',   url: 'data/inadani_kokuyuurin_shohan.pmtiles', dataLayer: 'kokuyuurin_shohan', name: '国有林 小班', strokeColor: '#2e7d32', strokeWidth: 1.2, zIndex: 421, keys: ['SHO','林種','樹種','林齢','面積'] },
    { group: '国有林',   url: 'data/inadani_kokuyuurin_rindou.pmtiles', dataLayer: 'kokuyuurin_rindou', name: '国有林 林道', strokeColor: '#e65100', strokeWidth: 2,   zIndex: 440, keys: [] },
  ],

  /* ───────── GeoJSON レイヤ ───────── */
  /*
   * url:     GeoJSON ファイルのパス
   * name:    レイヤメニューに表示する名前
   * style:   Leaflet スタイルオブジェクト
   * zIndex:  重なり順
   * popup:   クリック時のポップアップ生成関数(feature, layer) => HTMLString
   *          省略時は全プロパティをテーブル表示
   */
  geoLayers: [
    // {
    //   url:    'data/調査範囲.geojson',
    //   name:   '調査範囲',
    //   style:  { color: '#00aacc', weight: 4, fillOpacity: 0, dashArray: '6 4' },
    //   zIndex: 420,
    // },
    // {
    //   url:    'data/計画路網.geojson',
    //   name:   '計画路網',
    //   roadStyle: true,  // 二重線スタイル（外線+内線）
    //   zIndex: 450,
    // },
  ],
};
