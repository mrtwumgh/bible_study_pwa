// The Journal tab: your reflections, newest first. Each day opens and closes with a tap.

import { allEntries } from "../journal.js";
import { esc } from "../util.js";

// T00:00 keeps the date in local time. Without it, the browser would read the date as UTC.
const shortDate = (key) => new Date(`${key}T00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export async function renderJournal(view) {
  const entries = await allEntries();
  if (!entries.length) {
    view.innerHTML = `
      <h1>Journal</h1>
      <p class="sub">Nothing here yet. Write under today's question and it will appear here.</p>`;
    return;
  }

  view.innerHTML = `
    <h1>Journal</h1>
    <ul class="entries">${entries
      .map(
        (entry, i) => `
        <li><details ${i === 0 ? "open" : ""}>
          <summary><b>Day ${entry.day}</b><span class="sub">${esc(entry.passages.join(", "))} · ${shortDate(entry.date)}</span></summary>
          ${entry.question ? `<p class="sub">${esc(entry.question)}</p>` : ""}
          <p class="entry">${esc(entry.text)}</p>
        </details></li>`,
      )
      .join("")}</ul>`;
}
