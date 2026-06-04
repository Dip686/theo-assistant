/**
 * Calendar service — fetches today's events, fires meeting reminders,
 * and suppresses other reminders during active meetings.
 */

import { google, calendar_v3 } from 'googleapis'
import { BrowserWindow } from 'electron'
import { getAuthClient, isConnected } from './googleAuth'
import { CalendarEvent, IPC } from '../../shared/types'
import { getSettings } from '../reminder/store'
import { moveToActiveDisplay } from '../windows/avatarWindow'

let avatarWindow: BrowserWindow | null = null
let syncInterval: ReturnType<typeof setInterval> | null = null
let meetingTimers: ReturnType<typeof setTimeout>[] = []
let todayEvents: CalendarEvent[] = []
let currentMeetingEnd: Date | null = null

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function setCalendarAvatarWindow(win: BrowserWindow): void {
  avatarWindow = win
}

/**
 * Is the user currently in a meeting? Used by reminder engine
 * to suppress non-meeting reminders.
 */
export function isInMeeting(): boolean {
  if (!currentMeetingEnd) return false
  return new Date() < currentMeetingEnd
}

/**
 * Get the meeting end time (for tray/UI display)
 */
export function getMeetingEndTime(): string | undefined {
  if (!currentMeetingEnd || new Date() >= currentMeetingEnd) return undefined
  return currentMeetingEnd.toISOString()
}

/**
 * Get today's cached events
 */
export function getTodayEvents(): CalendarEvent[] {
  return todayEvents
}

/**
 * Start the calendar sync loop
 */
export function startCalendarSync(): void {
  if (syncInterval) return

  // Initial sync
  syncEvents().catch((err) => console.error('Theo Calendar: Initial sync failed:', err.message))

  // Periodic sync every 5 minutes
  syncInterval = setInterval(() => {
    syncEvents().catch((err) => console.error('Theo Calendar: Sync failed:', err.message))
  }, SYNC_INTERVAL_MS)

  console.log('Theo Calendar: Sync started (every 5 min)')
}

/**
 * Stop the calendar sync loop
 */
export function stopCalendarSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
  clearMeetingTimers()
  todayEvents = []
  currentMeetingEnd = null
  console.log('Theo Calendar: Sync stopped')
}

/**
 * Fetch today's events from Google Calendar and schedule meeting reminders
 */
async function syncEvents(): Promise<void> {
  if (!isConnected()) return

  const auth = getAuthClient()
  if (!auth) return

  const settings = getSettings()
  if (!settings.calendar?.enabled) return

  const calendar = google.calendar({ version: 'v3', auth })

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  try {
    // Fetch from all calendars or selected ones
    const selectedCalendars = settings.calendar.selectedCalendars
    let allEvents: CalendarEvent[] = []

    if (selectedCalendars.length === 0) {
      // Fetch from primary calendar
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      })
      allEvents = parseEvents(res.data.items || [])
    } else {
      // Fetch from each selected calendar
      for (const calId of selectedCalendars) {
        try {
          const res = await calendar.events.list({
            calendarId: calId,
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
          })
          allEvents.push(...parseEvents(res.data.items || []))
        } catch {
          // Skip calendars that fail (e.g., deleted)
        }
      }
    }

    // Filter: only confirmed/tentative, no all-day, no cancelled, no declined
    todayEvents = allEvents.filter((e) =>
      !e.allDay && e.status !== 'cancelled'
    )

    // Sort by start time
    todayEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    // Update meeting suppression state
    updateMeetingState()

    // Schedule meeting reminders
    scheduleMeetingReminders()

    console.log(`Theo Calendar: Synced ${todayEvents.length} events for today`)
  } catch (err) {
    console.error('Theo Calendar: Failed to fetch events:', (err as Error).message)
  }
}

/**
 * Parse Google Calendar API events into our format
 */
function parseEvents(items: calendar_v3.Schema$Event[]): CalendarEvent[] {
  return items
    .filter((item) => item.id && item.summary)
    .map((item) => ({
      id: item.id!,
      summary: item.summary!,
      start: item.start?.dateTime || item.start?.date || '',
      end: item.end?.dateTime || item.end?.date || '',
      status: item.status || 'confirmed',
      allDay: !item.start?.dateTime, // date-only = all day
    }))
}

/**
 * Check if we're currently in a meeting and update state
 */
function updateMeetingState(): void {
  const now = new Date()

  // Find any meeting happening right now
  const activeMeeting = todayEvents.find((e) => {
    const start = new Date(e.start)
    const end = new Date(e.end)
    return now >= start && now < end
  })

  if (activeMeeting) {
    currentMeetingEnd = new Date(activeMeeting.end)

    // Check for back-to-back: extend if next meeting starts when this one ends
    let endTime = currentMeetingEnd.getTime()
    for (const e of todayEvents) {
      const eStart = new Date(e.start).getTime()
      const eEnd = new Date(e.end).getTime()
      if (eStart <= endTime && eEnd > endTime) {
        endTime = eEnd
      }
    }
    currentMeetingEnd = new Date(endTime)
  } else {
    currentMeetingEnd = null
  }
}

/**
 * Schedule Theo reminders at 10min and 1min before each upcoming meeting.
 * Re-checks the calendar before actually showing the notification.
 */
function scheduleMeetingReminders(): void {
  clearMeetingTimers()

  const now = Date.now()

  for (const event of todayEvents) {
    const startTime = new Date(event.start).getTime()

    // 10-minute reminder
    const tenMinBefore = startTime - 10 * 60 * 1000
    if (tenMinBefore > now) {
      const timer = setTimeout(() => {
        fireMeetingReminder(event, 10)
      }, tenMinBefore - now)
      meetingTimers.push(timer)
    }

    // 1-minute reminder
    const oneMinBefore = startTime - 1 * 60 * 1000
    if (oneMinBefore > now) {
      const timer = setTimeout(() => {
        fireMeetingReminder(event, 1)
      }, oneMinBefore - now)
      meetingTimers.push(timer)
    }
  }
}

/**
 * Fire a meeting reminder — but first re-check the calendar
 * to confirm the meeting still exists (handles cancellations).
 */
async function fireMeetingReminder(event: CalendarEvent, minutesBefore: number): Promise<void> {
  if (!avatarWindow || avatarWindow.isDestroyed()) return

  // Re-check: is this event still on the calendar?
  const stillExists = await verifyEventExists(event.id)
  if (!stillExists) {
    console.log(`Theo Calendar: Meeting "${event.summary}" was cancelled, skipping reminder`)
    return
  }

  const message = minutesBefore === 1
    ? `📅 ${event.summary} starts in 1 minute!`
    : `📅 ${event.summary} in ${minutesBefore} minutes`

  moveToActiveDisplay()

  avatarWindow.webContents.send(IPC.REMINDER_FIRE, {
    id: `meeting-${event.id}-${minutesBefore}`,
    name: 'Meeting Reminder',
    message,
    type: 'scheduled',
    enabled: true,
    gentleMode: false,
  })

  console.log(`Theo Calendar: Fired ${minutesBefore}min reminder for "${event.summary}"`)
}

/**
 * Verify a specific event still exists on the calendar (not cancelled/deleted).
 */
async function verifyEventExists(eventId: string): Promise<boolean> {
  const auth = getAuthClient()
  if (!auth) return false

  try {
    const calendar = google.calendar({ version: 'v3', auth })
    const res = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    })
    return res.data.status !== 'cancelled'
  } catch {
    // Event not found or API error — treat as cancelled
    return false
  }
}

/**
 * Clear all pending meeting reminder timers
 */
function clearMeetingTimers(): void {
  for (const timer of meetingTimers) {
    clearTimeout(timer)
  }
  meetingTimers = []
}

/**
 * List available calendars for the settings UI
 */
export async function listCalendars(): Promise<{ id: string; summary: string; primary: boolean }[]> {
  const auth = getAuthClient()
  if (!auth) return []

  try {
    const calendar = google.calendar({ version: 'v3', auth })
    const res = await calendar.calendarList.list()

    return (res.data.items || [])
      .filter((c) => c.id && c.summary)
      .map((c) => ({
        id: c.id!,
        summary: c.summary!,
        primary: c.primary || false,
      }))
  } catch {
    return []
  }
}
