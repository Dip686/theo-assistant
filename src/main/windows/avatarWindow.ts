import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let avatarWindow: BrowserWindow | null = null

export function createAvatarWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay()
  // Use full screen size (not workArea) so Theo covers full-screen apps too
  const { width: screenWidth, height: screenHeight } = display.size

  // Avatar window covers the bottom-right area for animation
  const winWidth = 600
  const winHeight = 500

  avatarWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: screenWidth - winWidth,
    y: screenHeight - winHeight,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    show: true,
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
