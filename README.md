# 林業事業体マップ（汎用版）

Leaflet.js + protomaps-leaflet を使った森林計画図マップアプリの汎用テンプレートです。
`config.js` を編集するだけで任意の林業事業体向けにデプロイできます。

## 主な機能

- 国土地理院タイル（標準地図・航空写真）+ CS立体図（任意）
- PMTiles 形式の森林レイヤ表示（林小班・林班・準林班など）
- GeoJSON レイヤ読み込み（調査範囲・計画路網など）
- GPS ログ記録（ウェイポイント・セッション管理・GPX 書き出し）
- GeoTIFF / GeoJSON / GeoPackage / GPX ファイル読み込み
- Excel / CSV 連携（PMTiles・GeoJSON との属性結合・色分け）
- 気象庁レーダー・AMeDAS
- A4 印刷（縦横・縮尺対応）
- PWA 対応（Service Worker・manifest）

## カスタマイズ

`config.js` の `APP_CONFIG` を編集してください。

```js
const APP_CONFIG = {
  title:   '○○事業体 森林計画図',
  center:  [35.0, 136.0],   // 初期表示中心 [緯度, 経度]
  zoom:    10,
  idbName: 'my-surveys',

  csRelief: 'https://example.com/CSM/{z}/{x}/{y}.png',  // CS立体図URL（不要なら null）

  forestLayers: [
    { url: 'data/林小班.pmtiles', dataLayer: 'kobandan', name: '林小班', ... },
  ],
  geoLayers: [
    { url: 'data/調査範囲.geojson', name: '調査範囲', ... },
  ],
};
```

## 技術スタック

- [Leaflet.js 1.9.4](https://leafletjs.com/)
- [protomaps-leaflet 5.1.0](https://protomaps.com/)
- [SheetJS (xlsx 0.20.3)](https://sheetjs.com/)
- [georaster + georaster-layer-for-leaflet](https://github.com/geotiff/georaster)
- [JSZip 3.10.1](https://stuk.github.io/jszip/)
