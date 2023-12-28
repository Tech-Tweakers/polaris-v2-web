import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
// })



// self.addEventListener('push', e => {
//   //@ts-ignore
//   const data = e.data.json();

//   self.registration.showNotification(data.title, {
//     body: data.message,
//     vibrate: [200, 50, 200],
//     icon: './icon/icon128.png',
//     badge: './icon/icon128.png',
//     // image: './screen.jpg',
//     // tag: 'new-offers',
//     // renotify: true,
//     // actions: [
//     //   { action: 'confirm', title: 'Check offer', icon: '' },
//     // ],
//   });

// });


// self.addEventListener('notificationclick', event => {
//   //@ts-ignore
//   const rootUrl = new URL('/', location).href;
//   event.notification.close();
//   event.waitUntil(
//     //@ts-ignore
//     clients.matchAll().then(matchedClients => {
//       for (let client of matchedClients) {
//         if (client.url === rootUrl) {
//           return client.focus();
//         }
//       }
//       //@ts-ignore
//       return clients.openWindow("/");
//     })
//   );
// });




// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)