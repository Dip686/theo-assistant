import React, { useEffect, useState, useCallback } from 'react'
import { SHIRT_PRESETS } from '../sprites/colors'
import { theme, baseBtn } from './theme'

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
}

const theo = (window as unknown as { theo: {
  getSettings: () => Promise<Settings>
  saveSettings: (s: Settings) => Promise<Settings>
} }).theo

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const s = await theo.getSettings()
    setSettings(s)
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
