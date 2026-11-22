export interface AvailableRoomType {
  id: string;
  name: string;
  description?: string | null;
  availableCount: number;
  available: boolean;
  capacityOk: boolean;
  basePrice: number;
  currency: string;
  maxAdults: number;
  maxChildren: number;
  availableRooms: Array<{ number: string; name?: string | null }>;
}

export interface NightlyAvailability {
  date: string;
  nextDate: string;
  available: boolean;
}

export interface LiveAvailabilityResponse {
  data?: AvailableRoomType[];
  error?: string;
  roomNumber?: string | null;
  fullStayAvailable?: boolean;
  nightlyBreakdown?: NightlyAvailability[] | null;
  searchTimestamp?: string;
}

export function formatShortDate(iso: string): string {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-GH", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function formatDateList(dates: string[]): string {
  const formatted = dates.map(formatShortDate);
  if (formatted.length === 0) return "";
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(", ")}, and ${formatted[formatted.length - 1]}`;
}

export function roomLabelOf(code: string): string {
  const c = code.trim().toUpperCase();
  if (c.startsWith("A")) return `Apartment ${c}`;
  if (c.startsWith("B")) return `Room ${c}`;
  return `Room ${code}`;
}

function groupConsecutiveNights(nights: NightlyAvailability[]): Array<{ start: string; end: string; count: number }> {
  const available = nights.filter((n) => n.available);
  if (!available.length) return [];
  const ranges: Array<{ start: string; end: string; count: number }> = [];
  let curr = { start: available[0].date, end: available[0].nextDate, count: 1 };
  for (let i = 1; i < available.length; i++) {
    if (available[i].date === curr.end) {
      curr.end = available[i].nextDate;
      curr.count += 1;
    } else {
      ranges.push({ ...curr });
      curr = { start: available[i].date, end: available[i].nextDate, count: 1 };
    }
  }
  ranges.push(curr);
  return ranges;
}

const dateInputValue = (offsetDays: number) => {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString().slice(0, 10);
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: currency || "GHS", maximumFractionDigits: 0 }).format(amount);

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

function bookingLink(room: string, checkInDate: string, checkOutDate: string, adults: number, children: number, roomTypeId: string, roomNumber: string) {
  const params = new URLSearchParams({ room, checkin: checkInDate, checkout: checkOutDate, adults: String(adults), children: String(children), roomTypeId });
  if (roomNumber) params.set("roomNo", roomNumber);
  return `./contact?${params.toString()}`;
}

function renderResults(target: HTMLElement, types: AvailableRoomType[], checkInDate: string, checkOutDate: string, adults: number, children: number) {
  const visible = types.filter((type) => type.available);
  if (!visible.length) {
    target.innerHTML = `<p class="availability-empty">No rooms match these dates and guest numbers. Try different dates or contact us directly.</p>`;
    return;
  }

  target.innerHTML = visible.map((type) => {
    const roomNames = (type.availableRooms || []).map((room) => room.name || `Room ${room.number}`);
    const rooms = roomNames.length === 1 ? `${roomNames[0]} is available` : `${type.availableCount} ${type.availableCount === 1 ? "room" : "rooms"} available`;
    const capacity = `Up to ${type.maxAdults} adult${type.maxAdults === 1 ? "" : "s"}${type.maxChildren ? ` · ${type.maxChildren} child${type.maxChildren === 1 ? "" : "ren"}` : ""}`;
    const firstRoomNumber = type.availableRooms?.[0]?.number || "";
    const href = bookingLink(roomNames[0] || type.name, checkInDate, checkOutDate, adults, children, type.id, firstRoomNumber);
    return `<article class="availability-card">
      <div><p class="availability-state">${escapeHtml(rooms)}</p><h3>${escapeHtml(type.name)}</h3><p>${escapeHtml(type.description || capacity)}</p>${roomNames.length > 1 ? `<p class="availability-room-list">Available: ${roomNames.map(escapeHtml).join(", ")}</p>` : ""}</div>
      <div class="availability-card-footer"><span>${formatMoney(type.basePrice, type.currency)} <small>per night</small></span><a class="villa-btn-inquire" href="${escapeHtml(href)}">Book this stay</a></div>
    </article>`;
  }).join("");
}

function renderPartialResults(
  target: HTMLElement,
  allTypes: AvailableRoomType[],
  roomNumber: string,
  breakdown: NightlyAvailability[],
  checkInDate: string,
  checkOutDate: string,
  adults: number,
  children: number,
) {
  const roomTitle = roomLabelOf(roomNumber);
  const availableRanges = groupConsecutiveNights(breakdown);
  const unavailableDates = breakdown.filter((n) => !n.available).map((n) => n.date);
  const availableDates = breakdown.filter((n) => n.available).map((n) => n.date);

  const matchedType = allTypes.find((t) =>
    (t.availableRooms || []).some(
      (r) => String(r.number || "").toUpperCase() === roomNumber.toUpperCase(),
    ) || t.name.toLowerCase().includes(roomNumber.toLowerCase()),
  );
  const typeId = matchedType?.id || "";
  const price = matchedType?.basePrice || 0;
  const currency = matchedType?.currency || "GHS";

  let html = `
    <article class="availability-card availability-card--partial">
      <div>
        <span class="availability-badge-partial">Partially available</span>
        <h3>${escapeHtml(roomTitle)}</h3>
        <p class="availability-detail" style="margin: 0.5rem 0 1rem; color: #173b36; line-height: 1.55;">
          ${escapeHtml(roomTitle)} is not available on <strong>${escapeHtml(formatDateList(unavailableDates))}</strong>, but on <strong>${escapeHtml(formatDateList(availableDates))}</strong> it is available as of the time of your search.
        </p>
        <div class="availability-partial-actions" style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${availableRanges
            .map((range) => {
              const label = `Book ${roomTitle} for ${formatShortDate(range.start)} – ${formatShortDate(range.end)} (${range.count} night${range.count === 1 ? "" : "s"})`;
              const href = bookingLink(roomTitle, range.start, range.end, adults, children, typeId, roomNumber);
              return `<a class="villa-btn-inquire" style="text-align: center;" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
            })
            .join("")}
        </div>
      </div>
      <div class="availability-card-footer">
        <span>${price ? `${formatMoney(price, currency)} <small>per night</small>` : ""}</span>
      </div>
    </article>
  `;

  const alternativeTypes = allTypes.filter((t) => t.available && t.availableCount > 0);
  if (alternativeTypes.length) {
    html += `<h4 class="availability-subhead">Other rooms fully available for your whole stay (${escapeHtml(formatShortDate(checkInDate))} – ${escapeHtml(formatShortDate(checkOutDate))}):</h4>`;
    html += alternativeTypes
      .map((type) => {
        const roomNames = (type.availableRooms || []).map((room) => room.name || `Room ${room.number}`);
        const rooms = roomNames.length === 1 ? `${roomNames[0]} is available` : `${type.availableCount} ${type.availableCount === 1 ? "room" : "rooms"} available`;
        const capacity = `Up to ${type.maxAdults} adult${type.maxAdults === 1 ? "" : "s"}${type.maxChildren ? ` · ${type.maxChildren} child${type.maxChildren === 1 ? "" : "ren"}` : ""}`;
        const firstRoomNumber = type.availableRooms?.[0]?.number || "";
        const href = bookingLink(roomNames[0] || type.name, checkInDate, checkOutDate, adults, children, type.id, firstRoomNumber);
        return `<article class="availability-card">
          <div><p class="availability-state">${escapeHtml(rooms)}</p><h3>${escapeHtml(type.name)}</h3><p>${escapeHtml(type.description || capacity)}</p>${roomNames.length > 1 ? `<p class="availability-room-list">Available: ${roomNames.map(escapeHtml).join(", ")}</p>` : ""}</div>
          <div class="availability-card-footer"><span>${formatMoney(type.basePrice, type.currency)} <small>per night</small></span><a class="villa-btn-inquire" href="${escapeHtml(href)}">Book this stay</a></div>
        </article>`;
      })
      .join("");
  }

  target.innerHTML = html;
}

export function initLiveAvailability(): void {
  const form = document.querySelector<HTMLFormElement>("#availability-search");
  const results = document.querySelector<HTMLElement>("#availability-results");
  const status = document.querySelector<HTMLElement>("#availability-status");
  if (!form || !results || !status) return;

  const checkIn = form.elements.namedItem("checkInDate") as HTMLInputElement;
  const checkOut = form.elements.namedItem("checkOutDate") as HTMLInputElement;
  const today = dateInputValue(0);
  checkIn.min = today;
  checkOut.min = dateInputValue(1);
  checkIn.value = today;
  checkOut.value = dateInputValue(1);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!checkIn.value || !checkOut.value || checkOut.value <= checkIn.value) {
      status.textContent = "Departure must be after arrival.";
      return;
    }
    const data = new FormData(form);
    const adults = Number(data.get("adults") || "1") || 1;
    const children = Number(data.get("children") || "0") || 0;
    const query = new URLSearchParams({
      checkInDate: checkIn.value,
      checkOutDate: checkOut.value,
      adults: String(adults),
      children: String(children),
    });
    const roomNumber = String(data.get("roomNumber") || "").trim();
    if (roomNumber) {
      query.set("roomNumber", roomNumber);
      query.set("breakdown", "true");
    }
    status.textContent = "Checking the villa's live reservation system…";
    results.replaceChildren();
    try {
      const response = await fetch(`/api/live-availability?${query}`, { cache: "no-store" });
      const body = (await response.json()) as LiveAvailabilityResponse;
      if (!response.ok) throw new Error(body.error || "Availability could not be checked.");

      if (roomNumber && Array.isArray(body.nightlyBreakdown) && body.nightlyBreakdown.length > 1) {
        const unavailableDates = body.nightlyBreakdown.filter((n) => !n.available).map((n) => n.date);
        const availableDates = body.nightlyBreakdown.filter((n) => n.available).map((n) => n.date);
        const roomTitle = roomLabelOf(roomNumber);

        if (unavailableDates.length > 0 && availableDates.length > 0) {
          const outcome = `${roomTitle} is not available on ${formatDateList(unavailableDates)}, but on ${formatDateList(availableDates)} it is available as of the time of your search.`;
          status.innerHTML = `<span class="availability-status-alert"><strong>${escapeHtml(outcome)}</strong></span>`;
          renderPartialResults(results, body.data || [], roomNumber, body.nightlyBreakdown, checkIn.value, checkOut.value, adults, children);
          return;
        } else if (availableDates.length === 0) {
          const outcome = `${roomTitle} is not available on any dates between ${formatShortDate(checkIn.value)} and ${formatShortDate(checkOut.value)} as of the time of your search.`;
          status.innerHTML = `<span class="availability-status-alert">${escapeHtml(outcome)}</span>`;
          renderResults(results, body.data || [], checkIn.value, checkOut.value, adults, children);
          return;
        } else {
          const outcome = `${roomTitle} is available for all selected dates (${formatShortDate(checkIn.value)} to ${formatShortDate(checkOut.value)}) as of the time of your search.`;
          status.innerHTML = `<span class="availability-status-success">${escapeHtml(outcome)}</span>`;
          renderResults(results, body.data || [], checkIn.value, checkOut.value, adults, children);
          return;
        }
      }

      renderResults(results, body.data || [], checkIn.value, checkOut.value, adults, children);
      const count = (body.data || []).reduce((sum, type) => sum + (type.available ? type.availableCount : 0), 0);
      status.textContent = roomNumber
        ? (count ? `${roomLabelOf(roomNumber)} is available for these dates as of the time of your search.` : `${roomLabelOf(roomNumber)} is not available for these dates as of the time of your search.`)
        : `${count} ${count === 1 ? "room is" : "rooms are"} available for these dates as of the time of your search.`;
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Availability could not be checked.";
    }
  });
}
