import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'
import { colors } from './src/styles/design'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({ scale: 1.2, cdn: 'https://esm.sh/' }),
  ],
  theme: {
    colors: {
      parchment: colors.parchment,
      ivory: colors.ivory,
      terracotta: colors.terracotta,
      coral: colors.coral,
      'warm-sand': colors.warmSand,
      'dark-surface': colors.darkSurface,
      'near-black': colors.nearBlack,
      'charcoal-warm': colors.charcoalWarm,
      'olive-gray': colors.oliveGray,
      'stone-gray': colors.stoneGray,
      'warm-silver': colors.warmSilver,
      'border-cream': colors.borderCream,
      'border-warm': colors.borderWarm,
      'border-dark': colors.borderDark,
      'ring-warm': colors.ringWarm,
    },
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'heading-serif': 'font-400 text-4xl md:text-5xl lg:text-6xl leading-tight',
    'body-sans': 'font-sans text-base leading-relaxed',
    'btn-terracotta': 'appearance-none inline-flex items-center justify-center select-none cursor-pointer border-0 bg-terracotta text-ivory px-4 py-2.5 rounded-lg shadow-[0_0_0_1px_#c96442] hover:shadow-[0_0_0_2px_#d97757] transition-shadow leading-none',
    'btn-sand': 'appearance-none inline-flex items-center justify-center select-none cursor-pointer border-0 bg-warm-sand text-charcoal-warm px-4 py-2.5 rounded-lg shadow-[0_0_0_1px_#d1cfc5] hover:shadow-[0_0_0_2px_#c2c0b6] transition-shadow leading-none',
    'card-ivory': 'bg-ivory border border-border-cream rounded-lg shadow-[rgba(0,0,0,0.05)_0px_4px_24px]',
    'page-wrapper': 'min-h-screen w-full bg-parchment text-near-black',
  },
  rules: [],
})
