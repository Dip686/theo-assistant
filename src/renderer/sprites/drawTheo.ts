/**
 * Sprite switcher — re-exports draw functions from Theo or Missi based on avatarConfig.
 */

import { USE_THEO } from './avatarConfig'
import * as theo from './drawTheoOriginal'
import * as missi from './drawMissi'

const sprites = USE_THEO ? theo : missi

export const drawTheoFront = sprites.drawTheoFront
export const drawTheoWalk = sprites.drawTheoWalk
export const drawTheoPeek = sprites.drawTheoPeek
export const drawTheoWave = sprites.drawTheoWave
