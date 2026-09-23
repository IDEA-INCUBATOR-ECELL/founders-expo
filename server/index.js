import express from "express";
import { DatabaseSync } from "node:sqlite";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateApplication } from "../shared/schema.js";
import { demoStartups } from "./seed.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR || path.join(root, ".data");
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "expo.sqlite"));
db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
for (const table of [
  "users",
  "startups",
  "startup_members",
  "startup_products",
  "startup_requirements",
  "startup_applications",
  "feedback",
  "idea_submissions",
  "rapid_fire_submissions",
  "stall_assignments",
  "join_interests",
  "sessions",
  "problem_statements",
])
  db.exec(
    `CREATE TABLE IF NOT EXISTS ${table} (id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
  );
const all = (t) =>
  db
    .prepare(`SELECT id,data,created_at FROM ${t} ORDER BY created_at DESC`)
    .all()
    .map((r) => ({ ...JSON.parse(r.data), id: r.id, createdAt: r.created_at }));
const get = (t, id) => {
  const row = db.prepare(`SELECT data FROM ${t} WHERE id=?`).get(id);
  return row ? { ...JSON.parse(row.data), id } : null;
};
const put = (t, id, data) =>
  db
    .prepare(
      `INSERT INTO ${t}(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data`,
    )
    .run(id, JSON.stringify(data));
const hash = (s) => createHash("sha256").update(s).digest("hex");
if (!all("users").length) {
  const email = process.env.ADMIN_EMAIL || "organizer@mgit.ac.in";
  const password =
    process.env.ADMIN_PASSWORD || randomBytes(18).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  put("users", randomUUID(), {
    email,
    salt,
    passwordHash: scryptSync(password, salt, 64).toString("hex"),
    role: "organizer",
  });
  if (!process.env.ADMIN_PASSWORD)
    writeFileSync(
      path.join(dataDir, "organizer-credentials.txt"),
      `Local organizer access\nEmail: ${email}\nPassword: ${password}\n\nKeep this file private. It is excluded from git.\n`,
    );
}
if (!existsSync(path.join(dataDir, "seeded"))) {
  if (process.env.SEED_DEMO !== "false")
    for (const s of demoStartups)
      put("startups", s.id, { ...s, status: "Approved", isDemo: true });
  writeFileSync(path.join(dataDir, "seeded"), "1");
}
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "24mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.path.startsWith("/api")) res.setHeader("Cache-Control", "no-store");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    new URL(req.headers.origin).host !== req.headers.host
  )
    return res
      .status(403)
      .json({ error: "This request must come from the Expo website." });
  next();
});
const limits = new Map();
app.use("/api", (req, res, next) => {
  if (req.method === "GET") return next();
  const key = req.ip + req.path;
  const now = Date.now();
  const bucket = limits.get(key) || { time: now, count: 0 };
  if (now - bucket.time > 60000) {
    bucket.time = now;
    bucket.count = 0;
  }
  bucket.count++;
  limits.set(key, bucket);
  if (bucket.count > 40)
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again in a minute." });
  next();
});
setInterval(() => {
  for (const [k, v] of limits)
    if (Date.now() - v.time > 60000) limits.delete(k);
}, 60000).unref();
const auth = (req, res, next) => {
  const token = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("expo_session="))
    ?.split("=")[1];
  const session = token ? get("sessions", hash(token)) : null;
  if (!session || session.expires < Date.now())
    return res.status(401).json({ error: "Please sign in as an organizer." });
  req.user = get("users", session.userId);
  if (!req.user) return res.status(401).json({ error: "Session expired." });
  next();
};
app.post("/api/login", (req, res) => {
  const user = all("users").find(
    (u) => u.email === String(req.body.email).toLowerCase(),
  );
  const candidate = scryptSync(
    String(req.body.password || "").slice(0, 256),
    user?.salt || "missing",
    64,
  );
  if (
    !user ||
    !timingSafeEqual(candidate, Buffer.from(user.passwordHash, "hex"))
  )
    return res.status(401).json({ error: "Email or password is incorrect." });
  const token = randomBytes(32).toString("hex");
  put("sessions", hash(token), {
    userId: user.id,
    expires: Date.now() + 86400000,
  });
  res
    .cookie("expo_session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: 86400000,
      path: "/",
    })
    .json({ email: user.email });
});
app.post("/api/logout", auth, (req, res) => {
  const token = req.headers.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("expo_session="))
    ?.split("=")[1];
  if (token) db.prepare("DELETE FROM sessions WHERE id=?").run(hash(token));
  res.clearCookie("expo_session").json({ ok: true });
});
app.get("/api/me", auth, (req, res) => res.json({ email: req.user.email }));
app.get("/api/startups", (req, res) =>
  res.json(all("startups").filter((s) => s.status === "Approved")),
);
app.get("/api/problems", (req, res) =>
  res.json(all("problem_statements").filter((p) => p.active)),
);

function checkFile(file) {
  if (
    !file ||
    typeof file.data !== "string" ||
    !/^data:image\/(png|jpeg|webp);base64,/.test(file.data)
  )
    throw new Error("Upload a PNG, JPEG or WebP image.");
  const b = Buffer.from(file.data.split(",")[1], "base64");
  if (b.length > 2 * 1024 * 1024)
    throw new Error("Each image must be smaller than 2 MB.");
  const valid =
    b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    (b[0] === 255 && b[1] === 216 && b[2] === 255) ||
    (b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP");
  if (!valid) throw new Error("This image file is invalid.");
  return { name: String(file.name || "image").slice(0, 100), data: file.data };
}
app.post("/api/applications", (req, res) => {
  const data = req.body;
  const errors = validateApplication(data);
  if (Object.keys(errors).length)
    return res
      .status(400)
      .json({ error: "Please complete all required information.", errors });
  try {
    data.logo = checkFile(data.logo);
    data.images = (data.images || []).slice(0, 3).map(checkFile);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  const id = "MGIT-" + randomBytes(5).toString("hex").toUpperCase();
  const token = randomBytes(24).toString("hex");
  db.exec("BEGIN");
  try {
    put("startup_applications", id, {
      ...data,
      status: "Submitted",
      trackingHash: hash(token),
      notes: "",
      submittedAt: new Date().toISOString(),
    });
    for (const m of data.members)
      put("startup_members", randomUUID(), { applicationId: id, ...m });
    put("startup_products", id, {
      applicationId: id,
      description: data.productDescription,
      status: data.productStatus,
      images: data.images,
      demo: data.demo,
      prototype: data.prototype,
      video: data.video,
    });
    put("startup_requirements", id, {
      applicationId: id,
      ...Object.fromEntries(
        [
          "display",
          "demonstration",
          "electricity",
          "table",
          "monitor",
          "internet",
          "otherRequirements",
        ].map((k) => [k, data[k]]),
      ),
    });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  res.status(201).json({ id, token, status: "Submitted" });
});
app.get("/api/applications/:id/status", (req, res) => {
  const a = get("startup_applications", req.params.id);
  if (!a || hash(req.headers["x-tracking-token"] || "") !== a.trackingHash)
    return res
      .status(404)
      .json({
        error:
          "Application not found. Check your reference ID and private access code.",
      });
  res.json({
    id: a.id,
    name: a.name,
    status: a.status,
    stall: get("stall_assignments", a.id)?.stall,
    feedback: all("feedback").filter((f) => f.startupId === a.id),
    interests: all("join_interests").filter((f) => f.startupId === a.id),
  });
});
const requiredText = (data, keys) =>
  keys.every(
    (k) =>
      typeof data[k] === "string" && data[k].trim() && data[k].length <= 6000,
  );
app.post("/api/feedback", (req, res) => {
  const d = req.body;
  const s = get("startups", d.startupId);
  if (!s || s.status !== "Approved")
    return res.status(404).json({ error: "Startup not found." });
  if (
    !requiredText(d, [
      "overall",
      "problem",
      "interesting",
      "suggestions",
      "questions",
      "visitorType",
    ]) ||
    !["Student", "Faculty", "Industry", "Other"].includes(d.visitorType)
  )
    return res
      .status(400)
      .json({ error: "Please complete every feedback question." });
  put("feedback", randomUUID(), { ...d, createdAt: new Date().toISOString() });
  res.status(201).json({ ok: true });
});
app.post("/api/join", (req, res) => {
  const d = req.body;
  const s = get("startups", d.startupId);
  if (!s || s.status !== "Approved" || !s.hiring)
    return res
      .status(400)
      .json({
        error: "This startup is not currently looking for team members.",
      });
  if (
    !requiredText(d, ["name", "email", "skills", "message"]) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)
  )
    return res
      .status(400)
      .json({ error: "Complete your details with a valid email address." });
  put("join_interests", randomUUID(), d);
  res.status(201).json({ ok: true });
});
app.post("/api/ideas", (req, res) => {
  const d = req.body;
  const keys = ["name", "email", "department", "year", "solution"];
  if (d.mode === "rapid") keys.push("problemId", "explanation");
  else keys.push("problem", "targetUsers", "why", "skills");
  if (!requiredText(d, keys) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    return res
      .status(400)
      .json({
        error: "Please complete the required fields with a valid email.",
      });
  if (d.mode === "rapid" && !get("problem_statements", d.problemId)?.active)
    return res
      .status(400)
      .json({ error: "Choose an active NEC problem statement." });
  const id = "IDEA-" + randomBytes(4).toString("hex").toUpperCase();
  put(
    d.mode === "rapid" ? "rapid_fire_submissions" : "idea_submissions",
    id,
    d,
  );
  res.status(201).json({ id });
});
app.get("/api/admin", auth, (req, res) =>
  res.json({
    applications: all("startup_applications").map(
      ({ trackingHash, ...a }) => a,
    ),
    startups: all("startups"),
    feedback: all("feedback"),
    ideas: all("idea_submissions"),
    rapid: all("rapid_fire_submissions"),
    interests: all("join_interests"),
    problems: all("problem_statements"),
  }),
);
app.patch("/api/admin/applications/:id", auth, (req, res) => {
  const a = get("startup_applications", req.params.id);
  if (!a) return res.status(404).json({ error: "Application not found." });
  const { status, notes, stall } = req.body;
  if (
    !["Draft", "Submitted", "Under Review", "Approved", "Rejected"].includes(
      status,
    )
  )
    return res.status(400).json({ error: "Invalid status." });
  if (
    stall &&
    (!/^[a-zA-Z0-9 -]{1,16}$/.test(stall) ||
      all("stall_assignments").some(
        (s) => s.id !== a.id && s.stall.toLowerCase() === stall.toLowerCase(),
      ) ||
      all("startups").some(
        (s) => s.id !== a.id && s.stall?.toLowerCase() === stall.toLowerCase(),
      ))
  )
    return res
      .status(400)
      .json({
        error: "Choose a unique stall number (up to 16 letters or numbers).",
      });
  const updated = { ...a, status, notes: String(notes || "").slice(0, 6000) };
  db.exec("BEGIN");
  try {
    put("startup_applications", a.id, updated);
    if (stall) put("stall_assignments", a.id, { applicationId: a.id, stall });
    else db.prepare("DELETE FROM stall_assignments WHERE id=?").run(a.id);
    const keys = [
      "name",
      "tagline",
      "category",
      "stage",
      "logo",
      "website",
      "social",
      "problem",
      "solution",
      "targetUsers",
      "value",
      "productDescription",
      "productStatus",
      "demo",
      "prototype",
      "images",
      "video",
      "businessModel",
      "hiring",
      "requiredRoles",
      "requiredSkills",
      "openings",
      "opportunity",
    ];
    if (status === "Approved")
      put("startups", a.id, {
        ...Object.fromEntries(keys.map((k) => [k, a[k]])),
        members: a.members.map(({ name, role, skills, profile }) => ({
          name,
          role,
          skills,
          profile,
        })),
        status,
        stall: stall || null,
        theme: "sky",
        symbol: "spark",
        isDemo: false,
      });
    else if (get("startups", a.id))
      put("startups", a.id, { ...get("startups", a.id), status });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  res.json({ ok: true });
});
app.post("/api/admin/problems", auth, (req, res) => {
  if (!requiredText(req.body, ["title", "description"]))
    return res.status(400).json({ error: "Add a title and description." });
  const id = randomUUID();
  put("problem_statements", id, {
    title: req.body.title,
    description: req.body.description,
    active: true,
  });
  res.status(201).json({ id });
});
app.patch("/api/admin/problems/:id", auth, (req, res) => {
  const p = get("problem_statements", req.params.id);
  if (!p) return res.status(404).json({ error: "Not found." });
  put("problem_statements", p.id, { ...p, active: !!req.body.active });
  res.json({ ok: true });
});
app.delete("/api/admin/demo", auth, (req, res) => {
  for (const s of all("startups").filter((s) => s.isDemo))
    db.prepare("DELETE FROM startups WHERE id=?").run(s.id);
  res.json({ ok: true });
});
app.get("/api/admin/export", auth, (req, res) => {
  const fields = [
    "id",
    "name",
    "status",
    "category",
    "stage",
    "founderName",
    "email",
    "phone",
    "department",
    "year",
    "display",
    "electricity",
    "table",
    "monitor",
    "internet",
    "notes",
  ];
  const escape = (v) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="mgit-startup-applications.csv"',
  );
  res
    .type("text/csv")
    .send(
      "\uFEFF" +
        [
          fields,
          ...all("startup_applications").map((a) => fields.map((k) => a[k])),
        ]
          .map((r) => r.map(escape).join(","))
          .join("\r\n"),
    );
});
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Endpoint not found." }),
);
if (process.argv.includes("--production")) {
  app.use(express.static(path.join(root, "dist")));
  app.get("/{*path}", (req, res) =>
    res.sendFile(path.join(root, "dist", "index.html")),
  );
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
app.use((error, req, res, next) => {
  console.error(error.message);
  res
    .status(error.status || 500)
    .json({
      error:
        error.type === "entity.too.large"
          ? "Upload is too large. Use images under 2 MB."
          : "Something went wrong. Please try again.",
    });
});
const port = Number(process.env.PORT || 5173);
app.listen(port, "0.0.0.0", () =>
  console.log(`MGIT Expo ready at http://localhost:${port}`),
);
