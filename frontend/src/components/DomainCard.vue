<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'

interface Props {
  title: string
  description: string
  icon?: string
}

const props = defineProps<Props>()
const cardRef = ref<HTMLElement | null>(null)

function onEnter() {
  if (!cardRef.value) return
  gsap.to(cardRef.value, {
    y: -4,
    boxShadow: '0 0 0 2px rgba(201,100,66,0.35), rgba(0,0,0,0.08) 0px 12px 36px',
    duration: 0.25,
    ease: 'power2.out',
  })
}

function onLeave() {
  if (!cardRef.value) return
  gsap.to(cardRef.value, {
    y: 0,
    boxShadow: 'rgba(0,0,0,0.05) 0px 4px 24px',
    duration: 0.25,
    ease: 'power2.out',
  })
}
</script>

<template>
  <div
    ref="cardRef"
    class="bg-ivory border border-border-cream rounded-2xl p-6 shadow-[rgba(0,0,0,0.05)_0px_4px_24px]"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div class="flex items-start gap-4">
      <div
        v-if="props.icon"
        class="text-3xl text-terracotta"
        aria-hidden="true"
      >
        {{ props.icon }}
      </div>
      <div class="flex-1">
        <h3 class="font-serif text-2xl font-500 text-near-black mb-2">
          {{ props.title }}
        </h3>
        <p class="text-olive-gray leading-relaxed">
          {{ props.description }}
        </p>
      </div>
    </div>
  </div>
</template>
