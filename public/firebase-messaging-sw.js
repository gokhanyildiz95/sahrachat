// importScripts('https://www.gstatic.com/firebasejs/7.1.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/7.1.0/firebase-messaging.js');
// importScripts('https://www.gstatic.com/firebasejs/5.7.2/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/5.7.2/firebase-messaging.js');
importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-messaging.js");

firebase.initializeApp({
  'messagingSenderId': '379890795216'
});

/*
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(payload => {
  console.log('payload', payload);
  const title = payload.notification.title;
  const options = {
     body: payload.notification.body,
     icon: payload.notification.icon
  }
  return self.registration.showNotification(title, options);
})

self.addEventListener("notificationclick", function(event) {
  const clickedNotification = event.notification;
  clickedNotification.close();
  const promiseChain = clients
      .matchAll({
          type: "window",
          includeUncontrolled: true
       })
      .then(windowClients => {
          let matchingClient = null;
          for (let i = 0; i < windowClients.length; i++) {
              const windowClient = windowClients[i];
              if (windowClient.url === feClickAction) {
                  matchingClient = windowClient;
                  break;
              }
          }
          if (matchingClient) {
              return matchingClient.focus();
          } else {
              return clients.openWindow(feClickAction);
          }
      });
      event.waitUntil(promiseChain);
});
*/
function sendMessage(pstrMessage) {
  clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {

    clients.forEach(client => {
      client.postMessage(pstrMessage)
    })
  })
}

const showNotifIfNotFocused = async (self, event, notification, options) => {
  const url = notification.action_url;
  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    })
      .then(function (clientList) {
        let targetWindow = null;
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          console.log("client ", i, "client", client);
          console.log("client match is", client.url.startsWith(url))
          if (client.url.startsWith(url)) {
            targetWindow = client;
            break;
          }
        }

        if (targetWindow) {
          // the window is open but check if focused?
          console.log("client focuss ? ", targetWindow.focused)
          if (!targetWindow.focused) {
            console.log("window not focuseddd")
            event.waitUntil(
              self.registration.showNotification(notification.title, options)
            );
          }
        } else {
          // the window is not open send anyway
          event.waitUntil(
            self.registration.showNotification(notification.title, options)
          );
        }
      })
  );

}

self.addEventListener('push', function (event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  console.log('[Service Worker] Push Received.', event, "reg", self.registration);
  const payload = JSON.parse(event.data.text());
  const { notification } = payload;
  console.log("notifcation", notification);
  const options = {
    body: notification.body,
    icon: notification.icon,
    data: { link: notification.action_url }
  };
  if (notification.tag) options.tag = notification.tag;
  if (notification.renotify) options.renotify = notification.renotify;
  if (notification.action_url?.includes('webapp')) // if chat
    event.waitUntil(
      showNotifIfNotFocused(self, event, notification, options)
    );
  else
    event.waitUntil(self.registration.showNotification(notification.title, options))
})

self.addEventListener('notificationclose', function (event) {
  console.log("notifclose", event)
})

self.addEventListener('notificationclick', function (event) {
  sendMessage('new_message_action_click')
  console.log('On notification click', event);
  console.log("clients", clients)
  // Android doesn't close the notification when you click on it  
  // See: http://crbug.com/463146  
  event.notification.close();
  const url = event.notification.data.link;

  // This looks to see if the current is already open and  
  // focuses if it is  
  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          console.log("client ", i, "client", client);
          if (client.url.startsWith(url) && 'focus' in client)
            return client.focus();
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// this is the service worker which intercepts all http requests
self.addEventListener('fetch', function fetcher(event) {
  var request = event.request;
  // check if request 
  if (request.url.indexOf('mobikob.com/get_profile_image') > -1) {
    // contentful asset detected
    event.respondWith(
      caches.match(event.request).then(function (response) {
        // return from cache, otherwise fetch from network
        return response || fetch(request);
      })
    );
  }
  // otherwise: ignore event
});

/*
self.addEventListener('notificationclick', function (event) {
  const { notification } = event;
  event.notification.close();
  event.waitUntil(
    clients.openWindow(notification.data.link)
  );
});
*/

self.addEventListener("install", function (event) {
  self.skipWaiting();
});