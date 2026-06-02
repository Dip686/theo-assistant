// Avatar color palette — inspired by reference

export const SKIN = '#EDC9AF'
export const SKIN_SHADOW = '#D7AF91'
export const SKIN_HI = '#F5DAC3'
export const HAIR = '#231914'
export const HAIR_HI = '#3C2D23'
export const HAIR_OUTLINE = '#0A0A14'
export const HAIR_STRAND = '#322319'
export const EYE_WHITE = '#FFFFFF'
export const EYE_PUPIL = '#1E140F'
export const EYE_IRIS = '#37231A'
export const MOUTH = '#B43228'
export const MOUTH_HI = '#C84637'
export const BLUSH = '#EBB4AA'
export const GLASSES = '#E6B4AA'
export const GLASSES_HI = '#F0C8BE'
export const EYEBROW = '#281C16'

// Pink frock — vivid pink
export const DRESS = '#F06292'
export const DRESS_SHADOW = '#D84880'
export const DRESS_HI = '#F48FB1'
export const FLOWER_DOT = '#FFF0E6'

// Legacy exports for compatibility
export const JEANS = DRESS
export const JEANS_SHADOW = DRESS_SHADOW
export const SHOE = '#D4A07A'
export const SHOE_SHADOW = '#C49070'

export const DEFAULT_SHIRT = '#F06292'

export const SHIRT_PRESETS = [
  { name: 'Rose Pink', color: '#F06292' },
  { name: 'Lavender', color: '#B89BD6' },
  { name: 'Sky Blue', color: '#87CEEB' },
  { name: 'Mint Green', color: '#98D4A6' },
  { name: 'Peach', color: '#FFCBA4' },
  { name: 'Lilac', color: '#C8A2C8' },
] as const

export function getShirtShadow(color: string): string {
  const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 30)
  const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 30)
  const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 30)
  return `rgb(${r},${g},${b})`
}
