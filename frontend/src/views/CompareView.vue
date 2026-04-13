<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MotionDirective } from '@vueuse/motion'
import { useI18n } from 'vue-i18n'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import AppHeader from '../components/AppHeader.vue'
import { fetchReport } from '../api'
import type { ReportResponse } from '../types'
import { chartColors } from '../styles/design'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const vMotion = MotionDirective

const inputs = ref<string[]>([''])
const results = ref<(ReportResponse | null)[]>([])
const errors = ref<string[]>([])
const loading = ref(false)

const domainOrder = ['O', 'C', 'E', 'A', 'N']

const domainLabels = computed(() => {
  return [
    t('domains.openness'),
    t('domains.conscientiousness'),
    t('domains.extraversion'),
    t('domains.agreeableness'),
    t('domains.neuroticism'),
  ]
})

function addInput() {
  inputs.value.push('')
}

function removeInput(index: number) {
  if (inputs.value.length > 1) {
    inputs.value.splice(index, 1)
  }
}

async function compare() {
  const ids = inputs.value.map(s => s.trim()).filter(Boolean)
  if (ids.length === 0) return

  router.replace({ query: { id: ids.join(',') } })

  loading.value = true
  results.value = new Array(ids.length).fill(null)
  errors.value = new Array(ids.length).fill('')

  try {
    const fetched = await Promise.all(
      ids.map(async (id, idx) => {
        try {
          const report = await fetchReport(id)
          return { idx, report, error: null as string | null }
        } catch (e: any) {
          return { idx, report: null as ReportResponse | null, error: e?.message || 'Failed to fetch report' }
        }
      })
    )

    for (const item of fetched) {
      if (item.report) {
        results.value[item.idx] = item.report
      } else {
        errors.value[item.idx] = item.error || 'Unknown error'
      }
    }
  } finally {
    loading.value = false
  }
}

const hasErrors = computed(() => errors.value.some(e => e))
const hasResults = computed(() => results.value.some(r => r !== null))

const chartOption = computed(() => {
  const validResults = results.value.filter((r): r is ReportResponse => r !== null)
  if (validResults.length === 0) return null

  return {
    animationDuration: 1000,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: validResults.map(r => r.id),
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: domainLabels.value,
    },
    yAxis: {
      type: 'value',
      max: 120,
    },
    series: validResults.map((report, idx) => {
      const scores = domainOrder.map(dom => {
        const domain = report.results.find(d => d.domain === dom)
        return domain ? domain.score : 0
      })
      return {
        name: report.id,
        type: 'bar',
        data: scores,
        itemStyle: {
          color: chartColors[idx % chartColors.length],
        },
      }
    }),
  }
})

onMounted(() => {
  const idParam = route.query.id
  let ids: string[] = []
  if (typeof idParam === 'string' && idParam) {
    ids = idParam.split(',').map(s => s.trim()).filter(Boolean)
  } else if (Array.isArray(idParam)) {
    ids = idParam.map(s => String(s).trim()).filter(Boolean)
  }
  if (ids.length > 0) {
    inputs.value = ids
    compare()
  }
})
</script>

<template>
  <div class="page-wrapper">
    <AppHeader />

    <main class="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
      <h1 class="font-serif text-3xl md:text-4xl text-near-black mb-2">
        {{ t('compare.title') }}
      </h1>
      <p class="text-olive-gray mb-8">
        {{ t('compare.subtitle') }}
      </p>

      <!-- Input section -->
      <div
        v-motion
        class="card-ivory p-6 mb-8"
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
      >
        <div class="flex flex-col gap-3 mb-4">
          <div
            v-for="(_, idx) in inputs"
            :key="idx"
            class="flex items-center gap-2"
          >
            <input
              v-model="inputs[idx]"
              type="text"
              :placeholder="t('compare.resultIdPlaceholder')"
              class="flex-1 px-3 py-2 rounded-md border border-border-warm bg-parchment text-near-black focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            <button
              v-if="inputs.length > 1"
              class="px-3 py-2 rounded-md bg-warm-sand text-charcoal-warm hover:bg-stone-gray hover:text-ivory transition-colors"
              @click="removeInput(idx)"
            >
              {{ t('compare.remove') }}
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="btn-sand" @click="addInput">
            {{ t('compare.addResult') }}
          </button>
          <button
            class="btn-terracotta disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="loading"
            @click="compare"
          >
            {{ loading ? t('compare.comparing') : t('compare.compare') }}
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12 text-olive-gray">
        {{ t('compare.loading') }}
      </div>

      <!-- Error messages -->
      <div v-if="hasErrors && !loading" class="mb-6 space-y-2">
        <template v-for="(error, idx) in errors" :key="idx">
          <div
            v-if="error"
            class="p-3 rounded-md bg-[#b53333]/10 text-[#b53333] border border-[#b53333]/20"
          >
            {{ t('compare.errorPrefix') }} "{{ inputs[idx] }}": {{ error }}
          </div>
        </template>
      </div>

      <!-- Chart -->
      <div
        v-if="chartOption && !loading"
        v-motion
        class="card-ivory p-4 md:p-6 mb-8"
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 500, ease: 'easeOut' } }"
      >
        <v-chart class="h-80 w-full" :option="chartOption" autoresize />
      </div>

      <!-- Results table -->
      <div
        v-if="hasResults && !loading"
        v-motion
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500, ease: 'easeOut' } }"
      >
        <template v-for="(report, idx) in results" :key="idx">
          <div v-if="report" class="card-ivory p-4">
            <div class="font-serif text-lg text-near-black mb-1">
              {{ report.id }}
            </div>
            <div class="text-sm text-olive-gray">
              <span class="inline-block mr-3">
                {{ t('compare.language') }}: {{ report.language }}
              </span>
              <span class="inline-block">
                {{ t('compare.date') }}: {{ new Date(report.timestamp).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
