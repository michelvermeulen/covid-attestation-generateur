self.addEventListener("fetch", (e) => {
  console.log("[Service Worker] Ressource récupérée " + e.request.url);
});
