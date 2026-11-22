// ════════════════════════════════════════════════════════════
// NS LUXURY VILLA - Interactive Features
// ════════════════════════════════════════════════════════════

import { inject } from "@vercel/analytics";
import { initRemoteContent } from "./content";
import {
  initLiveAvailability,
  type AvailableRoomType,
  type LiveAvailabilityResponse,
  formatShortDate,
  formatDateList,
  roomLabelOf,
} from "./live-availability";

const PRIMARY_WHATSAPP = "233535572774";

// Content remains visible by default; this class only enables optional motion.
document.documentElement.classList.add("js");
const isLocal =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";
if (!isLocal) inject();

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  normalizeInternalLinks();
  syncSiteNavigation();
  applyArtDirection();
  initNavigation();
  initSmoothScroll();
  initBookingConfig();
  initBookingPrefill();
  initFormHandlers();
  initFloatingWhatsApp();
  initRoomCatalog();
  initLiveAvailability();
  initRemoteContent();
  initVillaArchive();
  initImageViewer();
});

// Non-paint-critical enhancements run after the page has loaded.
window.addEventListener("load", () => {
  initScrollReveals();
  initVillaArchive();
  initImageViewer();
});

function normalizeInternalLinks(): void {
  const routes: Record<string, string> = {
    "./": "./",
    "./index": "./",
    "./index.html": "./",
    "./stay-with-us": "./rooms",
    "./rooms.html": "./rooms",
    "./shared-spaces": "./amenities",
    "./amenities.html": "./amenities",
    "./our-home": "./gallery",
    "./gallery.html": "./gallery",
    "./plan-your-stay": "./pricing",
    "./pricing.html": "./pricing",
    "./join-the-family": "./contact",
    "./contact.html": "./contact",
  };
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const rawHref = link.getAttribute("href") || "";
    const replacement = routes[rawHref];
    if (replacement) link.setAttribute("href", replacement);
  });
}

function syncSiteNavigation(): void {
  const pages = [
    { href: "./", label: "Home", aliases: ["index", "", "home"] },
    { href: "./rooms", label: "Rooms", aliases: ["rooms", "stay-with-us"] },
    { href: "./amenities", label: "Pool", aliases: ["amenities", "shared-spaces"] },
    { href: "./gallery", label: "Gallery", aliases: ["gallery", "our-home"] },
    { href: "./pricing", label: "Rates", aliases: ["pricing", "plan-your-stay"] },
    { href: "./contact", label: "Book a stay", aliases: ["contact", "join-the-family"] },
  ];
  let current = location.pathname.split("/").pop()?.replace(".html", "") || "index";
  if (!current || current === "") current = "index";

  document.querySelectorAll<HTMLElement>(".family-menu").forEach((menu) => {
    menu.innerHTML = pages
      .map(
        (page) =>
          `<a href="${page.href}" class="${page.aliases.includes(current) ? "active" : ""}">${page.label}</a>`,
      )
      .join("");
  });
  document.querySelectorAll<HTMLElement>(".family-footer").forEach((footer) => {
    const section = footer.querySelector(
      ".family-footer-grid > div:nth-child(2)",
    );
    if (section)
      section.innerHTML = `<p class="family-footer-title">Lokoe, Ho</p>${pages
        .map(
          (page) =>
            `<a href="${page.href}" class="${page.aliases.includes(current) ? "active" : ""}">${page.label}</a>`,
        )
        .join("")}`;
  });
}

function applyArtDirection(): void {
  const path = location.pathname.toLowerCase();
  const page = path.split("/").pop()?.replace(".html", "") || "index";
  if (page === "amenities" || page === "shared-spaces") {
    const hero = document.querySelector<HTMLImageElement>(
      ".family-page-hero > img",
    );
    if (hero && !hero.src) {
      hero.src = "/images/opt/nice-pool-1100.jpg";
      hero.alt =
        "Swimming pool beneath the signature umbrella canopy at NS LUXURY VILLA";
    }
  }
  if (page === "pricing" || page === "plan-your-stay") {
    const closingImage =
      document.querySelector<HTMLImageElement>(".family-cta > img");
    if (closingImage && !closingImage.src) {
      closingImage.src = "/images/opt/bed-1100.jpg";
      closingImage.alt = "Prepared guest bedroom at NS LUXURY VILLA";
    }
  }
  if (page === "contact" || page === "join-the-family") {
    const hero = document.querySelector<HTMLImageElement>(
      ".family-page-hero > img",
    );
    if (hero && !hero.src) {
      hero.src = "/images/opt/pool-bar-hero.jpeg";
      hero.alt = "Pool, bar and outdoor spaces at NS LUXURY VILLA";
    }
  }
  if (page === "gallery" || page === "our-home") {
    const featured =
      document.querySelectorAll<HTMLImageElement>(".family-mosaic img");
    const images: Array<[string, string]> = [
      [
        "/images/opt/nice-pool-1100.jpg",
        "Swimming pool beneath the signature umbrella canopy",
      ],
      [
        "/images/nice%20paintings.jpeg",
        "Hand-painted mural along the villa walkway",
      ],
      ["/images/upper%20view.jpeg", "Aerial view of NS LUXURY VILLA"],
      ["/images/ns%20bar.jpeg", "Restaurant and bar interior"],
    ];
    featured.forEach((image, index) => {
      const chosen = images[index];
      if (chosen && !image.getAttribute("src")) {
        image.src = chosen[0];
        image.alt = chosen[1];
      }
    });
    const film = document.querySelector<HTMLVideoElement>(".family-video");
    if (film && !film.poster) film.poster = "/images/opt/nice-pool-1100.jpg";
  }
}

function initNavigation(): void {
  const nav = document.querySelector("header nav");
  const menu = document.querySelector(".site-menu, header nav > div");
  if (!nav || !menu) return;

  menu.id = "site-menu";
  menu.classList.add("site-menu");
  let button = nav.querySelector(".menu-toggle") as HTMLButtonElement | null;
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "menu-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "site-menu");
    button.setAttribute("aria-label", "Open menu");
    button.innerHTML = "<span></span><span></span><span></span>";
    nav.insertBefore(button, menu);
  }
  button.addEventListener("click", () => {
    const expanded = button!.getAttribute("aria-expanded") === "true";
    button!.setAttribute("aria-expanded", String(!expanded));
    button!.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
    menu.classList.toggle("menu-open", !expanded);
  });
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      button!.setAttribute("aria-expanded", "false");
      button!.setAttribute("aria-label", "Open menu");
      menu.classList.remove("menu-open");
    }),
  );
}

// ════════════════════════════════════════════════════════════
// Scroll Reveal Animation
// ════════════════════════════════════════════════════════════
function initScrollReveals(): void {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    },
  );

  reveals.forEach((el) => observer.observe(el));
}

// ════════════════════════════════════════════════════════════
// Smooth Scroll Navigation
// ════════════════════════════════════════════════════════════
function initSmoothScroll(): void {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = (anchor as HTMLAnchorElement).getAttribute("href");
      if (href && href !== "#") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

// ════════════════════════════════════════════════════════════
// Live booking — website → NSLV management system
// ════════════════════════════════════════════════════════════
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROOM_NUMBER_PATTERN = /\b([AB]\d{1,2})\b/i;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface BookingConfirmation {
  confirmationNo: string;
  status?: string;
  holdExpiresAt?: string | null;
  checkInDate?: string;
  checkOutDate?: string;
  nights?: number;
  adults?: number;
  children?: number;
  roomType?: { name?: string };
  room?: { number?: string; name?: string | null };
  totalAmount?: number;
  depositAmount?: number;
  currency?: string;
  momo?: { number?: string; name?: string };
  paymentReference?: string;
}

interface PublicBookingConfig {
  publicEnabled?: boolean;
  depositPercent?: number;
  cancellationHours?: number;
  holdMinutes?: number;
  momoConfigured?: boolean;
  momo?: {
    number?: string;
    name?: string;
  };
}

let activeBookingConfig: PublicBookingConfig = {
  depositPercent: 60,
  cancellationHours: 48,
  holdMinutes: 60,
  momoConfigured: true,
  momo: {
    number: "0530491143",
    name: "NS Luxury Villa",
  },
};

function applyBookingConfig(config: PublicBookingConfig): void {
  const deposit = typeof config.depositPercent === "number" ? config.depositPercent : 60;
  const hours = typeof config.cancellationHours === "number" ? config.cancellationHours : 48;

  const depositEl = document.getElementById("policy-deposit-percent");
  if (depositEl) depositEl.textContent = `${deposit}%`;

  const hoursEl = document.getElementById("policy-cancellation-hours");
  if (hoursEl) hoursEl.textContent = `${hours} hours`;

  const policyTextEl = document.getElementById("booking-policy-text");
  if (policyTextEl && !depositEl) {
    policyTextEl.innerHTML = `I accept the booking &amp; cancellation policy: a <strong id="policy-deposit-percent">${deposit}%</strong> deposit confirms the room and the balance is settled on arrival, with free cancellation up to <strong id="policy-cancellation-hours">${hours} hours</strong> before arrival.`;
  }
}

async function initBookingConfig(): Promise<void> {
  applyBookingConfig(activeBookingConfig);
  try {
    const res = await fetch("/api/public-config", { cache: "no-cache" });
    if (!res.ok) return;
    const raw = await res.json();
    const config = (raw && raw.data ? raw.data : raw) as PublicBookingConfig;
    if (config && typeof config === "object") {
      activeBookingConfig = { ...activeBookingConfig, ...config };
      applyBookingConfig(activeBookingConfig);
    }
  } catch (err) {
    console.debug("[config] Could not fetch public config", err);
  }
}

interface EnquiryDetails {
  name: string;
  email: string;
  phone: string;
  suite: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  message: string;
  note?: string;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

/** "Room B7 (Large Studio …)" → "B7". Returns null for venue/group/general options. */
function roomCodeOf(label: string): string | null {
  const match = label.match(ROOM_NUMBER_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

/** Pulls a human message out of either proxy errors or management API errors. */
function apiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const record = body as { error?: unknown; message?: unknown };
  const error = record.error;
  if (typeof error === "string" && error.trim()) return error.trim();
  if (error && typeof error === "object") {
    const nested = error as { message?: unknown; details?: unknown };
    if (typeof nested.message === "string" && nested.message.trim())
      return nested.message.trim();
    if (typeof nested.details === "string" && nested.details.trim())
      return nested.details.trim();
  }
  if (typeof record.message === "string" && record.message.trim())
    return record.message.trim();
  return fallback;
}

async function postJson(
  path: string,
  payload: unknown,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

async function fetchAvailableRoomTypes(
  checkInDate: string,
  checkOutDate: string,
  adults: number,
  children: number,
): Promise<AvailableRoomType[]> {
  const query = new URLSearchParams({
    checkInDate,
    checkOutDate,
    adults: String(adults),
    children: String(children),
  });
  const response = await fetch(`/api/live-availability?${query}`, {
    cache: "no-store",
  });
  let body: { data?: AvailableRoomType[] } | null = null;
  try {
    body = (await response.json()) as { data?: AvailableRoomType[] };
  } catch {
    body = null;
  }
  if (!response.ok || !body) {
    throw new Error(
      apiErrorMessage(body, "Live availability could not be checked."),
    );
  }
  return Array.isArray(body.data) ? body.data : [];
}

/**
 * Turns the selected room (e.g. "B7") into the room type id the reservation
 * system expects. Uses the id handed over by the availability search when it
 * still matches, otherwise re-checks live availability for these dates.
 */
async function resolveRoomTypeId(
  roomNumber: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number,
  children: number,
  cached: { id: string; roomNumber: string },
): Promise<string | null> {
  if (UUID_PATTERN.test(cached.id) && cached.roomNumber === roomNumber) {
    return cached.id;
  }
  const types = await fetchAvailableRoomTypes(
    checkInDate,
    checkOutDate,
    adults,
    children,
  );
  const match = types.find((type) =>
    (type.availableRooms || []).some(
      (room) => String(room.number || "").toUpperCase() === roomNumber,
    ),
  );
  return match && match.available ? match.id : null;
}

function openWhatsAppEnquiry(details: EnquiryDetails): void {
  const guestLine = `${details.adults} adult${details.adults === 1 ? "" : "s"}${
    details.children
      ? `, ${details.children} child${details.children === 1 ? "" : "ren"}`
      : ""
  }`;
  const whatsappMessage = `
*Booking Inquiry - NS LUXURY VILLA*

*Guest Information:*
Name: ${details.name}
Email: ${details.email || "Not provided"}
Phone: ${details.phone || "Not provided"}

*Booking Details:*
Suite: ${details.suite || "Not selected"}
Check-in: ${details.checkin || "Not set"}
Check-out: ${details.checkout || "Not set"}
Number of Guests: ${guestLine}
${details.note ? `\n*Note:*\n${details.note}\n` : ""}
*Additional Message:*
${details.message || "No additional message"}

---
Sent from NS LUXURY VILLA Booking Form
  `.trim();

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const waNumber = window.NsVilla?.contact?.waPrimary || PRIMARY_WHATSAPP;
  window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, "_blank");
}

function renderBookingResult(
  panel: HTMLElement,
  booking: BookingConfirmation,
  email: string,
): void {
  const confirmationNo = String(booking.confirmationNo || "");
  const roomLabel =
    booking.room?.name ||
    booking.room?.number ||
    booking.roomType?.name ||
    "your room";
  const currency = booking.currency || "GHS";
  const formatMoney = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(0)}`;
    }
  };

  const holdDate = booking.holdExpiresAt
    ? new Date(booking.holdExpiresAt)
    : null;
  const holdText =
    holdDate && !Number.isNaN(holdDate.getTime())
      ? holdDate.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";
  const nights = Number(booking.nights || 0);
  const adults = Number(booking.adults || 0);
  const children = Number(booking.children || 0);

  panel.innerHTML = `
    <div class="booking-result">
      <p class="booking-result-title">Your room is held for you</p>
      <p class="booking-result-code">Confirmation <strong>${escapeHtml(confirmationNo)}</strong></p>
      <ul class="booking-result-list">
        <li><strong>Room:</strong> ${escapeHtml(roomLabel)}</li>
        <li><strong>Dates:</strong> ${escapeHtml(String(booking.checkInDate || ""))} → ${escapeHtml(String(booking.checkOutDate || ""))} (${nights} night${nights === 1 ? "" : "s"})</li>
        <li><strong>Guests:</strong> ${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}</li>
        <li><strong>Total:</strong> ${formatMoney(Number(booking.totalAmount || 0))} · <strong>Deposit due:</strong> ${formatMoney(Number(booking.depositAmount || 0))}</li>
      </ul>
      <p class="booking-result-payment">
        Send the deposit to MoMo <strong>${escapeHtml(String(booking.momo?.number || activeBookingConfig.momo?.number || ""))}</strong>
        (${escapeHtml(String(booking.momo?.name || activeBookingConfig.momo?.name || ""))}). You do not need to type a long booking reference — after paying, enter the short MoMo transaction ID below.
        ${holdText ? `Your hold expires <strong>${escapeHtml(holdText)}</strong>.` : ""}
      </p>
      <form id="payment-reference-form" class="booking-reference-form">
        <label for="momo-reference">Already paid? Enter the MoMo transaction ID</label>
        <div class="booking-reference-row">
          <input id="momo-reference" name="momo-reference" placeholder="e.g. 1234567890" maxlength="40" autocomplete="off" />
          <button class="family-btn family-btn-primary" type="submit">Submit reference</button>
        </div>
        <p id="payment-reference-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  `;
  panel.hidden = false;

  const referenceForm = panel.querySelector<HTMLFormElement>(
    "#payment-reference-form",
  );
  const referenceStatus = panel.querySelector<HTMLElement>(
    "#payment-reference-status",
  );
  const referenceInput = panel.querySelector<HTMLInputElement>(
    "#momo-reference",
  );

  referenceForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const reference = referenceInput?.value.trim() || "";
    const button = referenceForm.querySelector<HTMLButtonElement>("button");
    if (reference.length < 3) {
      if (referenceStatus)
        referenceStatus.textContent =
          "Enter the MoMo transaction reference (3–120 characters).";
      return;
    }
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }
    if (referenceStatus) referenceStatus.textContent = "";
    try {
      const { status, body } = await postJson("/api/payment-reference", {
        confirmationNo,
        email,
        reference,
      });
      if (status >= 200 && status < 300) {
        if (referenceStatus)
          referenceStatus.textContent =
            "Reference received — reception will verify your payment and confirm your booking shortly.";
        if (referenceInput) referenceInput.value = "";
      } else if (referenceStatus) {
        referenceStatus.textContent = apiErrorMessage(
          body,
          "The reference could not be submitted. Please try again.",
        );
      }
    } catch {
      if (referenceStatus)
        referenceStatus.textContent =
          "We could not reach the reservation system. Please try again in a moment.";
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Submit reference";
      }
    }
  });

  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ════════════════════════════════════════════════════════════
// Form Submission Handler
// ════════════════════════════════════════════════════════════
function initFormHandlers(): void {
  const form = document.getElementById("booking-form") as HTMLFormElement;
  if (!form) return;

  const today = new Date().toISOString().split("T")[0];
  const checkinField = form.querySelector<HTMLInputElement>("#checkin");
  const checkoutField = form.querySelector<HTMLInputElement>("#checkout");
  const suiteField = form.querySelector<HTMLSelectElement>("#suite");
  const emailField = form.querySelector<HTMLInputElement>("#email");
  const policyField = form.querySelector<HTMLInputElement>("#accept-policy");
  const submitField = form.querySelector<HTMLButtonElement>("#booking-submit");
  const roomTypeField = form.querySelector<HTMLInputElement>("#roomTypeId");
  const resultPanel = form.querySelector<HTMLElement>("#booking-result");
  const statusField = form.querySelector<HTMLElement>("#form-message");

  if (checkinField) checkinField.min = today;
  if (checkoutField) checkoutField.min = today;
  checkinField?.addEventListener("change", () => {
    if (checkoutField && checkinField.value)
      checkoutField.min = checkinField.value;
  });

  const valueOf = (selector: string): string => {
    const element = form.querySelector<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(selector);
    return element ? element.value.trim() : "";
  };

  const setStatus = (message: string): void => {
    if (statusField) statusField.textContent = message;
  };

  // The policy checkbox and the button label depend on whether this submit
  // will hit the reservation system or fall back to WhatsApp.
  const syncSelectionUi = (): void => {
    const suite = valueOf("#suite");
    const roomNumber = roomCodeOf(suite);
    // Email is optional for an enquiry. The reservation provider needs one
    // for a confirmed online hold, so a guest who leaves it blank is sent to
    // WhatsApp instead of being blocked by a validation error.
    const canBookOnline = Boolean(
      roomNumber && valueOf("#checkin") && valueOf("#checkout") && valueOf("#email"),
    );
    if (policyField) policyField.required = canBookOnline;
    if (submitField && form.dataset.bookingComplete !== "true") {
      submitField.textContent = canBookOnline
        ? "Book this stay online"
        : "Send your enquiry via WhatsApp";
    }
    // Changing the room invalidates a preloaded room type id.
    if (roomTypeField && roomTypeField.dataset.roomNumber) {
      const preloaded = roomTypeField.dataset.roomNumber;
      if (!roomNumber || preloaded !== roomNumber) {
        roomTypeField.value = "";
        delete roomTypeField.dataset.roomNumber;
      }
    }
  };

  let dateAvailabilitySeq = 0;

  const updateSuiteAvailability = async (): Promise<void> => {
    if (!suiteField) return;

    const adminAvailability = window.NsVilla?.roomAvailability;
    const adminDisabledRooms = new Set<string>();
    if (Array.isArray(adminAvailability)) {
      adminAvailability.forEach((r) => {
        if (!r.available) adminDisabledRooms.add(r.id.toUpperCase());
      });
    }

    const suiteContainer = form.querySelector<HTMLElement>("#suite-container");
    const datesNote = form.querySelector<HTMLElement>("#dates-required-note");

    const checkin = checkinField?.value.trim() || "";
    const checkout = checkoutField?.value.trim() || "";
    const adults = Number(valueOf("#adults") || "1") || 1;
    const children = Number(valueOf("#children") || "0") || 0;

    const hasValidDates = Boolean(
      checkin && checkout && checkout > checkin,
    );

    if (suiteContainer) suiteContainer.hidden = !hasValidDates;
    if (datesNote) datesNote.hidden = hasValidDates;

    if (!hasValidDates) {
      if (suiteField.value) {
        suiteField.value = "";
      }
      if (roomTypeField) {
        roomTypeField.value = "";
        delete roomTypeField.dataset.roomNumber;
      }
      syncSelectionUi();
      return;
    }

    const currentSeq = ++dateAvailabilitySeq;
    try {
      const currentSelectedRoom =
        roomCodeOf(suiteField.value) ||
        roomCodeOf(form.dataset.prefillRoom || "") ||
        "";

      const query = new URLSearchParams({
        checkInDate: checkin,
        checkOutDate: checkout,
        adults: String(adults),
        children: String(children),
      });
      if (currentSelectedRoom) {
        query.set("roomNumber", currentSelectedRoom);
        query.set("breakdown", "true");
      }

      const response = await fetch(`/api/live-availability?${query}`, {
        cache: "no-store",
      });
      const body = (await response.json()) as LiveAvailabilityResponse;
      if (currentSeq !== dateAvailabilitySeq) return;

      const types = Array.isArray(body.data) ? body.data : [];
      const availableRoomCodes = new Set<string>();
      types.forEach((type) => {
        if (type.available && Array.isArray(type.availableRooms)) {
          type.availableRooms.forEach((r) => {
            const num = String(r.number || "").toUpperCase();
            if (num) availableRoomCodes.add(num);
          });
        }
      });

      let unselectedLabel: string | null = null;
      let unselectedCustomMessage: string | null = null;

      Array.from(suiteField.options).forEach((option) => {
        const code = roomCodeOf(option.value);
        if (!code) return;
        if (!option.dataset.originalLabel) {
          option.dataset.originalLabel = option.textContent || "";
        }

        const isAdminUnavailable = adminDisabledRooms.has(code);
        const isDateAvailable = availableRoomCodes.has(code);

        if (isAdminUnavailable) {
          option.disabled = true;
          option.textContent = `${option.dataset.originalLabel} (Unavailable)`;
          if (suiteField.value === option.value) {
            unselectedLabel = option.dataset.originalLabel;
            suiteField.value = "";
          }
        } else if (!isDateAvailable) {
          option.disabled = true;

          // Check if we have specific nightly breakdown for this room
          if (
            body.roomNumber?.toUpperCase() === code &&
            Array.isArray(body.nightlyBreakdown) &&
            body.nightlyBreakdown.length > 1
          ) {
            const unavailableDates = body.nightlyBreakdown
              .filter((n) => !n.available)
              .map((n) => n.date);
            const availableDates = body.nightlyBreakdown
              .filter((n) => n.available)
              .map((n) => n.date);

            if (unavailableDates.length > 0 && availableDates.length > 0) {
              option.textContent = `${option.dataset.originalLabel} (Available on ${formatDateList(availableDates)} only)`;
              if (
                suiteField.value === option.value ||
                form.dataset.prefillRoom?.toUpperCase() === code
              ) {
                unselectedCustomMessage = `${roomLabelOf(code)} is not available on ${formatDateList(unavailableDates)}, but on ${formatDateList(availableDates)} it is available as of the time of your search.`;
                suiteField.value = "";
              }
            } else {
              option.textContent = `${option.dataset.originalLabel} (Not available for dates)`;
              if (suiteField.value === option.value) {
                unselectedLabel = option.dataset.originalLabel;
                suiteField.value = "";
              }
            }
          } else {
            option.textContent = `${option.dataset.originalLabel} (Not available for dates)`;
            if (suiteField.value === option.value) {
              unselectedLabel = option.dataset.originalLabel;
              suiteField.value = "";
            }
          }
        } else {
          option.disabled = false;
          option.textContent = option.dataset.originalLabel;
        }
      });

      if (unselectedCustomMessage || unselectedLabel) {
        if (roomTypeField) {
          roomTypeField.value = "";
          delete roomTypeField.dataset.roomNumber;
        }
        setStatus(
          unselectedCustomMessage ||
            `${unselectedLabel} is not available between ${formatShortDate(checkin)} and ${formatShortDate(checkout)}. Please choose an available room or contact us on WhatsApp.`,
        );
        syncSelectionUi();
      } else {
        if (!suiteField.value && form.dataset.prefillRoom) {
          const pending = form.dataset.prefillRoom;
          const targetRoomNo = roomCodeOf(pending);
          for (const opt of Array.from(suiteField.options)) {
            const c = roomCodeOf(opt.value);
            if (
              (targetRoomNo && c === targetRoomNo) ||
              opt.value.toLowerCase().includes(pending.toLowerCase()) ||
              opt.text.toLowerCase().includes(pending.toLowerCase())
            ) {
              if (!opt.disabled) {
                suiteField.value = opt.value;
              } else {
                setStatus(
                  `${opt.dataset.originalLabel || pending} is not available for the selected dates. Please choose an available room or contact us on WhatsApp.`,
                );
              }
              break;
            }
          }
        }
        const currentCode = roomCodeOf(suiteField.value);
        if (currentCode && roomTypeField) {
          const match = types.find((t) =>
            (t.availableRooms || []).some(
              (r) => String(r.number || "").toUpperCase() === currentCode,
            ),
          );
          if (match && match.available) {
            roomTypeField.value = match.id;
            roomTypeField.dataset.roomNumber = currentCode;
          }
        }
      }
    } catch (err) {
      console.debug("[contact] live availability check failed", err);
    }
  };

  suiteField?.addEventListener("change", () => {
    const selected = suiteField.selectedOptions[0];
    if (selected && selected.disabled) {
      suiteField.value = "";
    } else if (
      statusField &&
      (statusField.textContent.includes("not available") ||
        statusField.textContent.includes("currently unavailable"))
    ) {
      setStatus("");
    }
    syncSelectionUi();
  });
  emailField?.addEventListener("input", syncSelectionUi);
  checkinField?.addEventListener("change", () => {
    syncSelectionUi();
    updateSuiteAvailability();
  });
  checkoutField?.addEventListener("change", () => {
    syncSelectionUi();
    updateSuiteAvailability();
  });
  form.querySelector("#adults")?.addEventListener("change", () => {
    updateSuiteAvailability();
  });
  form.querySelector("#children")?.addEventListener("change", () => {
    updateSuiteAvailability();
  });
  window.addEventListener("nsvilla:room-availability-updated", () => {
    updateSuiteAvailability();
  });
  syncSelectionUi();
  updateSuiteAvailability();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const checkin = valueOf("#checkin");
    const checkout = valueOf("#checkout");

    if (!checkin || !checkout) {
      if (!checkin && checkinField) {
        checkinField.focus();
        checkinField.reportValidity();
      } else if (!checkout && checkoutField) {
        checkoutField.focus();
        checkoutField.reportValidity();
      }
      setStatus("Please select your arrival and departure dates to view and select available rooms.");
      return;
    }

    if (
      checkinField?.value &&
      checkoutField?.value &&
      checkoutField.value <= checkinField.value
    ) {
      checkoutField.setCustomValidity("Check-out must be after check-in.");
      checkoutField.reportValidity();
      return;
    }
    checkoutField?.setCustomValidity("");

    if (form.dataset.bookingComplete === "true") {
      setStatus(
        "You already have a held booking above. Refresh the page to make another booking.",
      );
      return;
    }

    const suite = valueOf("#suite");
    const roomNumber = roomCodeOf(suite);
    const adults = Number(valueOf("#adults") || "1") || 1;
    const children = Number(valueOf("#children") || "0") || 0;
    const firstName = valueOf("#firstname");
    const lastName = valueOf("#lastname");
    const email = valueOf("#email");
    const phone = valueOf("#phone");
    const message = valueOf("#message");

    const enquiry: EnquiryDetails = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      suite,
      checkin,
      checkout,
      adults,
      children,
      message,
    };

    // Venue hire, group bookings, general questions and dateless enquiries
    // keep the existing WhatsApp path.
    if (!roomNumber || !checkin || !checkout) {
      setStatus("");
      openWhatsAppEnquiry(enquiry);
      return;
    }

    if (submitField) {
      submitField.disabled = true;
      submitField.textContent = "Holding your room…";
    }
    setStatus("");

    try {
      const roomTypeId = await resolveRoomTypeId(
        roomNumber,
        checkin,
        checkout,
        adults,
        children,
        { id: roomTypeField?.value || "", roomNumber: roomTypeField?.dataset.roomNumber || "" },
      );

      if (!roomTypeId) {
        openWhatsAppEnquiry({
          ...enquiry,
          note: `Those dates (${checkin} to ${checkout}) could not be booked online for ${suite}. Please check alternatives for us.`,
        });
        return;
      }

      const { status, body } = await postJson("/api/create-booking", {
        roomTypeId,
        checkInDate: checkin,
        checkOutDate: checkout,
        adults,
        children,
        firstName,
        lastName,
        email,
        phone,
        acceptPolicy: true,
        specialRequests: message || undefined,
      });

      const data = (body as { data?: BookingConfirmation } | null)?.data;
      if (status >= 200 && status < 300 && data?.confirmationNo) {
        if (resultPanel) renderBookingResult(resultPanel, data, email);
        form.dataset.bookingComplete = "true";
        form.reset();
        setStatus(
          "Your room is held — send the deposit to confirm. Details are shown below.",
        );
        return;
      }

      setStatus(
        apiErrorMessage(
          body,
          "Your booking could not be completed. Please try again.",
        ),
      );
    } catch (error) {
      setStatus(
        error instanceof Error && error.message
          ? error.message
          : "We could not reach the reservation system. Please try again in a moment.",
      );
    } finally {
      if (submitField) {
        submitField.disabled = false;
        syncSelectionUi();
      }
    }
  });
}

// ════════════════════════════════════════════════════════════
// Booking pre-fill (from the availability search and room cards)
// ════════════════════════════════════════════════════════════
function initBookingPrefill(): void {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const roomLabel = (params.get("room") || "").trim();
  const roomTypeId = (params.get("roomTypeId") || "").trim();
  const checkin = (params.get("checkin") || "").trim();
  const checkout = (params.get("checkout") || "").trim();
  const adults = (params.get("adults") || "").trim();
  const children = (params.get("children") || "").trim();
  const roomNumberParam = (params.get("roomNo") || "").trim().toUpperCase();
  const roomNumber = roomNumberParam || roomCodeOf(roomLabel);

  const suiteField = form.querySelector<HTMLSelectElement>("#suite");
  const checkinField = form.querySelector<HTMLInputElement>("#checkin");
  const checkoutField = form.querySelector<HTMLInputElement>("#checkout");
  const adultsField = form.querySelector<HTMLSelectElement>("#adults");
  const childrenField = form.querySelector<HTMLSelectElement>("#children");
  const roomTypeField = form.querySelector<HTMLInputElement>("#roomTypeId");
  const messageField = form.querySelector<HTMLTextAreaElement>("#message");

  if (checkinField && ISO_DATE_PATTERN.test(checkin))
    checkinField.value = checkin;
  if (checkoutField && ISO_DATE_PATTERN.test(checkout)) {
    checkoutField.value = checkout;
    if (checkinField?.value) checkoutField.min = checkinField.value;
  }
  if (
    adultsField &&
    /^\d+$/.test(adults) &&
    Array.from(adultsField.options).some((option) => option.value === adults)
  ) {
    adultsField.value = adults;
  }
  if (
    childrenField &&
    /^\d+$/.test(children) &&
    Array.from(childrenField.options).some(
      (option) => option.value === children,
    )
  ) {
    childrenField.value = children;
  }

  const hasValidDates = Boolean(
    checkinField?.value &&
      checkoutField?.value &&
      checkoutField.value > checkinField.value,
  );

  if (roomLabel) {
    form.dataset.prefillRoom = roomLabel;
  }

  if (hasValidDates && suiteField && roomLabel) {
    let matched = false;
    if (roomNumber) {
      for (const option of Array.from(suiteField.options)) {
        if (roomCodeOf(option.value) === roomNumber) {
          if (!option.disabled) {
            suiteField.value = option.value;
          }
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      const needle = roomLabel.toLowerCase();
      for (const option of Array.from(suiteField.options)) {
        if (
          option.value.toLowerCase().includes(needle) ||
          option.text.toLowerCase().includes(needle)
        ) {
          if (!option.disabled) {
            suiteField.value = option.value;
          }
          break;
        }
      }
    }
  }

  if (
    roomTypeField &&
    roomNumber &&
    UUID_PATTERN.test(roomTypeId)
  ) {
    roomTypeField.value = roomTypeId;
    roomTypeField.dataset.roomNumber = roomNumber;
  }

  // Dateless "Inquire" links only need a nudge; bookings that arrive with
  // dates carry everything they need in the confirmation itself.
  if (messageField && !messageField.value && roomLabel && !roomTypeId && suiteField?.value) {
    messageField.value = `Hello, I would like to inquire about booking ${roomLabel}. Please confirm availability and dates.`;
  }
}

// ════════════════════════════════════════════════════════════
// Floating WhatsApp Button
// ════════════════════════════════════════════════════════════
function initFloatingWhatsApp(): void {
  // Create floating button if needed
  const existingBtn = document.getElementById("floating-whatsapp");
  if (!existingBtn) {
    const btn = document.createElement("a");
    btn.id = "floating-whatsapp";
    btn.setAttribute("aria-label", "Chat with NS LUXURY VILLA on WhatsApp");
    btn.href = `https://wa.me/${PRIMARY_WHATSAPP}`;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className =
      "fixed bottom-6 right-6 text-white rounded-full z-50 flex items-center justify-center";
    btn.innerHTML = `
      <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 448 512" aria-hidden="true">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
      </svg>
    `;
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Quick contact");
    nav.appendChild(btn);
    document.body.appendChild(nav);
  }
}

async function downloadImage(url: string, filename?: string): Promise<void> {
  const cleanName =
    filename ||
    url.split("/").pop()?.split("?")[0] ||
    "nsvilla-photo.jpeg";
  const finalName =
    cleanName.endsWith(".jpeg") || cleanName.endsWith(".jpg") || cleanName.endsWith(".png")
      ? cleanName
      : `${cleanName}.jpeg`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  } catch (err) {
    console.warn("Direct blob download failed, falling back to direct link", err);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function initVillaArchive(): void {
  const archive = document.querySelector<HTMLElement>("[data-villa-archive]");
  if (!archive) return;
  if (archive.querySelector(".villa-archive-item")) return;

  const assets = [
    "apartment.jpeg",
    "apartmnt.jpeg",
    "backyard (2).jpeg",
    "backyard.jpeg",
    "bar (2).jpeg",
    "bar and shelf.jpeg",
    "bar arrangement.jpeg",
    "bar shelf.jpeg",
    "bar.jpeg",
    "bathhouse.jpeg",
    "bathroom.jpeg",
    "bed (2).jpeg",
    "bed.jpeg",
    "bedroo.jpeg",
    "bedroom (2).jpeg",
    "bedroom (3).jpeg",
    "bedroom.jpeg",
    "beds.jpeg",
    "bedsh.jpeg",
    "bedshee.jpeg",
    "block B.jpeg",
    "buildin.jpeg",
    "building (2).jpeg",
    "building.jpeg",
    "buildings.jpeg",
    "buildo.jpeg",
    "door and fire extinguisher.jpeg",
    "door and wardrope.jpeg",
    "door entra.jpeg",
    "door.jpeg",
    "extinguisher.jpeg",
    "feel at home.jpeg",
    "feels.jpeg",
    "fell@home.jpeg",
    "fridge and mirror.jpeg",
    "fridge.jpeg",
    "frontview of the block B.jpeg",
    "garden.jpeg",
    "hall.jpeg",
    "halls.jpeg",
    "home.jpeg",
    "homes.jpeg",
    "inside.jpeg",
    "mirror.jpeg",
    "nice paintings.jpeg",
    "nice pool.jpeg",
    "nights.jpeg",
    "nightsv.jpeg",
    "nightview.jpeg",
    "ns bar.jpeg",
    "NS LOGO.jpeg",
    "nsvil.jpeg",
    "out.jpeg",
    "outs.jpeg",
    "outside ground.jpeg",
    "outside.jpeg",
    "paint.jpeg",
    "pool (2).jpeg",
    "pool (3).jpeg",
    "pool (4).jpeg",
    "pool (5).jpeg",
    "pool and bar (2).jpeg",
    "pool and bar (3).jpeg",
    "pool and bar.jpeg",
    "pool entranc.jpeg",
    "pool entrance night.jpeg",
    "pool entrance.jpeg",
    "pool entras night.jpeg",
    "pool washroom.jpeg",
    "poole.jpeg",
    "pooll.jpeg",
    "pools (2).jpeg",
    "pools.jpeg",
    "poolsi.jpeg",
    "poolside (2).jpeg",
    "poolvi.jpeg",
    "poolw.jpeg",
    "reception.jpeg",
    "rooftop bar.jpeg",
    "rooftop.jpeg",
    "room entran.jpeg",
    "room entrance.jpeg",
    "room insid.jpeg",
    "room kitchen.jpeg",
    "security door.jpeg",
    "shelf.jpeg",
    "side (2).jpeg",
    "side (3).jpeg",
    "side.jpeg",
    "sideview of the pool.jpeg",
    "sofa (2).jpeg",
    "sofa in rooms.jpeg",
    "sofa.jpeg",
    "soft bed.jpeg",
    "summer house.jpeg",
    "swim.jpeg",
    "swimm.jpeg",
    "swimming pool.jpeg",
    "telephone.jpeg",
    "toilet.jpeg",
    "two beds.jpeg",
    "upper view.jpeg",
    "upper.jpeg",
    "wall.jpeg",
    "wardrope.jpeg",
    "washroom.jpeg",
    "washrooms.jpeg",
  ];
  const category = (asset: string) => {
    const name = asset.toLowerCase();
    if (name.includes("pool") || name.includes("swim")) return "pool";
    if (name.includes("bar") || name.includes("rooftop")) return "bar";
    if (
      name.includes("bed") ||
      name.includes("room") ||
      name.includes("sofa") ||
      name.includes("kitchen") ||
      name.includes("fridge") ||
      name.includes("bath") ||
      name.includes("toilet") ||
      name.includes("wash")
    )
      return "stay";
    if (name.includes("logo")) return "identity";
    return "home";
  };
  const captions: Record<string, string> = {
    "nice pool.jpeg": "Swimming pool beneath the signature umbrella canopy",
    "poolw.jpeg": "Garden-framed view of the covered pool",
    "pool and bar.jpeg": "Poolside restaurant and bar terrace",
    "garden.jpeg": "Quiet lawn and garden space",
    "ns bar.jpeg": "Restaurant and bar interior",
    "rooftop bar.jpeg": "Open-air rooftop lounge",
    "nice paintings.jpeg": "Hand-painted mural along the villa walkway",
    "pool and bar (3).jpeg": "Pool, bar and outdoor spaces at dusk",
    "paint.jpeg": "Hand-painted mural along the villa walkway",
    "upper view.jpeg": "Aerial view of NS LUXURY VILLA",
    "nights.jpeg": "Pool and terrace after dark",
    "bed.jpeg": "Prepared guest bedroom",
    "apartment.jpeg": "Furnished apartment living space",
    "room kitchen.jpeg": "Full kitchen for apartment guests",
    "reception.jpeg": "Villa reception area",
    "inside.jpeg": "Interior lounge setting",
    "NS LOGO.jpeg": "NS LUXURY VILLA brand mark",
  };
  const captionFor = (asset: string) =>
    captions[asset] ||
    {
      pool: "Pool and terrace detail",
      bar: "Bar and rooftop detail",
      stay: "Guest accommodation detail",
      identity: "NS LUXURY VILLA brand mark",
      home: "Villa and garden detail",
    }[category(asset)] ||
    "NS LUXURY VILLA detail";

  archive.innerHTML = assets
    .map((asset, index) => {
      const caption = captionFor(asset);
      return `<figure class="villa-archive-item" data-category="${category(asset)}"><img src="/images/${encodeURIComponent(asset)}" alt="${caption}" loading="lazy" decoding="async"><figcaption>${String(index + 1).padStart(2, "0")} · ${caption}</figcaption></figure>`;
    })
    .join("");

  document
    .querySelectorAll<HTMLButtonElement>("[data-gallery-filter]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const filter = button.dataset.galleryFilter || "all";
        document
          .querySelectorAll<HTMLButtonElement>("[data-gallery-filter]")
          .forEach((item) =>
            item.classList.toggle("is-active", item === button),
          );
        archive
          .querySelectorAll<HTMLElement>(".villa-archive-item")
          .forEach(
            (item) =>
              (item.hidden =
                filter !== "all" && item.dataset.category !== filter),
          );
      }),
    );

  (window as unknown as { __attachImageViewers?: () => void }).__attachImageViewers?.();
}

function initImageViewer(): void {
  let dialog = document.querySelector<HTMLDialogElement>("dialog.image-viewer");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.className = "image-viewer";
    dialog.innerHTML = `
      <div class="image-viewer-toolbar">
        <button type="button" class="image-viewer-action-btn image-viewer-download" title="Download original photograph" aria-label="Download original photograph">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
        <button type="button" class="image-viewer-action-btn image-viewer-close" aria-label="Close image viewer" title="Close (Esc)">×</button>
      </div>
      <figure>
        <img alt="">
        <figcaption></figcaption>
      </figure>
    `;
    document.body.appendChild(dialog);
  }

  const viewerImage = dialog.querySelector<HTMLImageElement>("figure img")!;
  const viewerCaption = dialog.querySelector<HTMLElement>("figcaption")!;
  const viewerDownloadBtn = dialog.querySelector<HTMLButtonElement>(".image-viewer-download")!;
  const close = () => dialog?.close();

  let currentDownloadUrl = "";
  let currentDownloadName = "";

  const defaultDownloadIcon = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `;

  const successDownloadIcon = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  const handleDownload = async () => {
    if (!currentDownloadUrl || viewerDownloadBtn.disabled) return;
    viewerDownloadBtn.disabled = true;
    try {
      await downloadImage(currentDownloadUrl, currentDownloadName);
      viewerDownloadBtn.innerHTML = successDownloadIcon;
      viewerDownloadBtn.classList.add("is-success");
      setTimeout(() => {
        viewerDownloadBtn.innerHTML = defaultDownloadIcon;
        viewerDownloadBtn.classList.remove("is-success");
        viewerDownloadBtn.disabled = false;
      }, 1600);
    } catch {
      viewerDownloadBtn.disabled = false;
    }
  };

  viewerDownloadBtn.onclick = (e) => {
    e.stopPropagation();
    handleDownload();
  };

  dialog.querySelector(".image-viewer-close")?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  const openViewerForImage = (image: HTMLImageElement) => {
    const fullUrl = image.dataset.origUrl || image.dataset.downloadUrl || image.currentSrc || image.src;
    viewerImage.src = fullUrl;
    viewerImage.alt = image.alt;
    viewerCaption.textContent = image.alt;
    currentDownloadUrl = fullUrl;
    currentDownloadName =
      image.dataset.filename ||
      `NS-Luxury-Villa-${(image.alt || "photo").slice(0, 36).trim().replace(/[^a-zA-Z0-9_-]+/g, "-")}.jpeg`;
    viewerDownloadBtn.disabled = false;
    viewerDownloadBtn.innerHTML = defaultDownloadIcon;
    viewerDownloadBtn.classList.remove("is-success");
    dialog!.showModal();
  };

  const attachTriggers = () => {
    document.querySelectorAll<HTMLImageElement>("main img").forEach((image) => {
      if (image.dataset.viewerAttached) return;
      image.dataset.viewerAttached = "true";
      image.classList.add("image-viewer-trigger");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `View larger: ${image.alt || "image"}`);
      image.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest("button, a")) return;
        openViewerForImage(image);
      });
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openViewerForImage(image);
        }
      });
    });
  };

  // Keyboard shortcut: press 'd' while viewer dialog is open to download
  document.addEventListener("keydown", (event) => {
    if (dialog?.open && (event.key === "d" || event.key === "D")) {
      event.preventDefault();
      handleDownload();
    }
  });

  attachTriggers();
  (window as unknown as { __attachImageViewers?: () => void }).__attachImageViewers = attachTriggers;
}

function initRoomCatalog(): void {
  // Category filter tabs on /rooms
  const filterButtons = document.querySelectorAll<HTMLButtonElement>(".villa-filter-btn");
  const roomCards = document.querySelectorAll<HTMLElement>(".villa-room-card");

  if (filterButtons.length && roomCards.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const category = btn.dataset.filter || "all";

        roomCards.forEach((card) => {
          if (category === "all" || card.dataset.category === category) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // Auto-pause video players when another room video starts
  const roomVideos = document.querySelectorAll<HTMLVideoElement>(".villa-room-video");
  roomVideos.forEach((video) => {
    video.addEventListener("play", () => {
      roomVideos.forEach((other) => {
        if (other !== video && !other.paused) {
          other.pause();
        }
      });
    });
  });
}

export {
  normalizeInternalLinks,
  initScrollReveals,
  initSmoothScroll,
  initFormHandlers,
  initBookingPrefill,
  initFloatingWhatsApp,
  initVillaArchive,
  initImageViewer,
  syncSiteNavigation,
  applyArtDirection,
  initRoomCatalog,
  downloadImage,
};

