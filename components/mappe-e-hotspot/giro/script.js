// Tab «Il giro del mondo»: mappa antica, tracciato che si disegna (stroke-dashoffset), marcatore ∞ che segue il percorso (getPointAtLength).
// Il viaggio di Magellano ed Elcano (1519-1522). Tre tratti: la mappa è a due emisferi, quindi Pacifico e Atlantico escono da un bordo e rientrano dall'altro.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const $ = (s, r = document) => r.querySelector(s);
	const NS = 'http://www.w3.org/2000/svg';
	const W = 1400;
	const H = 728;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const lang = document.documentElement.lang || 'it';

	// Tratti del percorso, in pixel della mappa 1400×728. Il terzo numero (se c'è) è l'indice della tappa che cade su quel punto.
	const RUNS = [
		[[808, 236, 0], [772, 262], [750, 308], [752, 348], [706, 374]],
		[[696, 384], [690, 432], [660, 476], [624, 494, 1], [580, 520], [528, 552], [497, 566, 2], [462, 588], [444, 594, 3], [372, 560], [262, 476], [150, 384], [90, 330], [62, 294, 4], [16, 302]],
		[[1374, 306], [1326, 342, 5], [1316, 376, 6], [1268, 426], [1180, 458], [1062, 484], [940, 508, 7], [876, 500], [818, 452], [776, 396], [752, 336], [762, 292], [788, 256], [806, 238, 8]],
	];
	// nome, data [anno, mese, giorno (0 = solo il mese)], frase. Date e fatti: il viaggio della flotta di Magellano.
	const STOPS = [
		{ n: 'Sanlúcar de Barrameda', d: [1519, 9, 20], t: LabI18n.t('gi.t0', 'Partono cinque navi e circa 270 uomini, al comando di Magellano.') },
		{ n: 'Rio de Janeiro', d: [1519, 12, 13], t: LabI18n.t('gi.t1', 'Due settimane di sosta per rifornirsi di cibo e acqua.') },
		{ n: 'San Julián', d: [1520, 3, 31], t: LabI18n.t('gi.t2', 'Un inverno rigido e un ammutinamento, soffocato da Magellano.') },
		{ n: LabI18n.t('gi.n3', 'Stretto di Magellano'), d: [1520, 10, 21], t: LabI18n.t('gi.t3', 'Cinque settimane tra fiordi e nebbie: la via per il Pacifico è aperta.') },
		{ n: 'Guam', d: [1521, 3, 6], t: LabI18n.t('gi.t4', 'Tre mesi e venti giorni di oceano senza terra: l’equipaggio è allo stremo.') },
		{ n: 'Cebu', d: [1521, 4, 7], t: LabI18n.t('gi.t5', 'Magellano muore a Mactan il 27 aprile, in uno scontro con gli abitanti dell’isola.') },
		{ n: 'Tidore', d: [1521, 11, 8], t: LabI18n.t('gi.t6', 'Le isole delle spezie, la meta del viaggio: si caricano i chiodi di garofano.') },
		{ n: LabI18n.t('gi.n7', 'Capo di Buona Speranza'), d: [1522, 5, 0], t: LabI18n.t('gi.t7', 'La Victoria, al comando di Elcano, doppia il Capo con l’equipaggio decimato.') },
		{ n: 'Sanlúcar de Barrameda', d: [1522, 9, 6], t: LabI18n.t('gi.t8', 'Tornano in 18 su una sola nave, la Victoria: è il primo giro del mondo.') },
	];
	const N = STOPS.length;
	const START = 3; // la pagina si apre con il tracciato già a metà (anche la miniatura mostra il rosso)

	const map = $('[data-map]');
	const svg = $('.gi-svg', map);
	const gGuide = $('[data-guide]', map);
	const gRoute = $('[data-route]', map);
	const ship = $('[data-ship]', map);
	const info = $('[data-info]');
	const count = $('[data-count]');
	const range = $('[data-range]');
	const ticks = $('[data-ticks]');
	const play = $('[data-play]');
	const fmt = (d) => new Intl.DateTimeFormat(lang, d[2] ? { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(d[0], d[1] - 1, d[2] || 1)));

	// curva liscia (Catmull-Rom → Bézier) per ogni coppia di punti consecutivi
	const seg = (pts, i) => {
		const p0 = pts[Math.max(0, i - 1)];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[Math.min(pts.length - 1, i + 2)];
		const f = (v) => v.toFixed(1);
		return `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
	};
	const mk = (tag, attrs, parent) => {
		const e = document.createElementNS(NS, tag);
		for (const k in attrs) e.setAttribute(k, attrs[k]);
		parent.appendChild(e);
		return e;
	};

	const runs = [];
	const stopLen = [];
	let L = 0;
	for (const pts of RUNS) {
		const segs = [];
		let d = `M${pts[0][0]} ${pts[0][1]}`;
		const run = { start: L, len: 0, halo: null, line: null };
		const tmp = mk('path', {}, svg);
		let acc = 0;
		if (pts[0][2] !== undefined) stopLen[pts[0][2]] = L;
		for (let i = 0; i < pts.length - 1; i++) {
			const s = seg(pts, i);
			d += s;
			tmp.setAttribute('d', `M${pts[i][0]} ${pts[i][1]}${s}`);
			acc += tmp.getTotalLength();
			if (pts[i + 1][2] !== undefined) stopLen[pts[i + 1][2]] = L + acc;
		}
		tmp.remove();
		run.len = acc;
		run.d = d;
		L += acc;
		runs.push(run);
		mk('path', { d }, gGuide);
		run.halo = mk('path', { d, class: 'gi-halo' }, gRoute);
		run.line = mk('path', { d, class: 'gi-line' }, gRoute);
		for (const el of [run.halo, run.line]) el.style.strokeDasharray = acc;
	}
	const stopFrac = stopLen.map((l) => l / L);

	// porti sulla mappa: veri <button> in % (l'ultima tappa coincide con la prima: si raggiunge col passo avanti)
	const ports = [];
	const portPts = {};
	for (const pts of RUNS) for (const p of pts) if (p[2] !== undefined && p[2] < N - 1) portPts[p[2]] = p;
	for (let i = 0; i < N - 1; i++) {
		const p = portPts[i];
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'gi-port';
		b.style.left = (p[0] / W) * 100 + '%';
		b.style.top = (p[1] / H) * 100 + '%';
		if (p[0] < 200) b.dataset.side = 'r';
		else if (p[0] > 1200) b.dataset.side = 'l';
		b.setAttribute('aria-label', `${LabI18n.t('gi.stop', 'Tappa {i}', { i: i + 1 })}: ${STOPS[i].n}`);
		b.innerHTML = `<i aria-hidden="true" data-name="${STOPS[i].n}">${i + 1}</i>`;
		b.addEventListener('click', () => go(i));
		map.appendChild(b);
		ports.push(b);
	}
	// tacche della barra a ogni tappa
	for (let i = 0; i < N; i++) {
		const t = document.createElement('i');
		t.style.setProperty('--f', stopFrac[i].toFixed(4));
		ticks.appendChild(t);
	}

	let p = 0; // avanzamento 0..1 lungo tutto il percorso
	let cur = -1;
	function render() {
		const pl = p * L;
		for (const r of runs) {
			const vis = Math.max(0, Math.min(r.len, pl - r.start));
			for (const el of [r.halo, r.line]) {
				el.style.strokeDashoffset = r.len - vis;
				el.style.opacity = vis > 0.5 ? 1 : 0;
			}
		}
		// il marcatore: sul tratto che contiene il punto (all'ultimo bordo resta nel tratto precedente)
		let r = runs[0];
		for (const x of runs) if (pl >= x.start) r = x;
		const pt = r.line.getPointAtLength(Math.max(0, Math.min(r.len, pl - r.start)));
		ship.setAttribute('x', pt.x - shipW / 2);
		ship.setAttribute('y', pt.y - shipW / 3.89);
		let idx = 0;
		for (let i = 0; i < N; i++) if (stopLen[i] <= pl + 0.5) idx = i;
		if (idx !== cur) show(idx);
		range.value = Math.round(p * 1000);
		range.style.setProperty('--p', p * 100 + '%');
		range.setAttribute('aria-valuetext', `${LabI18n.t('gi.stop', 'Tappa {i}', { i: idx + 1 })}: ${STOPS[idx].n}`);
	}
	function show(i) {
		cur = i;
		const s = STOPS[i];
		info.innerHTML = `<small>${fmt(s.d)}</small><b></b><p></p>`;
		$('b', info).textContent = s.n;
		$('p', info).textContent = s.t;
		count.textContent = LabI18n.t('gi.of', 'Tappa {i} di {n}', { i: i + 1, n: N });
		ports.forEach((b, k) => {
			b.classList.toggle('is-done', k < i);
			b.classList.toggle('is-cur', k === i);
			if (k === i) b.setAttribute('aria-current', 'step');
			else b.removeAttribute('aria-current');
		});
	}

	// movimento: un'unica animazione alla volta (tocco, passo, Riproduci); il cursore la interrompe
	let raf = 0;
	let timer = 0;
	let playing = false;
	const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
	function stop() {
		cancelAnimationFrame(raf);
		clearInterval(timer);
		raf = 0;
		timer = 0;
		if (playing) setPlaying(false);
	}
	function setPlaying(v) {
		playing = v;
		play.setAttribute('aria-pressed', v);
		$('span', play).textContent = v ? LabI18n.t('gi.pause', 'Pausa') : LabI18n.t('gi.play', 'Riproduci');
		play.classList.toggle('is-on', v);
	}
	function tween(to, ms, linear) {
		cancelAnimationFrame(raf);
		const from = p;
		if (reduce || ms <= 0 || from === to) {
			p = to;
			render();
			return Promise.resolve();
		}
		return new Promise((res) => {
			const t0 = performance.now();
			const tick = (now) => {
				const k = Math.min(1, (now - t0) / ms);
				p = from + (to - from) * (linear ? k : ease(k));
				render();
				if (k < 1) raf = requestAnimationFrame(tick);
				else res();
			};
			raf = requestAnimationFrame(tick);
		});
	}
	function go(i) {
		stop();
		i = Math.max(0, Math.min(N - 1, i));
		tween(stopFrac[i], 450 + 3200 * Math.abs(stopFrac[i] - p));
	}
	function startPlay() {
		if (playing) return stop();
		if (p >= 0.999) p = 0;
		setPlaying(true);
		if (reduce) {
			// niente moto continuo: una tappa ogni due secondi
			let i = stopFrac.findIndex((f) => f > p + 1e-6);
			if (i < 0) i = 0;
			const step = () => {
				p = stopFrac[i];
				render();
				if (++i >= N) stop();
			};
			step();
			timer = setInterval(step, 2000);
			return;
		}
		tween(1, (1 - p) * 20000, true).then(() => {
			if (playing && p >= 0.999) setPlaying(false);
		});
	}

	// size dipendente dalla larghezza: tratto e marcatore restano leggibili anche a telefono
	let shipW = 60;
	function size() {
		const k = W / (map.clientWidth || W);
		svg.style.setProperty('--k', k.toFixed(3));
		shipW = 46 * k;
		ship.setAttribute('width', shipW);
		ship.setAttribute('height', shipW / 1.945);
		gGuide.style.strokeDasharray = `${1.2 * k} ${5 * k}`;
		render();
	}
	new ResizeObserver(size).observe(map);

	range.addEventListener('input', () => {
		stop();
		p = range.value / 1000;
		render();
	});
	document.addEventListener('click', (e) => {
		const s = e.target.closest('[data-step]');
		if (s) go(cur + +s.dataset.step);
		else if (e.target.closest('[data-play]')) startPlay();
	});
	map.setAttribute('aria-label', LabI18n.t('gi.map', 'Mappa del mondo del Seicento con il viaggio di Magellano: i numeri sono le tappe'));

	p = stopFrac[START];
	size();
})();
