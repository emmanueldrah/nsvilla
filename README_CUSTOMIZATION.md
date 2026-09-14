# NS LUXURY VILLA — Admin Portal & CMS

The site ships with a built-in admin portal at **`/admin`** so the villa owner can update content and post promotions without touching code.

## How it works

| Layer | Tech |
| --- | --- |
| Front end | `admin.html` + `src/admin.ts` + `src/admin.css` (Vite build) |
| API | Vercel serverless functions in `api/*.mjs` (Upstash KV REST) |
| Live site updates | `src/content.ts` fetches `/api/content` and applies overrides + banner/flyers |
| Image uploads | `@vercel/blob` on Vercel; local `data/uploads/` in development |
| Auth | Single admin password → HttpOnly session cookie (7-day) |

## What the admin can do

1. **Flyers & Promos** — create promotions with a title, label (e.g. `PROMO`, `EVENT`), description, optional image, optional WhatsApp link, and validity window. A flyer can be shown as a **site-wide banner** and appears in the **Promotions** section on the homepage. Toggle active/inactive or delete anytime.
2. **Site content** — edit every editable string live: contact (phone, WhatsApp, email), hero, the 3 room cards, the 3 amenities, the 3 pricing cards, and the footer tagline/copyright. Changes apply instantly to the public site.
3. **WhatsApp broadcast** — compose a message and open it in WhatsApp with a pre-filled draft for one-tap sending.

## Environment variables

| Variable | Required | Where |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes | set a strong password |
| `KV_REST_API_URL` | Yes (Vercel) | auto-filled when you attach a Vercel KV store |
| `KV_REST_API_TOKEN` | Yes (Vercel) | auto-filled with the store |
| `BLOB_READ_WRITE_TOKEN` | No | only needed for flyer image uploads (`@vercel/blob`) |

Content is stored in Vercel KV under the key `nsvilla:content`. If the API is unreachable (e.g. KV not configured yet), the public site gracefully falls back to the static content — nothing breaks.

## Local development

```bash
npm install
npm run build      # builds the site + admin into dist/
ADMIN_PASSWORD=nsadmin npm start   # serves dist + the same API locally on http://localhost:4198
```

Open `http://localhost:4198/` (site) and `http://localhost:4198/admin` (admin, password `nsadmin`).

Local runs use file storage (`data/store.json`) and save uploaded images to `data/uploads/` — delete the `data/` folder to reset. `data/` is gitignored.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel (framework: Vite).
2. Add the **KV** integration (creates `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
3. Set `ADMIN_PASSWORD`.
4. Add a Blob store (optional) to enable image uploads → sets `BLOB_READ_WRITE_TOKEN`.
5. Deploy. `vercel.json` already rewrites `/admin` and serves clean URLs.

## API surface

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /api/login` | — | password → session cookie |
| `POST /api/logout` | — | clears session |
| `GET /api/session` | — | session status |
| `GET /api/content` | public | current content (used by the site) |
| `PUT /api/content` | admin | save content + flyers |
| `POST /api/flyer-image` | admin | base64 upload → Blob / local `/uploads/` |