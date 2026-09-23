import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi } from "../src/api.js";
test("Vercel preview loads six labeled demo startups without backend requests", async () => {
  const api = createApi({
    preview: true,
    fetcher: () => {
      throw new Error("Unexpected network request");
    },
  });
  const startups = await api("/startups");
  assert.equal(startups.length, 6);
  assert.ok(
    startups.every(
      (s) =>
        s.isDemo &&
        s.status === "Approved" &&
        s.name &&
        s.problem &&
        s.members.length,
    ),
  );
  assert.deepEqual(await api("/problems"), []);
});
test("preview never pretends to submit or authenticate", async () => {
  const api = createApi({ preview: true });
  for (const route of [
    "/applications",
    "/feedback",
    "/ideas",
    "/join",
    "/login",
  ])
    await assert.rejects(
      api(route, { method: "POST", body: {} }),
      /Expo preview/,
    );
  await assert.rejects(api("/admin"), /Expo preview/);
});
test("text and HTML deployment errors return readable service errors", async () => {
  for (const [body, type] of [
    ["The page could not be found", "text/plain"],
    ["<!doctype html><html></html>", "text/html"],
  ]) {
    const api = createApi({
      fetcher: async () =>
        new Response(body, { status: 404, headers: { "content-type": type } }),
    });
    await assert.rejects(api("/startups"), /Expo service is unavailable/);
  }
});
test("malformed JSON is handled and API errors are preserved", async () => {
  const malformed = createApi({
    fetcher: async () =>
      new Response("not json", {
        headers: { "content-type": "application/json" },
      }),
  });
  await assert.rejects(malformed("/startups"), /unreadable response/);
  const denied = createApi({
    fetcher: async () =>
      Response.json({ error: "Please sign in." }, { status: 401 }),
  });
  await assert.rejects(denied("/admin"), /Please sign in/);
});
test("live mode never replaces empty showcases with demo data", async () => {
  const api = createApi({ fetcher: async () => Response.json([]) });
  assert.deepEqual(await api("/startups"), []);
});
