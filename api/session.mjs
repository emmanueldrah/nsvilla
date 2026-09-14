import { isValidSession, json, readSessionToken } from "./_shared.mjs";

export async function GET(req) {
  const token = readSessionToken(req);
  const authed = await isValidSession(token);
  return json(req, 200, { authed });
}