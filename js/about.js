// ─── About page ─────────────────────────────────────────────────────────────

// Duplicate marquee chips for seamless infinite scroll
document.querySelectorAll('.tools-inner').forEach(el => {
  el.innerHTML += el.innerHTML;
});
