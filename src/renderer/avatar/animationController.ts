/**
 * Animation state machine for the reminder flow.
 * States: HIDDEN -> PEEK -> WALK_IN -> TALK -> WAVE -> WALK_OUT -> HIDDEN
 */

export type AnimState = 'hidden' | 'peek' | 'walk_in' | 'talk' | 'wave' | 'walk_out'

export interface AnimationConfig {
  gentleMode: boolean
  message: string
  reminderId: string
  onStateChange: (state: AnimState) => void
  onPositionChange: (x: number) => void
  onComplete: (reminderId: string) => void
}

export class AnimationController {
  private state: AnimState = 'hidden'
  private config: AnimationConfig | null = null
  private rafId: number | null = null
  private walkFrame = 0
  private positionX = 0
  private stageWidth = 600
  private stateTimer = 0
  private lastTime = 0
  private frameAccum = 0

  // Timing constants (ms)
  private readonly FRAME_INTERVAL = 40 // 25fps
  private readonly WALK_SPEED = 4 // pixels per frame
  private readonly TARGET_X = 220 // final position from right
  private readonly PEEK_DURATION = 1500
  private readonly WAVE_DURATION = 1200

  get currentState(): AnimState {
    return this.state
  }

  get currentFrame(): number {
    return this.walkFrame
  }

  get currentX(): number {
    return this.positionX
  }

  start(config: AnimationConfig): void {
    this.stop()
    this.config = config
    this.positionX = this.stageWidth + 10 // start off-screen
    this.walkFrame = 0
    this.stateTimer = 0
    this.lastTime = performance.now()
    this.frameAccum = 0
    this.setState('peek')
    this.loop()
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.state = 'hidden'
    this.config = null
  }

  private setState(newState: AnimState): void {
    this.state = newState
    this.stateTimer = 0
    this.config?.onStateChange(newState)
  }

  private loop = (): void => {
    const now = performance.now()
    const delta = now - this.lastTime
    this.lastTime = now
    this.stateTimer += delta
    this.frameAccum += delta

    // Process at fixed frame interval
    while (this.frameAccum >= this.FRAME_INTERVAL) {
      this.frameAccum -= this.FRAME_INTERVAL
      this.tick()
    }

    if (this.state !== 'hidden') {
      this.rafId = requestAnimationFrame(this.loop)
    }
  }

  private tick(): void {
    if (!this.config) return

    const gentle = this.config.gentleMode
    const talkDuration = gentle ? 4000 : 8000

    switch (this.state) {
      case 'peek':
        if (this.stateTimer >= (gentle ? 500 : this.PEEK_DURATION)) {
          this.setState('walk_in')
        }
        break

      case 'walk_in':
        this.positionX -= this.WALK_SPEED
        this.walkFrame = (this.walkFrame + 1) % 6
        this.config.onPositionChange(this.positionX)

        if (this.positionX <= this.stageWidth - this.TARGET_X) {
          this.setState('talk')
        }
        break

      case 'talk':
        if (this.stateTimer >= talkDuration) {
          this.setState('wave')
        }
        break

      case 'wave':
        if (this.stateTimer >= (gentle ? 600 : this.WAVE_DURATION)) {
          this.setState('walk_out')
        }
        break

      case 'walk_out':
        this.positionX += this.WALK_SPEED
        this.walkFrame = (this.walkFrame + 1) % 6
        this.config.onPositionChange(this.positionX)

        if (this.positionX >= this.stageWidth + 10) {
          const reminderId = this.config.reminderId
          this.setState('hidden')
          this.config?.onComplete(reminderId)
          this.stop()
        }
        break
    }
  }

  dismiss(): void {
    if (this.state === 'talk') {
      this.setState('wave')
    }
  }
}
