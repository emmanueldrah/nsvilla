import { json, isValidSession, readBody, readSessionToken } from "./_shared.mjs";

// Uploads a flyer image to Vercel Blob. Body: { filename, data } where data is base64.
export async function POST(req) {
  const token = readSessionToken(req);
  const authed = await isValidSession(token);
  if (!authed) return json(req, 401, { error: "Not authenticated." });

  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(req, 400, { error: "Invalid request body." });
  }

  const filename = typeof body.filename === "string" ? body.filename.trim() : "";
  const data = typeof body.data === "string" ? body.data : "";
  if (!filename || !data) return json(req, 400, { error: "Missing filename or image data." });

  const tokenValue = process.env.BLOB_READ_WRITE_TOKEN;
  if (!tokenValue) {
    return json(req, 501, { error: "BLOB_READ_WRITE_TOKEN is not configured. Flyer image upload is disabled." });
  }

  try {
    const { put } = await import("@vercel/blob");
    const buffer = Buffer.from(data, "base64");
    const mime = (filename.match(/\.(png|jpe?g|webp|gif|avif)$/i) || [])[0]
      ? "image/" + filename.toLowerCase().replace(/.*\./, "").replace("jpg", "jpeg")
      : "application/octet-stream";
    const safeName = filename.replace(/[^a-z0-9.\-_]/gi, "_").toLowerCase();
    const blob = await put(`flyers/${Date.now()}-${safeName}`, buffer, {
      access: "public",
      contentType: mime,
      addRandomSuffix: true,
    });
    return json(req, 200, { url: blob.url });
  } catch (e) {
    return json(req, 500, { error: "Upload failed: " + e.message });
  }
}