// Contatori: ogni numero conta da 0 al valore finale quando il blocco entra in vista (una volta); «Rivedi» rifà la corsa.
// Il valore finale sta già nell'HTML: senza JS, o con «riduci movimento», non cambia nulla.
(() => {
	const root = document.querySelector('[data-ct]');
	const nums = [...root.querySelectorAll('.ct__n')];
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fmt = (n, dec) => new Intl.NumberFormat(LabI18n.lang, { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);
	const ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)); // easeOutExpo
	let raf = 0;

	const setFinal = () => nums.forEach((el) => (el.textContent = fmt(+el.dataset.to, +el.dataset.dec || 0) + (el.dataset.suffix || '')));

	const run = () => {
		cancelAnimationFrame(raf);
		if (reduce) return setFinal();
		const t0 = performance.now();
		const DUR = 1600;
		const STAGGER = 140;
		const tick = (now) => {
			let done = true;
			nums.forEach((el, i) => {
				const p = Math.min(Math.max((now - t0 - i * STAGGER) / DUR, 0), 1);
				if (p < 1) done = false;
				el.textContent = fmt(+el.dataset.to * ease(p), +el.dataset.dec || 0) + (p === 1 ? el.dataset.suffix || '' : '');
			});
			if (!done) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	};

	setFinal();
	// Si parte da zero solo quando il blocco è visibile (e solo se il movimento è ammesso).
	if (!reduce) {
		nums.forEach((el) => (el.textContent = fmt(0, +el.dataset.dec || 0)));
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				io.disconnect();
				run();
			}
		}, { threshold: 0.4 });
		io.observe(root);
	}
	root.querySelector('[data-replay]').addEventListener('click', () => {
		nums.forEach((el) => (el.textContent = fmt(0, +el.dataset.dec || 0)));
		run();
	});
})();
