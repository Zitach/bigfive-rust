import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/test', name: 'test', component: () => import('./views/TestView.vue') },
    { path: '/result/:id', name: 'result', component: () => import('./views/ResultView.vue') },
    { path: '/compare', name: 'compare', component: () => import('./views/CompareView.vue') },
  ],
})

export default router
