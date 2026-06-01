# Theo

A pixel-art desktop avatar assistant for macOS. Theo is a small kid character who lives in your system tray and pops up from the bottom-right corner of your screen to remind you of tasks — screen breaks, hydration, stretches, posture checks, and anything else you configure.

![Electron](https://img.shields.io/badge/Electron-35-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![macOS](https://img.shields.io/badge/macOS-only-000000)

## How It Works

1. Theo stays hidden — no dock icon, just a system tray icon
2. When a reminder fires, he peeks from the screen edge, walks in with a bouncy pixel-art animation, and shows a speech bubble
3. You can dismiss ("OK") or snooze (5/10 min)
4. He waves goodbye and walks back off-screen
5. If you're actively typing, he uses **gentle mode** (faster, less intrusive animations)

## Features

- **Pixel art avatar** — Hand-drawn sprite with walk cycle, peek, wave, and front-facing poses
- **Reminder engine** — Interval-based (every N minutes) or scheduled (specific time) reminders
- **Task panel** — Full UI to create, edit, delete, and toggle reminders
- **Settings** — Sound on/off, volume, outfit color (6 presets), animation speed, quiet hours
- **System awareness** — Respects macOS Do Not Disturb, detects idle/sleep/lock, gentle mode when typing
- **Snooze & quiet hours** — Snooze individual reminders, set global quiet hours window
- **Sound effects** — Doot doot notification sound (triangle wave synthesis via Web Audio API)
- **Activity log** — History of all fired reminders with timestamps and actions taken
- **Always-on-top overlay** — Transparent, frameless window at `screen-saver` level (works over fullscreen apps)
- **Click-through** — Window is invisible to mouse when Theo is hidden; interactive only during reminders

## Default Reminders

| Reminder | Interval | Default |
|----------|----------|---------|
| Screen Break | Every 20m | Enabled |
| Hydration | Every 30m | Enabled |
| Stretch | Every 45m | Enabled |
| Posture Check | Every 15m | Disabled |

## Getting Started

### Prerequisites

- macOS
- Node.js 18+
- npm

### Install & Run

```bash
# Clone
git clone https://github.com/Dip686/theo-assistant.git
cd theo-assistant

# Install dependencies
npm install

# Run in dev mode
npm run dev
```

### Dev Shortcuts

- **Cmd+Shift+T** — Trigger a test reminder animation
- **System tray > Show Theo** — Trigger test reminder
- **System tray > Task Panel** — Open the configuration panel

### Build

```bash
# Production build
npm run build

# Package as .app
npm run package
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 35 |
| UI | React 19 + TypeScript 5 |
| Build | electron-vite + Vite 6 |
| Rendering | Canvas 2D (pixel art at 3x scale) |
| Sound | Web Audio API (synthesized) |
| Storage | JSON file at `~/.theo/data.json` |
| Packaging | electron-builder |

## Project Structure

```
src/
  main/                  # Electron main process
    index.ts             # App entry, tray, shortcuts
    ipc.ts               # IPC handler registration
    tray.ts              # System tray with programmatic icon
    reminder/
      engine.ts          # Timer scheduler, idle detection, gentle mode
      store.ts           # JSON file CRUD (reminders, settings, log)
    windows/
      avatarWindow.ts    # Transparent overlay window
      panelWindow.ts     # Task panel window
  preload/
    index.ts             # contextBridge API
  renderer/              # React UI
    App.tsx              # Router (avatar vs panel)
    avatar/
      AvatarCanvas.tsx   # Canvas rendering + IPC listener
      SpeechBubble.tsx   # Reminder popup with snooze/dismiss
      animationController.ts  # State machine (hidden/peek/walk/talk/wave)
      sound.ts           # Doot doot notification sound
    panel/
      PanelApp.tsx       # Tabbed panel (Reminders/Settings/Log)
      ReminderList.tsx   # Reminder CRUD list
      ReminderForm.tsx   # Create/edit reminder form
      SettingsPanel.tsx  # Settings UI
      ActivityLog.tsx    # Reminder history
    sprites/
      drawTheo.ts        # Sprite drawing functions (front/walk/peek/wave)
      primitives.ts      # Pixel drawing helpers + outline
      colors.ts          # Color palette + shirt presets
      walkOffsets.ts     # Walk cycle frame data
  shared/
    types.ts             # Shared interfaces, IPC constants, defaults
```

## License

MIT
