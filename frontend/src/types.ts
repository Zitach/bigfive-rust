export interface QuestionChoice {
  text: string
  score: number
  color: number
}

export interface Question {
  id: string
  text: string
  keyed: string
  domain: string
  facet: number
  ipip_id?: string[]
  choices: QuestionChoice[]
}

export interface Answer {
  id: string
  score: number
  domain: string
  facet: number
}

export interface TestPayload {
  test_id: string
  lang: string
  invalid: boolean
  time_elapsed: number
  date_stamp: string
  answers: Answer[]
}

export interface CreateTestResponse {
  id: string
}

export interface Language {
  id: string
  name: string
}

export interface FacetResult {
  facet: number
  title: string
  text: string
  score: number
  count: number
  score_text: string
}

export interface DomainResult {
  domain: string
  title: string
  short_description: string
  description: string
  score_text: string
  count: number
  score: number
  facets: FacetResult[]
  text: string
}

export interface ReportResponse {
  id: string
  timestamp: number
  available_languages: Language[]
  language: string
  results: DomainResult[]
}

export interface FeedbackPayload {
  name: string
  email: string
  message: string
}
