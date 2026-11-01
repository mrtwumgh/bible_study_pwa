// The Today tab: the day's passages, the reflection question, and "Mark as read".

import { currentProgress, markRead, readingFor, passagesAfter, planLength } from "../plan.js";
import { getVerses, saveAhead } from "../bible.js";
import { getEntry, saveEntry } from "../journal.js";
import { esc } from "../util.js";

const SAVE_AHEAD_DAYS = 7;
let shownDay = 0; // the day on screen, so coming back to the app only redraws when the reading changed

async function loadPassage(section) {
  const reference = section.dataset.passage;
  const body = section.querySelector(".body");
  body.innerHTML = `<p class="sub">Loading…</p>`;
  try {
    const verses = await getVerses(reference);
    // value= sets the list number, so a passage that starts partway through a chapter still numbers correctly.
    body.innerHTML = `<ol class="verses">${verses.map((v) => `<li value="${v.number}">${esc(v.text)}</li>`).join("")}</ol>`;
  } catch {
    body.innerHTML = `
      <p class="sub">Couldn't load ${esc(reference)}. Check your connection and try again.</p>
      <button class="retry" data-retry>Try again</button>`;
  }
}

function showStatus(view, progress) {
  const next = readingFor(progress.day + 1);
  view.querySelector(".status").innerHTML = progress.doneOn
    ? `<p class="done">Read. ${next ? "Your next reading comes tomorrow." : "That was the last day of the plan."}</p>`
    : `<button class="big" data-mark>Mark as read</button>`;
}

function showFinished(view) {
  view.innerHTML = `
    <h1>Plan finished</h1>
    <p class="sub">You've read all ${planLength()} days of John and the Psalms.</p>`;
}

export async function renderToday(view) {
  const progress = await currentProgress();
  const reading = readingFor(progress.day);
  if (!reading) return showFinished(view);
  const entry = await getEntry(progress.day);
  if (progress.day === shownDay) return showStatus(view, progress); // same reading: keep your place on the page
  shownDay = progress.day;

  view.innerHTML = `
    <h1>Today</h1>
    <p class="sub">Day ${reading.day} of ${planLength()}</p>
    ${reading.passages
      .map((p) => `<section class="passage" data-passage="${esc(p)}"><h2>${esc(p)}</h2><div class="body"></div></section>`)
      .join("")}
    <aside class="reflect">
      <h2>Reflect</h2>
      ${reading.question ? `<p>${esc(reading.question)}</p>` : ""}
      <textarea id="entry" aria-label="Your reflection" placeholder="Write a short reflection">${esc(entry?.text || "")}</textarea>
      <p class="hint">Saved on this phone as you type.</p>
    </aside>
    <div class="status" aria-live="polite"></div>`;
  showStatus(view, progress);

  // Saved on every keystroke, not with a button, so swiping the app away can't lose anything.
  view.oninput = (e) => {
    if (e.target.id === "entry") saveEntry(reading, e.target.value);
  };

  view.onclick = async (e) => {
    if (e.target.closest("[data-mark]")) showStatus(view, await markRead());
    const retry = e.target.closest("[data-retry]");
    if (retry) loadPassage(retry.closest(".passage"));
  };

  await Promise.all([...view.querySelectorAll(".passage")].map(loadPassage));
  saveAhead(passagesAfter(reading.day, SAVE_AHEAD_DAYS));
}
