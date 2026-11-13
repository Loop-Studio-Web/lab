// Tab «Quartiere»: mappa SVG generata da JS (seme fisso), punti = veri <button> in % sul riquadro, pan/zoom, elenco sincronizzato, «aperto ora».
(() => {
	const I = window.LabI18n;
	I?.apply();
	const $ = (s, r = document) => r.querySelector(s);
	const W = 800;
	const H = 524;

	// Luoghi di fantasia, adattati a ogni lingua (nomi nello stile del posto, non solo tradotti): id → [it, en, es].
	const NAMES = {
		forno: ["Forno Sant'Elia", 'St Elias Bakery', 'Panadería San Elías'],
		trattoria: ['Trattoria del Ponte', 'The Bridge Tavern', 'Mesón del Puente'],
		osteria: ['Osteria dei Tigli', 'The Linden Tree Pub', 'Taberna de los Tilos'],
		gelateria: ['Gelateria Luna', 'Moon Ice Cream Parlour', 'Heladería Luna'],
		lanterna: ['Caffè Lanterna', 'Lantern Café', 'Café Farol'],
		moka: ['Torrefazione Moka', 'Moka Roasters', 'Tostadero Moka'],
		bar: ['Bar del Viale', 'Avenue Coffee Bar', 'Bar de la Avenida'],
		te: ['Tè e Libri', 'Tea & Books', 'Té y Libros'],
		libreria: ['Libreria Cartaio', 'Paperseller Books', 'Librería Papelero'],
		fiorista: ['Fiorista Petalo', 'Petal Florist', 'Floristería Pétalo'],
		mercato: ['Mercato Coperto', 'Covered Market', 'Mercado Cubierto'],
		bottega: ['Bottega Filo', 'Thread Workshop', 'Taller del Hilo'],
		museo: ['Museo del Vetro', 'Glass Museum', 'Museo del Vidrio'],
		teatro: ['Teatro Piccolo', 'Little Theatre', 'Teatro Pequeño'],
		galleria: ['Galleria Nodo', 'Knot Gallery', 'Galería Nudo'],
		cinema: ['Cinema Aurora', 'Aurora Cinema', 'Cine Aurora'],
		farmacia: ['Farmacia Croce', 'Cross Pharmacy', 'Farmacia Cruz'],
		posta: ['Posta di Borgo', 'Lantern Post Office', 'Correos del Barrio'],
		bici: ['Bici Lanterna', 'Lantern Bike Hire', 'Bicis Farol'],
		info: ['Info Giardino', 'Garden Info Point', 'Info Jardín'],
	};
	// In Spagna si pranza e si cena più tardi: gli orari dei locali di cibo cambiano con la lingua.
	const ES_HOURS = { forno: '7-14;17-20', trattoria: '13.5-16;20.5-24', osteria: '13-16;20.5-24', gelateria: '12-24' };
	const LI = { it: 0, en: 1, es: 2 }[LabI18n.lang] ?? 0;

	// id|categoria|x|y|orari (ore decimali, fasce separate da ;)
	const PLACES = [
		['forno', 'cibo', 100, 70, '6.5-13;16-19.5'],
		['trattoria', 'cibo', 272, 180, '12-15;19-23'],
		['osteria', 'cibo', 444, 180, '12-14.5;19-23.5'],
		['gelateria', 'cibo', 730, 380, '12-23'],
		['lanterna', 'caffe', 100, 180, '7-20'],
		['moka', 'caffe', 272, 70, '7-13'],
		['bar', 'caffe', 480, 228, '6-24'],
		['te', 'caffe', 600, 380, '10-22'],
		['libreria', 'negozi', 272, 380, '9.5-19.5'],
		['fiorista', 'negozi', 100, 380, '8-13;15-19'],
		['mercato', 'negozi', 444, 380, '7-14'],
		['bottega', 'negozi', 730, 470, '10-19'],
		['museo', 'cultura', 444, 70, '10-18'],
		['teatro', 'cultura', 100, 470, '18-23'],
		['galleria', 'cultura', 272, 470, '11-19'],
		['cinema', 'cultura', 444, 470, '15-24'],
		['farmacia', 'servizi', 600, 470, '8.5-20'],
		['posta', 'servizi', 192, 228, '8-14'],
		['bici', 'servizi', 380, 228, '0-24'],
		['info', 'servizi', 620, 90, '9-17'],
	].map(([id, c, x, y, h]) => ({ id, n: NAMES[id][LI], c, x, y, h: ((LabI18n.lang === 'es' && ES_HOURS[id]) || h).split(';').map((r) => r.split('-').map(Number)) }));
	const CATS = { cibo: LabI18n.t('qu.c.cibo', 'Cibo'), caffe: LabI18n.t('qu.c.caffe', 'Caffè'), negozi: LabI18n.t('qu.c.negozi', 'Negozi'), cultura: LabI18n.t('qu.c.cultura', 'Cultura'), servizi: LabI18n.t('qu.c.servizi', 'Servizi') };

	// ——— mappa disegnata da JS (isolati, parco, fiume con ponti sulle strade)
	const rng = (a) => () => ((a = (a + 0x6d2b79f5) | 0), (((a = Math.imul(a ^ (a >>> 15), a | 1)), (a ^= a + Math.imul(a ^ (a >>> 7), a | 61)), ((a ^ (a >>> 14)) >>> 0) / 4294967296)));
	const BLOCKS = [[24,24,152,92],[24,136,152,86],[196,24,152,92],[196,136,152,86],[368,24,152,92],[368,136,152,86],[24,336,152,84],[24,440,152,60],[196,336,152,84],[196,440,152,60],[368,336,152,84],[368,440,152,60],[540,336,112,84],[672,336,104,84],[540,440,112,60],[672,440,104,60]];
	const RIVER = 'M-10 300 C150 250 300 350 450 290 S700 250 810 300';
	// y del fiume a una certa x (curva di Bézier a tratti, ricerca per bisezione)
	const riverY = (x) => {
		const segs = [[[-10,300],[150,250],[300,350],[450,290]], [[450,290],[600,230],[700,250],[810,300]]];
		const s = x < 450 ? segs[0] : segs[1];
		const B = (u, i) => { const m = 1 - u; return m*m*m*s[0][i] + 3*m*m*u*s[1][i] + 3*m*u*u*s[2][i] + u*u*u*s[3][i]; };
		let lo = 0, hi = 1;
		for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (B(mid, 0) < x) lo = mid; else hi = mid; }
		return B(lo, 1);
	};
	const mapSvg = () => {
		const r = rng(7);
		let trees = '';
		for (let i = 0; i < 40; i++) {
			const x = 556 + r() * 208, y = 40 + r() * 152;
			if (((x - 690) / 44) ** 2 + ((y - 150) / 28) ** 2 < 1) continue;
			trees += `<circle cx="${x | 0}" cy="${y | 0}" r="${(3 + r() * 3).toFixed(1)}" fill="#1b3a25"/>`;
		}
		const bridges = [186, 358, 530, 662].map((x) => { const y = riverY(x); return `<rect x="${x - 10}" y="222" width="20" height="114" fill="#161616"/><rect x="${x - 10}" y="${(y - 29).toFixed(0)}" width="20" height="58" rx="2" fill="#2e2e2e"/>`; }).join('');
		return (
			`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false"><rect width="${W}" height="${H}" fill="#0e0e0e"/>` +
			BLOCKS.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="#1c1c1c"/>`).join('') +
			`<rect x="540" y="24" width="236" height="182" rx="12" fill="#142419"/><path d="M552 190 C610 150 650 170 700 120 S760 60 766 40" fill="none" stroke="#1d3326" stroke-width="7" stroke-linecap="round"/><ellipse cx="690" cy="150" rx="34" ry="20" fill="#16303f"/>${trees}` +
			`<path d="${RIVER}" fill="none" stroke="#16303f" stroke-width="46"/><path d="${RIVER}" fill="none" stroke="#1e4357" stroke-width="1.5" stroke-dasharray="3 14" stroke-linecap="round"/>${bridges}` +
			`<path d="M24 228 H776" stroke="#242424" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" fill="none"/></svg>`
		);
	};

	// ——— orari
	const fmt = (h) => String(Math.floor(h)).padStart(2, '0') + ':' + (h % 1 ? '30' : '00');
	const status = (p, now) => {
		const always = p.h.length === 1 && p.h[0][0] === 0 && p.h[0][1] === 24;
		if (always) return { open: true, text: LabI18n.t('qu.always', 'Sempre aperto') };
		const cur = p.h.find(([a, b]) => now >= a && now < b);
		if (cur) return { open: true, text: LabI18n.t('qu.openUntil', 'Aperto fino alle {t}').replace('{t}', fmt(cur[1])) };
		const next = p.h.find(([a]) => a > now);
		if (next) return { open: false, text: LabI18n.t('qu.opensAt', 'Chiuso · apre alle {t}').replace('{t}', fmt(next[0])) };
		return { open: false, text: LabI18n.t('qu.opensTomorrow', 'Chiuso · apre domani alle {t}').replace('{t}', fmt(p.h[0][0])) };
	};
	const hoursText = (p) => p.h.map(([a, b]) => `${fmt(a)}–${fmt(b)}`).join(' · ');

	// ——— costruzione
	const map = $('[data-map]');
	const layer = $('[data-layer]');
	const list = $('[data-list]');
	const chips = $('[data-chips]');
	const sim = $('[data-sim]');
	const timeOut = $('[data-time]');
	const count = $('[data-count]');
	const openBtn = $('[data-open]');
	const shape = (c, closed) => `<span class="mh-shape${closed ? ' is-closed' : ''}" data-c="${c}" aria-hidden="true"></span>`;
	const nm = (p) => p.n;

	layer.innerHTML = mapSvg();
	layer.insertAdjacentHTML('beforeend', `<span class="mh-geo" style="left:50%;top:60.5%;--r:-4deg">${LabI18n.t('qu.river', 'Rio Lanterna')}</span><span class="mh-geo" style="left:82%;top:36%">${LabI18n.t('qu.park', 'Giardino dei Tigli')}</span>`);
	const tip = document.createElement('div');
	tip.className = 'mh-tip';
	tip.hidden = true;
	tip.setAttribute('role', 'status');

	chips.innerHTML = Object.keys(CATS).map((c) => `<button type="button" class="mh-chip" data-c="${c}" data-cat="${c}" aria-pressed="false">${shape(c)}${CATS[c]}</button>`).join('');
	const pins = new Map();
	const rows = new Map();
	for (const p of PLACES) {
		const pin = document.createElement('button');
		pin.type = 'button';
		pin.className = 'mh-pin';
		pin.dataset.c = p.c;
		pin.tabIndex = -1; // il percorso da tastiera è l'elenco
		pin.style.left = (p.x / W) * 100 + '%';
		pin.style.top = (p.y / H) * 100 + '%';
		pin.innerHTML = shape(p.c);
		pin.addEventListener('click', () => select(p.id, 'map'));
		pins.set(p.id, pin);
		layer.append(pin);
		const li = document.createElement('li');
		li.innerHTML = `<button type="button" class="mh-row" data-c="${p.c}">${shape(p.c)}<b>${nm(p)}</b><small></small></button>`;
		const row = li.firstChild;
		row.addEventListener('click', () => select(p.id, 'list'));
		row.addEventListener('pointerenter', () => pins.get(p.id).classList.add('is-hot'));
		row.addEventListener('pointerleave', () => pins.get(p.id).classList.remove('is-hot'));
		rows.set(p.id, { li, row });
		list.append(li);
	}
	layer.append(tip);
	const empty = document.createElement('li');
	empty.className = 'mh-empty';
	empty.hidden = true;
	empty.textContent = LabI18n.t('qu.none', 'Nessun luogo con questi filtri.');
	list.append(empty);

	// ——— stato: filtri, ora, selezione
	let now = 11;
	let onlyOpen = false;
	let sel = null;
	const cats = new Set();

	function refresh() {
		let n = 0;
		for (const p of PLACES) {
			const s = status(p, now);
			const show = (!cats.size || cats.has(p.c)) && (!onlyOpen || s.open);
			const { li, row } = rows.get(p.id);
			const sm = $('small', row);
			sm.textContent = `${CATS[p.c]} · ${s.text}`;
			sm.classList.toggle('is-open', s.open);
			$('.mh-shape', row).classList.toggle('is-closed', !s.open);
			li.hidden = !show;
			const pn = pins.get(p.id);
			pn.classList.toggle('is-off', !show);
			pn.tabIndex = -1;
			$('.mh-shape', pn).classList.toggle('is-closed', !s.open);
			pn.setAttribute('aria-label', `${p.n}, ${CATS[p.c]}, ${s.text}`);
			if (show) n++;
		}
		empty.hidden = n > 0;
		count.textContent = n === 1 ? LabI18n.t('qu.one', '1 luogo') : LabI18n.t('qu.many', '{n} luoghi').replace('{n}', n);
		timeOut.textContent = fmt(now);
		if (sel) {
			const p = PLACES.find((q) => q.id === sel);
			if (rows.get(sel).li.hidden) deselect();
			else showTip(p);
		}
	}

	function showTip(p) {
		const s = status(p, now);
		tip.innerHTML = `<b>${nm(p)}</b><span>${CATS[p.c]}</span><span class="${s.open ? 'is-open' : ''}">${s.text}</span><span>${hoursText(p)}</span>`;
		tip.style.left = (p.x / W) * 100 + '%';
		tip.style.top = (p.y / H) * 100 + '%';
		const x = p.x / W, y = p.y / H;
		tip.style.setProperty('--ox', x < 0.2 ? '-12%' : x > 0.8 ? '-88%' : '-50%');
		tip.style.setProperty('--oy', y < 0.38 ? '1.1rem' : 'calc(-100% - 1.1rem)');
		tip.hidden = false;
	}
	function select(id, from) {
		deselect(true);
		sel = id;
		const p = PLACES.find((q) => q.id === id);
		pins.get(id).classList.add('is-sel');
		const { row } = rows.get(id);
		row.setAttribute('aria-current', 'true');
		showTip(p);
		if (from === 'map') {
			const li = rows.get(id).li;
			const top = li.offsetTop - list.clientHeight / 2 + li.offsetHeight / 2;
			list.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
		}
		if (view.z > 1) centerOn(p.x / W, p.y / H);
	}
	function deselect(keepTip) {
		if (sel) {
			pins.get(sel).classList.remove('is-sel');
			rows.get(sel).row.removeAttribute('aria-current');
		}
		sel = null;
		if (!keepTip) tip.hidden = true;
	}

	chips.addEventListener('click', (e) => {
		const b = e.target.closest('[data-cat]');
		if (!b) return;
		const on = b.getAttribute('aria-pressed') !== 'true';
		b.setAttribute('aria-pressed', on);
		on ? cats.add(b.dataset.cat) : cats.delete(b.dataset.cat);
		refresh();
	});
	openBtn.addEventListener('click', () => {
		onlyOpen = !onlyOpen;
		openBtn.setAttribute('aria-pressed', onlyOpen);
		refresh();
	});
	sim.addEventListener('input', () => {
		now = sim.value / 2;
		refresh();
	});

	// ——— pan e zoom
	const view = { z: 1, x: 0, y: 0 };
	const ZMAX = 3.5;
	function apply() {
		const w = map.clientWidth, h = map.clientHeight;
		view.x = Math.min(0, Math.max(w * (1 - view.z), view.x));
		view.y = Math.min(0, Math.max(h * (1 - view.z), view.y));
		map.style.setProperty('--z', view.z);
		map.style.setProperty('--tx', view.x + 'px');
		map.style.setProperty('--ty', view.y + 'px');
		map.classList.toggle('is-zoomed', view.z > 1.001);
		$('[data-z=in]').disabled = view.z >= ZMAX - 0.01;
		$('[data-z=out]').disabled = view.z <= 1.001;
		$('[data-z=reset]').disabled = view.z <= 1.001 && !view.x && !view.y;
	}
	function zoomAt(f, cx = map.clientWidth / 2, cy = map.clientHeight / 2) {
		const z = Math.min(ZMAX, Math.max(1, view.z * f));
		view.x = cx - ((cx - view.x) * z) / view.z;
		view.y = cy - ((cy - view.y) * z) / view.z;
		view.z = z;
		apply();
	}
	function centerOn(fx, fy) {
		view.x = map.clientWidth / 2 - fx * map.clientWidth * view.z;
		view.y = map.clientHeight / 2 - fy * map.clientHeight * view.z;
		apply();
	}
	$('.mh-zoom').addEventListener('click', (e) => {
		const b = e.target.closest('[data-z]');
		if (!b) return;
		if (b.dataset.z === 'reset') { view.z = 1; view.x = view.y = 0; apply(); }
		else zoomAt(b.dataset.z === 'in' ? 1.6 : 1 / 1.6);
	});
	map.addEventListener('wheel', (e) => {
		if (!e.ctrlKey && !e.metaKey) return;
		e.preventDefault();
		const r = map.getBoundingClientRect();
		zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top);
	}, { passive: false });
	let drag = null;
	map.addEventListener('pointerdown', (e) => {
		if (e.button || e.target.closest('.mh-zoom,.mh-pin')) return;
		drag = { id: e.pointerId, x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
	});
	map.addEventListener('pointermove', (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
		if (!drag.moved && Math.hypot(dx, dy) < 4) return;
		if (!drag.moved) { drag.moved = true; map.setPointerCapture(e.pointerId); map.classList.add('is-drag'); }
		view.x = drag.vx + dx;
		view.y = drag.vy + dy;
		apply();
	});
	const end = (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		if (!drag.moved && e.type === 'pointerup') { deselect(); } // clic sullo sfondo: chiude il fumetto
		map.classList.remove('is-drag');
		drag = null;
	};
	map.addEventListener('pointerup', end);
	map.addEventListener('pointercancel', end);
	map.addEventListener('keydown', (e) => {
		if (e.target !== map) return;
		const step = 0.12;
		const k = e.key;
		if (k === 'ArrowLeft') view.x += map.clientWidth * step;
		else if (k === 'ArrowRight') view.x -= map.clientWidth * step;
		else if (k === 'ArrowUp') view.y += map.clientHeight * step;
		else if (k === 'ArrowDown') view.y -= map.clientHeight * step;
		else if (k === '+' || k === '=') return (e.preventDefault(), zoomAt(1.4));
		else if (k === '-') return (e.preventDefault(), zoomAt(1 / 1.4));
		else if (k === '0') { view.z = 1; view.x = view.y = 0; return (e.preventDefault(), apply()); }
		else if (k === 'Escape') return deselect();
		else return;
		e.preventDefault();
		apply();
	});
	addEventListener('resize', apply);

	refresh();
	apply();
})();
