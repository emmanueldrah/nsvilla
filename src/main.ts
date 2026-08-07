// ════════════════════════════════════════════════════════════
// NS LUXURY VILLA - Interactive Features
// ════════════════════════════════════════════════════════════

import { inject } from "@vercel/analytics";

const PRIMARY_WHATSAPP = "233535572774";

// Content remains visible by default; this class only enables optional motion.
document.documentElement.classList.add("js");
inject();

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  normalizeInternalLinks();
  syncSiteNavigation();
  applyArtDirection();
  initNavigation();
  initScrollReveals();
  initSmoothScroll();
  initFormHandlers();
  initFloatingWhatsApp();
  initVillaArchive();
  initImageViewer();
});

function normalizeInternalLinks(): void {
  const routes: Record<string, string> = {
    "./": "./index.html",
    "./index": "./index.html",
    "./rooms": "./rooms.html",
    "./amenities": "./amenities.html",
    "./gallery": "./gallery.html",
    "./pricing": "./pricing.html",
    "./contact": "./contact.html",
  };
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const replacement = routes[link.getAttribute("href") || ""];
    if (replacement) link.href = replacement;
  });
}

function syncSiteNavigation(): void {
  const pages = [
    { href: "./index.html", label: "Home", file: "index.html" },
    { href: "./rooms.html", label: "Stay With Us", file: "rooms.html" },
    { href: "./amenities.html", label: "Amenities", file: "amenities.html" },
    { href: "./gallery.html", label: "Gallery", file: "gallery.html" },
    { href: "./pricing.html", label: "Plan Your Stay", file: "pricing.html" },
    { href: "./contact.html", label: "Contact", file: "contact.html" },
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll<HTMLElement>(".family-menu").forEach((menu) => {
    menu.innerHTML = pages
      .map(
        (page) =>
          `<a href="${page.href}" class="${page.file === current ? "active" : ""}">${page.label}</a>`,
      )
      .join("");
  });
  document.querySelectorAll<HTMLElement>(".family-footer").forEach((footer) => {
    const explore = footer.querySelector(
      ".family-footer-grid > div:nth-child(2)",
    );
    if (explore)
      explore.innerHTML = `<p class="family-footer-title">Explore</p>${pages.map((page) => `<a href="${page.href}">${page.label}</a>`).join("")}`;
  });
}

function applyArtDirection(): void {
  const page = location.pathname.split("/").pop() || "index.html";
  if (page === "amenities.html") {
    const hero = document.querySelector<HTMLImageElement>(
      ".family-page-hero > img",
    );
    if (hero) {
      hero.src = "./images/nice%20pool.jpeg";
      hero.alt =
        "Swimming pool beneath the signature umbrella canopy at NS LUXURY VILLA";
    }
  }
  if (page === "pricing.html") {
    const closingImage =
      document.querySelector<HTMLImageElement>(".family-cta > img");
    if (closingImage) {
      closingImage.src = "./images/soft%20bed.jpeg";
      closingImage.alt = "Prepared guest bedroom at NS LUXURY VILLA";
    }
  }
  if (page === "contact.html") {
    const hero = document.querySelector<HTMLImageElement>(
      ".family-page-hero > img",
    );
    if (hero) {
      hero.src = "./images/frontview%20of%20the%20block%20B.jpeg";
      hero.alt = "NS LUXURY VILLA apartment building";
    }
  }
  if (page === "gallery.html") {
    const featured =
      document.querySelectorAll<HTMLImageElement>(".family-mosaic img");
    const images: Array<[string, string]> = [
      [
        "./images/nice%20pool.jpeg",
        "Swimming pool beneath the signature umbrella canopy",
      ],
      [
        "./images/nice%20paintings.jpeg",
        "Hand-painted mural along the villa walkway",
      ],
      ["./images/front.jpeg", "NS LUXURY VILLA entrance and courtyard"],
      ["./images/ns%20bar.jpeg", "Restaurant and bar interior"],
    ];
    featured.forEach((image, index) => {
      const chosen = images[index];
      if (chosen) {
        image.src = chosen[0];
        image.alt = chosen[1];
      }
    });
    const film = document.querySelector<HTMLVideoElement>(".family-video");
    if (film) film.poster = "./images/nice%20pool.jpeg";
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
// Form Submission Handler
// ════════════════════════════════════════════════════════════
function initFormHandlers(): void {
  const form = document.getElementById("booking-form") as HTMLFormElement;
  if (!form) return;

  const today = new Date().toISOString().split("T")[0];
  const checkinField = form.querySelector(
    "#checkin",
  ) as HTMLInputElement | null;
  const checkoutField = form.querySelector(
    "#checkout",
  ) as HTMLInputElement | null;
  if (checkinField) checkinField.min = today;
  if (checkoutField) checkoutField.min = today;
  checkinField?.addEventListener("change", () => {
    if (checkoutField && checkinField.value)
      checkoutField.min = checkinField.value;
  });

  form.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

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

    // Collect form data
    const name = (form.querySelector("#name") as HTMLInputElement)?.value || "";
    const email =
      (form.querySelector("#email") as HTMLInputElement)?.value || "";
    const suite =
      (form.querySelector("#suite") as HTMLSelectElement)?.value || "";
    const checkin =
      (form.querySelector("#checkin") as HTMLInputElement)?.value || "";
    const checkout =
      (form.querySelector("#checkout") as HTMLInputElement)?.value || "";
    const guests =
      (form.querySelector("#guests") as HTMLInputElement)?.value || "1";
    const message =
      (form.querySelector("#message") as HTMLTextAreaElement)?.value || "";

    // Build WhatsApp message
    const whatsappMessage = `
*Booking Inquiry - NS LUXURY VILLA*

*Guest Information:*
Name: ${name}
Email: ${email}

*Booking Details:*
Suite: ${suite}
Check-in: ${checkin}
Check-out: ${checkout}
Number of Guests: ${guests}

*Additional Message:*
${message || "No additional message"}

---
Sent from NS LUXURY VILLA Booking Form
    `.trim();

    // Open WhatsApp with pre-filled message
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${PRIMARY_WHATSAPP}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    const confirmation =
      document.getElementById("booking-confirmation") ||
      document.getElementById("form-message");
    if (confirmation) confirmation.hidden = false;
  });
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
    btn.href = `https://wa.me/${PRIMARY_WHATSAPP}`;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className =
      "fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50";
    btn.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.709.894 5.223 2.53 7.265L2.677 22l7.8-2.464a9.859 9.859 0 004.59 1.168h.007c5.427 0 9.851-4.424 9.851-9.851 0-2.632-.994-5.107-2.801-6.975-1.807-1.868-4.281-2.897-6.879-2.897"/>
      </svg>
    `;
    document.body.appendChild(btn);
  }
}

function initVillaArchive(): void {
  const archive = document.querySelector<HTMLElement>("[data-villa-archive]");
  if (!archive) return;
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
    "front.jpeg",
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
    "outside painting.jpeg",
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
    "pool.jpeg",
    "poole.jpeg",
    "pooll.jpeg",
    "pools (2).jpeg",
    "pools.jpeg",
    "poolsi.jpeg",
    "poolside (2).jpeg",
    "poolside.jpeg",
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
    "poolside.jpeg": "Poolside lounge framed by tropical planting",
    "poolw.jpeg": "Garden-framed view of the covered pool",
    "pool and bar.jpeg": "Poolside restaurant and bar terrace",
    "garden.jpeg": "Quiet lawn and garden space",
    "ns bar.jpeg": "Restaurant and bar interior",
    "rooftop bar.jpeg": "Open-air rooftop lounge",
    "front.jpeg": "NS LUXURY VILLA entrance and courtyard",
    "nice paintings.jpeg": "Hand-painted mural along the villa walkway",
    "outside painting.jpeg": "Colourful exterior mural",
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
      return `<figure class="villa-archive-item" data-category="${category(asset)}"><img src="./images/${encodeURIComponent(asset)}" alt="${caption}" loading="lazy" decoding="async"><figcaption>${String(index + 1).padStart(2, "0")} · ${caption}</figcaption></figure>`;
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
}

function initImageViewer(): void {
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>("main img"),
  );
  if (!images.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "image-viewer";
  dialog.innerHTML =
    '<button type="button" class="image-viewer-close" aria-label="Close image viewer">×</button><figure><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(dialog);
  const viewerImage = dialog.querySelector("img")!;
  const viewerCaption = dialog.querySelector("figcaption")!;
  const close = () => dialog.close();

  images.forEach((image) => {
    image.classList.add("image-viewer-trigger");
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `View larger: ${image.alt || "image"}`);
    const open = () => {
      viewerImage.src = image.currentSrc || image.src;
      viewerImage.alt = image.alt;
      viewerCaption.textContent = image.alt;
      dialog.showModal();
    };
    image.addEventListener("click", open);
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
  dialog.querySelector(".image-viewer-close")?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
}

export {
  normalizeInternalLinks,
  initScrollReveals,
  initSmoothScroll,
  initFormHandlers,
  initFloatingWhatsApp,
  initVillaArchive,
  initImageViewer,
  syncSiteNavigation,
  applyArtDirection,
};
