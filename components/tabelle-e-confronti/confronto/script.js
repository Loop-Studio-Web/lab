// Tab «Confronto»: tre piani, righe uguali nascoste su richiesta, scelta di un piano con riepilogo.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const $ = (s, r = document) => r.querySelector(s);

	const PLANS = [
		{ id: 'a', name: LabI18n.t('cf.p.a', 'Assaggio'), price: 29 },
		{ id: 'b', name: LabI18n.t('cf.p.b', 'Appassionato'), price: 59, best: true },
		{ id: 'c', name: LabI18n.t('cf.p.c', 'Collezionista'), price: 109 },
	];
	const free = LabI18n.t('cf.v.free', 'Gratis');
	const any = LabI18n.t('cf.v.any', 'Quando vuoi');
	// v: un valore per piano; true/false = incluso / non incluso
	const ROWS = [
		{ l: LabI18n.t('cf.f.bott', 'Bottiglie al mese'), v: ['2', '4', '6'] },
		{ l: LabI18n.t('cf.f.deg', 'Degustazione online'), v: [false, LabI18n.t('cf.v.1m', '1 al mese'), LabI18n.t('cf.v.2m', '2 al mese')] },
		{ l: LabI18n.t('cf.f.sped', 'Spedizione'), v: ['€ 6', free, free] },
		{ l: LabI18n.t('cf.f.vis', 'Visita in cantina'), v: [false, LabI18n.t('cf.v.1y', '1 all’anno'), LabI18n.t('cf.v.4y', '4 all’anno')] },
		{ l: LabI18n.t('cf.f.et', 'Etichetta personalizzata'), v: [false, false, true] },
		{ l: LabI18n.t('cf.f.dis', 'Disdetta'), v: [any, any, LabI18n.t('cf.v.3m', 'Dopo 3 mesi')] },
		{ l: LabI18n.t('cf.f.pay', 'Pagamento sicuro'), v: [true, true, true] },
		{ l: LabI18n.t('cf.f.mail', 'Assistenza via email'), v: [true, true, true] },
		{ l: LabI18n.t('cf.f.box', 'Imballo antiurto'), v: [true, true, true] },
	];
	const yes = LabI18n.t('cf.yes', 'Incluso');
	const no = LabI18n.t('cf.no', 'Non incluso');
	const ICON_YES = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 8.5 3.2 3L13 4.5"/></svg>';
	const ICON_NO = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8h8"/></svg>';
	const cell = (v) => (v === true ? `<span class="cf-yes">${ICON_YES}</span><span class="sr-only">${yes}</span>` : v === false ? `<span class="cf-no">${ICON_NO}</span><span class="sr-only">${no}</span>` : v);

	const table = $('[data-table]');
	const foot = $('[data-foot]');
	const diffBtn = $('[data-diff]');
	let chosen = null;

	const head = PLANS.map(
		(p) => `<th scope="col" data-p="${p.id}" class="${p.best ? 'is-best' : ''}">${p.best ? `<span class="cf-badge">${LabI18n.t('cf.best', 'Più scelto')}</span>` : ''}<span class="cf-name">${p.name}</span><span class="cf-price">€ ${p.price} <small>${LabI18n.t('cf.month', '/mese')}</small></span><button type="button" class="cf-pick" aria-pressed="false" data-pick="${p.id}">${LabI18n.t('cf.choose', 'Scegli')}</button></th>`,
	).join('');
	const body = ROWS.map((r) => {
		const same = r.v.every((x) => x === r.v[0]);
		return `<tr${same ? ' class="is-same"' : ''}><th scope="row">${r.l}</th>${r.v.map((v, i) => `<td data-p="${PLANS[i].id}" class="${PLANS[i].best ? 'is-best' : ''}">${cell(v)}</td>`).join('')}</tr>`;
	}).join('');
	table.innerHTML = `<caption class="sr-only">${LabI18n.t('cf.cap', 'Confronto tra i tre piani del club')}</caption><thead><tr><td aria-hidden="true"></td>${head}</tr></thead><tbody>${body}</tbody>`;

	function summary() {
		const p = PLANS.find((x) => x.id === chosen);
		foot.innerHTML = p ? LabI18n.t('cf.sel', 'Hai scelto <b>{p}</b> · € {n} al mese', { p: p.name, n: p.price }) : LabI18n.t('cf.none', 'Scegli un piano per vedere il riepilogo.');
	}

	table.addEventListener('click', (e) => {
		const b = e.target.closest('[data-pick]');
		if (!b) return;
		chosen = chosen === b.dataset.pick ? null : b.dataset.pick;
		table.querySelectorAll('[data-pick]').forEach((x) => {
			const on = x.dataset.pick === chosen;
			x.setAttribute('aria-pressed', on);
			x.textContent = on ? LabI18n.t('cf.chosen', 'Scelto') : LabI18n.t('cf.choose', 'Scegli');
		});
		table.querySelectorAll('[data-p]').forEach((c) => c.classList.toggle('is-sel', c.dataset.p === chosen));
		summary();
	});

	diffBtn.addEventListener('click', () => {
		const on = diffBtn.getAttribute('aria-pressed') !== 'true';
		diffBtn.setAttribute('aria-pressed', on);
		table.querySelectorAll('.is-same').forEach((r) => (r.hidden = on));
	});

	summary();
})();
