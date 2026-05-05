<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NProgress } from 'naive-ui'
import confetti from 'canvas-confetti'
import AppHeader from '@/components/AppHeader.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import { fetchQuestions, createTest, fetchLanguages } from '@/api'
import type { Question, Answer, TestPayload, Language } from '@/types'
import LanguageSelect from '@/components/LanguageSelect.vue'
import { useB5Data } from '@/composables/useB5Data'
import { setPreferredLocale, getPreferredLocale } from '@/i18n'
import { getQuestionsPerPage } from '@/utils/responsive'

const { t } = useI18n()
const router = useRouter()
const { answers, currentIndex, load, clear } = useB5Data()

const questions = ref<Question[]>([])
const questionsPerPage = ref(1)
const hadSavedData = ref(false)
const isSubmitting = ref(false)
// Preferred language drives question/report language.
// UI locale may fall back to English if we don't have UI translations.
const selectedLang = ref<string>(getPreferredLocale())
const languages = ref<Language[]>([])
const questionsWrapper = ref<HTMLElement | null>(null)
const transitionDirection = ref(1)

watch(currentIndex, (newVal, oldVal) => {
  transitionDirection.value = newVal > (oldVal ?? 0) ? 1 : -1
})

function updateQuestionsPerPage() {
  const newValue = getQuestionsPerPage(window.innerWidth)
  if (newValue !== questionsPerPage.value) {
    questionsPerPage.value = newValue
    if (questionsPerPage.value > 1) {
      currentIndex.value = Math.floor(currentIndex.value / questionsPerPage.value) * questionsPerPage.value
    }
  }
}

onMounted(async () => {
  hadSavedData.value = !!localStorage.getItem('b5data')
  updateQuestionsPerPage()
  window.addEventListener('resize', updateQuestionsPerPage)
  load()
  try {
    languages.value = await fetchLanguages()
    questions.value = await fetchQuestions(selectedLang.value)
  } catch (err) {
    console.error('Failed to fetch languages or questions:', err)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateQuestionsPerPage)
})

const progressPercent = computed(() => {
  if (!questions.value.length) return 0
  return Math.min(100, (answers.value.length / questions.value.length) * 100)
})

const currentQuestions = computed(() => {
  return questions.value.slice(currentIndex.value, currentIndex.value + questionsPerPage.value)
})

const isCurrentPageFullyAnswered = computed(() => {
  return currentQuestions.value.every(q => answers.value.some(a => a.id === q.id))
})

const isFirstPage = computed(() => currentIndex.value <= 0)
const isLastPage = computed(() => currentIndex.value + questionsPerPage.value >= questions.value.length)
const allAnswered = computed(() => questions.value.length > 0 && answers.value.length === questions.value.length)

function getAnswerScore(questionId: string): number | undefined {
  return answers.value.find(a => a.id === questionId)?.score
}

function handleAnswer(question: Question, score: number) {
  const existingIndex = answers.value.findIndex(a => a.id === question.id)
  const answer: Answer = {
    id: question.id,
    score,
    domain: question.domain,
    facet: question.facet,
  }
  if (existingIndex >= 0) {
    answers.value.splice(existingIndex, 1, answer)
  } else {
    answers.value.push(answer)
  }

  if (questionsPerPage.value === 1 && !isLastPage.value) {
    setTimeout(() => {
      currentIndex.value += 1
    }, 500)
  }
}

function goPrevious() {
  if (isFirstPage.value) return
  currentIndex.value -= questionsPerPage.value
}

function goNext() {
  if (!isCurrentPageFullyAnswered.value || isLastPage.value) return
  currentIndex.value += questionsPerPage.value
}

async function submitResults() {
  if (!allAnswered.value || isSubmitting.value) return
  isSubmitting.value = true
  confetti({})

  const payload: TestPayload = {
    test_id: 'b5-120',
    lang: selectedLang.value,
    invalid: false,
    time_elapsed: 0,
    date_stamp: new Date().toISOString(),
    answers: answers.value,
  }

  try {
    const response = await createTest(payload)
    clear()
    await router.push(`/result/${response.id}`)
  } catch (err) {
    isSubmitting.value = false
  }
}

// 监听语言选择变化，同步到全局 i18n locale
watch(selectedLang, async (newLang) => {
  // Persist and try to switch UI (falls back if missing).
  setPreferredLocale(newLang)
  
  // 如果还没有回答，重新获取题目
  if (answers.value.length === 0) {
    try {
      questions.value = await fetchQuestions(newLang)
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    }
  }
})

function startOver() {
  clear()
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen w-full bg-parchment text-near-black">
    <AppHeader />

    <main class="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <!-- Restore banner -->
      <div
        v-if="hadSavedData"
        class="mb-6 card-ivory p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <span class="text-near-black font-medium">{{ t('test.restored') }}</span>
        <button
          type="button"
          class="text-terracotta hover:underline font-medium text-left"
          @click="startOver"
        >
          {{ t('test.startOver') }}
        </button>
      </div>

      <!-- Language selector -->
      <div class="mb-6 flex items-center gap-3">
        <span class="text-sm text-olive-gray font-medium">{{ t('test.language') }}</span>
        <LanguageSelect
          v-model="selectedLang"
          :languages="languages"
          :disabled="answers.length > 0"
        />
      </div>

      <!-- Progress -->
      <div class="mb-8">
        <n-progress
          type="line"
          :percentage="progressPercent"
          :height="12"
          color="#c96442"
          rail-color="#e8e6dc"
        />
        <div class="mt-2 text-sm text-olive-gray">
          {{ answers.length }} / {{ questions.length }} {{ t('test.answered') }}
        </div>
      </div>

      <!-- Questions -->
      <Transition
        mode="out-in"
        @before-leave="(el) => gsap.set(el, { x: 0, opacity: 1 })"
        @leave="(el, done) => gsap.to(el, { x: transitionDirection * -20, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: done })"
        @before-enter="(el) => gsap.set(el, { x: transitionDirection * 20, opacity: 0 })"
        @enter="(el, done) => gsap.fromTo(el, { x: transitionDirection * 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: done })"
      >
        <div ref="questionsWrapper" :key="currentIndex" class="flex flex-col gap-6 mb-10">
          <QuestionCard
            v-for="q in currentQuestions"
            :key="q.id"
            :question="q"
            :model-value="getAnswerScore(q.id)"
            @update:model-value="(score: number) => handleAnswer(q, score)"
          />
        </div>
      </Transition>

      <!-- Navigation -->
      <div class="flex items-center justify-between gap-4">
        <button
          type="button"
          class="btn-sand disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isFirstPage"
          @click="goPrevious"
        >
          {{ t('test.previous') }}
        </button>

        <button
          v-if="!allAnswered"
          type="button"
          class="btn-sand disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!isCurrentPageFullyAnswered || isLastPage"
          @click="goNext"
        >
          {{ t('test.next') }}
        </button>

        <button
          v-else
          type="button"
          class="btn-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSubmitting"
          @click="submitResults"
        >
          {{ t('test.getResults') }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
