# SEO Verification Checklist

## Local (Windows CMD)

1. Start dev server:
   - `npm run dev`
2. Open:
   - `http://localhost:4321/robots.txt`
3. Note:
   - Sitemap files are generated on build, so dev mode may not expose `sitemap*.xml`.

## Build Output

1. Run:
   - `npm run build`
2. Confirm files exist in `dist/`:
   - `robots.txt`
   - `sitemap-index.xml`
   - `sitemap-0.xml` (or equivalent split sitemap file)
   - `sitemap.xml` (copied from `sitemap-index.xml` by postbuild step)

## Production (Cloudflare Pages)

Use Windows CMD:

- `curl -I https://danarnoux.com/sitemap-index.xml`
- `curl -I https://danarnoux.com/sitemap-0.xml`
- `curl -I https://danarnoux.com/sitemap.xml`

Expected:
- `HTTP 200`
- `Content-Type: application/xml` (or `text/xml`)

Web Analytics check:

1. Open any production page on `https://danarnoux.com/`.
2. DevTools -> Network, filter `beacon` or `rum`.
3. Verify:
   - `beacon.min.js` loads successfully.
   - Request to `cloudflareinsights.com/cdn-cgi/rum` succeeds (200/204).
