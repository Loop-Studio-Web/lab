// Filtri + ricerca: categorie (scelta multipla), ordine e testo lavorano insieme. Le schede restano nel DOM; si nascondono con `hidden`
// e si riordinano con append, e FLIP anima il cambio. La ricerca ignora accenti e maiuscole e evidenzia il trovato nel nome.
(() => {
	const { ITEMS, CATS, SORTS, card, flip, count, norm } = window.FG;
	const root = document.querySelector('[data-fg]');
	const grid = root.querySelector('[data-grid]');
	const chips = root.querySelector('[data-chips]');
	const sort = root.querySelector('[data-sort]');
	const reset = root.querySelector('[data-reset]');
	const out = root.querySelector('[data-count]');
	const input = root.querySelector('[data-q]');
	const empty = root.querySelector('[data-empty]');
	const sugg = root.querySelector('[data-sugg]');
	const on = new Set();

	const cards = new Map(ITEMS.map((it) => [it.id, card(it)]));
	cards.forEach((li) => grid.append(li));
	const hay = new Map(ITEMS.map((it) => [it.id, norm([it.name, CATS[it.cat], it.cat, it.text].join(' '))]));

	// Nome con la parte trovata in <mark>. Si cerca sul testo senza accenti carattere per carattere: gli indici restano quelli dell'originale.
	const plain = (s) => [...s].map((c) => norm(c)[0] ?? c).join('').toLowerCase();
	const paint = (li, it, q) => {
		const el = li.querySelector('.fg-card__name');
		const i = q ? plain(it.name).indexOf(q) : -1;
		if (i < 0) return void (el.textContent = it.name);
		const m = document.createElement('mark');
		m.textContent = it.name.slice(i, i + q.length);
		el.replaceChildren(it.name.slice(0, i), m, it.name.slice(i + q.length));
	};

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
		const q = norm(input.value.trim());
		const shown = ITEMS.filter((it) => (!on.size || on.has(it.cat)) && (!q || hay.get(it.id).includes(q))).sort(SORTS[sort.value]);
		flip(grid, () => {
			cards.forEach((li, id) => {
				li.hidden = true;
				paint(li, ITEMS.find((x) => x.id === id), q);
			});
			shown.forEach((it) => {
				const li = cards.get(it.id);
				li.hidden = false;
				grid.append(li);
			});
		});
		out.textContent = count(shown.length);
		empty.hidden = shown.length > 0;
		reset.hidden = !on.size && !q && sort.value === 'rec';
	};

	['lago', 'mare', 'tramonto'].forEach((w) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'fg-chip';
		b.textContent = w;
		b.addEventListener('click', () => {
			input.value = w;
			on.clear();
			chips.querySelectorAll('button').forEach((c) => c.setAttribute('aria-pressed', 'false'));
			update();
			input.focus();
		});
		sugg.append(b);
	});

	input.addEventListener('input', update);
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && input.value) {
			input.value = '';
			update();
		}
	});
	sort.addEventListener('change', update);
	reset.addEventListener('click', () => {
		on.clear();
		input.value = '';
		sort.value = 'rec';
		chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
		update();
	});
	update();
})();
