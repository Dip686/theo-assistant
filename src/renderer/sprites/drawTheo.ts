/**
 * Sprite switcher — delegates draw calls to Theo or Missi at runtime.
 */

import { getAvatar } from './avatarConfig'
import * as theo from './drawTheoOriginal'
import * as missi from './drawMissi'

function getSprites() {
  return getAvatar() === 'theo' ? theo : missi
}

export const drawTheoFront: typeof theo.drawTheoFront = (opts) => getSprites().drawTheoFront(opts)
export const drawTheoWalk: typeof theo.drawTheoWalk = (opts) => getSprites().drawTheoWalk(opts)
export const drawTheoPeek: typeof theo.drawTheoPeek = (opts) => getSprites().drawTheoPeek(opts)
export const drawTheoWave: typeof theo.drawTheoWave = (opts) => getSprites().drawTheoWave(opts)
