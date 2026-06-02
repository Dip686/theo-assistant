import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let avatarWindow: BrowserWindow | null = null

export function createAvatarWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay()

  // Avatar window covers the bottom-right area for animation
  const winWidth = 600
  const winHeight = 500

  // On Windows, use workArea to avoid placing Theo behind the taskbar.
  // On macOS, use full display.size so Theo covers full-screen apps
  // (visibleOnFullScreen handles the visibility, but size ensures positioning).
  const isWindows = process.platform === 'win32'
  let winX: number, winY: number
  if (isWindows) {
    const { x, y, width, height } = display.workArea
    winX = x + width - winWidth
    winY = y + height - winHeight
  } else {
    const { width, height } = display.size
    winX = width - winWidth
    winY = height - winHeight
  }

  avatarWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
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
    visibleOnAllWorkspaces: true,
    visibleOnFullScreen: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Screen-saver level to appear over full-screen apps
  avatarWindow.setAlwaysOnTop(true, 'screen-saver')

  // Click-through by default (idle state)
  avatarWindow.setIgnoreMouseEvents(true, { forward: true })

  // Load the renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    avatarWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    avatarWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  avatarWindow.on('closed', () => {
    avatarWindow = null
  })

  return avatarWindow
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
