---
title: "How I Turned My Tablet into a Second Monitor with Sunshine"
description: "A practical guide and troubleshooting notes on building a tablet-as-second-monitor setup using Sunshine streaming and a virtual display driver."
pubDate: 2026-02-16
tags: ["sunshine","tools","guide","screen-streaming","virtual-display","EN"]
lang: "en"
group: "how-i-turned-my-tablet-into-a-second-monitor-with-sunshine"
---

## Preface

I have been using a laptop for both work and entertainment for years. Because I move between places a lot, I never bought a dedicated external monitor. Part of it was me being picky, and part of it was the classic "if I buy one, I probably need two" dilemma.

At some point, the single-screen setup just became annoying. Gaming felt cramped, coding felt cramped, everything felt cramped. I started regretting not buying a monitor earlier.

I only took this seriously after trying Apple Vision Pro and learning what Sunshine could do for low-latency streaming. I still did not want to overcomplicate things, but the idea stayed in my head.

My tablet is a Huawei MatePad 11, with a 2560x1600 panel, close enough to my laptop's workflow needs. I tested 90Hz streaming at that resolution and saw around 6ms delay in the path I measured. In real use it felt smooth enough to be useful, not just "tech demo smooth."

I do not use this setup every single day, but if you want a portable second screen without adding more cables to your desk, it is a very practical option.

---

## What I Want from a Second-Screen Experience

I wanted a true extended screen, not a remote-control mirror. I did not want accidental touches on the tablet to mess with my main cursor. I wanted the tablet to sit on my left side and behave like a natural extension of my desktop space.

The ideal use case for me is simple: the main screen for active work, the side screen for docs, serial logs, dashboards, or reference windows. Since it is an actual extended display, dragging content across is fast and natural.

I also wanted it wireless. I like being able to pick up the tablet and move around when needed. A cable works, but for this use case it quickly becomes visual and practical clutter.

## Solution Overview

One-line topology:

```text
PC -> Sunshine (encoding) -> LAN -> Moonlight -> Tablet
            |
        Parsec-VDD (virtual display)
```

Role split:

- Parsec-VDD: creates the second display target
- Sunshine: captures and encodes that display
- Moonlight: decodes and shows it on the tablet

## Preparation

### Hardware Requirements

- A GPU that supports hardware encoding
- A local network (5GHz recommended)

### Software List

- Sunshine
- Moonlight
- Parsec-VDD

Once your hardware is ready, the rest is mostly configuration and a bit of verification.

### How to Install and Configure Sunshine

I use Windows for this setup, so these are Windows-first steps.

1. Install Sunshine from the official release.
2. Launch Sunshine. The first-time WebUI is usually at [`https://localhost:47990`](https://localhost:47990).
3. Create your admin account on first login.
4. Open `Settings` / `Configuration`:
   - In `General`, confirm the service is running and enable start-with-system if you want auto-start.
   - In `Video` / `Encoder`, choose your encoder backend.
   - Keep default ports until the full chain is stable.
5. Open `Applications`, click `Add` / `New` / `+`, add `Desktop`, then save.

Useful links:

- [Sunshine GitHub Repository](https://github.com/LizardByte/Sunshine)
- [Sunshine Releases](https://github.com/LizardByte/Sunshine/releases)

Build choice on Windows:

1. `Installer`: best default choice. Easier service setup and easier updates.
2. `Portable`: useful for no-install environments, but you manage more manually.

Service mode in plain terms: Sunshine keeps running in the background as a service, so Moonlight can connect without you re-opening the UI every time.

WebUI and ports:

1. Default WebUI is `47990` (HTTPS).
2. If you change ports later, update firewall rules accordingly.

Encoder choice:

1. `NVENC` (NVIDIA hardware video encoder)
2. `AMF` (AMD media framework encoder path)
3. `QSV` (Intel Quick Sync Video encoder path)

After selecting encoder settings, click `Save` / `Apply`. Do not leave the page without saving.

NVENC preset:

1. Start with low-latency presets.
2. Move toward higher quality only after stability is good.

Bitrate baseline I use:

1. 1080p60: 20-35 Mbps
2. 1440p60: 35-55 Mbps
3. 1600p90: 45-75 Mbps
4. 4K60: 60-100+ Mbps

Practical codec pick:

1. HEVC / H.265 for better compression efficiency at the same quality.
2. H.264 when compatibility or decode stability matters more.

Audio setup (important):

1. In Sunshine `Audio`, set output device explicitly (avoid auto if you want predictable routing).
2. If you want sound only on the PC, disable audio redirection.
3. On Moonlight, go to `Settings -> Audio Playback` and disable playback there.
4. In Windows, verify your default playback device is still the local speaker/headphone you want.
5. Save/Apply Sunshine audio settings after each change.

This avoids the common issue where both PC and tablet play sound at the same time.

### How to Install and Configure Moonlight

Moonlight setup is lightweight. Pairing and network correctness are the main points.

1. Install Moonlight on the tablet.
2. Make sure tablet and PC are on the same LAN.
3. Open Moonlight and let it auto-discover the host.
4. If auto-discovery fails, add host manually with your PC IPv4 address.
5. Enter the pairing PIN in Sunshine WebUI.

Manual IP steps on Windows:

1. Press `Win + R`.
2. Type `cmd`, press Enter.
3. Run `ipconfig`.
4. Find the active adapter and read `IPv4 Address`.
5. Use that IPv4 address in Moonlight `Add Host`.

Moonlight links:

- [Moonlight-qt Repository](https://github.com/moonlight-stream/moonlight-qt)
- [Moonlight Organization](https://github.com/moonlight-stream)
- [Moonlight-qt Releases](https://github.com/moonlight-stream/moonlight-qt/releases)

First-pass stream settings:

1. Start at 1080p, 60fps, moderate bitrate.
2. Scale up after it is stable.

Parameter behavior that matters:

1. Keep source/output/client resolution aligned when possible.
2. Keep refresh rates aligned (or integer-related) to avoid uneven cadence.
3. Watch frame pacing (frame time consistency), not just average FPS.
4. If bandwidth is tight, reduce resolution/FPS before crushing bitrate.
5. V-Sync on for smooth office-style use, off for lower interactive latency if needed.
6. HDR is optional; keep SDR first until the chain is stable.

### How to Install and Configure Parsec-VDD

Parsec-VDD is the piece that makes Windows think a second display exists.

1. Install Parsec-VDD.
2. Reboot the PC (important: driver enumeration is cleaner after reboot).
3. Open Windows Display Settings and confirm a new display appears.
4. Switch display mode to `Extend these displays`.
5. Set resolution and refresh rate on the virtual display.

Useful link:

- [Parsec-VDD Repository](https://github.com/nomi-san/parsec-vdd)

How the virtual display appears:

- After driver install + reboot, Windows display stack enumerates it as an available display output.
- If your VDD build has an enable toggle/tool, enable the virtual screen there first, then return to Windows Display Settings.

Now the important part: mapping Windows display to Sunshine display ID.

Windows numbers (`1/2/3`) are logical labels. Sunshine often lists outputs by its own enumeration order (for example `Display 0/1/2` or `\\.\\DISPLAY1/2`). They are often related, but not guaranteed to match one-to-one.

Reliable mapping workflow:

1. In Windows, make the virtual display easy to recognize:
   - set a unique resolution (for example 1280x720), or
   - switch it to portrait, or
   - drag it to the far left in display arrangement.
2. In Sunshine WebUI, go to `Settings/Configuration -> Video/Display/Capture` (wording may vary by version).
3. Find the target selector (`Display` / `Monitor` / `Output`) and pick one display ID.
4. Click `Save` / `Apply`.
5. Connect from Moonlight and verify what you see.
6. If it is the wrong screen, switch to the next display ID in Sunshine, save again, reconnect, and verify again.

This takes a minute once, then stays stable.

Known recovery trick when extend mode does not react:

1. In Windows Display Settings, switch to `Show only on 2`.
2. Click Apply.
3. Switch back to `Extend these displays`.

This often refreshes display state and brings the virtual output back into a usable state.

If still broken, check:

1. You rebooted after VDD install.
2. Virtual display is not disabled.
3. Advanced display settings show valid refresh modes.
4. Manually disable/re-enable the virtual screen once.

### Performance Tuning Notes

The goal is stable low latency, not maximum numbers on paper.

Tuning order I use:

1. Network first
   - PC on Ethernet if possible.
   - Tablet on 5GHz/6GHz Wi-Fi.
   - Avoid heavy transfers on the same LAN while streaming.
2. Stream parameters second
   - Lock stable 60fps first, then push 90/120.
   - Raise bitrate gradually.
3. Encoding path third
   - Prefer hardware encoding.
   - Avoid software encoding (CPU path) for this use case.
4. System power and load
   - Keep laptop plugged in.
   - Use high-performance power mode.
   - Close heavy background workloads.

Bandwidth reality:

- Codec bitrate is baseline demand, not total overhead-inclusive traffic.
- Keep practical throughput headroom (around 25%-40%).

Latency usually accumulates from:

1. Encode queue
2. Wireless contention
3. Router queueing/forwarding
4. Decode + display sync

Wi-Fi 5 vs Wi-Fi 6 in this use case:

- Wi-Fi 5 can be enough.
- Wi-Fi 6 tends to reduce jitter under multi-device load.

Monitor GPU correctly:

- Watch `Video Encode` engine utilization, not only 3D usage.
- If encode is saturated, lower resolution/FPS/bitrate before anything else.

## Technical Notes (Optional Read)

### Why This Feels Lower-Latency

The path is designed for real-time frame delivery.

High-level flow:

1. App renders frame.
2. Compositor outputs to target display surface.
3. Sunshine captures that frame buffer.
4. Hardware encoder (NVENC/AMF/QSV) compresses the frame.
5. Stream crosses LAN.
6. Moonlight decodes and presents.

Latency behavior comes from each queue in that path.

- Lower-latency encoder presets reduce internal buffering and lookahead.
- Network jitter is handled by a jitter buffer on the client side.
- Bigger jitter buffer improves stability but adds delay.
- Smaller jitter buffer cuts delay but can increase visible hiccups.

Why traditional remote desktop paths often feel slower in this context:

- They are generally optimized for desktop readability, reliability, and compatibility.
- Their buffering/retransmission behavior is usually more conservative.
- That helps office remoting quality, but it is not tuned for minimum interactive frame latency.

### Wrap-up

For me, this setup is not a gimmick. It is a practical second screen that I can carry around.

The upside is clear: wireless workflow, low-latency feel, and enough control to tune for your own network and hardware.

It works especially well if you move between places and do not want to buy duplicate monitor setups.

The main thing to remember is that stability comes from process: get the virtual display right, map display ID correctly, then tune bitrate/FPS step by step.

Once configured properly, daily use is mostly just connect and go.
