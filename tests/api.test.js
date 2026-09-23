import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { validateApplication } from "../shared/schema.js";

const dir = mkdtempSync(path.join(tmpdir(), "mgit-expo-test-"));
const base = "http://localhost:5199/api";
let server, cookie, application;
const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6VAAAAABJRU5ErkJggg==";
const valid = {
  founderName: "Test Founder",
  email: "founder@example.com",
  phone: "+91 9876543210",
  department: "CSE",
  year: "3rd year",
  founderCount: 1,
  name: "Test venture",
  tagline: "A real integration test",
  category: "SaaS",
  stage: "MVP",
  logo: { name: "logo.png", data: pixel },
  problem: "A problem",
  targetUsers: "Students",
  alternatives: "Spreadsheets",
  solution: "A solution",
  value: "Unique value",
  productDescription: "A product",
  productStatus: "Live product",
  businessModel: "Subscription",
  revenueModel: "Monthly",
  customers: "10",
  market: "Student teams",
  display: "A working demo",
  members: [{ name: "Test Founder", role: "Founder", skills: "React" }],
  hiring: true,
  requiredRoles: ["Developers"],
  requiredSkills: "JavaScript",
  openings: 1,
  opportunity: "Build with us",
};
async function request(
  route,
  { body, method = "GET", auth = false, headers = {} } = {},
) {
  const r = await fetch(base + route, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json(), headers: r.headers };
}
before(async () => {
  server = spawn(process.execPath, ["server/index.js", "--production"], {
    env: {
      ...process.env,
      PORT: "5199",
      DATA_DIR: dir,
      ADMIN_EMAIL: "test@mgit.ac.in",
      ADMIN_PASSWORD: "test-only-password",
      SEED_DEMO: "false",
    },
    stdio: "pipe",
  });
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(base + "/startups");
      return;
    } catch {
      await delay(200);
    }
  }
  throw new Error("Test server failed to start");
});
after(async () => {
  server?.kill();
  await delay(400);
  rmSync(dir, { recursive: true, force: true });
});
test("registration validator rejects missing fields, invalid URLs and incomplete teams", () => {
  assert.equal(Object.keys(validateApplication(valid)).length, 0);
  assert.ok(validateApplication({}).founderName);
  assert.ok(
    validateApplication({ ...valid, website: "javascript:alert(1)" }).website,
  );
  assert.ok(validateApplication({ ...valid, members: [] }).members);
  assert.ok(validateApplication({ ...valid, requiredRoles: [] }).requiredRoles);
  assert.ok(validateApplication({ ...valid, name: 42 }).name);
  assert.ok(validateApplication({ ...valid, members: [null] }).members);
  assert.ok(validateApplication({ ...valid, images: [1, 2, 3, 4] }).images);
});
test("private organizer endpoints require authentication", async () => {
  assert.equal((await request("/admin")).status, 401);
  assert.equal((await request("/admin/export")).status, 401);
  assert.equal(
    (
      await request("/login", {
        method: "POST",
        body: { email: "test@mgit.ac.in", password: "wrong" },
      })
    ).status,
    401,
  );
});
test("incomplete applications and disguised files are rejected", async () => {
  assert.equal(
    (
      await request("/applications", {
        method: "POST",
        body: { name: "Partial" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/applications", {
        method: "POST",
        body: {
          ...valid,
          logo: { name: "bad.png", data: "data:image/png;base64,SGVsbG8=" },
        },
      })
    ).status,
    400,
  );
});
test("application lifecycle, stall collision, private feedback, ideas and logout", async () => {
  const created = await request("/applications", {
    method: "POST",
    body: valid,
  });
  assert.equal(created.status, 201);
  application = created.data;
  assert.match(application.id, /^MGIT-/);
  assert.ok(application.token);
  assert.equal((await request("/startups")).data.length, 0);
  assert.equal(
    (await request("/applications/" + application.id + "/status")).status,
    404,
  );
  assert.equal(
    (
      await request("/applications/" + application.id + "/status", {
        headers: { "x-tracking-token": application.token },
      })
    ).data.status,
    "Submitted",
  );
  const login = await request("/login", {
    method: "POST",
    body: { email: "test@mgit.ac.in", password: "test-only-password" },
  });
  assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie").split(";")[0];
  assert.match(login.headers.get("set-cookie"), /HttpOnly/);
  assert.equal(
    (await request("/admin", { auth: true })).data.applications[0].trackingHash,
    undefined,
  );
  assert.equal(
    (
      await request("/admin/applications/" + application.id, {
        method: "PATCH",
        auth: true,
        body: {
          status: "Approved",
          stall: "A-01",
          notes: "Private review note",
        },
      })
    ).status,
    200,
  );
  const profile = (await request("/startups")).data[0];
  assert.equal(profile.name, valid.name);
  assert.equal(profile.stall, "A-01");
  for (const key of ["email", "phone", "notes", "trackingHash", "founderName"])
    assert.equal(profile[key], undefined);
  const feedback = await request("/feedback", {
    method: "POST",
    body: {
      startupId: application.id,
      overall: "Promising",
      problem: "Student operations",
      interesting: "The design",
      suggestions: "More integrations",
      questions: "When is launch?",
      visitorType: "Faculty",
    },
  });
  assert.equal(feedback.status, 201);
  const join = await request("/join", {
    method: "POST",
    body: {
      startupId: application.id,
      name: "Interested student",
      email: "student@example.com",
      skills: "React",
      message: "Happy to help",
    },
  });
  assert.equal(join.status, 201);
  const tracked = (
    await request("/applications/" + application.id + "/status", {
      headers: { "x-tracking-token": application.token },
    })
  ).data;
  assert.equal(tracked.feedback.length, 1);
  assert.equal(tracked.interests.length, 1);
  const other = (
    await request("/applications", {
      method: "POST",
      body: { ...valid, name: "Second venture" },
    })
  ).data;
  assert.equal(
    (
      await request("/admin/applications/" + other.id, {
        method: "PATCH",
        auth: true,
        body: { status: "Approved", stall: "A-01" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/ideas", {
        method: "POST",
        body: {
          mode: "idea",
          name: "Student",
          email: "student@example.com",
          department: "CSE",
          year: "2",
          problem: "Waste",
          solution: "Reuse",
          targetUsers: "Campus",
          why: "Less waste",
          skills: "Design",
        },
      })
    ).status,
    201,
  );
  const problem = (
    await request("/admin/problems", {
      method: "POST",
      auth: true,
      body: {
        title: "Improve campus recycling",
        description: "Make recycling easier to access.",
      },
    })
  ).data;
  assert.equal((await request("/problems")).data.length, 1);
  assert.equal(
    (
      await request("/ideas", {
        method: "POST",
        body: {
          mode: "rapid",
          name: "Student",
          email: "student@example.com",
          department: "CSE",
          year: "2",
          problemId: problem.id,
          solution: "Smart bins",
          explanation: "Better placement",
        },
      })
    ).status,
    201,
  );
  await request("/admin/problems/" + problem.id, {
    method: "PATCH",
    auth: true,
    body: { active: false },
  });
  assert.equal((await request("/problems")).data.length, 0);
  const admin = (await request("/admin", { auth: true })).data;
  assert.equal(admin.ideas.length, 1);
  assert.equal(admin.rapid.length, 1);
  assert.equal(admin.applications.length, 2);
  await request("/admin/applications/" + application.id, {
    method: "PATCH",
    auth: true,
    body: { status: "Rejected", notes: "Needs revision", stall: "" },
  });
  assert.equal((await request("/startups")).data.length, 0);
  assert.equal(
    (
      await request("/feedback", {
        method: "POST",
        body: { startupId: application.id },
      })
    ).status,
    404,
  );
  const csv = await fetch(base + "/admin/export", {
    headers: { Cookie: cookie },
  });
  assert.equal(csv.status, 200);
  assert.ok((await csv.text()).includes("Test venture"));
  await request("/logout", { method: "POST", auth: true });
  assert.equal((await request("/admin", { auth: true })).status, 401);
});
test("applications and private feedback survive a server restart", async () => {
  server.kill();
  await delay(400);
  server = spawn(process.execPath, ["server/index.js", "--production"], {
    env: { ...process.env, PORT: "5199", DATA_DIR: dir, SEED_DEMO: "false" },
    stdio: "pipe",
  });
  let response;
  for (let i = 0; i < 60; i++) {
    try {
      response = await request("/applications/" + application.id + "/status", {
        headers: { "x-tracking-token": application.token },
      });
      break;
    } catch {
      await delay(200);
    }
  }
  assert.equal(response.status, 200);
  assert.equal(response.data.status, "Rejected");
  assert.equal(response.data.feedback.length, 1);
  assert.equal(response.data.interests.length, 1);
});
