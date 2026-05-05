import { describe, it, expect } from 'vitest'
import { getQuestionsPerPage } from './responsive'

describe('getQuestionsPerPage', () => {
  // 各断点区间
  it('returns 1 for width < 640', () => {
    expect(getQuestionsPerPage(500)).toBe(1)
  })

  it('returns 3 for 640 <= width < 1024', () => {
    expect(getQuestionsPerPage(800)).toBe(3)
  })

  it('returns 5 for 1024 <= width < 1440', () => {
    expect(getQuestionsPerPage(1200)).toBe(5)
  })

  it('returns 7 for width >= 1440', () => {
    expect(getQuestionsPerPage(1920)).toBe(7)
  })

  // 边界值
  it('returns 1 at boundary 639', () => {
    expect(getQuestionsPerPage(639)).toBe(1)
  })

  it('returns 3 at boundary 640', () => {
    expect(getQuestionsPerPage(640)).toBe(3)
  })

  it('returns 3 at boundary 1023', () => {
    expect(getQuestionsPerPage(1023)).toBe(3)
  })

  it('returns 5 at boundary 1024', () => {
    expect(getQuestionsPerPage(1024)).toBe(5)
  })

  it('returns 5 at boundary 1439', () => {
    expect(getQuestionsPerPage(1439)).toBe(5)
  })

  it('returns 7 at boundary 1440', () => {
    expect(getQuestionsPerPage(1440)).toBe(7)
  })

  // 极端值
  it('returns 1 for width 0', () => {
    expect(getQuestionsPerPage(0)).toBe(1)
  })

  it('returns 7 for very large width', () => {
    expect(getQuestionsPerPage(99999)).toBe(7)
  })
})
