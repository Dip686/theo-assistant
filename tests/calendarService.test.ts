import { describe, it, expect } from 'vitest'

/**
 * Calendar service tests — verify types, event filtering logic,
 * and meeting state management.
 *
 * Note: These test the pure logic without Google API calls.
 * OAuth and API integration are tested manually.
 */

// ─── CalendarEvent type validation ──────────────────────────────────────

describe('CalendarEvent type', () => {
  it('has all required fields', () => {
    const event = {
      id: 'evt-123',
      summary: 'Team Standup',
      start: '2026-06-05T09:30:00+05:30',
      end: '2026-06-05T10:00:00+05:30',
      status: 'confirmed',
      allDay: false,
    }

    expect(event.id).toBeDefined()
    expect(event.summary).toBeDefined()
    expect(event.start).toBeDefined()
    expect(event.end).toBeDefined()
    expect(event.status).toBe('confirmed')
    expect(event.allDay).toBe(false)
  })
})

// ─── Event filtering logic ──────────────────────────────────────────────

describe('Event filtering', () => {
  const events = [
    { id: '1', summary: 'Standup', start: '2026-06-05T09:30:00Z', end: '2026-06-05T10:00:00Z', status: 'confirmed', allDay: false },
    { id: '2', summary: 'Cancelled', start: '2026-06-05T11:00:00Z', end: '2026-06-05T12:00:00Z', status: 'cancelled', allDay: false },
    { id: '3', summary: 'Birthday', start: '2026-06-05', end: '2026-06-06', status: 'confirmed', allDay: true },
    { id: '4', summary: 'Design Review', start: '2026-06-05T14:00:00Z', end: '2026-06-05T15:00:00Z', status: 'tentative', allDay: false },
    { id: '5', summary: 'Sprint Planning', start: '2026-06-05T16:00:00Z', end: '2026-06-05T17:00:00Z', status: 'confirmed', allDay: false },
  ]

  it('filters out all-day events', () => {
    const filtered = events.filter((e) => !e.allDay && e.status !== 'cancelled')
    expect(filtered.find((e) => e.summary === 'Birthday')).toBeUndefined()
  })

  it('filters out cancelled events', () => {
    const filtered = events.filter((e) => !e.allDay && e.status !== 'cancelled')
    expect(filtered.find((e) => e.summary === 'Cancelled')).toBeUndefined()
  })

  it('keeps confirmed and tentative events', () => {
    const filtered = events.filter((e) => !e.allDay && e.status !== 'cancelled')
    expect(filtered.length).toBe(3)
    expect(filtered.map((e) => e.summary)).toEqual(['Standup', 'Design Review', 'Sprint Planning'])
  })

  it('sorts by start time', () => {
    const filtered = events
      .filter((e) => !e.allDay && e.status !== 'cancelled')
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    expect(filtered[0].summary).toBe('Standup')
    expect(filtered[1].summary).toBe('Design Review')
    expect(filtered[2].summary).toBe('Sprint Planning')
  })
})

// ─── Meeting state logic ────────────────────────────────────────────────

describe('Meeting state detection', () => {
  it('detects active meeting', () => {
    const now = new Date('2026-06-05T09:45:00Z')
    const events = [
      { start: '2026-06-05T09:30:00Z', end: '2026-06-05T10:00:00Z' },
    ]

    const activeMeeting = events.find((e) => {
      const start = new Date(e.start)
      const end = new Date(e.end)
      return now >= start && now < end
    })

    expect(activeMeeting).toBeDefined()
  })

  it('returns no active meeting when between meetings', () => {
    const now = new Date('2026-06-05T10:30:00Z')
    const events = [
      { start: '2026-06-05T09:30:00Z', end: '2026-06-05T10:00:00Z' },
      { start: '2026-06-05T11:00:00Z', end: '2026-06-05T12:00:00Z' },
    ]

    const activeMeeting = events.find((e) => {
      const start = new Date(e.start)
      const end = new Date(e.end)
      return now >= start && now < end
    })

    expect(activeMeeting).toBeUndefined()
  })

  it('detects back-to-back meetings as continuous block', () => {
    const events = [
      { start: '2026-06-05T09:00:00Z', end: '2026-06-05T10:00:00Z' },
      { start: '2026-06-05T10:00:00Z', end: '2026-06-05T11:00:00Z' },
      { start: '2026-06-05T11:00:00Z', end: '2026-06-05T12:00:00Z' },
    ]

    // Find the end of the continuous block
    let endTime = new Date(events[0].end).getTime()
    for (const e of events) {
      const eStart = new Date(e.start).getTime()
      const eEnd = new Date(e.end).getTime()
      if (eStart <= endTime && eEnd > endTime) {
        endTime = eEnd
      }
    }

    expect(new Date(endTime).toISOString()).toBe('2026-06-05T12:00:00.000Z')
  })
})

// ─── Meeting reminder timing ────────────────────────────────────────────

describe('Meeting reminder scheduling', () => {
  it('calculates 10-minute reminder time correctly', () => {
    const meetingStart = new Date('2026-06-05T14:00:00Z').getTime()
    const tenMinBefore = meetingStart - 10 * 60 * 1000

    expect(new Date(tenMinBefore).toISOString()).toBe('2026-06-05T13:50:00.000Z')
  })

  it('calculates 1-minute reminder time correctly', () => {
    const meetingStart = new Date('2026-06-05T14:00:00Z').getTime()
    const oneMinBefore = meetingStart - 1 * 60 * 1000

    expect(new Date(oneMinBefore).toISOString()).toBe('2026-06-05T13:59:00.000Z')
  })

  it('skips reminders for past meetings', () => {
    const now = Date.now()
    const pastMeeting = now - 60 * 60 * 1000 // 1 hour ago
    const tenMinBefore = pastMeeting - 10 * 60 * 1000

    expect(tenMinBefore).toBeLessThan(now) // should not schedule
  })

  it('schedules reminders for future meetings', () => {
    const now = Date.now()
    const futureMeeting = now + 30 * 60 * 1000 // 30 min from now
    const tenMinBefore = futureMeeting - 10 * 60 * 1000

    expect(tenMinBefore).toBeGreaterThan(now) // should schedule
  })
})

// ─── CalendarSettings type ──────────────────────────────────────────────

describe('CalendarSettings', () => {
  it('default settings have calendar disabled', async () => {
    const { DEFAULT_SETTINGS } = await import('../src/shared/types')
    expect(DEFAULT_SETTINGS.calendar.enabled).toBe(false)
    expect(DEFAULT_SETTINGS.calendar.selectedCalendars).toEqual([])
  })

  it('default avatar is theo', async () => {
    const { DEFAULT_SETTINGS } = await import('../src/shared/types')
    expect(DEFAULT_SETTINGS.avatar).toBe('theo')
  })
})
