---


title: "如何搭建一个个人博客网站"
description: "基于Astro和Tailwind css搭建一个不需要自己解决域名和服务器问题的个人博客网站。"
pubDate: 2026-02-12
tags: ["Astro", "blog", "github-pages", "guide", "CN"]
lang: "cn"
group: "how-to-build-a-personal-blog"
important: true
importantOrder: 100
typora-root-url: ./
---

## 前言

当我发现我的越来越记不住我的技术和想法时，我有时候会在失眠的深夜里用我手机的备忘录进行记录，但内容量相当有限，而且我无法在其他设备随时访问到我的备忘录里的内容。今年1月我在失眠的夜晚打算要是有空就搭建一个个人博客网站，我要写博客记录下来有意义的内容，为了我自己，我教过的学生，以后或许我也会有更多的学生需要。但是我实在很忙碌，最近又刚在江苏省出差完回来，回家我依旧失眠的一个夜晚，我想起了这一件事，但可惜那会是凌晨，我不好方便去打扰我有做过个人博客的朋友们，而且我预估的完成时间可能是一周。第二天早上我问了问我的高中同学Herbert Skyper，他的答复是一周，但是他是用Vue纯手搓并没有用成熟的博客框架只是想手搓个前端玩玩，我25去哈工深找他玩的时候倒是又和他聊过相关的事情，域名费大概一年几十块(七八十好像)，服务器我忘了他怎么解决了可能部署到学校的一些平台上了。做网站最麻烦之一的问题就是你需要一个域名（有特点需求还需要备案流程），还有一个尽量24小时都开着的稳定性能足够的电脑（一般来说服务器符合），还有公网IP（也是有办法解决，但是不要折腾是最好的）等等麻烦的事情。不过Skyper和我提到了一嘴他的同学有用[Astro](https://docs.astro.build/zh-cn/getting-started/)的，一个成熟的博客框架。后面我的朋友kymi回复了我，他用[Hexo](https://hexo.io/zh-cn/)写的，他的个人博客里也有对应的教程[《如何用Hexo搭建博客》](https://licyk.github.io/2024/06/26/how-to-deploy-hexo/)。而且他说也不是很费时间，部署在github上，这样就解决了域名和服务器费用。

------

## 需求分析

### 我需要的是什么？

我需要的是一个备忘录pro，我随时可以查看，并且其他人也能看，而且我希望我不会因此花费太多钱和时间。内容为王，但是我又希望可以做点美观个性的小情趣，为世界留下一些我的存在吧算是。我希望我的博客风格是简洁理性克制的，但是又温柔的，有些许多彩的小东西点缀，让人会心一笑。

### 技术路线

根据前言，既然如此那我为什么选择了Astro了呢？因为我打算看看有哪些博客框架，他们之间都有什么优缺点，什么最适合我。由于我用Chatgpt多年，他对我的掌握的技术水平有一定了解，我将他的推荐内容整理成以下表格



#### 博客框架对比分析

| 框架                       | 技术栈                            | 构建速度 | 写作体验              | 组件/交互能力      | 扩展性 | GitHub Pages 适配      | 适合人群             | 可能的坑               |
| -------------------------- | --------------------------------- | -------- | --------------------- | ------------------ | ------ | ---------------------- | -------------------- | ---------------------- |
| **Hexo**                   | Node.js                           | 中等     | 上手简单，主题多      | 较弱（偏模板型）   | 中等   | 成熟稳定               | 纯写作、中文生态用户 | Node 依赖偶尔折腾      |
| **Hugo**                   | Go                                | 极快     | 结构清晰              | 一般（偏内容驱动） | 中等   | 非常稳                 | 追求速度、低运维     | 主题配置偏工程化       |
| **Astro**                  | 现代前端（支持 React/Vue/Svelte） | 快       | Markdown / MDX 体验好 | 强（组件化混排）   | 强     | 需注意 base 路径       | 前端开发者           | 自由度高，需要自己决策 |
| **Next.js / Nuxt**         | React / Vue 全栈                  | 中等     | 良好                  | 非常强             | 极强   | 静态导出需处理资源前缀 | 未来想做平台级网站   | 对纯博客略重           |
| **VitePress / Docusaurus** | Vite / React                      | 快       | 文档体验极佳          | 中等               | 中等   | 非常稳                 | 技术文档型内容       | 博客氛围较弱           |
| **Jekyll**                 | Ruby                              | 中等     | 传统 Markdown         | 较弱               | 中等   | 原生支持               | 想最少折腾部署       | 现代化程度一般         |



#### 决策导向总结

| 需求类型                   | 推荐方案               | 理由                        |
| -------------------------- | ---------------------- | --------------------------- |
| 纯写作、主题成熟、少改代码 | Hexo / Hugo            | 经典稳定                    |
| 大量技术文章、追求构建速度 | Hugo                   | 构建速度极快                |
| 博客 + 项目展示 + 前端交互 | **Astro**              | Markdown + 组件混排优势明显 |
| 未来可能升级成个人平台     | Next.js / Nuxt         | 全栈能力强                  |
| 偏技术文档整理             | VitePress / Docusaurus | 目录与结构管理优秀          |

Chatgpt和我说，虽然Astro自由度高，需要自己决策可能是一个坑，但对我反而或许是一个优势了，我可以挑选我喜欢的组件，至于域名和服务器问题，我一开始想的是 Cloudflare，但是既然项目要上传github，那么github pages反而相当的方便，因为我设置完后，每次只要push就能更新了，相当的方便。下面我附上部署与成本难度的表格



#### 部署与成本维度

| 项目       | 现实情况                                                    |
| ---------- | ----------------------------------------------------------- |
| 服务器费用 | GitHub Pages / Cloudflare Pages / Vercel 基本为 0           |
| 域名费用   | 默认可用 username.github.io（免费）；自定义域名通常需要付费 |
| 运维成本   | 静态站点基本为 0 运维                                       |



既然Astro支持现代前端Vue，那我要选用什么组件呢， **你的技术路线也其实决定博客风格与气质**。

**先校正一个关键认知**，这是 Astro 的优势，不是限制。

> **Astro 不是“基于 Vue 的博客”，而是：
>  👉 Astro = 静态站框架 + 可按需引入 Vue 组件**

Chatgpt给我选了[Tailwind CSS](https://tailwindcss.com/plus/ui-blocks/marketing)，并且推荐我选择一套 **耐看、长期不腻、非常“专业”**的风格，我觉得他是对的，目前这种风格我老了可能也希望（不过我老了还会是二次元吗）。您可以点击我设置的Tailwind的超链接，来看看里面的组件是否对您的胃口。

目前我还是希望引入一个组件进行开发先，这样可以避免复杂性，***少即是多***。



#### 开发环境

我选用的是用**Vs Code**作为我的**文本编辑器**进行开发，并且已经安装了Astro的拓展。

> [!NOTE]
>
> **Node.js** - `v18.20.8` 或 `v20.3.0`、`v22.0.0` 或更高版本。（`v19` 和 `v21` 均不支持。）
>
> Astro 使用 Vite 构建，Vite 默认针对支持现代 JavaScript 的浏览器。要阅读完整的参考，你可以 [在 Vite 中查看当前支持的浏览器版本列表](https://cn.vite.dev/guide/build#browser-compatibility)。
>
> **终端** - Astro 通过其命令行界面（CLI）访问。

------



## 先让 AI Code 帮你搭一版骨架

当你已经确定了需求和技术路线，其实可以把 AI 当成“脚手架助手”，先让它帮你搭一个能跑起来的版本。  
我自己的习惯是：先让 AI 快速出一版，再人工做第二轮收敛。这样做效率会高很多，也更不容易卡在第一步。

### 一套我自己会用的提示词（可直接复制）

你可以把下面这段贴给 AI（ChatGPT、Codex、Cursor 都可以）：

```text
你是一个资深前端工程师，请帮我从 0 到 1 搭建一个 Astro 个人博客项目。

我的目标：
1) 技术栈：Astro + Tailwind CSS
2) 文章：Markdown 写作
3) 部署：GitHub Pages
4) 要求：适合新手维护，目录结构清晰，样式简洁克制

请按下面方式输出：
1) 先给我项目目录结构（树形）
2) 再给我需要执行的命令（按顺序）
3) 再给我每个关键文件的完整内容（astro.config.mjs、package.json、基础页面、博客内容目录）
4) 每一步都注明“为什么要这样做”
5) 最后给我一份排错清单（常见报错 + 解决办法）

约束：
- 不要跳步
- 不要省略关键配置
- 所有命令可直接复制
- 优先给稳定方案，不要花哨技巧
```

### 第二轮提示词（让 AI 改，而不是重写）

第一版跑起来后，你再给 AI 这个指令：

```text
下面是我当前项目状态，请你只在现有结构上增量修改，不要推翻重来。

目标：
1) 保持现有路由不变
2) 优化首页排版和博客列表样式
3) 增加 tags 页面
4) 确保 npm run build 通过

输出要求：
1) 只给“需要修改的文件”
2) 每个文件给最小改动 diff
3) 改动后附上验证命令
```

这类“增量修改”提示词很关键，不然 AI 很容易把你已经写好的内容一锅端掉。
举个例子，这就是我确定好需求后直接让codex帮我大体改出来的效果。很适合项目起步，后续如果您调试的时候自己没头绪，也可以让ai写一份专业的提示词，这样比你说这个东西应该在那个东西的左边右边更加合理，毕竟aicode他看不见嘛，他是个很聪明的盲人。

![step1](https://img.danarnoux.com/posts/how-to-build-step2.png)

------



## 安装

### 安装node.js（Windows安装）

Node.js 安装包及源码下载地址为：https://nodejs.org/en/download。

最简单的办法，点开网址，然后点击按钮[Windows Installer(.msi)](https://nodejs.org/dist/v24.13.1/node-v24.13.1-win-x64.zip)，当然我也给你做好了超链接，你点一下能下载了。

#### 安装步骤

1. 双击安装包
2. 点击以上的 Next 按钮
3. 勾选接受协议选项，点击 Next 按钮 :
4. Node.js默认安装目录为 "C:\Program Files\nodejs\" , 你可以修改目录，并点击 Next 按钮：
5. 点击 Install（安装） 开始安装 Node.js，你也可以点击 Back（返回）来修改先前的配置：
6. 安装完后点击 Finish（完成）按钮退出安装向导。

> [!TIP]
>
> 安装完成后，我们可以在命令行或 Windows Powershell 中执行以下命令来测试。这是输出node版本号的命令，如果正常输出，则表示安装成功。
>
> 至于命令行怎么调用出来，最简单的就是Win+R，然后输入cmd，回车。

```
node -v
npm -v
```

```
#example
C:\Users\Dan>node -v
v24.13.0
```

#### 如果你遇到网络问题（下载慢 / 安装依赖超时）

很多新手第一次卡住都在这里，不是你操作错了，通常是网络到 npm 官方源太慢。  
可以先把 npm 源切到国内镜像，再继续安装依赖：

```bash
# 查看当前源
npm config get registry

# 切换到国内镜像（npmmirror）
npm config set registry https://registry.npmmirror.com

# 再确认一下
npm config get registry
```

然后再执行：

```bash
npm install
```

如果你后面想切回官方源，也很简单：

```bash
npm config set registry https://registry.npmjs.org
```

------



### 安装Vs Code

你可以直接去官网下载安装（推荐 Stable 版本）：

[https://code.visualstudio.com/](https://code.visualstudio.com/)

简版步骤（Windows）：

1. 打开官网，点击 `Download for Windows`。  
2. 双击安装包，基本一路 `Next` 就行。  
3. 建议勾选这几个选项：  
`Add "Open with Code"`、`Add to PATH`、`Register Code as an editor`。  
4. 安装完成后，打开 VS Code，`File -> Open Folder` 选择你的博客项目目录。  
5. 打开终端（`Ctrl + ~`），执行：

```
npm -v
node -v
```

能看到版本号就说明开发环境已经通了。

我自己常用的扩展（够用版）：

- `Astro`（官方语法支持）
- `Tailwind CSS IntelliSense`（Tailwind 类名提示）
- `Markdown All in One`（写 Markdown 更顺手）

如果您对上手编程感兴趣，我会在日后更新的文章《如何上手编程》中详细说明更多。

------



### 安装Astro

我这边还是建议提供**通过 CLI 向导安装**，

1.在终端运行以下命令，首先我建议你选好文件夹，我的话是**F:\project\Blog**，你在文件资源管理器里打开至当前文件夹，然后点击搜索左边的路径，然后输出cmd，回车。安装下面的步骤来，您可以按照格式输入您的项目名称，选择**Use blog template**。

```
# 使用 npm 创建一个新项目
npm create astro@latest
```

![step1](https://img.danarnoux.com/posts/how-to-build-step1.png)

2.项目创建好后，也就是当你的可以输入了，例如出现了例如，这边有个光标一直在闪

```
C:\Users\Dan>
```

3.接下来你cd进你的项目，例如我的项目文件夹叫做astro-blog，所以我在命令行内输入。cd进入对应文件夹后就安装依赖就行了，大概率不需要换源，既然您能看到我的博客网站了，那您的网络环境应该是满足条件的。

```
F:\project\Blog>cd astro-blog

F:\project\Blog\astro-blog>npm install
```

到这里其实本地就能跑起来了，你可以先试一下：

```
npm run dev
```

浏览器打开 `http://localhost:4321/`，看到页面正常就可以进入下一步了。

------

## 部署到 GitHub Pages

### 先准备账号和工具（新手建议按顺序来）

#### 1. 注册 GitHub 账号

1. 打开 [https://github.com/](https://github.com/)。
2. 点击右上角 `Sign up`。
3. 输入邮箱、密码和用户名（用户名后面会出现在你的博客网址里）。
4. 按提示做人机验证，完成邮箱验证。
5. 登录后先记住你的用户名，后面要填到仓库地址和 `site` 配置里。

> [!TIP]
>
> 如果你后面想长期维护项目，建议在 `Settings` 里把 2FA（两步验证）开一下，账号更安全。

#### 2. 安装 Git（Windows）

1. 打开官网 [https://git-scm.com/downloads](https://git-scm.com/downloads) 下载 Windows 安装包。
2. 双击安装，绝大多数选项保持默认即可，一路 `Next`。
3. 安装完成后，打开 `cmd` 或 PowerShell，执行：

```
git --version
```

看到版本号就说明安装成功。然后配置你的身份信息（只需配置一次）：

```
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

#### 3. 安装 GitHub Desktop（可选，但对新手非常友好）

如果你不想一上来就记太多命令，GitHub Desktop 是个很好的过渡工具。

1. 下载并安装：[https://desktop.github.com/](https://desktop.github.com/)
2. 打开后登录你的 GitHub 账号。
3. `File` -> `Add local repository...`，选择你的项目目录。
4. 修改代码后，在左侧看变更，填 `Summary`，点击 `Commit to main`。
5. 点击右上角 `Push origin`，把提交推送到 GitHub。

我自己日常还是命令行为主，但给刚入门的同学，我通常先推荐 Desktop，心理负担会小很多。坐上轮椅是对的，你想你不应该有什么心里负担，又没人会说你 skill issue这类的话，提升效率是第一原则，你应该专心commit，然后push，怎么方便怎么来。

### 初始化仓库并首次推送（CLI / Desktop 二选一）

如果你是第一次做这个项目，可以按下面这套来（已经有仓库的就跳过）：

先在 GitHub 网页里创建一个空仓库，然后把仓库地址替换到下面命令里。

#### 方案A：命令行（CLI）

```
git init
git add .
git commit -m "init astro blog"
git branch -M main
git remote add origin https://github.com/<你的GitHub用户名>/<你的仓库名>.git
git push -u origin main
```

#### 方案B：GitHub Desktop（图形界面）

1. 在 GitHub Desktop 里 `Add local repository` 选择你的项目目录。  
2. 首次提交填一个说明，例如 `init astro blog`。  
3. 点击 `Publish repository`，输入仓库名并发布到 GitHub。  
4. 以后每次更新就是 `Commit` + `Push origin`。  

我自己的建议是仓库名尽量简单一点，全小写，后续配置 `base` 的时候不容易输错。
![step1](https://img.danarnoux.com/posts/how-to-build-step4.png)

### 参考我的博客项目：先 clone 再改成你自己的

如果你是想直接参考我这套项目结构来学习，最快方式就是先把我的仓库 clone 到本地：

```
git clone https://github.com/Dancncn/DansBlog.git
cd DansBlog
npm install
npm run dev
```

本地跑起来后，你会在 `http://localhost:4321/` 看到完整博客。

项目地址也放在这里，方便你直接点开：

[https://github.com/Dancncn/DansBlog](https://github.com/Dancncn/DansBlog)

如果这篇教程或这个项目对你有帮助，欢迎顺手点个 `Star`，这对我真的很有鼓励作用。

接着你要把它改成你自己的仓库，流程如下：

1. 在你自己的 GitHub 账号下新建一个空仓库（例如 `my-blog`）。  
2. 修改 `astro.config.mjs` 里的这两项：  
`site: 'https://<你的用户名>.github.io'`  
`base: '/<你的仓库名>/'`
3. 把远程地址改成你自己的：

```
git remote set-url origin https://github.com/<你的用户名>/<你的仓库名>.git
git push -u origin main
```

4. 到 GitHub 仓库 `Settings -> Pages`，把 Source 设为 `GitHub Actions`。
5. 等待 Actions 跑完，你就可以通过：
`https://<你的用户名>.github.io/<你的仓库名>/` 访问到你自己的博客。

### 配置 Astro 的 site 和 base（这一步很关键）

如果你部署的是项目仓库（例如 `https://<用户名>.github.io/<仓库名>/`），Astro 里一定要配 `base`，不然静态资源路径很容易 404。

`astro.config.mjs` 可以像这样：

```js
const REPO_BASE = '/<你的仓库名>/';

export default defineConfig({
  site: 'https://<你的GitHub用户名>.github.io',
  base: REPO_BASE,
  trailingSlash: 'always',
  output: 'static',
});
```

如果你用的是用户主页仓库（仓库名就是 `<用户名>.github.io`），那通常 `base` 可以写 `/`。

### 用 GitHub Actions 自动部署

我个人比较喜欢自动化，push 一次就发布一次，省心很多。  
在项目里新建文件：`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - uses: actions/configure-pages@v5
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

你如果是直接用 Astro 的 blog 模板，很多时候这份文件本来就有，可以先看一眼再决定要不要改。

### 打开 GitHub Pages

1. 进入你的仓库，点击 `Settings`。  
2. 左侧找到 `Pages`。  
3. `Source` 选择 `GitHub Actions`。  
4. 回到 `Actions` 页面等工作流跑完。

跑完后一般就能在下面这个地址看到你的网站：

![step1](https://img.danarnoux.com/posts/how-to-build-step3.png)

`https://<你的GitHub用户名>.github.io/<你的仓库名>/`

### 我自己踩过的几个坑

1. 页面能打开，但 CSS 全丢了：`base` 配错了。  
2. 图片 404：Markdown 里图片路径写错，尽量用相对路径。  
3. Action 失败：看日志通常就是依赖没装好或者 Node 版本不对。  
4. 刚部署访问 404：等 1-2 分钟，GitHub Pages 有时候会慢一点。  
5. 代码推上去了但页面没更新：你可能推到了别的分支，不是 `main`。  
6. 本地能跑，线上白屏：`site` 和 `base` 组合不对，静态资源路径全偏了。  
7. 用中文路径或带空格路径建项目：某些脚本在 Windows 下容易出玄学问题，建议英文目录。  
8. `npm install` 很慢甚至卡死：先检查网络，再考虑换镜像源，不要一上来就怀疑项目坏了。  
9. 改完配置忘记重启 dev server：有些配置（比如 `astro.config.mjs`）必须重启才生效。  
10. 图片文件名随手改大小写：Windows 不敏感、GitHub Pages（Linux）敏感，最后线上 404。  
11. 直接在 GitHub 网页端乱改配置文件：很容易和本地冲突，最好本地改完再统一 push。

## 部署到 Cloudflare Pages（推荐：更强 CDN + 更少运维）

如果你已经把 GitHub Pages 跑通了，这一节可以看成“同一个 Astro 项目，换一条更省心的发布链路”。我自己后来长期用下来，Cloudflare Pages 在部署体验和可维护性上都更顺手。

### 为什么考虑 Cloudflare Pages（对比 GitHub Pages）

- 全球 CDN：静态资源分发节点更多，国际访问通常更稳。
- 自动 HTTPS：默认证书和 TLS 配置都省掉了。
- 自动构建部署：连好仓库后，每次 push 自动构建上线。
- 性能与安全：缓存、压缩、基础安全策略都比较完善。
- 未来可扩展：后面要接 Functions/Workers，或者用 D1/KV/R2，也能在同一生态里继续长。

对可访问性这件事我说结论：国际访问通常会显著更好；中国大陆地区通常也比 GitHub Pages 更“可用”，但它不是“国内 CDN 同等级稳定性”的承诺，这两件事要分开看。

### 从 0 开始部署步骤（注册到上线）

1. 注册并登录 Cloudflare，进入 Dashboard。
2. 在左侧菜单进入 `Workers & Pages`。
3. 选择 `Pages`。如果你看到新版界面，入口可能在 `Looking to deploy Pages? Get started` 这类提示里。
4. 点击 `Import an existing Git repository`，按提示连接 GitHub，授权后选择你的博客仓库。
5. 在 Build settings 里填这四个关键项：
   - `Framework preset`: `Astro`
   - `Build command`: `npm run build`
   - `Build output directory`: `dist`
   - `Production branch`: `main`
6. 点击部署，等构建完成后先用 `xxx.pages.dev` 域名访问。

第一次部署建议先别急着绑定自定义域名，先把默认域名验收跑通，排错成本最低。

### 必踩坑：base 路径导致样式丢失（以及如何修）

最常见现象是：页面能打开，但样式全没了，像一页蓝色链接的纯 HTML。根因通常是你之前给 GitHub Pages 写死了 `base: '/DansBlog/'`，Cloudflare 继续用这套路径后，资源地址就错了。

`astro.config.mjs` 推荐改成按环境自动切换：

```js
import { defineConfig } from 'astro/config';

const isCfPages = process.env.CF_PAGES === '1';
const isGithubProd = !isCfPages && process.env.NODE_ENV === 'production';

const base = isCfPages ? '/' : isGithubProd ? '/DansBlog/' : '/';

export default defineConfig({
  site: 'https://your-domain-or-pages-domain',
  base,
  trailingSlash: 'always',
  output: 'static',
});
```

这段配置对应的行为是：

- Cloudflare 构建（`CF_PAGES=1`）：`base = '/'`
- GitHub Pages 生产构建：`base = '/DansBlog/'`
- 本地 `npm run dev`：`base = '/'`

再补一个习惯：页面里尽量不要写死 `"/DansBlog"` 这类前缀，优先用 `import.meta.env.BASE_URL` 或相对路径，不然后面平台一换就炸。

### 验收方法（本地模拟 + 线上检查）

先在本地模拟 Cloudflare 构建（Windows CMD）：

```cmd
set CF_PAGES=1
npm run build
npx astro preview
```

然后访问本地预览地址，检查首页和文章页是否正常加载样式。

可选：再模拟 GitHub Pages 生产构建（Windows CMD）：

```cmd
set CF_PAGES=
set NODE_ENV=production
npm run build
npx astro preview
```

然后用 `http://localhost:4321/DansBlog/` 这类路径做一次回归检查，确认两边都兼容。（PowerShell 可用 `$env:CF_PAGES='1'` 这种写法，但这里默认按 CMD 流程走。）

线上验收（`pages.dev`）我会做这几步：

1. 打开首页、文章页、标签页、分页页。
2. 按 `F12` 打开 DevTools，在 Network 里过滤 `404`，结果应为 `0`。
3. `View page source` 搜索 `"/DansBlog"`，Cloudflare 版本里不应该出现。

### pages.dev 默认域名与自定义域名

Cloudflare Pages 会给你一个默认免费域名（`xxx.pages.dev`），这个可以直接用来上线和验收。项目名改变后，子域名前缀通常也会跟着变化。

如果你想用自己的域名，结论也很直接：通常需要先有自己的域名，然后在 Pages 项目里绑定自定义域名。DNS 细节这里不展开，但流程上就是“先买域名，再在 Pages 里绑定”。

### 面向大陆与国际用户的可达性建议（务实）

这块我不说大话，直接给实操建议：

1. 国际访问：Cloudflare Pages 通常明显优于 GitHub Pages。
2. 大陆访问：通常会比 GitHub Pages 更可用，但它不等同于国内商业 CDN 的稳定性上限。
3. 字体、图片、脚本尽量自托管，减少第三方外链（尤其 Google Fonts 这类跨境依赖）。
4. 静态资源配合 hash 文件名做强缓存，让重复访问更快。
5. 图片优先走你自己的站点资源；如果后面有对象存储需求，可以考虑接 R2。

------

## 小结

到这一步其实你已经完成了一套很实用的流程：本地写作 -> `git push` -> GitHub 自动构建并发布。  
后面你要做的就是持续写内容，然后慢慢把样式打磨成你喜欢的样子。  
技术是骨架，内容才是灵魂。先让它跑起来，再让它变好看。

我希望您可以没有心理负担，可以尝试使用aicode来协助您的工作，这对您的工作效率大大的提升，比方说本站我第一天只用了4小时就实现了基本的Home，blog，about页面可以拿来展示了，第二第三天则是花费一些时间进行精修和移动端适配。但不要忘了自己做博客网站的初心，一切目的以实现博客正常发布阅读功能为主，增加其他花样功能则是自己的情趣，愿不愿意在下面折腾时看你自己。

