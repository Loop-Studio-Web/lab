// Tab «Barre e ciambella»: barre impilate per mese + ciambella delle quote; il canale scelto si accende in entrambe.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const { tr, nf, pct0, month, TOT26, CH, BY_CH, S, H, niceMax, ticks, tip: mkTip, live, fit } = Gf;
	const $ = (s, r = document) => r.querySelector(s);

	const root = $('[data-root]');
	const plot = $('[data-plot]');
	const donutHost = $('[data-donut]');
	const list = $('[data-list]');
	const foot = $('[data-foot]');
	const ML = 40;
	const MT = 10;
	const MB = 24;
	const yMax = niceMax(Math.max(...TOT26));
	const totals = CH.map((_, c) => BY_CH.reduce((s, m) => s + m[c], 0));
	const grand = totals.reduce((s, v) => s + v, 0);

	let sel = null; // indice del canale scelto
	let at = null; // mese in evidenza (tastiera)
	let W = 0;

	const svg = S('svg', { role: 'img', 'aria-label': tr('br.svg', 'Coperti per mese e per canale, 2026') }, plot);
	const tp = mkTip(plot);
	const dSvg = S('svg', { viewBox: '0 0 160 160', role: 'img', 'aria-label': tr('br.dsvg', 'Quota di ogni canale sul totale') }, donutHost);
	dSvg.style.maxWidth = '10rem';
	dSvg.style.marginInline = 'auto';

	// 4 canali = 4 voci in elenco: pulsanti veri (il filtro funziona anche senza vedere i colori)
	const items = CH.map((c, i) => {
		const li = H('li', '', undefined, list);
		const btn = H('button', 'gf-chip', undefined, li);
		btn.type = 'button';
		btn.setAttribute('aria-pressed', 'false');
		const name = H('span', '', undefined, btn);
		H('i', '', undefined, name).style.background = c.color;
		name.append(c.name);
		H('small', '', `${nf.format(totals[i])} · ${pct0.format(totals[i] / grand)}`, btn);
		btn.addEventListener('click', () => choose(sel === i ? null : i));
		return btn;
	});

	// settore di ciambella con spazio di 2px fra le fette
	const arc = (cx, cy, r0, r1, a0, a1) => {
		const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
		const big = a1 - a0 > Math.PI ? 1 : 0;
		const [x0, y0] = p(r1, a0);
		const [x1, y1] = p(r1, a1);
		const [x2, y2] = p(r0, a1);
		const [x3, y3] = p(r0, a0);
		return `M${x0} ${y0}A${r1} ${r1} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${big} 0 ${x3} ${y3}Z`;
	};
	const slices = [];
	let angle = -Math.PI / 2;
	const gap = 0.03;
	CH.forEach((c, i) => {
		const span = (totals[i] / grand) * Math.PI * 2;
		const p = S('path', { d: arc(80, 80, 48, 74, angle + gap / 2, angle + span - gap / 2), fill: c.color, class: 'br-slice' }, dSvg);
		const mid = angle + span / 2;
		p.dataset.dx = (Math.cos(mid) * 5).toFixed(2);
		p.dataset.dy = (Math.sin(mid) * 5).toFixed(2);
		p.addEventListener('click', () => choose(sel === i ? null : i));
		p.addEventListener('pointermove', () => (foot.innerHTML = line(i)));
		p.addEventListener('pointerleave', () => (foot.innerHTML = line(sel)));
		slices.push(p);
		angle += span;
	});
	const center = S('text', { class: 'br-center', x: 80, y: 80 }, dSvg);
	const big = S('tspan', { class: 'big', x: 80, dy: '0.1em' }, center);
	const sm = S('tspan', { class: 'sm', x: 80, dy: '1.4em' }, center);

	function line(i) {
		if (i === null) return tr('br.all', '<b>Tutti i canali</b>: {v} coperti nell’anno', { v: nf.format(grand) });
		return tr('br.one', '<b>{c}</b>: {v} coperti, il {p} del totale', { c: CH[i].name, v: nf.format(totals[i]), p: pct0.format(totals[i] / grand) });
	}

	function choose(i) {
		sel = i;
		items.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
		slices.forEach((p, k) => {
			p.classList.toggle('is-dim', i !== null && k !== i);
			p.style.transform = k === i ? `translate(${p.dataset.dx}px, ${p.dataset.dy}px)` : '';
		});
		big.textContent = i === null ? nf.format(grand) : pct0.format(totals[i] / grand);
		sm.textContent = i === null ? tr('br.cov', 'coperti') : CH[i].name;
		svg.querySelectorAll('.br-seg').forEach((s) => s.classList.toggle('is-dim', i !== null && +s.dataset.c !== i));
		foot.innerHTML = line(i);
	}

	// rettangolo con i soli angoli in alto arrotondati (estremo del dato), ancorato alla base
	const topRound = (x, y, w, h, r) => {
		r = Math.min(r, h, w / 2);
		return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
	};

	function render() {
		if (!W) return;
		const h = Math.round(Math.min(250, Math.max(180, W * 0.62)));
		const iw = W - ML - 6;
		const ih = h - MT - MB;
		const y = (v) => MT + ih - (v / yMax) * ih;
		const slot = iw / 12;
		const bw = Math.min(26, slot * 0.64);
		svg.setAttribute('viewBox', `0 0 ${W} ${h}`);
		svg.setAttribute('height', h);
		svg.replaceChildren();
		for (const v of ticks(yMax)) {
			S('line', { x1: ML, x2: W - 6, y1: y(v), y2: y(v), class: v ? 'gf-grid' : 'gf-axis' }, svg);
			S('text', { x: ML - 8, y: y(v) + 4, 'text-anchor': 'end' }, svg).textContent = nf.format(v);
		}
		const step = slot < 30 ? 2 : 1;
		BY_CH.forEach((m, i) => {
			const x = ML + slot * i + (slot - bw) / 2;
			if (i % step === 0) S('text', { x: x + bw / 2, y: h - 6, 'text-anchor': 'middle' }, svg).textContent = month(i);
			let acc = 0;
			m.forEach((v, c) => {
				const y1 = y(acc + v);
				const hh = y(acc) - y1;
				const seg = S('path', { d: c === m.length - 1 ? topRound(x, y1, bw, hh, 4) : `M${x} ${y1}h${bw}v${hh}h${-bw}Z`, fill: CH[c].color, class: 'br-seg' }, svg);
				seg.dataset.c = c;
				seg.dataset.m = i;
				acc += v;
			});
			// zona di tocco larga quanto la colonna, più alta della barra
			const hit = S('rect', { x: ML + slot * i, y: MT, width: slot, height: ih, fill: 'transparent', class: 'br-hit' }, svg);
			hit.dataset.m = i;
		});
		svg.querySelectorAll('.br-seg').forEach((s) => s.classList.toggle('is-dim', sel !== null && +s.dataset.c !== sel));
		if (!svg.dataset.drawn) {
			// entrata: le barre salgono una volta, solo con movimento consentito
			svg.dataset.drawn = '1';
			if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
				svg.querySelectorAll('.br-seg').forEach((s, k) => {
					s.animate([{ transform: 'scaleY(0)', opacity: 0 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: 600, delay: Math.floor(k / 4) * 30, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' });
					s.style.transformBox = 'fill-box';
					s.style.transformOrigin = 'bottom';
				});
			}
		}
		slotW = slot;
		geom = { y, h, slot, iw };
		if (at !== null) showMonth(at);
	}
	let slotW = 0;
	let geom = null;

	function showMonth(i) {
		at = i;
		const m = BY_CH[i];
		const rows = CH.map((c, k) => [c.name, `${nf.format(m[k])} · ${pct0.format(m[k] / TOT26[i])}`, c.color]).filter((_, k) => sel === null || k === sel);
		if (sel === null) rows.push([tr('br.tot', 'Totale'), nf.format(TOT26[i])]);
		tp.show(month(i, true), rows, ML + slotW * i + slotW / 2, geom.y(TOT26[i]));
		foot.innerHTML = tr('br.month', '<b>{m}</b>: {v} coperti in tutto', { m: month(i, true), v: nf.format(TOT26[i]) });
	}
	const hideMonth = () => {
		at = null;
		tp.hide();
		foot.innerHTML = line(sel);
	};

	svg.addEventListener('pointermove', (e) => {
		const hit = e.target.closest('[data-m]');
		if (hit) showMonth(+hit.dataset.m);
	});
	svg.addEventListener('pointerleave', () => document.activeElement !== plot && hideMonth());
	svg.addEventListener('click', (e) => {
		const seg = e.target.closest('.br-seg');
		if (seg) choose(sel === +seg.dataset.c ? null : +seg.dataset.c);
	});
	plot.addEventListener('focus', () => at === null && showMonth(11));
	plot.addEventListener('blur', hideMonth);
	plot.addEventListener('keydown', (e) => {
		const cur = at ?? 11;
		const to = { ArrowLeft: Math.max(0, cur - 1), ArrowRight: Math.min(11, cur + 1), Home: 0, End: 11 }[e.key];
		if (e.key === 'Escape') return hideMonth();
		if (to === undefined) return;
		e.preventDefault();
		showMonth(to);
	});

	fit(plot, (w) => {
		W = w;
		render();
	});
	choose(null);
	live(root);
})();
