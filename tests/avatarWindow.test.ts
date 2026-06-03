import { describe, it, expect } from 'vitest'
import { computeWindowPosition, WIN_WIDTH, WIN_HEIGHT } from '../src/main/windows/avatarWindow'

// ─── Simulated display configs ────────────────────────────────────────────
const MAC_DISPLAY = {
  size: { width: 1512, height: 982 },          // MacBook Pro 14" logical
  workArea: { x: 0, y: 37, width: 1512, height: 873 },  // minus menu bar + dock
}

const MAC_EXTERNAL = {
  size: { width: 2560, height: 1440 },
  workArea: { x: 0, y: 37, width: 2560, height: 1403 },
}

const WIN_1080P = {
  size: { width: 1920, height: 1080 },
  workArea: { x: 0, y: 0, width: 1920, height: 1040 },  // taskbar at bottom ~40px
}

const WIN_1440P = {
  size: { width: 2560, height: 1440 },
  workArea: { x: 0, y: 0, width: 2560, height: 1400 },
}

const WIN_TASKBAR_LEFT = {
  size: { width: 1920, height: 1080 },
  workArea: { x: 60, y: 0, width: 1860, height: 1080 },  // taskbar on left
}

// ─── Window position tests ────────────────────────────────────────────────

describe('computeWindowPosition', () => {
  describe('macOS — uses full display.size (fullscreen overlay support)', () => {
    it('positions at bottom-right of full screen on MacBook', () => {
      const pos = computeWindowPosition('darwin', MAC_DISPLAY.size, MAC_DISPLAY.workArea)

      expect(pos.x).toBe(MAC_DISPLAY.size.width - WIN_WIDTH)    // 1512 - 600 = 912
      expect(pos.y).toBe(MAC_DISPLAY.size.height - WIN_HEIGHT)  // 982 - 500 = 482
    })

    it('positions at bottom-right of full screen on external monitor', () => {
      const pos = computeWindowPosition('darwin', MAC_EXTERNAL.size, MAC_EXTERNAL.workArea)

      expect(pos.x).toBe(2560 - WIN_WIDTH)
      expect(pos.y).toBe(1440 - WIN_HEIGHT)
    })

    it('ignores workArea (menu bar / dock) on macOS', () => {
      const pos = computeWindowPosition('darwin', MAC_DISPLAY.size, MAC_DISPLAY.workArea)

      // Should NOT use workArea.y offset — y should be relative to full screen
      expect(pos.y).toBe(MAC_DISPLAY.size.height - WIN_HEIGHT)
      expect(pos.y).not.toBe(MAC_DISPLAY.workArea.y + MAC_DISPLAY.workArea.height - WIN_HEIGHT)
    })
  })

  describe('Windows — uses workArea (avoids taskbar)', () => {
    it('positions above bottom taskbar on 1080p', () => {
      const pos = computeWindowPosition('win32', WIN_1080P.size, WIN_1080P.workArea)

      // Bottom of window should be at workArea bottom (1040), NOT full screen bottom (1080)
      expect(pos.x).toBe(1920 - WIN_WIDTH)       // 1320
      expect(pos.y).toBe(1040 - WIN_HEIGHT)       // 540
      expect(pos.y + WIN_HEIGHT).toBe(1040)        // window bottom = taskbar top
    })

    it('positions above bottom taskbar on 1440p', () => {
      const pos = computeWindowPosition('win32', WIN_1440P.size, WIN_1440P.workArea)

      expect(pos.y + WIN_HEIGHT).toBe(1400) // above 40px taskbar
    })

    it('does NOT place window behind taskbar', () => {
      const pos = computeWindowPosition('win32', WIN_1080P.size, WIN_1080P.workArea)

      // Window bottom must not exceed workArea bottom
      const windowBottom = pos.y + WIN_HEIGHT
      const workAreaBottom = WIN_1080P.workArea.y + WIN_1080P.workArea.height
      expect(windowBottom).toBeLessThanOrEqual(workAreaBottom)
    })

    it('handles taskbar on left side', () => {
      const pos = computeWindowPosition('win32', WIN_TASKBAR_LEFT.size, WIN_TASKBAR_LEFT.workArea)

      // x should account for the left taskbar offset
      expect(pos.x).toBe(60 + 1860 - WIN_WIDTH)  // 1320
      // y should use full workArea height since taskbar is on the side
      expect(pos.y).toBe(1080 - WIN_HEIGHT)
    })
  })

  describe('Linux — same behavior as macOS', () => {
    it('uses full display size on Linux', () => {
      const pos = computeWindowPosition('linux', MAC_DISPLAY.size, MAC_DISPLAY.workArea)
      const macPos = computeWindowPosition('darwin', MAC_DISPLAY.size, MAC_DISPLAY.workArea)

      expect(pos).toEqual(macPos)
    })
  })
})

// ─── Multi-monitor scenarios ──────────────────────────────────────────────

describe('Multi-monitor positioning', () => {
  // Second monitor to the right of the primary (macOS)
  const SECONDARY_RIGHT = {
    size: { width: 1920, height: 1080 },
    workArea: { x: 1512, y: 0, width: 1920, height: 1080 },  // offset x = primary width
  }

  // Second monitor to the left (Windows)
  const SECONDARY_LEFT_WIN = {
    size: { width: 1920, height: 1080 },
    workArea: { x: -1920, y: 0, width: 1920, height: 1040 },  // negative x, taskbar
  }

  // Monitor above the primary
  const SECONDARY_ABOVE = {
    size: { width: 2560, height: 1440 },
    workArea: { x: 0, y: -1440, width: 2560, height: 1440 },
  }

  it('macOS: positions correctly on a secondary monitor to the right', () => {
    const pos = computeWindowPosition('darwin', SECONDARY_RIGHT.size, SECONDARY_RIGHT.workArea)

    // Should use display.size for macOS, but position is relative to display origin
    // For macOS, computeWindowPosition returns position relative to (0,0) of the display's size
    // The actual offset is handled by Electron's display bounds
    expect(pos.x).toBe(SECONDARY_RIGHT.size.width - WIN_WIDTH) // 1920 - 600 = 1320
    expect(pos.y).toBe(SECONDARY_RIGHT.size.height - WIN_HEIGHT) // 1080 - 500 = 580
  })

  it('Windows: positions correctly on a secondary monitor to the left (negative x)', () => {
    const pos = computeWindowPosition('win32', SECONDARY_LEFT_WIN.size, SECONDARY_LEFT_WIN.workArea)

    // workArea.x is -1920, so window should be at -1920 + 1920 - 600 = -600
    expect(pos.x).toBe(-1920 + 1920 - WIN_WIDTH)  // -600
    expect(pos.y).toBe(1040 - WIN_HEIGHT)          // 540
    // Window bottom stays above taskbar
    expect(pos.y + WIN_HEIGHT).toBe(1040)
  })

  it('Windows: positions correctly on a monitor above', () => {
    const pos = computeWindowPosition('win32', SECONDARY_ABOVE.size, SECONDARY_ABOVE.workArea)

    // workArea.y is -1440
    expect(pos.y).toBe(-1440 + 1440 - WIN_HEIGHT)  // -500
    expect(pos.y + WIN_HEIGHT).toBe(0)  // bottom edge at y=0 (top of primary)
  })
})

// ─── Window dimensions ────────────────────────────────────────────────────

describe('Window dimensions', () => {
  it('has correct default dimensions', () => {
    expect(WIN_WIDTH).toBe(600)
    expect(WIN_HEIGHT).toBe(500)
  })
})
