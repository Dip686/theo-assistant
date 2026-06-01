import { app, globalShortcut } from 'electron'
import { createAvatarWindow, setAvatarInteractive, getAvatarWindow } from './windows/avatarWindow'
import { showPanelWindow } from './windows/panelWindow'
import { createTray, destroyTray } from './tray'
import { registerIpcHandlers } from './ipc'
import { startEngine, stopEngine, setAvatarWindow } from './reminder/engine'
import { loadData } from './reminder/store'
import { IPC } from '../shared/types'

// Hide dock icon — Theo lives in the tray
app.dock?.hide()

app.whenReady().then(() => {
  // Initialize data store (seeds defaults on first launch)
  loadData()

  // Create the transparent avatar overlay window
  const avatarWin = createAvatarWindow()
  setAvatarWindow(avatarWin)

  // Register IPC handlers
  registerIpcHandlers({
    onSetInteractive: (interactive) => setAvatarInteractive(interactive),
    onOpenPanel: () => showPanelWindow(),
  })

  // Create system tray
  createTray({
    onShowTheo: () => {
      // Trigger a test reminder animation
      const win = getAvatarWindow()
      if (win && !win.isDestroyed()) {
        win.webContents.send(IPC.REMINDER_FIRE, {
          id: 'test',
          name: 'Test',
          message: 'Wink wink! Just checking in. 👀',
          type: 'interval',
          enabled: true,
          gentleMode: false,
        })
      }
    },
    onOpenPanel: () => showPanelWindow(),
    onQuit: () => app.quit(),
  })

  // Pipe renderer console to main process stdout for debugging
  avatarWin.webContents.on('console-message', (_event, _level, message) => {
    console.log(`[renderer] ${message}`)
  })

  // Open devTools in dev mode for debugging
  if (process.env.ELECTRON_RENDERER_URL) {
    avatarWin.webContents.openDevTools({ mode: 'detach' })
  }

  // Dev shortcut: Cmd+Shift+T triggers test reminder
  const registered = globalShortcut.register('CommandOrControl+Shift+T', () => {
    console.log('Theo: Test shortcut triggered!')
    const win = getAvatarWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC.REMINDER_FIRE, {
        id: 'test',
        name: 'Test',
        message: 'Wink wink! Please look away from the screen for 20 seconds. 👀',
        type: 'interval',
        enabled: true,
        gentleMode: false,
      })
      console.log('Theo: Sent reminder:fire to renderer')
    } else {
      console.log('Theo: Avatar window not found or destroyed!')
    }
  })
  console.log(`Theo: Cmd+Shift+T registered: ${registered}`)

  // Start the reminder engine
  startEngine()

  console.log('Theo is running! 🧑')
})

app.on('window-all-closed', () => {
  // Don't quit — Theo lives in the tray
})

app.on('will-quit', () => {
  destroyTray()
  stopEngine()
  globalShortcut.unregisterAll()
})
