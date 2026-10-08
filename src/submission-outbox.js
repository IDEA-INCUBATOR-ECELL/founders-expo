const eventName = "expo-submissions-changed";
function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("mgit-expo-submissions", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("outbox", { keyPath: "key" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function operation(mode, work) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("outbox", mode);
    const request = work(tx.objectStore("outbox"));
    let value;
    request.onsuccess = () => {
      value = request.result;
    };
    tx.oncomplete = () => {
      db.close();
      resolve(value);
      if (mode === "readwrite") window.dispatchEvent(new Event(eventName));
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export const listSubmissions = () =>
  operation("readonly", (store) => store.getAll());
export const dismissSubmission = (key) =>
  operation("readwrite", (store) => store.delete(key));
export const submissionEvent = eventName;
export const outbox = {
  async prepare(route, body, retryKey) {
    const payload = JSON.stringify(body);
    const fingerprint = Array.from(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(payload),
        ),
      ),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("");
    const rows = await listSubmissions();
    const previous = rows.find((r) =>
      retryKey
        ? r.key === retryKey
        : r.route === route &&
          r.fingerprint === fingerprint &&
          r.state !== "rejected",
    );
    if (previous) return previous;
    const entry = {
      key: crypto.randomUUID(),
      route,
      body,
      fingerprint,
      state: "pending",
      createdAt: new Date().toISOString(),
    };
    try {
      await operation("readwrite", (store) => store.put(entry));
    } catch {
      throw new Error(
        "Your device could not save a recovery copy. Free some browser storage and retry; keep this form open.",
      );
    }
    return entry;
  },
  async reject(entry, error) {
    await operation("readwrite", (store) =>
      store.put({ ...entry, state: "rejected", error }),
    );
  },
  async complete(entry, receipt) {
    await operation("readwrite", (store) =>
      store.put({
        ...entry,
        state: "saved",
        receipt,
        savedAt: new Date().toISOString(),
      }),
    );
  },
};
