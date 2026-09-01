/**
 * 林業事業体マップ 設定ファイル
 * ここを各事業体向けにカスタマイズしてください。
 */
const APP_CONFIG = {
  /* ───────── 基本設定 ───────── */
  title:   'デモ用マップアプリ',        // アプリタイトル（例: '○○事業体 森林調査アプリ'）
  center:  [36.65, 138.18],            // 初期表示中心 [緯度, 経度]（長野県中心部）
  zoom:    7,                         // 初期ズームレベル
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
    // 例: 以下のコメントを外してパスを調整してください
    // {
    //   url:         'data/林小班.pmtiles',
    //   dataLayer:   'kobandan',
    //   name:        '林小班',
    //   strokeColor: '#ff0000',
    //   strokeWidth: 1,
    //   zIndex:      403,
    //   keys:        ['KEYCODE','小班','林種','中樹種','林齢','齢級','小班面積','所有形態','ADDDATE'],
    //   popup: (props) => `
    //     <div class="forest-popup">
    //       <div class="popup-title">🌲 林小班: ${props['小班'] || ''}</div>
    //       <table>
    //         <tr><th>林種</th><td>${props['林種'] || '―'}</td></tr>
    //         <tr><th>林齢</th><td>${props['林齢'] != null ? props['林齢'] + '年' : '―'}</td></tr>
    //         <tr><th>小班面積</th><td>${props['小班面積'] != null ? props['小班面積'] + ' ha' : '―'}</td></tr>
    //       </table>
    //     </div>`,
    // },
    // {
    //   url:         'data/林班.pmtiles',
    //   dataLayer:   'rinpan',
    //   name:        '林班',
    //   strokeColor: '#8d6ca2',
    //   strokeWidth: 3,
    //   zIndex:      401,
    //   keys:        ['RINPAN','SICHOSON_N','ADDDATE'],
    // },
    // {
    //   url:         'data/準林班.pmtiles',
    //   dataLayer:   'junrinpan',
    //   name:        '準林班',
    //   strokeColor: '#49ce7f',
    //   strokeWidth: 2,
    //   zIndex:      402,
    //   keys:        ['RINPAN','JUNRINPAN','SICHOSON_N','KEYCODE'],
    // },
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
