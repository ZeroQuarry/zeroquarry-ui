/* boot — runs every behaviour on DOMContentLoaded and exposes ZQ.init(root)
   so dynamically-inserted markup (e.g. content swapped in over fetch) can be
   re-initialised. Behaviours are idempotent via each node's data-zq-bound. */
(function () {
  "use strict";
  var ZQ = (window.ZQ = window.ZQ || {});

  ZQ.init = function (root) {
    root = root || document;
    if (ZQ.dialog) ZQ.dialog(root);
    if (ZQ.tabs) ZQ.tabs(root);
    if (ZQ.disclosure) ZQ.disclosure(root);
  };

  function boot() { ZQ.init(document); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
