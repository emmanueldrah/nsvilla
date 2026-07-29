# NS Luxury Villa — Customization & Design Architecture

This guide explains the design rationale and provides detailed instructions for a non-developer or host to customize the contents of the website (images, contact details, prices, maps).

---

## 1. Design Decisions (Crafted for Slow Luxury)

To avoid the sterile, "AI-polished" aesthetic common in modern luxury templates, the design strictly follows these human-centric guidelines:

*   **Asymmetrical Visual Rhythm:** Avoids rigid grids or symmetrical card structures. Columns on the Overview, Gallery, and Amenities page feature irregular offsets, varied aspect ratios (portrait, square, landscape), and generous breathing room. This mimics a highly curated print editorial or physical magazine.
*   **Warm, West African-Influenced Color Palette:** Instead of standard "hotel gold & forest green," we utilize rich, textured, unpolished earth tones:
    *   `#080C0A` — Deep, inky charcoal-obsidian (background)
    *   `#D4AF37` — Authentic deep metallic gold luster (subtle keylines, highlights)
    *   `#FAF9F5` — Soft, unbleached limestone cream (fine text, primary elements)
    *   `#111D15` — Rich woodland forest olive (background accents, containers)
    *   `#D2C9B9` — Warm weathered-sand khaki (secondary body copy)
*   **Honest Editorial Copywriting:** Absolute ban on clichés like *"ultimate luxury experience," "indulge in paradise," or "escape to heaven."* The text speaks as a confident, calm, and grounded host welcoming visitors to the real town of Ho beneath the Mount Adaklu range.
*   **Tactile Interactions:**
    *   **The Hourglass of Serenity:** A custom sliding timeline showcasing how the pool, rooftop bar, and workspace transition from morning dawn to deep night.
    *   **2D Blueprint Spec Inspector:** An SVG architectural rendering that allows users to click/hover on specific suites and pool sectors to instantly view exact dimensions and utility limits.
    *   **Starlink Constellation Canvas:** A gorgeous interactive HTML5 canvas mapping satellite orbits. It warps dynamic magnetic connections near the user's cursor to celebrate our 350 Mbps broadband latency.
    *   **Serenity Audio Experience:** A custom browser synthesized ambient rain and breeze physical player. It uses pure `AudioContext` buffers to create organic local soundscapes (Volta Rain and Forest Drone) rather than streaming heavy audio artifacts.

---

## 2. Code Customization Guide

All shared elements (headers, footers, logo SVGs, and interactive cursor/audio behaviors) are centralized in `src/components.ts` and `src/main.ts`.

### 2.1 Contact Details & WhatsApp Links
*   **WhatsApp Direct API Senders:** Open `src/components.ts` and replace `+233550000000` or `233550000000` with your verified business line.
*   **Form Redirection:** Inside `src/main.ts`, the direct calculator maps your inputs to a WhatsApp dispatch link:
    ```typescript
    window.open(`https://wa.me/233550000000?text=${encoded}`, '_blank');
    ```
    Change the phone prefix to match your target host number.
*   **Phone and Email:** Locate the Geospatial block inside the footer in `src/components.ts`:
    ```html
    <a href="tel:+233550000000" ...>📞 +233 55 000 0000</a>
    <a href="mailto:stay@nsluxuryvilla.com" ...>✉ stay@nsluxuryvilla.com</a>
    ```

### 2.2 Prices & Surcharges
*   To adjust the pricing models, update the pricing attributes inside `contact.html` and the corresponding calculations in `src/main.ts`.
*   Inside `contact.html`:
    ```html
    <option value="sanctuary" data-price="250">The Sanctuary Suite... - $250/night</option>
    <option value="canopy" data-price="220">The Canopy Vista... - $220/night</option>
    <option value="entire" data-price="450">Entire Gated Villa... - $450/night</option>
    ```
*   Inside `src/main.ts` under `initStayPlanner()`:
    *   **Tourism Development Levy (1.5%):** Adjust `const levy = baseCost * 0.015;`
    *   **Eco Tax Surcharge ($5):** Adjust `const ecoTax = 5.00;`
    *   **Multi-night privilege discount (5% off 4+ nights):** Adjust `const discount = baseCost * 0.05;` inside `nights >= 4`.

### 2.3 Image Placeholder Replacements
All imagery utilizes curated high-resolution photography links from Unsplash. To substitute your real physical photography:
1. Copy your media assets into a `/public/images/` or `/assets/` directory.
2. In `index.html`, `rooms.html`, `amenities.html`, and `gallery.html`, swap the `src` paths of the `<img>` tags (and the `data-img-src` tags in `gallery.html`) with your local file paths.
3. Keep the surrounding `.img-zoom-container` wrapper to maintain the smooth slow-motion hover zoom effects.

### 2.4 Google Maps Integration
To update the visual layout to focus on your specific gated coordinates:
1. Go to Google Maps, locate your exact coordinates in Ho, click **Share**, and select **Embed map** to copy the source `iframe` link.
2. In `contact.html`, swap the `src` link inside the `<iframe>` tag.
3. Keep the premium inline filter style `style="border:0; filter: grayscale(1) contrast(1.15) invert(0.92);"` to preserve our custom bespoke charcoal-minimal mapping visual.
