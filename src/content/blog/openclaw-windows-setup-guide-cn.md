---
title: "OpenClaw Windows 安装与配置教程（MiniMax / Qwen / Ollama）"
description: "详细介绍如何在 Windows 上安装和配置 OpenClaw，并接入 MiniMax、Qwen 等云端大模型，或通过 Ollama 运行本地模型。"
pubDate: 2026-03-10
updatedDate: 2026-03-10
lang: "cn"
author: "Dan"
group: "openclaw-windows-setup-guide"
tags: ["OpenClaw", "AI", "MiniMax", "Qwen", "Ollama", "OpenRouter", "OpenAI", "教程"]
---

## 前言

我一直都在思考我到底要不要做一个Openclaw的部署教程，因为Openclaw中文站的内容已经很详细了，但是我意识到大家可能并不知道有这个中文站的存在另外就是跟着这个教程做还是看不懂。最近Openclaw真是在国内的热度简直过热，有点过誉了，一代人有一代人的气功热。但是我还是坚持做一个比较详细的教程你自己部署体验一下，因为一个产品到底怎么样，你自己用体验后才知道、说实话有个自己的贾维斯这种概念还是很吸引人的。

------

## 1. 什么是 OpenClaw？

先简单介绍一下，**OpenClaw**（以前叫 Clawdbot，现在改名前还挺有意思的）是一个开源的 AI Agent 框架。简单来说，你可以把它理解成一个「AI 操作系统」—— 它本身不提供 AI 能力，但它能帮你调用各种大模型，帮你完成各种任务。

![Openclaw官网](https://img.danarnoux.com/posts/openclaw-windows-setup-guide/step2.webp)

和普通的聊天机器人不一样，OpenClaw 能做的事情更多：

- 操作文件系统
- 执行命令。
- 编写和调试代码
- 搜索信息
- 接入飞书、Telegram 等通讯工具

你只需要给它配上合适的模型，它就能帮你干活。

------

## 2. OpenClaw 工作原理

先理清一个概念：**OpenClaw 只是一个「壳」，模型得你自己接入**。

工作流程大概是这样的：

```
你（输入） → OpenClaw → AI 模型 → 返回结果
```

你可以选择接入：

- **云端模型**：MiniMax、Qwen（阿里云百炼）、OpenAI、Claude 等
- **本地模型**：通过 Ollama 在本地运行的模型

两种方案各有优劣，后面会详细说。

> **提示**：本文档包含专门章节讲解如何配置 Ollama 本地模型，请参见第 5.8 节。

------

## 3. 部署方式与模型方案

> **官方文档**：如果想了解更多高级配置，可以参考 [OpenClaw 中文文档](https://docs.openclaw.ai/zh-CN)。

在开始安装之前，先了解两种部署方式和模型方案的选择。

### 3.1 部署方式说明

OpenClaw 有两种部署方式：

| 部署方式 | 说明 | 适用场景 |
|----------|------|----------|
| **本地部署** | 在自己的 Windows 电脑上运行 | 个人使用、隐私优先、低成本 |
| **远程服务器** | 在云服务器上运行（如 Linux 服务器） | 多用户共享、7×24 小时运行 |

**本教程聚焦本地部署**——在你自己 的 Windows 电脑上运行 OpenClaw。因为存在一个问题，虽然远程服务器部署很方便，厂商都帮你一件配置好了，但是你可能其实想要的是私人电脑管家贾维斯，虽然这会有更多的风险，但你自己会权衡承担的。

### 3.2 选哪种模型方案？

在开始安装之前，先决定你要用哪种模型方案。这会影响后面的配置步骤。

### 云端 API（推荐新手）

调用云端模型的 API，按调用量付费（一般都有免费额度）。

| 模型商 | 推荐模型 | 特点 |
|--------|----------|------|
| **MiniMax** | M2.5 | 性价比高，中文优化好 |
| **Qwen** | qwen/qwen3-coder / qwen/qwen3-vl | 编程能力强，阿里云免费额度够用 |

qwen3-coder 是阿里推出的编程优化模型。
| **OpenAI** | GPT-5 系列模型 | 综合能力强 |

**优点**：不需要显卡，响应快，能力有保障
**缺点**：需要付费（但通常有免费额度）

### 本地模型（Ollama）

在自己电脑上运行模型，完全免费，但需要硬件配置。

**优点**：零成本，隐私好
**缺点**：对显卡有要求，响应速度取决于硬件

说实话大部分情况你的电脑是运行不了的，你可以查看一下你电脑的GPU是什么配置，我给实验室的工作站都没有选择Ollama方案，首先的问题就是你不能因为显存够能跑而忽略速度，其次是你想我这配置已经相当的强大了，但我也没选择Ollama方案。选择API方案蛮好的，就是花点钱。![](https://img.danarnoux.com/posts/openclaw-windows-setup-guide/step1.webp)

> **我的建议**：新手直接用远程 API，MiniMax 或 Qwen 都不错，配好了 5 分钟就能用上。

### 3.3 如何选择合适的大模型？

选择大模型主要看以下几个因素：

| 因素 | 说明 |
|------|------|
| **价格** | 云端 API 按调用量付费，不同模型价格差异大 |
| **速度** | 响应速度取决于模型大小和网络 |
| **上下文长度** | 能处理多长的文本，越长越贵 |
| **编程能力** | 某些模型专门针对编程优化 |
| **推理能力** | 复杂问题的解决能力 |

#### 使用 OpenRouter 排行榜

OpenRouter 提供了便捷的 [模型排行榜](https://openrouter.ai/rankings)，你可以根据以下维度筛选：

- **性能（Performance）**：模型的综合 benchmark 分数
- **价格（Price）**：按输入/输出价格排序
- **上下文长度（Context Length）**：支持的最大 token 数
- **延迟（Latency）**：响应速度

![](https://img.danarnoux.com/posts/openclaw-windows-setup-guide/step3.webp)

在 OpenRouter 网站上搜索具体模型，可以查看：

- **Benchmarks**：各项能力评分

- **Pricing**：输入和输出价格

- **Context Length**：支持的上下文长度

  ![](https://img.danarnoux.com/posts/openclaw-windows-setup-guide/step4.webp)

> **注意**：不同排行榜的评估方式可能不同。例如，一些排行榜更强调编程 benchmark，而忽略了多模态能力或长上下文能力。因此排名只能作为参考。

以及存在一个问题，你不能因为模型能力而忽视了价格，到时候看看账单人傻了![](https://img.danarnoux.com/posts/openclaw-windows-setup-guide/step5.webp)

**综合表现优秀的模型推荐**：

| 模型 | 特点 |
|------|------|
| GPT-5系列 | 综合能力强，适合各种场景 |
| Claude 4 Sonnet系列 | 长上下文能力强，适合处理长文本 |
| qwen/qwen3-coder | 编程能力强，免费额度充足 |
| DeepSeek V3 / V3.2 | 综合能力强，性价比好 |
| Gemini 3 Flash系列 | 速度快，价格便宜 |
| Gemini 系列 | 综合能力强，多模态任务表现优秀 |

#### 编程模型推荐

如果你主要用 OpenClaw 来**辅助编程**，以下是各模型的表现：

**能力最强的编程模型**：
- **Claude Opus**（包括 Claude 4 Opus系列）在编程任务中通常表现非常优秀
- 但有以下限制：
  - 价格较高
  - 国内访问可能不稳定
  - 中文优化不如国内模型

> 如果你感兴趣，可以查看 [OpenClaw 官方 Anthropic 配置文档](https://docs.openclaw.ai/zh-CN/providers/anthropic)。

**对国内用户更实用的选择**：

| 模型 | 特点 |
|------|------|
| **MiniMax M2.5** | 中文理解好，性价比高 |
| **qwen/qwen3-coder** | 阿里云编程专用模型，免费额度充足 |
| **DeepSeek V3 / V3.2** | 综合能力强，性价比好 |

DeepSeek V3 / V3.2 是目前 DeepSeek 系列的主力模型，综合能力优秀。

> **总结**：如果你的网络条件允许且预算充足，Claude Opus 是最强的选择。否则，MiniMax M2.5、qwen/qwen3-coder 或 DeepSeek V3/V3.2 是更实用的方案。

**Google Gemini 系列**在综合能力和多模态任务方面也非常强。例如 Gemini 生态中的 **Nano Banana** 图像模型，在图形生成和视觉内容创作领域表现非常优秀。如果你的需求涉及图像生成或多模态理解，可以考虑 Gemini 系列。

> **提示**：新手推荐从 MiniMax 或 Qwen 开始，配好 5 分钟就能用上。

------

## 4. Windows 安装步骤

### 新手快速安装（推荐）

如果你只是想**快速体验 OpenClaw**，可以直接使用官方提供的快速安装方式。两步就能搞定！

**步骤 1：安装 OpenClaw**

```powershell
npm install -g openclaw@latest
```

**步骤 2：运行新手引导**

```powershell
openclaw onboard --install-daemon
```

这个命令会自动完成以下操作：

- 初始化 OpenClaw 配置
- 安装 Gateway 服务
- 创建默认配置文件
- 启动 OpenClaw 服务

**是的，你没看错，只需要这两条命令，就可以完成基础安装！**

安装完成后，你可以：

1. **运行交互式对话**：`openclaw`
2. **打开 Web 界面**：`openclaw dashboard`
3. **配置模型**：按第 5 章的说明，给 OpenClaw 配上你喜欢的模型

> **官方文档**：如果你想了解更多详细内容，可以参考 [OpenClaw 官方中文文档](https://docs.openclaw.ai/zh-CN)，特别是其中的 **快速开始（Quick Start）** 部分。

---

**如果你想了解 OpenClaw 的完整安装过程和每一步的作用**，可以继续阅读下面的进阶安装教程。

---

下面正式开始安装，按顺序来就行。

### 4.1 准备环境

你需要先装好 **Node.js**（推荐 LTS 版本，22 及以上）。

#### 安装 Node.js

**方法一：直接安装**

1. 访问 [Node.js 官网](https://nodejs.org/zh-cn/download)
2. 下载 Windows Installer (.msi)
3. 一路 Next 就行
4. 如果出现了网络问题之类的，参考我的另一篇文章的教程内容 [node.js的详细安装步骤](https://danarnoux.com/blog/how-to-build-a-personal-blog-cn/#%E5%AE%89%E8%A3%85)。

**方法二：nvm（推荐，方便管理多版本）**

```powershell
# 安装 nvm for Windows
# 访问 https://github.com/coreybutler/nvm-windows/releases 下载

# 安装后，在 PowerShell 中运行：
nvm install 22
nvm use 22
```

验证一下：

```powershell
node -v
# 应该显示 v22.x.x

npm -v
# 应该显示 8.x.x
```

#### 切换 npm 镜像（国内用户建议）

```powershell
npm config set registry https://registry.npmmirror.com
```

#### 安装 Git（可选但建议）

有些技能依赖 Git，建议安装一个：

- 访问 [Git 官网](https://git-scm.com/download/win)
- 如果有配置问题，可以参考我这篇文章的内容 [Git配置](https://danarnoux.com/blog/how-to-get-started-with-programming-cn/#42-git-%E5%AE%89%E8%A3%85%E4%B8%8E%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AEwindows-%E4%B8%BB%E7%BA%BF--mac-%E6%94%AF%E7%BA%BF)
- 下载安装，一路 Next

### 4.2 修改执行策略

Windows 默认不让跑脚本，得先改一下设置。以**管理员身份**打开 PowerShell，运行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

输入 `Y` 确认。

### 4.3 运行安装脚本

现在可以装 OpenClaw 了。在 PowerShell 中执行：

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

等一会儿，脚本会自动：

- 检测 Node.js 环境
- 下载安装 OpenClaw
- 配置路径

出现 **「OpenClaw installed successfully」** 就说明装好了。

### 4.4 初始化向导

第一次运行会进入向导：

```powershell
openclaw onboard
```

流程大概是这样的：

1. 风险提示 → 输入 `yes`
2. 配置模式 → 选择 `QuickStart`
3. 模型选择 → 先跳过，后面手动配
4. 渠道选择 → 先跳过
5. 技能包 → 选择 `No`

### 4.5 验证安装

装好了可以验证一下：

```powershell
# 查看版本
openclaw --version

# 检查状态
openclaw status

# 体检
openclaw doctor

# 打开 Web 面板
openclaw dashboard
```

`openclaw dashboard` 会启动一个本地网页，默认 `http://localhost:8080`，可以在浏览器里可视化配置。

------

## 5. 配置 AI 模型

装好了不代表能用，你得给它接个模型。下面分别说几种主流方案。

> **官方文档**：如果你想了解更多配置细节，可以参考 [OpenClaw 官方中文文档](https://docs.openclaw.ai/zh-CN)，里面有更详细的 provider 配置指南和故障排查说明。

### 5.1 配置前必看：API 概念解释

在配置模型之前，先解释几个关键概念：

| 概念 | 说明 | 示例 |
|------|------|------|
| **Provider（服务商）** | 提供 AI 模型服务的公司或平台 | MiniMax、阿里云、OpenRouter |
| **Base URL** | API 服务器的地址 | `https://api.minimaxi.com/v1` |
| **API Key** | 访问 API 的密钥，相当于"密码" | `sk-xxxxxx` |
| **Model ID** | 具体模型的名字 | `MiniMax-M2.5`、`qwen-plus` |
| **Config JSON** | 配置信息的 JSON 格式 | 包含上述字段的结构化配置 |

**为什么要配置这些？**

OpenClaw 需要知道：
1. 去哪里找模型（Base URL）
2. 用什么凭证访问（API Key）
3. 使用哪个具体模型（Model ID）

#### 推荐：使用 cc-switch 管理多个 Provider

如果你计划配置多个模型服务商，推荐使用 **cc-switch** 来管理：

- **多 Provider 管理**：一个界面管理所有 API 配置
- **一键切换**：随时切换不同模型，无需手动改配置
- **环境变量自动配置**：OpenClaw 会自动读取 cc-switch 设置的环境变量

> **提示**：cc-switch 的详细介绍见第 6 章。如果你不想手动配置，可以先跳过本章的 provider 配置，直接阅读 cc-switch 部分。

#### 配置方式总览

配置模型有三种方式：

| 方式 | 难度 | 适用人群 |
|------|------|----------|
| **方法一：CLI 命令** | 中等 | 熟悉命令行的用户 |
| **方法二：修改配置文件** | 较难 | 需要批量配置的用户 |
| **方法三：Web 页面配置（推荐）** | 简单 | 新手用户 |

如果你不熟悉命令行，**推荐使用 Web 页面配置**（方法三），可视化界面更容易上手。内容在5.8下面可以细节查阅。

### 5.2 配置 MiniMax

MiniMax 的 M2.5 挺好用的，性价比高。

#### 获取 API Key

1. 访问 [MiniMax 开放平台](https://platform.minimaxi.com/)
2. 注册账号 → 实名认证
3. 进入「API Keys」→ 创建 Key
3. **复制保存**，只看一次

#### 配置命令

```powershell
# 配置 MiniMax
openclaw config set 'models.providers.minimax' --json '{
  "baseUrl": "https://api.minimaxi.com/v1",
  "apiKey": "你的MiniMax_API_Key",
  "api": "openai-completions",
  "models": [
    { "id": "MiniMax-M2.5", "name": "MiniMax M2.5" },
    { "id": "MiniMax-M2.5-highspeed", "name": "MiniMax M2.5 高速版" }
  ]
}'

# 设为默认模型
openclaw models set minimax/MiniMax-M2.5
```

#### 更安全的做法：环境变量

把 Key 存环境变量里，避免写在配置里：

```powershell
# 临时设置（当前终端有效）
$env.MINIMAX_API_KEY = "你的Key"

# 或者永久设置
[System.Environment]::SetEnvironmentVariable("MINIMAX_API_KEY", "你的Key", "User")
```

配置时用 `$MINIMAX_API_KEY` 代替实际 Key。

#### MiniMax Coding Plan（推荐编程用户）

如果你主要用于编程，MiniMax 提供了专门的 **Coding Plan**，性价比更高。

**获取 API Key 并开通 Coding Plan**：

1. 访问 [MiniMax 开放平台](https://platform.minimaxi.com/)
2. 注册账号 → 实名认证
3. 进入「API Keys」→ 创建 Key
4. 进入「Coding Plan」页面，开通 Coding Plan
5. **复制保存** API Key

**配置命令**：

```powershell
# 配置 MiniMax Coding Plan
openclaw config set 'models.providers.minimax' --json '{
  "baseUrl": "https://api.minimaxi.com/v1",
  "apiKey": "你的MiniMax_API_Key",
  "api": "openai-completions",
  "models": [
    { "id": "MiniMax-M2.5", "name": "MiniMax M2.5" },
    { "id": "MiniMax-M2.5-highspeed", "name": "MiniMax M2.5 高速版" }
  ]
}'

# 设为默认模型
openclaw models set minimax/MiniMax-M2.5
```

> **提示**：Coding Plan 通常有更低的调用价格，适合高频使用的用户。

### 5.3 配置阿里云 Model Studio

阿里云 Model Studio 是阿里云提供的大模型服务平台，通过它可以使用 Qwen 等模型。除了标准版，还有专门的 **Coding Plan** 适合编程用户。

#### 获取 API Key

1. 访问 [阿里云 Model Studio](https://modelscope.cn/)
2. 注册账号 → 实名认证
3. 进入「API Keys」→ 创建 Key
4. **复制保存**

#### 开通 Coding Plan（推荐编程用户）

1. 访问 [阿里云百炼](https://bailian.aliyun.com/)
2. 进入「Coding Plan」页面
3. 开通 Coding Plan
4. 获取专门的 Coding Plan API Key

#### 配置命令

**标准版**：

```powershell
# 配置阿里云 Model Studio
openclaw config set 'models.providers.qwen' --json '{
  "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "你的阿里云API_Key",
  "models": [
    { "id": "qwen/qwen3-coder", "name": "Qwen Coder Model" },
    { "id": "qwen-portal/vision-model", "name": "Qwen Vision Model" },
    { "id": "qwen-plus", "name": "Qwen Plus" },
    { "id": "qwen-max", "name": "Qwen Max" }
  ]
}'

# 设为默认
openclaw models set qwen/qwen/qwen3-coder
```

**Coding Plan 版**（如果用的是阿里云 Coding Plan）：

```powershell
openclaw config set 'models.providers.qwen' --json '{
  "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
  "apiKey": "你的Coding_Plan_Key",
  "models": [
    { "id": "qwen3-max-2026-01-23", "name": "Qwen3 Max" },
    { "id": "MiniMax-M2.5", "name": "MiniMax M2.5" }
  ]
}'
```

> **提示**：Coding Plan 通常有更低的调用价格或免费额度，适合高频编程的用户。

### 5.4 配置 OpenRouter

OpenRouter 是一个聚合了上百种 AI 模型的平台，通过它可以用一个 API Key 访问 GPT、Claude、DeepSeek 等多种模型。

#### 获取 API Key

1. 访问 [OpenRouter 官网](https://openrouter.ai/)
2. 注册账号
3. 进入「API Keys」→ 创建 Key
4. **复制保存**，只看一次

#### 配置命令

```powershell
openclaw config set 'models.providers.openrouter' --json '{
  "baseUrl": "https://openrouter.ai/api/v1",
  "apiKey": "你的OpenRouter_API_Key",
  "models": [
    { "id": "openai/gpt-5", "name": "GPT-5" },
    { "id": "anthropic/claude-4-sonnet", "name": "Claude 4 Sonnet" },
    { "id": "deepseek/deepseek-v3", "name": "DeepSeek V3" },
    { "id": "google/gemini-3-flash", "name": "Gemini 3 Flash" }
  ]
}'

# 设为默认
openclaw models set openrouter/openai/gpt-5
```

> **注意**：OpenRouter 上的模型 ID 格式和直接调用时不太一样，格式是 `提供商/模型名`，如 `openai/gpt-5`、`anthropic/claude-4-sonnet`。

> **参考**：你可以访问 [OpenRouter 排行榜](https://openrouter.ai/rankings) 查看各模型的评分和价格排名，作为选择参考。

### 5.5 配置 SiliconFlow

SiliconFlow（硅基流动）是国内的一个 AI 模型聚合平台，提供多种模型接口，对国内用户比较友好。

#### 特点

- **国内访问速度快**：服务器在国内，延迟低
- **模型种类多**：支持 Qwen、DeepSeek、Llama 等多种模型
- **价格实惠**：按量计费，有免费额度

#### 配置参考

详细配置教程请参考官方文档：

> [SiliconFlow 官方配置指南](https://docs.siliconflow.cn/cn/usercases/use-siliconcloud-in-OpenClaw)

基本步骤：
1. 访问 [SiliconFlow 官网](https://www.siliconflow.cn/) 注册账号
2. 获取 API Key
3. 参考官方文档配置 provider

### 5.6 配置 OpenAI

如果你有 OpenAI 的 API Key，可以直接配置。

#### 获取 API Key

1. 访问 [OpenAI 平台](https://platform.openai.com/)
2. 进入「API Keys」→ 创建 Key
3. 复制保存

> **注意**：国内用户可能需要科学上网才能访问 OpenAI。

#### 配置命令

```powershell
openclaw config set 'models.providers.openai' --json '{
  "apiKey": "你的OpenAI_API_Key",
  "models": [
    { "id": "gpt-5", "name": "OpenAI GPT-5" },
    { "id": "gpt-4o", "name": "GPT-4o" },
    { "id": "gpt-4o-mini", "name": "GPT-4o Mini" }
  ]
}'

# 设为默认
openclaw models set openai/gpt-5
```

### 5.7 配置 Qwen OAuth（推荐）

Qwen OAuth 是最推荐的配置方式，因为它有**免费额度**，而且不需要手动获取 API Key，直接用阿里云账号授权就行。

#### 配置步骤

1. 运行配置向导：
   ```powershell
   openclaw onboard
   ```

2. 选择模型服务商时，选择 **Qwen**

3. 选择 **Qwen OAuth**

4. 会弹出一个浏览器窗口，让你用阿里云账号登录授权

5. 授权成功后，选择想用的模型：
   - `qwen/qwen3-coder`：编程专用
   - `qwen-portal/vision-model`：视觉理解

#### 手动配置（如果向导失败）

```powershell
# 运行 OAuth 授权
openclaw config set oauth qwen
```

这会打开浏览器让你完成授权流程。授权完成后，配置会自动保存。

### 5.8 配置 Ollama 本地模型

如果你有显卡，想在本地跑模型（零 API 费用），可以使用 Ollama。

> **重要概念**：Ollama 负责在本地运行模型，而 OpenClaw 需要通过 **Gateway** 来连接 Ollama。

#### 5.8.1 安装 Ollama

1. 访问 [Ollama 官网](https://ollama.com/)
2. 下载 Windows 版本
3. 运行安装包，自动启动

> **如果访问 Ollama 官网异常**，可以尝试以下国内镜像源：
> - https://www.newbe.pro/Mirrors/Mirrors-ollama
> - https://ollama.ruanmao.net/

Ollama 默认监听 `http://localhost:11434`。

> **中国用户推荐**：如果你在中国大陆使用，下载模型时可能会遇到速度慢或连接不稳定的问题。建议配置国内镜像源（见下文），可以大幅提升下载速度。

##### 配置国内镜像源（可选，中国用户推荐）

**国内镜像源列表**：

| 镜像站 | 地址 |
|--------|------|
| 魔搭社区 | https://ollama.modelscope.cn |
| DeepSeek | https://ollama.deepseek.com |
| 浙江大学 | https://ollama.zju.edu.cn |
| 国内整理站 | https://www.newbe.pro/Mirrors/Mirrors-ollama |

配置方法（Windows）：

```cmd
# 临时生效
set OLLAMA_HOST=https://ollama.modelscope.cn

# 永久生效
setx OLLAMA_HOST https://ollama.modelscope.cn
```

Linux / macOS：

```bash
export OLLAMA_HOST=https://ollama.modelscope.cn
```

配置完成后，可以使用 `ollama pull qwen3` 等命令下载模型。如果下载成功，说明镜像源已生效。

> **小提示**：如果某个镜像下载失败，可以尝试更换其他镜像源。

#### 5.8.2 下载模型

> **显存说明**：模型越大，需要的显存越多。3B 模型约需 4-6GB 显存，8B 模型约需 8-12GB 显存。根据你的显卡选择合适的模型。

**根据你的电脑配置选择**：

| 电脑配置 | 推荐模型 |
|----------|----------|
| 入门级（无独显或显存 < 4GB） | phi3:mini、qwen2.5:1.8b |
| 主流配置（4-6GB 显存） | qwen2.5:3b、qwen2.5-coder:3b、qwen3:4b |
| 中高端配置（8GB+ 显存） | qwen3:8b、qwen3:14b |

> **提示**：如果 Ollama 尚未支持 Qwen3，Qwen2.5 仍然是很好的替代选择。

```powershell
# 查看有哪些模型
ollama list

# 入门级模型（CPU 也能跑）
ollama pull phi3:mini

# 主流配置 - 对话模型（推荐）
ollama pull qwen2.5:3b

# 主流配置 - 编程模型
ollama pull qwen2.5-coder:3b

# 中高端配置 - 更强能力
ollama pull qwen3:8b
```

> **提示**：如果显存不够，Ollama 会自动使用量化版本，或者你可以手动拉取量化版本，如 `qwen2.5:3b-q4_K_M`，占用更少显存。

#### 5.8.3 配置 OpenClaw 连接 Ollama

配置 OpenClaw 通过 Gateway 连接本地 Ollama：

```powershell
openclaw config set 'models.providers.ollama' --json '{
  "baseUrl": "http://localhost:18789/v1",
  "apiKey": "ollama-local",
  "models": [
    { "id": "qwen2.5:3b", "name": "Qwen 2.5 3B" },
    { "id": "qwen2.5-coder:3b", "name": "Qwen 2.5 Coder 3B" },
    { "id": "qwen3:8b", "name": "Qwen 3 8B" },
    { "id": "phi3:mini", "name": "Phi-3 Mini" }
  ]
}'

# 设为默认（推荐 3B 模型，8GB+ 显存可用 qwen3:8b）
openclaw models set ollama/qwen2.5:3b
```

> **注意**：这里 Gateway 的地址是 `http://localhost:18789`（你启动 Gateway 时指定的端口），而不是直接连接 Ollama 的 `11434` 端口。这样 OpenClaw 可以统一管理所有模型连接。

#### 5.8.4 什么是 Gateway？

Gateway（网关）是 OpenClaw 的**后台服务**，你可以把它理解成一个"翻译官"——OpenClaw 通过它和各类模型对话。

简单来说：

- Gateway 负责**统一管理**各种模型的连接
- Gateway 负责**处理身份验证**
- Gateway 负责**转发请求**到不同的模型供应商

**工作架构图**：

```
你
   ↓
OpenClaw CLI（你输入命令的地方）
   ↓
Gateway（网关，负责连接管理）
   ↓
模型供应商
(MiniMax / Qwen / OpenRouter / Ollama)
```

> **为什么需要 Gateway？** OpenClaw 通过 Gateway 这个统一的入口，可以方便地连接各种不同的模型供应商，不需要为每个模型单独配置连接方式。

#### 5.8.5 安装 Gateway

OpenClaw 安装时通常会自动包含 Gateway。如果需要单独安装：

```powershell
npm install -g @openclaw/gateway
```

#### 5.8.6 启动 Gateway

Gateway 是 OpenClaw 的核心运行进程，负责：
- 管理模型连接
- 提供 HTTP / WebSocket API
- 提供 Web 控制界面

**启动 Gateway（推荐）**

最简单的方式是运行：

```powershell
openclaw gateway run
```

这个命令会启动 Gateway 服务。启动后，默认是：

```
http监听地址://127.0.0.1:18789
```

你可以在浏览器中打开这个地址，访问 Web 控制界面来配置模型。

**常用参数**

如果需要自定义，可以使用以下参数：

| 参数 | 作用 | 示例 |
|------|------|------|
| `--port` | 指定端口号 | `--port 8080` |
| `--verbose` | 显示详细日志，方便排查问题 | `--verbose` |
| `--force` | 强制占用端口 | `--force` |

**示例**：

```powershell
# 指定端口启动
openclaw gateway run --port 8080

# 显示详细日志
openclaw gateway run --verbose

# 端口冲突时强制占用
openclaw gateway run --force
```

#### 5.8.7 高级配置（可选）

如果你想进一步自定义 Gateway：

| 选项 | 说明 |
|------|------|
| `--hot-reload` | 启用热重载，修改配置无需重启 |
| `SIGUSR1` | 发送信号重启 Gateway（Linux/macOS） |
| `--config` | 指定配置文件路径 |

示例：

```powershell
# 热重载模式
openclaw gateway --port 18789 --hot-reload
```

------

### 方法一：CLI 命令配置

使用 `openclaw config set` 命令直接配置模型参数。

```powershell
# 语法
openclaw config set 'models.提供者名称' --json '{
  "baseUrl": "https://api.example.com/v1",
  "apiKey": "你的API_Key",
  "models": [
    { "id": "模型ID", "name": "显示名称" }
  ]
}'
```

**示例**（配置 MiniMax）：

```powershell
openclaw config set 'models.providers.minimax' --json '{
  "baseUrl": "https://api.minimaxi.com/v1",
  "apiKey": "你的MiniMax_API_Key",
  "api": "openai-completions",
  "models": [
    { "id": "MiniMax-M2.5", "name": "MiniMax M2.5" }
  ]
}'
```

> **优点**：快速、适合自动化脚本
> **缺点**：需要记忆命令语法

---

### 方法二：修改配置文件

直接编辑 OpenClaw 的配置文件 `claude.json`。

配置文件位置：
- Windows: `%USERPROFILE%\.openclaw\claude.json`
- macOS/Linux: `~/.openclaw/claude.json`

**示例配置**：

```json
{
  "models": {
    "providers": {
      "minimax": {
        "baseUrl": "https://api.minimaxi.com/v1",
        "apiKey": "你的MiniMax_API_Key",
        "api": "openai-completions",
        "models": [
          { "id": "MiniMax-M2.5", "name": "MiniMax M2.5" }
        ]
      }
    }
  }
}
```

> **优点**：可批量配置、易于备份
> **缺点**：需要手动编辑 JSON 格式

---

### 方法三：通过 Web 页面配置（推荐新手）

除了命令行和配置文件，你还可以通过 **Web 界面** 来配置模型。这种方式更直观，适合新手用户。

#### 第一步：启动 Gateway

Gateway 不仅提供 API 服务，还自带 Web 控制界面。在终端运行：

```powershell
openclaw gateway run
```

这个命令会启动 Gateway 服务，并在后台运行。

#### 第二步：打开浏览器访问

Gateway 的 Web 界面默认地址是：

```
http://127.0.0.1:18789
```

在浏览器中打开这个地址，你会看到 Gateway 的管理界面。

#### 第三步：进入配置页面

在界面中找到并点击：

**Config → Models**

这里可以管理所有的模型配置。

#### 第四步：添加 Provider 配置

以添加 MiniMax 为例：

1. 点击 **Add Provider** 或类似按钮
2. 选择或填写 Provider 类型
3. 填写以下信息：

| 字段 | 值 |
|------|-----|
| **Base URL** | `https://api.minimaxi.com/v1` |
| **API Key** | 你的 MiniMax API Key |

4. 打开 **Auth Header** 选项（如果需要）
5. 填写 API Key

#### 第五步：保存配置

点击 **Save** 或 **Update** 按钮保存配置。

> **提示**：保存后，Gateway 会自动刷新配置，你可能需要重启 OpenClaw 才能生效。

这种方式的好处是：
- 可视化操作，不需要记命令
- 实时看到配置状态
- 适合不熟悉命令行的用户

------

## 6. 使用 cc-switch 管理 API（推荐）

如果你配置了多个模型 provider，每次手动改配置会比较麻烦。**cc-switch** 是一个跨平台桌面工具，可以帮你一键切换不同的 AI API 配置，支持 Claude Code、OpenClaw、Gemini 等。

### 6.1 为什么用 cc-switch？

手动管理 API Key 的问题：

- 每个 provider 都要单独配置环境变量
- 切换模型需要修改 JSON 配置
- 多个账号/供应商时容易混乱

cc-switch 的优势：

- 可视化界面，不用改命令行配置
- 一键切换 provider
- 支持 MCP 服务器管理
- 支持 Skills/Prompts 预设

### 6.2 cc-switch 的工作原理

**重要**：cc-switch 会把当前启用的 provider 配置信息写入**环境变量**。OpenClaw 启动时会自动读取这些环境变量，因此你**不需要手动编辑 OpenClaw 的配置文件**。

这就是 cc-switch 的便捷之处：你只需要在 cc-switch 中切换 provider，然后启动 OpenClaw，它就会自动使用当前配置。

### 6.3 安装 cc-switch

**Windows**：

1. 访问 [cc-switch GitHub Releases](https://github.com/farion1231/cc-switch/releases)
2. 下载 `CC-Switch-v{version}-Windows.msi` 或便携版
3. 运行安装

**macOS**：

```bash
brew tap farion1231/ccswitch
brew install --cask cc-switch
```

**Linux**：

支持 .deb、.rpm、.AppImage 等多种格式。

### 6.4 添加 Provider![](https://img.danarnoux.com/posts/openclaw-windows-setup-guide/step6.webp)

1. 启动 cc-switch
2. 点击右上角 **「+」** 或「Add Provider」
3. 选择预设的 provider（MiniMax、Qwen 等）
4. 填写你的 API Key
5. 点击「添加」

### 6.5 切换 Provider

1. 在主界面选择你想用的 provider
2. 点击「启用」
3. 重启 OpenClaw（如果正在运行）

### 6.6 OpenClaw 自动使用当前配置

cc-switch 会把当前启用的 provider 配置写入环境变量。OpenClaw 启动时会自动读取这些环境变量，所以你只需要：

```powershell
# 切换 provider 后，重启 OpenClaw
openclaw restart
# 或者
openclaw serve
```

OpenClaw 会自动使用 cc-switch 中当前启用的 API 配置。

------

## 7. 启动和使用

配好模型后，就可以用了。

```powershell
# 交互式对话
openclaw

# 启动 Web 服务
openclaw serve --port 3000

# 启动 Gateway（如未自动启动）
openclaw gateway run

# Web 面板
openclaw dashboard
```

直接输入文字就能对话。如果配好了工具，它还能帮你操作文件、搜东西之类的。

------

## 8. 推荐配置

根据不同场景，给个参考：

| 场景 | 推荐模型 | 理由 |
|------|----------|------|
| 编程 | qwen/qwen3-coder | 专为编程优化，GitHub 集成好 |
| 视觉理解 | qwen-portal/vision-model | 支持图像理解 |
| 日常对话 | MiniMax-M2.5 | 中文理解好，性价比高 |
| 深度推理 | Qwen3-Max | 能力强 |
| 本地离线 | Ollama qwen2.5:3b | 主流配置可用，完全免费 |

**我的常用搭配**：日常用 MiniMax，编程切到 qwen/qwen3-coder。

切换模型很方便：

```powershell
# 切到 MiniMax
openclaw models set minimax/MiniMax-M2.5

# 切到 Qwen 编程
openclaw models set qwen/qwen/qwen3-coder

# 切到 Qwen 视觉
openclaw models set qwen/qwen-portal/vision-model
```

------

## 9. 常见问题

### 命令找不到

```powershell
# 检查是否装上了
npm list -g openclaw

# 重启 PowerShell 再试

# 不行就重装
npm install -g openclaw@latest
```

### API Key 报错

- 检查 Key 对不对，有没有多余空格
- 看看还有没有余额
- 建议用环境变量方式配置

### Ollama 连不上

```powershell
# 确认 Ollama 启动了
ollama list

# 试试能不能访问
curl http://localhost:11434
```

### Gateway 连不上

```powershell
# 确认 Gateway 启动了
openclaw gateway run

# 如果端口被占用，加 --force 强制启动
openclaw gateway run --force

# 或者指定其他端口
openclaw gateway run --port 8080
```

### 响应太慢

- 远程 API：检查网络，或者换个模型
- Ollama：考虑用更小的模型，如 `qwen2.5:3b` 或量化版本 `qwen2.5:3b-q4_K_M`

### 安装脚本报错

确认执行策略改过了：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

------

## 10. 替代方案：腾讯工作流 AI（WorkBuddy）

如果你觉得 OpenClaw 部署太复杂，不妨考虑一下 **[腾讯工作流 AI](https://copilot.tencent.com/work/)**（又称 **WorkBuddy** ）。

### 什么是 WorkBuddy？

WorkBuddy 是腾讯推出的 AI 编程助手，类似于 Cursor、Windsurf 的产品。它**不需要本地部署**，直接通过 VS Code 或 JetBrains 插件即可使用。

### 特点

- **无需部署**：安装插件即可使用
- **免费额度充足**：腾讯提供免费使用额度
- **中文优化好**：对中文开发者友好
- **集成腾讯生态**：可接入微信、腾讯云等服务

### 适用人群

- 编程新手，不想折腾环境配置
- 追求开箱即用的体验
- 只想简单体验 AI 编程辅助

### 与 OpenClaw 的对比

| 特性 | OpenClaw | WorkBuddy |
|------|----------|-----------|
| 部署方式 | 本地部署 | 无需部署 |
| 定制性 | 高 | 中 |
| 学习成本 | 较高 | 低 |
| 费用 | 免费/付费 | 有免费额度 |

> **总结**：如果你只是想体验 AI 编程辅助，WorkBuddy 是个更简单的选择。如果你想要更高的定制性和可扩展性，OpenClaw 仍然是更好的选择。

------

## 结语

这篇教程可能还是不够详细，但是我已经写入了很基础的详细配置教程，后续我会更新大模型参数详解之类的教程，后续我可能会更新openclaw接入飞书的详细教程等。
