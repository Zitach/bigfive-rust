import type { Answer } from '@/types'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'b5data'

export function useB5Data() {
  const answers = ref<Answer[]>([])
  const currentIndex = ref(0)

  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        answers.value = parsed.answers || []
        currentIndex.value = parsed.currentIndex || 0
      } catch {}
    }
  }

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers: answers.value,
      currentIndex: currentIndex.value,
    }))
  }

  watch([answers, currentIndex], save, { deep: true })

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY)
    answers.value = []
    currentIndex.value = 0
  }

  return { answers, currentIndex, load, save, clear }
}
