// Griglia / lista: stesso elenco, due forme. Il cambio passa da una View Transition (le schede visibili si trasformano
// in posizione e misura); senza, il cambio è immediato. La scelta si ricorda nella sessione.
(() => {
	const { ITEMS, card, morph, count } = window.FG;
	const root = document.querySelector('[data-fg]');
	const grid = root.querySelector('[data-grid]');
	const btns = [...root.querySelectorAll('[data-view]')];
	ITEMS.forEach((it) => grid.append(card(it)));
	root.querySelector('[data-count]').textContent = count(ITEMS.length);

	const set = (view, animate) => {
		const apply = () => {
			grid.classList.toggle('fg-grid--list', view === 'list');
			btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
		};
		animate ? morph(apply, grid) : apply();
		try { sessionStorage.setItem('fg-view', view); } catch {}
	};
	btns.forEach((b) => b.addEventListener('click', () => b.getAttribute('aria-pressed') !== 'true' && set(b.dataset.view, true)));
	let saved = null;
	try { saved = sessionStorage.getItem('fg-view'); } catch {}
	if (saved === 'list') set('list', false);
})();
