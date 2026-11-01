// Journal entries: one per day of the plan.
// They're saved by plan day, not calendar date, so each one stays with its reading however many days you miss.

import { read, readAll, write } from "./db.js";
import { dateKey } from "./util.js";

export const getEntry = (day) => read("journal", day);

/** Keeps a copy of the passages and question, so the entry still makes sense if the plan changes later. */
export const saveEntry = ({ day, passages, question }, text) =>
  write("journal", day, { day, passages, question, text, date: dateKey() });

/** Entries with something written in them, newest first. */
export const allEntries = async () => (await readAll("journal")).filter((entry) => entry.text.trim()).reverse();
