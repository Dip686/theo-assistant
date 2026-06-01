import React, { useEffect, useState, useCallback } from 'react'
import { theme } from './theme'

interface LogEntry {
  reminderId: string
  reminderName: string
  firedAt: string
  action: 'acknowledged' | 'snoozed' | 'auto-dismissed'
  snoozeDuration?: number
}

const theo = (window as unknown as { theo: {
  getLog: () => Promise<LogEntry[]>
} }).theo

export function ActivityLog() {
  const [log, setLog] = useState<LogEntry[]>([])

  const load = useCallback(async () => {
    const entries = await theo.getLog()
    setLog(entries.reverse()) // newest first
  }, [])

  useEffect(() => { load() }, [load])

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const actionLabel = (entry: LogEntry) => {
    switch (entry.action) {
      case 'acknowledged': return 'Dismissed'
      case 'snoozed': return `Snoozed ${entry.snoozeDuration}m`
      case 'auto-dismissed': return 'Auto-dismissed'
    }
  }

  const actionColor = (action: string) => {
    switch (action) {
      case 'acknowledged': return theme.success
      case 'snoozed': return theme.warning
      case 'auto-dismissed': return theme.textDim
      default: return theme.textMuted
    }
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Activity Log</h3>

      {log.length === 0 ? (
        <div style={{ textAlign: 'center', color: theme.textDim, marginTop: 40 }}>
          No activity yet. Theo will log reminders here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {log.map((entry, i) => (
            <div key={i} style={entryStyle}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500, fontSize: 12 }}>{entry.reminderName}</span>
              </div>
              <span style={{ color: actionColor(entry.action), fontSize: 10, whiteSpace: 'nowrap' }}>
                {actionLabel(entry)}
              </span>
              <span style={{ color: theme.textDim, fontSize: 10, minWidth: 50, textAlign: 'right' }}>
                {formatTime(entry.firedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const entryStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  background: theme.surface,
  borderRadius: 4,
  border: `1px solid ${theme.border}`,
}
