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
    headline: "Arrive as a guest.<br /><em>Stay as family.</em>",
    lead: "For workdays that need quiet, weekends that need air and visits that turn into stories—this is your place in the Volta Region.",
    note: "Pool · Bar · Restaurant · Rooftop · Comfortable stays",
  },
  rooms: [
    {
      tag: "REST",
      title: "Private room stays",
      body: "Spacious private rooms with attached bathrooms, AC and hot water for deep rest and easy mornings.",
    },
    {
      tag: "TOGETHER",
      title: "Entire apartment stays",
      body: "Fully furnished modern apartments for conversation, meals and family time.",
    },
    {
      tag: "SETTLE IN",
      title: "Everyday ease",
      body: "Starlink Wi-Fi, smart TVs and a full kitchen for a stay that works your way. Private-room guests also share selected common spaces.",
    },
  ],
  amenities: [
    {
      tag: "SLOW MORNING",
      title: "Start where the water is still.",
      body: "The covered pool brings a little calm to the middle of the day—whether you are swimming, sitting close by or simply taking pictures in the garden.",
    },
    {
      tag: "COME TOGETHER",
      title: "Good food, easy conversation.",
      body: "Our restaurant and bar are for the unplanned moments: a meal, a drink, a catch-up, a celebration or simply one more story before the evening ends.",
    },
    {
      tag: "BREATHE OUT",
      title: "Find your corner outside.",
      body: "The garden, outdoor lounge and rooftop make room for quiet pauses, fresh air and the kind of rest that stays with you.",
    },
  ],
  pricing: [
    {
      tag: "JUST YOU",
      title: "A solo reset",
      body: "For a quiet night, reliable Wi-Fi and a place to restore your rhythm.",
      points: ["Ensuite comfort", "Smart TV and Wi-Fi", "Pool and lounge access"],
    },
    {
      tag: "YOUR PEOPLE",
      title: "Time together",
      body: "For couples, friends and family making the most of their time away.",
      points: ["Room and apartment options", "Full kitchen options", "Pool, bar and garden moments"],
    },
    {
      tag: "WORK OR WONDER",
      title: "Stay awhile",
      body: "For meetings, extended stays or a Volta-region escape with the practical details handled.",
      points: ["Daily cleaning", "24-hour security", "Personal planning support"],
    },
  ],
  footer: {
    tagline: "Arrive as a guest, stay as family.",
    copyright: "© 2026 NS LUXURY VILLA · Ho, Volta Region, Ghana",
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