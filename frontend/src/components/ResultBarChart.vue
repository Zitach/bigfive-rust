<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { DomainResult } from '../types'
import { chartColors } from '../styles/design'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

interface Props {
  results: DomainResult[]
}

const props = defineProps<Props>()

const option = computed(() => {
  const data = [...props.results].reverse()
  return {
    backgroundColor: 'transparent',
    animationDuration: 1000,
    animationEasing: 'cubicOut' as const,
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '3%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e8e6dc',
      textStyle: { color: '#30302e' },
    },
    xAxis: {
      type: 'value',
      max: 120,
      splitLine: {
        lineStyle: { color: '#e8e6dc', type: 'dashed' },
      },
      axisLabel: { color: '#4d4c48' },
    },
    yAxis: {
      type: 'category',
      data: data.map(r => r.title),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#30302e', fontWeight: 500 },
    },
    series: [
      {
        type: 'bar',
        data: data.map((r, i) => ({
          value: r.score,
          itemStyle: {
            color: chartColors[i % chartColors.length],
            borderRadius: [0, 4, 4, 0],
          },
        })),
        animationDelay: (idx: number) => idx * 150,
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(201,100,66,0.5)',
          },
        },
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          color: '#30302e',
          formatter: '{c}',
        },
      },
    ],
  }
})
</script>

<template>
  <v-chart
    class="h-80 w-full"
    :option="option"
    autoresize
  />
</template>
