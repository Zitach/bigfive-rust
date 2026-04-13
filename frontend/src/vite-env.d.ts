/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'canvas-confetti' {
  function confetti(options?: Record<string, unknown>): Promise<void>
  export default confetti
}
