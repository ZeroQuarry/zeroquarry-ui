/* dialog — wires triggers to the native <dialog> element.
   Markup:  <button data-zq-dialog-open="confirm-scan">…</button>
            <dialog class="zq-dialog" id="confirm-scan" data-zq-dialog>
              … <button data-zq-dialog-close>Cancel</button>
            </dialog>
   Native <dialog> gives us focus trapping, Esc-to-close and the top layer. */
(function () {
  "use strict";
  window.ZQ = window.ZQ || {};

  ZQ.dialog = function init(root) {
    root.querySelectorAll("[data-zq-dialog-open]").forEach(function (trigger) {
      if (trigger.dataset.zqBound) return;
      trigger.dataset.zqBound = "1";
      trigger.addEventListener("click", function (event) {
        var dlg = document.getElementById(trigger.getAttribute("data-zq-dialog-open"));
        if (!dlg || typeof dlg.showModal !== "function") return;
        event.preventDefault();
        dlg.showModal();
        dlg.dispatchEvent(new CustomEvent("zq:dialogopen", { bubbles: true }));
      });
    });

    root.querySelectorAll("dialog[data-zq-dialog]").forEach(function (dlg) {
      if (dlg.dataset.zqBound) return;
      dlg.dataset.zqBound = "1";
      dlg.querySelectorAll("[data-zq-dialog-close]").forEach(function (btn) {
        btn.addEventListener("click", function () { dlg.close(); });
      });
      // A click that lands on the dialog itself (not its content) is the backdrop.
      dlg.addEventListener("click", function (event) {
        if (event.target === dlg) dlg.close();
      });
    });
  };
})();
