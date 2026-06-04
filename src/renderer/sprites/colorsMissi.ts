// Missi's color palette — inspired by reference photo
// Fair skin, long dark wavy hair, teal sleeveless top, black trousers, red lips

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
export const GLASSES = ''       // No glasses
export const GLASSES_HI = ''
export const EYEBROW = '#281C16'

// Outfit: teal sleeveless top
export const DRESS = '#1A7A8A'
export const DRESS_SHADOW = '#126570'
export const DRESS_HI = '#2A9AAA'
export const FLOWER_DOT = ''    // No flower pattern

// Black trousers
export const JEANS = '#1A1A2E'
export const JEANS_SHADOW = '#0F0F1E'
export const SHOE = '#2A2A3E'
export const SHOE_SHADOW = '#1A1A2E'

// Accessories
export const NECKLACE = '#D4A843'  // Gold necklace
export const WATCH = '#D4A843'     // Gold watch

export const DEFAULT_SHIRT = '#1A7A8A'

export const SHIRT_PRESETS = [
  { name: 'Teal', color: '#1A7A8A' },
  { name: 'Rose Pink', color: '#F06292' },
  { name: 'Lavender', color: '#B89BD6' },
  { name: 'Sky Blue', color: '#87CEEB' },
  { name: 'Mint Green', color: '#98D4A6' },
  { name: 'Peach', color: '#FFCBA4' },
] as const

export function getShirtShadow(color: string): string {
  const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 30)
  const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 30)
  const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 30)
  return `rgb(${r},${g},${b})`
}
