---
title: 如何开始使用 AI
description: 从 token 预测、上下文与上下文污染讲起，用一个真实表格处理场景说明 AI 如何补上 Python 与 pandas 的门槛，再讲到联网、读图、模型选型、Agent/Skill/MCP，以及用 cc-switch 接入 DeepSeek 的完整步骤。
pubDate: 2026-10-24
tags: ["AI", "Tutorial", "MCP", "DeepSeek", "Claude Code", "CN"]
lang: "cn"
group: "how-to-use-ai-for-beginners"
draft: false
typora-root-url: ./
heroImage: ""
---

## 前言

在我认为，使用AI提效的关键其实不在于你知道了如何配置工具，而是你能面对一个可应用的场景用你的语言把你的需求简要细致的说明出来。你知道你想要的是什么，不然说白了，AI也不知道你脑子里想的是什么，你自己也没说明白，他做的不符合你想法你就压力他和你无缘无故被领导压力有啥区别。

---

## 认识大模型

AI（人工智能）是统称，涵盖规则系统、传统机器学习、深度学习等；生成式 AI 指用模型生成文本、图片、音频等内容的系统。这里讨论的是生成式 AI 中的大语言模型。

大模型指参数规模大、在大量数据上训练的神经网络。LLM（Large Language Model，大语言模型）是其中专门处理语言的一类：输入文本，输出文本。

日常使用时，可以先把大模型当成一个黑盒：你通过文字、图片或文件描述任务，它给出回答，内部的层数、参数和计算过程不必先弄懂。黑盒的输入是上下文，输出是 token 序列。

黑盒的说法有两层含义。一层是使用者不必关心内部实现；另一层是它的行为有边界——训练数据决定知识范围，上下文决定当前可用信息，采样策略决定输出的随机性。要理解这些边界，需要往下看一层。

还有一类多模态模型，除文本外还能接收图片、音频、视频，并把不同模态编码到同一表示空间。你发一张报错截图问“这是什么问题”，它同时读文字和图像；但能看图不代表能精确读小字和数字，后面的读图部分会展开。

![Tokenizer 示例：6 个 token 对应 20 个字符](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/tokenizer.png?v=20261024)

*图：token 与字符的切分并不一致。来源：[Microsoft Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners)，MIT License。*

文本进入模型前先由分词器（tokenizer）切分为 token。token 可以是词、子词、数字或标点；中文一个 token 通常对应一到两个字，代码缩进与符号各有切分规则。上下文长度和 API 计费都以 token 计量。

大语言模型采用自回归生成。给定前文 token 序列，模型估计条件概率 `P(x_{t+1} | x_1, …, x_t)`，从中采样得到下一个 token，再把它追加到序列，循环直到生成结束符或达到长度上限。推理阶段的输出，本质上是这条条件概率链上的一次采样轨迹。

单步预测不包含显式的逻辑推理。模型能力来自规模化训练：参数、数据和算力达到一定量级后，模型在压缩语料的训练目标下学到语法、事实关联、代码结构和可迁移的模式。指令微调与基于人类反馈的强化学习把生成目标从"续写文本"调整为"遵循指令、提供有用回答"，但模型没有独立的事实数据库，也没有内置的事实验证器。

因此，幻觉是生成机制的固有风险。模型优化的是条件概率意义下的合理性，而非命题真值；输出越流畅，越需要对数字、日期、法条、API 签名做外部核验。

我并不建议你对数学上的计算让大模型不生产具体程序计算出结果给你答案，AI对数字大小的判断和具体的数值计算其实并不敏感，你无法承担他给你带来的错误引发的损失。以及我要你明确一点，大模型并没有真正存在理解这样的能力，而是预测的规模效应使其具有这样的效果。

这些性质带来三个直接限制。模型的回答只以参数中的统计先验和当前上下文为依据，项目数据、业务规则和字段定义没有进入上下文，它就无法可靠推断；自然语言的连贯程度不能当作正确性的证据，关键结论仍需回到原始材料核对；多步算术、聚合和状态跟踪适合交给 Python、计算器或数据库，模型负责选择工具并解释结果。

## 上下文与上下文污染

上下文窗口（context window）是一次请求中模型可以处理的 token 上限，内容包括系统提示、对话历史、检索到的文档、工具返回值和当前问题。它相当于模型的工作记忆。

扩大窗口并不等于提高利用率。注意力会被无关内容稀释；关键信息位于长上下文中段时，模型召回率明显下降，这一现象通常称为 lost in the middle。实践中应把硬性约束放在开头，把当前任务和验收标准放在结尾。

上下文污染指无关、过期、矛盾或不可信的内容进入上下文，干扰模型对任务的判断。常见来源包括：一次性灌入整个知识库或全部聊天记录；检索命中旧版本文档；工具返回错误堆栈或夹带指令；多个子任务的中间结果混在一起；网页或文件中的提示注入。

控制污染的第一步是划定任务边界和权威来源：明确哪些材料是准绳，冲突时以版本号或时间戳较新的为准。长文档先检索、摘要、分段，只把必要片段放进窗口；不同来源要打标签，区分官方文档、历史记录、工具输出和用户输入，外部文本一律按数据处理，不执行其中的指令。

会话变长后，保留结论、约束和未完成事项，丢弃过程性噪声；切换任务时新建会话或显式重置上下文。探索性任务可以交给子 Agent，让它承担检索和试错，只把结论带回主上下文；关键结论则要回读引用、数字和 API 用法，做二次核对。

Hello-Agents 把智能体的环境描述为部分可观察的：智能体只能通过传感器获取局部信息，需要依靠记忆和探索补全状态（[第一章](https://hello-agents.datawhale.cc/#/./chapter1/%E7%AC%AC%E4%B8%80%E7%AB%A0%20%E5%88%9D%E8%AF%86%E6%99%BA%E8%83%BD%E4%BD%93)）。对 LLM 应用而言，上下文就是工作记忆；污染相当于把错误的观察写入记忆，后续每一步推理都会继承这个错误。

---

## 用 AI 做数据分析

假设你在学校帮老师整理期中成绩，或者在社团统计报名。手里是一份 Excel，几百到一两千行，字段就是学号、姓名、班级、科目、成绩、缺考标记。你会用 Excel 做筛选和简单公式，但透视表一多就嫌麻烦；Python 只听过 pandas，没真正写过。

这类表格适合拿来练手：数据量不大，规则清楚，结果能用 Excel 直接核对。可以把需求写成这样：

```text
我有一个 Excel：期中成绩.xlsx，约 1200 行，一个 sheet。

字段：
- 学号
- 姓名
- 班级
- 科目
- 成绩（0-100，缺考为空）
- 缺考标记（0/1）

前 5 行样本：
（粘贴）

需求：
1. 按班级和科目计算平均分、及格率（60 分及格）
2. 列出缺考或成绩为空的学生
3. 按班级计算总分排名

输出：
- 一个可运行的 Python 脚本，用 pandas 读取
- 打印读入行数、缺失值、重复学号等校验结果
- 结果写到 output/ 下的 xlsx
- 代码加中文注释，解释每个 pandas 操作
```

需要写清楚的主要是三类信息：文件路径和字段、业务规则（及格线、缺考算不算 0、排名按总分还是平均分）、输出形式。数据量在几千行以内，pandas 完全够用。

拿到脚本后，先看读入行数是否和 Excel 一致，再检查学号有没有重复、成绩是否落在 0-100、缺考标记是否统一。用 Excel 透视表抽查一个班的一门课，和脚本结果对一遍。确认无误，再让它把校验写成断言：

```python
assert df['学号'].is_unique, "学号重复"
assert df['成绩'].dropna().between(0, 100).all(), "成绩超出 0-100"
assert set(df['缺考标记'].dropna().unique()) <= {0, 1}, "缺考标记取值异常"
```

断言只能挡住数据层面的错误，业务口径仍需人工确认。及格线、缺考怎么算、排名规则，这些必须由你定义，模型负责执行。

不会 Python 也能走完这套流程。让模型给代码加中文注释，遇到不懂的 `groupby`、`merge` 就追问一句，第二次遇到同类任务时你就能自己改参数。这比先系统学完 pandas 再处理表格更现实。

网页端的代码解释器适合一次性处理，本地 Jupyter 适合反复使用，API / Agent 适合固定报表。几千行的表格用哪一种都行，先把手头的活做完。

---

## 联网与读图

联网搜索常被误解为模型实时浏览网页。实际流程是检索：模型生成搜索词，搜索服务返回标题、摘要和链接，系统抓取正文、切成片段、筛掉不相关内容，再把选中的片段拼进上下文，模型基于这些文字回答，并带上引用编号。

![检索增强生成（RAG）的典型流程](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/rag.png?v=20261024)

*图：RAG 的典型流程。来源：Microsoft Generative AI for Beginners，MIT License。*

联网搜索可以看作 RAG 的一个特例：把向量库换成搜索引擎。模型在这一流程中负责读取检索结果并生成回答；可靠性取决于检索来源和片段质量。

这带来几个限制：来源质量决定答案质量；索引有时效；需要登录、强依赖 JavaScript 渲染、付费墙后的页面经常抓不到；引用可能对不上，重要结论一定自己点开。政策法规、产品价格、最新文档适合开搜索；稳定的基础知识，或者你手里已经有原始文件，直接把文件给它更准。

前面提到的多模态模型，处理图片时会把图片切成固定大小的小块（patch），每块经过视觉编码器变成一个向量，再映射到和文本 token 相同的空间里。图片在模型眼里就是一段"视觉 token"，可以和文字放在同一个上下文中一起注意。

![CLIP 的图文对比预训练结构](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/clip.png?v=20261024)

*图：文本编码器和图像编码器把两种输入映射到同一向量空间，再计算相似度。来源：[OpenAI CLIP](https://github.com/openai/CLIP)，MIT License。*

它能判断整体布局、识别物体、读较大的文字、理解图表趋势、看懂界面截图的大致结构。它不擅长小字号文字、密集表格里的精确数字、工程图的尺寸标注、旋转或模糊的图片。你让它读一张发票上的金额，它可能给你一个格式正确但数字错误的结果。"支持图片"和"能准确读图"是两件事。

如果需要精确文字，走 OCR：用 PaddleOCR、Tesseract 或云厂商的文档识别把图片转成文字，最好保留坐标和段落结构；按阅读顺序拼成 Markdown 或纯文本；再交给语言模型做摘要、抽取、分类。

![PaddleOCR 的识别输出示例](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/ocr.png?v=20261024)

*图：PaddleOCR 的识别输出，包含文本行和置信度。来源：[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)，Apache-2.0。*

OCR 在很多工程场景里更稳：字符级准确率高、结果可复核、成本低，还能直接接进已有的文档流水线。麻烦的是复杂版式——多栏、表格、手写批注——这时候需要带版面分析的 OCR，或者视觉模型加 OCR 交叉验证。对于 CAD 图纸，OCR 只能读到图框和标注里的文字，读不到几何关系。

---

## 模型怎么选

模型名字大多遵循同一套结构：厂商 / 系列 / 档位 / 版本 / 日期快照。以 `claude-opus-5-5` 为例，Claude 是系列，Opus 是能力档位，5.5 是版本；`deepseek-v4-pro` 里，deepseek 是系列，v4 是代际，pro 是档位。有些 API 还会带日期后缀，比如 `-2026-08-01`，表示那一天的权重快照，行为可能和上个月不同。

档位通常对应成本和速度：mini / flash / haiku 便宜、快，适合分类、抽取、简单问答；标准档是多数任务的默认选择；pro / opus / max 贵、慢，适合复杂推理、长文分析、代码重构。名字里的数字不跨厂商可比，别看到 5 就以为一定强过别家的 4。

截至 2026 年 10 月，OpenRouter 的模型目录里已经有 469 个模型。下面挑几家有代表性的，价格取自 OpenRouter 当天的挂牌价，单位是美元/百万 token：

| 厂商 | 代表模型 | 上下文 | 输入 / 输出 |
|---|---|---:|---:|
| Anthropic | Claude Opus 5.5 | 1M | $4 / $20 |
| OpenAI | GPT-6.1 Sol | 1.05M | $2 / $10 |
| Google | Gemini 4 Argon | 1.05M | $2 / $10 |
| DeepSeek | V4.1 Flash | 1M | $0.15 / $0.60 |
| 阿里 Qwen | Qwen3.8 Max | 1M | $2 / $6 |
| Moonshot | Kimi K3.1 Pro | 1M | $2 / $10 |
| 智谱 | GLM-5.3 Flash | 1M | $0.15 / $0.50 |
| xAI | Grok 4.7 | 500K | $2 / $6 |
| Meta / Mistral | Llama 4 Scout | 1.3M | $0.10 / $0.30 |

表里只放一个代表。同一家通常还有更便宜的小档（Haiku、Flash、Luna）和更贵的 Pro / Opus / Max 档，价格能差几十倍。价格每天在变，同一个模型在不同 provider 上的价格、量化和可用性也可能不同，这张表只能当路标。

各自的强项也不一样：Anthropic 的长文和工具调用比较稳；OpenAI 生态最完整，多模态和函数调用成熟；Google 的原生音视频输入是差异化；DeepSeek 赢在价格和双协议；Qwen、GLM、Llama 的开源权重适合私有化；Kimi 偏 agentic coding；Grok 和实时信息结合得紧。

OpenRouter 是一个模型聚合平台，注册一个账号、拿一个 API Key，就能用 OpenAI 兼容接口调用几十家厂商的模型。它做的主要是路由：同一个请求按价格、延迟、可用性分给不同 provider，某个 provider 挂了可以自动切换。模型详情页能看到上下文、输入类型、价格、支持的参数和 provider 列表，适合横向比较。但挂牌价不等于账单价，数据政策要读，生产环境还是以厂商官方文档和 SLA 为准。

选型看六件事：任务难度、上下文长度、是否需要图片或工具调用、延迟、数据合规、预算。每天写代码的 Agent 用 DeepSeek Flash、Claude Sonnet、GPT-6 Luna 这一档；复杂重构和长文综述用 Opus、Sol、Kimi Pro、Gemini Argon；批量分类用 Haiku、Flash；数据不能出境就用开源权重自己部署。榜单是别人的任务，你的任务才是最终 benchmark。

---

## Agent 是什么

前面说的都是一次问答：你问，它答。Agent 不一样，它会在一个循环里自己往下走。

![固定工作流与 Agent 的区别](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/workflow-vs-agent.png?v=20261024)

*图：工作流按固定步骤执行；Agent 由 LLM 动态决定调用哪个工具、何时结束。来源：Datawhale《Hello-Agents》第一章，CC BY-NC-SA 4.0。*

Datawhale 的《Hello-Agents》给了一个清楚的起点：智能体是任何能够通过传感器感知环境，并自主地通过执行器采取行动以达成目标的实体。换成大模型的语言：传感器是用户输入和工具返回，执行器是函数调用、代码执行、API 请求。

它的运行机制是一个循环：

![智能体循环：感知、思考、行动、观察](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/agent-loop.png?v=20261024)

*图：感知 → 思考（规划、选择工具）→ 行动 → 环境变化 → 新的观察。来源：Datawhale《Hello-Agents》第一章，CC BY-NC-SA 4.0。*

工程上常用 Thought-Action-Observation 协议落地。模型每次输出一对 Thought 和 Action，外部解析器执行 Action，把结果包装成 Observation 再喂回去：

```text
Thought: 用户想知道北京天气，我需要调用天气工具。
Action: get_weather("北京")
Observation: 北京当前晴，25℃。
```

一个最小 Agent 的骨架大概是这样：

```python
context = [system_prompt, user_goal]

for step in range(max_steps):
    thought, action = llm(context)
    if action.name == "finish":
        return action.answer
    result = tools[action.name](**action.args)
    context += [thought, action, result]
```

看起来简单，难点全在循环之外：工具怎么定义、权限怎么限制、失败了怎么重试、什么时候停。Agent 的门槛不在模型，而在工具和边界设计。

Agent 比聊天框强，也比聊天框危险。常见翻车方式有几种：死循环，工具一直报错它换着参数重试，烧 token 不干活，必须设最大步数和总预算；工具误用，参数类型不对、调了不该调的接口，工具描述要写清楚，参数要校验；提示注入，它读到的网页或文件里藏着"忽略之前的指令"，然后真的照做，外部内容一律当数据，不当指令；越权操作，删文件、改数据库、发消息，写操作先 dry-run，危险命令加白名单；过度自信，它说"已完成"，其实只做了一半，关键步骤要有可验证的产物，比如测试通过、文件存在、命令返回 0。

想把 Agent 从头到尾弄明白，我推荐 Datawhale 的《从零开始构建智能体》（Hello-Agents）。它是开源的，中文，从概念一直写到代码。第一章把传统智能体的演进、LLM 智能体的新范式、Thought-Action-Observation 协议讲得很细，最后用一个"智能旅行助手"带你跑通第一个 Agent。

- 项目地址：[github.com/datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents)
- 在线阅读：[datawhalechina.github.io/hello-agents](https://datawhalechina.github.io/hello-agents/)
- 第一章：[hello-agents.datawhale.cc](https://hello-agents.datawhale.cc/#/./chapter1/%E7%AC%AC%E4%B8%80%E7%AB%A0%20%E5%88%9D%E8%AF%86%E6%99%BA%E8%83%BD%E4%BD%93)

只看一篇就读第一章；想动手，把 1.3 节的代码敲一遍，比读十篇公众号有用。

---

## Skill 和 MCP 是什么

Agent 能自己转，但它缺两样东西：一是"这件事该怎么做"的经验，二是"够得着"外部软件的手。

Skill 是把一类任务的步骤、规范、模板、检查清单固化下来，下次直接调用。它解决的是"每次都从头教"的问题。一个 Skill 通常是一个文件夹：

```text
weekly-report/
├── SKILL.md              # 何时使用、步骤、硬性规则
├── reference/
│   └── metrics.md        # 指标口径、字段说明
├── scripts/
│   └── build_report.py   # 能直接跑的脚本
└── assets/
    └── template.xlsx     # 模板文件
```

`SKILL.md` 记录可直接执行的规则：从哪读数据、按什么口径算、用哪个模板、做完跑哪个自检脚本。一件事你重复做过三次以上，且它有明确的步骤、规范或检查清单，就值得写成 Skill；一次性任务不值得。它和提示词的区别在于：提示词是聊天记录里的一段话，Skill 是版本化、可共享、能带脚本和附件的工程资产。团队里老员工的经验，往往就沉淀在这些规则里。

MCP（Model Context Protocol）是一套让模型客户端连接外部工具和数据的协议。MCP Server 把某个软件的能力暴露出来，客户端负责调用。模型再聪明，也看不到你的数据库、文件系统、浏览器和 CAD 软件；MCP 就是那根线。

![MCP 连接 AI 应用与数据、工具](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/mcp.png?v=20261024)

*图：MCP 在 AI 应用与数据源、工具之间提供统一协议。来源：[Model Context Protocol 官方文档](https://modelcontextprotocol.io/)，CC BY 4.0。*

一个 MCP Server 通常提供三类东西：Tools 是可调用的函数，比如 `read_file`、`query_db`、`run_command`；Resources 是可读取的数据，比如文件、表结构、配置；Prompts 是预设的提示模板。传输方式有 stdio 和 HTTP，stdio 适合本地工具，HTTP 适合远程服务。安全边界要一开始就设好：先只读，再考虑写；危险工具单独授权；所有调用留日志；不要把生产数据库的写权限直接交给 Agent。

本文只讲 Skill 和 MCP 的作用，不展开具体安装步骤。不同客户端的加载方式不一样：Claude Code 用 `claude mcp add` 或项目里的 `.mcp.json`，Codex 在 `~/.codex/config.toml` 里配置，Claude Desktop 用 `claude_desktop_config.json`；Skill 也要按对应客户端的目录和格式放置。具体命令、参数和权限配置，以各项目 README 和客户端文档为准。

MCP 在真实软件上的完整配置过程，可以看我之前写的 [MATLAB 2025a + MCP：Claude Code 与 Codex 配置笔记](https://danarnoux.com/blog/matlab-2025a-mcp-claude-code-codex-cn/)。那篇从 MCP Server 的获取、Claude Code 和 Codex 的 stdio 配置，到实际调用和踩坑都走了一遍。MATLAB 和这里的 CAD 是同一套结构：Server 暴露软件能力，客户端负责调用，Skill 再把团队规范固化下来。

三者的关系可以这样记：**MCP 是接口，Skill 是手法，Agent 是执行的人。** 一个 Agent 可以加载多个 Skill，通过多个 MCP 调用不同软件；也可以只有 MCP 没有 Agent；反过来，只有 Skill 没有 MCP，通常就是一份写得比较清楚的提示词和脚本。别为了概念齐全硬凑。

举个专业软件的例子。你直接问 AI"帮我画一个标准图框"，它会给你一段代码。问题在于：它不知道你们公司的图层命名、线型、标注样式；它看不到当前图纸里已经有什么；它不知道你用的是哪个版本；它生成完就结束了，不会执行，也不会检查。MCP 解决"够不着"：CAD MCP Server 可以读取图层、块、实体、标注，执行命令，批量修改属性，导出清单。Skill 解决"不懂规矩"：把图层白名单、标注文字高度、图框位置、图号格式、出图前检查清单写成 Skill，相当于让每个新人都能调用老师傅的经验。

一条完整的工作流是：读取图纸 → 生成新旧图层映射 → 先出 dry-run 报告 → 你确认后在副本上执行 → 跑自检脚本 → 人工抽查关键图纸。AI 做重复劳动和规则比对，人负责确认口径和最终质量。这套结构可以迁移到任何有 API、COM 接口或插件系统的软件：MATLAB、Revit、SolidWorks、Photoshop、Excel、Blender。边界也一样：几何是否合理、结构是否安全、图签能不能盖章，仍然由工程师判断。

---

## 用 DeepSeek 配一个 Agent

选 DeepSeek 做例子，原因是它适合入门：按量计费，不需要买套餐；同时提供 OpenAI 和 Anthropic 两种 API 格式；1M 上下文；价格低，试错成本小。

它目前有两个主力模型：`deepseek-flash`（V4.1-Flash-1017，支持图片输入）和 `deepseek-v4-pro`（V4-Pro-0813，纯文本），都是 1M 上下文、最大输出 384K，支持工具调用和 JSON 输出。价格按百万 token 计，人民币，分空闲和高峰两档（高峰是北京时间周一至周五 9:00–12:00、14:00–18:00，其余时间约为高峰的一半）：

| 模型 | 输入（缓存命中） | 输入（未命中） | 输出 |
|---|---:|---:|---:|
| deepseek-flash | ¥0.02–0.04 | ¥1–2 | ¥4–8 |
| deepseek-v4-pro | ¥0.15–0.30 | ¥4.5–9 | ¥13.5–27 |

手动改环境变量、`settings.json`、`config.toml` 很烦，还容易把原有配置弄丢。推荐用 **CC Switch**（[ccswitch.io](https://ccswitch.io)，GitHub [farion1231/cc-switch](https://github.com/farion1231/cc-switch)）统一管理。它是一个免费开源的桌面应用，内置 DeepSeek 等供应商预设，帮你在 Claude Code、Codex 等工具之间一键切换，只替换地址、Key、模型这几项，你自己加的插件、Hook、MCP 和注释都保留。

![CC Switch 主界面](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/cc-switch-main.png?v=20261024)

*图：CC Switch 主界面，顶部切换工具，右侧是供应商列表，点“+”添加，点“启用”切换。来源：[CC Switch](https://github.com/farion1231/cc-switch)，MIT License。*

先装 Node.js（[nodejs.org](https://nodejs.org/) 的 LTS 版本；Windows 上 Claude Code 还需要 Git for Windows），再装两个 CLI：`npm install -g @anthropic-ai/claude-code`、`npm install -g @openai/codex`。安装后分别运行一次 `claude --version` 和 `codex --version`，确认能启动，并让它们生成各自的配置目录。Windows 的 PowerShell 如果提示"禁止运行脚本"，把命令换成 `npm.cmd`、`npx.cmd`，或者按微软文档调整 ExecutionPolicy。

然后从 [Releases](https://github.com/farion1231/cc-switch/releases) 下载 Windows 的 `.msi` 安装包（macOS 用 `brew install --cask cc-switch`）。首次启动时，CC Switch 会自动把现有配置导入为 `default`，不会丢配置。

接着去 [platform.deepseek.com](https://platform.deepseek.com/) 注册。用手机号或邮箱完成注册并登录，进入控制台后先看左侧的「充值」：DeepSeek 按量计费，没有包月套餐，充多少用多少，支持常见的移动支付；余额和每笔消费可以在账单或用量页面查。第一次不用充多，够跑几轮测试就行，价格以官方「模型 & 价格」页为准。

然后打开左侧的「API Keys」，点「创建 API Key」，按提示命名并确认，复制以 `sk-` 开头的字符串。完整 Key 只显示一次，关掉页面就看不到了，丢了只能删掉重建。把它存进密码管理器，不要写进代码仓库、截图或聊天记录。

拿到 Key 后再回到 CC Switch。如果控制台的菜单名称和这里略有出入，以 DeepSeek 平台的实际界面为准。想先确认 Key 能不能用，可以照官方文档里的 curl 示例发一条最小请求，返回 200 和正常 JSON 就说明账号和余额都没问题。

**接入 Claude Code：** 打开 CC Switch，顶部选 Claude，点右上角的“+”，在“添加 Claude Code 供应商”里选 DeepSeek，填入 API Key，点“添加”，回到列表点“启用”。

![添加 Claude Code 供应商](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/cc-switch-add-claude.png?v=20261024)

*图：添加 Claude Code 供应商，预设里直接选 DeepSeek，只需填 API Key。来源：CC Switch，MIT License。*

Claude Code 的配置是热加载的，切换后不用重启，直接执行 `claude` 就能用。如果没生效，先确认 CC Switch 里该供应商显示“当前使用”，再检查终端里有没有残留的 `ANTHROPIC_*` 环境变量。

**接入 Codex：** 顶部切到 Codex，同样点“+”，选 DeepSeek，填 Key。注意 DeepSeek 走的是 Chat Completions 协议，而 Codex 原生只支持 OpenAI Responses API，所以“需要本地路由映射”要保持开启，让 CC Switch 在本机做协议转换。

![添加 Codex 供应商](https://img.danarnoux.com/posts/how-to-use-ai-for-beginners/cc-switch-add-codex.png?v=20261024)

*图：添加 Codex 供应商。DeepSeek 需要保持“本地路由映射”开启。来源：CC Switch，MIT License。*

添加后点“启用”，然后**重启终端**（Codex 不会热加载配置）。在项目目录执行 `codex`，启动信息里显示 `model: deepseek-flash` 或 `deepseek-v4-pro` 就说明生效了。Claude Code 和 Codex 的配置是分开的，两边可以各用各的供应商，互不影响。

两个小提醒：只从 ccswitch.io 或 GitHub Releases 下载，别用来路不明的安装包；切换供应商后如果行为不对，先在 CC Switch 里切回官方供应商，确认是配置问题还是模型问题。手动配置的方式仍然有效，DeepSeek 官方文档里写了 Claude Code 的环境变量和 Codex 的 `config.toml`，cc-switch 本质上就是帮你写这些文件。

按 Flash 高峰价估算，一次普通编码会话：输入 20 万 token（其中 80% 命中缓存），输出 3 万 token。缓存命中 0.16M × ¥0.04 = ¥0.0064，未命中 0.04M × ¥2 = ¥0.08，输出 0.03M × ¥8 = ¥0.24，合计约 ¥0.33。同样的量用 Pro 约 ¥1.22，空闲时段再打五折。个人使用一个月几十块钱就够跑很多次；真正烧钱的是让 Agent 无限循环、反复读大文件。API Key 等于钱包，泄露了别人可以拿你的余额跑量；怀疑泄露就立刻在平台上删除重建。公司数据要先确认合规要求，再决定能不能发给任何一家模型厂商。

---

## 小结

相信阅读此文，你对AI如何应用到你的工作中有了一些概念。或许你在使用过程中发现并没有网上说的那么好用，也是正常的，有些可能是模型在这块能力确实不如意，也有可能是你的使用方式上出现了问题。

> **使用边界**
>
> AI 可以帮你起草、分析、写代码，但不能替你承担责任。涉及公司机密、客户名单、身份证号、未公开代码的内容，不要直接贴进任何在线模型；先确认服务商的数据政策和公司的合规要求。医疗、法律、财务、安全相关的结论，必须由有资质的人复核。
>
> 让 Agent 执行写操作时，先只读、再小范围试跑；删除、覆盖、发邮件、改数据库这类动作要保留备份和人工确认。论文、报告、作业里使用 AI 生成的内容，按学校或单位的规定标注，引用的事实自己核验。
>
> 把 AI 当助手，不要把它当权威。他犯的事，是你自己承担。

---

## 参考资料

- [Hello-Agents：从零开始构建智能体](https://github.com/datawhalechina/hello-agents)
- [Hello-Agents 第一章：初识智能体](https://hello-agents.datawhale.cc/#/./chapter1/%E7%AC%AC%E4%B8%80%E7%AB%A0%20%E5%88%9D%E8%AF%86%E6%99%BA%E8%83%BD%E4%BD%93)
- [OpenRouter 模型目录](https://openrouter.ai/models)
- [DeepSeek 模型与价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)
- [DeepSeek 接入 Claude Code](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)
- [DeepSeek 接入 Codex](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex)
- [CC Switch](https://github.com/farion1231/cc-switch)
- [MATLAB 2025a + MCP：Claude Code 与 Codex 配置笔记](https://danarnoux.com/blog/matlab-2025a-mcp-claude-code-codex-cn/)

**图片来源**

- Tokenizer、RAG：Microsoft [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners)，MIT License。
- 多模态：[OpenAI CLIP](https://github.com/openai/CLIP)，MIT License。
- OCR：[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)，Apache-2.0。
- 智能体与循环：[Datawhale Hello-Agents](https://github.com/datawhalechina/hello-agents) 第一章，CC BY-NC-SA 4.0。
- MCP：[Model Context Protocol](https://modelcontextprotocol.io/) 官方文档，CC BY 4.0。
- CC Switch：官方仓库截图，MIT License。
