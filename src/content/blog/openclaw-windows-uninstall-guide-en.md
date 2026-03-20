---
title: "OpenClaw Windows Uninstall Guide"
description: "A simple guide on how to completely uninstall OpenClaw on Windows, including removing config directories and verifying the uninstallation."
pubDate: 2026-03-16
updatedDate: 2026-03-16
lang: "en"
author: "Dan"
group: "openclaw-windows-setup-guide"
tags: ["OpenClaw", "Uninstall", "Tutorial"]
---

## Introduction

If you no longer need OpenClaw, you can follow these steps to completely uninstall it. It's kind of funny—I just made a deployment guide a few days ago!

---

## 1. Uninstall OpenClaw

OpenClaw is installed globally via npm, so uninstalling is simple. Open PowerShell and run:

```powershell
npm uninstall -g openclaw
```

---

## 2. Delete Configuration Files

OpenClaw creates a config directory in your user folder. You can delete it manually.

**Windows**: Open CMD or PowerShell and run:

```cmd
rmdir /s /q %USERPROFILE%\.openclaw
```

**Linux / macOS**:

```bash
rm -rf ~/.openclaw
```

---

## 3. Verify Uninstallation

Run the following command:

```powershell
openclaw --version
```

If you see `command not found` or an error saying the command doesn't exist, the uninstallation was successful.
