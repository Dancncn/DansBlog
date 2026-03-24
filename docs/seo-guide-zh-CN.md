# SEO 优化指南

本指南介绍如何使用 Google Search Console 和 Bing Webmaster Tools 为静态博客设置 SEO。

## 概述

两大搜索引擎站长工具：

- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster Tools**: https://www.bing.com/webmaster

## 验证

### Google Search Console

1. 登录 [Google Search Console](https://search.google.com/search-console)
2. 添加你的域名
3. 通过 HTML meta 标签验证（在网站的 `<head>` 中添加）：
   ```html
   <meta name="google-site-verification" content="你的验证代码" />
   ```

### Bing Webmaster Tools

1. 登录 [Bing Webmaster Tools](https://www.bing.com/webmaster)
2. 添加你的域名
3. 通过 HTML 标签或 IndexNow 密钥文件验证

## 网站地图

Astro 配合 `@astrojs/sitemap` 会在构建时自动生成网站地图：

- `sitemap-index.xml` - 网站地图索引
- `sitemap-0.xml` - 第一个网站地图文件
- `sitemap.xml` - 索引的副本（兼容性）

在 `public/robots.txt` 中声明：
```
User-agent: *
Allow: /
Sitemap: https://你的域名.com/sitemap.xml
```

## IndexNow (Bing)

[IndexNow](https://www.indexnow.org/) 可以让你在内容更改时立即通知 Bing。

### 配置

1. 从 Bing Webmaster Tools 获取你的 IndexNow 密钥
2. 添加到 Cloudflare Pages 环境变量：
   - `INDEXNOW_KEY` = 你的密钥
   - `INDEXNOW_HOST` = 你的域名

### 实现示例

创建一个脚本 (`scripts/indexnow.mjs`)：
1. 从网站地图读取 URL
2. 发送 POST 请求到 Bing IndexNow 端点

```javascript
// 简化示例
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

### 部署时自动通知

在 Cloudflare Pages 构建设置中：
```
构建命令: npm run build && npm run indexnow:sitemap
```

## SEO 最佳实践

### Meta 标签

每个页面应有：
- 独特的 `<title>`（50-60 个字符）
- 独特的 `<meta name="description">`（150-160 个字符）
- `<link rel="canonical">` 防止重复内容

### Robots.txt

```txt
User-agent: *
Allow: /
Sitemap: https://你的域名.com/sitemap.xml
```

### 其他建议

- 使用语义化 HTML 元素
- 确保加载速度快
- 保持网站移动端友好
- 使用描述性的 URL

## 问题排查

### GSC 问题

- **重定向错误**：使用服务端重定向（Cloudflare）而非客户端 JS
- **未编入索引**：等待抓取或使用 URL 检查工具请求索引

### Bing 问题

- **InvalidRequestParameters**：确保网站地图 URL 与验证域名一致
- **IndexNow 错误**：验证密钥和环境变量设置正确

## 参考资料

- [Google Search Console 帮助](https://support.google.com/websearch)
- [Bing Webmaster Tools 帮助](https://www.bing.com/webmaster/help)
- [IndexNow 文档](https://www.indexnow.org/)
- [网站地图协议](https://www.sitemaps.org/protocol.html)
