import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Database,
  databaseConfig,
  StorageUnavailable,
} from "../server/database.js";
test("missing Supabase configuration never creates a local fallback", async () => {
  const db = new Database(null);
  assert.equal(db.configured, false);
  await assert.rejects(db.all("startup_applications"), StorageUnavailable);
});
test("remote database TLS verification cannot be disabled through the URL", () => {
  const c = databaseConfig({
    SUPABASE_DB_URL:
      "postgresql://user:secret@example.com/postgres?sslmode=disable",
    DATABASE_LOCAL_TEST: "true",
  });
  assert.equal(c.ssl.rejectUnauthorized, true);
  assert.ok(!c.connectionString.includes("sslmode"));
  assert.equal(
    databaseConfig({
      SUPABASE_DB_URL: "postgresql://user@127.0.0.1/test",
      DATABASE_LOCAL_TEST: "true",
    }).ssl,
    false,
  );
});
