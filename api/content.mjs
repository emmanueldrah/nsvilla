import {
  CONTENT_KEY,
  cloneDefault,
  json,
  isValidSession,
  kvGet,
  kvSet,
  normalizeContent,
  readBody,
  readSessionToken,
} from "./_shared.mjs";

export async function GET(req) {
  let content = null;
  try {
    const raw = await kvGet(CONTENT_KEY);
    if (raw) content = JSON.parse(raw);
  } catch {
    content = null;
  }
  return json(req, 200, { content: content || cloneDefault() });
}

export async function PUT(req) {
  const token = readSessionToken(req);
  const authed = await isValidSession(token);
  if (!authed) return json(req, 401, { error: "Not authenticated." });

  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(req, 400, { error: "Invalid request body." });
  }

  const normalized = normalizeContent(body);
  try {
    await kvSet(CONTENT_KEY, JSON.stringify(normalized));
  } catch (e) {
    return json(req, 500, { error: "Failed to save content: " + e.message });
  }
  return json(req, 200, { ok: true, content: normalized });
}