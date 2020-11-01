self.addEventListener("fetch", (e) => {
  console.log("[Service Worker] Ressource récupérée " + e.request.url);
  e.respondWith(
    fetch(e.request).then((response) => {
      return response;
    })
  );
});
