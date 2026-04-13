<script setup lang="ts">
import { ref, watch } from 'vue'
import { gsap } from 'gsap'

export interface LikertOption {
  label: string
  value: number
  color: number
}

interface Props {
  options: LikertOption[]
  modelValue?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const optionRefs = ref<Record<number, HTMLElement | null>>({})

watch(() => props.modelValue, (newVal, oldVal) => {
  if (oldVal !== undefined && optionRefs.value[oldVal]) {
    gsap.to(optionRefs.value[oldVal], { scale: 1, duration: 0.15, ease: 'power2.out' })
  }
  if (newVal !== undefined && optionRefs.value[newVal]) {
    gsap.to(optionRefs.value[newVal], {
      scale: 1.05,
      duration: 0.2,
      ease: 'back.out(1.7)',
    })
  }
})

function select(value: number) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <button
      v-for="option in props.options"
      :ref="(el) => { optionRefs[option.value] = el as HTMLElement | null }"
      :key="option.value"
      type="button"
      class="flex-1 min-w-[72px] px-4 py-3 text-sm md:text-base font-medium transition-all duration-200 rounded-lg"
      :class="{
        'bg-terracotta text-ivory shadow-[0_0_0_2px_#c96442]': modelValue === option.value,
        'bg-ivory border border-border-cream text-charcoal-warm hover:border-terracotta/40 hover:bg-warm-sand/50': modelValue !== option.value,
      }"
      @click="select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
