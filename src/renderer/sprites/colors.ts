/**
 * Color palette switcher — re-exports active palette based on runtime avatar config.
 * Used by UI components (Settings panel shirt presets, etc.) — NOT by draw functions
 * which import their own palette directly from colorsTheo/colorsMissi.
 */

import { getAvatar } from './avatarConfig'
import * as theo from './colorsTheo'
import * as missi from './colorsMissi'

export function getActivePalette() {
  return getAvatar() === 'theo' ? theo : missi
}

// Default exports for UI components that need static access
export const DEFAULT_SHIRT = theo.DEFAULT_SHIRT
export const SHIRT_PRESETS = theo.SHIRT_PRESETS
export const getShirtShadow = theo.getShirtShadow
