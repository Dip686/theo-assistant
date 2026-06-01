import { BrowserWindow, powerMonitor } from 'electron'
import { Reminder, IPC, ReminderLogEntry } from '../../shared/types'
import { getReminders, getSettings, addLogEntry } from './store'

interface TimerEntry {
  reminderId: string
  timer: ReturnType<typeof setTimeout>
  lastFiredAt: number
}

let timers: TimerEntry[] = []
let avatarWindow: BrowserWindow | null = null
let currentReminder: Reminder | null = null
let isSystemIdle = false
let powerMonitorRegistered = false

export function setAvatarWindow(win: BrowserWindow): void {
  avatarWindow = win
}

export function getCurrentReminder(): Reminder | null {
  return currentReminder
}

function isQuietHoursActive(): boolean {
  const settings = getSettings()
  if (!settings.quietHours.enabled) return false

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [fromH, fromM] = settings.quietHours.from.split(':').map(Number)
  const [toH, toM] = settings.quietHours.to.split(':').map(Number)
  const fromMinutes = fromH * 60 + fromM
  const toMinutes = toH * 60 + toM

  if (fromMinutes <= toMinutes) {
    // Same day range (e.g., 09:00 - 17:00)
    return currentMinutes >= fromMinutes && currentMinutes < toMinutes
  } else {
    // Overnight range (e.g., 22:00 - 07:00)
    return currentMinutes >= fromMinutes || currentMinutes < toMinutes
  }
}

function fireReminder(reminder: Reminder): void {
  if (!avatarWindow || avatarWindow.isDestroyed()) return

  // Check quiet hours
  if (isQuietHoursActive()) {
    console.log(`Theo: Quiet hours active, skipping "${reminder.name}"`)
    return
  }

  // Check if system is idle (screen locked/sleeping)
  if (isSystemIdle) {
    console.log(`Theo: System idle, skipping "${reminder.name}"`)
    return
  }

  // Detect gentle mode: if idle time < 2 seconds, user is actively typing
  const idleTime = powerMonitor.getSystemIdleTime()
  const gentleMode = idleTime < 2

  currentReminder = reminder
  avatarWindow.webContents.send(IPC.REMINDER_FIRE, {
    ...reminder,
    gentleMode,
  })

  console.log(`Theo: Firing "${reminder.name}" (gentle: ${gentleMode})`)
}

function scheduleIntervalReminder(reminder: Reminder): void {
  if (!reminder.intervalMinutes || !reminder.enabled) return

  const ms = reminder.intervalMinutes * 60 * 1000

  const timer = setTimeout(() => {
    fireReminder(reminder)

    // Remove old timer entry
    timers = timers.filter((t) => t.reminderId !== reminder.id)

    // Re-schedule
    scheduleIntervalReminder(reminder)
  }, ms)

  timers.push({
    reminderId: reminder.id,
    timer,
    lastFiredAt: Date.now(),
  })
}

function scheduleScheduledReminder(reminder: Reminder): void {
  if (!reminder.scheduledTime || !reminder.enabled) return

  const [hours, minutes] = reminder.scheduledTime.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)

  // If the time has already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }

  const ms = target.getTime() - now.getTime()

  const timer = setTimeout(() => {
    fireReminder(reminder)
    timers = timers.filter((t) => t.reminderId !== reminder.id)
    // Re-schedule for next day
    scheduleScheduledReminder(reminder)
  }, ms)

  timers.push({
    reminderId: reminder.id,
    timer,
    lastFiredAt: Date.now(),
  })
}

export function snoozeReminder(reminderId: string, durationMinutes: number): void {
  const reminders = getReminders()
  const reminder = reminders.find((r) => r.id === reminderId)
  if (!reminder) return

  addLogEntry({
    reminderId,
    reminderName: reminder.name,
    firedAt: new Date().toISOString(),
    action: 'snoozed',
    snoozeDuration: durationMinutes,
  })

  const ms = durationMinutes * 60 * 1000
  setTimeout(() => fireReminder(reminder), ms)
  currentReminder = null
}

export function dismissReminder(reminderId: string, action: ReminderLogEntry['action'] = 'acknowledged'): void {
  const reminders = getReminders()
  const reminder = reminders.find((r) => r.id === reminderId)
  if (!reminder) return

  addLogEntry({
    reminderId,
    reminderName: reminder.name,
    firedAt: new Date().toISOString(),
    action,
  })

  currentReminder = null
}

export function startEngine(): void {
  // Clear existing timers
  stopEngine()

  const reminders = getReminders()
  for (const reminder of reminders) {
    if (!reminder.enabled) continue

    if (reminder.type === 'interval') {
      scheduleIntervalReminder(reminder)
    } else if (reminder.type === 'scheduled') {
      scheduleScheduledReminder(reminder)
    }
  }

  // Monitor system state (register once)
  if (!powerMonitorRegistered) {
    powerMonitorRegistered = true
    powerMonitor.on('suspend', () => { isSystemIdle = true })
    powerMonitor.on('resume', () => { isSystemIdle = false })
    powerMonitor.on('lock-screen', () => { isSystemIdle = true })
    powerMonitor.on('unlock-screen', () => { isSystemIdle = false })
  }

  console.log(`Theo: Engine started with ${reminders.filter((r) => r.enabled).length} active reminders`)
}

export function stopEngine(): void {
  for (const entry of timers) {
    clearTimeout(entry.timer)
  }
  timers = []
}

export function restartEngine(): void {
  stopEngine()
  startEngine()
}
