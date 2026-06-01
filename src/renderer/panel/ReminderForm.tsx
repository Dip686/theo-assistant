import React, { useState } from 'react'
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

interface ReminderFormProps {
  initial?: Reminder
  onSave: (data: Partial<Reminder>) => void
  onCancel: () => void
}

export function ReminderForm({ initial, onSave, onCancel }: ReminderFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [message, setMessage] = useState(initial?.message ?? '')
  const [type, setType] = useState<'interval' | 'scheduled'>(initial?.type ?? 'interval')
  const [intervalMinutes, setIntervalMinutes] = useState(initial?.intervalMinutes ?? 30)
  const [scheduledTime, setScheduledTime] = useState(initial?.scheduledTime ?? '09:00')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      message: message.trim() || `Time for ${name.trim()}!`,
      type,
      intervalMinutes: type === 'interval' ? intervalMinutes : undefined,
      scheduledTime: type === 'scheduled' ? scheduledTime : undefined,
      enabled: initial?.enabled ?? true,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={fieldStyle}>
        <label style={labelStyle}>Name</label>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Screen Break"
          autoFocus
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Message</label>
        <input
          style={inputStyle}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What Theo will say..."
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Type</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            style={{
              ...segmentBtnStyle,
              ...(type === 'interval' ? segmentActiveStyle : {}),
            }}
            onClick={() => setType('interval')}
          >
            Interval
          </button>
          <button
            type="button"
            style={{
              ...segmentBtnStyle,
              ...(type === 'scheduled' ? segmentActiveStyle : {}),
            }}
            onClick={() => setType('scheduled')}
          >
            Scheduled
          </button>
        </div>
      </div>

      {type === 'interval' ? (
        <div style={fieldStyle}>
          <label style={labelStyle}>Every (minutes)</label>
          <input
            type="number"
            min={1}
            max={480}
            style={{ ...inputStyle, width: 80 }}
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
          />
        </div>
      ) : (
        <div style={fieldStyle}>
          <label style={labelStyle}>Time</label>
          <input
            type="time"
            style={{ ...inputStyle, width: 120 }}
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="button" style={{ ...baseBtn, background: theme.surface, color: theme.textMuted }} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" style={{ ...baseBtn, background: theme.primary, color: '#fff' }}>
          {initial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

const formStyle: React.CSSProperties = {
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: theme.radius,
  padding: 14,
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: theme.textMuted,
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  fontFamily: theme.font,
  fontSize: 12,
  padding: '6px 10px',
  background: theme.bg,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  color: theme.text,
  outline: 'none',
}

const segmentBtnStyle: React.CSSProperties = {
  fontFamily: theme.font,
  fontSize: 11,
  padding: '5px 12px',
  background: theme.bg,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  color: theme.textMuted,
  cursor: 'pointer',
}

const segmentActiveStyle: React.CSSProperties = {
  background: theme.primary,
  borderColor: theme.primary,
  color: '#fff',
}
