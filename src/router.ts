import { createRouter, createWebHashHistory } from "vue-router";
//@ts-ignore
import routes from "virtual:generated-pages";

const router = createRouter({
  history: createWebHashHistory(),
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
    // Incluir outras rotas geradas automaticamente
    ...routes
  ],
});

export default router;
