# Theo — Design Specification

## Character Design

### Theo — Character Sheet

| Attribute       | Detail |
|----------------|--------|
| **Age vibe**   | ~10-year-old smart kid |
| **Gender**     | Male |
| **Build**      | Small, slightly thin, energetic |
| **Skin tone**  | Medium warm brown (South Asian) |
| **Hair**       | Black, slightly curly on top, sides trimmed/faded |
| **Face**       | Big expressive eyes, small nose, wide grin when happy |
| **Outfit**     | Plain T-shirt (default: blue, color customizable) + dark jeans |
| **Shoes**      | Simple sneakers |
| **Accessories**| None — clean, minimal look |
| **Art style**  | Pixel art, 64x64 base sprite, rendered at 3x (192x192 on screen) |
| **Personality**| Curious, slightly mischievous, helpful, cheeky wink |

### Color Palette (Default)

```
Skin:       #C68642 (base), #A0622E (shadow), #DBA05A (highlight)
Hair:       #1A1A2E (black), #2D2D44 (highlight)
T-shirt:    #4A90D9 (blue, customizable)
Jeans:      #3D4F6F (dark blue-grey)
Sneakers:   #E8E8E8 (light grey), #CCCCCC (shadow)
Eyes:       #1A1A2E (pupil), #FFFFFF (white)
Mouth:      #C1553A (grin line)
```

### Customizable Outfit Colors (Presets)

Users can change the T-shirt color. Preset options:

| Name        | Hex       |
|------------|-----------|
| Ocean Blue  | `#4A90D9` (default) |
| Forest Green| `#4CAF50` |
| Sunset Red  | `#E74C3C` |
| Purple Haze | `#9B59B6` |
| Mustard     | `#F39C12` |
| Charcoal    | `#34495E` |
| Custom      | Color picker |

---

## Sprite States & Animation

### Sprite Sheet Layout

Each state is a horizontal strip of frames. All sprites are 64x64px.

### Animation Sequence (Reminder Flow)

```
Timeline: 0s ──────────────────────────────────────── ~12s

Phase 1: PEEK (0s - 1.5s)
┌──────────────────────────────────────────────────────────┐
│                                              ┃ 🧑        │
│  Screen edge ──────────────────────────────▶ ┃  (head    │
│                                              ┃   peeks   │
│                                              ┃   in)     │
└──────────────────────────────────────────────────────────┘
Frames: 4 frames, eyes blink, head slides in from right edge
Sound: "wink wink" chime plays at frame 2

Phase 2: WALK IN (1.5s - 3s)
┌──────────────────────────────────────────────────────────┐
│                                         🧑‍🦱 ◀── walking  │
│                                         ╱╲    into view  │
│                                        ╱  ╲              │
└──────────────────────────────────────────────────────────┘
Frames: 6-frame walk cycle, bouncy step, arms swinging
Movement: Slides ~100px left from edge

Phase 3: TALK (3s - 8s or until clicked)
┌──────────────────────────────────────────────────────────┐
│                          ╭──────────────────╮            │
│                          │ Wink wink! Please│            │
│                          │ look away from   │            │
│                          │ the screen! 👀   │            │
│                          ╰──────┬───────────╯            │
│                              🧑‍🦱 ◀── slight bounce,      │
│                              ╱╲    blinking              │
└──────────────────────────────────────────────────────────┘
Frames: 4-frame idle bounce loop
Speech bubble: Appears with a pop animation, pixel-art border
Interaction: Click bubble to dismiss, or auto-dismiss after ~5-8s

Phase 4: WAVE (8s - 9.5s)
┌──────────────────────────────────────────────────────────┐
│                              🧑‍🦱 ◀── hand up, waving     │
│                              ╱╲                          │
└──────────────────────────────────────────────────────────┘
Frames: 4 frames, arm wave animation

Phase 5: WALK OUT (9.5s - 11s)
┌──────────────────────────────────────────────────────────┐
│                                         🧑‍🦱 ──▶ walking  │
│                                         ╱╲    off-screen │
└──────────────────────────────────────────────────────────┘
Frames: 6-frame walk cycle (mirrored), slides right off edge
```

### Gentle Mode (Active Typing)

Same sequence but compressed:
- Skip PEEK, go straight to WALK IN (faster, 1s)
- TALK phase: auto-dismiss in ~4s (smaller speech bubble)
- WAVE: 2 frames only
- Total: ~7s instead of ~12s

### All Sprite States

| State       | Frames | Loop? | Size    | Notes |
|------------|--------|-------|---------|-------|
| `peek`     | 4      | No    | 64x64   | Head slides in, eyes blink |
| `walk_in`  | 6      | Yes   | 64x64   | Bouncy walk cycle, play until position reached |
| `talk`     | 4      | Yes   | 64x64   | Idle bounce while speech bubble is showing |
| `wave`     | 4      | No    | 64x64   | Hand wave, friendly goodbye |
| `walk_out` | 6      | Yes   | 64x64   | Walk cycle mirrored, play until off-screen |
| `click`    | 4      | No    | 64x64   | Happy jump or sparkle reaction |
| `sleep`    | 2      | Yes   | 64x64   | Eyes closed, "zzz" floating pixels |

**Total frames needed: ~30 unique frames**

---

## UI Design — Task Panel

### Layout

```
╔══════════════════════════════════════╗
║  🧑 Theo                    ─  ×    ║  ← Title bar (draggable, minimal)
╠══════════════════════════════════════╣
║                                      ║
║  ┌─ Active Reminders ─────────────┐  ║
║  │                                │  ║
║  │  🔵 Screen Break    20min  ✏️ 🔘 │  ║  ← Toggle on/off, edit
║  │  🔵 Hydration       30min  ✏️ 🔘 │  ║
║  │  🔵 Stretch          45min  ✏️ 🔘 │  ║
║  │  ⚫ Posture Check   15min  ✏️ 🔘 │  ║  ← Disabled (grey)
║  │                                │  ║
║  │  [ + Add Reminder ]            │  ║
║  └────────────────────────────────┘  ║
║                                      ║
║  ┌─ Recent ───────────────────────┐  ║
║  │  10:30  Screen Break     ✓     │  ║
║  │  10:15  Hydration        ✓     │  ║
║  │  10:00  Stretch          snoozed│ ║
║  └────────────────────────────────┘  ║
║                                      ║
║  ⚙️ Settings                         ║
╚══════════════════════════════════════╝

Width: 320px
Height: ~480px (scrollable)
Style: Dark theme (matches pixel art aesthetic)
        Rounded corners, subtle pixel-art border
        Monospace or pixel-style font for headings
```

### Add/Edit Reminder Form

```
╔══════════════════════════════════════╗
║  ← Back       Add Reminder          ║
╠══════════════════════════════════════╣
║                                      ║
║  Name:    [________________________] ║
║                                      ║
║  Message: [________________________] ║
║           [________________________] ║
║                                      ║
║  Type:    (•) Every __ minutes       ║
║           ( ) At specific time       ║
║                                      ║
║  Interval: [ 20 ] minutes           ║
║                                      ║
║  [ Save Reminder ]                   ║
╚══════════════════════════════════════╝
```

### Settings Panel

```
╔══════════════════════════════════════╗
║  ← Back       Settings              ║
╠══════════════════════════════════════╣
║                                      ║
║  Sound                               ║
║  ├─ Enable sound        [🔘 ON ]    ║
║  └─ Volume              [████░░]    ║
║                                      ║
║  Quiet Hours                         ║
║  ├─ Enable              [🔘 OFF]    ║
║  ├─ From                [22:00 ]    ║
║  └─ To                  [07:00 ]    ║
║                                      ║
║  Appearance                          ║
║  ├─ Animation speed     [Normal▼]   ║
║  └─ T-shirt color       [🔵▼    ]   ║
║                                      ║
║  System                              ║
║  ├─ Start on login      [🔘 ON ]    ║
║  └─ Respect DND         [🔘 ON ]    ║
║                                      ║
╚══════════════════════════════════════╝
```

### Design Tokens

```
Colors (Dark Theme):
  Background:     #1E1E2E
  Surface:        #2A2A3E
  Border:         #3A3A5E
  Text primary:   #E8E8F0
  Text secondary: #8888A0
  Accent:         #4A90D9 (matches default T-shirt)
  Success:        #4CAF50
  Warning:        #F39C12
  Danger:         #E74C3C

Typography:
  Headings:       "Press Start 2P" (pixel font) or "Silkscreen"
  Body:           "Inter" or system font
  Mono:           "JetBrains Mono"

Spacing:
  Base unit:      8px
  Panel padding:  16px
  Card gap:       8px

Border radius:
  Cards:          8px
  Buttons:        4px
  Panel:          12px
```

### Snooze Popup (on reminder)

```
╭────────────────────────────────╮
│  Snooze?                       │
│                                │
│  [ 5 min ]  [ 10 min ]  [ ✕ ] │
╰────────────────────────────────╯
Appears when clicking the speech bubble's snooze icon
```

---

## System Tray

```
Menu bar icon: Tiny 16x16 pixel Theo head

Right-click menu:
┌──────────────────────┐
│  Show Theo           │
│  Task Panel...       │
│  ──────────────────  │
│  Pause (30 min)      │
│  Quiet Hours: OFF    │
│  ──────────────────  │
│  Settings...         │
│  Quit Theo           │
└──────────────────────┘
```

---

## File Structure (Assets)

```
assets/
├── sprites/
│   ├── theo-peek.png        (4 frames × 64px = 256x64 strip)
│   ├── theo-walk.png        (6 frames × 64px = 384x64 strip)
│   ├── theo-talk.png        (4 frames × 64px = 256x64 strip)
│   ├── theo-wave.png        (4 frames × 64px = 256x64 strip)
│   ├── theo-click.png       (4 frames × 64px = 256x64 strip)
│   ├── theo-sleep.png       (2 frames × 64px = 128x64 strip)
│   └── theo-tray.png        (16x16 menu bar icon)
├── sounds/
│   ├── wink-wink.mp3        (gentle chime, <1s)
│   └── dismiss.mp3          (soft click, <0.5s)
├── speech-bubble/
│   └── bubble-9patch.png    (pixel art 9-patch for speech bubble)
└── ui/
    └── icons/               (edit, toggle, add, settings icons in pixel style)
```
