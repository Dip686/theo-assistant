/**
 * Avatar config — runtime switchable between Theo and Missi.
 *
 * The avatar preference is stored in Settings and loaded at startup.
 * Call setAvatar('theo') or setAvatar('missi') to switch.
 */

let currentAvatar: 'theo' | 'missi' = 'theo'

export function getAvatar(): 'theo' | 'missi' {
  return currentAvatar
}

export function setAvatar(avatar: 'theo' | 'missi'): void {
  currentAvatar = avatar
}

// For backward compat with compile-time imports
export const USE_THEO = true
