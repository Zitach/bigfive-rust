import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCn from './locales/zh-cn.json'

const STORAGE_KEY = 'b5-language'

type UiLocale = string

const savedPreferred = localStorage.getItem(STORAGE_KEY) || ''
const defaultPreferredLocale = savedPreferred || 'zh-cn'
const defaultUiLocale: UiLocale = defaultPreferredLocale

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, 'zh-cn': zhCn },
})

const uiMessageLoaders = import.meta.glob('./locales/*.json')

async function ensureUiMessages(locale: string): Promise<boolean> {
  if (i18n.global.availableLocales.includes(locale as any)) return true

  const path = `./locales/${locale}.json`
  const loader = uiMessageLoaders[path]
  if (!loader) return false

  const mod = await loader()
  const messages = (mod as any).default ?? mod
  // vue-i18n infers a narrow locale union from initial messages; cast for dynamic locales.
  i18n.global.setLocaleMessage(locale as any, messages)
  return true
}

async function applyUiLocaleForPreferred(preferredLocale: string) {
  const ok = await ensureUiMessages(preferredLocale)
  ;(i18n.global.locale.value as any) = ok ? preferredLocale : 'en'
}

// Align initial UI locale with the saved preference (fall back to English if missing).
void applyUiLocaleForPreferred(defaultUiLocale)

export function setPreferredLocale(preferredLocale: string) {
  localStorage.setItem(STORAGE_KEY, preferredLocale)
  void applyUiLocaleForPreferred(preferredLocale)
}

export function getPreferredLocale(): string {
  return localStorage.getItem(STORAGE_KEY) || defaultPreferredLocale
}

export default i18n
