importScripts('assets/vendor/workbox-6.1.5/workbox-sw.js');

workbox.setConfig({
  debug: false,
  modulePathPrefix: 'assets/vendor/workbox-6.1.5/'
});

workbox.precaching.precacheAndRoute([
  {url: 'index.html', revision: '09.19.22.1'},
  {url: 'manifest.json', revision: '10.05.21.1'},
  {url: 'assets/js/app.js', revision: '09.19.22.1'},
  {url: 'assets/css/app.css', revision: '09.19.22.1'},
  {url: 'assets/img/apple-touch-icon.png', revision: '10.05.21.1'},
  {url: 'assets/img/favicon-32x32.png', revision: '10.05.21.1'},
  {url: 'assets/img/favicon-16x16.png', revision: '10.05.21.1'},
  {url: 'assets/img/offline.jpg', revision: '08.31.22.1'},
  {url: 'assets/img/logo60.png', revision: '08.31.22.1'},
  {url: 'assets/img/android.png', revision: '08.31.22.1'},
  {url: 'assets/vendor/icomoon/style.css', revision: '10.05.21.1'},
  {url: 'assets/vendor/icomoon/fonts/icomoon.ttf', revision: '10.05.21.1'},
  {url: 'assets/vendor/icomoon/fonts/icomoon.woff', revision: '10.05.21.1'},
  {url: 'assets/vendor/bootstrap-5.1.2/css/bootstrap.min.css', revision: '10.05.21.1'},
  {url: 'assets/vendor/bootstrap-5.1.2/js/bootstrap.bundle.min.js', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-1.7.1/images/layers.png', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-1.7.1/images/layers-2x.png', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-1.7.1/images/marker-icon.png', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-1.7.1/images/marker-icon-2x.png', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-1.7.1/images/marker-shadow.png', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-1.7.1/leaflet.css', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-1.7.1/leaflet.js', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-locatecontrol-0.74.0/L.Control.Locate.min.css', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-locatecontrol-0.74.0/L.Control.Locate.min.js', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-measure-path-1.5.0/leaflet-measure-path.css', revision: '10.05.21.1'},
  {url: 'assets/vendor/leaflet-measure-path-1.5.0/leaflet-measure-path.js', revision: '10.05.21.1'},
  {url: 'assets/vendor/flatgeobuf-3.17.5/flatgeobuf-geojson.min.js', revision: '10.05.21.1'},
  {url: 'assets/vendor/turf-6.5.0/turf.js', revision: '10.05.21.1'},
  {url: 'data/samplegrid.fgb', revision: '08.30.22.1'},
  {url: 'data/roads.fgb', revision: '09.05.22.1'},
  {url: 'data/publicland.fgb', revision: '09.05.22.1'},
  {url: 'data/dec_road_trail.fgb', revision: '09.06.22.1'},
  {url: 'data/HexID_snow_stake_labels.pdf', revision: '10.05.21.1'},
  {url: 'data/HexID_camera_info_sheet.pdf', revision: '10.05.21.1'}
], {
  // Ignore all URL parameters.
  ignoreURLParametersMatching: [/.*/]
});