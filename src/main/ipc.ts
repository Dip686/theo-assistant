import { ipcMain } from 'electron'
import { IPC, Reminder, Settings, Task } from '../shared/types'
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getSettings,
  saveSettings,
  getLog,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addTaskNote,
} from './reminder/store'
import { snoozeReminder, dismissReminder, restartEngine } from './reminder/engine'

export function registerIpcHandlers(callbacks: {
  onSetInteractive: (interactive: boolean) => void
  onOpenPanel: () => void
}): void {
  // Reminder CRUD
  ipcMain.handle(IPC.REMINDERS_LIST, () => getReminders())

  ipcMain.handle(IPC.REMINDERS_CREATE, (_event, data: Omit<Reminder, 'id' | 'createdAt'>) => {
    const reminder = createReminder(data)
    restartEngine()
    return reminder
  })

  ipcMain.handle(IPC.REMINDERS_UPDATE, (_event, data: Reminder) => {
    const reminder = updateReminder(data)
    restartEngine()
    return reminder
  })

  ipcMain.handle(IPC.REMINDERS_DELETE, (_event, id: string) => {
    deleteReminder(id)
    restartEngine()
  })

  // Settings
  ipcMain.handle(IPC.SETTINGS_GET, () => getSettings())

  ipcMain.handle(IPC.SETTINGS_SAVE, (_event, settings: Settings) => {
    const saved = saveSettings(settings)
    restartEngine()
    return saved
  })

  // Log
  ipcMain.handle(IPC.LOG_GET, () => getLog())

  // Reminder actions from renderer
  ipcMain.on(IPC.REMINDER_SNOOZE, (_event, { reminderId, duration }) => {
    snoozeReminder(reminderId, duration)
  })

  ipcMain.on(IPC.REMINDER_DISMISS, (_event, { reminderId }) => {
    dismissReminder(reminderId)
  })

  // Avatar window control
  ipcMain.on(IPC.AVATAR_SET_INTERACTIVE, (_event, interactive: boolean) => {
    callbacks.onSetInteractive(interactive)
  })

  ipcMain.on(IPC.OPEN_PANEL, () => {
    callbacks.onOpenPanel()
  })

  // Task CRUD
  ipcMain.handle(IPC.TASKS_LIST, () => getTasks())

  ipcMain.handle(IPC.TASKS_CREATE, (_event, title: string) => {
    return createTask(title)
  })

  ipcMain.handle(IPC.TASKS_UPDATE, (_event, data: Task) => {
    return updateTask(data)
  })

  ipcMain.handle(IPC.TASKS_DELETE, (_event, id: string) => {
    deleteTask(id)
  })

  ipcMain.handle(IPC.TASKS_ADD_NOTE, (_event, { taskId, text }: { taskId: string; text: string }) => {
    return addTaskNote(taskId, text)
  })
}
