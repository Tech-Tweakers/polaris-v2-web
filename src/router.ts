import { createRouter, createWebHashHistory } from "vue-router";
//@ts-ignore
import routes from "virtual:generated-pages";

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
