# 检查与维护

使用 Node 24 和 `npm ci` 安装锁定依赖。Cloudflare Pages 使用 `.node-version` 中的版本，构建命令保持 `npm run build`，输出目录保持 `dist`。

## 发布前检查

```sh
npm ci
npx playwright install chromium
npm run ci
```

`npm run build` 依次执行 Astro 类型检查、内容检查、检查器回归测试、静态生成和构建产物检查。任何一步失败都会阻止构建成功。

- 内容检查：必填字段、日期、语言与文件名一致性、同一分组中同语言唯一，防止翻译链接与阅读统计串组。
- 产物检查：站内链接、图片与脚本资源、页面锚点、草稿不外泄、文章语言、双语 alternate 和订阅语言。
- `npm run test:e2e`：本地 Chromium 交互回归。外部 API 使用测试数据，不发真实登录邮件，也不写生产数据。
- `npm audit --audit-level=moderate`：扫描锁文件依赖；中等及以上已知漏洞使 CI 失败。扫描不代表不存在未知漏洞。

远程文章链接、第三方图片是否仍在线不属于构建门槛，避免外部站点短暂故障阻断发布。新增外链仍应人工核对。

GitHub Actions 在每次 push 和 pull request 上执行同一套 CI。旧 GitHub Pages 发布流程已移除，Cloudflare Pages 是唯一发布目标。分支保护与 Cloudflare 项目的部署分支配置由托管平台管理，仓库检查无法代替平台配置。

## 模块边界

- `src/lib/config.ts`：唯一 API 地址来源；开发使用本地 Worker，生产使用正式 API。`PUBLIC_API_BASE` 可在构建时覆盖，禁止在其中放秘密。
- `src/lib/auth.ts`：令牌、用户信息、登录退出请求。
- `src/lib/auth-bootstrap.ts`：页面生命周期与兼容的 `window.__auth` 接口。
- `src/lib/blog-post.ts`：目录、代码工具、灯箱、阅读统计及导航时清理。
- `BaseHead.astro` 和 `BlogPost.astro`：元数据、页面结构和模块入口。

## TypeScript

前端使用 TypeScript 6.0.3 与 `@astrojs/check`。该检查器需要 TypeScript 的编程 API，当前不支持直接换成 TS7；普通 `tsc` 也不能替代 `.astro` 文件检查。后端独立使用 TS7。Astro 构建与 TypeScript 类型检查是不同阶段，不能把类型检查加速比例当成整站构建加速比例。

Astro 升级至 7.3.5 是为了修复依赖安全问题；保留 unified Markdown 处理器及原有 HTML 空白规则，以保持现有文章提示块、代码高亮和排版行为。
