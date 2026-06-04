import React, { useEffect, useState, useCallback } from 'react'
import { SHIRT_PRESETS } from '../sprites/colors'
import { theme, baseBtn } from './theme'

interface CalendarSettings {
  enabled: boolean
  selectedCalendars: string[]
}

interface Settings {
  soundEnabled: boolean
  volume: number
  quietHours: {
    enabled: boolean
    from: string
    to: string
  }
  shirtColor: string
  animationSpeed: 'slow' | 'normal' | 'fast'
  respectDND: boolean
  startOnLogin: boolean
  calendar: CalendarSettings
}

interface CalendarStatus {
  connected: boolean
  email?: string
  inMeeting: boolean
  meetingEndTime?: string
}

interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  allDay: boolean
}

const theo = (window as unknown as { theo: {
  getSettings: () => Promise<Settings>
  saveSettings: (s: Settings) => Promise<Settings>
  connectCalendar: () => Promise<string>
  disconnectCalendar: () => Promise<void>
  getCalendarStatus: () => Promise<CalendarStatus>
  getCalendarEventsToday: () => Promise<CalendarEvent[]>
} }).theo

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saved, setSaved] = useState(false)
  const [calStatus, setCalStatus] = useState<CalendarStatus>({ connected: false, inMeeting: false })
  const [calConnecting, setCalConnecting] = useState(false)
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([])

  const load = useCallback(async () => {
    const s = await theo.getSettings()
    // Migrate: add calendar settings if missing
    if (!s.calendar) s.calendar = { enabled: false, selectedCalendars: [] }
    setSettings(s)
    try {
      const status = await theo.getCalendarStatus()
      setCalStatus(status)
      if (status.connected) {
        const events = await theo.getCalendarEventsToday()
        setTodayEvents(events)
      }
    } catch { /* not connected */ }
  }, [])

  useEffect(() => { load() }, [load])

  if (!settings) return null

  const update = (patch: Partial<Settings>) => {
    setSettings({ ...settings, ...patch })
    setSaved(false)
  }

  const save = async () => {
    await theo.saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Settings</h3>

      {/* Sound */}
      <section style={sectionStyle}>
        <div style={rowStyle}>
          <span>Sound effects</span>
          <ToggleSwitch checked={settings.soundEnabled} onChange={(v) => update({ soundEnabled: v })} />
        </div>
        {settings.soundEnabled && (
          <div style={rowStyle}>
            <span style={{ color: theme.textMuted, fontSize: 11 }}>Volume</span>
            <input
              type="range"
              min={0} max={1} step={0.1}
              value={settings.volume}
              onChange={(e) => update({ volume: Number(e.target.value) })}
              style={{ width: 100, accentColor: theme.primary }}
            />
          </div>
        )}
      </section>

      {/* Quiet Hours */}
      <section style={sectionStyle}>
        <div style={rowStyle}>
          <span>Quiet hours</span>
          <ToggleSwitch
            checked={settings.quietHours.enabled}
            onChange={(v) => update({ quietHours: { ...settings.quietHours, enabled: v } })}
          />
        </div>
        {settings.quietHours.enabled && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <input
              type="time"
              value={settings.quietHours.from}
              onChange={(e) => update({ quietHours: { ...settings.quietHours, from: e.target.value } })}
              style={timeInputStyle}
            />
            <span style={{ color: theme.textDim, fontSize: 11 }}>to</span>
            <input
              type="time"
              value={settings.quietHours.to}
              onChange={(e) => update({ quietHours: { ...settings.quietHours, to: e.target.value } })}
              style={timeInputStyle}
            />
          </div>
        )}
      </section>

      {/* Shirt Color */}
      <section style={sectionStyle}>
        <span style={{ marginBottom: 6, display: 'block' }}>Outfit color</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SHIRT_PRESETS.map((p) => (
            <button
              key={p.color}
              title={p.name}
              onClick={() => update({ shirtColor: p.color })}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: p.color,
                border: settings.shirtColor === p.color
                  ? '2px solid #fff'
                  : '2px solid transparent',
                cursor: 'pointer',
                outline: settings.shirtColor === p.color
                  ? `2px solid ${theme.primary}`
                  : 'none',
                outlineOffset: 1,
              }}
            />
          ))}
        </div>
      </section>

      {/* Animation Speed */}
      <section style={sectionStyle}>
        <span style={{ marginBottom: 6, display: 'block' }}>Animation speed</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['slow', 'normal', 'fast'] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => update({ animationSpeed: speed })}
              style={{
                ...segStyle,
                ...(settings.animationSpeed === speed ? segActiveStyle : {}),
              }}
            >
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* System */}
      <section style={sectionStyle}>
        <div style={rowStyle}>
          <span>Respect macOS Do Not Disturb</span>
          <ToggleSwitch checked={settings.respectDND} onChange={(v) => update({ respectDND: v })} />
        </div>
        <div style={rowStyle}>
          <span>Start on login</span>
          <ToggleSwitch checked={settings.startOnLogin} onChange={(v) => update({ startOnLogin: v })} />
        </div>
      </section>

      {/* Google Calendar */}
      <section style={sectionStyle}>
        <div style={{ ...rowStyle, marginBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>Google Calendar</span>
          {calStatus.connected ? (
            <span style={{ fontSize: 9, color: theme.success }}>Connected</span>
          ) : (
            <span style={{ fontSize: 9, color: theme.textDim }}>Not connected</span>
          )}
        </div>

        {calStatus.connected ? (
          <>
            <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 8 }}>
              {calStatus.email}
              {calStatus.inMeeting && (
                <span style={{
                  marginLeft: 8, fontSize: 9, padding: '2px 6px',
                  background: theme.danger + '22', color: theme.danger,
                  borderRadius: 4,
                }}>
                  In meeting
                </span>
              )}
            </div>
            <div style={rowStyle}>
              <span>Meeting reminders</span>
              <ToggleSwitch
                checked={settings.calendar.enabled}
                onChange={(v) => update({
                  calendar: { ...settings.calendar, enabled: v }
                })}
              />
            </div>
            {settings.calendar.enabled && (
              <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4, marginBottom: 8 }}>
                Theo will remind you 10min and 1min before meetings.
                Other reminders are suppressed during meetings.
              </div>
            )}

            {/* Today's meetings */}
            {settings.calendar.enabled && todayEvents.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Today's Meetings
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {todayEvents.map((event) => {
                    const start = new Date(event.start)
                    const end = new Date(event.end)
                    const now = new Date()
                    const isActive = now >= start && now < end
                    const isPast = now >= end
                    const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} – ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`

                    return (
                      <div key={event.id} style={{
                        background: theme.bg,
                        borderRadius: 4,
                        padding: '6px 8px',
                        borderLeft: `3px solid ${isActive ? theme.success : isPast ? theme.textDim : theme.primary}`,
                        opacity: isPast ? 0.5 : 1,
                      }}>
                        <div style={{ fontSize: 11, color: theme.text, lineHeight: 1.3 }}>
                          {event.summary}
                          {isActive && (
                            <span style={{
                              marginLeft: 6, fontSize: 8, padding: '1px 5px',
                              background: theme.success + '22', color: theme.success,
                              borderRadius: 3,
                            }}>NOW</span>
                          )}
                        </div>
                        <div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>
                          {timeStr}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {settings.calendar.enabled && todayEvents.length === 0 && (
              <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 8, fontStyle: 'italic' }}>
                No meetings today
              </div>
            )}

            <button
              onClick={async () => {
                await theo.disconnectCalendar()
                setCalStatus({ connected: false, inMeeting: false })
                update({ calendar: { enabled: false, selectedCalendars: [] } })
              }}
              style={{
                ...baseBtn, marginTop: 8,
                background: theme.danger + '22', color: theme.danger,
                fontSize: 10, padding: '4px 10px',
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 8 }}>
              Connect your Google Calendar to get meeting reminders and auto-suppress notifications during meetings.
            </div>
            <button
              onClick={async () => {
                setCalConnecting(true)
                try {
                  const email = await theo.connectCalendar()
                  setCalStatus({ connected: true, email, inMeeting: false })
                  update({ calendar: { ...settings.calendar, enabled: true } })
                } catch (err) {
                  console.error('Calendar connect failed:', err)
                } finally {
                  setCalConnecting(false)
                }
              }}
              disabled={calConnecting}
              style={{
                ...baseBtn,
                background: calConnecting ? theme.surface : theme.primary,
                color: '#fff', fontSize: 11,
              }}
            >
              {calConnecting ? 'Connecting...' : 'Connect Google Calendar'}
            </button>
          </>
        )}
      </section>

      <button
        onClick={save}
        style={{
          ...baseBtn,
          background: saved ? theme.success : theme.primary,
          color: '#fff',
          width: '100%',
          padding: '8px 0',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} style={{ display: 'none' }} />
      <div style={{
        width: 30, height: 16, borderRadius: 8, position: 'relative',
        background: checked ? theme.primary : theme.border,
        transition: 'background 0.2s',
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: 2,
          transition: 'transform 0.2s',
          transform: checked ? 'translateX(14px)' : 'translateX(0)',
        }} />
      </div>
    </label>
  )
}

const sectionStyle: React.CSSProperties = {
  background: theme.surface,
  padding: '10px 12px',
  borderRadius: theme.radius,
  border: `1px solid ${theme.border}`,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '3px 0',
  fontSize: 12,
}

const timeInputStyle: React.CSSProperties = {
  fontFamily: theme.font,
  fontSize: 11,
  padding: '4px 8px',
  background: theme.bg,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  color: theme.text,
  outline: 'none',
}

const segStyle: React.CSSProperties = {
  fontFamily: theme.font,
  fontSize: 11,
  padding: '5px 12px',
  background: theme.bg,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  color: theme.textMuted,
  cursor: 'pointer',
}

const segActiveStyle: React.CSSProperties = {
  background: theme.primary,
  borderColor: theme.primary,
  color: '#fff',
}
