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

function isRoomAvailableIn(data, roomNo) {
  const code = String(roomNo || "").trim().toUpperCase();
  if (!code || !Array.isArray(data)) return false;
  return data.some(
    (type) =>
      type.available &&
      Array.isArray(type.availableRooms) &&
      type.availableRooms.some(
        (r) => String(r.number || "").trim().toUpperCase() === code,
      ),
  );
}

function getNightlyDates(checkIn, checkOut) {
  const dates = [];
  const start = new Date(checkIn + "T12:00:00Z");
  const end = new Date(checkOut + "T12:00:00Z");
  let curr = new Date(start);
  while (curr < end) {
    const next = new Date(curr);
    next.setDate(next.getDate() + 1);
    dates.push({
      date: curr.toISOString().slice(0, 10),
      nextDate: next.toISOString().slice(0, 10),
    });
    curr = next;
    if (dates.length >= 31) break; // safety ceiling
  }
  return dates;
}

export async function GET(request) {
  const url = new URL(request.url);
  const checkInDate = url.searchParams.get("checkInDate") || "";
  const checkOutDate = url.searchParams.get("checkOutDate") || "";
  const adults = url.searchParams.get("adults") || "1";
  const children = url.searchParams.get("children") || "0";
  const roomNumber = (url.searchParams.get("roomNumber") || "").trim();
  const requestBreakdown = url.searchParams.get("breakdown") === "true";

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

  const data = payload?.data || [];
  const fullStayAvailable = roomNumber
    ? isRoomAvailableIn(data, roomNumber)
    : data.some((t) => t.available);

  const nights = getNightlyDates(checkInDate, checkOutDate);
  let nightlyBreakdown = null;

  if (roomNumber && nights.length > 1 && (requestBreakdown || !fullStayAvailable)) {
    try {
      nightlyBreakdown = await Promise.all(
        nights.map(async (n) => {
          try {
            const target = new URL(`${apiBase}/public/availability`);
            target.search = new URLSearchParams({
              checkInDate: n.date,
              checkOutDate: n.nextDate,
              adults,
              children,
              roomNumber,
            }).toString();
            const res = await fetch(target, { signal: AbortSignal.timeout(6000) });
            const body = await res.json();
            return {
              date: n.date,
              nextDate: n.nextDate,
              available: isRoomAvailableIn(body?.data, roomNumber),
            };
          } catch {
            return {
              date: n.date,
              nextDate: n.nextDate,
              available: false,
            };
          }
        }),
      );
    } catch (err) {
      console.warn("[live-availability] night breakdown query error", err);
      nightlyBreakdown = null;
    }
  }

  return json(200, {
    data,
    roomNumber: roomNumber || null,
    fullStayAvailable,
    nightlyBreakdown,
    searchTimestamp: new Date().toISOString(),
  });
}
