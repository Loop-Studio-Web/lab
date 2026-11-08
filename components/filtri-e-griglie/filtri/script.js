// Filtri: categorie (scelta multipla) + ordine. Le schede restano nel DOM; si nascondono con `hidden` e si riordinano con append,
// e FLIP anima il cambio. Nessun ricaricamento, nessuna libreria.
(() => {
	const { ITEMS, CATS, SORTS, card, flip, count } = window.FG;
	const root = document.querySelector('[data-fg]');
	const grid = root.querySelector('[data-grid]');
	const chips = root.querySelector('[data-chips]');
	const sort = root.querySelector('[data-sort]');
	const reset = root.querySelector('[data-reset]');
	const out = root.querySelector('[data-count]');
	const on = new Set();

	const cards = new Map(ITEMS.map((it) => [it.id, card(it)]));
	cards.forEach((li) => grid.append(li));

	Object.entries(CATS).forEach(([key, label]) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'fg-chip';
		b.textContent = label;
		b.setAttribute('aria-pressed', 'false');
		b.addEventListener('click', () => {
			on.has(key) ? on.delete(key) : on.add(key);
			b.setAttribute('aria-pressed', String(on.has(key)));
			update();
		});
		chips.append(b);
	});

	const update = () => {
		const shown = ITEMS.filter((it) => !on.size || on.has(it.cat)).sort(SORTS[sort.value]);
		flip(grid, () => {
			cards.forEach((li) => (li.hidden = true));
			shown.forEach((it) => {
				const li = cards.get(it.id);
				li.hidden = false;
				grid.append(li);
			});
		});
		out.textContent = count(shown.length);
		reset.hidden = !on.size && sort.value === 'rec';
	};

	sort.addEventListener('change', update);
	reset.addEventListener('click', () => {
		on.clear();
		sort.value = 'rec';
		chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
		update();
	});
	update();
})();
