// The reading plan and where you are in it.
// The plan only moves on after you finish a day, so a missed day never puts you behind.

import { read, write } from "./db.js";
import { dateKey } from "./util.js";

const KEY = "current";
let plan = [];

export async function loadPlan() {
  plan = await (await fetch("data/plan.json")).json();
}

export const planLength = () => plan.length;
export const readingFor = (day) => plan.find((entry) => entry.day === day);

/** Every passage in the `count` days after `day`, nearest first. */
export const passagesAfter = (day, count) =>
  plan.filter((entry) => entry.day > day && entry.day <= day + count).flatMap((entry) => entry.passages);

/** Where you are now: { day, doneOn }, where doneOn is the date you finished that day, or null. */
export async function currentProgress() {
  const progress = (await read("progress", KEY)) || { day: 1, doneOn: null };
  // A day finished on an earlier date has had its turn, so move on by exactly one.
  // Unfinished days stay put however much time passes.
  if (progress.doneOn && progress.doneOn < dateKey()) {
    progress.day += 1;
    progress.doneOn = null;
    await write("progress", KEY, progress);
  }
  return progress;
}

export async function markRead() {
  const progress = await currentProgress();
  progress.doneOn = dateKey();
  await write("progress", KEY, progress);
  return progress;
}
