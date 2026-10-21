// Un solo comportamento: il pulsante alterna aria-expanded, il CSS fa il resto.
document.querySelectorAll('[data-hb], [data-fan-toggle]').forEach((btn) => {
	btn.addEventListener('click', () => {
		const open = btn.getAttribute('aria-expanded') !== 'true';
		btn.setAttribute('aria-expanded', String(open));
		// Nel ventaglio le voci escono dall'ordine di tabulazione quando sono chiuse.
		const fan = btn.closest('[data-fan]');
		if (fan) fan.querySelectorAll('.fan__item').forEach((a) => a.setAttribute('tabindex', open ? '0' : '-1'));
	});
});
document.querySelectorAll('.fan__item').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
