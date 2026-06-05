import { Tray, Menu, nativeImage } from 'electron'

let tray: Tray | null = null

function createTrayIcon(): nativeImage {
  // 22x22 template icon for macOS menu bar (drawn as a tiny Theo face)
  // Using a Canvas-like approach with raw pixel data
  const size = 22
  const buf = Buffer.alloc(size * size * 4, 0) // RGBA

  const set = (x: number, y: number) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 4
    buf[i] = 0       // R
    buf[i + 1] = 0   // G
    buf[i + 2] = 0   // B
    buf[i + 3] = 255  // A (Template images use alpha only)
  }

  const rect = (x: number, y: number, w: number, h: number) => {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        set(x + dx, y + dy)
  }

  // Head outline (round-ish)
  rect(7, 2, 8, 1)    // top
  rect(6, 3, 10, 1)
  rect(5, 4, 12, 10)  // face block
  rect(6, 14, 10, 1)
  rect(7, 15, 8, 1)   // chin

  // Hair (top)
  rect(6, 2, 10, 3)

  // Eyes
  set(8, 8)
  set(9, 8)
  set(12, 8)
  set(13, 8)

  // Mouth (smile)
  set(9, 11)
  rect(10, 12, 2, 1)
  set(12, 11)

  // Body
  rect(7, 16, 8, 4)

  // Arms
  rect(5, 17, 2, 3)
  rect(15, 17, 2, 3)

  const img = nativeImage.createFromBuffer(buf, { width: size, height: size })
  img.setTemplateImage(true) // macOS will auto-color for light/dark menu bar
  return img
}

export function createTray(callbacks: {
  onShowTheo: () => void
  onOpenPanel: () => void
  onQuickCapture: () => void
  onQuit: () => void
}, avatarName: string = 'Theo'): Tray {
  const icon = createTrayIcon()

  tray = new Tray(icon)
  tray.setToolTip(`${avatarName} — Desktop Assistant`)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Show ${avatarName}`,
      click: callbacks.onShowTheo,
    },
    {
      label: 'Quick Capture',
      accelerator: 'CommandOrControl+Shift+N',
      click: callbacks.onQuickCapture,
    },
    {
      label: 'Task Panel...',
      click: callbacks.onOpenPanel,
    },
    { type: 'separator' },
    {
      label: `Quit ${avatarName}`,
      click: callbacks.onQuit,
    },
  ])

  tray.setContextMenu(contextMenu)

  return tray
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
