!(function (e, t) {
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
  'use strict';
  if (!window) throw Error('CCBIM JSAPI can only be used in Browser.');
  var t;
  !(function (e) {
    (e.notload = 'notload'),
      (e.loading = 'loading'),
      (e.loaded = 'loaded'),
      (e.failed = 'failed');
  })(t || (t = {}));
  let o = { CCBIM: t.notload };
  const n = [
    '/ccbim/ccbim.umd.js',
    '/ccbim/ccbim.umd.css',
    '/ccbim/assets/iconfont/iconfont.js',
  ];
  let i = [];
  function s(e, t, o) {
    if (
      (function (e, t) {
        for (var o = 0; o < e.length; o++) if (e[o] == t) return !0;
        return !1;
      })(i, e)
    )
      t && t(e);
    else {
      let n = null;
      '.js' ==
      (function (e) {
        return e.substr(e.lastIndexOf('.')).toLowerCase();
      })(e)
        ? ((n = document.createElement('script')),
          (n.src = e),
          (n.type = 'text/javascript'))
        : ((n = document.createElement('link')),
          (n.href = e),
          (n.rel = 'stylesheet'),
          (n.type = 'text/css'));
      document.getElementsByTagName('head')[0].appendChild(n),
        n.addEventListener('load', () => {
          i.push(e), t && t(e);
        }),
        n.addEventListener('error', () => {
          o && o(e);
        });
    }
  }
  (e.CcbimSDKLoader = class {
    load(e) {
      return new Promise((i, d) => {
        if (o.CCBIM === t.notload) {
          (window.CcbimSDKLoaderConfig = e), (o.CCBIM = t.loading);
          let l = 0;
          for (let a = 0; a < n.length; a++) {
            s(
              e.staticHost + '/ccbimSDK@' + e.version + n[a],
              (e) => {
                console.log(e),
                  l++,
                  l === n.length && ((o.CCBIM = t.loaded), i());
              },
              (e) => {
                (o.CCBIM = t.failed), d(e + '加载失败');
              },
            );
          }
        } else
          o.CCBIM === t.loaded
            ? i()
            : o.CCBIM === t.failed && d('资源加载失败');
      });
    }
  }),
    (e.CcbimSDKLoaderConfig = class {
      constructor() {
        (this.staticHost = ''), (this.version = '2.0.0'), (this.language = '');
      }
    }),
    Object.defineProperty(e, '__esModule', { value: !0 });
});
