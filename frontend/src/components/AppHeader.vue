<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NDrawer, NDrawerContent } from 'naive-ui'
import { fetchLanguages } from '@/api'
import type { Language } from '@/types'
import LanguageSelect from '@/components/LanguageSelect.vue'
import { getPreferredLocale, setPreferredLocale } from '../i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const mobileMenuOpen = ref(false)

const navItems = [
  { labelKey: 'nav.home', name: 'home', path: '/' },
  { labelKey: 'nav.test', name: 'test', path: '/test' },
  { labelKey: 'nav.compare', name: 'compare', path: '/compare' },
]

const activeName = computed(() => route.name as string)

const languages = ref<Language[]>([])
const selectedLang = ref<string>(getPreferredLocale())

onMounted(async () => {
  try {
    languages.value = await fetchLanguages()
  } catch (err) {
    console.error('Failed to fetch languages:', err)
  }
})

const currentLanguage = computed({
  get: () => selectedLang.value,
  set: (value: string) => {
    selectedLang.value = value
    setPreferredLocale(value)
  },
})

function navigateTo(path: string) {
  router.push(path)
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-parchment/90 backdrop-blur">
    <div class="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
      <span class="font-serif text-xl font-500 text-near-black">
        Big Five
      </span>

      <!-- Desktop nav -->
      <div class="hidden md:flex items-center gap-4">
        <nav class="flex items-center gap-2">
          <n-button
            v-for="item in navItems"
            :key="item.name"
            text
            :type="activeName === item.name ? 'primary' : 'default'"
            @click="navigateTo(item.path)"
          >
            {{ t(item.labelKey) }}
          </n-button>
        </nav>

        <!-- Language selector -->
        <div class="flex items-center gap-2 pl-4 border-l border-border-warm">
          <span class="text-sm text-olive-gray">{{ t('nav.language') }}</span>
          <LanguageSelect v-model="currentLanguage" :languages="languages" />
        </div>
      </div>

      <!-- Mobile hamburger -->
      <n-button
        class="md:hidden"
        text
        aria-label="Toggle menu"
        @click="mobileMenuOpen = true"
      >
        <template #icon>
          <div class="i-lucide-menu text-xl" />
        </template>
      </n-button>
    </div>

    <!-- Mobile drawer -->
    <n-drawer
      v-model:show="mobileMenuOpen"
      placement="top"
      :auto-focus="false"
      to="#app"
    >
      <n-drawer-content class="bg-parchment">
        <nav class="flex flex-col gap-2 py-4">
          <n-button
            v-for="item in navItems"
            :key="item.name"
            text
            size="large"
            :type="activeName === item.name ? 'primary' : 'default'"
            @click="navigateTo(item.path)"
          >
            {{ t(item.labelKey) }}
          </n-button>

          <!-- Mobile language selector -->
          <div class="flex items-center gap-3 pt-4 mt-2 border-t border-border-warm">
            <span class="text-sm text-olive-gray">{{ t('nav.language') }}</span>
            <LanguageSelect v-model="currentLanguage" :languages="languages" />
          </div>
        </nav>
      </n-drawer-content>
    </n-drawer>
  </header>
</template>
