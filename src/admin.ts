import "./admin.css";
import type { SiteContent, Flyer, ContactFields } from "./cms-types";

const $ = (sel: string): HTMLElement | null => document.querySelector(sel);
const $$ = (sel: string): NodeListOf<HTMLElement> => document.querySelectorAll(sel);

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

let content: SiteContent | null = null;

// ────────────────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────────────────
async function api(path: string, options: RequestInit = {}): Promise<{ ok: boolean; status: number; body: any }> {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* empty body */
  }
  return { ok: res.ok, status: res.status, body };
}

async function getSession(): Promise<boolean> {
  const r = await api("/api/session");
  return Boolean(r.body?.authed);
}

async function login(password: string): Promise<boolean> {
  const r = await api("/api/login", { method: "POST", body: JSON.stringify({ password }) });
  return r.ok;
}

async function logout(): Promise<void> {
  await api("/api/logout", { method: "POST" });
}

async function getContent(): Promise<SiteContent> {
  const r = await api("/api/content");
  return r.body?.content || null;
}

async function putContent(next: SiteContent): Promise<boolean> {
  const r = await api("/api/content", { method: "PUT", body: JSON.stringify(next) });
  return r.ok;
}

async function uploadFlyerImage(file: File): Promise<string> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
  const r = await api("/api/flyer-image", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, data }),
  });
  if (!r.ok) throw new Error(r.body?.error || "Upload failed");
  return r.body.url;
}

// ────────────────────────────────────────────────────────────
// Auth / shell
// ────────────────────────────────────────────────────────────
async function init(): Promise<void> {
  const authed = await getSession();
  if (authed) {
    await loadApp();
  } else {
    showLogin();
  }
}

function showLogin(): void {
  $("#view-login")?.classList.remove("hidden");
  $("#view-app")?.classList.add("hidden");
}

async function loadApp(): Promise<void> {
  $("#view-login")?.classList.add("hidden");
  $("#view-app")?.classList.remove("hidden");
  try {
    content = await getContent();
  } catch {
    content = null;
  }
  if (!content) {
    content = {
      updatedAt: null,
      contact: { phone: "", phoneHref: "", email: "", emailHref: "", waPrimary: "", waSecondary: "", airbnb: "", tiktok: "", facebook: "" },
      hero: { headline: "", lead: "", note: "" },
      rooms: [],
      amenities: [],
      pricing: [],
      footer: { tagline: "", copyright: "" },
      flyers: [],
    };
  }
  renderFlyers();
  renderContentEditor();
  renderBroadcast();
  renderLastSaved();
  $("#new-flyer")?.addEventListener("click", () => {
    openFlyerEditor(null);
  });
}

function renderLastSaved(): void {
  const saved = $("#last-saved");
  if (!saved) return;
  saved.textContent = content?.updatedAt ? `Last saved ${new Date(content.updatedAt).toLocaleString()}` : "";
}

function wireShell(): void {
  $("#login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = ($("#admin-password") as HTMLInputElement)?.value || "";
    const err = $("#login-error");
    if (!password) {
      if (err) err.textContent = "Enter the admin password.";
      return;
    }
    if (err) err.textContent = "";
    const ok = await login(password);
    if (ok) {
      ($("#admin-password") as HTMLInputElement).value = "";
      await loadApp();
    } else if (err) {
      err.textContent = "Incorrect password. Please try again.";
    }
  });

  $("#logout-btn")?.addEventListener("click", async () => {
    await logout();
    showLogin();
  });

  $("#view-site")?.addEventListener("click", () => {
    window.open("/", "_blank");
  });

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => t.classList.toggle("active", t === tab));
      $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${tab.dataset.panel}`));
    });
  });
}

// ────────────────────────────────────────────────────────────
// Flyers
// ────────────────────────────────────────────────────────────
function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `f_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function renderFlyers(): void {
  if (!content) return;
  const list = $("#flyer-list");
  if (!list) return;
  const flyers = content.flyers || [];
  if (!flyers.length) {
    list.innerHTML = '<p class="empty-state">No flyers yet. Click “+ New flyer” to post your first promotion.</p>';
    return;
  }
  list.innerHTML = flyers
    .map(
      (f) => `
      <div class="flyer-item" data-id="${escapeHtml(f.id)}">
        ${f.image ? `<img src="${escapeHtml(f.image)}" alt="">` : '<img src="" alt="" style="display:none">'}
        <div class="meta">
          ${f.label ? `<span class="tag-label">${escapeHtml(f.label)}</span>` : ""}
          <span class="${f.active ? "badge badge-on" : "badge badge-off"}">${f.active ? "Active" : "Paused"}</span>
          ${f.showAsBanner ? '<span class="badge badge-on">Banner</span>' : ""}
          <strong>${escapeHtml(f.title)}</strong>
          ${f.description ? `<span style="text-transform:none; color:#59645e">${escapeHtml(f.description.slice(0, 90))}${f.description.length > 90 ? "…" : ""}</span>` : ""}
        </div>
        <div class="actions">
          <button type="button" class="btn btn-ghost btn-sm" data-act="toggle">${f.active ? "Pause" : "Activate"}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="edit">Edit</button>
          <button type="button" class="btn btn-danger btn-sm" data-act="delete">Delete</button>
        </div>
      </div>`,
    )
    .join("");

  list.querySelectorAll<HTMLElement>(".flyer-item").forEach((item) => {
    const id = item.dataset.id || "";
    item.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = (btn as HTMLElement).dataset.act;
        const flyer = (content?.flyers || []).find((f) => f.id === id);
        if (!flyer) return;
        if (act === "toggle") {
          flyer.active = !flyer.active;
          saveAndRerender();
        } else if (act === "edit") {
          openFlyerEditor(flyer);
        } else if (act === "delete") {
          if (confirm(`Delete flyer “${flyer.title}”?`)) {
            content!.flyers = (content?.flyers || []).filter((f) => f.id !== id);
            saveAndRerender();
          }
        }
      });
    });
  });
}

async function saveAndRerender(): Promise<void> {
  if (!content) return;
  await putContent(content);
  renderFlyers();
  renderBroadcast();
  renderLastSaved();
}

function openFlyerEditor(flyer: Flyer | null): void {
  const editor = $("#flyer-editor");
  if (!editor) return;
  const f: Flyer = flyer || {
    id: newId(),
    label: "PROMO",
    title: "",
    description: "",
    image: "",
    linkUrl: "",
    linkText: "",
    validFrom: "",
    validUntil: "",
    showAsBanner: false,
    active: true,
    createdAt: new Date().toISOString(),
  };

  editor.classList.remove("hidden");
  editor.innerHTML = `
    <h3>${flyer ? "Edit flyer" : "New flyer"}</h3>
    <div class="field-row">
      <div class="field">
        <label for="fl-label">Label (badge, e.g. PROMO / EVENT)</label>
        <input id="fl-label" type="text" value="${escapeHtml(f.label)}" placeholder="PROMO">
      </div>
      <div class="field">
        <label for="fl-title">Title</label>
        <input id="fl-title" type="text" value="${escapeHtml(f.title)}" placeholder="New Year — 20% off direct bookings">
      </div>
    </div>
    <div class="field">
      <label for="fl-desc">Description</label>
      <textarea id="fl-desc" placeholder="Tell guests what this offer is and how to claim it.">${escapeHtml(f.description)}</textarea>
    </div>
    <div class="field">
      <label for="fl-image-file">Flyer image (optional)</label>
      <input id="fl-image-file" type="file" accept="image/*">
      <div class="hint">Upload a flyer or photo. A URL is also accepted below.</div>
      <input id="fl-image-url" type="url" value="${escapeHtml(f.image)}" placeholder="https://… or leave empty" style="margin-top:0.4rem">
      <img id="fl-image-preview" class="img-preview ${f.image ? "" : "hidden"}" src="${escapeHtml(f.image)}" alt="Flyer preview">
      <p id="fl-image-status" class="error-msg" style="margin:0.4rem 0 0"></p>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="fl-link-url">Link (optional)</label>
        <input id="fl-link-url" type="url" value="${escapeHtml(f.linkUrl)}" placeholder="https://wa.me/233535572774">
      </div>
      <div class="field">
        <label for="fl-link-text">Link label</label>
        <input id="fl-link-text" type="text" value="${escapeHtml(f.linkText)}" placeholder="Claim this offer">
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="fl-valid-from">Valid from</label>
        <input id="fl-valid-from" type="date" value="${escapeHtml(f.validFrom)}">
      </div>
      <div class="field">
        <label for="fl-valid-until">Valid until (optional)</label>
        <input id="fl-valid-until" type="date" value="${escapeHtml(f.validUntil)}">
      </div>
    </div>
    <div class="field check">
      <input id="fl-banner" type="checkbox" ${f.showAsBanner ? "checked" : ""}>
      <label for="fl-banner">Show as a banner strip on every page</label>
    </div>
    <div class="field check">
      <input id="fl-active" type="checkbox" ${f.active ? "checked" : ""}>
      <label for="fl-active">Active (visible on the website)</label>
    </div>
    <div style="display:flex; gap:0.6rem; margin-top:0.5rem">
      <button type="button" class="btn btn-primary" id="fl-save">Save flyer</button>
      <button type="button" class="btn btn-ghost" id="fl-cancel">Cancel</button>
    </div>`;

  const fileInput = $("#fl-image-file") as HTMLInputElement;
  const imageUrl = $("#fl-image-url") as HTMLInputElement;
  const preview = $("#fl-image-preview") as HTMLImageElement;
  const status = $("#fl-image-status");

  const setImage = (url: string) => {
    f.image = url;
    preview.src = url;
    preview.classList.toggle("hidden", !url);
    imageUrl.value = url;
  };

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    status!.textContent = "Uploading…";
    status!.classList.remove("error-msg");
    try {
      const url = await uploadFlyerImage(file);
      setImage(url);
      status!.textContent = "Image uploaded.";
      status!.classList.add("ok-msg");
    } catch (e) {
      status!.classList.remove("ok-msg");
      status!.textContent = e instanceof Error ? e.message : "Upload failed.";
    }
  });

  imageUrl.addEventListener("input", () => {
    const v = imageUrl.value.trim();
    if (v) setImage(v);
    else setImage("");
  });

  $("#fl-save")?.addEventListener("click", async () => {
    f.label = ($("#fl-label") as HTMLInputElement).value.trim();
    f.title = ($("#fl-title") as HTMLInputElement).value.trim();
    f.description = ($("#fl-desc") as HTMLTextAreaElement).value.trim();
    f.linkUrl = ($("#fl-link-url") as HTMLInputElement).value.trim();
    f.linkText = ($("#fl-link-text") as HTMLInputElement).value.trim();
    f.validFrom = ($("#fl-valid-from") as HTMLInputElement).value;
    f.validUntil = ($("#fl-valid-until") as HTMLInputElement).value;
    f.showAsBanner = ($("#fl-banner") as HTMLInputElement).checked;
    f.active = ($("#fl-active") as HTMLInputElement).checked;
    if (!f.title) {
      status!.textContent = "A title is required.";
      status!.classList.remove("ok-msg");
      return;
    }
    const flyers = content?.flyers || [];
    const idx = flyers.findIndex((x) => x.id === f.id);
    if (idx >= 0) flyers[idx] = f;
    else flyers.push(f);
    if (content) content.flyers = flyers;
    await saveAndRerender();
    editor.classList.add("hidden");
  });

  $("#fl-cancel")?.addEventListener("click", () => {
    editor.classList.add("hidden");
  });
}

// ────────────────────────────────────────────────────────────
// Content editor
// ────────────────────────────────────────────────────────────
function field(id: string, label: string, value: string, opts: { type?: string; placeholder?: string; hint?: string; textarea?: boolean } = {}): string {
  const valueEsc = escapeHtml(value || "");
  const placeholder = opts.placeholder ? `placeholder="${escapeHtml(opts.placeholder)}"` : "";
  const hint = opts.hint ? `<div class="hint">${escapeHtml(opts.hint)}</div>` : "";
  const input = opts.textarea
    ? `<textarea id="${id}">${valueEsc}</textarea>`
    : `<input id="${id}" type="${opts.type || "text"}" value="${valueEsc}" ${placeholder}>`;
  return `<div class="field"><label for="${id}">${escapeHtml(label)}</label>${input}${hint}</div>`;
}

function renderContentEditor(): void {
  const box = $("#content-editor");
  if (!box || !content) return;
  const c = content;

  const contactRows = [
    field("c-phone", "Phone (shown on site)", c.contact?.phone || "", { placeholder: "+233 535 572 774" }),
    field("c-email", "Email", c.contact?.email || "", { placeholder: "nsvilla4u@gmail.com" }),
    field("c-wa-primary", "WhatsApp number (primary)", c.contact?.waPrimary || "", { placeholder: "233535572774", hint: "Digits only, with country code, no + or spaces." }),
    field("c-wa-secondary", "WhatsApp number (secondary)", c.contact?.waSecondary || ""),
    field("c-airbnb", "Airbnb listing URL", c.contact?.airbnb || ""),
    field("c-tiktok", "TikTok URL", c.contact?.tiktok || ""),
    field("c-facebook", "Facebook URL", c.contact?.facebook || ""),
  ].join("");

  const heroRows = [
    field("c-hero-headline", "Homepage headline (HTML allowed)", c.hero?.headline || "", { textarea: true, hint: "Use &lt;br&gt; for a line break and &lt;em&gt;…&lt;/em&gt; for italics." }),
    field("c-hero-lead", "Homepage lead paragraph", c.hero?.lead || "", { textarea: true }),
    field("c-hero-note", "Homepage note (below hero)", c.hero?.note || ""),
  ].join("");

  const cardRows = (items: Array<{ tag: string; title: string; body: string }>, prefix: string) =>
    items
      .map((it, i) => `
        <h3>Card ${i + 1}</h3>
        ${field(`${prefix}-${i}-tag`, "Tag", it.tag || "")}
        ${field(`${prefix}-${i}-title`, "Title", it.title || "")}
        ${field(`${prefix}-${i}-body`, "Description", it.body || "", { textarea: true })}`)
      .join("");

  const roomsRows = cardRows(c.rooms || [], "c-room");
  const amenRows = cardRows(c.amenities || [], "c-amen");

  const pricingRows = (c.pricing || [])
    .map((it, i) => `
      <h3>Plan ${i + 1}</h3>
      ${field(`c-price-${i}-tag`, "Tag", it.tag || "")}
      ${field(`c-price-${i}-title`, "Title", it.title || "")}
      ${field(`c-price-${i}-body`, "Description", it.body || "", { textarea: true })}
      ${field(`c-price-${i}-points`, "Points (comma-separated)", (it.points || []).join(", "), { hint: "e.g. Ensuite comfort, TV and Wi-Fi, Pool and lounge access" })}`)
    .join("");

  const footerRows = [
    field("c-footer-tagline", "Footer tagline", c.footer?.tagline || ""),
    field("c-footer-copyright", "Footer copyright line", c.footer?.copyright || ""),
  ].join("");

  box.innerHTML = `
    <h3>Contact details</h3>
    <div class="field-row">${contactRows}</div>
    <h3>Homepage hero</h3>
    ${heroRows}
    <h3>Stay With Us — room cards</h3>
    <div class="field-row">${roomsRows}</div>
    <h3>Amenities — shared spaces</h3>
    <div class="field-row">${amenRows}</div>
    <h3>Plan Your Stay — plans</h3>
    <div class="field-row">${pricingRows}</div>
    <h3>Footer</h3>
    ${footerRows}`;

  $("#save-content")?.addEventListener("click", async () => {
    const read = (id: string) => ($(`#${id}`) as HTMLInputElement)?.value.trim() ?? "";
    const readArea = (id: string) => ($(`#${id}`) as HTMLTextAreaElement)?.value.trim() ?? "";

    const phone = read("c-phone");
    const email = read("c-email");
    const waPrimary = read("c-wa-primary").replace(/[^\d]/g, "");
    const contact: ContactFields = {
      phone,
      phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "",
      email,
      emailHref: email ? `mailto:${email}` : "",
      waPrimary: waPrimary || c.contact?.waPrimary || "",
      waSecondary: read("c-wa-secondary").replace(/[^\d]/g, ""),
      airbnb: read("c-airbnb"),
      tiktok: read("c-tiktok"),
      facebook: read("c-facebook"),
    };
    const hero = {
      headline: readArea("c-hero-headline") || c.hero?.headline || "",
      lead: readArea("c-hero-lead") || c.hero?.lead || "",
      note: read("c-hero-note") || c.hero?.note || "",
    };
    const rooms = (c.rooms || []).map((it, i) => ({
      tag: read(`c-room-${i}-tag`) || it.tag,
      title: read(`c-room-${i}-title`) || it.title,
      body: readArea(`c-room-${i}-body`) || it.body,
    }));
    const amenities = (c.amenities || []).map((it, i) => ({
      tag: read(`c-amen-${i}-tag`) || it.tag,
      title: read(`c-amen-${i}-title`) || it.title,
      body: readArea(`c-amen-${i}-body`) || it.body,
    }));
    const pricing = (c.pricing || []).map((it, i) => ({
      tag: read(`c-price-${i}-tag`) || it.tag,
      title: read(`c-price-${i}-title`) || it.title,
      body: readArea(`c-price-${i}-body`) || it.body,
      points: read(`c-price-${i}-points`) ? read(`c-price-${i}-points`).split(",").map((p) => p.trim()).filter(Boolean) : it.points || [],
    }));
    const footer = {
      tagline: read("c-footer-tagline") || c.footer?.tagline || "",
      copyright: read("c-footer-copyright") || c.footer?.copyright || "",
    };

    content = { ...content!, contact, hero, rooms, amenities, pricing, footer, flyers: c.flyers || [] };
    const ok = await putContent(content);
    const status = $("#content-status");
    if (status) {
      status.textContent = ok ? "Saved — the site now shows your changes." : "Save failed. Please try again.";
    }
    renderLastSaved();
  });
}

// ────────────────────────────────────────────────────────────
// Broadcast
// ────────────────────────────────────────────────────────────
function renderBroadcast(): void {
  const box = $("#broadcast-form");
  if (!box || !content) return;
  const flyers = content.flyers || [];
  const options =
    flyers.length > 0
      ? `<option value="">— Choose a flyer to start from —</option>` +
        flyers.map((f) => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.title)}</option>`).join("")
      : `<option value="">No flyers yet — write a message below</option>`;
  box.innerHTML = `
    <div class="field">
      <label for="b-flyer">Start from a flyer</label>
      <select id="b-flyer">${options}</select>
    </div>
    <div class="field">
      <label for="b-text">Message</label>
      <textarea id="b-text" style="min-height:140px" placeholder="Hello! We have a special offer for you…"></textarea>
    </div>
    <div style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap">
      <button type="button" class="btn btn-gold" id="b-open">Open in WhatsApp</button>
      <button type="button" class="btn btn-ghost" id="b-fill">Fill from selected flyer</button>
      <p class="hint" style="margin:0">Opens WhatsApp with the message ready to send to your guests.</p>
    </div>`;

  const fillFromFlyer = (id: string) => {
    const f = flyers.find((x) => x.id === id);
    if (!f) return;
    const text = [
      f.label ? `${f.label} — ${f.title}` : f.title,
      f.description,
      f.validUntil ? `Valid until ${f.validUntil}` : "",
      f.linkUrl ? `More info: ${f.linkUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    ($("#b-text") as HTMLTextAreaElement).value = text;
  };

  $("#b-flyer")?.addEventListener("change", (e) => {
    const v = (e.target as HTMLSelectElement).value;
    if (v) fillFromFlyer(v);
  });
  $("#b-fill")?.addEventListener("click", () => {
    const v = ($("#b-flyer") as HTMLSelectElement).value;
    if (v) fillFromFlyer(v);
  });
  $("#b-open")?.addEventListener("click", () => {
    const text = ($("#b-text") as HTMLTextAreaElement).value.trim();
    const wa = content?.contact?.waPrimary || "233535572774";
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
  });
}

// ────────────────────────────────────────────────────────────
init();
wireShell();