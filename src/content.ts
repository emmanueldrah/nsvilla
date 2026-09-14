// NS LUXURY VILLA — remote content layer.
// Fetches site content + flyers from the admin API (/api/content) and applies
// them live. If the API is unreachable (e.g. not deployed yet), the site
// renders exactly as before — this module is entirely optional.
import type { SiteContent, Flyer, ContactFields } from "./cms-types";

declare global {
  interface Window {
    NsVilla?: { contact?: ContactFields };
  }
}

function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function isActiveFlyer(f: Flyer): boolean {
  if (!f.active) return false;
  if (f.validUntil && f.validUntil < todayISO()) return false;
  return true;
}

function setText(el: Element | null, value: string | undefined | null) {
  if (el && value) el.textContent = value;
}

export async function initRemoteContent(): Promise<void> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch("/api/content", { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return;
    const data = (await res.json()) as { content?: SiteContent };
    const content = data.content;
    if (!content) return;

    window.NsVilla = { contact: content.contact };

    applyContact(content);
    applyHero(content);
    applyRooms(content);
    applyAmenities(content);
    applyPricing(content);
    applyFooter(content);
    applyFlyers(content);
  } catch {
    // API unavailable — keep static content.
  }
}

function applyContact(c: SiteContent): void {
  const contact = c.contact;
  if (!contact) return;
  document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]').forEach((a) => {
    if (contact.phoneHref) a.href = contact.phoneHref;
    if (contact.phone) a.textContent = contact.phone;
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]').forEach((a) => {
    if (contact.emailHref) a.href = contact.emailHref;
    if (contact.email) a.textContent = contact.email;
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="https://wa.me/"]').forEach((a) => {
    if (contact.waPrimary) a.href = `https://wa.me/${contact.waPrimary}`;
  });
}

function applyHero(c: SiteContent): void {
  const hero = c.hero;
  if (!hero) return;
  const h1 = document.querySelector<HTMLElement>(".family-hero-content h1");
  if (h1 && hero.headline) h1.innerHTML = hero.headline;
  setText(document.querySelector(".family-hero-content .family-lead"), hero.lead);
  setText(document.querySelector(".family-hero-note"), hero.note);
}

function applyRooms(c: SiteContent): void {
  const rooms = c.rooms;
  if (!rooms || !rooms.length) return;
  document.querySelectorAll(".family-feature-card").forEach((card, i) => {
    const item = rooms[i];
    if (!item) return;
    setText(card.querySelector(".family-feature-tag"), item.tag);
    setText(card.querySelector("h3"), item.title);
    const body = card.querySelector("div p:last-child");
    setText(body, item.body);
  });
}

function applyAmenities(c: SiteContent): void {
  const items = c.amenities;
  if (!items || !items.length) return;
  document.querySelectorAll(".amenities-timeline article").forEach((article, i) => {
    const item = items[i];
    if (!item) return;
    setText(article.querySelector(".family-feature-tag"), item.tag);
    setText(article.querySelector("h3"), item.title);
    setText(article.querySelector("div > p:last-child"), item.body);
  });
}

function applyPricing(c: SiteContent): void {
  const items = c.pricing;
  if (!items || !items.length) return;
  document.querySelectorAll(".family-price-card").forEach((card, i) => {
    const item = items[i];
    if (!item) return;
    setText(card.querySelector(".family-feature-tag"), item.tag);
    setText(card.querySelector("h3"), item.title);
    setText(card.querySelector("p"), item.body);
    const list = card.querySelector("ul");
    if (list && Array.isArray(item.points) && item.points.length) {
      list.innerHTML = item.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("");
    }
  });
}

function applyFooter(c: SiteContent): void {
  const footer = c.footer;
  if (!footer) return;
  const foot = document.querySelector(".family-footer");
  if (!foot) return;
  setText(foot.querySelector(".family-footer-grid > div:first-child > p"), footer.tagline);
  setText(foot.querySelector(".family-copyright"), footer.copyright);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

function applyFlyers(c: SiteContent): void {
  const flyers = (c.flyers || []).filter(isActiveFlyer);
  if (!flyers.length) return;
  flyers.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  injectBanner(flyers);
  injectFlyersSection(flyers);
}

function injectBanner(flyers: Flyer[]): void {
  const bannerFlyer = flyers.find((f) => f.showAsBanner);
  if (!bannerFlyer) return;
  const dismissed = localStorage.getItem("nsvilla:banner:hidden");
  if (dismissed === bannerFlyer.id) return;

  const banner = document.createElement("div");
  banner.className = "cms-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Promotion");
  const label = bannerFlyer.label
    ? `<span class="cms-banner-label">${escapeHtml(bannerFlyer.label)}</span> `
    : "";
  const link = bannerFlyer.linkUrl
    ? `<a class="cms-banner-link" href="${escapeHtml(bannerFlyer.linkUrl)}">${escapeHtml(bannerFlyer.linkText || "Learn more")}</a>`
    : "";
  banner.innerHTML = `
    <div class="cms-banner-inner">
      <span class="cms-banner-text">${label}<strong>${escapeHtml(bannerFlyer.title)}</strong> — ${escapeHtml(bannerFlyer.description)}</span>
      ${link}
    </div>
    <button type="button" class="cms-banner-close" aria-label="Dismiss promotion">×</button>`;
  banner.querySelector(".cms-banner-close")?.addEventListener("click", () => {
    localStorage.setItem("nsvilla:banner:hidden", bannerFlyer.id);
    banner.remove();
  });
  document.body.insertBefore(banner, document.body.firstChild);
}

function injectFlyersSection(flyers: Flyer[]): void {
  const main = document.querySelector("main");
  if (!main) return;
  // Only show the promotions grid on the homepage.
  if (!document.querySelector(".family-hero")) return;

  const section = document.createElement("section");
  section.className = "cms-flyers";
  section.setAttribute("aria-labelledby", "cms-flyers-title");
  const cards = flyers
    .map(
      (f) => `
      <article class="cms-flyer-card">
        ${f.image ? `<img class="cms-flyer-img" src="${escapeHtml(f.image)}" alt="${escapeHtml(f.title)}" loading="lazy" decoding="async">` : ""}
        <div class="cms-flyer-body">
          ${f.label ? `<span class="family-feature-tag">${escapeHtml(f.label)}</span>` : ""}
          <h3>${escapeHtml(f.title)}</h3>
          <p>${escapeHtml(f.description)}</p>
          ${f.linkUrl ? `<a class="family-btn family-btn-primary" href="${escapeHtml(f.linkUrl)}">${escapeHtml(f.linkText || "Learn more")}</a>` : ""}
        </div>
      </article>`,
    )
    .join("");
  section.innerHTML = `
    <div class="container">
      <p class="family-kicker dark">Offers &amp; events</p>
      <h2 id="cms-flyers-title">Current promotions</h2>
      <div class="cms-flyer-grid">${cards}</div>
    </div>`;
  main.appendChild(section);
}