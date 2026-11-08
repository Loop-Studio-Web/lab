// Lente: la foto "dopo" è ritagliata a cerchio sopra il "prima". Segue mouse e dito; con le frecce si sposta da tastiera.
// Finché nessuno la tocca, vaga da sola lungo una curva (solo se il riquadro è visibile).
(() => {
	const ba = document.querySelector('[data-ba]');
	let x = 0.5, y = 0.5;
	const apply = () => {
		ba.style.setProperty('--lx', `${x * 100}%`);
		ba.style.setProperty('--ly', `${y * 100}%`);
	};
	const clamp = (v) => Math.min(1, Math.max(0, v));
	const fromEvent = (e) => {
		const r = ba.getBoundingClientRect();
		x = clamp((e.clientX - r.left) / r.width);
		y = clamp((e.clientY - r.top) / r.height);
		apply();
	};
	let touched = false;
	const take = (e) => { touched = true; fromEvent(e); };
	ba.addEventListener('pointermove', take);
	ba.addEventListener('pointerdown', (e) => { ba.setPointerCapture?.(e.pointerId); take(e); });
	ba.addEventListener('keydown', (e) => {
		const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
		if (!d) return;
		e.preventDefault();
		touched = true;
		const s = e.shiftKey ? 0.1 : 0.03;
		x = clamp(x + d[0] * s);
		y = clamp(y + d[1] * s);
		apply();
	});
	apply();

	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	let live = false;
	let raf;
	const t0 = performance.now();
	const wander = (now) => {
		if (touched || !live) return;
		const t = (now - t0) / 1000;
		x = 0.5 + 0.28 * Math.sin(t * 0.8);
		y = 0.5 + 0.22 * Math.sin(t * 1.3 + 1);
		apply();
		raf = requestAnimationFrame(wander);
	};
	new IntersectionObserver((es) => {
		live = es[0].isIntersecting;
		cancelAnimationFrame(raf);
		if (live && !touched) raf = requestAnimationFrame(wander);
	}, { threshold: 0.3 }).observe(ba);
})();
