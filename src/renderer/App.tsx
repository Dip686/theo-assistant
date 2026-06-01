import React from 'react'
import { AvatarCanvas } from './avatar/AvatarCanvas'
import { PanelApp } from './panel/PanelApp'

export function App() {
  // Check if this is the panel view or the avatar overlay
  const isPanel = window.location.hash === '#panel'

  if (isPanel) {
    return <PanelApp />
  }

  return <AvatarCanvas />
}
