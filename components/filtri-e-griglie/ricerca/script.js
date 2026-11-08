// Ricerca live: a ogni lettera l'elenco si restringe (nome, categoria, descrizione), senza accenti né maiuscole;
// la parte trovata nel nome è evidenziata con <mark>. Se non c'è niente, si propongono ricerche che funzionano.
(() => {
	const { ITEMS, CATS, card, flip, count, norm } = window.FG;
	const root = document.querySelector('[data-fg]');
	const grid = root.querySelector('[data-grid]');
	const input = root.querySelector('[data-q]');
	const out = root.querySelector('[data-count]');
	const empty = root.querySelector('[data-empty]');
	const sugg = root.querySelector('[data-sugg]');

	const cards = new Map(ITEMS.map((it) => [it.id, card(it)]));
	cards.forEach((li) => grid.append(li));
	const hay = new Map(ITEMS.map((it) => [it.id, norm([it.name, CATS[it.cat], it.cat, it.text].join(' '))]));

	// Il nome con la parte trovata evidenziata. Normalizzare può cambiare le lunghezze (NFD): si cerca sul testo senza accenti
	// carattere per carattere, così gli indici restano quelli del testo originale.
	const plain = (s) => [...s].map((c) => norm(c)[0] ?? c).join('');
	const paint = (li, it, q) => {
		const el = li.querySelector('.fg-card__name');
		const i = q ? plain(it.name).toLowerCase().indexOf(q) : -1;
		if (i < 0) return void (el.textContent = it.name);
		const m = document.createElement('mark');
		m.textContent = it.name.slice(i, i + q.length);
		el.replaceChildren(it.name.slice(0, i), m, it.name.slice(i + q.length));
	};

	const update = () => {
		const q = norm(input.value.trim());
		const hits = ITEMS.filter((it) => !q || hay.get(it.id).includes(q));
		flip(grid, () => {
			ITEMS.forEach((it) => {
				const li = cards.get(it.id);
				li.hidden = !hits.includes(it);
				paint(li, it, q);
			});
		});
		out.textContent = count(hits.length);
		empty.hidden = hits.length > 0;
	};

	['lago', 'mare', 'tramonto'].forEach((w) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'fg-chip';
		b.textContent = w;
		b.addEventListener('click', () => {
			input.value = w;
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
	update();
})();
