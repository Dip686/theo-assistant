/**
 * Theo sprite drawing functions.
 * Extracted from the working prototype (design-preview/theo-concept.html).
 * All functions draw on a 64x64 pixel grid, rendered at the given scale.
 */

import { drawPixel as px, drawRect as rect, addOutline } from './primitives'
import {
  SKIN, SKIN_SHADOW, SKIN_HI,
  HAIR, HAIR_HI, HAIR_OUTLINE,
  EYE_WHITE, EYE_PUPIL,
  MOUTH, JEANS, JEANS_SHADOW,
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

// ============================================================
// FRONT VIEW
// ============================================================
export function drawTheoFront(opts: DrawOptions): void {
  const { ctx, scale: S, shirtColor, offsetX: ox = 0, offsetY: oy = 0 } = opts
  const shdw = getShirtShadow(shirtColor)

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Hair outline
  for (let x = 24; x <= 39; x++) px(ctx, x+ox, 13+oy, HAIR_OUTLINE, S)
  for (let x = 22; x <= 41; x++) px(ctx, x+ox, 15+oy, HAIR_OUTLINE, S)

  // Hair base
  for (let x = 25; x <= 38; x++) px(ctx, x+ox, 14+oy, HAIR, S)
  for (let x = 24; x <= 39; x++) px(ctx, x+ox, 15+oy, HAIR, S)
  for (let x = 23; x <= 40; x++) { px(ctx, x+ox, 16+oy, HAIR, S); px(ctx, x+ox, 17+oy, HAIR, S); px(ctx, x+ox, 18+oy, HAIR, S) }

  // Curly top
  const curls = [[25,13],[26,12],[27,11],[28,12],[29,13],[30,12],[31,11],[33,13],[34,12],[36,12],[37,13],[38,13]]
  const curlHi = [[27,11],[32,12],[35,11]]
  for (const [x,y] of curls) px(ctx, x+ox, y+oy, HAIR, S)
  for (const [x,y] of curlHi) px(ctx, x+ox, y+oy, HAIR_HI, S)

  // Hair highlights
  const hairHi = [[27,15],[28,15],[29,16],[35,15],[36,16]]
  for (const [x,y] of hairHi) px(ctx, x+ox, y+oy, HAIR_HI, S)

  // Trimmed sides
  for (let y = 19; y <= 21; y++) { px(ctx, 22+ox, y+oy, HAIR_HI, S); px(ctx, 41+ox, y+oy, HAIR_HI, S) }

  // Face
  for (let y = 19; y <= 27; y++) for (let x = 23; x <= 40; x++) px(ctx, x+ox, y+oy, SKIN, S)

  // Ears
  px(ctx, 22+ox, 22+oy, SKIN, S); px(ctx, 22+ox, 23+oy, SKIN_SHADOW, S)
  px(ctx, 41+ox, 22+oy, SKIN, S); px(ctx, 41+ox, 23+oy, SKIN_SHADOW, S)

  // Jaw shadow
  for (let x = 24; x <= 39; x++) px(ctx, x+ox, 27+oy, SKIN_SHADOW, S)
  for (let x = 26; x <= 37; x++) px(ctx, x+ox, 28+oy, SKIN_SHADOW, S)

  // Cheek highlights
  px(ctx, 25+ox, 24+oy, SKIN_HI, S); px(ctx, 38+ox, 24+oy, SKIN_HI, S)

  // Eyes (big, expressive)
  rect(ctx, 26+ox, 21+oy, 4, 3, EYE_WHITE, S)
  px(ctx, 27+ox, 22+oy, EYE_PUPIL, S); px(ctx, 28+ox, 22+oy, EYE_PUPIL, S); px(ctx, 28+ox, 21+oy, EYE_PUPIL, S)
  rect(ctx, 33+ox, 21+oy, 4, 3, EYE_WHITE, S)
  px(ctx, 34+ox, 22+oy, EYE_PUPIL, S); px(ctx, 35+ox, 22+oy, EYE_PUPIL, S); px(ctx, 35+ox, 21+oy, EYE_PUPIL, S)

  // Eye shine
  px(ctx, 29+ox, 21+oy, '#FFFFFF', S); px(ctx, 36+ox, 21+oy, '#FFFFFF', S)

  // Eyebrows
  rect(ctx, 25+ox, 19+oy, 5, 1, HAIR, S); px(ctx, 24+ox, 20+oy, HAIR, S)
  rect(ctx, 33+ox, 19+oy, 5, 1, HAIR, S); px(ctx, 38+ox, 20+oy, HAIR, S)

  // Nose
  px(ctx, 31+ox, 24+oy, SKIN_SHADOW, S); px(ctx, 32+ox, 24+oy, SKIN_SHADOW, S)

  // Mouth
  for (let x = 29; x <= 33; x++) px(ctx, x+ox, 26+oy, MOUTH, S)
  px(ctx, 28+ox, 25+oy, MOUTH, S); px(ctx, 34+ox, 25+oy, MOUTH, S)

  // Neck
  rect(ctx, 30+ox, 28+oy, 4, 2, SKIN, S)

  // T-shirt
  for (let y = 30; y <= 38; y++) for (let x = 24; x <= 39; x++) px(ctx, x+ox, y+oy, shirtColor, S)
  for (let y = 33; y <= 37; y++) { px(ctx, 30+ox, y+oy, shdw, S); px(ctx, 33+ox, y+oy, shdw, S) }
  // Collar
  px(ctx, 29+ox, 30+oy, shdw, S); px(ctx, 30+ox, 30+oy, shdw, S)
  px(ctx, 33+ox, 30+oy, shdw, S); px(ctx, 34+ox, 30+oy, shdw, S)

  // Sleeves
  for (let y = 30; y <= 33; y++) {
    px(ctx, 22+ox, y+oy, shirtColor, S); px(ctx, 23+ox, y+oy, shirtColor, S)
    px(ctx, 40+ox, y+oy, shirtColor, S); px(ctx, 41+ox, y+oy, shirtColor, S)
  }

  // Arms
  for (let y = 34; y <= 39; y++) {
    px(ctx, 22+ox, y+oy, SKIN, S); px(ctx, 23+ox, y+oy, SKIN, S)
    px(ctx, 40+ox, y+oy, SKIN, S); px(ctx, 41+ox, y+oy, SKIN, S)
  }
  px(ctx, 22+ox, 40+oy, SKIN_HI, S); px(ctx, 23+ox, 40+oy, SKIN_HI, S)
  px(ctx, 40+ox, 40+oy, SKIN_HI, S); px(ctx, 41+ox, 40+oy, SKIN_HI, S)

  // Jeans
  for (let y = 39; y <= 48; y++) for (let x = 25; x <= 38; x++) px(ctx, x+ox, y+oy, JEANS, S)
  for (let y = 42; y <= 48; y++) { px(ctx, 31+ox, y+oy, JEANS_SHADOW, S); px(ctx, 32+ox, y+oy, JEANS_SHADOW, S) }
  for (let y = 39; y <= 48; y++) { px(ctx, 25+ox, y+oy, JEANS_SHADOW, S); px(ctx, 38+ox, y+oy, JEANS_SHADOW, S) }

  // Shoes
  for (let x = 24; x <= 30; x++) { px(ctx, x+ox, 49+oy, SHOE, S); px(ctx, x+ox, 50+oy, SHOE_SHADOW, S) }
  for (let x = 33; x <= 39; x++) { px(ctx, x+ox, 49+oy, SHOE, S); px(ctx, x+ox, 50+oy, SHOE_SHADOW, S) }

  addOutline(ctx, S)
}

// ============================================================
// WALK CYCLE
// ============================================================
export function drawTheoWalk(opts: DrawOptions & { frame: number }): void {
  const { ctx, scale: S, shirtColor, frame } = opts
  const shdw = getShirtShadow(shirtColor)
  const f = WALK_FRAMES[frame % 6]
  const by = f.bounce

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Hair
  for (let x = 25; x <= 38; x++) px(ctx, x, 14+by, HAIR, S)
  for (let x = 24; x <= 39; x++) px(ctx, x, 15+by, HAIR, S)
  for (let x = 23; x <= 40; x++) { px(ctx, x, 16+by, HAIR, S); px(ctx, x, 17+by, HAIR, S); px(ctx, x, 18+by, HAIR, S) }

  // Curls
  const curls = [[26,12],[27,11],[28,12],[30,12],[31,11],[32,12],[34,12],[35,11],[36,12],[25,13],[29,13],[33,13],[37,13],[38,13]]
  const curlHi = [[27,11],[32,12],[35,11]]
  for (const [x,y] of curls) px(ctx, x, y+by, HAIR, S)
  for (const [x,y] of curlHi) px(ctx, x, y+by, HAIR_HI, S)

  // Hair highlights
  px(ctx, 27, 15+by, HAIR_HI, S); px(ctx, 28, 15+by, HAIR_HI, S); px(ctx, 35, 15+by, HAIR_HI, S)

  // Trimmed sides
  px(ctx, 22, 19+by, HAIR_HI, S); px(ctx, 22, 20+by, HAIR_HI, S)
  px(ctx, 41, 19+by, HAIR_HI, S); px(ctx, 41, 20+by, HAIR_HI, S)

  // Face
  for (let y = 19; y <= 27; y++) for (let x = 23; x <= 40; x++) px(ctx, x, y+by, SKIN, S)
  for (let x = 26; x <= 37; x++) px(ctx, x, 28+by, SKIN_SHADOW, S)
  px(ctx, 22, 22+by, SKIN, S); px(ctx, 41, 22+by, SKIN, S)

  // Eyes
  rect(ctx, 26, 21+by, 4, 3, EYE_WHITE, S)
  px(ctx, 27, 22+by, EYE_PUPIL, S); px(ctx, 28, 22+by, EYE_PUPIL, S); px(ctx, 28, 21+by, EYE_PUPIL, S)
  rect(ctx, 33, 21+by, 4, 3, EYE_WHITE, S)
  px(ctx, 34, 22+by, EYE_PUPIL, S); px(ctx, 35, 22+by, EYE_PUPIL, S); px(ctx, 35, 21+by, EYE_PUPIL, S)
  px(ctx, 29, 21+by, '#FFFFFF', S); px(ctx, 36, 21+by, '#FFFFFF', S)
  rect(ctx, 25, 19+by, 5, 1, HAIR, S); rect(ctx, 33, 19+by, 5, 1, HAIR, S)

  // Nose & mouth
  px(ctx, 31, 24+by, SKIN_SHADOW, S); px(ctx, 32, 24+by, SKIN_SHADOW, S)
  for (let x = 29; x <= 33; x++) px(ctx, x, 26+by, MOUTH, S)

  // Neck
  rect(ctx, 30, 28+by, 4, 2, SKIN, S)

  // Shirt
  for (let y = 30; y <= 38; y++) for (let x = 24; x <= 39; x++) px(ctx, x, y+by, shirtColor, S)

  // Arms (swinging)
  for (let y = 30; y <= 33; y++) { px(ctx, 22, y+by, shirtColor, S); px(ctx, 23, y+by, shirtColor, S) }
  for (let y = 34; y <= 39; y++) { px(ctx, 22+f.leftArm, y+by, SKIN, S); px(ctx, 23+f.leftArm, y+by, SKIN, S) }
  for (let y = 30; y <= 33; y++) { px(ctx, 40, y+by, shirtColor, S); px(ctx, 41, y+by, shirtColor, S) }
  for (let y = 34; y <= 39; y++) { px(ctx, 40+f.rightArm, y+by, SKIN, S); px(ctx, 41+f.rightArm, y+by, SKIN, S) }

  // Legs
  for (let y = 39; y <= 48; y++) {
    for (let dx = 0; dx < 4; dx++) px(ctx, 26+f.leftLeg+dx, y, JEANS, S)
    px(ctx, 29+f.leftLeg, y, JEANS_SHADOW, S)
    for (let dx = 0; dx < 4; dx++) px(ctx, 34+f.rightLeg+dx, y, JEANS, S)
    px(ctx, 37+f.rightLeg, y, JEANS_SHADOW, S)
  }

  // Shoes
  for (let x = 25; x <= 30; x++) { px(ctx, x+f.leftLeg, 49, SHOE, S); px(ctx, x+f.leftLeg, 50, SHOE_SHADOW, S) }
  for (let x = 33; x <= 38; x++) { px(ctx, x+f.rightLeg, 49, SHOE, S); px(ctx, x+f.rightLeg, 50, SHOE_SHADOW, S) }

  addOutline(ctx, S)
}

// ============================================================
// PEEK (half head from screen edge)
// ============================================================
export function drawTheoPeek(opts: DrawOptions): void {
  const { ctx, scale: S } = opts
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const ox = 20

  // Hair (partial right side)
  for (let x = 32; x <= 42; x++) { px(ctx, x+ox, 16, HAIR, S); px(ctx, x+ox, 17, HAIR, S); px(ctx, x+ox, 18, HAIR, S) }
  for (let x = 33; x <= 42; x++) px(ctx, x+ox, 15, HAIR, S)
  // Curls
  px(ctx, 34+ox, 14, HAIR, S); px(ctx, 35+ox, 13, HAIR_HI, S)
  px(ctx, 36+ox, 14, HAIR, S); px(ctx, 38+ox, 14, HAIR, S)
  px(ctx, 39+ox, 13, HAIR_HI, S); px(ctx, 40+ox, 14, HAIR, S)
  px(ctx, 35+ox, 16, HAIR_HI, S); px(ctx, 38+ox, 16, HAIR_HI, S)

  // Face (right half)
  for (let y = 19; y <= 27; y++) for (let x = 30; x <= 40; x++) px(ctx, x+ox, y, SKIN, S)

  // Right eye
  for (let y = 14; y <= 21; y++) {
    const cx = 34, r = Math.sqrt(Math.max(0, 4.2*4.2 - (y-17.5)**2)) * 0.8
    for (let x = Math.floor(cx-r); x <= Math.ceil(cx+r); x++) if (x+ox < 48) px(ctx, x+ox, y, EYE_WHITE, S)
  }
  rect(ctx, 33+ox, 21, 4, 3, EYE_WHITE, S)
  px(ctx, 34+ox, 22, EYE_PUPIL, S); px(ctx, 35+ox, 22, EYE_PUPIL, S)
  px(ctx, 35+ox, 21, EYE_PUPIL, S); px(ctx, 36+ox, 21, '#FFFFFF', S)
  rect(ctx, 32+ox, 20, 4, 1, HAIR, S)

  // Half nose & mouth
  px(ctx, 32+ox, 24, SKIN_SHADOW, S)
  px(ctx, 33+ox, 26, MOUTH, S); px(ctx, 34+ox, 26, MOUTH, S); px(ctx, 35+ox, 25, MOUTH, S)

  // Edge line
  ctx.fillStyle = '#3A3A5E'
  ctx.fillRect((42+ox)*S, 10*S, S*2, 30*S)

  // Hand peeking
  px(ctx, 41+ox, 25, SKIN_HI, S); px(ctx, 41+ox, 26, SKIN_HI, S); px(ctx, 41+ox, 27, SKIN_HI, S)

  addOutline(ctx, S)
}

// ============================================================
// WAVE (wink + raised arm)
// ============================================================
export function drawTheoWave(opts: DrawOptions): void {
  const { ctx, scale: S, shirtColor } = opts
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Hair
  for (let x = 25; x <= 38; x++) px(ctx, x, 14, HAIR, S)
  for (let x = 24; x <= 39; x++) px(ctx, x, 15, HAIR, S)
  for (let x = 23; x <= 40; x++) { px(ctx, x, 16, HAIR, S); px(ctx, x, 17, HAIR, S); px(ctx, x, 18, HAIR, S) }

  // Curls
  const curls = [[26,12],[27,11],[28,12],[30,12],[31,11],[32,12],[34,12],[35,11],[36,12],[25,13],[29,13],[33,13],[37,13],[38,13]]
  for (const [x,y] of curls) px(ctx, x, y, HAIR, S)
  px(ctx, 27, 11, HAIR_HI, S); px(ctx, 32, 12, HAIR_HI, S); px(ctx, 35, 11, HAIR_HI, S)
  px(ctx, 27, 15, HAIR_HI, S); px(ctx, 28, 15, HAIR_HI, S); px(ctx, 35, 15, HAIR_HI, S)
  px(ctx, 22, 19, HAIR_HI, S); px(ctx, 22, 20, HAIR_HI, S)
  px(ctx, 41, 19, HAIR_HI, S); px(ctx, 41, 20, HAIR_HI, S)

  // Face
  for (let y = 19; y <= 27; y++) for (let x = 23; x <= 40; x++) px(ctx, x, y, SKIN, S)
  px(ctx, 22, 22, SKIN, S); px(ctx, 41, 22, SKIN, S)
  for (let x = 26; x <= 37; x++) px(ctx, x, 28, SKIN_SHADOW, S)

  // Winking left eye
  for (let x = 26; x <= 29; x++) px(ctx, x, 22, HAIR, S)
  // Right eye open
  rect(ctx, 33, 21, 4, 3, EYE_WHITE, S)
  px(ctx, 34, 22, EYE_PUPIL, S); px(ctx, 35, 22, EYE_PUPIL, S); px(ctx, 35, 21, EYE_PUPIL, S)
  px(ctx, 36, 21, '#FFFFFF', S)
  rect(ctx, 25, 19, 5, 1, HAIR, S); rect(ctx, 33, 19, 5, 1, HAIR, S)

  // Big grin
  px(ctx, 31, 24, SKIN_SHADOW, S); px(ctx, 32, 24, SKIN_SHADOW, S)
  for (let x = 28; x <= 35; x++) px(ctx, x, 26, MOUTH, S)
  px(ctx, 27, 25, MOUTH, S); px(ctx, 36, 25, MOUTH, S)

  // Neck
  rect(ctx, 30, 28, 4, 2, SKIN, S)

  // Shirt
  for (let y = 30; y <= 38; y++) for (let x = 24; x <= 39; x++) px(ctx, x, y, shirtColor, S)

  // Left arm (down)
  for (let y = 30; y <= 33; y++) { px(ctx, 22, y, shirtColor, S); px(ctx, 23, y, shirtColor, S) }
  for (let y = 34; y <= 39; y++) { px(ctx, 22, y, SKIN, S); px(ctx, 23, y, SKIN, S) }

  // Right arm RAISED (waving)
  for (let y = 30; y <= 32; y++) { px(ctx, 40, y, shirtColor, S); px(ctx, 41, y, shirtColor, S) }
  px(ctx, 42, 29, SKIN, S); px(ctx, 43, 29, SKIN, S)
  px(ctx, 43, 28, SKIN, S); px(ctx, 44, 28, SKIN, S)
  px(ctx, 44, 27, SKIN, S); px(ctx, 45, 27, SKIN, S)
  px(ctx, 45, 25, SKIN_HI, S); px(ctx, 46, 25, SKIN_HI, S)
  px(ctx, 45, 26, SKIN_HI, S); px(ctx, 46, 26, SKIN_HI, S)
  px(ctx, 47, 25, SKIN_HI, S)

  // Jeans
  for (let y = 39; y <= 48; y++) for (let x = 25; x <= 38; x++) px(ctx, x, y, JEANS, S)
  for (let y = 42; y <= 48; y++) { px(ctx, 31, y, JEANS_SHADOW, S); px(ctx, 32, y, JEANS_SHADOW, S) }

  // Shoes
  for (let x = 24; x <= 30; x++) { px(ctx, x, 49, SHOE, S); px(ctx, x, 50, SHOE_SHADOW, S) }
  for (let x = 33; x <= 39; x++) { px(ctx, x, 49, SHOE, S); px(ctx, x, 50, SHOE_SHADOW, S) }

  addOutline(ctx, S)
}
