// ============================================================
// Shared types between main and renderer processes
// ============================================================

export interface Reminder {
  id: string
  name: string
  message: string
  type: 'interval' | 'scheduled'
  intervalMinutes?: number
  scheduledTime?: string // HH:mm
  enabled: boolean
  createdAt: string
}

export interface Settings {
  soundEnabled: boolean
  volume: number // 0-1
  quietHours: {
    enabled: boolean
    from: string // HH:mm
    to: string   // HH:mm
  }
  shirtColor: string
  animationSpeed: 'slow' | 'normal' | 'fast'
  respectDND: boolean
  startOnLogin: boolean
}

export interface ReminderLogEntry {
  reminderId: string
  reminderName: string
  firedAt: string
  action: 'acknowledged' | 'snoozed' | 'auto-dismissed'
  snoozeDuration?: number
}

export interface TheoData {
  reminders: Reminder[]
  settings: Settings
  log: ReminderLogEntry[]
}

// IPC Channel names
export const IPC = {
  // Main -> Renderer
  REMINDER_FIRE: 'reminder:fire',

  // Renderer -> Main
  REMINDER_SNOOZE: 'reminder:snooze',
  REMINDER_DISMISS: 'reminder:dismiss',
  AVATAR_SET_INTERACTIVE: 'avatar:set-interactive',
  OPEN_PANEL: 'panel:open',

  // Invoke/Handle (bidirectional)
  REMINDERS_LIST: 'reminders:list',
  REMINDERS_CREATE: 'reminders:create',
  REMINDERS_UPDATE: 'reminders:update',
  REMINDERS_DELETE: 'reminders:delete',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save',
  LOG_GET: 'log:get',
} as const

// Default reminders that ship with the app
export const DEFAULT_REMINDERS: Omit<Reminder, 'id' | 'createdAt'>[] = [
  {
    name: 'Screen Break',
    message: 'Wink wink! Please look away from the screen for 20 seconds. 👀',
    type: 'interval',
    intervalMinutes: 20,
    enabled: true,
  },
  {
    name: 'Hydration',
    message: 'Hey! Time to drink some water. 💧',
    type: 'interval',
    intervalMinutes: 30,
    enabled: true,
  },
  {
    name: 'Stretch',
    message: 'Quick stretch? Your back will thank you! 🙆',
    type: 'interval',
    intervalMinutes: 45,
    enabled: true,
  },
  {
    name: 'Posture Check',
    message: 'Sit up straight, boss! 🧘',
    type: 'interval',
    intervalMinutes: 15,
    enabled: false,
  },
]

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  volume: 0.7,
  quietHours: {
    enabled: false,
    from: '22:00',
    to: '07:00',
  },
  shirtColor: '#4A90D9',
  animationSpeed: 'normal',
  respectDND: true,
  startOnLogin: false,
}
