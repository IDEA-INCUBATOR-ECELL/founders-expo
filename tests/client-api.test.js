import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi } from "../src/api.js";
test("Vercel preview leaves the showcase empty without backend requests", async () => {
  const api = createApi({
    preview: true,
    fetcher: () => {
      throw new Error("Unexpected network request");
    },
  });
  const startups = await api("/startups");
  assert.deepEqual(startups, []);
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

test("submission sends retry key and only confirms after the server response", async () => {
  const completed = [];
  const entry = { key: "saved_retry_key_123456" };
  const store = {
    prepare: async () => entry,
    complete: async (e, r) => completed.push(r),
  };
  const api = createApi({
    submissionStore: store,
    fetcher: async (_url, options) => {
      assert.equal(options.headers["Idempotency-Key"], entry.key);
      return Response.json({ id: "MGIT-SAVED" });
    },
  });
  assert.equal(
    (await api("/applications", { method: "POST", body: { name: "Example" } }))
      .id,
    "MGIT-SAVED",
  );
  assert.equal(completed.length, 1);
  const failing = createApi({
    submissionStore: store,
    fetcher: async () => {
      throw Error("offline");
    },
  });
  await assert.rejects(
    failing("/applications", { method: "POST", body: { name: "Example" } }),
    /Unable to reach/,
  );
  assert.equal(completed.length, 1);
});
