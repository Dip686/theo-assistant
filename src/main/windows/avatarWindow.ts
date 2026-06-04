import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let avatarWindow: BrowserWindow | null = null

/** Window dimensions for the avatar overlay */
export const WIN_WIDTH = 600
export const WIN_HEIGHT = 500

/**
 * Compute the avatar window position based on platform and display info.
 * Pure function — easy to unit test without Electron runtime.
 */
export function computeWindowPosition(
  platform: string,
  displaySize: { width: number; height: number },
  workArea: { x: number; y: number; width: number; height: number }
): { x: number; y: number } {
  if (platform === 'win32') {
    // Windows: use workArea to stay above the taskbar
    return {
      x: workArea.x + workArea.width - WIN_WIDTH,
      y: workArea.y + workArea.height - WIN_HEIGHT,
    }
  }
  // macOS / Linux: use full display size so window covers full-screen apps
  return {
    x: displaySize.width - WIN_WIDTH,
    y: displaySize.height - WIN_HEIGHT,
  }
}

export function createAvatarWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay()
  const { x: winX, y: winY } = computeWindowPosition(
    process.platform,
    display.size,
    display.workArea
  )

  avatarWindow = new BrowserWindow({
    width: WIN_WIDTH,
    height: WIN_HEIGHT,
    x: winX,
    y: winY,
    title: '', // Prevent window title tooltip on Windows
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    show: true,
    // Explicit transparent background — fixes white flash / residual block on Windows
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Explicitly set after creation — constructor options alone are unreliable on macOS
  avatarWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  avatarWindow.setAlwaysOnTop(true, 'screen-saver')

  // Click-through by default (idle state)
  avatarWindow.setIgnoreMouseEvents(true, { forward: true })

  // Load the renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    avatarWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    avatarWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Re-apply transparent background after page loads — fixes Windows rendering artifact
  avatarWindow.webContents.on('did-finish-load', () => {
    avatarWindow?.setBackgroundColor('#00000000')
  })

  avatarWindow.on('closed', () => {
    avatarWindow = null
  })

  return avatarWindow
}

/**
 * Move the avatar window to the bottom-right of whichever display
 * the user's cursor is currently on. Called before firing a reminder
 * so Theo appears on the active monitor.
 */
export function moveToActiveDisplay(): void {
  if (!avatarWindow || avatarWindow.isDestroyed()) return

  const cursor = screen.getCursorScreenPoint()
  const activeDisplay = screen.getDisplayNearestPoint(cursor)
  const { x, y } = computeWindowPosition(
    process.platform,
    activeDisplay.size,
    activeDisplay.workArea
  )

  avatarWindow.setPosition(x, y)
}

/**
 * Move the avatar window back to the primary display.
 * Used when a monitor is disconnected.
 */
export function moveToPrimaryDisplay(): void {
  if (!avatarWindow || avatarWindow.isDestroyed()) return

  const primary = screen.getPrimaryDisplay()
  const { x, y } = computeWindowPosition(
    process.platform,
    primary.size,
    primary.workArea
  )

  avatarWindow.setPosition(x, y)
}

export function setAvatarInteractive(interactive: boolean): void {
  if (!avatarWindow || avatarWindow.isDestroyed()) return

  if (interactive) {
    avatarWindow.setIgnoreMouseEvents(false)
    avatarWindow.setFocusable(true)
  } else {
    avatarWindow.setIgnoreMouseEvents(true, { forward: true })
    avatarWindow.setFocusable(false)
  }
}

export function getAvatarWindow(): BrowserWindow | null {
  return avatarWindow
}
