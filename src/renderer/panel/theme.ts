import type React from 'react'

// Design tokens for the task panel UI

export const theme = {
  bg: '#1A1A2E',
  surface: '#222238',
  surfaceHover: '#2A2A42',
  border: '#333350',
  primary: '#4A90D9',
  primaryHover: '#5DA0E9',
  danger: '#E74C3C',
  dangerHover: '#FF5C4C',
  text: '#E8E8F0',
  textMuted: '#8888A0',
  textDim: '#666680',
  success: '#4CAF50',
  warning: '#F39C12',
  radius: 6,
  font: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontMono: "'Press Start 2P', monospace",
} as const

export const baseBtn: React.CSSProperties = {
  fontFamily: theme.font,
  fontSize: 12,
  padding: '6px 12px',
  border: 'none',
  borderRadius: theme.radius,
  cursor: 'pointer',
  transition: 'background 0.15s',
}
