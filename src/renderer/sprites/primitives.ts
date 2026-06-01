// Pixel art drawing primitives

export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  scale: number
): void {
  ctx.fillStyle = color
  ctx.fillRect(x * scale, y * scale, scale, scale)
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  scale: number
): void {
  ctx.fillStyle = color
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale)
}

/**
 * Adds a 1px dark outline around all non-transparent pixels.
 * Standard pixel art technique for contrast against any background.
 */
export function addOutline(
  ctx: CanvasRenderingContext2D,
  scale: number,
  outlineColor = '#0A0A14'
): void {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const outline: [number, number][] = []

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (data[i + 3] === 0) {
        const neighbors: [number, number][] = [
          [x - scale, y],
          [x + scale, y],
          [x, y - scale],
          [x, y + scale],
        ]
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const ni = (ny * w + nx) * 4
            if (data[ni + 3] > 0) {
              outline.push([x, y])
              break
            }
          }
        }
      }
    }
  }

  const r = parseInt(outlineColor.slice(1, 3), 16)
  const g = parseInt(outlineColor.slice(3, 5), 16)
  const b = parseInt(outlineColor.slice(5, 7), 16)
  for (const [x, y] of outline) {
    const i = (y * w + x) * 4
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
}
