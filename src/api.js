import { demoStartups } from "../server/seed.js";
const previewMessage =
  "This is an Expo preview. Submissions and organizer access will open when the live service is connected. Your application draft stays saved on this device.";
export function createApi({
  preview = false,
  fetcher = (...args) => fetch(...args),
} = {}) {
  return async function api(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    if (preview) {
      if (method === "GET" && url === "/startups")
        return demoStartups.map((startup) => ({
          ...startup,
          status: "Approved",
          isDemo: true,
        }));
      if (method === "GET" && url === "/problems") return [];
      throw new Error(previewMessage);
    }
    let response;
    try {
      response = await fetcher("/api" + url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
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
    if (!response.ok)
      throw new Error(data?.error || "Something went wrong. Please try again.");
    return data;
  };
}
export const api = createApi({ preview: import.meta.env?.MODE === "preview" });
