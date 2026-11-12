// In <head>, sincrono: deve girare PRIMA del primo disegno, perché le transizioni tra pagine partono lì.
// 1) mette data-stile su <html> (scelta salvata in sessionStorage, vale per tutte le 3 pagine);
// 2) pageswap (pagina che esce) e pagereveal (pagina che entra): nome condiviso solo sulla copertina giusta,
//    direzione avanti/indietro secondo l'ordine Catalogo → Disco → Contatto, «Nessuna» = transizione saltata.
(() => {
	const STILI = ['dissolvenza', 'scorrimento', 'volo', 'nessuna'];
	const root = document.documentElement;
	let stile = 'dissolvenza';
	try {
		stile = sessionStorage.getItem('ttp-stile') || stile;
	} catch {
		/* storage bloccato: resta la dissolvenza */
	}
	root.dataset.stile = STILI.includes(stile) ? stile : 'dissolvenza';

	const ridotto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
	// 0 catalogo, 1 disco, 2 contatto
	const pagina = (url) => {
		const p = new URL(url).pathname;
		return p.includes('/contatto/') ? 2 : p.includes('/disco/') ? 1 : 0;
	};
	const copertina = (id) => (id ? document.querySelector(`[data-disco="${CSS.escape(id)}"] .cover__art`) : null);
	const volo = () => root.dataset.stile === 'volo' && !ridotto();

	addEventListener('pageswap', (e) => {
		if (!e.viewTransition) return;
		if (root.dataset.stile === 'nessuna') return e.viewTransition.skipTransition();
		if (!volo() || !e.activation) return;
		const dest = new URL(e.activation.entry.url);
		if (pagina(location.href) === 0 && pagina(dest.href) === 1) {
			const el = copertina(dest.searchParams.get('d'));
			if (el) el.style.viewTransitionName = 'cover';
		}
	});

	addEventListener('pagereveal', (e) => {
		if (!e.viewTransition) return;
		if (root.dataset.stile === 'nessuna') return e.viewTransition.skipTransition();
		const from = navigation.activation && navigation.activation.from;
		if (!from) return;
		root.dataset.dir = pagina(from.url) > pagina(location.href) ? 'back' : 'forward';
		if (volo() && pagina(from.url) === 1 && pagina(location.href) === 0) {
			const el = copertina(new URL(from.url).searchParams.get('d'));
			if (el) {
				el.style.viewTransitionName = 'cover';
				e.viewTransition.finished.finally(() => (el.style.viewTransitionName = ''));
			}
		}
	});

	// Ritorno dalla cache (tasto Indietro): niente nomi rimasti appesi.
	addEventListener('pageshow', (e) => {
		if (e.persisted) document.querySelectorAll('.cover__art').forEach((el) => (el.style.viewTransitionName = ''));
	});
})();
