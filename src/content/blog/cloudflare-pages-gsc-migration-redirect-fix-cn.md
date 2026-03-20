---
title: "Cloudflare Pages 重定向正常但 GSC 不识别？网站迁移失败与 Bulk Redirects 解决方案"
description: "详细分析在 Cloudflare Pages 中将 *.pages.dev 重定向到自定义域名后，Google Search Console 无法识别 301 重定向、导致网站迁移失败的问题，并提供使用 Bulk Redirects 的可靠解决方案。"
pubDate: 2026-03-20
updatedDate: 2026-03-20
lang: "cn"
author: "Dan"
group: "cloudflare-pages-gsc-migration-redirect-fix"
tags: ["Cloudflare", "SEO", "GSC","guide", "CN"]
---

## 1. 前言

我买了一个新域名后，使用GSC迁移网站的时候很是头疼，明明自己已经做好了重定向301的工作，但是为什么GSC就是不认呢？我还得天天看着旧的pages.dev域名在分我流量，不过，我找到一个叫Codemzy的博客提出了解决方案，参考一下竟然真的有效。

## 2. 背景

将网站从 `*.pages.dev` 迁移到自定义域名时，SEO 权重传递是关键问题。按照官方文档，最理想的方式是使用 301 永久重定向，让 Google 知道原 URL 已永久迁移到新地址，从而将排名权重传递给新域名。

本次场景：
- 源站：`https://dansblog.pages.dev`
- 目标：`https://danarnoux.com`
- 期望：浏览器和搜索引擎均返回 301 状态码

## 3. 问题现象

配置重定向后，实际测试发现：

1. **浏览器访问正常** - 输入 `dansblog.pages.dev/any-path` 会自动跳转到 `danarnoux.com/any-path`，跳转过程无感知
2. **GSC 报错** - Google Search Console 提示大量 URL 返回非 301 状态码，无法完成迁移验证
3. **cURL 测试异常** - 部分工具检测到的状态码与预期不符

这就很奇怪了：用户访问完全正常，但 Google 就是不认。

## 4. 错误方案

### 4.1 _redirects 方案

尝试在 `public/_redirects` 中配置：

```
https://dansblog.pages.dev/* https://danarnoux.com/:splat 301
```

**结果**：浏览器跳转正常，但 GSC 仍无法识别。

**原因分析**（基于 Cloudflare 官方文档的推论）：

---

#### 4.1.1 官方文档引用

**Bulk Redirects 文档**：
https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/

> “Bulk Redirects allow you to define URL redirects at the account level and have them executed at the edge.”

**Redirect Rules 文档**：
https://developers.cloudflare.com/rules/url-forwarding/

**Pages _redirects 文档**：
https://developers.cloudflare.com/pages/platform/redirects/

> “You can define redirects by adding a `_redirects` file to your project.”

**Pages 工作原理**：
https://developers.cloudflare.com/pages/platform/how-pages-works/

> “Cloudflare Pages serves your site through Cloudflare’s global network.”

---

#### 4.1.2 技术解读

根据文档，两种重定向机制存在本质区别：

| 机制 | 处理层级 | 执行位置 |
|------|----------|----------|
| **Pages _redirects** | 项目内部（构建时注入） | Pages 平台 |
| **Bulk Redirects** | 账户级别 | 边缘网络（Edge） |

- `_redirects` 是项目的一部分，通过 `public/_redirects` 文件定义，由 Pages 平台在构建时处理
- Bulk Redirects 是独立的 Rules 系统，在全球边缘节点执行，优先级高于 Pages 层面

---

#### 4.1.3 推论

基于 Cloudflare 官方文档可以确认：

- `_redirects` 属于 Pages 项目内部的重定向配置
- Bulk Redirects 属于 Rules 系统，在 Cloudflare 边缘网络（Edge）直接执行

在此基础上，可以做一个相对保守的推测：

> GSC 在进行网站迁移检测时，可能更容易识别由 Edge 层直接返回的 301 重定向，
> 而对于 Pages 层内部实现的重定向，不一定能够稳定识别。

需要说明的是：

- Cloudflare 和 Google 官方均未明确说明 GSC 的判定逻辑
- 以上结论仅基于文档结构和实际测试结果

👉 实际效果上，Bulk Redirects 可以稳定通过 GSC 迁移验证。

### 4.2 Worker 方案

尝试编写 Cloudflare Worker 实现重定向。

**结果**：可以工作，但存在不稳定性风险——Worker 可能因为超限、配置变更等原因失效。

## 5. 正确解决方案：Bulk Redirects

最终采用 **Cloudflare Bulk Redirects**（批量重定向）。

需要注意：Bulk Redirects 的配置是 **两步结构**：

1. 先创建 Redirect List（规则数据）
2. 再创建 Redirect Rule（让规则生效）

---

### 5.1 进入 Bulk Redirects

进入 Cloudflare Dashboard：

- 选择你的域名（如 `danarnoux.com`）
- 左侧进入：**Rules → Redirect Rules**
- 切换到 **Bulk Redirects**

![](https://img.danarnoux.com/posts/cloudflare-pages-gsc-migration-redirect-fix/step1.webp)

---

### 5.2 创建 Bulk Redirect List（先做这一步）

点击：

> Create Bulk Redirect List

填写：

- List 名称：如 `pages-dev-redirect`

![](https://img.danarnoux.com/posts/cloudflare-pages-gsc-migration-redirect-fix/step2.webp)

---

### 5.3 在 List 中添加规则

添加一条规则：

| 字段                  | 值                             |
| --------------------- | ------------------------------ |
| Source URL            | `https://dansblog.pages.dev/*` |
| Target URL            | `https://danarnoux.com/$1`     |
| Status                | 301（或先用 302 测试）         |
| Preserve query string | 可选                           |
| Subpath matching      | ON                             |
| Preserve path suffix  | ON                             |

关键点：

- `*` 用于匹配所有路径
- `$1` 用于保留原始路径
- 建议先使用 **302** 测试，确认无误后再改为 **301**

> [!NOTE]
>
> 在Add URLs，点击 Or,Manually and URL redirects即可，然后记得点击Edit parameters。

关于选项说明：

- **Subpath matching / Preserve path suffix**：建议开启，否则路径可能无法正确传递
- **Preserve query string**：是否开启取决于你的需求（例如是否需要保留 URL 参数），关闭同样可以正常完成迁移

![](https://img.danarnoux.com/posts/cloudflare-pages-gsc-migration-redirect-fix/step3.webp)

![](https://img.danarnoux.com/posts/cloudflare-pages-gsc-migration-redirect-fix/step3_2.webp)

---

### 5.4 创建 Bulk Redirect Rule（让规则生效）

回到 Bulk Redirects 页面：

点击：

> Create Bulk Redirect Rule

配置：

- Rule 名称：如 `pages.dev redirect`
- Redirect using list：选择刚刚创建的 List

![](https://img.danarnoux.com/posts/cloudflare-pages-gsc-migration-redirect-fix/step4.webp)

---

### 5.5 启用规则

保存后，确保：

- Rule 状态为 ✅ Enabled（绿色）

👉 注意：

> 如果没有创建 Rule，仅有 List 是不会生效的
>
> 生效例图参考step1，注意Status为Active

---

### 5.6 等待生效

- 点击 Save / Deploy
- 通常 1~2 分钟内生效

---

### 5.7 小结

Bulk Redirects 的正确流程是：

```text
List（定义规则） → Rule（启用规则） → Edge 执行
```

### 5.8 关键区别

Bulk Redirects 与 _redirects 的本质区别：
- Bulk Redirects 在 Cloudflare 网络边缘（Edge）直接处理，不经过 Pages 层面
- 优先级更高，规则更稳定
- 状态码返回更可靠

## 6. 验证方式

配置完成后，通过以下方式验证：

### 6.1 浏览器测试
直接访问原 URL，确认跳转正常。

### 6.2 cURL 测试
```bash
curl -I https://dansblog.pages.dev/blog/test
# 应返回 301 + Location: https://danarnoux.com/blog/test
```

### 6.3 GSC 验证
在 Google Search Console 中重新验证迁移，成功后应该会出现一个提示 **此网站目前正在迁移到 [danarnoux.com](https://search.google.com/search-console?resource_id=sc-domain%3Adanarnoux.com)**。

## 7. 总结

网站从 `*.pages.dev` 迁移到自定义域名时，_redirects 方法在浏览器端工作正常，但 GSC 可能无法识别。根据官方文档，**Bulk Redirects 在 Edge 层执行**，状态码返回更稳定可靠，建议直接使用。

至于为什么 _redirects 不被 GSC 识别，官方文档没有明确说明 GSC 的具体判定逻辑，以上仅为基于文档结构的推测，无法给出绝对结论。如果追求稳定性，Bulk Redirects 是更稳妥的选择。

Codemzy的博客原文网址：**https://www.codemzy.com/blog/cloudflare-pages-dev-redirect**
