# Phone-only deployment (no dev server)

## Important limitation
A PWA **cannot** be installed or run offline from a `file://` URL on Android.
Service workers (offline caching) only work on **HTTPS** (or `http://localhost`).
So you need to host the built `dist/` folder somewhere once (free), then you can install it and use it offline.

## Build
Run this once in any Node environment:
- `npm install`
- `npm run build`

Output: `dist/`

## Host the `dist/` folder (free options)

### Option A — Netlify Drop (fastest)
1. Build to get `dist/`
2. Zip `dist/` (or drag the folder)
3. On your phone, open Netlify Drop and upload the folder/zip
4. Open the generated HTTPS URL

### Option B — GitHub Pages
1. Create a GitHub repo
2. Upload the contents of `dist/` to the repo (root)
3. In repo Settings → Pages → Deploy from branch
4. Open the Pages URL (HTTPS)

### Option C — Cloudflare Pages
1. Create a Pages project
2. Upload `dist/` as the site
3. Open the HTTPS URL

## Install as an app
Open the HTTPS site in Chrome →
⋮ menu → **Add to Home screen** → Install.

## Offline model download
In the app:
Settings → Inference Provider → **Offline (WebLLM)** →
Pick a model → **Download/Load** (do this while online once).

After the download completes, you can use it offline.