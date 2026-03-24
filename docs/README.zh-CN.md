# Dan's Blog

基于 Astro + Tailwind 的静态个人博客，用于记录研究笔记、工程流程和可复现的长文写作。

[![访问在线站点](https://img.shields.io/badge/Visit-Live%20Site-0f766e?style=for-the-badge&logo=cloudflare&logoColor=white)](https://danarnoux.com/)
[![查看 GitHub 仓库](https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Dancncn/DansBlog)
[![博客](https://img.shields.io/badge/Open-Blog-1d4ed8?style=for-the-badge)](https://danarnoux.com/blog/)
[![标签](https://img.shields.io/badge/Open-Tags-6d28d9?style=for-the-badge)](https://danarnoux.com/tags/)
[![B站](https://img.shields.io/badge/关注-B站-fe738c?style=for-the-badge&logo=bilibili)](https://space.bilibili.com/435440676)

> **后端 Worker**: [DansBlogs_worker](https://github.com/Dancncn/DansBlogs_worker)
>
> **English Version**: [View English Documentation](../README.md)

## 主站点

主要访问入口为 **danarnoux.com**（Cloudflare Pages）。

GitHub Pages（`https://dancncn.github.io/DansBlog/`）已停止使用。现网站统一托管于 **https://danarnoux.com/**。

## 特性 🚀

一个实用的技术博客技术栈，致力于写作、文档维护和长期内容沉淀：📚 结构化内容、🛠️ 可复用 UI 组件，以及在真实导航和渲染条件下的稳定表现。

- 基于 Astro Content Collections 的静态博客（`.md` + `.mdx`）
- 结构化长文页面：首页、博客、标签、精选、友链、关于
- 可复用列表组件（`PostCard`、`TagBadges`、`Pagination`）
- 文章目录系统：桌面端 sticky 侧边栏 + 移动端抽屉
- 中英文配对文章的语言切换支持
- 仓库子路径和根路径双环境部署支持（GitHub Pages + Cloudflare Pages）
- GitHub OAuth + 邮箱登录与会话管理
- 评论系统（D1 数据库支持，每篇文章独立评论）
- Cloudflare Turnstile 验证码保护
- R2 图片托管（通过 `img.danarnoux.com` 访问）
- 用户下拉菜单与设置弹窗
- 404 页面

## 系统架构 🧱

### 内容管道

- 源码：`src/content/blog/`
- Schema：`src/content.config.ts`
- 文章路由：`src/pages/blog/[...slug].astro`
- 渲染：`render(post)` 返回 `Content` 和 `headings`
- 布局组合：`src/layouts/BlogPost.astro`

### UI 组合

- 全局外壳：`BaseHead` + `Header` + `Footer`
- 导航与抽屉：`Header`、`MobileDrawer`、`TocDrawer`
- 文章列表组件：`PostCard`、`TagBadges`、`Pagination`
- 目录栈：`Toc`、`TocSidebar`、`TocDrawer`

### 后端集成

本博客采用**前后端分离架构**，后端为独立的 Cloudflare Worker。

**后端仓库**：[DansBlogs_worker](https://github.com/Dancncn/DansBlogs_worker)

后端技术栈：
- **Cloudflare Workers** - 边缘运行时 API 处理
- **D1** - SQLite 数据库，存储用户、会话和评论
- **R2** - 对象存储，托管图片（`img.danarnoux.com`）
- **KV** - 邮箱登录速率限制
- **Durable Objects** - 限流机制
- **GitHub OAuth** - 带 PKCE 的认证流程
- **Resend** - 邮箱服务，用于发送登录链接
- **Cloudflare Turnstile** - 验证码保护

**API 域名**：`https://api.danarnoux.com`

- **GitHub OAuth**：跳转到 GitHub 进行认证，Session 令牌存储在 D1
- **邮箱登录**：
  - `POST /api/auth/email/send` - 发送登录链接到邮箱（需 Turnstile 验证码）
  - `GET /api/auth/email/verify` - 验证登录令牌并创建会话
- **评论 API**：
  - `GET /api/comments?slug=<post-slug>` - 获取文章评论
  - `POST /api/comments` - 创建新评论（需登录）
- **图片 API**：
  - `POST /api/upload` - 上传图片到 R2（需登录，有速率限制）
  - `GET /api/images` - 列出已上传图片（需登录）

详细后端实现请参阅 [Worker 文档](https://github.com/Dancncn/DansBlogs_worker)。

### 路由地图

- `/`
- `/blog/`
- `/blog/page/n/`
- `/blog/<slug>/`
- `/tags/` 和 `/tags/<tag>/`
- `/important/`
- `/links/`
- `/about/`

## 项目结构 📁

```text
.
├─ public/
│  ├─ image/                    # 静态图片（封面、头像、文章配图）
│  └─ pdfs/                     # PDF 文件
├─ src/
│  ├─ components/
│  │  ├─ BaseHead.astro         # 元数据、字体、ViewTransitions 入口
│  │  ├─ Header.astro           # 全局导航、社交操作、主题切换、目录触发器
│  │  ├─ MobileDrawer.astro     # 移动端导航抽屉
│  │  ├─ PostCard.astro         # 可复用文章卡片
│  │  ├─ TagBadges.astro        # 响应式标签渲染规则
│  │  ├─ Pagination.astro      # 带省略号逻辑的分页导航
│  │  ├─ Toc*.astro             # 目录列表/侧边栏/抽屉
│  │  └─ ...
│  ├─ content/
│  │  └─ blog/                  # Markdown/MDX 文章
│  ├─ data/
│  │  ├─ links.ts               # 友链数据
│  │  ├─ navLinks.ts            # 导航数据源
│  │  └─ quotes.json            # 终端语录数据
│  ├─ layouts/
│  │  └─ BlogPost.astro         # 文章布局 + 目录 + 运行时行为
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ blog/
│  │  ├─ tags/
│  │  ├─ important/
│  │  ├─ links/
│  │  └─ about.astro
│  ├─ styles/
│  │  └─ global.css             # 字体、动画、稳定性规则和排版
│  ├─ consts.ts
│  └─ content.config.ts
├─ astro.config.mjs
├─ tailwind.config.mjs
└─ README.md
```

## 工程决策 🛠️

### 1) 基础路径安全的部署

同一代码库在两个环境中运行：

- Cloudflare Pages 根路径（`/`）
- GitHub Pages 仓库子路径（`/DansBlog/`）

`astro.config.mjs` 通过环境变量（`CF_PAGES`、`NODE_ENV`）解析 `base`/`site`，Markdown 中的图片 URL 在构建时自动调整基础路径以保持跨平台一致性。

### 2) 文章入口稳定性优先于炫酷过渡效果

代码密集型页面对过渡动画和字体加载时序敏感。对于列表 → 文章导航，项目有意选择确定性入口：

- `reloadOnNavigate={true}` 在文章卡片上添加 `data-astro-reload`
- CSS `page-fade-in` 保持视觉连续性
- View Transitions 保持在常规路由切换中启用

### 3) 代码块与字体重排控制

`global.css` 和 `BaseHead.astro` 采用稳定性优先策略：

- 代码块不使用 `max-content` 尺寸
- 稳定的代码度量（`line-height: 1.6`，禁用连字）
- 容器级水平溢出
- 字体策略按角色分配：
  - Inter + Noto Serif SC：`display=swap`
  - JetBrains Mono：`display=optional`

### 4) 目录几何与重绑定

桌面端目录保持在专用的 sticky 列中；当标题缺失时，占位符保持几何稳定。目录脚本在 `astro:page-load` 和 `astro:after-swap` 时重新绑定，以在客户端路由切换时保持可靠性。

## 部署 🌐

### 推荐主环境：danarnoux.com

- 主域名：`https://danarnoux.com/`
- 这是推荐的公共访问入口，提供最新的功能和性能表现。

### 历史域名（已停用）

- 历史域名：`https://dancncn.github.io/DansBlog/` 和 `https://dansblog.pages.dev`
- 这些是项目早期阶段的部署渠道。现网站已统一迁移至 **https://danarnoux.com/**。

### 发布前检查清单

- 运行构建和预览
- 验证 `/blog/`、`/blog/page/2/`、`/tags/`、`/important/` 以及至少一篇代码密集型文章
- 检查 Network 面板是否有资源/图片 404

## 开发 💻

安装并运行：

```bash
npm install
npm run dev
```

构建和预览：

```bash
npm run build
npm run preview
```

## 写作指南 ✍️

### 创建文章

将 `.md` / `.mdx` 文件放在 `src/content/blog/` 下。

推荐的前置元数据：

```yaml
---
title: "你的标题"
description: "简短摘要"
pubDate: 2026-02-17
updatedDate: 2026-02-18
tags: ["标签a", "标签b"]
important: false
importantOrder: 0
---
```

### 中英文配对

使用 `-cn` / `-en` 命名约定来配对文章，并保持与当前内容策略一致的分组约定。

### 图片

- 本地图片存储在 `f:\project\Blog\image-store\`，结构如下：
  - `posts/` - 文章配图
  - `avatars/` - 用户头像
  - `misc/` - 其他图片
- 使用 `scripts\upload-images.ps1` 上传到 R2
- 在 Markdown 中使用完整 URL：`https://img.danarnoux.com/posts/xxx.png`

## 常见问题 📌

### 为什么文章入口不使用共享元素过渡？

代码密集型页面在真实网络和字体时序情况下仍会出现视觉不稳定。硬导航被用于关键路径以保持入口确定性。

### 为什么保留 View Transitions 尽管文章入口绕过了它们？

它们仍然改善了网站其他部分的整体路由体验。更严格的策略是有意为之，而非全局应用。

### 为什么保留 Markdown 优先的图片引用？

它保持写作工作流简单和编辑器友好，同时通过基础路径重写保持部署安全。

## SEO 优化指南 🔍

本博客使用 Google Search Console 和 Bing Webmaster Tools 进行 SEO 优化。详细设置和问题排查请参考：

- [SEO Guide (English)](./seo-guide.md)
- [SEO 优化指南 (中文)](./seo-guide-zh-CN.md)
