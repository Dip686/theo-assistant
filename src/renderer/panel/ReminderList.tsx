import React, { useEffect, useState, useCallback } from 'react'
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

const theo = (window as unknown as { theo: {
  listReminders: () => Promise<Reminder[]>
  createReminder: (data: unknown) => Promise<Reminder>
  updateReminder: (data: unknown) => Promise<Reminder>
  deleteReminder: (id: string) => Promise<void>
} }).theo

export function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    const list = await theo.listReminders()
    setReminders(list)
  }, [])

  useEffect(() => { load() }, [load])

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
        {reminders.map((r) => (
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

            {/* Row 3: Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
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
        ))}
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
