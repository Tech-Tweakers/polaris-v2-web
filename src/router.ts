import { createRouter, createWebHistory } from "vue-router";
//@ts-ignore
import routes from "virtual:generated-pages";

const router = createRouter({
  history: createWebHistory('/polaris-v2-web/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/index.vue'),
    },
    {
      path: '/polaris',
      name: 'polaris',
      component: () => import('./pages/polaris.ts'),
    },

    {
      path: '/health',
      name: 'health',
      component: () => import('./pages/health.vue'),
    },
    {
      path: '/health-json',
      name: 'health-json',
      component: () => import('./pages/health-json.vue'),
    },
    {
      path: '/status',
      name: 'status',
      component: () => import('./pages/status.vue'),
    },
    // Incluir outras rotas geradas automaticamente
    ...routes
  ],
});

export default router;
