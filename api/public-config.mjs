// GET /api/public-config — proxies the NSLV management system's public
// booking configuration (deposit percentage, cancellation window, MoMo details).
// Cached for 60s so visitors get fast responses while reflecting changes
// made in the admin panel within a minute.

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

function managementApiBase() {
  return (
    process.env.NSLV_MANAGEMENT_API_URL ||
    "https://nsluxury.vercel.app/api/v1"
  ).replace(/\/+$/, "");
}

const FALLBACK_CONFIG = {
  publicEnabled: true,
  depositPercent: 60,
  cancellationHours: 48,
  holdMinutes: 60,
  momoConfigured: true,
  momo: {
    number: "0530491143",
    name: "NS Luxury Villa",
  },
};

export async function GET() {
  const apiBase = managementApiBase();
  try {
    const upstream = await fetch(`${apiBase}/public/config`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!upstream.ok) {
      return json(200, FALLBACK_CONFIG);
    }
    const payload = await upstream.json();
    const config =
      payload && payload.data && typeof payload.data === "object"
        ? payload.data
        : payload;
    return json(200, config);
  } catch (error) {
    console.error("[public-config] upstream fetch failed", error);
    return json(200, FALLBACK_CONFIG);
  }
}
