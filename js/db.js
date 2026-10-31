// A tiny IndexedDB store for everything the app remembers.
//
// Why not Cache Storage: your other apps delete every cache that isn't theirs when they update.
// IndexedDB isn't touched by that, so scripture, progress and the journal stay safe.

const DB_NAME = "day-unto-day"; // all your apps share this site, so the name has to be specific
// The journal store is empty until Phase 3. Creating it now means the database never has to be upgraded.
const STORES = ["progress", "passages", "journal"];

let opening;
function db() {
  opening ||= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => STORES.forEach((name) => req.result.createObjectStore(name));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      opening = null;
      reject(req.error);
    };
  });
  return opening;
}

export async function read(store, key) {
  const conn = await db();
  return new Promise((resolve, reject) => {
    const req = conn.transaction(store).objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function write(store, key, value) {
  const conn = await db();
  return new Promise((resolve, reject) => {
    const tx = conn.transaction(store, "readwrite");
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}
