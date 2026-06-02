import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnimationController, AnimState } from '../src/renderer/avatar/animationController'

// ─── rAF simulation ───────────────────────────────────────────────────────
let rafCallbacks: Array<() => void> = []
let rafId = 0
let globalTime = 0

vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
  rafCallbacks.push(cb)
  return ++rafId
})
vi.stubGlobal('cancelAnimationFrame', (_id: number) => {
  rafCallbacks = []
})
vi.stubGlobal('performance', { now: () => globalTime })

/** Advance the simulated clock by `ms` milliseconds, pumping rAF each step */
function advanceTime(ms: number) {
  const step = 40 // match FRAME_INTERVAL
  const target = globalTime + ms
  while (globalTime < target) {
    globalTime += step
    if (rafCallbacks.length > 0) {
      const cbs = [...rafCallbacks]
      rafCallbacks = []
      cbs.forEach((cb) => cb())
    }
  }
}

describe('AnimationController', () => {
  let controller: AnimationController
  let states: AnimState[]
  let positions: number[]
  let completedIds: string[]

  beforeEach(() => {
    controller = new AnimationController()
    states = []
    positions = []
    completedIds = []
    rafCallbacks = []
    rafId = 0
    globalTime = 0
  })

  const startConfig = (opts: Partial<{ gentleMode: boolean }> = {}) => ({
    gentleMode: opts.gentleMode ?? false,
    message: 'Time for a break!',
    reminderId: 'test-123',
    onStateChange: (s: AnimState) => states.push(s),
    onPositionChange: (x: number) => positions.push(x),
    onComplete: (id: string) => completedIds.push(id),
  })

  // ─── State machine ───────────────────────────────────────────────────

  describe('State machine flow', () => {
    it('starts in hidden state', () => {
      expect(controller.currentState).toBe('hidden')
    })

    it('transitions to peek on start', () => {
      controller.start(startConfig())
      expect(states[0]).toBe('peek')
    })

    it('peek -> walk_in after peek duration', () => {
      controller.start(startConfig())
      advanceTime(1600) // PEEK_DURATION = 1500ms
      expect(states).toContain('walk_in')
    })

    it('walk_in -> talk after avatar reaches target position', () => {
      controller.start(startConfig())
      advanceTime(5000) // enough time to walk in
      expect(states).toContain('talk')
    })

    it('talk -> wave after talk duration', () => {
      controller.start(startConfig())
      advanceTime(15000) // peek + walk + talk(8000) + buffer
      expect(states).toContain('wave')
    })

    it('wave -> walk_out -> hidden (full cycle)', () => {
      controller.start(startConfig())
      advanceTime(20000) // full animation cycle
      expect(states).toContain('walk_out')
      expect(states).toContain('hidden')
    })

    it('calls onComplete with reminderId when done', () => {
      controller.start(startConfig())
      advanceTime(20000)
      expect(completedIds).toContain('test-123')
    })
  })

  // ─── Gentle mode ──────────────────────────────────────────────────────

  describe('Gentle mode (user actively typing)', () => {
    it('shorter peek: transitions to walk_in faster', () => {
      controller.start(startConfig({ gentleMode: true }))
      advanceTime(600) // gentle PEEK = 500ms vs normal 1500ms
      expect(states).toContain('walk_in')
    })

    it('shorter talk: transitions to wave faster', () => {
      controller.start(startConfig({ gentleMode: true }))
      advanceTime(10000) // gentle talk = 4000ms vs normal 8000ms
      expect(states).toContain('wave')
    })

    it('completes full cycle faster than normal mode', () => {
      // Start gentle
      controller.start(startConfig({ gentleMode: true }))
      advanceTime(12000)
      const gentleComplete = completedIds.length > 0

      // Reset and start normal
      controller = new AnimationController()
      states = []
      positions = []
      completedIds = []
      globalTime = 0
      rafCallbacks = []

      controller.start(startConfig({ gentleMode: false }))
      advanceTime(12000)
      const normalComplete = completedIds.length > 0

      expect(gentleComplete).toBe(true)
      expect(normalComplete).toBe(false) // normal takes longer
    })
  })

  // ─── Dismiss ──────────────────────────────────────────────────────────

  describe('Dismiss', () => {
    it('dismiss during talk skips to wave', () => {
      controller.start(startConfig())
      advanceTime(5000) // get to talk
      expect(states).toContain('talk')

      controller.dismiss()
      expect(states[states.length - 1]).toBe('wave')
    })

    it('dismiss during peek has no effect', () => {
      controller.start(startConfig())
      // Still in peek (< 1500ms)
      controller.dismiss()
      expect(states.filter((s) => s === 'wave').length).toBe(0)
    })
  })

  // ─── Position ─────────────────────────────────────────────────────────

  describe('Position tracking', () => {
    it('starts off-screen right (x > 600)', () => {
      controller.start(startConfig())
      expect(controller.currentX).toBeGreaterThan(600)
    })

    it('position decreases during walk_in (moving left)', () => {
      controller.start(startConfig())
      advanceTime(2000) // into walk_in
      expect(states).toContain('walk_in')

      // Filter positions that decreased — avatar moving left
      const decreasing = positions.filter((_, i) =>
        i > 0 && positions[i] < positions[i - 1]
      )
      expect(decreasing.length).toBeGreaterThan(0)
    })
  })

  // ─── Stop ─────────────────────────────────────────────────────────────

  describe('Stop', () => {
    it('resets to hidden', () => {
      controller.start(startConfig())
      controller.stop()
      expect(controller.currentState).toBe('hidden')
    })

    it('stops rAF loop', () => {
      controller.start(startConfig())
      controller.stop()
      // No more callbacks should be queued
      expect(rafCallbacks.length).toBe(0)
    })
  })
})
