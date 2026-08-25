// CoSign customizer — swap parts & toggle layers (vanilla JS)
(function () {
  const compose = document.getElementById("compose");
  if (!compose) return;

  const layers = {
    kepala: compose.querySelector('[data-layer="kepala"]'),
    badan: compose.querySelector('[data-layer="badan"]'),
    background: compose.querySelector('[data-layer="background"]'),
  };

  // Pick a part for a category → swap the layer image
  document.querySelectorAll(".part-thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kat = btn.getAttribute("data-kategori");
      const src = btn.getAttribute("data-src");
      const layer = layers[kat];
      if (!layer || !src) return;
      layer.src = src;
      layer.classList.remove("hidden");
      document.querySelectorAll(`.part-thumb[data-kategori="${kat}"]`).forEach((b) => {
        b.classList.toggle("ring-2", b === btn);
        b.classList.toggle("ring-indigo-500", b === btn);
      });
      // ensure toggle reflects visibility
      const cb = document.querySelector(`.layer-toggle[data-kategori="${kat}"]`);
      if (cb) cb.checked = true;
    });
  });

  // Toggle layer visibility
  document.querySelectorAll(".layer-toggle").forEach((cb) => {
    cb.addEventListener("change", () => {
      const kat = cb.getAttribute("data-kategori");
      const layer = layers[kat];
      if (!layer) return;
      layer.classList.toggle("hidden", !cb.checked);
    });
  });
})();