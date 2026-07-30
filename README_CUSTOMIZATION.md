# NS Luxury Villa — Customization & Design Architecture

This guide outlines exactly how a non-developer or the property owner can complete, launch, and customize the website.

---

## 📋 LAUNCH CHECKLIST (WHAT THE OWNER MUST PROVIDE)

Before launching the website, the owner must fill in the remaining real-world details. Search for `TODO` comments or placeholders in the source code files, and replace them with the details below:

1.  **WhatsApp Phone Number**
    *   Currently set to the placeholder `233XXXXXXXXX`.
    *   **Action:** Update the link prefix in `src/components.ts` and `src/main.ts` to your actual business WhatsApp number (e.g., `233550000000`).
2.  **Contact Block Details**
    *   Currently set to placeholders (`[Your number]`, `stay@yourvilla.com`).
    *   **Action:** Replace these in the footer block of `src/components.ts` with your real mobile contact and booking email.
3.  **Suite Capacities**
    *   Currently set to `[Confirm capacity with owner]`.
    *   **Action:** In `rooms.html`, edit the capacity numbers for both the **Ground Floor Suite** and **Upper Floor Suite** once confirmed.
4.  **Google Maps Live Pin**
    *   Currently embedded with a generalized map pin.
    *   **Action:** In `contact.html`, find `<!-- Replace with real Google Maps embed or pin -->` and swap the `<iframe>` URL with your exact custom-gated coordinate embed from Google Maps.
5.  **Real Property Photographs**
    *   Currently populated with carefully selected high-resolution Unsplash placeholders.
    *   **Action:** Copy your physical photography into a `/public/images/` or `/assets/` directory and replace the `<img>` tags in `index.html`, `rooms.html`, `amenities.html`, and `gallery.html`.
6.  **Trust & Social Channels (Optional)**
    *   Includes optional discreet placeholders for **Airbnb listing URL** and **TikTok handles** (`@ns.luxury.villa`).
    *   **Action:** Replace the placeholders in the footer of `src/components.ts` or remove them if not needed.

---

## 1. Design Decisions (Crafted for Slow Luxury)

To avoid the sterile, "AI-polished" template aesthetic, the design of this website is built upon these principles of human-centric restraint:

*   **Asymmetrical Visual Rhythm:** Avoids rigid grids or symmetrical card structures. Columns on the Overview, Gallery, and Amenities pages feature irregular offsets, varied aspect ratios (portrait, square, landscape), and generous breathing room. This mimics a highly curated print editorial.
*   **Warm, West African-Influenced Color Palette:** Instead of standard "hotel gold & forest green," we utilize rich, textured, unpolished earth tones:
    *   `#080C0A` — Deep, inky charcoal-obsidian (background)
    *   `#D4AF37` — Authentic metallic gold luster (subtle keylines, highlights)
    *   `#FAF9F5` — Soft, unbleached limestone cream (fine text, primary elements)
    *   `#111D15` — Rich woodland forest olive (background accents, containers)
    *   `#D2C9B9` — Warm weathered-sand khaki (secondary body copy)
*   **Honest Editorial Copywriting:** Absolute ban on clichés like *"the ultimate luxury experience," "indulge in paradise," or "escape to heaven."* The text speaks as a confident, calm, and grounded host welcoming visitors to the real town of Ho beneath the Mount Adaklu range. No synthetic marketing hype or abstract over-polished prose.
*   **Grounded Features:** We focus on real features and practical details of our boutique space in Ho: the private swimming pool (with swimming lessons available), the indoor bar & lounge, open rooftop space, high-speed Starlink internet, and 24/7 security with reliable backup utilities (power and water).

---

## 2. Code Customization Guide

All shared elements (headers, footers, logo SVGs, and main interactions) are centralized in `src/components.ts` and `src/main.ts`.

### 2.1 Contact Details & WhatsApp Links
*   **WhatsApp Direct API Senders:** Open `src/components.ts` and replace `233XXXXXXXXX` with your verified business line.
*   **Form Redirection:** Inside `src/main.ts`, the Inquiry Form maps your inputs to a direct, human-style WhatsApp dispatch link:
    ```typescript
    window.open(`https://wa.me/233XXXXXXXXX?text=${encoded}`, '_blank');
    ```
    Change the phone prefix to match your target host number.
*   **Phone and Email:** Locate the contact blocks inside the footer in `src/components.ts`:
    ```html
    <a href="tel:+233XXXXXXXXX" ...>📞 Phone: [Your number]</a>
    <a href="mailto:stay@yourvilla.com" ...>✉ stay@yourvilla.com</a>
    ```

### 2.2 Booking Form Selections
*   To adjust the planning preferences, edit the select option values inside `contact.html` and the corresponding parsing script in `src/main.ts` under `initStayInquiryForm()`.
*   Inside `contact.html`:
    ```html
    <option value="ground_suite">Private Stay: Ground Floor Suite</option>
    <option value="upper_suite">Private Stay: Upper Floor Suite</option>
    <option value="entire_villa">Private Stay: Entire Gated Villa Compound</option>
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
