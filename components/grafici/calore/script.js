// Tab «Mappa di calore»: giorno × ora, una sola tinta; celle navigabili con le frecce, filtro pranzo/cena, numeri a richiesta.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const { tr, nf, pct0, day, HOURS, HEAT, H, live } = Gf;
	const $ = (s, r = document) => r.querySelector(s);

	const root = $('[data-root]');
	const table = $('[data-table]');
	const foot = $('[data-foot]');
	const chips = $('[data-chips]');
	const nums = $('[data-nums]');
	const flat = HEAT.flat();
	const lo = Math.min(...flat);
	const hi = Math.max(...flat);
	const RANGES = {
		all: [tr('ca.r.all', 'Tutto il giorno'), 12, 23],
		lunch: [tr('ca.r.lunch', 'Pranzo'), 12, 15],
		dinner: [tr('ca.r.dinner', 'Cena'), 19, 23],
	};
	let range = 'all';
	let pos = [0, 0];

	const hh = (h) => `${h}:00`;
	table.innerHTML =
		`<caption class="sr-only">${tr('ca.cap', 'Coperti medi per giorno della settimana (righe) e ora (colonne)')}</caption>` +
		`<thead><tr><td></td>${HOURS.map((h) => `<th scope="col" data-h="${h}">${h}</th>`).join('')}</tr></thead><tbody>` +
		HEAT.map(
			(row, d) =>
				`<tr><th scope="row" data-d="${d}">${day(d)}</th>${row
					.map((v, k) => {
						const t = (v - lo) / (hi - lo);
						return `<td><button type="button" data-d="${d}" data-k="${k}" style="--t:${t.toFixed(3)}" class="${t > 0.8 ? 'is-hi' : ''}" tabindex="${d || k ? -1 : 0}" aria-label="${day(d, true)} ${hh(HOURS[k])}: ${nf.format(v)} ${tr('ca.cov', 'coperti')}">${v}</button></td>`;
					})
					.join('')}</tr>`,
		).join('') +
		'</tbody>';
	const cells = [...table.querySelectorAll('td button')];
	const cell = (d, k) => cells[d * HOURS.length + k];

	$('[data-min]').textContent = nf.format(lo);
	$('[data-max]').textContent = nf.format(hi);

	for (const [id, [label]] of Object.entries(RANGES)) {
		const b = H('button', 'gf-chip', label, chips);
		b.type = 'button';
		b.dataset.r = id;
		b.setAttribute('aria-pressed', String(id === range));
		b.addEventListener('click', () => setRange(id));
	}

	function inRange(k) {
		const [, from, to] = RANGES[range];
		return HOURS[k] >= from && HOURS[k] <= to;
	}
	// la fascia scelta spegne il resto e dice dove sta il picco al suo interno
	function setRange(id) {
		range = id;
		chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.r === id)));
		cells.forEach((c) => c.classList.toggle('is-out', !inRange(+c.dataset.k)));
		let best = [0, 0];
		HEAT.forEach((row, d) => row.forEach((v, k) => inRange(k) && v > HEAT[best[0]][best[1]] && (best = [d, k])));
		if (!inRange(best[1])) best = [0, HOURS.findIndex((_, k) => inRange(k))];
		show(best[0], best[1], true);
	}

	function show(d, k, move) {
		pos = [d, k];
		cells.forEach((c) => c.removeAttribute('aria-current'));
		const c = cell(d, k);
		c.setAttribute('aria-current', 'true');
		table.querySelectorAll('th').forEach((th) => th.classList.toggle('is-hot', th.dataset.d !== undefined ? +th.dataset.d === d : +th.dataset.h === HOURS[k]));
		const v = HEAT[d][k];
		foot.innerHTML = tr('ca.det', '<b>{d} {h}</b>: {v} coperti in media, il {p} del momento più pieno', { d: day(d, true), h: hh(HOURS[k]), v: nf.format(v), p: pct0.format(v / hi) });
		if (move) {
			cells.forEach((x) => (x.tabIndex = -1));
			c.tabIndex = 0;
		}
	}

	table.addEventListener('pointerover', (e) => {
		const c = e.target.closest('td button');
		if (c) show(+c.dataset.d, +c.dataset.k);
	});
	table.addEventListener('click', (e) => {
		const c = e.target.closest('td button');
		if (c) show(+c.dataset.d, +c.dataset.k, true);
	});
	table.addEventListener('focusin', (e) => {
		const c = e.target.closest('td button');
		if (c) show(+c.dataset.d, +c.dataset.k, true);
	});
	table.addEventListener('keydown', (e) => {
		const c = e.target.closest('td button');
		if (!c) return;
		let d = +c.dataset.d;
		let k = +c.dataset.k;
		const last = HOURS.length - 1;
		const key = e.key;
		if (key === 'ArrowRight') k = Math.min(last, k + 1);
		else if (key === 'ArrowLeft') k = Math.max(0, k - 1);
		else if (key === 'ArrowDown') d = Math.min(6, d + 1);
		else if (key === 'ArrowUp') d = Math.max(0, d - 1);
		else if (key === 'Home') k = 0;
		else if (key === 'End') k = last;
		else return;
		e.preventDefault();
		cell(d, k).focus();
	});

	nums.addEventListener('click', () => {
		const on = nums.getAttribute('aria-pressed') !== 'true';
		nums.setAttribute('aria-pressed', String(on));
		table.classList.toggle('is-nums', on);
	});

	setRange('all');
	live(root);
})();
