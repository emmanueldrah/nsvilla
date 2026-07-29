# NS Luxury Villa — Customization & Design Architecture

This guide explains the design rationale and provides detailed instructions for a non-developer or host to customize the contents of the website (images, contact details, coordinates).

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
*   **Honest Editorial Copywriting:** Absolute ban on clichés like *"the ultimate luxury experience," "indulge in paradise," or "escape to heaven."* The text speaks as a confident, calm, and grounded host welcoming visitors to the real town of Ho beneath the Mount Adaklu range. No synthetic marketing hype or abstract over-polished prose.
*   **Grounded Features:** We focus on real features and practical details of our boutique space in Ho: the private swimming pool (with swimming lessons available), the indoor bar & lounge, open rooftop space, Starlink internet (350+ Mbps with backup power), and 24/7 security.

---

## 2. Code Customization Guide

All shared elements (headers, footers, logo SVGs, and main interactions) are centralized in `src/components.ts` and `src/main.ts`.

### 2.1 Contact Details & WhatsApp Links
*   **WhatsApp Direct API Senders:** Open `src/components.ts` and replace `+233550000000` or `233550000000` with your verified business line.
*   **Form Redirection:** Inside `src/main.ts`, the Inquiry Form maps your inputs to a direct, human-style WhatsApp dispatch link:
    ```typescript
    window.open(`https://wa.me/233550000000?text=${encoded}`, '_blank');
    ```
    Change the phone prefix to match your target host number.
*   **Phone and Email:** Locate the contact blocks inside the footer in `src/components.ts`:
    ```html
    <a href="tel:+233550000000" ...>📞 +233 55 000 0000</a>
    <a href="mailto:stay@nsluxuryvilla.com" ...>✉ stay@nsluxuryvilla.com</a>
    ```

### 2.2 Booking Form Selections
*   To adjust the planning preferences, edit the select option values inside `contact.html` and the corresponding parsing script in `src/main.ts` under `initStayPlanner()`.
*   Inside `contact.html`:
    ```html
    <option value="Event: Wedding / Union Ceremonies">Event: Wedding / Union Ceremonies</option>
    <option value="Event: Birthday / Celebration">Event: Birthday / Celebration</option>
    <option value="Event: Corporate Team Building">Event: Corporate Team Building</option>
    <option value="Short Stay: The Sanctuary Suite">Short Stay: The Sanctuary Suite</option>
    <option value="Short Stay: The Canopy Vista">Short Stay: The Canopy Vista</option>
    <option value="Short Stay: Entire Gated Villa">Short Stay: Entire Gated Villa</option>
    ```

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
