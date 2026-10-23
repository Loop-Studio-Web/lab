/* Report social. Legge DATI (data.js), calcola le statistiche del periodo scelto (7/30/90 giorni, confrontato con il
   periodo di pari lunghezza prima) e disegna tutto: numeri di testa con sparkline, grafico a linee con descrizione al
   passaggio/alla tastiera, contenuti migliori, barre per formato, mappa oraria e la "lettura" scritta dai numeri.
   Niente librerie: SVG e HTML generati qui. */
(function () {
	'use strict';

	const D = window.DATI;
	const $ = (id) => document.getElementById(id);
	const NS = 'http://www.w3.org/2000/svg';
	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	// 'always': l'italiano non mette il punto nei numeri a quattro cifre (5200), ma accanto a 12.400 stona
	const nf = new Intl.NumberFormat('it-IT', { useGrouping: 'always' });
	const nf1 = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const fData = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', timeZone: 'UTC' });
	const fGiorno = new Intl.DateTimeFormat('it-IT', { weekday: 'long', timeZone: 'UTC' });
	const fGiornoBreve = new Intl.DateTimeFormat('it-IT', { weekday: 'short', timeZone: 'UTC' });
	const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
	const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
	const somma = (arr, da, a) => {
		let s = 0;
		for (let i = da; i < a; i++) s += arr[i];
		return s;
	};

	/* Formati: nome, plurale e le particelle che servono alle frasi della lettura. */
	const FORMATI = {
		reel: { nome: 'Reel', sing: 'Reel', plur: 'Reel', art: 'I', di: 'dei', uno: 'uno' },
		carosello: { nome: 'Carosello', sing: 'carosello', plur: 'caroselli', art: 'I', di: 'dei', uno: 'uno' },
		foto: { nome: 'Foto', sing: 'foto', plur: 'foto', art: 'Le', di: 'delle', uno: 'una' },
		storia: { nome: 'Storia', sing: 'storia', plur: 'storie', art: 'Le', di: 'delle', uno: 'una' },
	};
	const ORDINE = ['reel', 'carosello', 'foto', 'storia'];
	const GIORNI_SETT = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
	const GIORNI_BREVI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

	const stato = { n: 30, vistaLinea: 'grafico', vistaMappa: 'grafico', metrica: 'reach' };
	let st = null; // statistiche del periodo corrente

	/* ───────── Calcoli ───────── */
	function calcola(n) {
		const e = D.giorni;
		const dentro = (c) => c.idx >= e - n;
		const prima = (c) => c.idx >= e - 2 * n && c.idx < e - n;
		const cc = D.contenuti.filter(dentro);
		const cp = D.contenuti.filter(prima);
		const tasso = (arr) => {
			const r = arr.reduce((s, c) => s + c.reach, 0);
			return r ? (arr.reduce((s, c) => s + c.interazioni, 0) / r) * 100 : 0;
		};
		return {
			n,
			inizio: D.date[e - n],
			fine: D.date[e - 1],
			serie: D.reach.slice(e - n),
			precedente: D.reach.slice(e - 2 * n, e - n),
			dateCur: D.date.slice(e - n),
			datePrec: D.date.slice(e - 2 * n, e - n),
			reach: somma(D.reach, e - n, e),
			reachPrec: somma(D.reach, e - 2 * n, e - n),
			follower: somma(D.nuoviFollower, e - n, e),
			followerPrec: somma(D.nuoviFollower, e - 2 * n, e - n),
			serieFollower: D.nuoviFollower.slice(e - n),
			cc,
			cp,
			tasso: tasso(cc),
			tassoPrec: tasso(cp),
			perGiorno: (() => {
				const m = {};
				cc.forEach((c) => (m[c.idx - (e - n)] = (m[c.idx - (e - n)] || []).concat(c)));
				return m;
			})(),
		};
	}
	const percento = (a, b) => (b ? (a / b - 1) * 100 : 0);

	/* ───────── Numeri di testa ───────── */
	function tween(el, a, b, fmt) {
		cancelAnimationFrame(el._raf);
		if (reduced() || a === b) {
			el.textContent = fmt(b);
			return;
		}
		const t0 = performance.now();
		const dur = 650;
		const passo = (t) => {
			const k = clamp((t - t0) / dur, 0, 1);
			const ease = 1 - Math.pow(1 - k, 4);
			el.textContent = fmt(a + (b - a) * ease);
			if (k < 1) el._raf = requestAnimationFrame(passo);
		};
		el._raf = requestAnimationFrame(passo);
	}
	function deltaHtml(el, pct, testo, unita) {
		const stabile = Math.abs(pct) < (unita === 'pp' ? 0.2 : 0.5);
		const su = pct >= 0;
		const segno = su ? '+' : '−';
		const num = unita === 'pp' ? nf1.format(Math.abs(pct)) : nf.format(Math.round(Math.abs(pct)));
		el.dataset.dir = stabile ? 'pari' : su ? 'su' : 'giu';
		el.innerHTML = stabile
			? '<span>Stabile</span> <small>' + testo + '</small>'
			: '<svg aria-hidden="true" focusable="false"><use href="#i-' + (su ? 'su' : 'giu') + '"/></svg><span><span class="sr-only">' + (su ? 'in aumento di ' : 'in calo di ') + '</span>' + segno + num + (unita === 'pp' ? ' punti' : unita === '%' ? '%' : '') + '</span> <small>' + testo + '</small>';
	}
	function spark(svg, dati) {
		// media mobile corta sui periodi lunghi, così la linea non è un elettrocardiogramma
		const k = dati.length >= 30 ? 3 : 1;
		const v = dati.map((_, i) => {
			let s = 0,
				c = 0;
			for (let j = Math.max(0, i - k + 1); j <= i; j++) (s += dati[j]), c++;
			return s / c;
		});
		const min = Math.min.apply(null, v),
			max = Math.max.apply(null, v);
		const W = 120,
			H = 36,
			p = 4;
		const pts = v.map((y, i) => [p + ((W - 2 * p) * i) / Math.max(1, v.length - 1), H - p - ((H - 2 * p) * (y - min)) / Math.max(1, max - min)]);
		svg.innerHTML = '';
		const path = document.createElementNS(NS, 'path');
		path.setAttribute('d', 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L'));
		const dot = document.createElementNS(NS, 'circle');
		const ult = pts[pts.length - 1];
		dot.setAttribute('cx', ult[0]);
		dot.setAttribute('cy', ult[1]);
		dot.setAttribute('r', 3);
		svg.append(path, dot);
		if (!reduced() && path.animate) {
			const len = path.getTotalLength();
			path.animate([{ strokeDasharray: len + ' ' + len, strokeDashoffset: len }, { strokeDasharray: len + ' ' + len, strokeDashoffset: 0 }], { duration: 800, easing: 'cubic-bezier(.23,1,.32,1)' });
		}
	}
	function plurale(n, f) {
		return n + ' ' + (n === 1 ? FORMATI[f].sing : FORMATI[f].plur);
	}
	function renderKpi(primo) {
		const rif = 'rispetto ai ' + st.n + ' giorni prima';
		const set = (id, valore, fmt, pct, unita, testo) => {
			const art = $(id);
			const v = art.querySelector('[data-valore]');
			tween(v, primo ? 0 : v._val || 0, valore, fmt);
			v._val = valore;
			deltaHtml(art.querySelector('[data-delta]'), pct, testo || rif, unita);
		};
		set('k-copertura', st.reach, (x) => nf.format(Math.round(x)), percento(st.reach, st.reachPrec), '%');
		set('k-follower', st.follower, (x) => nf.format(Math.round(x)), percento(st.follower, st.followerPrec), '%');
		set('k-interazione', st.tasso, (x) => nf1.format(x) + '%', st.tasso - st.tassoPrec, 'pp');
		set('k-contenuti', st.cc.length, (x) => String(Math.round(x)), st.cc.length - st.cp.length, '', 'rispetto ai ' + st.cp.length + ' dei ' + st.n + ' giorni prima');
		spark($('k-copertura').querySelector('.spark'), st.serie);
		spark($('k-follower').querySelector('.spark'), st.serieFollower);
		const conta = {};
		st.cc.forEach((c) => (conta[c.formato] = (conta[c.formato] || 0) + 1));
		$('k-contenuti').querySelector('[data-formati]').textContent = ORDINE.filter((f) => conta[f])
			.map((f) => plurale(conta[f], f))
			.join(' · ');
	}

	/* ───────── Grafico a linee ───────── */
	const plot = $('plot');
	const tipLinea = $('tip-linea');
	let L = null; // geometria dell'ultimo disegno
	let cursoreLinea = -1;

	function curva(xs, ys) {
		const n = xs.length;
		if (n < 2) return '';
		const dx = [],
			m = [],
			t = [];
		for (let i = 0; i < n - 1; i++) {
			dx[i] = xs[i + 1] - xs[i];
			m[i] = (ys[i + 1] - ys[i]) / dx[i];
		}
		t[0] = m[0];
		t[n - 1] = m[n - 2];
		for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
		for (let i = 0; i < n - 1; i++) {
			if (m[i] === 0) {
				t[i] = t[i + 1] = 0;
				continue;
			}
			const a = t[i] / m[i],
				b = t[i + 1] / m[i],
				s = a * a + b * b;
			if (s > 9) {
				const k = 3 / Math.sqrt(s);
				t[i] = k * a * m[i];
				t[i + 1] = k * b * m[i];
			}
		}
		const f = (v) => v.toFixed(1);
		let d = 'M' + f(xs[0]) + ' ' + f(ys[0]);
		for (let i = 0; i < n - 1; i++) {
			const h = dx[i] / 3;
			d += 'C' + f(xs[i] + h) + ' ' + f(ys[i] + t[i] * h) + ' ' + f(xs[i + 1] - h) + ' ' + f(ys[i + 1] - t[i + 1] * h) + ' ' + f(xs[i + 1]) + ' ' + f(ys[i + 1]);
		}
		return d;
	}
	function massimo(v) {
		const mag = Math.pow(10, Math.floor(Math.log10(v)));
		const passi = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
		for (const p of passi) if (p * mag >= v) return p * mag;
		return 10 * mag;
	}
	const fK = (v) => (v === 0 ? '0' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(v / 1000) + ' k');

	function renderLinea(anima) {
		const W = Math.round(plot.clientWidth);
		if (!W) return;
		const H = clamp(Math.round(W * 0.55), 230, 460);
		const M = { t: 14, r: 14, b: 32, l: 46 };
		const N = st.n;
		const pw = W - M.l - M.r,
			ph = H - M.t - M.b;
		const ymax = massimo(Math.max.apply(null, st.serie.concat(st.precedente)) * 1.06);
		const x = (i) => M.l + (N === 1 ? 0 : (pw * i) / (N - 1));
		const y = (v) => M.t + ph * (1 - v / ymax);
		const xs = st.serie.map((_, i) => x(i));
		const ysA = st.serie.map(y);
		const ysP = st.precedente.map(y);
		const base = M.t + ph;

		let s = '<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3b30" stop-opacity=".26"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></linearGradient></defs>';
		s += '<g class="grid">';
		const tacche = 4;
		for (let k = 0; k <= tacche; k++) {
			const yy = M.t + (ph * k) / tacche;
			s += '<line x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + yy + '" y2="' + yy + '"/>';
		}
		s += '</g><g class="ax">';
		for (let k = 0; k <= tacche; k++) {
			const v = (ymax * (tacche - k)) / tacche;
			s += '<text x="' + (M.l - 8) + '" y="' + (M.t + (ph * k) / tacche + 4) + '" text-anchor="end">' + fK(v) + '</text>';
		}
		const nEt = clamp(Math.floor(pw / 78), 2, N);
		for (let k = 0; k < nEt; k++) {
			const i = Math.round(((N - 1) * k) / (nEt - 1));
			const anc = k === 0 ? 'start' : k === nEt - 1 ? 'end' : 'middle';
			s += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="' + anc + '">' + fData.format(st.dateCur[i]) + '</text>';
		}
		s += '</g>';
		const dA = curva(xs, ysA);
		s += '<path class="area" d="' + dA + 'L' + xs[N - 1].toFixed(1) + ' ' + base + 'L' + xs[0].toFixed(1) + ' ' + base + 'Z" fill="url(#gArea)"/>';
		s += '<path class="l-prec" d="' + curva(xs, ysP) + '"/>';
		s += '<path class="l-attuale" d="' + dA + '"/>';
		s += '<g class="post-g">';
		Object.keys(st.perGiorno).forEach((i) => {
			s += '<circle class="post-pt" cx="' + x(+i).toFixed(1) + '" cy="' + base + '" r="4"/>';
		});
		s += '</g><g id="cursore" visibility="hidden"><line class="guida" y1="' + M.t + '" y2="' + base + '"/><circle class="punto-p" r="4.5"/><circle class="punto-a" r="5"/></g>';

		const svg = $('linea');
		svg.setAttribute('width', W);
		svg.setAttribute('height', H);
		svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
		svg.innerHTML = s;
		L = { W, H, M, x, y, pw, ph, N, base };
		cursoreLinea = -1;
		tipLinea.hidden = true;

		const iMax = st.serie.indexOf(Math.max.apply(null, st.serie));
		plot.setAttribute('aria-label', 'Grafico della copertura giornaliera negli ultimi ' + N + ' giorni, da ' + fData.format(st.dateCur[0]) + ' a ' + fData.format(st.dateCur[N - 1]) + ': picco di ' + nf.format(st.serie[iMax]) + ' persone il ' + fData.format(st.dateCur[iMax]) + '. La stessa serie è nella vista Tabella.');

		if (anima && !reduced() && svg.querySelector('.l-attuale').animate) {
			const p = svg.querySelector('.l-attuale');
			const len = p.getTotalLength();
			const ease = 'cubic-bezier(.23,1,.32,1)';
			p.animate([{ strokeDasharray: len + ' ' + len, strokeDashoffset: len }, { strokeDasharray: len + ' ' + len, strokeDashoffset: 0 }], { duration: 1000, easing: ease });
			svg.querySelector('.area').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 350, easing: 'ease-out', fill: 'backwards' });
			svg.querySelector('.l-prec').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
			svg.querySelector('.post-g').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 650, easing: 'ease-out', fill: 'backwards' });
		}
	}
	function mostraLinea(i, annuncia) {
		if (!L) return;
		i = clamp(i, 0, L.N - 1);
		cursoreLinea = i;
		const g = $('cursore');
		const cx = L.x(i);
		g.setAttribute('visibility', 'visible');
		const guida = g.querySelector('.guida');
		guida.setAttribute('x1', cx);
		guida.setAttribute('x2', cx);
		const pa = g.querySelector('.punto-a'),
			pp = g.querySelector('.punto-p');
		pa.setAttribute('cx', cx);
		pa.setAttribute('cy', L.y(st.serie[i]));
		pp.setAttribute('cx', cx);
		pp.setAttribute('cy', L.y(st.precedente[i]));

		const giorno = cap(fGiorno.format(st.dateCur[i])) + ' ' + fData.format(st.dateCur[i]);
		let h = '<div class="tip__data">' + giorno + '</div>';
		h += '<div class="tip__riga"><span>Copertura</span><b>' + nf.format(st.serie[i]) + '</b></div>';
		h += '<div class="tip__riga tip__riga--m"><span>Prima, ' + fData.format(st.datePrec[i]) + '</span><span>' + nf.format(st.precedente[i]) + '</span></div>';
		(st.perGiorno[i] || []).forEach((c) => {
			h += '<div class="tip__post"><svg aria-hidden="true" focusable="false"><use href="#f-' + c.formato + '"/></svg><span>' + FORMATI[c.formato].nome + ' · ' + c.titolo + '</span></div>';
		});
		tipLinea.innerHTML = h;
		tipLinea.hidden = false;
		const tw = tipLinea.offsetWidth,
			th = tipLinea.offsetHeight;
		let left = cx + 16;
		if (left + tw > L.W) left = cx - 16 - tw;
		left = clamp(left, 0, L.W - tw);
		const top = clamp(L.y(st.serie[i]) - th / 2, 0, L.H - th);
		tipLinea.style.left = left + 'px';
		tipLinea.style.top = top + 'px';
		if (annuncia) $('plot-annuncio').textContent = giorno + ': ' + nf.format(st.serie[i]) + ' persone raggiunte' + (st.perGiorno[i] ? ', ' + st.perGiorno[i].map((c) => FORMATI[c.formato].nome + ' ' + c.titolo).join(', ') : '') + '.';
	}
	function nascondiLinea() {
		const g = $('cursore');
		if (g) g.setAttribute('visibility', 'hidden');
		tipLinea.hidden = true;
		cursoreLinea = -1;
	}
	function indiceDa(e) {
		const r = plot.getBoundingClientRect();
		return Math.round(((e.clientX - r.left - L.M.l) / L.pw) * (L.N - 1));
	}
	plot.addEventListener('pointermove', (e) => L && mostraLinea(indiceDa(e)));
	plot.addEventListener('pointerdown', (e) => L && mostraLinea(indiceDa(e)));
	plot.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && nascondiLinea());
	plot.addEventListener('blur', nascondiLinea);
	plot.addEventListener('keydown', (e) => {
		if (!L) return;
		const c = cursoreLinea < 0 ? L.N - 1 : cursoreLinea;
		const mappa = { ArrowLeft: c - 1, ArrowRight: c + 1, ArrowUp: c - 7, ArrowDown: c + 7, Home: 0, End: L.N - 1 };
		if (e.key === 'Escape') return nascondiLinea();
		if (!(e.key in mappa)) return;
		e.preventDefault();
		mostraLinea(mappa[e.key], true);
	});
	document.addEventListener('pointerdown', (e) => {
		if (!plot.contains(e.target)) nascondiLinea();
	});

	function renderTabellaLinea() {
		const tb = $('tab-linea').querySelector('tbody');
		let h = '';
		for (let i = st.n - 1; i >= 0; i--) {
			const p = (st.perGiorno[i] || []).map((c) => FORMATI[c.formato].nome + ' · ' + c.titolo).join(', ');
			h += '<tr><th scope="row">' + cap(fGiornoBreve.format(st.dateCur[i])) + ' ' + fData.format(st.dateCur[i]) + '</th><td>' + nf.format(st.serie[i]) + '</td><td>' + nf.format(st.precedente[i]) + '</td><td>' + p + '</td></tr>';
		}
		tb.innerHTML = h;
	}

	/* ───────── Lettura scritta dai numeri ───────── */
	function slot(h) {
		return h < 12 ? 'mattina' : h < 18 ? 'pomeriggio' : 'sera';
	}
	function migliorSlot() {
		let best = { g: 0, b: 0, v: -1 };
		D.online.forEach((r, g) => r.forEach((v, b) => v > best.v && (best = { g, b, v })));
		return best;
	}
	function renderLettura() {
		const righe = [];
		// 1 andamento
		const pct = percento(st.reach, st.reachPrec);
		const verbo = Math.abs(pct) < 2 ? 'è rimasta stabile' : pct > 0 ? 'è salita del <strong>' + nf.format(Math.round(pct)) + '%</strong>' : 'è scesa del <strong>' + nf.format(Math.round(-pct)) + '%</strong>';
		righe.push('La copertura ' + verbo + ' rispetto ai ' + st.n + ' giorni precedenti: <strong>' + nf.format(st.reach) + '</strong> persone raggiunte contro ' + nf.format(st.reachPrec) + '.');
		// 2 contenuto migliore
		const top = st.cc.slice().sort((a, b) => b.reach - a.reach)[0];
		let mini = '';
		if (top) {
			const quota = Math.round((top.reach / st.reach) * 100);
			righe.push('Il contenuto migliore è «<strong>' + top.titolo + '</strong>» (' + FORMATI[top.formato].sing + ', ' + fData.format(D.date[top.idx]) + '): ' + nf.format(top.reach) + ' persone, il <strong>' + quota + '%</strong> della copertura del periodo.');
			mini = top.img || '';
		}
		// 3 formato
		const medie = {};
		st.cc.forEach((c) => {
			(medie[c.formato] = medie[c.formato] || []).push(c.reach);
		});
		const fm = Object.keys(medie)
			.map((f) => ({ f, m: medie[f].reduce((a, b) => a + b, 0) / medie[f].length }))
			.sort((a, b) => b.m - a.m);
		if (fm.length >= 2) {
			const a = fm[0],
				z = fm[fm.length - 1];
			const r = a.m / z.m;
			if (r >= 1.3) righe.push(FORMATI[a.f].art + ' <strong>' + FORMATI[a.f].plur + '</strong> raggiungono in media <strong>' + nf1.format(r) + ' volte</strong> più persone ' + FORMATI[z.f].di + ' ' + FORMATI[z.f].plur + '. Conviene farne ' + FORMATI[a.f].uno + ' in più a settimana.');
			else righe.push('I formati rendono in modo simile: nessuno stacca davvero gli altri in questo periodo.');
		}
		// 4 orario
		const b = migliorSlot();
		const h1 = b.b * 2;
		righe.push('I tuoi follower sono più online <strong>' + GIORNI_SETT[b.g] + ' ' + slot(h1 + 1) + ', tra le ' + h1 + ' e le ' + (h1 + 2) + '</strong>: è il momento migliore per pubblicare.');

		const ol = $('lettura');
		ol.innerHTML = righe.map((t, i) => '<li style="--i:' + i + '"><span>' + t + '</span>' + (i === 1 && mini ? '<img class="mini" src="' + mini + '" alt="" width="44" height="54" loading="lazy" decoding="async" />' : '') + '</li>').join('');
		ol.classList.remove('cambia');
		void ol.offsetWidth;
		ol.classList.add('cambia');
	}

	/* ───────── Contenuti migliori ───────── */
	function renderCarte() {
		const top = st.cc
			.filter((c) => c.img)
			.sort((a, b) => b.reach - a.reach)
			.slice(0, 5);
		$('migliori-sotto').textContent = 'In ordine di persone raggiunte · dal ' + fData.format(st.inizio) + ' al ' + fData.format(st.fine);
		let h = '';
		top.forEach((c, i) => {
			const f = FORMATI[c.formato];
			const metr = c.formato === 'storia' ? [['Risposte', c.commenti], ['Condivisioni', c.condivisi]] : [['Mi piace', c.like], ['Commenti', c.commenti], ['Salvataggi', c.salvati], ['Condivisioni', c.condivisi]];
			const dett = [['Interazione', nf1.format((c.interazioni / c.reach) * 100) + '%']].concat(metr.map((m) => [m[0], nf.format(m[1])]));
			h += '<li class="carta carta--' + (i + 1) + ' rv" style="--d:' + i * 70 + 'ms" tabindex="0" aria-label="Numero ' + (i + 1) + ': ' + c.titolo + ', ' + f.sing + ', ' + nf.format(c.reach) + ' persone raggiunte">';
			h += '<img src="' + c.img + '" alt="" width="720" height="1080" loading="lazy" decoding="async" style="object-position:' + c.pos + '" />';
			h += '<span class="carta__formato"><svg aria-hidden="true" focusable="false"><use href="#f-' + c.formato + '"/></svg>' + f.nome + '</span>';
			h += '<span class="carta__rango">N°' + (i + 1) + '</span>';
			h += '<div class="carta__testi"><h3 class="carta__titolo">' + c.titolo + '</h3>';
			h += '<p class="carta__meta">' + fData.format(D.date[c.idx]) + ' · <b>' + nf.format(c.reach) + '</b> raggiunti</p>';
			h += '<div class="carta__dett"><div class="carta__dett-in"><dl>' + dett.map((m) => '<div><dt>' + m[0] + '</dt><dd>' + m[1] + '</dd></div>').join('') + '</dl></div></div></div></li>';
		});
		if (top.length < 5) h += '<li class="carta carta--vuota" style="--sp:' + (5 - top.length) + '">Scegli 30 o 90 giorni per vedere gli altri contenuti.</li>';
		const ol = $('carte');
		ol.innerHTML = h;
		revealNuovi(ol);
	}

	/* ───────── Barre per formato ───────── */
	const barre = $('barre');
	function costruisciBarre() {
		barre.style.setProperty('--n', ORDINE.length);
		barre.innerHTML = ORDINE.map(
			(f) => '<li data-f="' + f + '"><span class="barre__nome"><svg aria-hidden="true" focusable="false"><use href="#f-' + f + '"/></svg>' + FORMATI[f].nome + ' <small></small></span><span class="barre__valore"></span><span class="barre__pista"><span class="barre__riempi"></span></span></li>'
		).join('');
	}
	function renderBarre() {
		const per = {};
		ORDINE.forEach((f) => (per[f] = { n: 0, reach: 0, inter: 0 }));
		st.cc.forEach((c) => {
			const p = per[c.formato];
			p.n++;
			p.reach += c.reach;
			p.inter += c.interazioni;
		});
		const val = (f) => (per[f].n ? (stato.metrica === 'reach' ? per[f].reach / per[f].n : (per[f].inter / per[f].reach) * 100) : -1);
		const ord = ORDINE.slice().sort((a, b) => val(b) - val(a));
		const max = Math.max(1, val(ord[0]));
		$('formati-sotto').textContent = stato.metrica === 'reach' ? 'Persone raggiunte in media per contenuto' : 'Interazioni ogni 100 persone raggiunte';
		ord.forEach((f, rank) => {
			const li = barre.querySelector('[data-f="' + f + '"]');
			const v = val(f);
			li.style.setProperty('--r', rank);
			li.style.setProperty('--w', v < 0 ? 0 : Math.max(2, (v / max) * 100).toFixed(1));
			li.classList.toggle('is-best', rank === 0 && v > 0);
			li.querySelector('small').textContent = per[f].n ? '· ' + per[f].n + (per[f].n === 1 ? ' contenuto' : ' contenuti') : '· nessun contenuto';
			li.querySelector('.barre__valore').textContent = v < 0 ? '—' : stato.metrica === 'reach' ? nf.format(Math.round(v)) : nf1.format(v) + '%';
		});
	}

	/* ───────── Mappa oraria ───────── */
	const mappa = $('mappa');
	const tipMappa = $('tip-mappa');
	let cur = null; // {g, b}
	function costruisciMappa() {
		const tutti = D.online.flat();
		const min = Math.min.apply(null, tutti),
			max = Math.max.apply(null, tutti);
		const best = migliorSlot();
		let h = '<span></span>';
		[0, 6, 12, 18].forEach((o) => (h += '<span class="mappa__ora">' + o + ' h</span>'));
		D.online.forEach((riga, g) => {
			h += '<span class="mappa__etichetta">' + GIORNI_BREVI[g] + '</span>';
			riga.forEach((v, b) => {
				const k = Math.pow((v - min) / (max - min), 1.35);
				h += '<div class="cella' + (g === best.g && b === best.b ? ' is-best' : '') + '" data-g="' + g + '" data-b="' + b + '" style="--v:' + k.toFixed(3) + '"></div>';
			});
		});
		$('mappa-griglia').innerHTML = h;
		$('scala-min').textContent = nf.format(min);
		$('scala-max').textContent = nf.format(max) + ' online';
		$('orari-best').innerHTML = 'Il momento migliore per pubblicare: <strong>' + GIORNI_SETT[best.g] + ' ' + slot(best.b * 2 + 1) + ', ' + best.b * 2 + '–' + (best.b * 2 + 2) + '</strong> (' + nf.format(best.v) + ' follower online)';

		// versione tabella
		let th = '<tr><th scope="col">Giorno</th>';
		for (let b = 0; b < 12; b++) th += '<th scope="col">' + b * 2 + '–' + (b * 2 + 2) + '</th>';
		$('tab-mappa').querySelector('thead').innerHTML = th + '</tr>';
		$('tab-mappa').querySelector('tbody').innerHTML = D.online.map((r, g) => '<tr><th scope="row">' + cap(GIORNI_SETT[g]) + '</th>' + r.map((v) => '<td>' + nf.format(v) + '</td>').join('') + '</tr>').join('');
	}
	function mostraMappa(g, b, annuncia) {
		g = clamp(g, 0, 6);
		b = clamp(b, 0, 11);
		const vecchia = mappa.querySelector('.is-cur');
		if (vecchia) vecchia.classList.remove('is-cur');
		const cella = mappa.querySelector('[data-g="' + g + '"][data-b="' + b + '"]');
		cella.classList.add('is-cur');
		cur = { g, b };
		const v = D.online[g][b];
		tipMappa.innerHTML = '<div class="tip__data">' + cap(GIORNI_SETT[g]) + ' · ' + b * 2 + '–' + (b * 2 + 2) + '</div><div class="tip__riga"><span>Follower online</span><b>' + nf.format(v) + '</b></div><div class="tip__riga tip__riga--m"><span>Sul totale</span><span>' + nf1.format((v / D.account.follower) * 100) + '%</span></div>';
		tipMappa.hidden = false;
		const mr = mappa.getBoundingClientRect(),
			cr = cella.getBoundingClientRect();
		const tw = tipMappa.offsetWidth,
			th = tipMappa.offsetHeight;
		const left = clamp(cr.left - mr.left + cr.width / 2 - tw / 2, 0, mr.width - tw);
		let top = cr.top - mr.top - th - 8;
		if (top < 0) top = cr.bottom - mr.top + 8;
		tipMappa.style.left = left + 'px';
		tipMappa.style.top = top + 'px';
		if (annuncia) $('mappa-annuncio').textContent = cap(GIORNI_SETT[g]) + ' ' + b * 2 + ' – ' + (b * 2 + 2) + ': ' + nf.format(v) + ' follower online.';
	}
	function nascondiMappa() {
		const vecchia = mappa.querySelector('.is-cur');
		if (vecchia) vecchia.classList.remove('is-cur');
		tipMappa.hidden = true;
		cur = null;
	}
	mappa.addEventListener('pointermove', (e) => {
		const c = e.target.closest && e.target.closest('.cella');
		if (c) mostraMappa(+c.dataset.g, +c.dataset.b);
	});
	mappa.addEventListener('pointerdown', (e) => {
		const c = e.target.closest && e.target.closest('.cella');
		if (c) mostraMappa(+c.dataset.g, +c.dataset.b);
	});
	mappa.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && nascondiMappa());
	mappa.addEventListener('blur', nascondiMappa);
	mappa.addEventListener('keydown', (e) => {
		const b0 = migliorSlot();
		const c = cur || { g: b0.g, b: b0.b };
		const m = { ArrowLeft: [c.g, c.b - 1], ArrowRight: [c.g, c.b + 1], ArrowUp: [c.g - 1, c.b], ArrowDown: [c.g + 1, c.b], Home: [c.g, 0], End: [c.g, 11] };
		if (e.key === 'Escape') return nascondiMappa();
		if (!(e.key in m)) return;
		e.preventDefault();
		if (!cur && !(e.key in { Home: 1, End: 1 })) return mostraMappa(c.g, c.b, true);
		mostraMappa(m[e.key][0], m[e.key][1], true);
	});
	document.addEventListener('pointerdown', (e) => {
		if (!mappa.contains(e.target)) nascondiMappa();
	});

	/* ───────── Selettori ───────── */
	function gruppo(sel, attr, fn) {
		const g = document.querySelector(sel);
		g.addEventListener('click', (e) => {
			const b = e.target.closest('button');
			if (!b || b.getAttribute('aria-pressed') === 'true') return;
			g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
			fn(b.dataset[attr]);
		});
	}
	function mostraVista(idVista, idTab, vista, ridisegna) {
		$(idVista).hidden = vista === 'tabella';
		$(idTab).hidden = vista !== 'tabella';
		if (vista !== 'tabella' && ridisegna) ridisegna();
	}
	gruppo('#periodo', 'n', (n) => {
		stato.n = +n;
		aggiorna(false);
	});
	gruppo('[data-vista="linea"]', 'v', (v) => {
		stato.vistaLinea = v;
		mostraVista('plot', 'tab-linea', v, () => renderLinea(true));
	});
	gruppo('[data-vista="orari"]', 'v', (v) => {
		stato.vistaMappa = v;
		mostraVista('mappa', 'tab-mappa', v);
		document.querySelector('#c-orari .scala').hidden = v === 'tabella';
	});
	gruppo('[data-vista="metrica"]', 'm', (m) => {
		stato.metrica = m;
		renderBarre();
	});

	/* ───────── Entrata dei blocchi ───────── */
	const io = 'IntersectionObserver' in window ? new IntersectionObserver((voci) => voci.forEach((v) => v.isIntersecting && (v.target.classList.add('is-in'), io.unobserve(v.target))), { threshold: 0.08 }) : null;
	function revealNuovi(radice) {
		radice.querySelectorAll('.rv:not(.is-in)').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));
	}

	/* ───────── Aggiornamento generale ───────── */
	function aggiorna(primo) {
		st = calcola(stato.n);
		$('periodo-testo').textContent = fData.format(st.inizio) + ' – ' + fData.format(st.fine) + ' 2026 · confronto con i ' + st.n + ' giorni precedenti';
		renderKpi(primo);
		if (stato.vistaLinea === 'grafico') renderLinea(true);
		renderTabellaLinea();
		renderLettura();
		renderCarte();
		renderBarre();
	}

	function avvia() {
		$('n-follower').textContent = nf.format(D.account.follower) + ' follower';
		[['k-copertura', 0], ['k-follower', 70], ['k-interazione', 140], ['k-contenuti', 210]].forEach(([id, d]) => {
			const el = $(id);
			el.classList.add('rv');
			el.style.setProperty('--d', d + 'ms');
		});
		['c-linea', 'c-formati', 'c-orari'].forEach((id) => $(id).classList.add('rv'));
		document.querySelector('.lettura').classList.add('rv');
		document.querySelector('.migliori').classList.add('rv');
		document.querySelector('.lettura').style.setProperty('--d', '120ms');
		costruisciBarre();
		costruisciMappa();
		aggiorna(true);
		revealNuovi(document);
		let w = plot.clientWidth,
			rid = 0;
		new ResizeObserver(() => {
			cancelAnimationFrame(rid);
			rid = requestAnimationFrame(() => {
				if (plot.clientWidth !== w && stato.vistaLinea === 'grafico') {
					w = plot.clientWidth;
					renderLinea(false);
				}
			});
		}).observe(plot);
	}

	try {
		avvia();
	} catch (err) {
		document.documentElement.classList.remove('js');
		console.error(err);
	}
})();
