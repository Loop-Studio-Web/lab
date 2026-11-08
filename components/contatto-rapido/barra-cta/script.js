// Barra CTA: nasconde la barra scorrendo giù, la mostra scorrendo su, a inizio pagina e quando un suo pulsante prende il focus.
(() => {
	const scroller = document.querySelector('[data-scroll]');
	const bar = document.querySelector('[data-bar]');
	let last = 0;
	let tick = false;
	const show = (on) => bar.classList.toggle('is-hidden', !on);

	scroller.addEventListener('scroll', () => {
		if (tick) return;
		tick = true;
		requestAnimationFrame(() => {
			const y = scroller.scrollTop;
			const dy = y - last;
			// Soglia di 8 px: il tremolio del dito non deve far lampeggiare la barra.
			if (y < 40 || dy < -8) show(true);
			else if (dy > 8) show(false);
			if (Math.abs(dy) > 8) last = y;
			tick = false;
		});
	}, { passive: true });
	bar.addEventListener('focusin', () => show(true));
	bar.querySelectorAll('[data-demo-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
})();
