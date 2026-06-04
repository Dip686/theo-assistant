import React, { useEffect, useRef, useCallback, useState } from 'react'
import { drawTheoFront, drawTheoWalk, drawTheoPeek, drawTheoWave } from '../sprites/drawTheo'
import { DEFAULT_SHIRT } from '../sprites/colors'
import { setAvatar } from '../sprites/avatarConfig'
import { AnimationController, AnimState } from './animationController'
import { SpeechBubble } from './SpeechBubble'
import { playWinkWink } from './sound'

const SCALE = 3
const CANVAS_SIZE = 192 // 64 * 3

interface ReminderData {
  id: string
  name: string
  message: string
  gentleMode: boolean
}

export function AvatarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controllerRef = useRef(new AnimationController())
  const [animState, setAnimState] = useState<AnimState>('hidden')
  const [posX, setPosX] = useState(600)
  const [currentReminder, setCurrentReminder] = useState<ReminderData | null>(null)
  const [shirtColor, setShirtColor] = useState(DEFAULT_SHIRT)

  const draw = useCallback((state: AnimState, frame: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear previous frame to prevent ghosting
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const opts = { ctx, scale: SCALE, shirtColor }

    switch (state) {
      case 'peek':
        drawTheoPeek(opts)
        break
      case 'walk_in':
      case 'walk_out':
        drawTheoWalk({ ...opts, frame })
        break
      case 'talk':
        drawTheoFront(opts)
        break
      case 'wave':
        drawTheoWave(opts)
        break
      case 'hidden':
        // Already cleared above
        break
    }
  }, [shirtColor])

  // Re-draw on state changes
  useEffect(() => {
    draw(animState, controllerRef.current.currentFrame)
  }, [animState, draw])

  // Continuous redraw during walk animations
  useEffect(() => {
    if (animState !== 'walk_in' && animState !== 'walk_out') return

    let rafId: number
    const loop = () => {
      draw(animState, controllerRef.current.currentFrame)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [animState, draw])

  // Listen for reminder fire events from main process
  useEffect(() => {
    const theo = (window as unknown as { theo: TheoAPI }).theo
    if (!theo) {
      console.error('Theo: window.theo API not found!')
      return
    }
    console.log('Theo: Renderer mounted, listening for reminders...')

    const cleanup = theo.onReminderFire(async (data: unknown) => {
      console.log('Theo: Reminder received!', data)
      const reminder = data as ReminderData
      setCurrentReminder(reminder)

      // Play notification sound
      try {
        const settings = await theo.getSettings()
        if (settings.soundEnabled) {
          playWinkWink(settings.volume)
        }
      } catch { /* ignore */ }

      // Make window interactive
      theo.setInteractive(true)

      controllerRef.current.start({
        gentleMode: reminder.gentleMode,
        message: reminder.message,
        reminderId: reminder.id,
        onStateChange: (state) => setAnimState(state),
        onPositionChange: (x) => setPosX(x),
        onComplete: (reminderId) => {
          theo.setInteractive(false)
          theo.dismissReminder(reminderId)
          setCurrentReminder(null)
        },
      })
    })

    // Load settings for shirt color and avatar
    theo.getSettings().then((settings: { shirtColor: string; avatar?: string }) => {
      setShirtColor(settings.shirtColor)
      if (settings.avatar === 'missi') setAvatar('missi')
    })

    return cleanup
  }, [])

  const handleDismiss = useCallback(() => {
    controllerRef.current.dismiss()
  }, [])

  const handleSnooze = useCallback((minutes: number) => {
    if (!currentReminder) return
    const theo = (window as unknown as { theo: TheoAPI }).theo
    theo.snoozeReminder(currentReminder.id, minutes)
    controllerRef.current.dismiss()
  }, [currentReminder])

  const isVisible = animState !== 'hidden'
  const showBubble = animState === 'talk'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {showBubble && currentReminder && (
        <SpeechBubble
          message={currentReminder.message}
          style={{
            position: 'absolute',
            bottom: 128, // just above Theo's head
            right: 600 - posX - CANVAS_SIZE / 2,
          }}
          onDismiss={handleDismiss}
          onSnooze={handleSnooze}
        />
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          position: 'absolute',
          bottom: -36, // 12 empty rows below feet (y=51-62) × 3x scale, keep shoes visible
          right: Math.max(0, 600 - posX - CANVAS_SIZE),
          imageRendering: 'pixelated',
          display: isVisible ? 'block' : 'none',
        }}
      />
    </div>
  )
}

// Type for the preload API
interface TheoAPI {
  onReminderFire: (callback: (data: unknown) => void) => () => void
  snoozeReminder: (reminderId: string, duration: number) => void
  dismissReminder: (reminderId: string) => void
  setInteractive: (interactive: boolean) => void
  openPanel: () => void
  getSettings: () => Promise<{ shirtColor: string; soundEnabled: boolean; volume: number }>
  listReminders: () => Promise<unknown[]>
  createReminder: (data: unknown) => Promise<unknown>
  updateReminder: (data: unknown) => Promise<unknown>
  deleteReminder: (id: string) => Promise<void>
  saveSettings: (settings: unknown) => Promise<unknown>
  getLog: () => Promise<unknown[]>
}
