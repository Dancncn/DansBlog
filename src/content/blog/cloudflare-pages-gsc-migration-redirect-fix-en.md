---
title: "Cloudflare Pages Redirects Working but GSC Not Recognizing? Migration Fix & Bulk Redirects Solution"
description: "A detailed analysis of why Google Search Console fails to recognize 301 redirects when migrating from *.pages.dev to a custom domain on Cloudflare Pages, with a reliable solution using Bulk Redirects."
pubDate: 2026-03-20
updatedDate: 2026-03-20
lang: "en"
author: "Dan"
group: "cloudflare-pages-gsc-migration-redirect-fix"
tags: ["Cloudflare", "SEO", "GSC","guide", "EN"]
---

## Introduction

When I migrated my site to a new domain using GSC, I ran into a frustrating issue. I had already set up 301 redirects, but GSC just wouldn't recognize them. I kept seeing the old pages.dev domain still stealing my traffic. Then I found a solution from a blog called Codemzy—and it actually worked.

## Background

When moving a site from `*.pages.dev` to a custom domain, passing SEO ranking is the key concern. According to the official docs, the ideal approach is using 301 permanent redirects, so Google knows the original URL has permanently moved to the new address and passes the ranking authority over.

Here's the scenario:
- Source: `https://dansblog.pages.dev`
- Target: `https://danarnoux.com`
- Expected: Both browser and search engines receive 301 status code

## The Problem

After configuring redirects, testing revealed:

1. **Browser works fine** - Visiting `dansblog.pages.dev/any-path` automatically redirects to `danarnoux.com/any-path`, seamless for users
2. **GSC error** - Google Search Console reports many URLs returning non-301 status codes, migration verification fails
3. **cURL test oddities** - Some tools detect status codes that don't match expectations

Very strange: user access works perfectly, but Google just won't acknowledge it.

## Failed Solutions

### Solution 1: _redirects File

Tried configuring in `public/_redirects`:

```
https://dansblog.pages.dev/* https://danarnoux.com/:splat 301
```

**Result**: Browser redirect works, but GSC still doesn't recognize it.

**Root cause analysis** (inference based on Cloudflare official documentation):

---

#### 1.1 Official Documentation References

**Bulk Redirects Docs**:
https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/

> "Bulk Redirects allow you to define URL redirects at the account level and have them executed at the edge."

**Redirect Rules Docs**:
https://developers.cloudflare.com/rules/url-forwarding/

**Pages _redirects Docs**:
https://developers.cloudflare.com/pages/platform/redirects/

> "You can define redirects by adding a `_redirects` file to your project."

**How Pages Works**:
https://developers.cloudflare.com/pages/platform/how-pages-works/

> "Cloudflare Pages serves your site through Cloudflare's global network."

---

#### 1.2 Technical Interpretation

According to the documentation, the two redirect mechanisms are fundamentally different:

| Mechanism | Processing Level | Execution Location |
|-----------|-----------------|-------------------|
| **Pages _redirects** | Project-level (injected at build) | Pages Platform |
| **Bulk Redirects** | Account-level | Edge Network |

- `_redirects` is part of your project, defined via `public/_redirects` file, processed by the Pages platform at build time
- Bulk Redirects are a separate Rules system, executed at edge nodes globally, with higher priority than Pages-level config

---

#### 1.3 Inference

Based on Cloudflare's official documentation, we can confirm:

- `_redirects` belongs to Pages project-level redirect configuration
- Bulk Redirects belong to the Rules system, executed directly on Cloudflare's Edge network

With that context, here's a somewhat conservative inference:

> GSC, when performing site migration detection, may more readily recognize 301 redirects returned directly from the Edge layer. For redirects implemented at the Pages layer, it may not consistently recognize them.

Important to note:

- Neither Cloudflare nor Google has explicitly explained GSC's judgment logic
- The above conclusions are based solely on documentation structure and actual test results

👉 In practice, Bulk Redirects can reliably pass GSC migration verification.

### Solution 2: Worker Approach

Tried writing a Cloudflare Worker to handle redirects.

**Result**: Works, but has instability risks—Workers can fail due to limits, config changes, or other issues.

## The Fix: Bulk Redirects

The final solution uses **Cloudflare Bulk Redirects**.

Important: Bulk Redirects has a **two-step structure**:

1. First create a Redirect List (rule data)
2. Then create a Redirect Rule (activates the rules)

---

### Step 1: Access Bulk Redirects

Go to Cloudflare Dashboard:

- Select your domain (e.g., `danarnoux.com`)
- On the left sidebar: **Rules → Redirect Rules**
- Switch to **Bulk Redirects** tab

---

### Step 2: Create Bulk Redirect List (Do This First)

Click:

> Create Bulk Redirect List

Fill in:

- List name: e.g., `pages-dev-redirect`

---

### Step 3: Add Rules to the List

Add one rule:

| Field | Value |
|-------|-------|
| Source URL | `https://dansblog.pages.dev/*` |
| Target URL | `https://danarnoux.com/$1` |
| Status | 301 (or use 302 for testing first) |
| Preserve query string | Optional |
| Subpath matching | ON |
| Preserve path suffix | ON |

Key points:

- Use `*` to match all paths
- Use `$1` to preserve the original path
- Recommend using **302** first to test, then switch to **301** when confirmed

> [!NOTE]
>
> In "Add URLs", click "Or, Manually add URL redirects", then remember to click "Edit parameters".

About the options:

- **Subpath matching / Preserve path suffix**: Recommend turning these on, otherwise paths may not pass correctly
- **Preserve query string**: Whether to enable depends on your needs (e.g., if you need to keep URL parameters). Disabling it still allows migration to complete normally.

---

### Step 4: Create Bulk Redirect Rule (Activate the Rules)

Go back to Bulk Redirects page:

Click:

> Create Bulk Redirect Rule

Configure:

- Rule name: e.g., `pages.dev redirect`
- Redirect using list: Select the List you just created

---

### Step 5: Enable the Rule

After saving, make sure:

- Rule status is ✅ Enabled (green)

👉 Note:

> If you only create a List without a Rule, it won't take effect
>
> For reference, check the example in step 1—note that Status shows "Active"

---

### Step 6: Wait for Activation

- Click Save / Deploy
- Usually takes effect within 1-2 minutes

---

### Summary

The correct flow for Bulk Redirects:

```text
List (define rules) → Rule (enable rules) → Edge execution
```

### Key Difference

Essential difference between Bulk Redirects and _redirects:
- Bulk Redirects are processed directly at Cloudflare's network edge (Edge), without going through the Pages layer
- Higher priority, more stable rules
- More reliable status code returns

## Verification

After configuration, verify using these methods:

### 1. Browser Test
Visit the original URL directly to confirm redirect works.

### 2. cURL Test
```bash
curl -I https://dansblog.pages.dev/blog/test
# Should return 301 + Location: https://danarnoux.com/blog/test
```

### 3. GSC Verification
In Google Search Console, re-verify the migration. After success, you should see a prompt: **This site is currently being migrated to [danarnoux.com]**.

## Conclusion

When migrating from `*.pages.dev` to a custom domain, the _redirects method works fine in browsers, but GSC may not recognize it. According to the documentation, **Bulk Redirects execute at the Edge layer**, making status code returns more stable and reliable—recommended for direct use.

As for why _redirects isn't recognized by GSC, neither Cloudflare nor Google has explicitly explained GSC's specific judgment logic. The above is merely an inference based on documentation structure—no absolute conclusion can be drawn. If you value stability, Bulk Redirects is the safer choice.

Original article from Codemzy: **https://www.codemzy.com/blog/cloudflare-pages-dev-redirect**
