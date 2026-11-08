// Cursore: un <input type=range> trasparente copre il riquadro (tastiera, tocco e lettori di schermo gratis);
// il valore comanda --pos, che muove il clip-path e la maniglia. All'apertura la maniglia accenna uno scorrimento.
(() => {
	const ba = document.querySelector('[data-ba]');
	const range = ba.querySelector('.ba__range');
	const set = (v) => ba.style.setProperty('--pos', `${v}%`);
	range.addEventListener('input', () => set(range.value));
	set(range.value);
	// Frecce: il passo del campo è 0,1 (trascinamento fluido), troppo piccolo per la tastiera: 2%, con Maiusc 10%.
	range.addEventListener('keydown', (e) => {
		const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
		if (!d) return;
		e.preventDefault();
		range.value = Math.min(100, Math.max(0, +range.value + d * (e.shiftKey ? 10 : 2)));
		set(range.value);
	});

	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	let touched = false;
	const stop = () => (touched = true);
	['pointerdown', 'keydown'].forEach((e) => range.addEventListener(e, stop, { once: true }));

	const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
	const path = [50, 22, 78, 50]; // punti toccati dall'accenno
	let started = false;
	const run = () => {
		started = true;
		const t0 = performance.now();
		const seg = 650;
		const tick = (now) => {
			if (touched) return;
			const k = (now - t0) / seg;
			const i = Math.floor(k);
			if (i >= path.length - 1) return set(range.value = path[path.length - 1]);
			const v = path[i] + (path[i + 1] - path[i]) * ease(k - i);
			range.value = v;
			set(v);
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	};
	new IntersectionObserver((es, o) => {
		if (es[0].isIntersecting && !started) {
			o.disconnect();
			setTimeout(() => !touched && run(), 500);
		}
	}, { threshold: 0.6 }).observe(ba);
})();
