<script setup lang="ts">
import { computed } from 'vue'
import { NSelect } from 'naive-ui'
import type { Language } from '../types'

interface Props {
  languages: Language[]
  modelValue: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const options = computed(() => props.languages.map(lang => ({
  label: lang.name,
  value: lang.id,
})))


function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <n-select
    :value="props.modelValue"
    :options="options"
    size="small"
    class="w-40"
    :disabled="props.disabled"
    @update:value="onUpdate"
  />
</template>
