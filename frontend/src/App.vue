<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#c96442',
    primaryColorHover: '#d97757',
    primaryColorPressed: '#a85335',
    primaryColorSuppl: '#c96442',
  },
  Button: {
    colorPrimary: '#c96442',
    colorHoverPrimary: '#d97757',
    colorPressedPrimary: '#a85335',
    colorFocusPrimary: '#c96442',
    textColorPrimary: '#faf9f5',
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div class="app-root">
      <transition name="page" mode="out-in">
        <router-view />
      </transition>
    </div>
  </n-config-provider>
</template>

<style>
/* Base resets live in `src/styles/base.css` to ensure they load before
   any component styles and avoid post-mount layout shifts. */
html, body, #app {
  height: 100%;
}
html {
  background-color: #f5f4ed;
  font-family: Arial, system-ui, sans-serif;
  color: #141413;
}
h1, h2, h3, h4, h5, h6 {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
}

.app-root {
  min-height: 100vh;
  width: 100%;
  background-color: #f5f4ed;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
