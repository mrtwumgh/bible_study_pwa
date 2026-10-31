// Scripture from bible-api.com. Each passage is downloaded once and kept on the phone.

import { read, write } from "./db.js";

const TRANSLATION = "kjv";
// The API allows 15 requests every 30 seconds, so saving ahead leaves more than 2 seconds between each.
const SAVE_GAP_MS = 2500;

const keyFor = (reference) => `${TRANSLATION}:${reference}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A passage as [{ number, text }]. Throws if it isn't saved and can't be downloaded. */
export async function getVerses(reference) {
  const saved = await read("passages", keyFor(reference));
  if (saved) return saved;

  const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${TRANSLATION}`);
  if (!res.ok) throw new Error(`The Bible server replied ${res.status}.`);
  const { verses } = await res.json();

  // The API's text has line breaks in the middle of sentences, so tidy the spacing.
  const clean = verses.map((v) => ({ number: v.verse, text: v.text.replace(/\s+/g, " ").trim() }));
  await write("passages", keyFor(reference), clean);
  return clean;
}

let saving = false;

/** Quietly download upcoming passages one at a time, so they're ready if you're offline on the day. */
export async function saveAhead(references) {
  if (saving) return;
  saving = true;
  try {
    for (const reference of references) {
      if (await read("passages", keyFor(reference))) continue;
      await getVerses(reference);
      await wait(SAVE_GAP_MS);
    }
  } catch {
    /* offline or rate limited: the rest are saved the next time the app opens */
  } finally {
    saving = false;
  }
}
