import { destroySession, json, readSessionToken, clearSessionCookie, isSecure } from "./_shared.mjs";

export async function POST(req) {
  const token = readSessionToken(req);
  if (token) await destroySession(token);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Set-Cookie": clearSessionCookie(isSecure(req)),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}