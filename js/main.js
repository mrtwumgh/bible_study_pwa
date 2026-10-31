// Starts the app: loads the plan, switches between the tabs and registers the service worker.

import { loadPlan } from "./plan.js";
import { renderToday } from "./views/today.js";

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

// Ask Chrome not to clear this site's storage automatically. Chrome decides quietly, with no prompt.
navigator.storage?.persist?.();

await loadPlan();
renderToday($("#view-today"));

// An installed app can sit in the background for days without reloading,
// so check for the next reading whenever you come back to it.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) renderToday($("#view-today"));
});
