import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLanguages, fetchQuestions, createTest, fetchReport, sendFeedback } from './api'

const mockInvoke = vi.fn()

vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: any[]) => mockInvoke(...args),
}))

describe('api', () => {
  beforeEach(() => {
    mockInvoke.mockClear()
  })

  it('fetchLanguages returns data on success', async () => {
    mockInvoke.mockResolvedValueOnce([{ id: 'en', name: 'English' }])

    const data = await fetchLanguages()
    expect(mockInvoke).toHaveBeenCalledWith('get_languages')
    expect(data).toEqual([{ id: 'en', name: 'English' }])
  })

  it('fetchLanguages throws on error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('invoke failed'))

    await expect(fetchLanguages()).rejects.toThrow('invoke failed')
  })

  it('fetchQuestions calls correct endpoint', async () => {
    mockInvoke.mockResolvedValueOnce([
      { id: 'q1', text: 'Test', keyed: 'plus', domain: 'O', facet: 1, choices: [] },
    ])

    const data = await fetchQuestions('en')
    expect(mockInvoke).toHaveBeenCalledWith('get_questions', { lang: 'en' })
    expect(data).toHaveLength(1)
  })

  it('fetchQuestions throws on error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('invoke failed'))

    await expect(fetchQuestions('en')).rejects.toThrow('invoke failed')
  })

  it('createTest returns id on success', async () => {
    mockInvoke.mockResolvedValueOnce({ id: 'test-id-123' })

    const payload = {
      test_id: 'b5-120',
      lang: 'en',
      invalid: false,
      time_elapsed: 0,
      date_stamp: new Date().toISOString(),
      answers: [],
    }
    const result = await createTest(payload)
    expect(mockInvoke).toHaveBeenCalledWith('create_test', { payload })
    expect(result.id).toBe('test-id-123')
  })

  it('createTest throws on error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('invoke failed'))

    const payload = {
      test_id: 'b5-120',
      lang: 'en',
      invalid: false,
      time_elapsed: 0,
      date_stamp: new Date().toISOString(),
      answers: [],
    }
    await expect(createTest(payload)).rejects.toThrow('invoke failed')
  })

  it('fetchReport returns data on success', async () => {
    mockInvoke.mockResolvedValueOnce({
      id: 'report-id',
      timestamp: Date.now(),
      available_languages: [],
      language: 'en',
      results: [],
    })

    const data = await fetchReport('id', 'en')
    expect(mockInvoke).toHaveBeenCalledWith('get_test', { id: 'id', lang: 'en' })
    expect(data.id).toBe('report-id')
  })

  it('fetchReport throws on error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('invoke failed'))

    await expect(fetchReport('id', 'en')).rejects.toThrow('invoke failed')
  })

  it('sendFeedback returns message on success', async () => {
    mockInvoke.mockResolvedValueOnce({ message: 'Feedback submitted' })

    const payload = { name: 'Test', email: 'test@example.com', message: 'Great app!' }
    const result = await sendFeedback(payload)
    expect(mockInvoke).toHaveBeenCalledWith('submit_feedback', { payload })
    expect(result.message).toBe('Feedback submitted')
  })

  it('sendFeedback throws on error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('invoke failed'))

    const payload = { name: 'Test', email: 'test@example.com', message: 'Great app!' }
    await expect(sendFeedback(payload)).rejects.toThrow('invoke failed')
  })
})
