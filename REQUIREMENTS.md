# Theo — Desktop Avatar Assistant

## Overview

Theo is a small, smart pixel-art kid avatar that lives on your desktop. He stays hidden until it's time to nudge you — then he peeks in from the bottom-right corner with a playful animation and delivers a reminder. Think of him as a tiny, opinionated desk buddy who keeps you on track.

---

## Platform & Stack

| Aspect       | Choice                        |
|-------------|-------------------------------|
| Platform    | macOS + Windows               |
| Framework   | Electron 35                   |
| UI          | React 19 + TypeScript 5       |
| Build       | electron-vite + Vite 6        |
| Animation   | Pixel art sprites (Canvas 2D, 64x64 at 3x scale) |
| Window      | Frameless, transparent, always-on-top, click-through when idle |
| Packaging   | electron-builder (.dmg/.zip for Mac, .exe/NSIS for Windows) |
| CI/CD       | GitHub Actions (auto-build on release) |
| Tests       | Vitest                        |

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

## Phase 2 — Productivity Features

### 2A. Quick Capture Todos (Chat-style task manager)

**Problem:** You have an idea or task mid-work but don't want to switch to a separate app. You just want to jot it down quickly and come back to it later.

**Shortcut:** `Cmd+Shift+N` (macOS) / `Ctrl+Shift+N` (Windows)

#### Chat Interface
- Opens a slim chat-style panel with an input field at the bottom
- Type your idea/task → press Enter → saved instantly as a new todo
- Each task becomes a chat-style card showing title + timestamp
- Click any task card to expand → add follow-up notes, progress updates, or context
- Each note is timestamped, creating a thread-like history per task

#### Task Board View
- A second tab with kanban-style columns: **Todo | In Progress | Done**
- Click status chips or drag to move tasks between columns
- Tasks are sorted by most recently updated within each column
- Filter/search across all tasks

#### Data Model
```
Task {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  notes: [{ text: string, createdAt: string }]
  createdAt: string
  updatedAt: string
}
```

#### Storage
- Tasks persist in `~/.theo/data.json` alongside reminders and settings
- Tray icon shows badge with pending todo count (todo + in_progress)

---

### 2B. Meeting-Aware Theo (Google Calendar integration)

**Problem:** Theo interrupts during meetings. And you forget meetings are starting until the last second.

#### Calendar Setup
- One-time Google OAuth2 login (opens browser window, user clicks "Allow")
- Scope: `calendar.readonly` — Theo only reads, never modifies calendar
- Refresh token stored locally in `~/.theo/google-auth.json`
- Settings panel: toggle integration on/off, choose which calendars to watch

#### Meeting Reminders
- **On app start + every 5 minutes:** Fetch today's events from Google Calendar API
- **10 minutes before meeting:** Theo walks in → "📅 {Meeting name} in 10 minutes"
- **1 minute before meeting:** Theo walks in → "📅 {Meeting name} starts in 1 minute!"
- **Before each notification:** Re-fetch the specific event from the API to confirm it still exists
  - If the meeting was **cancelled or rescheduled** → skip the notification silently
  - If the meeting **time changed** → adjust the notification timers accordingly

#### Auto-Suppress During Meetings
- During active meeting time windows (from calendar), Theo auto-suppresses all other reminders (screen break, hydration, stretch, etc.)
- Suppressed reminders are not lost — they fire after the meeting ends
- Visual indicator in tray: "🔇 In meeting until 3:00 PM"

#### Edge Cases
- Back-to-back meetings: suppress reminders for the entire block, fire once after last meeting ends
- All-day events: ignored (not treated as meetings)
- Declined events: ignored (only show accepted/tentative events)
- Multi-calendar: user can select which calendars to watch (e.g., work calendar only, skip personal)

---

### 2C. Multi-Monitor Awareness

**Problem:** Theo always appears on the primary display, even when you're working on a different monitor.

#### Behavior
- On reminder fire: detect which monitor the user's cursor is on → position Theo's window on **that display's** bottom-right corner
- Use `screen.getDisplayNearestPoint(cursorPosition)` instead of `screen.getPrimaryDisplay()`
- Poll cursor position only when a reminder is about to fire (not continuously — lightweight)

#### Display Events
- Listen for `screen.on('display-added')` and `screen.on('display-removed')` 
- On display disconnect: if Theo's window was on the removed display, move to primary
- On display connect: no action needed (next reminder will detect cursor position)

#### Platform-Specific Positioning
- **macOS:** Use `display.size` for fullscreen overlay support (existing behavior)
- **Windows:** Use `display.workArea` to avoid taskbar on whichever monitor it's on

---

## Phase 3 — Smart Assistant (Future)

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
┌──────────────────────────────────────────────┐
│              Electron Main Process            │
│                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────┐ │
│  │ Scheduler │  │ System Events│  │ Google │ │
│  │ (timers)  │  │ (wake/sleep, │  │Calendar│ │
│  │           │  │  lock/unlock)│  │  API   │ │
│  └─────┬─────┘  └──────┬──────┘  └───┬────┘ │
│        │               │             │       │
│        ▼               ▼             ▼       │
│  ┌───────────────────────────────────────┐   │
│  │          Reminder Engine              │   │
│  │  (decides when to fire, suppresses    │   │
│  │   during meetings, multi-monitor)     │   │
│  └──────────────────┬────────────────────┘   │
│                     │                        │
└─────────────────────┼────────────────────────┘
                      │ IPC
┌─────────────────────┼────────────────────────┐
│            Renderer Process                   │
│                     ▼                        │
│  ┌──────────────────────────────────────┐    │
│  │    Avatar Component                  │    │
│  │  (sprite animation engine)           │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │    Task Panel Component              │    │
│  │  (reminder CRUD, settings, calendar) │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │    Quick Capture Panel               │    │
│  │  (chat input, task board / kanban)   │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘

Data: ~/.theo/data.json       (reminders, settings, tasks, log)
Auth: ~/.theo/google-auth.json (Google Calendar OAuth tokens)
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

## Out of Scope

- Linux support
- Voice interaction
- Cloud sync
- Mobile companion app

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
| Windows support | Added in v1.2.0 — NSIS installer + zip via GitHub Actions |
| Multi-monitor | Phase 2C — cursor-based display detection on reminder fire |
| Calendar integration | Google Calendar read-only OAuth, with pre-notify check for cancellations |
| Task capture | Chat-style quick input + kanban board, stored locally |

---

## Build Order (Phase 2)

| Priority | Feature | Rationale |
|----------|---------|-----------|
| 1 | Multi-Monitor (2C) | Smallest scope, single file change, improves existing UX |
| 2 | Quick Capture (2A) | Self-contained UI + data model, no external dependencies |
| 3 | Meeting-Aware (2B) | Needs OAuth + Google API, most complex but highest impact |
