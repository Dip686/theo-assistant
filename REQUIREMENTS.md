# Theo — Desktop Avatar Assistant

## Overview

Theo is a small, smart pixel-art kid avatar that lives on your macOS desktop. He stays hidden until it's time to nudge you — then he peeks in from the bottom-right corner with a playful animation and delivers a reminder. Think of him as a tiny, opinionated desk buddy who keeps you on track.

---

## Platform & Stack

| Aspect       | Choice                        |
|-------------|-------------------------------|
| Platform    | macOS only (v1)               |
| Framework   | Electron                      |
| UI          | React + TypeScript            |
| Animation   | Pixel art sprites (sprite sheets) |
| Window      | Frameless, transparent, always-on-top, click-through when idle |

---

## Phase 1 — Core: Timed Reminders

### Avatar Behavior

1. **Idle state**: Theo is completely hidden. No dock icon, no menu bar clutter. Just a system tray icon for access.
2. **Trigger animation**: When a reminder fires:
   - Theo peeks from behind the bottom-right edge of the screen (small head popping in).
   - He walks/slides into view with a bouncy pixel-art walk cycle.
   - A speech bubble appears with the reminder message.
   - After the message is acknowledged (click) or times out (~10s), he waves and walks back off-screen.
3. **Click interaction**: Clicking on Theo (when visible) opens a **Task Panel** — a small, clean floating window.

### Sound

- Theo plays a gentle **"wink wink" sound effect** when appearing (soft, pixel-game style chime).
- Sound can be toggled on/off in settings.
- Volume is configurable.

### Reminder System

| Feature                  | Details |
|--------------------------|---------|
| **Interval reminders**   | Repeat every N minutes (e.g., "look away every 20min", "drink water every 30min") |
| **Scheduled reminders**  | Fire at a specific time (e.g., "standup at 9:45 AM") |
| **Active-only**          | Interval reminders only count when the laptop is awake and unlocked |
| **Snooze**               | User can snooze a reminder for 5min / 10min / skip once |
| **Quiet hours**          | Configurable quiet period where Theo won't appear (e.g., during meetings) |
| **Full-screen behavior** | **Force overlay** — Theo appears on top of everything, even full-screen apps. The Electron window uses `alwaysOnTop` with `screen-saver` level to ensure visibility. |
| **Gentle mode**          | When the user is actively typing, Theo still appears but in a smaller/subtler animation and auto-dismisses faster (~5s instead of ~10s). Reduces disruption without skipping the reminder. |
| **macOS Focus/DND**      | Theo **respects macOS Focus modes**. When Do Not Disturb or any Focus mode is active, Theo stays silent. Reminders are queued and delivered when Focus ends. |

### Default Reminders (Pre-loaded)

These come out of the box. User can edit or disable them.

| Reminder              | Type     | Interval | Message |
|----------------------|----------|----------|---------|
| Screen break         | Interval | 20 min   | "Wink wink! Please look away from the screen for 20 seconds." |
| Hydration            | Interval | 30 min   | "Hey! Time to drink some water." |
| Stretch              | Interval | 45 min   | "Quick stretch? Your back will thank you!" |
| Posture check        | Interval | 15 min   | "Sit up straight, boss!" |

### Task Panel (opened by clicking Theo)

A compact floating panel with:

- **Active reminders list** — toggle on/off, edit interval/time, edit message
- **Add new reminder** — form with: name, message, type (interval/scheduled), timing
- **Reminder log** — simple history of recent reminders fired
- **Settings** — quiet hours, animation speed, sound on/off, volume, outfit color customization

---

## Phase 2 — Smart Assistant (Future)

### Markdown File Watcher

- Theo watches a user-configured folder for `.md` files.
- He parses them for tasks, notes, and context.
- Use cases:
  - Daily TODO list in `today.md` — Theo reminds you of unfinished items.
  - Meeting notes with action items — Theo surfaces them at relevant times.
  - Personal knowledge base — Theo can reference it when answering questions.

### AI Agent Integration

- Connect Theo to AI APIs (Claude, etc.) via configurable API keys.
- Possible capabilities:
  - Ask Theo a question via the chat panel → get an AI-powered answer.
  - Theo proactively suggests tasks based on your markdown files.
  - Theo summarizes your day based on completed/skipped reminders.
  - Voice interaction (stretch goal).

---

## Avatar Design — Theo

### Character Description

- **Age vibe**: ~10-year-old kid, smart and slightly mischievous
- **Style**: Pixel art, ~32x32 or 64x64 base sprite, rendered at 2-4x on screen
- **Palette**: Warm, friendly colors — not neon, not muted
- **Outfit customization**: Dress/outfit design stays fixed; user can change the **color** of the outfit via settings (pick from a preset palette or color picker)
- **Personality in animation**: Curious head tilts, exaggerated blinks, bouncy walk

### Required Sprite States

| State        | Description |
|-------------|-------------|
| `idle`      | Not shown (off-screen) |
| `peek`      | Head popping in from screen edge, eyes looking at user |
| `walk_in`   | Walking onto screen from the right edge |
| `talk`      | Standing with speech bubble, slight bounce animation |
| `wave`      | Waving goodbye before leaving |
| `walk_out`  | Walking back off-screen |
| `click`     | Reaction when clicked (happy jump or sparkle) |
| `sleep`     | Quiet hours mode — shown briefly with "zzz" if user tries to interact |

---

## Technical Architecture

```
┌─────────────────────────────────────┐
│           Electron Main Process     │
│                                     │
│  ┌──────────┐   ┌────────────────┐  │
│  │ Scheduler │   │ System Events  │  │
│  │ (timers,  │   │ (wake/sleep,   │  │
│  │  cron)    │   │  lock/unlock)  │  │
│  └─────┬─────┘   └──────┬────────┘  │
│        │                │            │
│        ▼                ▼            │
│  ┌──────────────────────────────┐   │
│  │     Reminder Engine          │   │
│  │  (decides when to fire)      │   │
│  └──────────────┬───────────────┘   │
│                 │                    │
└─────────────────┼────────────────────┘
                  │ IPC
┌─────────────────┼────────────────────┐
│           Renderer Process           │
│                 ▼                    │
│  ┌──────────────────────────────┐   │
│  │    Avatar Component          │   │
│  │  (sprite animation engine)   │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │    Task Panel Component      │   │
│  │  (reminder CRUD, settings)   │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘

Data: JSON file for reminders + settings (~/.theo/data.json)
```

---

## Non-Functional Requirements

| Requirement       | Target |
|-------------------|--------|
| Memory usage      | < 80MB idle |
| CPU (idle)        | ~0% (no animation running) |
| CPU (animation)   | < 5% during sprite animation |
| Startup time      | < 2 seconds |
| Persistence       | Reminders survive app restart |
| Auto-launch       | Option to start on login |

---

## Out of Scope (v1)

- Windows / Linux support
- Voice interaction
- Cloud sync
- Mobile companion app
- Multi-monitor support (v1 picks primary display)

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Sound | Yes — gentle "wink wink" pixel sfx when appearing, configurable |
| Avatar customization | Outfit design is fixed; outfit **color** is customizable |
| Full-screen behavior | Force overlay — Theo appears on top of everything |
| Active typing | Gentle mode — smaller animation, faster auto-dismiss (~5s) |
| macOS Focus/DND | Theo respects it — goes silent, queues reminders |
| Data format | JSON file (`~/.theo/data.json`) |
