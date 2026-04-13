<script setup lang="ts">
import type { Question } from '../types'
import LikertScale from './LikertScale.vue'

interface Props {
  question: Question
  modelValue?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const likertOptions = props.question.choices.map(choice => ({
  label: choice.text,
  value: choice.score,
  color: choice.color,
}))

function onUpdate(value: number) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="card-ivory w-full p-6 md:p-8">
    <h3 class="font-serif text-xl md:text-2xl leading-relaxed text-near-black mb-6">
      {{ props.question.text }}
    </h3>
    <LikertScale
      :options="likertOptions"
      :model-value="props.modelValue"
      @update:model-value="onUpdate"
    />
  </div>
</template>
