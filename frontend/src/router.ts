import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TestView from './views/TestView.vue'
import ResultView from './views/ResultView.vue'
import CompareView from './views/CompareView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/test', name: 'test', component: TestView },
    { path: '/result/:id', name: 'result', component: ResultView },
    { path: '/compare', name: 'compare', component: CompareView },
  ],
})

export default router
