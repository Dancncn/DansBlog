# Dan's Blog

A static Astro + Tailwind personal blog for research notes, engineering workflows, and reproducible long-form writing.

[![Visit Live Site](https://img.shields.io/badge/Visit-Live%20Site-0f766e?style=for-the-badge&logo=cloudflare&logoColor=white)](https://danarnoux.com/)
[![View GitHub Repository](https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Dancncn/DansBlog)
[![Blog](https://img.shields.io/badge/Open-Blog-1d4ed8?style=for-the-badge)](https://danarnoux.com/blog/)
[![Tags](https://img.shields.io/badge/Open-Tags-6d28d9?style=for-the-badge)](https://danarnoux.com/tags/)
[![Bilibili](https://img.shields.io/badge/Watch-Bilibili-fe738c?style=for-the-badge&logo=bilibili)](https://space.bilibili.com/435440676)

> **Backend Worker**: [DansBlogs_worker](https://github.com/Dancncn/DansBlogs_worker)
>
> **中文版**: [查看中文文档](./docs/README.zh-CN.md)

## Main Site

Primary access is **danarnoux.com** (Cloudflare Pages).

GitHub Pages (`https://dancncn.github.io/DansBlog/`) has been deprecated. The site is now exclusively hosted at **https://danarnoux.com/**.

## Features 🚀

A practical stack for writing, documenting, and maintaining a technical blog over time: 📚 structured content, 🛠️ reusable UI primitives, and stable behavior under real navigation and rendering conditions.

- Static-first blog with Astro Content Collections (`.md` + `.mdx`)
- Structured long-form pages: Home, Blog, Tags, Important, Links, About
- Reusable list UI (`PostCard`, `TagBadges`, `Pagination`)
- Article TOC system: desktop sticky sidebar + mobile drawer
- Language switch support for paired CN/EN posts
- Repo-page and root-path deployment support (GitHub Pages + Cloudflare Pages)
- GitHub OAuth login with session management
- Comment system (D1 backed, per-post)
- R2 image hosting via `img.danarnoux.com`
- User dropdown with Settings modal
- 404 page

## System Architecture 🧱

### Content Pipeline

- Source: `src/content/blog/`
- Schema: `src/content.config.ts`
- Post route: `src/pages/blog/[...slug].astro`
- Rendering: `render(post)` returns both `Content` and `headings`
- Layout composition: `src/layouts/BlogPost.astro`

### UI Composition

- Global shell: `BaseHead` + `Header` + `Footer`
- Navigation and drawers: `Header`, `MobileDrawer`, `TocDrawer`
- Post list primitives: `PostCard`, `TagBadges`, `Pagination`
- TOC stack: `Toc`, `TocSidebar`, `TocDrawer`

### Backend Integration

This blog uses a **decoupled architecture** with a separate Cloudflare Worker backend.

**Backend Repository**: [DansBlogs_worker](https://github.com/Dancncn/DansBlogs_worker)

The backend is built with:
- **Cloudflare Workers** - Edge runtime for API handlers
- **D1** - SQLite database for users, sessions, and comments
- **R2** - Object storage for image hosting (`img.danarnoux.com`)
- **Durable Objects** - Rate limiting mechanism
- **GitHub OAuth** - Authentication flow with PKCE

**API Base**: `https://api.danarnoux.com`

- **GitHub OAuth**: Redirect to GitHub for authentication, session tokens stored in D1
- **Comments API**:
  - `GET /api/comments?slug=<post-slug>` - Fetch comments for a post
  - `POST /api/comments` - Create a new comment (requires auth)
- **Image API**:
  - `POST /api/upload` - Upload image to R2 (requires auth, rate limited)
  - `GET /api/images` - List uploaded images (requires auth)

For detailed backend implementation, see the [worker documentation](https://github.com/Dancncn/DansBlogs_worker).

### Routing Map

- `/`
- `/blog/`
- `/blog/page/n/`
- `/blog/<slug>/`
- `/tags/` and `/tags/<tag>/`
- `/important/`
- `/links/`
- `/about/`

## Project Structure 📁

```text
.
├─ public/
│  ├─ image/                    # Static images (hero, avatars, article images)
│  └─ pdfs/                     # PDF files
├─ src/
│  ├─ components/
│  │  ├─ BaseHead.astro         # Metadata, fonts, ViewTransitions entry
│  │  ├─ Header.astro           # Global nav, social actions, theme toggle, TOC trigger
│  │  ├─ MobileDrawer.astro     # Mobile navigation drawer
│  │  ├─ PostCard.astro         # Reusable post list card
│  │  ├─ TagBadges.astro        # Responsive tag rendering rules
│  │  ├─ Pagination.astro      # Paged navigation with ellipsis logic
│  │  ├─ Toc*.astro             # TOC list/sidebar/drawer
│  │  └─ ...
│  ├─ content/
│  │  └─ blog/                  # Markdown/MDX posts
│  ├─ data/
│  │  ├─ links.ts               # Links dataset
│  │  ├─ navLinks.ts            # Navigation source
│  │  └─ quotes.json            # Terminal quote data
│  ├─ layouts/
│  │  └─ BlogPost.astro         # Article layout + TOC + runtime behavior
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ blog/
│  │  ├─ tags/
│  │  ├─ important/
│  │  ├─ links/
│  │  └─ about.astro
│  ├─ styles/
│  │  └─ global.css             # Typography, motion, stability and prose rules
│  ├─ consts.ts
│  └─ content.config.ts
├─ astro.config.mjs
├─ tailwind.config.mjs
└─ README.md
```

## Engineering Decisions 🛠️

### 1) Base-Path Safe Deployments

The same codebase runs in two environments:

- Cloudflare Pages root path (`/`)
- GitHub Pages repo subpath (`/DansBlog/`)

`astro.config.mjs` resolves `base`/`site` from environment flags (`CF_PAGES`, `NODE_ENV`), and markdown image URLs are base-adjusted in the pipeline for cross-host consistency.

### 2) Post Entry Stability Over Fancy Morphing

Code-heavy pages are sensitive to timing between transitions and late style/font arrival. For list → post navigation, the project intentionally prefers deterministic entry:

- `reloadOnNavigate={true}` adds `data-astro-reload` on post cards
- CSS `page-fade-in` keeps visual continuity
- View Transitions remain enabled for general route changes

### 3) Code Block and Font Reflow Control

`global.css` and `BaseHead.astro` apply a stability-first strategy:

- no `max-content` sizing in code block flow
- stable code metrics (`line-height: 1.6`, ligatures disabled)
- container-level horizontal overflow
- font policy split by role:
  - Inter + Noto Serif SC: `display=swap`
  - JetBrains Mono: `display=optional`

### 4) TOC Geometry and Rebinding

Desktop TOC stays in a dedicated sticky column; a placeholder keeps geometry stable when headings are absent. TOC scripts rebind on `astro:page-load` and `astro:after-swap` to stay reliable under client-side route swaps.

## Deployment 🌐

### Recommended Primary Environment: danarnoux.com

- Primary URL: `https://danarnoux.com/`
- This is the recommended public access point for latest behavior and performance profile.

### Legacy (Deprecated)

- Legacy URL: `https://dancncn.github.io/DansBlog/` and `https://dansblog.pages.dev`
- These served as the initial deployment channels during the project's early stages. Now the site is consolidated at **https://danarnoux.com/**.

### Pre-release Checklist

- Run build + preview
- Validate `/blog/`, `/blog/page/2/`, `/tags/`, `/important/`, and at least one code-heavy post
- Check Network panel for asset/image 404s

## Development 💻

Install and run:

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Writing Guide ✍️

### Create a Post

Place `.md` / `.mdx` under `src/content/blog/`.

Recommended frontmatter:

```yaml
---
title: "Your Title"
description: "Short summary"
pubDate: 2026-02-17
updatedDate: 2026-02-18
tags: ["tag-a", "tag-b"]
important: false
importantOrder: 0
---
```

### Language Pairing (CN/EN)

Use `-cn` / `-en` naming conventions for paired articles, and keep grouping conventions consistent with current content strategy.

### Images

- Store local images in `f:\project\Blog\image-store\` with structure:
  - `posts/` - Article images
  - `avatars/` - User avatars for comments
  - `misc/` - Miscellaneous images
- Upload to R2 using `scripts\upload-images.ps1`
- Use full URL in markdown: `https://img.danarnoux.com/posts/xxx.png`

## FAQ / Notes 📌

### Why not use shared-element transitions for article entry?

Code-heavy pages still showed residual visual instability in real network/font timing scenarios. Hard navigation is used on that critical path to keep entry deterministic.

### Why keep View Transitions if post entry bypasses them?

They still improve overall route feel across the rest of the site. The stricter strategy is intentionally scoped, not global.

### Why keep markdown-first image references?

It keeps writing workflow simple and editor-friendly while remaining deployment-safe through base-path rewriting.
V2
