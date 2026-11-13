// Tab «Linee e aree»: linea e area dei coperti 2026 contro il 2025, fumetto che aggancia il mese, striscia di selezione (brushing).
(() => {
	const I = window.LabI18n;
	I?.apply();
	const { tr, nf, pct, month, TOT25, TOT26, S, H, niceMax, ticks, tip: mkTip, live, fit } = Gf;
	const $ = (s, r = document) => r.querySelector(s);

	const root = $('[data-root]');
	const plot = $('[data-plot]');
	const strip = $('[data-strip]');
	const foot = $('[data-foot]');
	const presets = $('[data-presets]');
	const MIN = 2; // almeno 3 mesi (indici a…a+2)
	const ML = 40;
	const MR = 36;
	const MT = 14;
	const MB = 24;
	const yMax = niceMax(Math.max(...TOT26, ...TOT25));

	let a = 0;
	let b = 11;
	let cur = null;
	let W = 0;
	let animate = true;
	let xf = () => 0;
	let yf = () => 0;

	const svg = S('svg', { role: 'img', 'aria-label': tr('ln.svg', 'Coperti per mese, 2026 e 2025') }, plot);
	const tp = mkTip(plot);
	let gCur;

	// Tabella equivalente per i lettori di schermo
	$('[data-table]').innerHTML =
		`<caption>${tr('ln.cap', 'Coperti per mese, 2026 e 2025')}</caption><thead><tr><th scope="col">${tr('ln.col.m', 'Mese')}</th><th scope="col">2026</th><th scope="col">2025</th></tr></thead><tbody>` +
		TOT26.map((v, i) => `<tr><th scope="row">${month(i, true)}</th><td>${nf.format(v)}</td><td>${nf.format(TOT25[i])}</td></tr>`).join('') +
		'</tbody>';

	const path = (pts) => pts.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');

	function render() {
		if (!W) return;
		const n = b - a + 1;
		const iw = W - ML - MR;
		const h = Math.round(Math.min(260, Math.max(170, W * 0.4)));
		const ih = h - MT - MB;
		xf = (i) => ML + ((i - a) / (b - a)) * iw;
		yf = (v) => MT + ih - (v / yMax) * ih;
		svg.setAttribute('viewBox', `0 0 ${W} ${h}`);
		svg.setAttribute('height', h);
		svg.replaceChildren();

		for (const v of ticks(yMax)) {
			S('line', { x1: ML, x2: W - MR, y1: yf(v), y2: yf(v), class: v ? 'gf-grid' : 'gf-axis' }, svg);
			S('text', { x: ML - 8, y: yf(v) + 4, 'text-anchor': 'end' }, svg).textContent = nf.format(v);
		}
		const step = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(iw / 44))));
		for (let i = a; i <= b; i += step) S('text', { x: xf(i), y: h - 6, 'text-anchor': i === a ? 'start' : 'middle' }, svg).textContent = month(i);

		const pts = (arr) => Array.from({ length: n }, (_, k) => [xf(a + k), yf(arr[a + k])]);
		const p26 = pts(TOT26);
		const anim = animate ? ' gf-draw' : '';
		S('path', { d: `${path(p26)}L${xf(b)} ${yf(0)}L${xf(a)} ${yf(0)}Z`, class: `gf-area${animate ? ' gf-fade' : ''}` }, svg);
		S('path', { d: path(pts(TOT25)), class: 'gf-line gf-line--prev' }, svg);
		S('path', { d: path(p26), class: `gf-line gf-line--main${anim}`, pathLength: 1 }, svg);

		// etichette dirette in fondo alle linee (sfalsate per non toccarsi)
		const up = TOT26[b] >= TOT25[b];
		S('text', { x: xf(b) + 8, y: yf(TOT26[b]) + (up ? -2 : 12), class: 'gf-end' }, svg).textContent = '2026';
		S('text', { x: xf(b) + 8, y: yf(TOT25[b]) + (up ? 12 : -2), class: 'gf-end' }, svg).textContent = '2025';

		gCur = S('g', { class: 'gf-cur' }, svg);
		if (cur !== null && (cur < a || cur > b)) cur = null;
		setCur(cur, false);
	}

	function summary() {
		let s26 = 0;
		let s25 = 0;
		let best = a;
		for (let i = a; i <= b; i++) {
			s26 += TOT26[i];
			s25 += TOT25[i];
			if (TOT26[i] > TOT26[best]) best = i;
		}
		return tr('ln.sum', '{from}–{to}: <b>{tot}</b> coperti, {d} sul 2025 · mese migliore {m}', {
			from: month(a, true),
			to: month(b, true),
			tot: nf.format(s26),
			d: pct.format(s26 / s25 - 1),
			m: month(best, true),
		});
	}

	function setCur(i, announce = true) {
		cur = i;
		gCur?.replaceChildren();
		if (i === null || !gCur) {
			tp.hide();
			if (announce) foot.innerHTML = summary();
			return;
		}
		const x = xf(i);
		S('line', { x1: x, x2: x, y1: MT, y2: yf(0) }, gCur);
		S('circle', { cx: x, cy: yf(TOT25[i]), r: 4, fill: 'var(--muted)' }, gCur);
		S('circle', { cx: x, cy: yf(TOT26[i]), r: 5, fill: 'var(--c1)' }, gCur);
		const d = pct.format(TOT26[i] / TOT25[i] - 1);
		tp.show(month(i, true), [['2026', nf.format(TOT26[i]), 'var(--c1)'], ['2025', nf.format(TOT25[i]), 'var(--muted)']], x, yf(TOT26[i]));
		foot.innerHTML = tr('ln.cur', '<b>{m}</b>: {v} coperti, {d} sul 2025', { m: month(i, true), v: nf.format(TOT26[i]), d });
	}

	const monthAt = (e) => {
		const r = svg.getBoundingClientRect();
		const i = Math.round(a + ((e.clientX - r.left - ML) / (W - ML - MR)) * (b - a));
		return Math.min(b, Math.max(a, i));
	};
	svg.addEventListener('pointermove', (e) => setCur(monthAt(e)));
	svg.addEventListener('pointerleave', () => document.activeElement !== plot && setCur(null));
	plot.addEventListener('focus', () => cur === null && setCur(b));
	plot.addEventListener('blur', () => setCur(null));
	plot.addEventListener('keydown', (e) => {
		const at = cur ?? b;
		const to = { ArrowLeft: Math.max(a, at - 1), ArrowRight: Math.min(b, at + 1), Home: a, End: b }[e.key];
		if (e.key === 'Escape') return setCur(null);
		if (to === undefined) return;
		e.preventDefault();
		setCur(to);
	});

	/* ---- striscia di selezione ---- */
	const sSvg = S('svg', { 'aria-hidden': 'true' }, strip);
	const dimL = S('rect', { class: 'gf-dim', y: 0 }, sSvg);
	const dimR = S('rect', { class: 'gf-dim', y: 0 }, sSvg);
	const sel = H('div', 'gf-sel', undefined, strip);
	sel.dataset.h = 'm';
	const mkHandle = (k, label) => {
		const el = H('div', 'gf-handle', undefined, strip);
		el.dataset.h = k;
		el.tabIndex = 0;
		el.setAttribute('role', 'slider');
		el.setAttribute('aria-label', label);
		el.setAttribute('aria-valuemin', 0);
		el.setAttribute('aria-valuemax', 11);
		return el;
	};
	const hA = mkHandle('a', tr('ln.from', 'Primo mese'));
	const hB = mkHandle('b', tr('ln.to', 'Ultimo mese'));
	const xo = (i) => ML + (i / 11) * (W - ML - MR);

	function drawStrip() {
		if (!W) return;
		const sh = strip.clientHeight;
		sSvg.setAttribute('viewBox', `0 0 ${W} ${sh}`);
		[...sSvg.querySelectorAll('.o')].forEach((e) => e.remove());
		const y = (v) => 4 + (sh - 8) - (v / yMax) * (sh - 8);
		const pts = TOT26.map((v, i) => [xo(i), y(v)]);
		const line = path(pts);
		S('path', { d: `${line}L${xo(11)} ${sh}L${xo(0)} ${sh}Z`, class: 'gf-area o' }, sSvg);
		S('path', { d: line, class: 'gf-line gf-line--main o', 'stroke-width': 1.5 }, sSvg);
		sSvg.append(dimL, dimR); // sopra al disegno
		placeStrip();
	}
	function placeStrip() {
		const sh = strip.clientHeight;
		dimL.setAttribute('x', ML - 6);
		dimL.setAttribute('width', Math.max(0, xo(a) - ML + 6));
		dimL.setAttribute('height', sh);
		dimR.setAttribute('x', xo(b));
		dimR.setAttribute('width', Math.max(0, W - MR + 6 - xo(b)));
		dimR.setAttribute('height', sh);
		sel.style.left = `${xo(a)}px`;
		sel.style.width = `${xo(b) - xo(a)}px`;
		hA.style.left = `${xo(a)}px`;
		hB.style.left = `${xo(b)}px`;
		for (const [el, v] of [[hA, a], [hB, b]]) {
			el.setAttribute('aria-valuenow', v);
			el.setAttribute('aria-valuetext', month(v, true));
		}
		presets.querySelectorAll('button').forEach((p) => p.setAttribute('aria-pressed', String(+p.dataset.a === a && +p.dataset.b === b)));
	}

	function setRange(na, nb, keepFocus) {
		a = na;
		b = nb;
		animate = false;
		placeStrip();
		render();
		if (cur === null) foot.innerHTML = summary();
		if (keepFocus) keepFocus.focus();
	}

	const idxAt = (e) => {
		const r = strip.getBoundingClientRect();
		return Math.min(11, Math.max(0, Math.round(((e.clientX - r.left - ML) / (W - ML - MR)) * 11)));
	};
	let drag = null;
	strip.addEventListener('pointerdown', (e) => {
		const k = e.target.closest('[data-h]')?.dataset.h;
		const i = idxAt(e);
		drag = k === 'm' ? { k, off: i - a, len: b - a } : { k: k || (Math.abs(i - a) < Math.abs(i - b) ? 'a' : 'b') };
		strip.setPointerCapture(e.pointerId);
		if (!k) move(e);
	});
	function move(e) {
		if (!drag) return;
		const i = idxAt(e);
		if (drag.k === 'a') setRange(Math.min(i, b - MIN), b);
		else if (drag.k === 'b') setRange(a, Math.max(i, a + MIN));
		else {
			const na = Math.min(11 - drag.len, Math.max(0, i - drag.off));
			setRange(na, na + drag.len);
		}
	}
	strip.addEventListener('pointermove', move);
	strip.addEventListener('pointerup', () => (drag = null));
	strip.addEventListener('pointercancel', () => (drag = null));
	for (const [el, k] of [[hA, 'a'], [hB, 'b']]) {
		el.addEventListener('keydown', (e) => {
			const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
			if (!d) return;
			e.preventDefault();
			if (k === 'a') setRange(Math.max(0, Math.min(a + d, b - MIN)), b);
			else setRange(a, Math.min(11, Math.max(b + d, a + MIN)));
		});
	}

	/* ---- periodi rapidi ---- */
	[
		[tr('ln.p.all', 'Tutto l’anno'), 0, 11],
		[tr('ln.p.h1', '1° semestre'), 0, 5],
		[tr('ln.p.h2', '2° semestre'), 6, 11],
		[tr('ln.p.sum', 'Estate'), 5, 7],
	].forEach(([label, from, to]) => {
		const btn = H('button', 'gf-chip', label, presets);
		btn.type = 'button';
		btn.dataset.a = from;
		btn.dataset.b = to;
		btn.addEventListener('click', () => setRange(from, to, btn));
	});

	fit(plot, (w) => {
		W = w;
		render();
		drawStrip();
	});
	foot.innerHTML = summary();
	live(root, () => {
		root.classList.add('is-live');
		animate = false; // dai ridisegni successivi niente più entrata
	});
})();
