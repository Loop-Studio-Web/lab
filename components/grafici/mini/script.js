// Tab «Mini-grafici»: sparkline nelle righe, misuratore ad arco e barre di avanzamento con obiettivo. Stati sempre con icona e parole.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const { tr, nf, pct, DISHES, S, H, tip: mkTip, live } = Gf;
	const $ = (s, r = document) => r.querySelector(s);

	const root = $('[data-root]');
	const list = $('[data-list]');
	const tiles = $('[data-tiles]');
	const foot = $('[data-foot]');
	const tp = mkTip(list);
	const hostBox = () => list.getBoundingClientRect();

	// Icone di stato: triangolo su/giù, spunta, punto esclamativo (il colore accompagna, non è l'unico segnale)
	const ICONS = {
		up: 'M6 1.5 11 10H1Z',
		down: 'M6 10.5 1 2h10Z',
		ok: 'M6 0.8a5.2 5.2 0 1 0 0 10.4A5.2 5.2 0 0 0 6 .8Zm-1 7.6L2.6 6l.8-.8L5 6.8l3.6-3.6.8.8Z',
		warn: 'M6 1 11.5 10.5h-11ZM5.4 4.5v2.8h1.2V4.5Zm0 3.6v1.1h1.2V8.1Z',
	};
	const icon = (kind, parent, cls) => {
		const s = S('svg', { viewBox: '0 0 12 12', 'aria-hidden': 'true', class: cls || '' }, parent);
		S('path', { d: ICONS[kind], fill: kind === 'ok' ? 'var(--ok)' : kind === 'warn' ? 'var(--warn)' : 'currentColor' }, s);
		return s;
	};

	DISHES.forEach((d) => {
		const w = d.weeks;
		const last = w[w.length - 1];
		const change = last / w[w.length - 5] - 1; // ultime 4 settimane
		const up = change >= 0;
		const li = H('li', 'mn-row', undefined, list);
		const name = H('div', 'mn-name', d.name, li);
		H('small', '', tr('mn.week', '{n} porzioni', { n: nf.format(last) }), name);

		const min = Math.min(...w);
		const max = Math.max(...w);
		const pt = (v, i) => [3 + (i / (w.length - 1)) * 90, 25 - ((v - min) / (max - min || 1)) * 22];
		const spark = H('div', `mn-spark${up ? '' : ' is-down'}`, undefined, li);
		spark.tabIndex = 0;
		spark.setAttribute('role', 'img');
		spark.setAttribute('aria-label', tr('mn.spark', '{d}: da {a} a {b} porzioni in 12 settimane', { d: d.name, a: nf.format(w[0]), b: nf.format(last) }));
		const svg = S('svg', { viewBox: '0 0 96 28' }, spark);
		const pts = w.map(pt);
		S('path', { d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') }, svg);
		const dot = S('circle', { r: 3, cx: pts.at(-1)[0], cy: pts.at(-1)[1] }, svg);

		const delta = H('div', `mn-delta ${up ? 'mn-up' : 'mn-down'}`, undefined, li);
		icon(up ? 'up' : 'down', delta);
		delta.append(pct.format(change));
		delta.title = tr('mn.vs', 'sulle 4 settimane prima');

		let at = w.length - 1;
		const point = (i, show) => {
			at = i;
			dot.setAttribute('cx', pts[i][0]);
			dot.setAttribute('cy', pts[i][1]);
			if (!show) return tp.hide();
			const b = spark.getBoundingClientRect();
			const h = hostBox();
			tp.show(tr('mn.wk', 'Settimana {n}', { n: i + 1 }), [[d.name, nf.format(w[i])]], b.left - h.left + (pts[i][0] / 96) * b.width, b.top - h.top);
			foot.innerHTML = tr('mn.det', '<b>{d}</b>, settimana {n}: {v} porzioni', { d: d.name, n: i + 1, v: nf.format(w[i]) });
		};
		const rest = () => {
			point(w.length - 1, false);
			tp.hide();
			foot.textContent = '';
		};
		spark.addEventListener('pointermove', (e) => {
			const b = spark.getBoundingClientRect();
			point(Math.min(w.length - 1, Math.max(0, Math.round(((e.clientX - b.left) / b.width) * (w.length - 1)))), true);
		});
		spark.addEventListener('pointerleave', () => document.activeElement !== spark && rest());
		spark.addEventListener('focus', () => point(at, true));
		spark.addEventListener('blur', rest);
		spark.addEventListener('keydown', (e) => {
			const to = { ArrowLeft: Math.max(0, at - 1), ArrowRight: Math.min(w.length - 1, at + 1), Home: 0, End: w.length - 1 }[e.key];
			if (to === undefined) return;
			e.preventDefault();
			point(to, true);
		});
	});

	/* ---- tessere ---- */
	const tile = (title) => {
		const t = H('div', 'mn-tile', undefined, tiles);
		H('h3', '', title, t);
		return t;
	};
	const status = (parent, kind, text) => {
		const s = H('div', 'mn-status', undefined, parent);
		icon(kind, s);
		s.append(text);
	};

	// 1 · misuratore ad arco
	{
		const val = 0.78;
		const goal = 0.85;
		const t = tile(tr('mn.t1', 'Sala piena a cena'));
		const svg = S('svg', { viewBox: '0 0 140 78', class: 'mn-gauge', role: 'img', 'aria-label': tr('mn.g.aria', 'Occupazione serale: 78% su un obiettivo di 85%') }, t);
		const arcPath = 'M10 70A60 60 0 0 1 130 70';
		S('path', { d: arcPath, class: 'track' }, svg);
		S('path', { d: arcPath, class: 'val', pathLength: 1, 'stroke-dashoffset': 1 - val }, svg);
		const ph = Math.PI * goal;
		S('line', { class: 'goal', x1: 70 - 50 * Math.cos(ph), y1: 70 - 50 * Math.sin(ph), x2: 70 - 72 * Math.cos(ph), y2: 70 - 72 * Math.sin(ph) }, svg);
		H('div', 'mn-big', '78%', t);
		status(t, 'warn', tr('mn.g.s', 'Sotto l’obiettivo (85%)'));
	}
	// 2 · avanzamento del mese
	{
		const t = tile(tr('mn.t2', 'Coperti del mese'));
		H('div', 'mn-big', `${nf.format(2570)} / ${nf.format(3000)}`, t);
		const bar = H('div', 'mn-prog', undefined, t);
		bar.setAttribute('role', 'img');
		bar.setAttribute('aria-label', tr('mn.p.aria', '86% dell’obiettivo mensile'));
		H('span', '', undefined, bar).style.width = `${(2570 / 3000) * 100}%`;
		status(t, 'ok', tr('mn.p.s', 'In linea, mancano {n}', { n: nf.format(430) }));
	}
	// 3 · attesa media con obiettivo (bullet)
	{
		const t = tile(tr('mn.t3', 'Attesa media al tavolo'));
		H('div', 'mn-big', tr('mn.w.v', '{n} min', { n: 14 }), t);
		const bar = H('div', 'mn-prog mn-prog--wait', undefined, t);
		bar.setAttribute('role', 'img');
		bar.setAttribute('aria-label', tr('mn.w.aria', '14 minuti su un obiettivo di 12'));
		H('span', '', undefined, bar).style.width = `${(14 / 20) * 100}%`;
		H('i', 'mn-goal', undefined, bar).style.setProperty('--goal', `${(12 / 20) * 100}%`);
		status(t, 'warn', tr('mn.w.s', '2 min sopra l’obiettivo'));
	}

	live(root);
})();
