// Tab accessibili: ruoli ARIA, un solo tab nell'ordine di tabulazione (gli altri
// si raggiungono con le frecce, Home e Fine), pannelli nascosti con `hidden`.
// La posizione dell'indicatore (--x, --w) e il ritaglio della copia "accesa" si
// calcolano dal tab attivo e si aggiornano anche al ridimensionamento.
document.querySelectorAll('[data-tabs]').forEach((root) => {
	const list = root.querySelector('[role="tablist"]');
	const tabs = [...list.querySelectorAll('[role="tab"]')];
	const lit = root.querySelector('[data-lit]');
	const bar = root.querySelector('.line__bar');

	function indicate(tab) {
		const lr = list.getBoundingClientRect();
		const tr = tab.getBoundingClientRect();
		list.style.setProperty('--x', `${tr.left - lr.left}px`);
		list.style.setProperty('--w', `${tr.width}px`);
		if (lit) {
			// Il ritaglio mostra solo la parte della copia "accesa" sotto il tab attivo.
			const left = ((tr.left - lr.left) / lr.width) * 100;
			const right = ((lr.right - tr.right) / lr.width) * 100;
			lit.style.clipPath = `inset(0 ${right}% 0 ${left}% round 999px)`;
		}
	}

	function select(tab, { focus = false } = {}) {
		tabs.forEach((t) => {
			const on = t === tab;
			t.setAttribute('aria-selected', String(on));
			t.tabIndex = on ? 0 : -1;
			document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
		});
		indicate(tab);
		if (focus) tab.focus();
	}

	tabs.forEach((tab, i) => {
		tab.addEventListener('click', () => select(tab));
		tab.addEventListener('keydown', (e) => {
			const last = tabs.length - 1;
			const to = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
			if (to === undefined) return;
			e.preventDefault();
			select(tabs[to], { focus: true });
		});
	});

	const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
	new ResizeObserver(() => indicate(current())).observe(list);
	document.fonts?.ready.then(() => indicate(current()));
	indicate(current());
	// Il posizionamento iniziale non deve "scorrere" da zero.
	requestAnimationFrame(() => root.classList.add('is-ready'));
});
