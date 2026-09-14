// Local development server for the NS LUXURY VILLA admin system.
// Serves the built site (dist/) plus the same /api routes the Vercel
// serverless functions expose, backed by a local file store so you can
// try the whole flow without Vercel KV.
//
// Usage:  node server.mjs   (after `npm run build`)
// Env:    ADMIN_PASSWORD (optional; defaults to "nsadmin" locally)
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CONTENT,
  cloneDefault,
  normalizeContent,
} from "./api/_shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4198;
const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const DATA_DIR = path.join(ROOT, "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const SESSION_TTL = 60 * 60 * 24 * 7;

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nsadmin";

function loadStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  } catch {
    return { sessions: {}, content: null };
  }
}
function saveStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function readSessionToken(req) {
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/(?:^|;\s*)nsvilla_session=([^;\s]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function isAuthed(req) {
  const token = readSessionToken(req);
  const store = loadStore();
  if (!token || !store.sessions[token]) return false;
  if (Date.now() - store.sessions[token] > SESSION_TTL * 1000) {
    delete store.sessions[token];
    saveStore(store);
    return false;
  }
  return true;
}

function cookieFor(token) {
  return `nsvilla_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}`;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8",
};

function staticFile(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === "/" || rel === "/index") rel = "/index.html";
  if (rel === "/admin") rel = "/admin.html";
  if (!path.extname(rel) && fs.existsSync(path.join(DIST, rel + ".html"))) rel += ".html";
  const filePath = path.normalize(path.join(DIST, rel));
  if (!filePath.startsWith(DIST) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res, url) {
  const method = req.method;
  const bodyText = await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
  const body = bodyText ? JSON.parse(bodyText) : {};

  if (url.pathname === "/api/session" && method === "GET") {
    return json(res, 200, { authed: isAuthed(req) });
  }
  if (url.pathname === "/api/login" && method === "POST") {
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || password !== ADMIN_PASSWORD) return json(res, 401, { error: "Incorrect password." });
    const token = crypto.randomBytes(24).toString("hex");
    const store = loadStore();
    store.sessions[token] = Date.now();
    saveStore(store);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": cookieFor(token) });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (url.pathname === "/api/logout" && method === "POST") {
    const store = loadStore();
    const token = readSessionToken(req);
    if (token) delete store.sessions[token];
    saveStore(store);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": "nsvilla_session=; Path=/; Max-Age=0" });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (url.pathname === "/api/content" && method === "GET") {
    const store = loadStore();
    return json(res, 200, { content: store.content || cloneDefault() });
  }
  if (url.pathname === "/api/content" && method === "PUT") {
    if (!isAuthed(req)) return json(res, 401, { error: "Not authenticated." });
    const store = loadStore();
    store.content = normalizeContent(body);
    saveStore(store);
    return json(res, 200, { ok: true, content: store.content });
  }
  if (url.pathname === "/api/flyer-image" && method === "POST") {
    if (!isAuthed(req)) return json(res, 401, { error: "Not authenticated." });
    const filename = typeof body.filename === "string" ? body.filename.trim() : "";
    const data = typeof body.data === "string" ? body.data : "";
    if (!filename || !data) return json(res, 400, { error: "Missing filename or image data." });
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const safeName = filename.replace(/[^a-z0-9.\-_]/gi, "_").toLowerCase();
    const stored = `${Date.now()}-${safeName}`;
    await fsp.writeFile(path.join(UPLOADS_DIR, stored), Buffer.from(data, "base64"));
    return json(res, 200, { url: `/uploads/${stored}` });
  }
  return json(res, 404, { error: "Not found" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      return await handleApi(req, res, url);
    }
    if (url.pathname.startsWith("/uploads/")) {
      const name = path.basename(decodeURIComponent(url.pathname));
      const filePath = path.join(UPLOADS_DIR, name);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        return fs.createReadStream(filePath).pipe(res);
      }
      return json(res, 404, { error: "Not found" });
    }
    return staticFile(req, res, url.pathname);
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`NS LUXURY VILLA admin dev server → http://localhost:${PORT}`);
  console.log(`Admin UI at http://localhost:${PORT}/admin  (password: ${ADMIN_PASSWORD})`);
});