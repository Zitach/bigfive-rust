import { describe, it, expect, beforeEach } from 'vitest'
import { useB5Data } from './useB5Data'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('useB5Data', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes empty', () => {
    const { answers, currentIndex } = useB5Data()
    expect(answers.value).toEqual([])
    expect(currentIndex.value).toBe(0)
  })

  it('saves answers to localStorage', () => {
    const { answers, currentIndex, save } = useB5Data()
    answers.value = [{ id: 'q1', score: 3, domain: 'O', facet: 1 }]
    currentIndex.value = 5
    save()

    const raw = localStorage.getItem('b5data')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.answers).toHaveLength(1)
    expect(parsed.currentIndex).toBe(5)
  })

  it('loads persisted data', () => {
    localStorage.setItem('b5data', JSON.stringify({
      answers: [{ id: 'q2', score: 4, domain: 'C', facet: 2 }],
      currentIndex: 3,
    }))

    const { answers, currentIndex, load } = useB5Data()
    load()
    expect(answers.value).toHaveLength(1)
    expect(answers.value[0].score).toBe(4)
    expect(currentIndex.value).toBe(3)
  })

  it('clear removes data', () => {
    localStorage.setItem('b5data', JSON.stringify({ answers: [], currentIndex: 1 }))
    const { clear } = useB5Data()
    clear()
    expect(localStorage.getItem('b5data')).toBeNull()
  })
})
