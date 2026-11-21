// POST /api/create-booking — forwards a website booking to the NSLV
// management system's public booking API. Server-to-server only: the
// management URL never reaches the browser, and no customer details are
// exposed back to visitors beyond their own booking confirmation.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  return (process.env.NSLV_MANAGEMENT_API_URL || "").replace(/\/+$/, "");
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

  // Cheap sanity checks before hitting the reservation system. The management
  // API performs full validation itself and returns field-level errors.
  if (!UUID.test(String(body.roomTypeId || ""))) {
    return json(400, { error: "Choose a room before booking." });
  }
  if (!DATE.test(String(body.checkInDate || "")) || !DATE.test(String(body.checkOutDate || ""))) {
    return json(400, { error: "Choose valid arrival and departure dates." });
  }
  if (!String(body.email || "").includes("@")) {
    return json(400, { error: "Enter a valid email address." });
  }
  if (!String(body.firstName || "").trim() || !String(body.lastName || "").trim()) {
    return json(400, { error: "Enter your first and last name." });
  }
  if (!String(body.phone || "").trim()) {
    return json(400, { error: "Enter a phone number we can reach you on." });
  }
  if (body.acceptPolicy !== true) {
    return json(400, { error: "Please accept the booking and cancellation policy." });
  }

  // Whitelist the fields we forward — never pass the raw browser payload
  // straight through to the reservation system.
  const payload = {
    roomTypeId: String(body.roomTypeId),
    checkInDate: String(body.checkInDate),
    checkOutDate: String(body.checkOutDate),
    adults: Number(body.adults) || 1,
    children: Number(body.children) || 0,
    firstName: String(body.firstName).trim(),
    lastName: String(body.lastName).trim(),
    email: String(body.email).trim(),
    phone: String(body.phone).trim(),
    acceptPolicy: true,
  };
  if (body.specialRequests) payload.specialRequests = String(body.specialRequests).slice(0, 2000);
  if (body.paymentReference) payload.paymentReference = String(body.paymentReference).slice(0, 120);

  let upstream;
  try {
    upstream = await fetch(`${apiBase}/public/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error("[create-booking] management API request failed", error);
    return json(502, { error: "The reservation system could not be reached. Please try again shortly." });
  }

  let response;
  try {
    response = await upstream.json();
  } catch {
    return json(502, { error: "The reservation system returned an invalid response." });
  }

  // Pass the management system's own status + { success, data | error } payload
  // through unchanged — it already speaks that shape to the website.
  return json(upstream.status, response);
}
