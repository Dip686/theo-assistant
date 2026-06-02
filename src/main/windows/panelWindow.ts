import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let panelWindow: BrowserWindow | null = null

export function createPanelWindow(): BrowserWindow {
  if (panelWindow && !panelWindow.isDestroyed()) {
    panelWindow.show()
    panelWindow.focus()
    return panelWindow
  }

  const display = screen.getPrimaryDisplay()
  const { width: screenWidth } = display.workAreaSize

  panelWindow = new BrowserWindow({
    width: 340,
    height: 600,
    x: screenWidth - 360,
    y: 60,
    resizable: false,
    minimizable: false,
    maximizable: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Load panel view
  if (process.env.ELECTRON_RENDERER_URL) {
    panelWindow.loadURL(process.env.ELECTRON_RENDERER_URL + '#panel')
  } else {
    panelWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'panel' })
  }

  panelWindow.once('ready-to-show', () => {
    panelWindow?.show()
  })

  panelWindow.on('closed', () => {
    panelWindow = null
  })

  return panelWindow
}

export function showPanelWindow(): void {
  createPanelWindow()
}

export function getPanelWindow(): BrowserWindow | null {
  return panelWindow
}
