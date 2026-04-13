<script setup lang="ts">
import { useRouter } from 'vue-router'
import { MotionDirective } from '@vueuse/motion'
import { gsap } from 'gsap'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '../components/AppHeader.vue'
import DomainCard from '../components/DomainCard.vue'

const router = useRouter()
const { t } = useI18n()
const vMotion = MotionDirective

const heroHeading = ref<HTMLElement | null>(null)
const heroSubtitle = ref<HTMLElement | null>(null)
const heroCta = ref<HTMLElement | null>(null)

onMounted(() => {
  const els = [heroHeading.value, heroSubtitle.value, heroCta.value].filter(Boolean) as HTMLElement[]
  gsap.from(els, {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    // Prevent leftover inline transforms causing layout drift.
    clearProps: 'transform',
  })
})

const domains = [
  {
    key: 'openness',
    titleKey: 'home.openness.title',
    descKey: 'home.openness.description',
  },
  {
    key: 'conscientiousness',
    titleKey: 'home.conscientiousness.title',
    descKey: 'home.conscientiousness.description',
  },
  {
    key: 'extraversion',
    titleKey: 'home.extraversion.title',
    descKey: 'home.extraversion.description',
  },
  {
    key: 'agreeableness',
    titleKey: 'home.agreeableness.title',
    descKey: 'home.agreeableness.description',
  },
  {
    key: 'neuroticism',
    titleKey: 'home.neuroticism.title',
    descKey: 'home.neuroticism.description',
  },
]

function goToTest() {
  router.push('/test')
}

function goToCompare() {
  router.push('/compare')
}
</script>

<template>
  <div class="page-wrapper">
    <AppHeader />

    <main class="w-full">
      <section class="relative overflow-hidden py-16 md:py-24 px-4">
        <!-- subtle vignette -->
        <div
          class="pointer-events-none absolute inset-0 opacity-60"
          style="background: radial-gradient(900px 420px at 50% 10%, rgba(201,100,66,0.10), transparent 60%), radial-gradient(700px 360px at 20% 50%, rgba(94,93,89,0.10), transparent 60%);"
        />

        <div class="relative mx-auto max-w-6xl">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <!-- Left: editorial hero -->
            <div class="lg:col-span-5 text-center lg:text-left">
              <div class="inline-flex items-center gap-2 rounded-full bg-ivory px-3 py-1 shadow-[0_0_0_1px_#f0eee6] text-xs tracking-wide text-olive-gray">
                <span class="i-lucide-sparkles text-sm text-terracotta" aria-hidden="true" />
                <span>{{ t('home.meta') }}</span>
              </div>

              <h1 ref="heroHeading" class="heading-serif font-serif text-near-black mt-6">
                {{ t('home.title') }}
              </h1>

              <p
                ref="heroSubtitle"
                class="text-lg md:text-xl leading-relaxed text-olive-gray max-w-2xl mx-auto lg:mx-0 mt-6"
              >
                {{ t('home.subtitle') }}
              </p>

              <div
                ref="heroCta"
                class="mt-10 flex flex-row flex-nowrap items-center gap-3 justify-center lg:justify-start"
              >
                <button
                  class="btn-terracotta h-11 whitespace-nowrap font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0 px-4 sm:px-5 leading-none !leading-none !appearance-none !border-0"
                  @click="goToTest"
                >
                  {{ t('home.startTest') }}
                </button>
                <button
                  class="btn-sand h-11 whitespace-nowrap font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0 px-4 sm:px-5 leading-none !leading-none !appearance-none !border-0"
                  @click="goToCompare"
                >
                  {{ t('home.compare') }}
                </button>
              </div>

              <p class="mt-7 text-sm text-stone-gray">
                {{ t('home.metaDetail') }}
              </p>
            </div>

            <!-- Right: discovery wall -->
            <div class="lg:col-span-7">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  v-for="(domain, i) in domains"
                  :key="domain.key"
                  v-motion
                  :initial="{ opacity: 0, y: 24 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: 150 + i * 80, duration: 500, ease: 'easeOut' } }"
                  :class="domain.key === 'openness' ? 'sm:col-span-2' : ''"
                >
                  <DomainCard
                    :title="t(domain.titleKey)"
                    :description="t(domain.descKey)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="pb-20 md:pb-28 px-4">
        <div class="mx-auto max-w-6xl">
          <div class="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 class="text-3xl md:text-4xl font-serif text-near-black">
                {{ t('home.dimensionsTitle') }}
              </h2>
              <p class="mt-2 text-olive-gray max-w-2xl">
                {{ t('home.dimensionsSubtitle') }}
              </p>
            </div>
            <button class="btn-sand font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0" @click="goToTest">
              {{ t('home.startTest') }}
            </button>
          </div>
        </div>
      </section>
    </main>

    <footer class="w-full border-t border-border-warm py-8 px-4">
      <p class="text-center text-sm text-stone-gray">
        {{ t('home.footer') }}
      </p>
    </footer>
  </div>
</template>
