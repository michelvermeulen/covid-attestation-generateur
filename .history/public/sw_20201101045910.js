self.addEventListener("fetch", (e) => {
  console.log("[Service Worker] Ressource récupérée " + e.request.url);
  e.respondWith(
    fetch(e.request).then((response) => {
      return caches.open(cacheName).then((cache) => {
        console.log("[Service Worker] Mise en cache de la nouvelle ressource: " + e.request.url);
        cache.put(e.request, response.clone());
        return response;
      });
    })
  );
});
