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
const MANAGEMENT_API_URL = (process.env.NSLV_MANAGEMENT_API_URL || "http://localhost:3001/api/v1").replace(/\/+$/, "");
// The booking functions read the env var themselves; give them the same local
// default so `node server.mjs` works without any configuration.
if (!process.env.NSLV_MANAGEMENT_API_URL) process.env.NSLV_MANAGEMENT_API_URL = MANAGEMENT_API_URL;
const { POST: createBooking } = await import("./api/create-booking.mjs");
const { POST: submitPaymentReference } = await import("./api/payment-reference.mjs");
const { GET: getPublicConfig } = await import("./api/public-config.mjs");

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

// Runs one of the Vercel booking functions against a plain Node request so the
// local server and the deployed site behave exactly the same (same validation,
// same whitelisting, same upstream payload).
async function runServerlessFunction(res, handler, pathname, bodyText) {
  try {
    const response = await handler(
      new Request(`http://local${pathname}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyText || "{}",
      }),
    );
    const text = await response.text();
    res.writeHead(response.status, {
      "Content-Type":
        response.headers.get("Content-Type") ||
        "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    });
    res.end(text);
  } catch (error) {
    console.error("[api] serverless function failed", error);
    json(res, 500, { error: "Unexpected server error." });
  }
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
  if (url.pathname === "/api/live-availability" && method === "GET") {
    const checkInDate = url.searchParams.get("checkInDate") || "";
    const checkOutDate = url.searchParams.get("checkOutDate") || "";
    const adults = url.searchParams.get("adults") || "1";
    const children = url.searchParams.get("children") || "0";
    const roomNumber = (url.searchParams.get("roomNumber") || "").trim();
    const requestBreakdown = url.searchParams.get("breakdown") === "true";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkInDate) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) {
      return json(res, 400, { error: "Choose valid arrival and departure dates." });
    }

    const isRoomAvailableIn = (data, roomNo) => {
      const code = String(roomNo || "").trim().toUpperCase();
      if (!code || !Array.isArray(data)) return false;
      return data.some(
        (type) =>
          type.available &&
          Array.isArray(type.availableRooms) &&
          type.availableRooms.some(
            (r) => String(r.number || "").trim().toUpperCase() === code,
          ),
      );
    };

    const getNightlyDates = (checkIn, checkOut) => {
      const dates = [];
      const start = new Date(checkIn + "T12:00:00Z");
      const end = new Date(checkOut + "T12:00:00Z");
      let curr = new Date(start);
      while (curr < end) {
        const next = new Date(curr);
        next.setDate(next.getDate() + 1);
        dates.push({
          date: curr.toISOString().slice(0, 10),
          nextDate: next.toISOString().slice(0, 10),
        });
        curr = next;
        if (dates.length >= 31) break;
      }
      return dates;
    };

    try {
      const target = new URL(`${MANAGEMENT_API_URL}/public/availability`);
      const q = { checkInDate, checkOutDate, adults, children };
      if (roomNumber) q.roomNumber = roomNumber;
      target.search = new URLSearchParams(q).toString();
      const upstream = await fetch(target, { signal: AbortSignal.timeout(8000) });
      const payload = await upstream.json();
      if (!upstream.ok) {
        return json(res, upstream.status, { error: payload?.error?.message || "Availability could not be checked." });
      }

      const data = payload?.data || [];
      const fullStayAvailable = roomNumber
        ? isRoomAvailableIn(data, roomNumber)
        : data.some((t) => t.available);

      const nights = getNightlyDates(checkInDate, checkOutDate);
      let nightlyBreakdown = null;

      if (roomNumber && nights.length > 1 && (requestBreakdown || !fullStayAvailable)) {
        try {
          nightlyBreakdown = await Promise.all(
            nights.map(async (n) => {
              try {
                const subTarget = new URL(`${MANAGEMENT_API_URL}/public/availability`);
                subTarget.search = new URLSearchParams({
                  checkInDate: n.date,
                  checkOutDate: n.nextDate,
                  adults,
                  children,
                  roomNumber,
                }).toString();
                const subRes = await fetch(subTarget, { signal: AbortSignal.timeout(6000) });
                const subBody = await subRes.json();
                return {
                  date: n.date,
                  nextDate: n.nextDate,
                  available: isRoomAvailableIn(subBody?.data, roomNumber),
                };
              } catch {
                return {
                  date: n.date,
                  nextDate: n.nextDate,
                  available: false,
                };
              }
            }),
          );
        } catch {
          nightlyBreakdown = null;
        }
      }

      return json(res, 200, {
        data,
        roomNumber: roomNumber || null,
        fullStayAvailable,
        nightlyBreakdown,
        searchTimestamp: new Date().toISOString(),
      });
    } catch {
      return json(res, 502, { error: "The reservation system could not be reached. Please try again shortly." });
    }
  }
  if (url.pathname === "/api/public-config" && method === "GET") {
    try {
      const response = await getPublicConfig();
      const text = await response.text();
      res.writeHead(response.status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      });
      return res.end(text);
    } catch {
      return json(res, 500, { error: "Failed to load public config." });
    }
  }
  if (url.pathname === "/api/create-booking" && method === "POST") {
    return runServerlessFunction(res, createBooking, "/api/create-booking", bodyText);
  }
  if (url.pathname === "/api/payment-reference" && method === "POST") {
    return runServerlessFunction(res, submitPaymentReference, "/api/payment-reference", bodyText);
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
