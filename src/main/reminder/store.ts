import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { v4 as uuid } from 'uuid'
import {
  TheoData,
  Reminder,
  Settings,
  ReminderLogEntry,
  DEFAULT_REMINDERS,
  DEFAULT_SETTINGS,
} from '../../shared/types'

const DATA_DIR = join(homedir(), '.theo')
const DATA_FILE = join(DATA_DIR, 'data.json')

let data: TheoData | null = null
let writeTimer: ReturnType<typeof setTimeout> | null = null

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

function seedData(): TheoData {
  const now = new Date().toISOString()
  return {
    reminders: DEFAULT_REMINDERS.map((r) => ({
      ...r,
      id: uuid(),
      createdAt: now,
    })),
    settings: { ...DEFAULT_SETTINGS },
    log: [],
  }
}

export function loadData(): TheoData {
  if (data) return data

  ensureDataDir()

  if (existsSync(DATA_FILE)) {
    try {
      const raw = readFileSync(DATA_FILE, 'utf-8')
      data = JSON.parse(raw) as TheoData
      return data
    } catch {
      // Corrupted file, start fresh
      console.warn('Theo: data.json corrupted, starting fresh')
    }
  }

  // First launch or corrupted — seed defaults
  data = seedData()
  writeToDisk()
  return data
}

function writeToDisk(): void {
  // Debounce writes by 500ms
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(() => {
    ensureDataDir()
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  }, 500)
}

// ============================================================
// Reminder CRUD
// ============================================================

export function getReminders(): Reminder[] {
  return loadData().reminders
}

export function createReminder(input: Omit<Reminder, 'id' | 'createdAt'>): Reminder {
  const d = loadData()
  const reminder: Reminder = {
    ...input,
    id: uuid(),
    createdAt: new Date().toISOString(),
  }
  d.reminders.push(reminder)
  writeToDisk()
  return reminder
}

export function updateReminder(updated: Reminder): Reminder {
  const d = loadData()
  const idx = d.reminders.findIndex((r) => r.id === updated.id)
  if (idx === -1) throw new Error(`Reminder ${updated.id} not found`)
  d.reminders[idx] = updated
  writeToDisk()
  return updated
}

export function deleteReminder(id: string): void {
  const d = loadData()
  d.reminders = d.reminders.filter((r) => r.id !== id)
  writeToDisk()
}

// ============================================================
// Settings
// ============================================================

export function getSettings(): Settings {
  return loadData().settings
}

export function saveSettings(settings: Settings): Settings {
  const d = loadData()
  d.settings = settings
  writeToDisk()
  return settings
}

// ============================================================
// Log
// ============================================================

export function getLog(): ReminderLogEntry[] {
  return loadData().log
}

export function addLogEntry(entry: ReminderLogEntry): void {
  const d = loadData()
  d.log.push(entry)
  // Keep only last 100 entries
  if (d.log.length > 100) {
    d.log = d.log.slice(-100)
  }
  writeToDisk()
}
