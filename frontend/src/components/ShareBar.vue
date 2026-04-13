<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'

const copied = ref(false)

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<template>
  <n-button
    type="default"
    size="small"
    class="bg-warm-sand text-charcoal-warm hover:bg-border-warm"
    @click="copyLink"
  >
    <template #icon>
      <div class="i-lucide-link text-sm" />
    </template>
    {{ copied ? 'Copied!' : 'Copy link' }}
  </n-button>
</template>
