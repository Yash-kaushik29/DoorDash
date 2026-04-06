/* eslint-disable no-restricted-globals */

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCvK5AH-TE1DPObA5x3LLx5ePS10q1sBXw",
  authDomain: "gullyfoods.firebaseapp.com",
  projectId: "gullyfoods",
  storageBucket: "gullyfoods.firebasestorage.app",
  messagingSenderId: "665093061382",
  appId: "1:665093061382:web:80464457e6a547c675fc87"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icons/gullyfoodsLogo192.png",
    badge: "/icons/gullyfoodsLogo192.png",
    tag: payload.data?.orderId || "default",
    requireInteraction: true,
    renotify: true,
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
