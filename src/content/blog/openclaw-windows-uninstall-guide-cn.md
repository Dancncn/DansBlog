---
title: "OpenClaw Windows 卸载教程"
description: "简单几步教你如何在 Windows 上完全卸载 OpenClaw。"
pubDate: 2026-03-16
updatedDate: 2026-03-16
lang: "cn"
author: "Dan"
group: "openclaw-windows-setup-guide"
tags: ["OpenClaw", "Uninstall", "Tutorial"]
---

## 前言

如果你不再需要 OpenClaw，可以按照以下步骤将其彻底卸载。虽然很好笑，因为我前几天刚出过部署的教程。

---

## 1. 卸载 OpenClaw

OpenClaw 通过 npm 全局安装，卸载非常简单。打开 PowerShell，运行：

```powershell
npm uninstall -g openclaw
```

---

## 2. 删除配置文件

OpenClaw 会在用户目录下创建配置文件，可以手动删除。

**Windows**：打开 CMD 或 PowerShell，运行：

```cmd
rmdir /s /q %USERPROFILE%\.openclaw
```

**Linux / macOS**：

```bash
rm -rf ~/.openclaw
```

---

## 3. 验证卸载成功

运行以下命令：

```powershell
openclaw --version
```

如果提示 `command not found` 或找不到命令，说明卸载成功。
