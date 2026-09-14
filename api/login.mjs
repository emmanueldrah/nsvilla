import {
  ADMIN_PASSWORD,
  LOGIN_RATE_KEY,
  createSession,
  json,
  kvIncr,
  kvReady,
  readBody,
  sessionCookie,
  isSecure,
} from "./_shared.mjs";

export async function POST(req) {
  if (!ADMIN_PASSWORD) return json(req, 500, { error: "ADMIN_PASSWORD is not configured." });
  if (!kvReady()) return json(req, 500, { error: "Vercel KV is not configured." });

  const ip = req.headers.get("x-forwarded-for") || "local";
  try {
    const attempts = await kvIncr(`${LOGIN_RATE_KEY}:${ip}`, 60 * 15);
    if (attempts > 12) {
      return json(req, 429, { error: "Too many attempts. Please wait a few minutes." });
    }
  } catch {
    // rate limiting is best-effort
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(req, 400, { error: "Invalid request body." });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const ok = password.length > 0 && password === ADMIN_PASSWORD;
  if (!ok) return json(req, 401, { error: "Incorrect password." });

  const token = await createSession();
  const headers = { "Set-Cookie": sessionCookie(token, isSecure(req)) };
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}