import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchLanguages, fetchQuestions, createTest } from './api'

describe('api', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchLanguages returns data on success', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'en', name: 'English' }],
    })

    const data = await fetchLanguages()
    expect(data).toEqual([{ id: 'en', name: 'English' }])
  })

  it('fetchLanguages throws on error', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchLanguages()).rejects.toThrow('HTTP 500')
  })

  it('fetchQuestions calls correct endpoint', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'q1', text: 'Test', keyed: 'plus', domain: 'O', facet: 1 }],
    })

    const data = await fetchQuestions('en')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/questions/en'),
      expect.any(Object)
    )
    expect(data).toHaveLength(1)
  })

  it('createTest returns id on success', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-id-123' }),
    })

    const result = await createTest({
      test_id: 'b5-120',
      lang: 'en',
      invalid: false,
      time_elapsed: 0,
      date_stamp: new Date().toISOString(),
      answers: [],
    })
    expect(result.id).toBe('test-id-123')
  })
})
