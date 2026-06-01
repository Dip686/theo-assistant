import React, { useState } from 'react'

interface SpeechBubbleProps {
  message: string
  style?: React.CSSProperties
  onDismiss: () => void
  onSnooze: (minutes: number) => void
}

export function SpeechBubble({ message, style, onDismiss, onSnooze }: SpeechBubbleProps) {
  const [showSnooze, setShowSnooze] = useState(false)

  return (
    <div style={{ ...bubbleContainerStyle, ...style }}>
      <div style={bubbleStyle}>
        <div style={messageStyle}>{message}</div>
        <div style={actionsStyle}>
          <button
            style={snoozeBtnStyle}
            onClick={() => setShowSnooze(!showSnooze)}
          >
            Snooze
          </button>
          <button style={dismissBtnStyle} onClick={onDismiss}>
            OK
          </button>
        </div>
        {showSnooze && (
          <div style={snoozePickerStyle}>
            <button style={snoozeOptionStyle} onClick={() => onSnooze(5)}>
              5 min
            </button>
            <button style={snoozeOptionStyle} onClick={() => onSnooze(10)}>
              10 min
            </button>
          </div>
        )}
        <div style={tailStyle} />
      </div>
    </div>
  )
}

const bubbleContainerStyle: React.CSSProperties = {
  zIndex: 10,
  pointerEvents: 'auto',
}

const bubbleStyle: React.CSSProperties = {
  background: '#2A2A3E',
  border: '3px solid #4A90D9',
  borderRadius: '8px',
  padding: '12px 16px',
  fontFamily: "'Press Start 2P', monospace, system-ui",
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#e8e8f0',
  maxWidth: '290px',
  position: 'relative',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
}

const messageStyle: React.CSSProperties = {
  marginBottom: '10px',
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
}

const btnBase: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace, system-ui",
  fontSize: '11px',
  padding: '6px 12px',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
}

const snoozeBtnStyle: React.CSSProperties = {
  ...btnBase,
  background: '#3A3A5E',
  color: '#8888A0',
}

const dismissBtnStyle: React.CSSProperties = {
  ...btnBase,
  background: '#4A90D9',
  color: 'white',
}

const snoozePickerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  marginTop: '6px',
  paddingTop: '6px',
  borderTop: '1px solid #3A3A5E',
}

const snoozeOptionStyle: React.CSSProperties = {
  ...btnBase,
  background: '#3A3A5E',
  color: '#e8e8f0',
  flex: 1,
}

const tailStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-10px',
  right: '30px',
  width: 0,
  height: 0,
  borderLeft: '10px solid transparent',
  borderRight: '10px solid transparent',
  borderTop: '10px solid #4A90D9',
}
