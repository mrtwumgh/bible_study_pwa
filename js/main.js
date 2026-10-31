// Starts the app: switches between the Today and Journal tabs and registers the service worker.

const $ = (s) => document.querySelector(s);
const TABS = ["today", "journal"];
let tab = "today";

function render() {
  for (const name of TABS) {
    $(`#view-${name}`).hidden = name !== tab;
    $(`[data-tab="${name}"]`).setAttribute("aria-current", name === tab ? "page" : "false");
  }
}

$("nav.tabs").onclick = (e) => {
  const btn = e.target.closest("[data-tab]");
  if (!btn || btn.dataset.tab === tab) return;
  tab = btn.dataset.tab;
  render();
  scrollTo({ top: 0 });
};

render();

// Service workers only run on HTTPS (or localhost), so a plain http:// preview skips this.
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
