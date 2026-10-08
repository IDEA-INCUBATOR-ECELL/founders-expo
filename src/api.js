import { outbox } from "./submission-outbox.js";
const previewMessage =
  "This is an Expo preview. Submissions and organizer access will open when the live service is connected. Your application draft stays saved on this device.";
export function createApi({
  preview = false,
  fetcher = (...args) => fetch(...args),
  submissionStore = null,
} = {}) {
  return async function api(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    if (preview) {
      if (method === "GET" && url === "/startups") return [];
      if (method === "GET" && url === "/problems") return [];
      throw new Error(previewMessage);
    }
    const entry =
      submissionStore &&
      method === "POST" &&
      ["/applications", "/ideas", "/feedback", "/join"].includes(url)
        ? await submissionStore.prepare(url, options.body, options.retryKey)
        : null;
    let response;
    try {
      response = await fetcher("/api" + url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          ...(entry ? { "Idempotency-Key": entry.key } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw new Error(
        "Unable to reach the Expo service. Check your connection and try again.",
      );
    }
    if (!response.headers.get("content-type")?.includes("application/json"))
      throw new Error(
        "The Expo service is unavailable. Please try again later.",
      );
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The Expo service returned an unreadable response. Please try again later.",
      );
    }
    if (!response.ok) {
      if (entry && response.status < 500 && response.status !== 429)
        await submissionStore.reject?.(
          entry,
          data?.error || "Please correct this submission.",
        );
      throw new Error(data?.error || "Something went wrong. Please try again.");
    }
    if (entry) await submissionStore.complete(entry, data);
    return data;
  };
}
export const api = createApi({
  preview: import.meta.env?.MODE === "preview",
  submissionStore: outbox,
});
