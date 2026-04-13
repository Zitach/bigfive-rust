<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NTabs, NTabPane, NTag } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { MotionDirective } from '@vueuse/motion'
import AppHeader from '../components/AppHeader.vue'
import LanguageSelect from '../components/LanguageSelect.vue'
import ShareBar from '../components/ShareBar.vue'
import ResultBarChart from '../components/ResultBarChart.vue'
import FacetBarChart from '../components/FacetBarChart.vue'
import ReadMore from '../components/ReadMore.vue'
import { fetchReport } from '../api'
import type { ReportResponse } from '../types'

const route = useRoute()
const { t } = useI18n()
const vMotion = MotionDirective

const report = ref<ReportResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedLang = ref('')
const activeDomain = ref('all')

const id = computed(() => route.params.id as string)

async function loadReport(lang?: string) {
  loading.value = true
  error.value = null
  try {
    const data = await fetchReport(id.value, lang)
    report.value = data
    selectedLang.value = data.language
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReport()
})

watch(selectedLang, (newLang) => {
  if (report.value && newLang !== report.value.language) {
    loadReport(newLang)
  }
})

const formattedDate = computed(() => {
  if (!report.value) return ''
  return new Date(report.value.timestamp).toLocaleDateString()
})


</script>

<template>
  <div class="page-wrapper">
    <AppHeader />
    <main class="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-stone-gray">
        Loading report…
      </div>

      <!-- Error -->
      <div v-else-if="error" class="card-ivory p-8 text-center text-crimson">
        {{ error }}
      </div>

      <!-- Report -->
      <div v-else-if="report" class="space-y-8">
        <!-- Overview card -->
        <section
          v-motion
          class="card-ivory p-6 md:p-8 space-y-6"
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
        >
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 class="font-serif text-3xl md:text-4xl font-400 text-near-black">
                {{ t('result.theBigFive') }}
              </h1>
              <p class="mt-1 text-stone-gray">
                {{ formattedDate }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <LanguageSelect
                v-model="selectedLang"
                :languages="report.available_languages"
              />
              <ShareBar />
            </div>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <n-tag size="small" :bordered="false" class="bg-parchment text-charcoal-warm">
              ID:
              <code class="ml-1 font-mono text-sm">{{ report.id }}</code>
            </n-tag>
          </div>

          <div class="rounded-lg bg-warm-sand/50 p-4 text-sm text-charcoal-warm">
            <span class="font-semibold">{{ t('result.important') }}</span>
            {{ t('result.saveResults') }}
            <router-link to="/compare" class="ml-1 text-terracotta hover:underline">
              {{ t('result.compare') }} {{ t('result.toOthers') }}
            </router-link>
          </div>

          <ResultBarChart :results="report.results" />
        </section>

        <!-- Domain detail card -->
        <section
          v-motion
          class="card-ivory p-6 md:p-8"
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 500, ease: 'easeOut' } }"
        >
          <NTabs v-model:value="activeDomain" type="segment" animated>
            <NTabPane name="all" tab="All">
              <div class="mt-6 space-y-8">
                <div
                  v-for="(domain, i) in report.results"
                  :key="domain.domain"
                  v-motion
                  class="border-b border-border-warm pb-8 last:border-0 last:pb-0"
                  :initial="{ opacity: 0, y: 16 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: i * 100, duration: 400, ease: 'easeOut' } }"
                >
                  <h2
                    class="text-3xl text-near-black"
                    style="font-family: Georgia, 'Times New Roman', serif;"
                  >
                    {{ domain.title }}
                  </h2>
                  <p class="mt-1 text-stone-gray">
                    {{ domain.short_description }}
                  </p>
                  <p class="mt-3 text-charcoal-warm leading-relaxed">
                    {{ domain.text }}
                  </p>
                </div>
              </div>
            </NTabPane>

            <NTabPane
              v-for="domain in report.results"
              :key="domain.domain"
              :name="domain.domain"
              :tab="domain.title"
            >
              <div class="mt-6 space-y-6">
                <div>
                  <h2
                    class="text-3xl text-near-black"
                    style="font-family: Georgia, 'Times New Roman', serif;"
                  >
                    {{ domain.title }}
                  </h2>
                  <p class="mt-2 text-stone-gray text-lg">
                    {{ domain.short_description }}
                  </p>
                </div>

                <ReadMore :html="domain.description" />

                <p class="text-charcoal-warm leading-relaxed">
                  {{ domain.text }}
                </p>

                <FacetBarChart :facets="domain.facets" />

                <div class="grid gap-4 md:grid-cols-2">
                  <div
                    v-for="facet in domain.facets"
                    :key="facet.facet"
                    class="bg-parchment rounded-lg p-4 border border-border-warm"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <h3 class="font-medium text-near-black">
                        {{ facet.title }}
                      </h3>
                      <span class="text-sm text-stone-gray whitespace-nowrap">
                        {{ t('result.score') }}: {{ facet.score }} ({{ facet.score_text }})
                      </span>
                    </div>
                    <p class="mt-2 text-sm text-charcoal-warm leading-relaxed">
                      {{ facet.text }}
                    </p>
                  </div>
                </div>
              </div>
            </NTabPane>
          </NTabs>
        </section>
      </div>
    </main>
  </div>
</template>
