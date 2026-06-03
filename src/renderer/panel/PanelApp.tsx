import React, { useState, useEffect } from 'react'
import { ReminderList } from './ReminderList'
import { SettingsPanel } from './SettingsPanel'
import { ActivityLog } from './ActivityLog'
import { TasksPanel } from './TasksPanel'
import { theme } from './theme'

type Tab = 'tasks' | 'reminders' | 'settings' | 'log'

const TAB_LABELS: Record<Tab, string> = {
  tasks: 'Tasks',
  reminders: 'Reminders',
  settings: 'Settings',
  log: 'Log',
}

export function PanelApp() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')

  // Listen for tab-switch commands from main process (e.g., Cmd+Shift+N)
  useEffect(() => {
    const theo = (window as unknown as { theo: { onOpenTab?: (cb: (tab: string) => void) => () => void } }).theo
    if (theo?.onOpenTab) {
      return theo.onOpenTab((tab) => {
        if (tab in TAB_LABELS) setActiveTab(tab as Tab)
      })
    }
  }, [])

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <span style={logoStyle}>Theo</span>
        <nav style={navStyle}>
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              style={{
                ...tabBtnStyle,
                ...(activeTab === tab ? tabActiveStyle : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>
      </header>

      <main style={mainStyle}>
        {activeTab === 'tasks' && <TasksPanel />}
        {activeTab === 'reminders' && <ReminderList />}
        {activeTab === 'settings' && <SettingsPanel />}
        {activeTab === 'log' && <ActivityLog />}
      </main>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: theme.bg,
  color: theme.text,
  fontFamily: theme.font,
  fontSize: 13,
  overflow: 'hidden',
  paddingTop: 24,
  boxSizing: 'border-box',
  WebkitAppRegion: 'drag' as unknown as string,
}

const headerStyle: React.CSSProperties = {
  padding: '16px 16px 0',
  borderBottom: `1px solid ${theme.border}`,
}

const logoStyle: React.CSSProperties = {
  fontFamily: theme.fontMono,
  fontSize: 14,
  color: theme.primary,
  display: 'block',
  marginBottom: 10,
  letterSpacing: 1,
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: 0,
  WebkitAppRegion: 'no-drag' as unknown as string,
}

const tabBtnStyle: React.CSSProperties = {
  fontFamily: theme.font,
  fontSize: 12,
  padding: '6px 14px',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  color: theme.textMuted,
  cursor: 'pointer',
  transition: 'all 0.15s',
}

const tabActiveStyle: React.CSSProperties = {
  color: theme.text,
  borderBottomColor: theme.primary,
}

const mainStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: 16,
  WebkitAppRegion: 'no-drag' as unknown as string,
}
