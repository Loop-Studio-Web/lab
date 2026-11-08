// Barre: le barre si riempiono (CSS, in sequenza) quando il blocco entra in vista; «Rivedi» le svuota e le riempie di nuovo.
(() => {
	const root = document.querySelector('[data-br]');
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fill = () => root.classList.add('is-live');
	if (reduce || !('IntersectionObserver' in window)) return fill();
	const io = new IntersectionObserver((entries) => {
		if (entries.some((e) => e.isIntersecting)) {
			io.disconnect();
			fill();
		}
	}, { threshold: 0.4 });
	io.observe(root);
	root.querySelector('[data-replay]').addEventListener('click', () => {
		root.classList.remove('is-live');
		void root.offsetWidth; // riparte da zero
		fill();
	});
})();
