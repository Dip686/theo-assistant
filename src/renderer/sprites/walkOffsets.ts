export interface WalkFrame {
  leftArm: number
  rightArm: number
  leftLeg: number
  rightLeg: number
  bounce: number
}

export const WALK_FRAMES: WalkFrame[] = [
  { leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bounce: 0 },
  { leftArm: -1, rightArm: 1, leftLeg: 1, rightLeg: -1, bounce: -1 },
  { leftArm: -2, rightArm: 2, leftLeg: 2, rightLeg: -2, bounce: 0 },
  { leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bounce: 0 },
  { leftArm: 1, rightArm: -1, leftLeg: -1, rightLeg: 1, bounce: -1 },
  { leftArm: 2, rightArm: -2, leftLeg: -2, rightLeg: 2, bounce: 0 },
]
