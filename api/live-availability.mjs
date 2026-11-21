const DATE = /^\d{4}-\d{2}-\d{2}$/;

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

export async function GET(request) {
  const url = new URL(request.url);
  const checkInDate = url.searchParams.get("checkInDate") || "";
  const checkOutDate = url.searchParams.get("checkOutDate") || "";
  const adults = url.searchParams.get("adults") || "1";
  const children = url.searchParams.get("children") || "0";
  const roomNumber = url.searchParams.get("roomNumber") || "";

  if (!DATE.test(checkInDate) || !DATE.test(checkOutDate)) {
    return json(400, { error: "Choose valid arrival and departure dates." });
  }

  const apiBase = managementApiBase();
  if (!apiBase) {
    return json(503, { error: "Live availability is not configured yet." });
  }

  let upstream;
  try {
    const target = new URL(`${apiBase}/public/availability`);
    const query = { checkInDate, checkOutDate, adults, children };
    if (roomNumber) query.roomNumber = roomNumber;
    target.search = new URLSearchParams(query).toString();
    upstream = await fetch(target, { signal: AbortSignal.timeout(8000) });
  } catch (error) {
    console.error("[live-availability] management API request failed", error);
    return json(502, { error: "The reservation system could not be reached. Please try again shortly." });
  }

  let payload;
  try {
    payload = await upstream.json();
  } catch {
    return json(502, { error: "The reservation system returned an invalid response." });
  }

  if (!upstream.ok) {
    return json(upstream.status, { error: payload?.error?.message || "Availability could not be checked." });
  }

  return json(200, { data: payload?.data || [] });
}
