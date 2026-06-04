/**
 * Missi sprite drawing functions.
 * Girl character: long dark wavy hair, teal sleeveless V-neck top,
 * black trousers, red lips, gold necklace. No glasses.
 * Taller and slimmer build. All functions draw on a 64x64 pixel grid.
 */

import { drawPixel as px, drawRect as rect, addOutline } from './primitives'
import {
  SKIN, SKIN_SHADOW, SKIN_HI,
  HAIR, HAIR_HI, HAIR_OUTLINE, HAIR_STRAND,
  EYE_WHITE, EYE_PUPIL, EYE_IRIS,
  MOUTH, MOUTH_HI, BLUSH, EYEBROW,
  DRESS, DRESS_SHADOW, DRESS_HI,
  JEANS, JEANS_SHADOW,
  SHOE, SHOE_SHADOW,
  NECKLACE,
  getShirtShadow,
} from './colorsMissi'
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

// Helper: draw long wavy hair on both sides
function drawLongHair(ctx: CanvasRenderingContext2D, S: number, ox: number, oy: number) {
  const u = oy + U
  // Hair top
  for (let x = 26; x <= 37; x++) px(ctx, x+ox, 14+u, HAIR, S)
  for (let x = 25; x <= 38; x++) px(ctx, x+ox, 15+u, HAIR, S)
  for (let x = 24; x <= 39; x++) { px(ctx, x+ox, 16+u, HAIR, S); px(ctx, x+ox, 17+u, HAIR, S); px(ctx, x+ox, 18+u, HAIR, S) }

  // Hair part (center highlight)
  px(ctx, 31+ox, 15+u, HAIR_HI, S); px(ctx, 32+ox, 15+u, HAIR_HI, S)
  px(ctx, 31+ox, 16+u, HAIR_HI, S); px(ctx, 32+ox, 16+u, HAIR_HI, S)

  // Side highlights
  px(ctx, 27+ox, 16+u, HAIR_HI, S); px(ctx, 36+ox, 16+u, HAIR_HI, S)

  // Long hair falling down both sides (2px wide each side)
  for (let y = 19; y <= 40; y++) {
    px(ctx, 22+ox, y+u, HAIR, S); px(ctx, 23+ox, y+u, HAIR, S)
    px(ctx, 40+ox, y+u, HAIR, S); px(ctx, 41+ox, y+u, HAIR, S)
  }
  // Hair strand wisps (wavy effect)
  for (let y = 32; y <= 42; y++) {
    px(ctx, 21+ox, y+u, HAIR_STRAND, S)
    px(ctx, 42+ox, y+u, HAIR_STRAND, S)
  }
  // Hair tapers at bottom
  px(ctx, 22+ox, 41+u, HAIR_STRAND, S); px(ctx, 41+ox, 41+u, HAIR_STRAND, S)
  px(ctx, 23+ox, 42+u, HAIR_STRAND, S); px(ctx, 40+ox, 42+u, HAIR_STRAND, S)
}

// Helper: draw sleeveless top with V-neck
function drawTop(ctx: CanvasRenderingContext2D, S: number, ox: number, oy: number, topColor: string) {
  const shdw = getShirtShadow(topColor)
  const u = oy + U

  // Sleeveless top body (narrower: 26-37)
  for (let y = 29; y <= 38; y++) {
    for (let x = 26; x <= 37; x++) {
      px(ctx, x+ox, y+u, topColor, S)
    }
  }

  // V-neck cutout
  px(ctx, 30+ox, 29+u, SKIN, S); px(ctx, 31+ox, 29+u, SKIN, S); px(ctx, 32+ox, 29+u, SKIN, S); px(ctx, 33+ox, 29+u, SKIN, S)
  px(ctx, 31+ox, 30+u, SKIN, S); px(ctx, 32+ox, 30+u, SKIN, S)

  // Fold shadows
  for (let y = 33; y <= 37; y += 2) {
    px(ctx, 28+ox, y+u, shdw, S); px(ctx, 35+ox, y+u, shdw, S)
  }

  // No sleeves — bare shoulders/arms visible
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

  // Face (slimmer: 25-38)
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

  // Nose
  px(ctx, 31+ox, 24+u, SKIN_SHADOW, S); px(ctx, 32+ox, 24+u, SKIN_SHADOW, S)
  px(ctx, 31+ox, 25+u, SKIN_SHADOW, S)

  // Red lips
  for (let x = 29; x <= 34; x++) px(ctx, x+ox, 26+u, MOUTH, S)
  px(ctx, 28+ox, 25+u, MOUTH, S); px(ctx, 35+ox, 25+u, MOUTH, S)
  px(ctx, 31+ox, 26+u, MOUTH_HI, S); px(ctx, 32+ox, 26+u, MOUTH_HI, S)

  // Neck (slimmer)
  rect(ctx, 30+ox, 28+u, 3, 2, SKIN, S)

  // Gold necklace
  px(ctx, 29+ox, 29+u, NECKLACE, S); px(ctx, 30+ox, 29+u, NECKLACE, S)
  px(ctx, 33+ox, 29+u, NECKLACE, S); px(ctx, 34+ox, 29+u, NECKLACE, S)
  px(ctx, 31+ox, 30+u, NECKLACE, S); px(ctx, 32+ox, 30+u, NECKLACE, S) // pendant

  // Sleeveless top
  drawTop(ctx, S, ox, oy, shirtColor)

  // Bare arms (no sleeves — skin from shoulder down)
  for (let y = 29; y <= 39; y++) {
    px(ctx, 24+ox, y+u, SKIN, S); px(ctx, 25+ox, y+u, SKIN, S)
    px(ctx, 38+ox, y+u, SKIN, S); px(ctx, 39+ox, y+u, SKIN, S)
  }
  // Hand highlights
  px(ctx, 24+ox, 39+u, SKIN_HI, S); px(ctx, 39+ox, 39+u, SKIN_HI, S)

  // Gold watch on left wrist
  px(ctx, 24+ox, 37+u, NECKLACE, S); px(ctx, 24+ox, 38+u, NECKLACE, S)

  // Black trousers
  for (let y = 39; y <= 48; y++) for (let x = 27; x <= 36; x++) px(ctx, x+ox, y+u, JEANS, S)
  for (let y = 42; y <= 48; y++) { px(ctx, 31+ox, y+u, JEANS_SHADOW, S); px(ctx, 32+ox, y+u, JEANS_SHADOW, S) }
  for (let y = 39; y <= 48; y++) { px(ctx, 27+ox, y+u, JEANS_SHADOW, S); px(ctx, 36+ox, y+u, JEANS_SHADOW, S) }

  // Shoes
  for (let x = 26; x <= 31; x++) { px(ctx, x+ox, 49+u, SHOE, S); px(ctx, x+ox, 50+u, SHOE_SHADOW, S) }
  for (let x = 32; x <= 37; x++) { px(ctx, x+ox, 49+u, SHOE, S); px(ctx, x+ox, 50+u, SHOE_SHADOW, S) }

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

  // Hair top
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
    px(ctx, 21, y+by, HAIR_STRAND, S); px(ctx, 42, y+by, HAIR_STRAND, S)
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

  // Nose & lips
  px(ctx, 31, 24+by, SKIN_SHADOW, S); px(ctx, 32, 24+by, SKIN_SHADOW, S)
  for (let x = 29; x <= 34; x++) px(ctx, x, 26+by, MOUTH, S)
  px(ctx, 31, 26+by, MOUTH_HI, S); px(ctx, 32, 26+by, MOUTH_HI, S)

  // Neck + necklace
  rect(ctx, 30, 28+by, 3, 2, SKIN, S)
  px(ctx, 29, 29+by, NECKLACE, S); px(ctx, 34, 29+by, NECKLACE, S)
  px(ctx, 31, 30+by, NECKLACE, S); px(ctx, 32, 30+by, NECKLACE, S)

  // Sleeveless top body
  for (let y = 29; y <= 38; y++) for (let x = 26; x <= 37; x++) px(ctx, x, y+by, shirtColor, S)
  // V-neck
  px(ctx, 30, 29+by, SKIN, S); px(ctx, 31, 29+by, SKIN, S); px(ctx, 32, 29+by, SKIN, S); px(ctx, 33, 29+by, SKIN, S)
  px(ctx, 31, 30+by, SKIN, S); px(ctx, 32, 30+by, SKIN, S)

  // Bare arms (swinging)
  for (let y = 29; y <= 39; y++) {
    px(ctx, 24+f.leftArm, y+by, SKIN, S); px(ctx, 25+f.leftArm, y+by, SKIN, S)
    px(ctx, 38+f.rightArm, y+by, SKIN, S); px(ctx, 39+f.rightArm, y+by, SKIN, S)
  }

  // Black trousers with legs
  for (let y = 39; y <= 48; y++) {
    for (let dx = 0; dx < 4; dx++) px(ctx, 27+f.leftLeg+dx, y, JEANS, S)
    px(ctx, 30+f.leftLeg, y, JEANS_SHADOW, S)
    for (let dx = 0; dx < 4; dx++) px(ctx, 33+f.rightLeg+dx, y, JEANS, S)
    px(ctx, 36+f.rightLeg, y, JEANS_SHADOW, S)
  }

  // Shoes
  for (let x = 26; x <= 31; x++) { px(ctx, x+f.leftLeg, 49+U, SHOE, S); px(ctx, x+f.leftLeg, 50+U, SHOE_SHADOW, S) }
  for (let x = 32; x <= 37; x++) { px(ctx, x+f.rightLeg, 49+U, SHOE, S); px(ctx, x+f.rightLeg, 50+U, SHOE_SHADOW, S) }

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

  // Big smile with red lips
  px(ctx, 31, 24+U, SKIN_SHADOW, S); px(ctx, 32, 24+U, SKIN_SHADOW, S)
  for (let x = 28; x <= 35; x++) px(ctx, x, 26+U, MOUTH, S)
  px(ctx, 27, 25+U, MOUTH, S); px(ctx, 36, 25+U, MOUTH, S)
  px(ctx, 31, 26+U, MOUTH_HI, S); px(ctx, 32, 26+U, MOUTH_HI, S)

  // Neck + necklace
  rect(ctx, 30, 28+U, 3, 2, SKIN, S)
  px(ctx, 29, 29+U, NECKLACE, S); px(ctx, 34, 29+U, NECKLACE, S)
  px(ctx, 31, 30+U, NECKLACE, S); px(ctx, 32, 30+U, NECKLACE, S)

  // Sleeveless top
  for (let y = 29; y <= 38; y++) for (let x = 26; x <= 37; x++) px(ctx, x, y+U, shirtColor, S)
  px(ctx, 30, 29+U, SKIN, S); px(ctx, 31, 29+U, SKIN, S); px(ctx, 32, 29+U, SKIN, S); px(ctx, 33, 29+U, SKIN, S)
  px(ctx, 31, 30+U, SKIN, S); px(ctx, 32, 30+U, SKIN, S)

  // Left arm (down, bare)
  for (let y = 29; y <= 39; y++) { px(ctx, 24, y+U, SKIN, S); px(ctx, 25, y+U, SKIN, S) }

  // Right arm RAISED (waving, bare)
  px(ctx, 38, 29+U, SKIN, S); px(ctx, 39, 29+U, SKIN, S)
  px(ctx, 40, 28+U, SKIN, S); px(ctx, 41, 28+U, SKIN, S)
  px(ctx, 41, 27+U, SKIN, S); px(ctx, 42, 27+U, SKIN, S)
  px(ctx, 42, 26+U, SKIN, S); px(ctx, 43, 26+U, SKIN, S)
  px(ctx, 43, 24+U, SKIN_HI, S); px(ctx, 44, 24+U, SKIN_HI, S)
  px(ctx, 43, 25+U, SKIN_HI, S); px(ctx, 44, 25+U, SKIN_HI, S)
  px(ctx, 45, 24+U, SKIN_HI, S)

  // Black trousers
  for (let y = 39; y <= 48; y++) for (let x = 27; x <= 36; x++) px(ctx, x, y+U, JEANS, S)
  for (let y = 42; y <= 48; y++) { px(ctx, 31, y+U, JEANS_SHADOW, S); px(ctx, 32, y+U, JEANS_SHADOW, S) }

  // Shoes
  for (let x = 26; x <= 31; x++) { px(ctx, x, 49+U, SHOE, S); px(ctx, x, 50+U, SHOE_SHADOW, S) }
  for (let x = 32; x <= 37; x++) { px(ctx, x, 49+U, SHOE, S); px(ctx, x, 50+U, SHOE_SHADOW, S) }

  addOutline(ctx, S)
}
