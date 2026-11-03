// Shared helpers for NS LUXURY VILLA admin API.
// Storage: Vercel KV (Upstash Redis REST). Zero non-native dependencies.
import { randomBytes } from "node:crypto";

const KV_URL = process.env.KV_REST_API_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || "";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
export const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days
export const CONTENT_KEY = "nsvilla:content";
export const SESSION_PREFIX = "nsvilla:session:";
export const LOGIN_RATE_KEY = "nsvilla:login:attempts";

// ────────────────────────────────────────────────────────────
// KV (Upstash REST)
// ────────────────────────────────────────────────────────────
export function kvReady() {
  return Boolean(KV_URL && KV_TOKEN);
}

async function kvFetch(path, options = {}) {
  const r = await fetch(`${KV_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${KV_TOKEN}`, ...(options.headers || {}) },
  });
  if (!r.ok) throw new Error(`kv request failed: ${r.status}`);
  const j = await r.json();
  if (j && j.error) throw new Error(`kv error: ${j.error}`);
  return j;
}

export async function kvGet(key) {
  const j = await kvFetch(`/get/${encodeURIComponent(key)}`);
  return j.result; // string | null
}

export async function kvSet(key, value, exSeconds) {
  let path = `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
  if (exSeconds) path += `/EX/${exSeconds}`;
  await kvFetch(path, { method: "POST" });
}

export async function kvDel(key) {
  await kvFetch(`/del/${encodeURIComponent(key)}`);
}

export async function kvIncr(key, exSeconds) {
  const j = await kvFetch(`/incr/${encodeURIComponent(key)}`, { method: "POST" });
  if (exSeconds) await kvFetch(`/expire/${encodeURIComponent(key)}/${exSeconds}`);
  return j.result;
}

// ────────────────────────────────────────────────────────────
// Sessions
// ────────────────────────────────────────────────────────────
export function readSessionToken(req) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)nsvilla_session=([^;\s]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function isValidSession(token) {
  if (!token || !kvReady()) return false;
  try {
    const raw = await kvGet(SESSION_PREFIX + token);
    return Boolean(raw);
  } catch {
    return false;
  }
}

export async function createSession() {
  const token = randomBytes(24).toString("hex");
  await kvSet(SESSION_PREFIX + token, JSON.stringify({ createdAt: Date.now() }), SESSION_TTL);
  return token;
}

export async function destroySession(token) {
  if (token) await kvDel(SESSION_PREFIX + token);
}

// ────────────────────────────────────────────────────────────
// Default content (matches the current site text)
// ────────────────────────────────────────────────────────────
export const DEFAULT_CONTENT = {
  updatedAt: null,
  contact: {
    phone: "+233 535 572 774",
    phoneHref: "tel:+233535572774",
    email: "nsvilla4u@gmail.com",
    emailHref: "mailto:nsvilla4u@gmail.com",
    waPrimary: "233535572774",
    waSecondary: "233503340698",
    airbnb: "https://www.airbnb.com/rooms/1033338344846228851",
    tiktok: "https://www.tiktok.com/@ns.luxury.villa",
    facebook: "https://www.facebook.com/nsluxury.villa",
  },
  hero: {
    headline: "A proper stay in Ho.<br /><em>With room to rest.</em>",
    lead: "For work trips, family visits and short stays that need a clean room, a good bed and a simple place to reset.",
    note: "Pool · Bar · Restaurant · Rooftop · Rooms",
  },
  rooms: [
    {
      tag: "REST",
      title: "Private room stays",
      body: "Spacious ensuite rooms with air conditioning, hot water and a straightforward layout for a proper night’s rest.",
    },
    {
      tag: "TOGETHER",
      title: "Apartment stays",
      body: "Furnished apartments with a kitchen, living area and enough room for family, work or longer visits.",
    },
    {
      tag: "DAILY USE",
      title: "Practical essentials",
      body: "Starlink Wi‑Fi, TV and a full kitchen make longer stays easier. Private rooms also share key common spaces.",
    },
  ],
  amenities: [
    {
      tag: "DAYTIME",
      title: "Cool off in the middle of the day.",
      body: "The pool gives you a clear, practical place to rest, swim or sit in the shade without leaving the property.",
    },
    {
      tag: "EVENINGS",
      title: "Food, drink and conversation.",
      body: "The restaurant and bar are for a proper meal, a quiet drink and the sort of catch-up that makes the evening feel easier.",
    },
    {
      tag: "OUTDOOR",
      title: "Open space when you want it.",
      body: "The garden, terrace and rooftop give you room for fresh air, private gatherings and a little breathing room away from the busy part of town.",
    },
  ],
  pricing: [
    {
      tag: "JUST YOU",
      title: "Solo stay",
      body: "A clean room, reliable Wi‑Fi and enough space for a short visit or a work trip without extra fuss.",
      points: ["Ensuite comfort", "TV and Wi‑Fi", "Pool and lounge access"],
    },
    {
      tag: "FAMILY & FRIENDS",
      title: "Shared stay",
      body: "For couples, friends and family who need more room, a kitchen and a place to settle in comfortably.",
      points: ["Apartment and room choices", "Full kitchen access", "Pool, bar and garden access"],
    },
    {
      tag: "WORK OR GATHER",
      title: "Stay with purpose",
      body: "For business travel, family visits or longer stays where the basics matter and the details are easy to manage.",
      points: ["Daily cleaning", "24-hour security", "Simple planning support"],
    },
  ],
  footer: {
    tagline: "A practical stay in Ho, with room to rest.",
    copyright: "© 2026 NS LUXURY VILLA · Lokoe, Ho, Volta Region, Ghana",
  },
  flyers: [],
};

export function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
}

export function normalizeContent(input) {
  const base = cloneDefault();
  if (!input || typeof input !== "object") return base;
  const out = { ...base };
  for (const section of ["contact", "hero", "rooms", "amenities", "pricing", "footer", "flyers"]) {
    if (section === "flyers") {
      out.flyers = Array.isArray(input.flyers) ? input.flyers : [];
    } else if (input[section] && typeof input[section] === "object") {
      out[section] = Array.isArray(input[section])
        ? input[section].slice(0, 10)
        : { ...out[section], ...input[section] };
    }
  }
  out.updatedAt = new Date().toISOString();
  return out;
}

// ────────────────────────────────────────────────────────────
// HTTP helpers
// ────────────────────────────────────────────────────────────
export function json(res, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function readBody(req) {
  return req.text().then((t) => (t ? JSON.parse(t) : {}));
}

export function sessionCookie(token, secure = true) {
  return `nsvilla_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie(secure = true) {
  return `nsvilla_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function isSecure(req) {
  const proto = req.headers.get("x-forwarded-proto") || "";
  return proto === "https";
}