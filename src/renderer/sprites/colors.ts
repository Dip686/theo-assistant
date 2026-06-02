/**
 * Color palette switcher — re-exports from Theo or Missi based on avatarConfig.
 */

import { USE_THEO } from './avatarConfig'
import * as theo from './colorsTheo'
import * as missi from './colorsMissi'

const palette = USE_THEO ? theo : missi

export const SKIN = palette.SKIN
export const SKIN_SHADOW = palette.SKIN_SHADOW
export const SKIN_HI = palette.SKIN_HI
export const HAIR = palette.HAIR
export const HAIR_HI = palette.HAIR_HI
export const HAIR_OUTLINE = palette.HAIR_OUTLINE
export const HAIR_STRAND = palette.HAIR_STRAND
export const EYE_WHITE = palette.EYE_WHITE
export const EYE_PUPIL = palette.EYE_PUPIL
export const EYE_IRIS = palette.EYE_IRIS
export const MOUTH = palette.MOUTH
export const MOUTH_HI = palette.MOUTH_HI
export const BLUSH = palette.BLUSH
export const GLASSES = palette.GLASSES
export const GLASSES_HI = palette.GLASSES_HI
export const EYEBROW = palette.EYEBROW
export const JEANS = palette.JEANS
export const JEANS_SHADOW = palette.JEANS_SHADOW
export const SHOE = palette.SHOE
export const SHOE_SHADOW = palette.SHOE_SHADOW
export const DRESS = palette.DRESS
export const DRESS_SHADOW = palette.DRESS_SHADOW
export const DRESS_HI = palette.DRESS_HI
export const FLOWER_DOT = palette.FLOWER_DOT

export const DEFAULT_SHIRT = palette.DEFAULT_SHIRT
export const SHIRT_PRESETS = palette.SHIRT_PRESETS
export const getShirtShadow = palette.getShirtShadow
