---
title: "GoFile 下载工具使用说明"
description: "使用 Python 脚本从 GoFile 下载文件的简单指南"
pubDate: 2026-02-10
tags: ["tools", "python", "download"]
typora-root-url: ./..\..\..\public\image\goflieuse
---

You can do this the easy way: just click on **'Code'** and select **'Download ZIP'**, then extract it.  
Alternatively, you can open the command prompt in your folder and run:

`git clone https://github.com/rkwyu/gofile-dl`

![step1](/image/goflieuse/step1.png)

---

Click the address bar, input **'cmd'**, and press **Enter**.

Type `python -m pip install -r requirements.txt` and press **Enter**.  
Once the dependencies have finished downloading, proceed to the next step.

![step2](/image/goflieuse/step2.png)

---

Enter the following command in the terminal:

`python run.py -i "StarRail_3.8.53_CN_ReversedRooms.zip" https://gofile.io/d/whpait`

After downloading, your files will be available in the **outputs** folder.

![step3](/image/goflieuse/step3.png)
