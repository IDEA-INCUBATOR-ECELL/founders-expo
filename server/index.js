import { loadEnvFile } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
try {
  loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const { default: app } = await import("./app.js");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (
  process.argv.includes("--production") ||
  process.env.NODE_ENV === "production"
) {
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
const port = Number(process.env.PORT || 5173);
app.listen(port, "0.0.0.0", () =>
  console.log("MGIT Expo ready at http://localhost:" + port),
);
