// POST /api/payment-reference — submits a MoMo transaction reference for a
// booking that was created on the website. The guest must know the
// confirmation number and use the same email they booked with; the
// management system verifies both before accepting the reference.

const CONFIRMATION_NO = /^[A-Za-z0-9-]{5,64}$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function managementApiBase() {
  return (
    process.env.NSLV_MANAGEMENT_API_URL ||
    "https://nsluxury.vercel.app/api/v1"
  ).replace(/\/+$/, "");
}

export async function POST(request) {
  const apiBase = managementApiBase();
  if (!apiBase) {
    return json(503, { error: "Online booking is not configured yet." });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "Invalid request body." });
  }
  if (!body || typeof body !== "object") {
    return json(400, { error: "Invalid request body." });
  }

  const confirmationNo = String(body.confirmationNo || "").trim();
  const email = String(body.email || "").trim();
  const reference = String(body.reference || "").trim();

  if (!CONFIRMATION_NO.test(confirmationNo)) {
    return json(400, { error: "Enter your confirmation number (e.g. NSVL-20260101-1A2B3C4D)." });
  }
  if (!email.includes("@")) {
    return json(400, { error: "Enter the email address you booked with." });
  }
  if (reference.length < 3 || reference.length > 120) {
    return json(400, { error: "Enter the MoMo transaction reference (3–120 characters)." });
  }

  let upstream;
  try {
    upstream = await fetch(`${apiBase}/public/bookings/${encodeURIComponent(confirmationNo)}/payment-reference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reference }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error("[payment-reference] management API request failed", error);
    return json(502, { error: "The reservation system could not be reached. Please try again shortly." });
  }

  let response;
  try {
    response = await upstream.json();
  } catch {
    return json(502, { error: "The reservation system returned an invalid response." });
  }

  return json(upstream.status, response);
}
