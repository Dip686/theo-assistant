import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/types'

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('theo', {
  // Reminder events (main -> renderer)
  onReminderFire: (callback: (reminder: unknown) => void) => {
    const handler = (_event: unknown, reminder: unknown) => callback(reminder)
    ipcRenderer.on(IPC.REMINDER_FIRE, handler)
    return () => ipcRenderer.removeListener(IPC.REMINDER_FIRE, handler)
  },

  // Reminder actions (renderer -> main)
  snoozeReminder: (reminderId: string, duration: number) =>
    ipcRenderer.send(IPC.REMINDER_SNOOZE, { reminderId, duration }),

  dismissReminder: (reminderId: string) =>
    ipcRenderer.send(IPC.REMINDER_DISMISS, { reminderId }),

  // Avatar window control
  setInteractive: (interactive: boolean) =>
    ipcRenderer.send(IPC.AVATAR_SET_INTERACTIVE, interactive),

  openPanel: () =>
    ipcRenderer.send(IPC.OPEN_PANEL),

  // Reminder CRUD (invoke/handle)
  listReminders: () => ipcRenderer.invoke(IPC.REMINDERS_LIST),
  createReminder: (data: unknown) => ipcRenderer.invoke(IPC.REMINDERS_CREATE, data),
  updateReminder: (data: unknown) => ipcRenderer.invoke(IPC.REMINDERS_UPDATE, data),
  deleteReminder: (id: string) => ipcRenderer.invoke(IPC.REMINDERS_DELETE, id),

  // Settings
  getSettings: () => ipcRenderer.invoke(IPC.SETTINGS_GET),
  saveSettings: (settings: unknown) => ipcRenderer.invoke(IPC.SETTINGS_SAVE, settings),

  // Log
  getLog: () => ipcRenderer.invoke(IPC.LOG_GET),

  // Tasks
  listTasks: () => ipcRenderer.invoke(IPC.TASKS_LIST),
  createTask: (title: string) => ipcRenderer.invoke(IPC.TASKS_CREATE, title),
  updateTask: (data: unknown) => ipcRenderer.invoke(IPC.TASKS_UPDATE, data),
  deleteTask: (id: string) => ipcRenderer.invoke(IPC.TASKS_DELETE, id),
  addTaskNote: (taskId: string, text: string) =>
    ipcRenderer.invoke(IPC.TASKS_ADD_NOTE, { taskId, text }),

  // Calendar
  connectCalendar: () => ipcRenderer.invoke(IPC.CALENDAR_CONNECT),
  disconnectCalendar: () => ipcRenderer.invoke(IPC.CALENDAR_DISCONNECT),
  getCalendarStatus: () => ipcRenderer.invoke(IPC.CALENDAR_STATUS),
  getCalendarEventsToday: () => ipcRenderer.invoke(IPC.CALENDAR_EVENTS_TODAY),
  listCalendars: () => ipcRenderer.invoke(IPC.CALENDAR_LIST),

  // Panel navigation events (main -> renderer)
  onOpenTab: (callback: (tab: string) => void) => {
    const handler = (_event: unknown, tab: string) => callback(tab)
    ipcRenderer.on(IPC.PANEL_OPEN_TAB, handler)
    return () => ipcRenderer.removeListener(IPC.PANEL_OPEN_TAB, handler)
  },
})

// Type declaration for the renderer
export type TheoAPI = typeof import('./preload')
