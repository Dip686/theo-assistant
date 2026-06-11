import React, { useEffect, useState, useCallback, useRef } from 'react'
import { ReminderForm } from './ReminderForm'
import { theme, baseBtn } from './theme'

interface Reminder {
  id: string
  name: string
  message: string
  type: 'interval' | 'scheduled'
  intervalMinutes?: number
  scheduledTime?: string
  enabled: boolean
  createdAt: string
}

interface NextFire {
  reminderId: string
  nextFireAt: number
}

const theo = (window as unknown as { theo: {
  listReminders: () => Promise<Reminder[]>
  createReminder: (data: unknown) => Promise<Reminder>
  updateReminder: (data: unknown) => Promise<Reminder>
  deleteReminder: (id: string) => Promise<void>
  getNextFireTimes: () => Promise<NextFire[]>
} }).theo

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'any moment...'
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [nextFires, setNextFires] = useState<NextFire[]>([])
  const [now, setNow] = useState(Date.now())
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    const list = await theo.listReminders()
    setReminders(list)
    const fires = await theo.getNextFireTimes()
    setNextFires(fires)
  }, [])

  useEffect(() => { load() }, [load])

  // Tick every second to update countdowns
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  // Refresh fire times every 30 seconds (in case engine restarted)
  useEffect(() => {
    const interval = setInterval(async () => {
      const fires = await theo.getNextFireTimes()
      setNextFires(fires)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleEnabled = async (r: Reminder) => {
    await theo.updateReminder({ ...r, enabled: !r.enabled })
    load()
  }

  const handleDelete = async (id: string) => {
    await theo.deleteReminder(id)
    load()
  }

  const handleSave = async (data: Partial<Reminder>) => {
    if (editing) {
      await theo.updateReminder({ ...editing, ...data })
    } else {
      await theo.createReminder(data)
    }
    setEditing(null)
    setShowForm(false)
    load()
  }

  const formatInterval = (mins?: number) => {
    if (!mins) return ''
    if (mins < 60) return `Every ${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m ? `Every ${h}h ${m}m` : `Every ${h}h`
  }

  const getCountdown = (reminderId: string): string | null => {
    const fire = nextFires.find((f) => f.reminderId === reminderId)
    if (!fire) return null
    const remaining = fire.nextFireAt - now
    return formatCountdown(remaining)
  }

  return (
    <div>
      <div style={headerRowStyle}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Reminders</h3>
        <button
          style={{ ...baseBtn, background: theme.primary, color: '#fff', fontSize: 11 }}
          onClick={() => { setEditing(null); setShowForm(true) }}
        >
          + New
        </button>
      </div>

      {(showForm || editing) && (
        <ReminderForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setShowForm(false) }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
        {reminders.map((r) => {
          const countdown = r.enabled ? getCountdown(r.id) : null

          return (
            <div key={r.id} style={cardStyle}>
              {/* Row 1: Name + badge + toggle */}
              <div style={cardRowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                  <span style={badgeStyle}>
                    {r.type === 'interval' ? formatInterval(r.intervalMinutes) : r.scheduledTime}
                  </span>
                </div>
                <label style={toggleContainerStyle}>
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={() => toggleEnabled(r)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    ...toggleTrackStyle,
                    background: r.enabled ? theme.primary : theme.border,
                  }}>
                    <div style={{
                      ...toggleThumbStyle,
                      transform: r.enabled ? 'translateX(14px)' : 'translateX(0)',
                    }} />
                  </div>
                </label>
              </div>

              {/* Row 2: Message */}
              <div style={{ color: theme.textMuted, fontSize: 11 }}>
                {r.message}
              </div>

              {/* Row 3: Countdown + Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                {countdown ? (
                  <div style={countdownStyle}>
                    <span style={countdownIcon}>⏱</span>
                    <span>{countdown}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: theme.textDim }}>
                    {r.enabled ? '' : 'Paused'}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={actionBtnStyle}
                    onClick={() => { setEditing(r); setShowForm(false) }}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...actionBtnStyle, color: theme.danger }}
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {reminders.length === 0 && (
        <div style={{ textAlign: 'center', color: theme.textDim, marginTop: 40 }}>
          No reminders yet. Create one to get started!
        </div>
      )}
    </div>
  )
}

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '10px 12px',
  background: theme.surface,
  borderRadius: theme.radius,
  border: `1px solid ${theme.border}`,
}

const cardRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const badgeStyle: React.CSSProperties = {
  fontSize: 10,
  color: theme.textDim,
  background: theme.bg,
  padding: '2px 6px',
  borderRadius: 3,
  whiteSpace: 'nowrap',
}

const countdownStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  fontFamily: "'Press Start 2P', monospace, system-ui",
  color: theme.primary,
  letterSpacing: 0.5,
}

const countdownIcon: React.CSSProperties = {
  fontSize: 10,
}

const actionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: theme.textMuted,
  cursor: 'pointer',
  fontSize: 11,
  padding: 0,
  fontFamily: theme.font,
}

const toggleContainerStyle: React.CSSProperties = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
}

const toggleTrackStyle: React.CSSProperties = {
  width: 30,
  height: 16,
  borderRadius: 8,
  position: 'relative',
  transition: 'background 0.2s',
}

const toggleThumbStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: '#fff',
  position: 'absolute',
  top: 2,
  left: 2,
  transition: 'transform 0.2s',
}
