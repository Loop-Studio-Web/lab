// Tab «Matrice»: tabella a doppia entrata con riga e colonna che si accendono, frecce per muoversi, filtro per tipo.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const $ = (s, r = document) => r.querySelector(s);

	const DAYS = [LabI18n.t('mx.d1', 'Lun'), LabI18n.t('mx.d2', 'Mar'), LabI18n.t('mx.d3', 'Mer'), LabI18n.t('mx.d4', 'Gio'), LabI18n.t('mx.d5', 'Ven')];
	const TYPES = { y: LabI18n.t('mx.ty.y', 'Yoga'), f: LabI18n.t('mx.ty.f', 'Forza'), c: LabI18n.t('mx.ty.c', 'Cardio') };
	const HOURS = ['08:00', '12:30', '18:00', '19:30'];
	// tipo|corso|sala|posti liberi  (vuoto = nessun corso)
	const GRID = [
		['y|Vinyasa|2|8', 'f|Kettlebell|1|5', 'y|Hatha|2|10', 'f|TRX|1|3', 'c|Spinning|3|6'],
		['', 'c|HIIT|1|9', '', 'c|Spinning|3|4', ''],
		['f|TRX|1|7', 'y|Hatha|2|2', 'c|HIIT|1|0', 'y|Vinyasa|2|6', 'f|Kettlebell|1|8'],
		['c|Spinning|3|3', '', 'f|Kettlebell|1|1', '', 'y|Vinyasa|2|12'],
	].map((r) => r.map((s) => (s ? Object.fromEntries(s.split('|').map((v, i) => [['t', 'n', 'r', 's'][i], v])) : null)));

	const table = $('[data-table]');
	const detail = $('[data-detail]');
	const legend = $('[data-legend]');

	table.innerHTML =
		`<caption class="sr-only">${LabI18n.t('mx.cap', 'Orario settimanale dei corsi: giorni in colonna, orari in riga')}</caption>` +
		`<thead><tr><td></td>${DAYS.map((d) => `<th scope="col">${d}</th>`).join('')}</tr></thead><tbody>` +
		GRID.map(
			(row, r) =>
				`<tr><th scope="row">${HOURS[r]}</th>${row
					.map((c, k) => {
						const label = c ? `${c.n}, ${DAYS[k]} ${HOURS[r]}` : `${LabI18n.t('mx.nocourse', 'Nessun corso')}, ${DAYS[k]} ${HOURS[r]}`;
						return `<td><button type="button" data-r="${r}" data-c="${k}" data-t="${c ? c.t : ''}" class="${c ? '' : 'is-empty'}" tabindex="${r || k ? -1 : 0}" aria-label="${label}">${c ? `<span class="mx-long">${c.n}</span><span class="mx-short" aria-hidden="true">${c.n.slice(0, 2)}</span>` : '–'}</button></td>`;
					})
					.join('')}</tr>`,
		).join('') +
		'</tbody>';

	legend.innerHTML = Object.entries(TYPES)
		.map(([k, n]) => `<button type="button" class="mx-chip" data-t="${k}" aria-pressed="false">${n}</button>`)
		.join('');

	const cells = [...table.querySelectorAll('td button')];
	const at = (r, c) => cells.find((b) => +b.dataset.r === r && +b.dataset.c === c);
	const colHeads = [...table.querySelectorAll('thead th')];
	const rowHeads = [...table.querySelectorAll('tbody th')];
	let sel = null;

	function heat(r, c) {
		cells.forEach((b) => b.classList.toggle('is-line', r != null && (+b.dataset.r === r || +b.dataset.c === c)));
		colHeads.forEach((h, i) => h.classList.toggle('is-hot', c === i));
		rowHeads.forEach((h, i) => h.classList.toggle('is-hot', r === i));
	}
	const hint = () => (detail.textContent = LabI18n.t('mx.hint', 'Scegli una cella per vedere i dettagli.'));
	function choose(b) {
		cells.forEach((x) => x.classList.remove('is-sel'));
		sel = b;
		b.classList.add('is-sel');
		const r = +b.dataset.r;
		const c = +b.dataset.c;
		const g = GRID[r][c];
		if (!g) return (detail.textContent = LabI18n.t('mx.free', '{d} alle {h}: nessun corso.', { d: DAYS[c], h: HOURS[r] }));
		const s = +g.s;
		detail.innerHTML = LabI18n.t('mx.det', '<b>{n}</b> · {d} alle {h} · Sala {r} · {s}', {
			n: g.n,
			d: DAYS[c],
			h: HOURS[r],
			r: g.r,
			s: s ? LabI18n.t('mx.seats', '{k} posti liberi', { k: s }) : LabI18n.t('mx.full', 'completo'),
		});
	}
	function focusCell(b) {
		cells.forEach((x) => (x.tabIndex = -1));
		b.tabIndex = 0;
		b.focus();
	}

	table.addEventListener('pointerover', (e) => {
		const b = e.target.closest('td button');
		if (b && e.pointerType === 'mouse') heat(+b.dataset.r, +b.dataset.c);
	});
	table.addEventListener('pointerleave', () => (sel ? heat(+sel.dataset.r, +sel.dataset.c) : heat(null, null)));
	table.addEventListener('focusin', (e) => {
		const b = e.target.closest('td button');
		if (b) heat(+b.dataset.r, +b.dataset.c);
	});
	table.addEventListener('focusout', (e) => {
		if (!table.contains(e.relatedTarget)) sel ? heat(+sel.dataset.r, +sel.dataset.c) : heat(null, null);
	});
	table.addEventListener('click', (e) => {
		const b = e.target.closest('td button');
		if (!b) return;
		choose(b);
		heat(+b.dataset.r, +b.dataset.c);
	});
	table.addEventListener('keydown', (e) => {
		const b = e.target.closest('td button');
		if (!b) return;
		let r = +b.dataset.r;
		let c = +b.dataset.c;
		const R = GRID.length - 1;
		const C = GRID[0].length - 1;
		if (e.key === 'ArrowRight') c = Math.min(C, c + 1);
		else if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
		else if (e.key === 'ArrowDown') r = Math.min(R, r + 1);
		else if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
		else if (e.key === 'Home') c = 0;
		else if (e.key === 'End') c = C;
		else return;
		e.preventDefault();
		focusCell(at(r, c));
	});

	legend.addEventListener('click', (e) => {
		const chip = e.target.closest('.mx-chip');
		if (!chip) return;
		const on = chip.getAttribute('aria-pressed') !== 'true';
		legend.querySelectorAll('.mx-chip').forEach((x) => x.setAttribute('aria-pressed', x === chip && on));
		on ? (table.dataset.f = chip.dataset.t) : delete table.dataset.f;
	});

	hint();
})();
