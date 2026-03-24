# SEO Guide

This guide covers how to set up SEO for a static blog using Google Search Console and Bing Webmaster Tools.

## Overview

Two major search engine webmaster tools:

- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster Tools**: https://www.bing.com/webmaster

## Verification

### Google Search Console

1. Log in to [Google Search Console](https://search.google.com/search-console)
2. Add your domain property
3. Verify ownership via HTML meta tag (add to your site's `<head>`):
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```

### Bing Webmaster Tools

1. Log in to [Bing Webmaster Tools](https://www.bing.com/webmaster)
2. Add your domain
3. Verify via HTML tag or IndexNow key file

## Sitemap

Astro with `@astrojs/sitemap` automatically generates sitemaps during build:

- `sitemap-index.xml` - Sitemap index
- `sitemap-0.xml` - First sitemap file (can be split)
- `sitemap.xml` - Copy of index (for compatibility)

Declare in `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://your-domain.com/sitemap.xml
```

## IndexNow (Bing)

[IndexNow](https://www.indexnow.org/) lets you instantly notify Bing when content changes.

### Setup

1. Get your IndexNow key from Bing Webmaster Tools
2. Add to Cloudflare Pages environment variables:
   - `INDEXNOW_KEY` = your key
   - `INDEXNOW_HOST` = your domain

### Implementation Example

Create a script (`scripts/indexnow.mjs`) that:
1. Reads URLs from your sitemap
2. Sends POST request to Bing IndexNow endpoint

```javascript
// Simplified example
const payload = {
  host: 'your-domain.com',
  key: 'your-key',
  urlList: ['https://your-domain.com/page1/', 'https://your-domain.com/page2/']
};

await fetch('https://www.bing.com/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

### Auto-notify on Deploy

In Cloudflare Pages build settings:
```
Build command: npm run build && npm run indexnow:sitemap
```

## SEO Best Practices

### Meta Tags

Each page should have:
- Unique `<title>` (50-60 characters)
- Unique `<meta name="description">` (150-160 characters)
- `<link rel="canonical">` to prevent duplicate content

### Robots.txt

```txt
User-agent: *
Allow: /
Sitemap: https://your-domain.com/sitemap.xml
```

### Additional Tips

- Use semantic HTML elements
- Ensure fast loading times
- Make site mobile-friendly
- Use descriptive URLs

## Troubleshooting

### GSC Issues

- **Redirect errors**: Use server-side redirects (Cloudflare) instead of client-side JS
- **Not indexed**: Wait for crawl or use URL inspection tool to request indexing

### Bing Issues

- **InvalidRequestParameters**: Ensure sitemap URLs match your verified domain
- **IndexNow errors**: Verify key and host environment variables are set correctly

## Resources

- [Google Search Console Help](https://support.google.com/websearch)
- [Bing Webmaster Tools Help](https://www.bing.com/webmaster/help)
- [IndexNow Documentation](https://www.indexnow.org/)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
