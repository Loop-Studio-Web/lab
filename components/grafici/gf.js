// Grafici: dati di fantasia (Trattoria Alba) e funzioni comuni ai quattro tab. Si carica con defer PRIMA di script.js.
// Un solo dataset per tutta la scheda: i totali mensili sono la somma dei canali, la mappa di calore e i piatti sono coerenti con essi.
window.Gf = (() => {
	const I = window.LabI18n;
	const tr = (key, it, vars) => (I ? I.t(key, it, vars) : it);
	const lang = I?.lang || 'it';

	const nf = new Intl.NumberFormat(lang, { useGrouping: 'always' }); // anche 3.260, non solo da 5 cifre
	const pct = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' });
	const pct0 = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 });
	const month = (i, long) => new Intl.DateTimeFormat(lang, { month: long ? 'long' : 'short', timeZone: 'UTC' }).format(Date.UTC(2026, i, 1));
	// 0 = lunedì (il 5 gennaio 2026 è un lunedì)
	const day = (i, long) => new Intl.DateTimeFormat(lang, { weekday: long ? 'long' : 'short', timeZone: 'UTC' }).format(Date.UTC(2026, 0, 5 + i));

	const mulberry32 = (a) => () => {
		a = (a + 0x6d2b79f5) | 0;
		let x = Math.imul(a ^ (a >>> 15), 1 | a);
		x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
		return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
	};

	// Coperti (clienti serviti) per mese, due anni di fantasia. Il 2025 è piatto e senza picchi (estate e dicembre deboli);
	// il 2026 parte vicino e stacca da primavera: +31,5% sull'anno, credibile e non gonfiato.
	const TOT25 = [1880, 1760, 1900, 1980, 2050, 2080, 2200, 2220, 2100, 2030, 1960, 2100];
	const TOT26 = [1960, 1840, 2190, 2420, 2710, 2980, 3260, 3410, 2850, 2570, 2390, 3320];

	const CH = [
		{ id: 'sala', name: tr('gf.ch.sala', 'Sala'), color: 'var(--c1)' },
		{ id: 'asporto', name: tr('gf.ch.asporto', 'Asporto'), color: 'var(--c2)' },
		{ id: 'consegna', name: tr('gf.ch.consegna', 'Consegna'), color: 'var(--c3)' },
		{ id: 'eventi', name: tr('gf.ch.eventi', 'Eventi'), color: 'var(--c4)' },
	];
	const rnd = mulberry32(2026);
	// BY_CH[mese][canale]; la somma torna sempre al totale del mese
	const BY_CH = TOT26.map((tot, m) => {
		const w = [0.58 + (m >= 5 && m <= 8 ? 0.03 : 0), 0.17, 0.15 + (m <= 1 || m === 11 ? 0.04 : 0), 0.1 + (m === 5 || m === 11 ? 0.05 : 0)].map((x) => x * (0.94 + rnd() * 0.12));
		const s = w.reduce((p, c) => p + c, 0);
		const v = w.map((x) => Math.round((tot * x) / s));
		v[0] += tot - v.reduce((p, c) => p + c, 0);
		return v;
	});

	// Mappa di calore: coperti medi per giorno (lun…dom) e ora (12…23)
	const HOURS = Array.from({ length: 12 }, (_, i) => 12 + i);
	const rh = mulberry32(77);
	const HEAT = Array.from({ length: 7 }, (_, d) => {
		const lunch = d >= 5 ? 70 : d === 0 ? 20 : 52;
		const dinner = [60, 78, 82, 88, 112, 138, 92][d];
		return HOURS.map((h) => {
			const l = Math.exp(-((h - 13.3) ** 2) / (2 * 1.1 ** 2));
			const n = Math.exp(-((h - 20.6) ** 2) / (2 * 1.5 ** 2));
			return Math.max(2, Math.round((lunch * l + dinner * n + 5) * (0.93 + rh() * 0.14)));
		});
	});

	// Piatti: porzioni vendute per settimana (12 settimane)
	const DISHES = [
		{ id: 'tagliatelle', name: tr('gf.d.tagliatelle', 'Tagliatelle al ragù'), seed: 11, base: 130, trend: 3.2 },
		{ id: 'parmigiana', name: tr('gf.d.parmigiana', 'Parmigiana'), seed: 12, base: 96, trend: -1.6 },
		{ id: 'tiramisu', name: tr('gf.d.tiramisu', 'Tiramisù'), seed: 13, base: 88, trend: 2.1 },
		{ id: 'gnocchi', name: tr('gf.d.gnocchi', 'Gnocchi al pesto'), seed: 14, base: 70, trend: 0.2 },
		{ id: 'cotoletta', name: tr('gf.d.cotoletta', 'Cotoletta'), seed: 15, base: 82, trend: -2.4 },
	].map((d) => {
		const r = mulberry32(d.seed);
		return { ...d, weeks: Array.from({ length: 12 }, (_, i) => Math.round(d.base + d.trend * i + (r() - 0.5) * 16)) };
	});

	const S = (tag, attrs = {}, parent) => {
		const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
		for (const k in attrs) e.setAttribute(k, attrs[k]);
		parent?.append(e);
		return e;
	};
	const H = (tag, cls, text, parent) => {
		const e = document.createElement(tag);
		if (cls) e.className = cls;
		if (text !== undefined) e.textContent = text;
		parent?.append(e);
		return e;
	};

	// Estremo «bello» dell'asse e tacche
	const niceStep = (raw) => {
		const p = 10 ** Math.floor(Math.log10(raw));
		const f = raw / p;
		return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
	};
	const niceMax = (v, n = 4) => niceStep(v / n) * n;
	const ticks = (max, n = 4) => Array.from({ length: n + 1 }, (_, i) => (max / n) * i);

	// Fumetto che segue il punto: contenitore `host` con position: relative.
	const tip = (host) => {
		const el = H('div', 'gf-tip', undefined, host);
		el.hidden = true;
		el.setAttribute('aria-hidden', 'true');
		return {
			show(title, rows, x, y) {
				el.replaceChildren();
				H('b', '', title, el);
				for (const [label, val, color] of rows) {
					const r = H('span', '', undefined, el);
					if (color) H('i', '', undefined, r).style.background = color;
					r.append(`${label} `);
					H('strong', '', val, r);
				}
				el.hidden = false;
				const w = el.offsetWidth;
				el.style.left = `${Math.min(Math.max(x - w / 2, 4), Math.max(4, host.clientWidth - w - 4))}px`;
				el.style.top = `${Math.max(y - el.offsetHeight - 12, 0)}px`;
			},
			hide() {
				el.hidden = true;
			},
		};
	};

	// Le animazioni di entrata partono solo quando il grafico è visibile
	const live = (root, fn) => {
		const go = () => {
			root.classList.add('is-live');
			fn?.();
		};
		if (!('IntersectionObserver' in window)) return go();
		const io = new IntersectionObserver((es) => {
			if (es.some((e) => e.isIntersecting)) {
				io.disconnect();
				go();
			}
		});
		io.observe(root);
	};

	// Larghezza reale del contenitore: i grafici si ridisegnano a quella misura (testo sempre leggibile)
	const fit = (el, draw) => {
		let last = 0;
		const ro = new ResizeObserver(() => {
			const w = Math.floor(el.clientWidth);
			if (w && w !== last) {
				last = w;
				draw(w);
			}
		});
		ro.observe(el);
	};

	return { tr, lang, nf, pct, pct0, month, day, mulberry32, TOT25, TOT26, CH, BY_CH, HOURS, HEAT, DISHES, S, H, niceMax, ticks, tip, live, fit };
})();
