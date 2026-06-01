/**
 * Doot Doot notification sound using Web Audio API.
 * Two playful triangle-wave toots — cute, like a tiny horn.
 */

let audioCtx: AudioContext | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(ctx: AudioContext, startTime: number, frequency: number, duration: number, volume: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(frequency, startTime)

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.005)
  gain.gain.setValueAtTime(volume, startTime + duration * 0.5)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration)
}

export function playWinkWink(volume: number = 0.7): void {
  try {
    const ctx = getContext()
    const now = ctx.currentTime
    const vol = Math.max(0, Math.min(1, volume)) * 0.3 // scale down — gentle

    // First "doot" — D5
    playTone(ctx, now, 587, 0.1, vol)
    // Second "doot" — G5 (higher, slightly later)
    playTone(ctx, now + 0.15, 784, 0.12, vol)
  } catch {
    // Audio not available — silent fail
  }
}
