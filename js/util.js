// Small helpers shared across the app.

const pad = (n) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" in local time. Text in this format also sorts by date, so dates can be compared with <. */
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Escape text before putting it into innerHTML. */
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
