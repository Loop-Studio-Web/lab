// Ogni "sito" di prova ha il suo avviso. Aperto/chiuso è l'attributo data-open:
// il CSS anima ingresso e uscita, e quando è chiuso l'avviso esce dall'ordine di
// tabulazione (visibility) senza bisogno di altro.
document.querySelectorAll('[data-site]').forEach((site) => {
	const ck = site.querySelector('[data-ck]');
	const again = site.querySelector('[data-again]');
	const open = (on) => {
		ck.toggleAttribute('data-open', on);
		again.hidden = on;
		if (!on) again.focus({ preventScroll: true });
	};
	ck.querySelectorAll('[data-decide]').forEach((b) => b.addEventListener('click', () => open(false)));
	ck.querySelector('[data-more]')?.addEventListener('click', (e) => e.preventDefault());
	again.addEventListener('click', () => {
		open(true);
		ck.querySelector('button')?.focus({ preventScroll: true });
	});
});
