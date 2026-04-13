import type { CreateTestResponse, FeedbackPayload, Language, Question, ReportResponse, TestPayload } from './types'

let cachedApiBase: string | undefined

async function getApiBase(): Promise<string> {
  // Only cache a *non-empty* API base. In Tauri the API base might become
  // available slightly after startup (e.g. injected into `window`), so caching
  // an empty string would permanently disable backend requests.
  if (cachedApiBase) return cachedApiBase

  const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (fromEnv) {
    cachedApiBase = fromEnv
    return fromEnv
  }

  const w = window as any

  if (typeof w.__B5_API_BASE__ === 'string' && w.__B5_API_BASE__) {
    cachedApiBase = w.__B5_API_BASE__
    return w.__B5_API_BASE__
  }

  // Tauri (v1) exposes `window.__TAURI__.invoke`. Use it if available.
  if (typeof w.__TAURI__?.invoke === 'function') {
    try {
      const base = await w.__TAURI__.invoke('api_base')
      if (typeof base === 'string') {
        cachedApiBase = base
        return base
      }
    } catch {
      // ignore
    }
  }

  return ''
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const API_BASE = await getApiBase()
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchLanguages(): Promise<Language[]> {
  return request<Language[]>('/api/languages')
}

export async function fetchQuestions(lang: string): Promise<Question[]> {
  return request<Question[]>(`/api/questions/${encodeURIComponent(lang)}`)
}

export async function createTest(payload: TestPayload): Promise<CreateTestResponse> {
  return request<CreateTestResponse>('/api/tests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchReport(id: string, lang?: string): Promise<ReportResponse> {
  const qs = lang ? `?lang=${encodeURIComponent(lang)}` : ''
  return request<ReportResponse>(`/api/tests/${encodeURIComponent(id)}${qs}`)
}

export async function sendFeedback(payload: FeedbackPayload): Promise<{ message: string }> {
  return request<{ message: string }>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
