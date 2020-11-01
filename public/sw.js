self.addEventListener("fetch", (e) => {
  console.log("[Service Worker] Ressource récupérée " + e.request.url);
  return;
  e.respondWith(
    fetch(e.request).then((response) => {
      console.log(response);
      return response;
    })
  );
});
