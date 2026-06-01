// Theo's color palette — extracted from design prototype

export const SKIN = '#C68642'
export const SKIN_SHADOW = '#A0622E'
export const SKIN_HI = '#DBA05A'
export const HAIR = '#2A2A3E'
export const HAIR_HI = '#4A4A6E'
export const HAIR_OUTLINE = '#0A0A14'
export const EYE_WHITE = '#FFFFFF'
export const EYE_PUPIL = '#1A1A2E'
export const MOUTH = '#C1553A'
export const JEANS = '#3D4F6F'
export const JEANS_SHADOW = '#2D3F5F'
export const SHOE = '#E8E8E8'
export const SHOE_SHADOW = '#CCCCCC'

export const DEFAULT_SHIRT = '#4A90D9'

export const SHIRT_PRESETS = [
  { name: 'Ocean Blue', color: '#4A90D9' },
  { name: 'Forest Green', color: '#4CAF50' },
  { name: 'Sunset Red', color: '#E74C3C' },
  { name: 'Purple Haze', color: '#9B59B6' },
  { name: 'Mustard', color: '#F39C12' },
  { name: 'Charcoal', color: '#34495E' },
] as const

export function getShirtShadow(color: string): string {
  const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 30)
  const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 30)
  const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 30)
  return `rgb(${r},${g},${b})`
}
