((e, t) => {
  'object' == typeof exports && 'undefined' != typeof module
    ? t(exports)
    : 'function' == typeof define && define.amd
    ? define(['exports'], t)
    : t(
        (((e = 'undefined' != typeof globalThis ? globalThis : e || self).PMS =
          e.PMS || {}),
        (e.PMS.CCBIMSDK = {})),
      );
})(this, function (e) {
  var s,
    t,
    o = '2026_07_15_14_55';
  if (!window) throw Error('CCBIM JSAPI can only be used in Browser.');
  ((t = s = s || {}).notload = 'notload'),
    (t.loading = 'loading'),
    (t.loaded = 'loaded'),
    (t.failed = 'failed');
  let l = { CCBIM: s.notload },
    d = [
      '/ccbim/ccbim.iife.js?v=' + o,
      '/ccbim/ccbim.iife.css?v=' + o,
      '/ccbim/assets/iconfont/iconfont.js?v=' + o,
    ],
    n = [];
  function a(t, o, i) {
    if (
      ((e, t) => {
        for (var o = 0; o < e.length; o++) if (e[o] == t) return 1;
      })(n, t)
    )
      o && o(t);
    else {
      let e = null;
      t.substr(t.lastIndexOf('.')).toLowerCase().includes('.js')
        ? (((e = document.createElement('script')).src = t),
          (e.type = 'text/javascript'))
        : (((e = document.createElement('link')).href = t),
          (e.rel = 'stylesheet'),
          (e.type = 'text/css')),
        document.getElementsByTagName('head')[0].appendChild(e),
        e.addEventListener('load', () => {
          n.push(t), o && o(t);
        }),
        e.addEventListener('error', () => {
          i && i(t);
        });
    }
  }
  (e.CcbimSDKLoader = class {
    load(n) {
      return new Promise((o, i) => {
        if (l.CCBIM === s.notload) {
          (window.CcbimSDKLoaderConfig = n), (l.CCBIM = s.loading);
          let t = 0;
          for (let e = 0; e < d.length; e++)
            a(
              n.staticHost + '/ccbimSDK@' + n.version + d[e],
              (e) => {
                console.log(e), ++t === d.length && ((l.CCBIM = s.loaded), o());
              },
              (e) => {
                (l.CCBIM = s.failed), i(e + '加载失败');
              },
            );
        } else
          l.CCBIM === s.loaded
            ? o()
            : l.CCBIM === s.failed && i('资源加载失败');
      });
    }
  }),
    (e.CcbimSDKLoaderConfig = class {
      constructor() {
        (this.staticHost = ''), (this.version = '3.5.0'), (this.language = '');
      }
    }),
    Object.defineProperty(e, '__esModule', { value: !0 });
});
