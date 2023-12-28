import { createRouter, createWebHashHistory } from "vue-router";

//@ts-ignore
import routes from "virtual:generated-pages";



const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

console.log(routes);

// router.beforeEach((to, from, next) => {

//   // console.log(to);

//   if (to.query.chave != undefined) {
//     // console.log(to.query.chave);
//     sessionStorage.setItem(
//       storeLogin.state.nameStorage,
//       JSON.stringify({ token: to.query.chave })
//     );
//     storeLogin.state.auth == true
//     axios.defaults.headers.common["Authorization"] = to.query.chave;
//     storeLogin.actions.setAuth(true);
//     next();
//   } else {
//     auth();
//     if (to.name !== "login" && storeLogin.state.auth == false)
//       next({ path: "login" });
//     else if (to.name == "login" && storeLogin.state.auth == true)
//       next({ path: "home" });
//     else next();
//   }
// });

export default router;
