import { describe, it, expect } from 'vitest'

/**
 * Avatar switcher tests — verify Theo/Missi dual avatar system.
 *
 * These test the compile-time config and palette/sprite re-export logic.
 * The actual USE_THEO flag should always be `true` in committed code
 * (Missi is local-only experimentation).
 */

describe('Avatar config', () => {
  it('USE_THEO defaults to true in committed code', async () => {
    const { USE_THEO } = await import('../src/renderer/sprites/avatarConfig')
    expect(USE_THEO).toBe(true)
  })
})

describe('Color palette switcher', () => {
  it('getActivePalette returns a valid palette', async () => {
    const { getActivePalette } = await import('../src/renderer/sprites/colors')
    const palette = getActivePalette()

    // Core skin colors
    expect(palette.SKIN).toBeDefined()
    expect(palette.SKIN_SHADOW).toBeDefined()
    expect(palette.SKIN_HI).toBeDefined()

    // Hair
    expect(palette.HAIR).toBeDefined()
    expect(palette.HAIR_HI).toBeDefined()
    expect(palette.HAIR_OUTLINE).toBeDefined()

    // Eyes
    expect(palette.EYE_WHITE).toBeDefined()
    expect(palette.EYE_PUPIL).toBeDefined()
    expect(palette.EYE_IRIS).toBeDefined()

    // Clothing
    expect(palette.SHOE).toBeDefined()
    expect(palette.DRESS).toBeDefined()

    // Shirt presets
    expect(palette.DEFAULT_SHIRT).toBeDefined()
    expect(palette.SHIRT_PRESETS).toBeDefined()
    expect(typeof palette.getShirtShadow).toBe('function')
  })

  it('palette colors are valid hex strings', async () => {
    const { getActivePalette } = await import('../src/renderer/sprites/colors')
    const palette = getActivePalette()
    const hexPattern = /^#[0-9A-Fa-f]{6}$/

    expect(palette.SKIN).toMatch(hexPattern)
    expect(palette.HAIR).toMatch(hexPattern)
    expect(palette.EYE_PUPIL).toMatch(hexPattern)
    expect(palette.DEFAULT_SHIRT).toMatch(hexPattern)
  })

  it('switching avatar changes the active palette', async () => {
    const { setAvatar, getAvatar } = await import('../src/renderer/sprites/avatarConfig')
    const { getActivePalette } = await import('../src/renderer/sprites/colors')

    setAvatar('theo')
    const theoPalette = getActivePalette()
    expect(theoPalette.SKIN).toBe('#C68642')

    setAvatar('missi')
    const missiPalette = getActivePalette()
    expect(missiPalette.SKIN).toBe('#EDC9AF')

    // Reset
    setAvatar('theo')
  })
})

describe('Theo palette', () => {
  it('has brown skin tone', async () => {
    const theo = await import('../src/renderer/sprites/colorsTheo')
    // Theo has brown skin (#C68642)
    expect(theo.SKIN).toBe('#C68642')
  })

  it('has dark hair', async () => {
    const theo = await import('../src/renderer/sprites/colorsTheo')
    expect(theo.HAIR).toBe('#2A2A3E')
  })
})

describe('Missi palette', () => {
  it('has fair skin tone', async () => {
    const missi = await import('../src/renderer/sprites/colorsMissi')
    expect(missi.SKIN).toBe('#EDC9AF')
  })

  it('has pink dress', async () => {
    const missi = await import('../src/renderer/sprites/colorsMissi')
    // Should be a pink/rose color
    expect(missi.DRESS).toBeDefined()
  })

  it('has glasses colors', async () => {
    const missi = await import('../src/renderer/sprites/colorsMissi')
    expect(missi.GLASSES).toBeDefined()
    expect(missi.GLASSES_HI).toBeDefined()
  })
})

describe('Sprite draw switcher', () => {
  it('exports all 4 draw functions', async () => {
    const sprites = await import('../src/renderer/sprites/drawTheo')

    expect(typeof sprites.drawTheoFront).toBe('function')
    expect(typeof sprites.drawTheoWalk).toBe('function')
    expect(typeof sprites.drawTheoPeek).toBe('function')
    expect(typeof sprites.drawTheoWave).toBe('function')
  })
})
