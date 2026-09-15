/* disclosure — a button that shows/hides a region (used for "advanced" folds).
   Markup: <button data-zq-disclosure aria-controls="adv" aria-expanded="false">Advanced</button>
           <div id="adv" hidden>…</div> */
(function () {
  "use strict";
  window.ZQ = window.ZQ || {};

  ZQ.disclosure = function init(root) {
    root.querySelectorAll("[data-zq-disclosure]").forEach(function (btn) {
      if (btn.dataset.zqBound) return;
      btn.dataset.zqBound = "1";
      var target = document.getElementById(btn.getAttribute("aria-controls"));
      if (!target) return;
      btn.setAttribute("aria-expanded", target.hidden ? "false" : "true");
      btn.addEventListener("click", function () {
        var opening = target.hidden;
        target.hidden = !opening;
        btn.setAttribute("aria-expanded", opening ? "true" : "false");
      });
    });
  };
})();
