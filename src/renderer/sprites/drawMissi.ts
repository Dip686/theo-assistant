/**
 * Missi sprite drawing functions.
 * Girl character: long hair, pink glasses, red lips, pink floral frock.
 * Taller and slimmer build. All functions draw on a 64x64 pixel grid.
 */

import { drawPixel as px, drawRect as rect, addOutline } from './primitives'
import {
  SKIN, SKIN_SHADOW, SKIN_HI,
  HAIR, HAIR_HI, HAIR_OUTLINE, HAIR_STRAND,
  EYE_WHITE, EYE_PUPIL, EYE_IRIS,
  MOUTH, MOUTH_HI, BLUSH,
  GLASSES, GLASSES_HI, EYEBROW,
  DRESS, DRESS_SHADOW, DRESS_HI, FLOWER_DOT,
  SHOE, SHOE_SHADOW,
  getShirtShadow,
} from './colors'
import { WALK_FRAMES } from './walkOffsets'

interface DrawOptions {
  ctx: CanvasRenderingContext2D
  scale: number
  shirtColor: string
  offsetX?: number
  offsetY?: number
}

// Character shifted up by 2px for more height
const U = -2

// Helper: draw long hair on both sides
function drawLongHair(ctx: CanvasRenderingContext2D, S: number, ox: number, oy: number) {
  const u = oy + U
  // Hair top (matches slimmer face)
  for (let x = 26; x <= 37; x++) px(ctx, x+ox, 14+u, HAIR, S)
  for (let x = 25; x <= 38; x++) px(ctx, x+ox, 15+u, HAIR, S)
  for (let x = 24; x <= 39; x++) { px(ctx, x+ox, 16+u, HAIR, S); px(ctx, x+ox, 17+u, HAIR, S); px(ctx, x+ox, 18+u, HAIR, S) }

  // Hair part (center highlight)
  px(ctx, 31+ox, 15+u, HAIR_HI, S); px(ctx, 32+ox, 15+u, HAIR_HI, S)
  px(ctx, 31+ox, 16+u, HAIR_HI, S); px(ctx, 32+ox, 16+u, HAIR_HI, S)

  // Side highlights
  px(ctx, 27+ox, 16+u, HAIR_HI, S); px(ctx, 36+ox, 16+u, HAIR_HI, S)

  // Long hair falling down both sides (slim — 1px wide each side)
  for (let y = 19; y <= 40; y++) {
    px(ctx, 22+ox, y+u, HAIR, S); px(ctx, 23+ox, y+u, HAIR, S)
    px(ctx, 40+ox, y+u, HAIR, S); px(ctx, 41+ox, y+u, HAIR, S)
  }
  // Hair strand wisps
  for (let y = 32; y <= 42; y++) {
    px(ctx, 21+ox, y+u, HAIR_STRAND, S)
    px(ctx, 42+ox, y+u, HAIR_STRAND, S)
  }
  // Hair tapers at bottom
  px(ctx, 22+ox, 41+u, HAIR_STRAND, S); px(ctx, 41+ox, 41+u, HAIR_STRAND, S)
  px(ctx, 23+ox, 42+u, HAIR_STRAND, S); px(ctx, 40+ox, 42+u, HAIR_STRAND, S)
}

// Helper: draw glasses
function drawGlasses(ctx: CanvasRenderingContext2D, S: number, ox: number, oy: number) {
  const u = oy + U
  // Left lens frame
  px(ctx, 25+ox, 20+u, GLASSES, S); px(ctx, 26+ox, 20+u, GLASSES, S); px(ctx, 29+ox, 20+u, GLASSES, S); px(ctx, 30+ox, 20+u, GLASSES, S)
  px(ctx, 25+ox, 21+u, GLASSES, S); px(ctx, 25+ox, 22+u, GLASSES, S); px(ctx, 25+ox, 23+u, GLASSES, S)
  px(ctx, 30+ox, 21+u, GLASSES, S); px(ctx, 30+ox, 22+u, GLASSES, S); px(ctx, 30+ox, 23+u, GLASSES, S)
  px(ctx, 26+ox, 24+u, GLASSES, S); px(ctx, 27+ox, 24+u, GLASSES, S); px(ctx, 28+ox, 24+u, GLASSES, S); px(ctx, 29+ox, 24+u, GLASSES, S)

  // Right lens frame
  px(ctx, 33+ox, 20+u, GLASSES, S); px(ctx, 34+ox, 20+u, GLASSES, S); px(ctx, 37+ox, 20+u, GLASSES, S); px(ctx, 38+ox, 20+u, GLASSES, S)
  px(ctx, 33+ox, 21+u, GLASSES, S); px(ctx, 33+ox, 22+u, GLASSES, S); px(ctx, 33+ox, 23+u, GLASSES, S)
  px(ctx, 38+ox, 21+u, GLASSES, S); px(ctx, 38+ox, 22+u, GLASSES, S); px(ctx, 38+ox, 23+u, GLASSES, S)
  px(ctx, 34+ox, 24+u, GLASSES, S); px(ctx, 35+ox, 24+u, GLASSES, S); px(ctx, 36+ox, 24+u, GLASSES, S); px(ctx, 37+ox, 24+u, GLASSES, S)

  // Bridge
  px(ctx, 31+ox, 21+u, GLASSES, S); px(ctx, 32+ox, 21+u, GLASSES, S)

  // Temple arms
  px(ctx, 24+ox, 21+u, GLASSES_HI, S); px(ctx, 23+ox, 21+u, GLASSES_HI, S)
  px(ctx, 39+ox, 21+u, GLASSES_HI, S); px(ctx, 40+ox, 21+u, GLASSES_HI, S)
}

// Helper: draw pink frock with flower dots (slimmer body)
function drawFrock(ctx: CanvasRenderingContext2D, S: number, ox: number, oy: number, dressColor: string) {
  const shdw = getShirtShadow(dressColor)
  const u = oy + U

  // Main dress body (narrower: 26-37 instead of 24-39)
  for (let y = 29; y <= 50; y++) {
    const flare = y >= 42 ? Math.floor((y - 41) * 0.6) : 0
    for (let x = 26 - flare; x <= 37 + flare; x++) {
      px(ctx, x+ox, y+u, dressColor, S)
    }
  }

  // V-neck cutout
  px(ctx, 30+ox, 29+u, SKIN, S); px(ctx, 31+ox, 29+u, SKIN, S); px(ctx, 32+ox, 29+u, SKIN, S); px(ctx, 33+ox, 29+u, SKIN, S)
  px(ctx, 31+ox, 30+u, shdw, S); px(ctx, 32+ox, 30+u, shdw, S)

  // Dress fold shadows
  for (let y = 33; y <= 49; y += 3) {
    px(ctx, 28+ox, y+u, shdw, S); px(ctx, 35+ox, y+u, shdw, S)
  }

  // Dress highlights
  for (let y = 32; y <= 48; y += 4) {
    px(ctx, 30+ox, y+u, DRESS_HI, S); px(ctx, 33+ox, y+u, DRESS_HI, S)
  }

  // Flower pattern dots
  const flowers = [
    [28, 33], [32, 34], [36, 33],
    [27, 37], [31, 38], [35, 37],
    [26, 41], [30, 42], [34, 41],
    [27, 45], [31, 44], [35, 45],
    [28, 48], [32, 48], [36, 48],
  ]
  for (const [x, y] of flowers) px(ctx, x+ox, y+u, FLOWER_DOT, S)

  // Puffy sleeves (narrower)
  for (let y = 29; y <= 32; y++) {
    px(ctx, 24+ox, y+u, dressColor, S); px(ctx, 25+ox, y+u, dressColor, S)
    px(ctx, 38+ox, y+u, dressColor, S); px(ctx, 39+ox, y+u, dressColor, S)
  }
  px(ctx, 24+ox, 30+u, DRESS_HI, S); px(ctx, 39+ox, 30+u, DRESS_HI, S)
}

// ============================================================
// FRONT VIEW
// ============================================================
export function drawTheoFront(opts: DrawOptions): void {
  const { ctx, scale: S, shirtColor, offsetX: ox = 0, offsetY: oy = 0 } = opts
  const u = oy + U
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Long hair (behind body)
  drawLongHair(ctx, S, ox, oy)

  // Face (slimmer: 25-38 instead of 24-39)
  for (let y = 19; y <= 27; y++) for (let x = 25; x <= 38; x++) px(ctx, x+ox, y+u, SKIN, S)

  // Forehead highlight
  for (let x = 28; x <= 35; x++) px(ctx, x+ox, 19+u, SKIN_HI, S)

  // Ears
  px(ctx, 23+ox, 22+u, SKIN, S); px(ctx, 23+ox, 23+u, SKIN_SHADOW, S)
  px(ctx, 40+ox, 22+u, SKIN, S); px(ctx, 40+ox, 23+u, SKIN_SHADOW, S)

  // Jaw shadow (slim V-chin)
  for (let x = 26; x <= 37; x++) px(ctx, x+ox, 27+u, SKIN_SHADOW, S)
  for (let x = 28; x <= 35; x++) px(ctx, x+ox, 28+u, SKIN_SHADOW, S)
  for (let x = 29; x <= 34; x++) px(ctx, x+ox, 29+u, SKIN_SHADOW, S)

  // Cheek blush
  px(ctx, 26+ox, 24+u, BLUSH, S); px(ctx, 27+ox, 24+u, BLUSH, S)
  px(ctx, 36+ox, 24+u, BLUSH, S); px(ctx, 37+ox, 24+u, BLUSH, S)

  // Eyebrows (arched)
  for (let x = 26; x <= 29; x++) px(ctx, x+ox, 19+u, EYEBROW, S)
  px(ctx, 25+ox, 20+u, EYEBROW, S)
  for (let x = 34; x <= 37; x++) px(ctx, x+ox, 19+u, EYEBROW, S)
  px(ctx, 38+ox, 20+u, EYEBROW, S)

  // Eyes
  rect(ctx, 26+ox, 21+u, 4, 3, EYE_WHITE, S)
  px(ctx, 27+ox, 22+u, EYE_IRIS, S); px(ctx, 28+ox, 22+u, EYE_PUPIL, S); px(ctx, 28+ox, 21+u, EYE_IRIS, S)
  rect(ctx, 33+ox, 21+u, 4, 3, EYE_WHITE, S)
  px(ctx, 34+ox, 22+u, EYE_IRIS, S); px(ctx, 35+ox, 22+u, EYE_PUPIL, S); px(ctx, 35+ox, 21+u, EYE_IRIS, S)

  // Eye shine
  px(ctx, 27+ox, 21+u, '#FFFFFF', S); px(ctx, 34+ox, 21+u, '#FFFFFF', S)

  // Eyelashes
  px(ctx, 25+ox, 20+u, HAIR, S); px(ctx, 30+ox, 20+u, HAIR, S)
  px(ctx, 33+ox, 20+u, HAIR, S); px(ctx, 38+ox, 20+u, HAIR, S)

  // Glasses
  drawGlasses(ctx, S, ox, oy)

  // Nose
  px(ctx, 31+ox, 24+u, SKIN_SHADOW, S); px(ctx, 32+ox, 24+u, SKIN_SHADOW, S)
  px(ctx, 31+ox, 25+u, SKIN_SHADOW, S)

  // Red lips
  for (let x = 29; x <= 34; x++) px(ctx, x+ox, 26+u, MOUTH, S)
  px(ctx, 28+ox, 25+u, MOUTH, S); px(ctx, 35+ox, 25+u, MOUTH, S)
  px(ctx, 31+ox, 26+u, MOUTH_HI, S); px(ctx, 32+ox, 26+u, MOUTH_HI, S)

  // Neck (slimmer)
  rect(ctx, 30+ox, 28+u, 3, 2, SKIN, S)

  // Pink frock
  drawFrock(ctx, S, ox, oy, shirtColor)

  // Arms below sleeves (slimmer position)
  for (let y = 33; y <= 39; y++) {
    px(ctx, 23+ox, y+u, SKIN, S); px(ctx, 24+ox, y+u, SKIN, S)
    px(ctx, 39+ox, y+u, SKIN, S); px(ctx, 40+ox, y+u, SKIN, S)
  }

  // Sandals
  for (let x = 27; x <= 31; x++) { px(ctx, x+ox, 51+u, SHOE, S); px(ctx, x+ox, 52+u, SHOE_SHADOW, S) }
  for (let x = 32; x <= 36; x++) { px(ctx, x+ox, 51+u, SHOE, S); px(ctx, x+ox, 52+u, SHOE_SHADOW, S) }

  addOutline(ctx, S)
}

// ============================================================
// WALK CYCLE
// ============================================================
export function drawTheoWalk(opts: DrawOptions & { frame: number }): void {
  const { ctx, scale: S, shirtColor, frame } = opts
  const f = WALK_FRAMES[frame % 6]
  const by = f.bounce + U

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Hair top (slim)
  for (let x = 26; x <= 37; x++) px(ctx, x, 14+by, HAIR, S)
  for (let x = 25; x <= 38; x++) px(ctx, x, 15+by, HAIR, S)
  for (let x = 24; x <= 39; x++) { px(ctx, x, 16+by, HAIR, S); px(ctx, x, 17+by, HAIR, S); px(ctx, x, 18+by, HAIR, S) }

  // Hair part
  px(ctx, 31, 15+by, HAIR_HI, S); px(ctx, 32, 15+by, HAIR_HI, S)
  px(ctx, 31, 16+by, HAIR_HI, S); px(ctx, 32, 16+by, HAIR_HI, S)
  px(ctx, 27, 16+by, HAIR_HI, S); px(ctx, 36, 16+by, HAIR_HI, S)

  // Long side hair
  for (let y = 19; y <= 40; y++) {
    px(ctx, 22, y+by, HAIR, S); px(ctx, 23, y+by, HAIR, S)
    px(ctx, 40, y+by, HAIR, S); px(ctx, 41, y+by, HAIR, S)
  }
  for (let y = 32; y <= 42; y++) {
    px(ctx, 21, y+by, HAIR_STRAND, S)
    px(ctx, 42, y+by, HAIR_STRAND, S)
  }

  // Face (slim)
  for (let y = 19; y <= 27; y++) for (let x = 25; x <= 38; x++) px(ctx, x, y+by, SKIN, S)
  for (let x = 28; x <= 35; x++) px(ctx, x, 28+by, SKIN_SHADOW, S)
  for (let x = 29; x <= 34; x++) px(ctx, x, 29+by, SKIN_SHADOW, S)
  px(ctx, 24, 22+by, SKIN, S); px(ctx, 39, 22+by, SKIN, S)

  // Blush
  px(ctx, 26, 24+by, BLUSH, S); px(ctx, 27, 24+by, BLUSH, S)
  px(ctx, 36, 24+by, BLUSH, S); px(ctx, 37, 24+by, BLUSH, S)

  // Eyebrows
  for (let x = 26; x <= 29; x++) px(ctx, x, 19+by, EYEBROW, S)
  for (let x = 34; x <= 37; x++) px(ctx, x, 19+by, EYEBROW, S)

  // Eyes
  rect(ctx, 26, 21+by, 4, 3, EYE_WHITE, S)
  px(ctx, 27, 22+by, EYE_IRIS, S); px(ctx, 28, 22+by, EYE_PUPIL, S); px(ctx, 28, 21+by, EYE_IRIS, S)
  rect(ctx, 33, 21+by, 4, 3, EYE_WHITE, S)
  px(ctx, 34, 22+by, EYE_IRIS, S); px(ctx, 35, 22+by, EYE_PUPIL, S); px(ctx, 35, 21+by, EYE_IRIS, S)
  px(ctx, 27, 21+by, '#FFFFFF', S); px(ctx, 34, 21+by, '#FFFFFF', S)

  // Eyelashes
  px(ctx, 25, 20+by, HAIR, S); px(ctx, 30, 20+by, HAIR, S)
  px(ctx, 33, 20+by, HAIR, S); px(ctx, 38, 20+by, HAIR, S)

  // Glasses
  drawGlasses(ctx, S, 0, f.bounce)

  // Nose & lips
  px(ctx, 31, 24+by, SKIN_SHADOW, S); px(ctx, 32, 24+by, SKIN_SHADOW, S)
  for (let x = 29; x <= 34; x++) px(ctx, x, 26+by, MOUTH, S)
  px(ctx, 31, 26+by, MOUTH_HI, S); px(ctx, 32, 26+by, MOUTH_HI, S)

  // Neck
  rect(ctx, 30, 28+by, 3, 2, SKIN, S)

  // Frock body (slimmer)
  for (let y = 29; y <= 50; y++) {
    const flare = y >= 42 ? Math.floor((y - 41) * 0.6) : 0
    for (let x = 26 - flare; x <= 37 + flare; x++) px(ctx, x, y+by, shirtColor, S)
  }
  // V-neck
  px(ctx, 30, 29+by, SKIN, S); px(ctx, 31, 29+by, SKIN, S); px(ctx, 32, 29+by, SKIN, S); px(ctx, 33, 29+by, SKIN, S)

  // Flower dots
  const flowers = [[28,33],[32,34],[36,33],[27,37],[31,38],[35,37],[26,41],[30,42],[34,41],[28,48],[32,48]]
  for (const [x,y] of flowers) px(ctx, x, y+by, FLOWER_DOT, S)

  // Puffy sleeves
  for (let y = 29; y <= 32; y++) {
    px(ctx, 24, y+by, shirtColor, S); px(ctx, 25, y+by, shirtColor, S)
    px(ctx, 38, y+by, shirtColor, S); px(ctx, 39, y+by, shirtColor, S)
  }

  // Arms (swinging, slimmer position)
  for (let y = 33; y <= 39; y++) {
    px(ctx, 23+f.leftArm, y+by, SKIN, S); px(ctx, 24+f.leftArm, y+by, SKIN, S)
    px(ctx, 39+f.rightArm, y+by, SKIN, S); px(ctx, 40+f.rightArm, y+by, SKIN, S)
  }

  // Sandals
  for (let x = 27; x <= 31; x++) { px(ctx, x+f.leftLeg, 51+U, SHOE, S); px(ctx, x+f.leftLeg, 52+U, SHOE_SHADOW, S) }
  for (let x = 32; x <= 36; x++) { px(ctx, x+f.rightLeg, 51+U, SHOE, S); px(ctx, x+f.rightLeg, 52+U, SHOE_SHADOW, S) }

  addOutline(ctx, S)
}

// ============================================================
// PEEK (half head from screen edge)
// ============================================================
export function drawTheoPeek(opts: DrawOptions): void {
  const { ctx, scale: S } = opts
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const ox = 20

  // Hair (partial right side, long)
  for (let x = 32; x <= 41; x++) { px(ctx, x+ox, 14+U, HAIR, S); px(ctx, x+ox, 15+U, HAIR, S); px(ctx, x+ox, 16+U, HAIR, S) }
  for (let x = 33; x <= 41; x++) px(ctx, x+ox, 13+U, HAIR, S)
  px(ctx, 36+ox, 14+U, HAIR_HI, S); px(ctx, 39+ox, 14+U, HAIR_HI, S)

  // Long hair on right side
  for (let y = 17; y <= 36; y++) { px(ctx, 40+ox, y+U, HAIR, S); px(ctx, 41+ox, y+U, HAIR, S) }
  for (let y = 30; y <= 38; y++) px(ctx, 42+ox, y+U, HAIR_STRAND, S)

  // Face (right half)
  for (let y = 17; y <= 25; y++) for (let x = 30; x <= 39; x++) px(ctx, x+ox, y+U, SKIN, S)

  // Blush
  px(ctx, 36+ox, 22+U, BLUSH, S); px(ctx, 37+ox, 22+U, BLUSH, S)

  // Right eye
  rect(ctx, 33+ox, 19+U, 4, 3, EYE_WHITE, S)
  px(ctx, 34+ox, 20+U, EYE_IRIS, S); px(ctx, 35+ox, 20+U, EYE_PUPIL, S)
  px(ctx, 35+ox, 19+U, EYE_IRIS, S); px(ctx, 34+ox, 19+U, '#FFFFFF', S)

  // Right glasses frame
  px(ctx, 33+ox, 18+U, GLASSES, S); px(ctx, 37+ox, 18+U, GLASSES, S); px(ctx, 38+ox, 18+U, GLASSES, S)
  px(ctx, 33+ox, 19+U, GLASSES, S); px(ctx, 33+ox, 20+U, GLASSES, S); px(ctx, 33+ox, 21+U, GLASSES, S)
  px(ctx, 38+ox, 19+U, GLASSES, S); px(ctx, 38+ox, 20+U, GLASSES, S); px(ctx, 38+ox, 21+U, GLASSES, S)
  px(ctx, 34+ox, 22+U, GLASSES, S); px(ctx, 35+ox, 22+U, GLASSES, S); px(ctx, 36+ox, 22+U, GLASSES, S); px(ctx, 37+ox, 22+U, GLASSES, S)

  // Eyebrow
  for (let x = 34; x <= 37; x++) px(ctx, x+ox, 17+U, EYEBROW, S)

  // Eyelash
  px(ctx, 33+ox, 18+U, HAIR, S); px(ctx, 37+ox, 18+U, HAIR, S)

  // Half nose & lips
  px(ctx, 32+ox, 22+U, SKIN_SHADOW, S)
  px(ctx, 33+ox, 24+U, MOUTH, S); px(ctx, 34+ox, 24+U, MOUTH, S); px(ctx, 35+ox, 23+U, MOUTH, S)

  // Edge line
  ctx.fillStyle = '#3A3A5E'
  ctx.fillRect((41+ox)*S, (8+U)*S, S*2, 30*S)

  // Hand peeking
  px(ctx, 40+ox, 23+U, SKIN_HI, S); px(ctx, 40+ox, 24+U, SKIN_HI, S); px(ctx, 40+ox, 25+U, SKIN_HI, S)

  addOutline(ctx, S)
}

// ============================================================
// WAVE (wink + raised arm)
// ============================================================
export function drawTheoWave(opts: DrawOptions): void {
  const { ctx, scale: S, shirtColor } = opts
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Long hair
  drawLongHair(ctx, S, 0, 0)

  // Face (slim)
  for (let y = 19; y <= 27; y++) for (let x = 25; x <= 38; x++) px(ctx, x, y+U, SKIN, S)
  px(ctx, 24, 22+U, SKIN, S); px(ctx, 39, 22+U, SKIN, S)
  for (let x = 28; x <= 35; x++) px(ctx, x, 28+U, SKIN_SHADOW, S)
  for (let x = 29; x <= 34; x++) px(ctx, x, 29+U, SKIN_SHADOW, S)

  // Blush
  px(ctx, 26, 24+U, BLUSH, S); px(ctx, 27, 24+U, BLUSH, S)
  px(ctx, 36, 24+U, BLUSH, S); px(ctx, 37, 24+U, BLUSH, S)

  // Eyebrows
  for (let x = 26; x <= 29; x++) px(ctx, x, 19+U, EYEBROW, S)
  for (let x = 34; x <= 37; x++) px(ctx, x, 19+U, EYEBROW, S)

  // Winking left eye
  for (let x = 26; x <= 29; x++) px(ctx, x, 22+U, HAIR, S)
  // Right eye open
  rect(ctx, 33, 21+U, 4, 3, EYE_WHITE, S)
  px(ctx, 34, 22+U, EYE_IRIS, S); px(ctx, 35, 22+U, EYE_PUPIL, S); px(ctx, 35, 21+U, EYE_IRIS, S)
  px(ctx, 34, 21+U, '#FFFFFF', S)

  // Eyelashes
  px(ctx, 25, 20+U, HAIR, S); px(ctx, 30, 20+U, HAIR, S)
  px(ctx, 33, 20+U, HAIR, S); px(ctx, 38, 20+U, HAIR, S)

  // Glasses
  drawGlasses(ctx, S, 0, 0)

  // Big smile with red lips
  px(ctx, 31, 24+U, SKIN_SHADOW, S); px(ctx, 32, 24+U, SKIN_SHADOW, S)
  for (let x = 28; x <= 35; x++) px(ctx, x, 26+U, MOUTH, S)
  px(ctx, 27, 25+U, MOUTH, S); px(ctx, 36, 25+U, MOUTH, S)
  px(ctx, 31, 26+U, MOUTH_HI, S); px(ctx, 32, 26+U, MOUTH_HI, S)

  // Neck
  rect(ctx, 30, 28+U, 3, 2, SKIN, S)

  // Frock (slimmer)
  for (let y = 29; y <= 50; y++) {
    const flare = y >= 42 ? Math.floor((y - 41) * 0.6) : 0
    for (let x = 26 - flare; x <= 37 + flare; x++) px(ctx, x, y+U, shirtColor, S)
  }
  px(ctx, 30, 29+U, SKIN, S); px(ctx, 31, 29+U, SKIN, S); px(ctx, 32, 29+U, SKIN, S); px(ctx, 33, 29+U, SKIN, S)

  // Flower dots
  const flowers = [[28,33],[32,34],[36,33],[27,37],[31,38],[35,37],[26,41],[30,42],[34,41],[28,48],[32,48]]
  for (const [x,y] of flowers) px(ctx, x, y+U, FLOWER_DOT, S)

  // Left arm (down) with puffy sleeve
  for (let y = 29; y <= 32; y++) { px(ctx, 24, y+U, shirtColor, S); px(ctx, 25, y+U, shirtColor, S) }
  for (let y = 33; y <= 39; y++) { px(ctx, 23, y+U, SKIN, S); px(ctx, 24, y+U, SKIN, S) }

  // Right arm RAISED (waving) with puffy sleeve
  for (let y = 29; y <= 31; y++) { px(ctx, 38, y+U, shirtColor, S); px(ctx, 39, y+U, shirtColor, S) }
  px(ctx, 40, 28+U, SKIN, S); px(ctx, 41, 28+U, SKIN, S)
  px(ctx, 41, 27+U, SKIN, S); px(ctx, 42, 27+U, SKIN, S)
  px(ctx, 42, 26+U, SKIN, S); px(ctx, 43, 26+U, SKIN, S)
  px(ctx, 43, 24+U, SKIN_HI, S); px(ctx, 44, 24+U, SKIN_HI, S)
  px(ctx, 43, 25+U, SKIN_HI, S); px(ctx, 44, 25+U, SKIN_HI, S)
  px(ctx, 45, 24+U, SKIN_HI, S)

  // Sandals
  for (let x = 27; x <= 31; x++) { px(ctx, x, 51+U, SHOE, S); px(ctx, x, 52+U, SHOE_SHADOW, S) }
  for (let x = 32; x <= 36; x++) { px(ctx, x, 51+U, SHOE, S); px(ctx, x, 52+U, SHOE_SHADOW, S) }

  addOutline(ctx, S)
}
