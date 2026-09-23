const initial = () => ({
  members: [{ name: "", role: "", skills: "", profile: "" }],
  founderCount: 1,
});
function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("mgit-expo", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readDraft() {
  try {
    const db = await database();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("drafts", "readonly");
      const request = tx.objectStore("drafts").get("application");
      request.onsuccess = () => resolve(request.result || legacy());
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return legacy();
  }
}
function legacy() {
  try {
    return JSON.parse(localStorage.getItem("mgit-draft")) || initial();
  } catch {
    return initial();
  }
}
export async function saveDraft(data) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("drafts", "readwrite");
    tx.objectStore("drafts").put(data, "application");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function clearDraft() {
  try {
    localStorage.removeItem("mgit-draft");
  } catch {}
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("drafts", "readwrite");
    tx.objectStore("drafts").delete("application");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
