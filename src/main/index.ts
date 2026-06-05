import { app, globalShortcut, screen } from 'electron'
import { createAvatarWindow, setAvatarInteractive, getAvatarWindow, moveToActiveDisplay, moveToPrimaryDisplay } from './windows/avatarWindow'
import { showPanelWindow } from './windows/panelWindow'
import { createTray, destroyTray } from './tray'
import { registerIpcHandlers } from './ipc'
import { startEngine, stopEngine, setAvatarWindow } from './reminder/engine'
import { loadData, getSettings } from './reminder/store'
import { setCalendarAvatarWindow, startCalendarSync, stopCalendarSync } from './calendar/calendarService'
import { isConnected } from './calendar/googleAuth'
import { IPC } from '../shared/types'

// Hide dock icon — Theo lives in the tray
app.dock?.hide()

app.whenReady().then(() => {
  // Initialize data store (seeds defaults on first launch)
  loadData()

  // Determine active avatar name for UI
  const settings = getSettings()
  const avatarName = settings.avatar === 'missi' ? 'Missi' : 'Theo'

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
      moveToActiveDisplay()
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
    onQuickCapture: () => showPanelWindow('tasks'),
    onQuit: () => app.quit(),
  }, avatarName)

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
    moveToActiveDisplay()
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

  // Quick Capture shortcut: Cmd+Shift+N opens panel on Tasks tab
  const captureRegistered = globalShortcut.register('CommandOrControl+Shift+N', () => {
    console.log('Theo: Quick Capture shortcut triggered!')
    showPanelWindow('tasks')
  })
  console.log(`Theo: Cmd+Shift+N registered: ${captureRegistered}`)

  // Multi-monitor: move to primary display if a monitor is disconnected
  screen.on('display-removed', () => {
    console.log('Theo: Display removed, moving to primary')
    moveToPrimaryDisplay()
  })

  // Start the reminder engine
  startEngine()

  // Start calendar sync if connected and enabled
  setCalendarAvatarWindow(avatarWin)
  if (isConnected() && settings.calendar?.enabled) {
    startCalendarSync()
  }

  console.log(`${avatarName} is running! ${avatarName === 'Missi' ? '👩' : '🧑'}`)
})

app.on('window-all-closed', () => {
  // Don't quit — Theo lives in the tray
})

app.on('will-quit', () => {
  destroyTray()
  stopEngine()
  stopCalendarSync()
  globalShortcut.unregisterAll()
})
