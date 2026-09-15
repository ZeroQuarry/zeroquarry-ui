/* tabs — ARIA tabs pattern (roving tabindex + arrow keys).
   Markup: <div data-zq-tabs>
             <div class="zq-tabs" role="tablist">
               <button class="zq-tab" role="tab" id="t1" aria-controls="p1" aria-selected="true">One</button>
               …
             </div>
             <div role="tabpanel" id="p1" aria-labelledby="t1">…</div>
           </div> */
(function () {
  "use strict";
  window.ZQ = window.ZQ || {};

  function tabsOf(tablist) {
    return Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  }

  function select(tablist, tab) {
    tabsOf(tablist).forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    tab.focus();
    tab.dispatchEvent(new CustomEvent("zq:tabchange", { bubbles: true, detail: { tab: tab } }));
  }

  ZQ.tabs = function init(root) {
    root.querySelectorAll('[data-zq-tabs] [role="tablist"]').forEach(function (tablist) {
      if (tablist.dataset.zqBound) return;
      tablist.dataset.zqBound = "1";

      tablist.addEventListener("click", function (event) {
        var tab = event.target.closest('[role="tab"]');
        if (tab && tablist.contains(tab)) select(tablist, tab);
      });

      tablist.addEventListener("keydown", function (event) {
        var tabs = tabsOf(tablist);
        var i = tabs.indexOf(document.activeElement);
        if (i === -1) return;
        var next = null;
        if (event.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (event.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (event.key === "Home") next = tabs[0];
        else if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) { event.preventDefault(); select(tablist, next); }
      });
    });
  };
})();
