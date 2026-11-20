interface AvailableRoomType {
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

const dateInputValue = (offsetDays: number) => {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString().slice(0, 10);
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: currency || "GHS", maximumFractionDigits: 0 }).format(amount);

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

function bookingLink(room: string, checkInDate: string, checkOutDate: string) {
  const params = new URLSearchParams({ room, checkin: checkInDate, checkout: checkOutDate });
  return `./contact?${params.toString()}`;
}

function renderResults(target: HTMLElement, types: AvailableRoomType[], checkInDate: string, checkOutDate: string) {
  const visible = types.filter((type) => type.available);
  if (!visible.length) {
    target.innerHTML = `<p class="availability-empty">No rooms match these dates and guest numbers. Try different dates or contact us directly.</p>`;
    return;
  }

  target.innerHTML = visible.map((type) => {
    const roomNames = (type.availableRooms || []).map((room) => room.name || `Room ${room.number}`);
    const rooms = roomNames.length === 1 ? `${roomNames[0]} is available` : `${type.availableCount} ${type.availableCount === 1 ? "room" : "rooms"} available`;
    const capacity = `Up to ${type.maxAdults} adult${type.maxAdults === 1 ? "" : "s"}${type.maxChildren ? ` · ${type.maxChildren} child${type.maxChildren === 1 ? "" : "ren"}` : ""}`;
    return `<article class="availability-card">
      <div><p class="availability-state">${escapeHtml(rooms)}</p><h3>${escapeHtml(type.name)}</h3><p>${escapeHtml(type.description || capacity)}</p>${roomNames.length > 1 ? `<p class="availability-room-list">Available: ${roomNames.map(escapeHtml).join(", ")}</p>` : ""}</div>
      <div class="availability-card-footer"><span>${formatMoney(type.basePrice, type.currency)} <small>per night</small></span><a class="villa-btn-inquire" href="${bookingLink(roomNames[0] || type.name, checkInDate, checkOutDate)}">Book this stay</a></div>
    </article>`;
  }).join("");
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
    const query = new URLSearchParams({
      checkInDate: checkIn.value,
      checkOutDate: checkOut.value,
      adults: String(data.get("adults") || "1"),
      children: String(data.get("children") || "0"),
    });
    const roomNumber = String(data.get("roomNumber") || "").trim();
    if (roomNumber) query.set("roomNumber", roomNumber);
    status.textContent = "Checking the villa's live reservation system…";
    results.replaceChildren();
    try {
      const response = await fetch(`/api/live-availability?${query}`, { cache: "no-store" });
      const body = (await response.json()) as { data?: AvailableRoomType[]; error?: string };
      if (!response.ok) throw new Error(body.error || "Availability could not be checked.");
      renderResults(results, body.data || [], checkIn.value, checkOut.value);
      const count = (body.data || []).reduce((sum, type) => sum + (type.available ? type.availableCount : 0), 0);
      status.textContent = roomNumber
        ? (count ? `Room ${roomNumber} is available for these dates.` : `Room ${roomNumber} is not available for these dates.`)
        : `${count} ${count === 1 ? "room is" : "rooms are"} available for these dates.`;
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Availability could not be checked.";
    }
  });
}
