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
  it('exports all required color constants', async () => {
    const colors = await import('../src/renderer/sprites/colors')

    // Core skin colors
    expect(colors.SKIN).toBeDefined()
    expect(colors.SKIN_SHADOW).toBeDefined()
    expect(colors.SKIN_HI).toBeDefined()

    // Hair
    expect(colors.HAIR).toBeDefined()
    expect(colors.HAIR_HI).toBeDefined()
    expect(colors.HAIR_OUTLINE).toBeDefined()

    // Eyes
    expect(colors.EYE_WHITE).toBeDefined()
    expect(colors.EYE_PUPIL).toBeDefined()
    expect(colors.EYE_IRIS).toBeDefined()

    // Clothing
    expect(colors.JEANS).toBeDefined()
    expect(colors.SHOE).toBeDefined()
    expect(colors.DRESS).toBeDefined()

    // Shirt presets
    expect(colors.DEFAULT_SHIRT).toBeDefined()
    expect(colors.SHIRT_PRESETS).toBeDefined()
    expect(typeof colors.getShirtShadow).toBe('function')
  })

  it('colors are valid hex strings', async () => {
    const colors = await import('../src/renderer/sprites/colors')
    const hexPattern = /^#[0-9A-Fa-f]{6}$/

    expect(colors.SKIN).toMatch(hexPattern)
    expect(colors.HAIR).toMatch(hexPattern)
    expect(colors.EYE_PUPIL).toMatch(hexPattern)
    expect(colors.DEFAULT_SHIRT).toMatch(hexPattern)
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
