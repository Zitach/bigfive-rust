import { invoke } from '@tauri-apps/api/core'
import type { CreateTestResponse, FeedbackPayload, Language, Question, ReportResponse, TestPayload } from './types'

export async function fetchLanguages(): Promise<Language[]> {
  return invoke<Language[]>('get_languages')
}

export async function fetchQuestions(lang: string): Promise<Question[]> {
  return invoke<Question[]>('get_questions', { lang })
}

export async function createTest(payload: TestPayload): Promise<CreateTestResponse> {
  return invoke<CreateTestResponse>('create_test', { payload })
}

export async function fetchReport(id: string, lang?: string): Promise<ReportResponse> {
  return invoke<ReportResponse>('get_test', { id, lang: lang ?? null })
}

export async function sendFeedback(payload: FeedbackPayload): Promise<{ message: string }> {
  return invoke<{ message: string }>('submit_feedback', { payload })
}
