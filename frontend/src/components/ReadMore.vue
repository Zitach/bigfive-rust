<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  html: string
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
})

const isExpanded = ref(props.expanded)
const contentRef = ref<HTMLDivElement | null>(null)
const contentHeight = ref('0px')

async function measureHeight() {
  await nextTick()
  if (contentRef.value) {
    contentHeight.value = `${contentRef.value.scrollHeight}px`
  }
}

watch(() => props.expanded, (val) => {
  isExpanded.value = val
})

watch(isExpanded, measureHeight, { immediate: true })
</script>

<template>
  <div>
    <div
      class="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      :style="{ maxHeight: isExpanded ? contentHeight : '96px' }"
    >
      <div
        ref="contentRef"
        class="prose prose-stone max-w-none"
        v-html="html"
      />
    </div>
    <button
      type="button"
      class="mt-2 text-terracotta font-medium hover:underline focus:outline-none"
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? 'Show less' : 'Read more' }}
    </button>
  </div>
</template>
