// NOVERE Service Worker — Push Notifications


self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))


self.addEventListener('push', function (event) {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'NOVERE 📚', {
      body:    data.body  || 'Ton compagnon t\'attend!',
      icon:    '/icon.png',
      badge:   '/icon.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || 'https://novere.ca/home' },
    })
  )
})


self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('novere.ca') && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(event.notification.data?.url || 'https://novere.ca/home')
    })
  )
})
