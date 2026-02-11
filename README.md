# Dan's Blog

English is the default documentation language. Chinese version is provided below.

A personal technical blog built with Astro, focused on research notes, engineering workflow, and reproducible project logs.

## Overview

This project is an Astro-based static blog with:
- Content Collections for structured Markdown posts
- Tailwind CSS for consistent design tokens and typography
- Lightweight interactive components (theme toggle, terminal quote card)
- GitHub Pages deployment under a repo base path (`/DansBlog/`)

## Technical Principles

### 1) Static-first architecture
- The site is generated as static HTML (`output: "static"`) for speed and reliability.
- Posts are authored in Markdown and compiled at build time.
- Routes are file-based (`src/pages/*`).

### 2) Content modeling with Astro Content Collections
- Blog posts live in `src/content/blog/`.
- Frontmatter is schema-validated in `src/content.config.ts`.
- This keeps metadata consistent (`title`, `description`, `pubDate`, etc.) and type-safe.

### 3) Layout and rendering flow
- Shared page structure is handled by reusable layout/components:
  - `src/components/BaseHead.astro`
  - `src/components/Header.astro`
  - `src/components/Footer.astro`
  - `src/layouts/BlogPost.astro`
- Post pages use a dynamic route (`src/pages/blog/[...slug].astro`) and render content via `render(post)`.

### 4) Styling system
- Tailwind provides a restrained design system (neutral grayscale + one accent color).
- Typography and spacing are unified for mixed Chinese/English technical writing.
- Motion is intentionally subtle to preserve readability.

### 5) GitHub Pages deployment strategy
- This repo is deployed as **GitHub Pages repo site** (not user root site).
- `astro.config.mjs` uses:
  - `site: "https://dancncn.github.io"`
  - `base: "/DansBlog/"`
  - `trailingSlash: "always"`
- Internal links and assets are generated with base-aware paths.
- Markdown images under `/image/...` are normalized during rendering to support repo base prefix in production.

## Project Structure

```text
.
├─ public/
│  ├─ image/                 # Static images (hero, avatars, blog images, etc.)
│  └─ pdfs/                  # PDF files for download/open in posts
├─ src/
│  ├─ components/            # Reusable UI components (Header, Footer, TOC, cards...)
│  ├─ content/
│  │  └─ blog/               # Markdown blog posts
│  ├─ data/                  # Local data sources (quotes, links, nav config...)
│  ├─ layouts/               # Page layouts (e.g. BlogPost layout)
│  ├─ pages/                 # File-based routes
│  ├─ styles/                # Global styles and Tailwind composition
│  ├─ consts.ts              # Site-level constants
│  └─ content.config.ts      # Content Collection schema
├─ astro.config.mjs          # Astro config (site/base/output/trailingSlash)
├─ tailwind.config.mjs       # Tailwind theme and plugin config
└─ package.json
```

## Key Files and Responsibilities

| File | Responsibility |
| :-- | :-- |
| `src/layouts/BlogPost.astro` | Blog article page layout: metadata, title area, desktop TOC column, markdown content wrapper |
| `src/pages/blog/[...slug].astro` | Dynamic post route, loads post entry and headings via `render(post)` |
| `src/components/Header.astro` | Global navigation, social icons, theme toggle, mobile TOC button trigger |
| `src/components/MobileDrawer.astro` | Mobile site navigation drawer (Menu) |
| `src/components/TocDrawer.astro` | Mobile TOC drawer (md below) |
| `src/components/TocSidebar.astro` | Desktop TOC card content (rendered inside left `aside`) |
| `src/components/Toc.astro` | Pure TOC list rendering (`h2/h3`) and anchor links |
| `src/pages/links/index.astro` | Friends/Links page rendering, avatar fallback strategy |
| `src/data/links.ts` | Links source of truth (name/url/avatar/github/description/tags) |
| `src/styles/global.css` | Global typography/motion rules, prose styles, heading scroll offset |
| `astro.config.mjs` | Deployment-critical settings (`site`, `base`, `output`, `trailingSlash`) |

## Development Notes

- Base path first:
  Use `import.meta.env.BASE_URL` for internal links/assets in `.astro` files; avoid hardcoded root paths when they bypass repo base.
- Markdown image convention:
  Keep post images under `public/image/...` and reference them with `/image/...` in Markdown.
- Content schema discipline:
  When adding new frontmatter fields, update `src/content.config.ts` first, then update existing posts as needed.
- Local data consistency:
  For links/quotes/nav data, keep naming and field conventions stable to avoid UI breakage from undefined fields.
- TOC responsibilities:
  Desktop TOC belongs to `BlogPost` left `aside`; mobile TOC belongs to `TocDrawer` only.
- Script rebinding with View Transitions:
  Interactive scripts should bind on both `astro:page-load` and `astro:after-swap`.
- Static assets:
  Put reusable media in `public/` (not absolute filesystem paths), and reference with project-relative URL paths.
- Windows build caveat (if encountered):
  `EPERM` on `node_modules/.vite` usually means file lock; stop running dev/preview processes and retry.

## Writing Posts

Create a new file in `src/content/blog/`:

```md
---
title: "Your Post Title"
description: "Short summary"
pubDate: 2026-02-11
---

Your content here.
```

## Commands

| Command | Description |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `npm run build` | Build static output to `dist/` |
| `npm run preview` | Preview built site locally |

## Open Source & Learning

This repository is open for reference and learning.
You can study the architecture, content workflow, and deployment setup for your own Astro blog projects.

If you reuse code, please keep attribution and follow this repository's license terms.

---

## 中文说明

这是一个基于 Astro 的个人技术博客，核心目标是：
- 用清晰结构记录科研/工程实践
- 保持内容可复现、可维护
- 在 GitHub Pages（项目页）稳定部署

### 技术实现要点

1. 静态优先
- 使用 Astro 静态构建，降低运行复杂度，提升加载性能。

2. 内容集合（Content Collections）
- 博文放在 `src/content/blog/`。
- 通过 `src/content.config.ts` 做 frontmatter 结构校验，保证数据一致性。

3. 组件化布局
- 头部、页脚、SEO、文章布局都拆分为独立组件，方便统一维护。

4. 样式系统
- 使用 Tailwind 统一排版、间距与颜色层级，适配中英混排技术写作。

5. GitHub Pages 项目页部署
- 通过 `base: "/DansBlog/"` 适配仓库子路径部署。
- 站内链接与图片路径按 base 规则处理，避免线上 404。

### 项目结构与文件职责（简要）

- `src/layouts/BlogPost.astro`：文章详情页布局（标题区、桌面 TOC、正文容器）
- `src/pages/blog/[...slug].astro`：文章动态路由与内容渲染入口
- `src/components/Header.astro`：全站导航、主题切换、移动端 TOC 按钮触发
- `src/components/TocDrawer.astro`：移动端目录抽屉
- `src/components/TocSidebar.astro`：桌面端目录卡片内容
- `src/components/Toc.astro`：目录列表渲染（h2/h3）
- `src/pages/links/index.astro`：友链页面渲染逻辑
- `src/data/links.ts`：友链数据源
- `src/styles/global.css`：全局样式与 markdown/prose 规则
- `astro.config.mjs`：部署关键配置（site/base/output）

### 开发注意事项

- 处理仓库子路径部署时，优先使用 `import.meta.env.BASE_URL` 生成站内链接。
- Markdown 图片建议统一放 `public/image/`，文内使用 `/image/...` 引用。
- 新增 frontmatter 字段时先更新 `src/content.config.ts`，避免构建时 schema 报错。
- 桌面端目录仅在文章布局左侧 `aside` 渲染；移动端目录仅走抽屉组件。
- 遇到 Windows 下 `.vite` 的 `EPERM` 锁文件错误，先关闭占用进程再重试构建。

### 开源学习使用

本仓库可作为 Astro 博客工程化实践参考。
欢迎学习和二次开发；复用代码时请保留来源并遵循仓库许可证。
