// Tab «Listino»: ordinamento a tre stati (cresce → decresce → ordine di partenza), righe espandibili, annuncio per i lettori di schermo.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const lang = I?.lang || 'it';
	const $ = (s, r = document) => r.querySelector(s);

	const CAT = {
		neve: LabI18n.t('ls.c.neve', 'Neve'),
		roccia: LabI18n.t('ls.c.roccia', 'Roccia'),
		trekking: LabI18n.t('ls.c.trekking', 'Trekking'),
		campeggio: LabI18n.t('ls.c.campeggio', 'Campeggio'),
	};
	const NOTE = {
		neve: LabI18n.t('ls.nt.neve', 'Si ritira già regolata sulla tua taglia, con le ghette e il sacchetto per il trasporto.'),
		roccia: LabI18n.t('ls.nt.roccia', 'Controllata dopo ogni uscita da una guida; si consegna con il libretto di manutenzione.'),
		trekking: LabI18n.t('ls.nt.trekking', 'Leggera, lavata e pronta per partire: va restituita entro le 18.'),
		campeggio: LabI18n.t('ls.nt.campeggio', 'Pulita e asciutta; per il gas porta la tua bombola o chiedi la nostra.'),
	};
	const NAME = {
		racchette: LabI18n.t('ls.n.racchette', 'Racchette da neve'),
		ciaspoleKids: LabI18n.t('ls.n.ciaspoleKids', 'Ciaspole bambino'),
		sci: LabI18n.t('ls.n.sci', 'Sci d’alpinismo'),
		casco: LabI18n.t('ls.n.casco', 'Casco da arrampicata'),
		imbrago: LabI18n.t('ls.n.imbrago', 'Imbrago'),
		ferrata: LabI18n.t('ls.n.ferrata', 'Set da ferrata'),
		zaino: LabI18n.t('ls.n.zaino', 'Zaino 40 L'),
		bastoncini: LabI18n.t('ls.n.bastoncini', 'Bastoncini in carbonio'),
		frontale: LabI18n.t('ls.n.frontale', 'Lampada frontale'),
		tenda: LabI18n.t('ls.n.tenda', 'Tenda a 2 posti'),
		sacco: LabI18n.t('ls.n.sacco', 'Sacco a pelo −5 °C'),
		fornello: LabI18n.t('ls.n.fornello', 'Fornello a gas'),
	};
	// n = nome, c = categoria, p = € al giorno, q = pezzi disponibili, dep = cauzione €, kg = peso, now = ritiro subito
	const ITEMS = [
		{ id: 'racchette', c: 'neve', p: 8, q: 14, dep: 20, kg: 1.9, now: true },
		{ id: 'ciaspoleKids', c: 'neve', p: 5, q: 6, dep: 10, kg: 1.1, now: true },
		{ id: 'sci', c: 'neve', p: 28, q: 4, dep: 120, kg: 3.4, now: false },
		{ id: 'casco', c: 'roccia', p: 6, q: 12, dep: 15, kg: 0.3, now: true },
		{ id: 'imbrago', c: 'roccia', p: 7, q: 9, dep: 20, kg: 0.4, now: true },
		{ id: 'ferrata', c: 'roccia', p: 12, q: 7, dep: 40, kg: 0.9, now: false },
		{ id: 'zaino', c: 'trekking', p: 5, q: 11, dep: 25, kg: 1.2, now: true },
		{ id: 'bastoncini', c: 'trekking', p: 4, q: 20, dep: 15, kg: 0.5, now: true },
		{ id: 'frontale', c: 'trekking', p: 3, q: 0, dep: 10, kg: 0.1, now: true },
		{ id: 'tenda', c: 'campeggio', p: 15, q: 5, dep: 60, kg: 2.6, now: false },
		{ id: 'sacco', c: 'campeggio', p: 9, q: 8, dep: 30, kg: 1.3, now: true },
		{ id: 'fornello', c: 'campeggio', p: 4, q: 10, dep: 15, kg: 0.6, now: true },
	].map((x, i) => ({ ...x, i, n: NAME[x.id], cl: CAT[x.c] }));

	const body = $('[data-body]');
	const foot = $('[data-foot]');
	const live = $('[data-live]');
	const heads = [...document.querySelectorAll('.ls thead th')];
	const collator = new Intl.Collator(lang);
	const nf = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
	const open = new Set();
	let sort = { key: null, dir: 1 };
	const eur = (n) => '€ ' + n;
	const kgL = LabI18n.t('ls.kg', 'kg');

	const stock = (q) =>
		q === 0
			? `<span class="ls-st ls-st--out">${LabI18n.t('ls.st.out', 'Esaurito')}</span>`
			: q <= 5
				? `<span class="ls-st ls-st--low">${q} <small>${LabI18n.t('ls.st.low', 'ultimi')}</small></span>`
				: `<span class="ls-st">${q}</span>`;

	const label = (k) => $(`th[data-key="${k}"] span`).textContent;

	function rowHtml(x) {
		const o = open.has(x.id);
		return `<tr class="ls-row${o ? ' is-open' : ''}" role="row" data-id="${x.id}">
	<td role="cell"><span class="ls-name"><button type="button" class="ls-tog" aria-expanded="${o}" aria-controls="d-${x.id}" aria-label="${LabI18n.t('ls.open', 'Dettagli: {n}', { n: x.n })}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button>${x.n}</span></td>
	<td role="cell" class="ls-cat">${x.cl}</td>
	<td role="cell" class="num" data-label="${label('p')}">${eur(x.p)}</td>
	<td role="cell" class="num" data-label="${label('q')}">${stock(x.q)}</td>
</tr>
<tr class="ls-detail" id="d-${x.id}" role="row"${o ? '' : ' hidden'}><td role="cell" colspan="4"><p>${NOTE[x.c]}</p><dl><div><dt>${LabI18n.t('ls.dep', 'Cauzione')}</dt><dd>${eur(x.dep)}</dd></div><div><dt>${LabI18n.t('ls.wt', 'Peso')}</dt><dd>${nf.format(x.kg)} ${kgL}</dd></div><div><dt>${LabI18n.t('ls.pk', 'Ritiro')}</dt><dd>${x.now ? LabI18n.t('ls.pk.now', 'Subito') : LabI18n.t('ls.pk.book', 'Su prenotazione')}</dd></div></dl></td></tr>`;
	}

	function render() {
		const list = [...ITEMS];
		if (sort.key) {
			const k = sort.key;
			list.sort((a, b) => sort.dir * (typeof a[k] === 'number' ? a[k] - b[k] : collator.compare(a[k === 'c' ? 'cl' : k], b[k === 'c' ? 'cl' : k])) || a.i - b.i);
		}
		body.innerHTML = list.map(rowHtml).join('');
		heads.forEach((th) => {
			if (th.dataset.key === sort.key) th.setAttribute('aria-sort', sort.dir > 0 ? 'ascending' : 'descending');
			else th.removeAttribute('aria-sort');
		});
		const avail = ITEMS.filter((x) => x.q > 0).length;
		foot.innerHTML = LabI18n.t('ls.count', '<b>{n}</b> articoli, <b>{a}</b> disponibili', { n: ITEMS.length, a: avail });
	}

	heads.forEach((th) =>
		th.querySelector('button').addEventListener('click', () => {
			const k = th.dataset.key;
			if (sort.key !== k) sort = { key: k, dir: 1 };
			else if (sort.dir === 1) sort.dir = -1;
			else sort = { key: null, dir: 1 };
			render();
			live.textContent = sort.key
				? LabI18n.t('ls.sorted', 'Ordinato per {c}, {o}', { c: label(k), o: sort.dir > 0 ? LabI18n.t('ls.asc', 'dal più basso') : LabI18n.t('ls.desc', 'dal più alto') })
				: LabI18n.t('ls.orig', 'Ordine di partenza');
		}),
	);

	body.addEventListener('click', (e) => {
		const b = e.target.closest('.ls-tog');
		if (!b) return;
		const row = b.closest('tr');
		const det = document.getElementById(b.getAttribute('aria-controls'));
		const on = b.getAttribute('aria-expanded') !== 'true';
		b.setAttribute('aria-expanded', on);
		row.classList.toggle('is-open', on);
		det.hidden = !on;
		on ? open.add(row.dataset.id) : open.delete(row.dataset.id);
	});

	render();
})();
