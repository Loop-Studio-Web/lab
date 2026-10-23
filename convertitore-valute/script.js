// Convertitore di valute: cartoline con i prezzi nella valuta scelta + convertitore con andamento.
// I tassi arrivano dal Worker (lab-cambio); se non risponde si usano tassi di esempio e la pagina lo dice.
import { API, VALUTE, VALUTE_PREZZI, DESTINAZIONI, TASSI_ESEMPIO } from './data.js';

const $ = (id) => document.getElementById(id);
const riduci = matchMedia('(prefers-reduced-motion: reduce)');
const stretto = matchMedia('(max-width: 46rem)');
const SVG = 'http://www.w3.org/2000/svg';

const stato = {
	tassi: null, // { date, rates } oppure null finché non arrivano
	esempio: false,
	mostra: 'EUR', // valuta dei prezzi sulle cartoline
	dest: DESTINAZIONI[0],
	da: 'EUR',
	a: DESTINAZIONI[0].valuta,
	manuale: false, // true dopo che l'utente ha toccato i selettori del convertitore
	giorni: 30,
	serie: null, // { punti: [[data, valore]] } oppure null
	idx: 0 // punto attivo del grafico
};

// ───────── Formati ─────────
const nomiValute = new Intl.DisplayNames(['it'], { type: 'currency' });
const fmtCache = new Map();
function soldi(valore, valuta, cifre) {
	const k = valuta + cifre;
	if (!fmtCache.has(k)) {
		fmtCache.set(
			k,
			new Intl.NumberFormat('it-IT', {
				style: 'currency',
				currency: valuta,
				useGrouping: 'always', // it-IT non mette il punto nei numeri a 4 cifre
				...(cifre === undefined ? {} : { minimumFractionDigits: cifre, maximumFractionDigits: cifre })
			})
		);
	}
	return fmtCache.get(k).format(valore);
}
const numero = (v, cifre) =>
	new Intl.NumberFormat('it-IT', { useGrouping: 'always', minimumFractionDigits: cifre, maximumFractionDigits: cifre }).format(v);
const dataBreve = (iso) =>
	new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
const dataLunga = (iso) =>
	new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
const dataNumerica = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('it-IT');

// Cifre da mostrare per un tasso: abbastanza da distinguere (0,0057 JPY→EUR vs 176,38 EUR→JPY).
function cifreTasso(v) {
	if (v >= 100) return 2;
	if (v >= 1) return 3;
	if (v >= 0.01) return 4;
	return 6;
}

function converti(importo, da, a) {
	const r = stato.tassi.rates;
	return (importo / r[da]) * r[a];
}
function leggiImporto() {
	let t = $('importo').value.trim().replace(/\s/g, '');
	if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.'); // 1.234,5 → 1234.5
	const n = Number(t);
	return Number.isFinite(n) && n >= 0 ? n : NaN;
}

// Ripete l'animazione d'ingresso su un elemento (le cifre che cambiano).
function tick(el, i = 0) {
	if (!el) return;
	el.style.setProperty('--i', i);
	el.classList.remove('tick');
	void el.offsetWidth;
	el.classList.add('tick');
}

// ───────── Cartoline ─────────
function costruisciCartoline() {
	const ul = $('cartoline');
	ul.innerHTML = '';
	DESTINAZIONI.forEach((d, i) => {
		const li = document.createElement('li');
		li.style.setProperty('--i', i);
		li.innerHTML = `
			<button type="button" class="cartolina" data-id="${d.id}" aria-pressed="${d === stato.dest}">
				<span class="cartolina__foto">
					<img src="${d.img}" alt="${d.alt}" width="1400" height="933" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async" style="object-position:${d.pos}" />
					<span class="bollino" aria-hidden="true">Nel cambio</span>
				</span>
				<span class="cartolina__corpo">
					<span class="cartolina__paese">${d.paese}</span>
					<span class="cartolina__nome">${d.nome}</span>
					<span class="cartolina__appunto">${d.appunto}</span>
					<span class="cartolina__stacco" aria-hidden="true"></span>
					<span class="cartolina__da">${d.notti} notti · da</span>
					<span class="cartolina__prezzo"><span class="cifra"></span></span>
					<span class="cartolina__orig"></span>
				</span>
			</button>`;
		ul.append(li);
	});
	ul.addEventListener('click', (e) => {
		const b = e.target.closest('.cartolina');
		if (!b) return;
		scegliDestinazione(DESTINAZIONI.find((d) => d.id === b.dataset.id));
	});
}

// Il prezzo in EUR si vede subito (non serve nessun tasso); le altre valute aspettano i tassi.
function aggiornaPrezzi(conAnimazione) {
	const cards = $('cartoline').querySelectorAll('.cartolina');
	cards.forEach((card, i) => {
		const d = DESTINAZIONI[i];
		const cifra = card.querySelector('.cifra');
		const orig = card.querySelector('.cartolina__orig');
		let testo;
		if (stato.mostra === 'EUR') {
			testo = soldi(d.prezzo, 'EUR', 0);
			orig.textContent = '';
		} else if (stato.tassi) {
			testo = soldi(converti(d.prezzo, 'EUR', stato.mostra), stato.mostra, 0);
			orig.textContent = `circa, da ${soldi(d.prezzo, 'EUR', 0)}`;
		} else {
			testo = '…';
			orig.textContent = '';
		}
		if (cifra.textContent !== testo) {
			cifra.textContent = testo;
			if (conAnimazione) tick(cifra, i);
		}
	});
}

function scegliDestinazione(d) {
	if (d === stato.dest && !stato.manuale) return;
	stato.dest = d;
	stato.manuale = false;
	$('cartoline').querySelectorAll('.cartolina').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === d.id)));
	$('cambio-dest').textContent = d.nome;
	collegaCambio();
	if (stretto.matches) $('cambio').scrollIntoView({ block: 'nearest', behavior: riduci.matches ? 'auto' : 'smooth' });
}

// Finché l'utente non tocca i selettori, "Da" segue la valuta dei prezzi e "A" quella della destinazione.
function collegaCambio() {
	const locale = stato.dest.valuta;
	stato.a = locale;
	stato.da = stato.mostra === locale ? 'EUR' : stato.mostra;
	$('da').value = stato.da;
	$('a').value = stato.a;
	aggiornaCambio(true);
	caricaSerie();
}

// ───────── Selettore valuta dei prezzi ─────────
function costruisciMostra() {
	const box = $('mostra');
	VALUTE_PREZZI.forEach((v) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.dataset.v = v;
		b.textContent = v;
		b.setAttribute('aria-pressed', String(v === stato.mostra));
		b.title = nomiValute.of(v);
		box.append(b);
	});
	box.addEventListener('click', (e) => {
		const b = e.target.closest('button');
		if (!b || b.dataset.v === stato.mostra) return;
		stato.mostra = b.dataset.v;
		box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
		aggiornaPrezzi(true);
		if (!stato.manuale) collegaCambio();
	});
}

// ───────── Convertitore ─────────
function costruisciSelettori() {
	for (const id of ['da', 'a']) {
		const s = $(id);
		VALUTE.forEach((v) => s.add(new Option(`${v} — ${nomiValute.of(v)}`, v)));
	}
	$('da').value = stato.da;
	$('a').value = stato.a;
	$('importo').addEventListener('input', () => aggiornaCambio(false));
	$('importo').addEventListener('focus', (e) => e.target.select());
	for (const id of ['da', 'a']) {
		$(id).addEventListener('change', () => {
			stato.da = $('da').value;
			stato.a = $('a').value;
			stato.manuale = true;
			aggiornaCambio(true);
			caricaSerie();
		});
	}
	$('scambia').addEventListener('click', () => {
		[stato.da, stato.a] = [stato.a, stato.da];
		$('da').value = stato.da;
		$('a').value = stato.a;
		stato.manuale = true;
		const b = $('scambia');
		b.classList.toggle('gira');
		aggiornaCambio(true);
		caricaSerie();
	});
	$('campi').addEventListener('submit', (e) => e.preventDefault());
}

function aggiornaCambio(conAnimazione) {
	const out = $('r-out');
	const importo = leggiImporto();
	const { da, a } = stato;
	$('r-in').textContent = Number.isNaN(importo) ? 'Scrivi un importo' : `${soldi(importo, da)} =`;
	$('g-titolo').textContent = `Andamento: 1 ${da} in ${a}`;
	if (!stato.tassi) {
		out.setAttribute('aria-busy', 'true');
		out.innerHTML = '<span class="cifra">…</span>';
		$('r-tasso').innerHTML = '&nbsp;';
		return;
	}
	out.removeAttribute('aria-busy');
	if (Number.isNaN(importo)) {
		out.innerHTML = '<span class="cifra">—</span>';
	} else {
		const testo = soldi(converti(importo, da, a), a);
		const span = document.createElement('span');
		span.className = 'cifra';
		span.textContent = testo;
		out.replaceChildren(span);
		if (conAnimazione) tick(span);
	}
	if (da === a) {
		$('r-tasso').textContent = 'Stessa valuta: scegline due diverse.';
	} else {
		const t1 = converti(1, da, a);
		const t2 = converti(1, a, da);
		$('r-tasso').textContent = `1 ${da} = ${numero(t1, cifreTasso(t1))} ${a} · 1 ${a} = ${numero(t2, cifreTasso(t2))} ${da}`;
	}
}

// ───────── Timbro con la data dei tassi ─────────
function timbro(tipo) {
	const t = $('timbro');
	t.dataset.stato = tipo;
	const [titolo, sotto] =
		tipo === 'vivo'
			? [`Tassi del ${dataNumerica(stato.tassi.date)}`, 'banche centrali · Frankfurter']
			: tipo === 'esempio'
				? [`Tassi di esempio`, `del ${dataNumerica(stato.tassi.date)} · servizio non raggiungibile`]
				: ['Tassi in arrivo', 'un attimo…'];
	t.querySelector('.timbro__t').textContent = titolo;
	t.querySelector('.timbro__s').textContent = sotto;
	if (tipo !== 'carico') {
		t.classList.remove('batti');
		void t.offsetWidth;
		t.classList.add('batti');
	}
}

async function caricaTassi() {
	try {
		const r = await fetch(`${API}/rates`, { signal: AbortSignal.timeout(5000) });
		if (!r.ok) throw new Error(String(r.status));
		const j = await r.json();
		if (!j.rates || !j.rates.EUR) throw new Error('forma inattesa');
		stato.tassi = { date: j.date, rates: j.rates };
		stato.esempio = false;
	} catch {
		stato.tassi = TASSI_ESEMPIO;
		stato.esempio = true;
	}
	timbro(stato.esempio ? 'esempio' : 'vivo');
	aggiornaPrezzi(true);
	aggiornaCambio(true);
	caricaSerie();
}

// ───────── Andamento ─────────
const cacheSerie = new Map();
let richiestaSerie = 0;

async function caricaSerie() {
	const { da, a, giorni } = stato;
	const tela = $('g-tela');
	const id = ++richiestaSerie;
	if (da === a) return vuoto('Scegli due valute diverse per vedere l’andamento.');
	if (!stato.tassi) return; // si riparte quando arrivano i tassi
	if (stato.esempio) return vuoto('Andamento non disponibile: il servizio dei tassi non risponde.');

	const k = `${da}-${a}-${giorni}`;
	let dati = cacheSerie.get(k);
	if (!dati) {
		tela.setAttribute('aria-busy', 'true');
		$('g-vuoto').hidden = true;
		try {
			const r = await fetch(`${API}/series?base=${da}&quote=${a}&days=${giorni}`, { signal: AbortSignal.timeout(7000) });
			if (!r.ok) throw new Error(String(r.status));
			dati = await r.json();
			if (!Array.isArray(dati.punti) || dati.punti.length < 2) throw new Error('serie vuota');
			cacheSerie.set(k, dati);
		} catch {
			if (id === richiestaSerie) {
				tela.removeAttribute('aria-busy');
				vuoto('Andamento non disponibile per ora. Il convertitore funziona lo stesso.');
			}
			return;
		}
	}
	if (id !== richiestaSerie) return; // nel frattempo l'utente ha cambiato coppia
	tela.removeAttribute('aria-busy');
	$('g-vuoto').hidden = true;
	stato.serie = dati;
	stato.idx = dati.punti.length - 1;
	disegna(true);
}

function vuoto(testo) {
	stato.serie = null;
	$('g-tela').removeAttribute('aria-busy');
	$('g-svg').replaceChildren();
	$('g-tip').hidden = true;
	$('g-vuoto').hidden = false;
	$('g-vuoto').textContent = testo;
	$('g-sintesi').innerHTML = '&nbsp;';
	$('g-tela').setAttribute('aria-valuetext', testo);
}

const M = { s: 10, d: 12, su: 14, giu: 24 }; // margini interni del grafico
let geo = null;

function el(nome, attr) {
	const e = document.createElementNS(SVG, nome);
	for (const k in attr) e.setAttribute(k, attr[k]);
	return e;
}

function disegna(animato) {
	const dati = stato.serie;
	if (!dati) return;
	const tela = $('g-tela');
	const svg = $('g-svg');
	const L = tela.clientWidth;
	const H = tela.clientHeight;
	if (!L || !H) return;
	const p = dati.punti;
	const vals = p.map((x) => x[1]);
	let min = Math.min(...vals);
	let max = Math.max(...vals);
	const margine = (max - min || max * 0.01) * 0.18;
	min -= margine;
	max += margine;
	const x = (i) => M.s + (i / (p.length - 1)) * (L - M.s - M.d);
	const y = (v) => M.su + (1 - (v - min) / (max - min)) * (H - M.su - M.giu);
	geo = { x, y, L, H };

	svg.setAttribute('viewBox', `0 0 ${L} ${H}`);
	svg.replaceChildren();
	const cifre = cifreTasso(vals[vals.length - 1]);
	for (const f of [0.15, 0.5, 0.85]) {
		const v = min + (max - min) * (1 - f);
		const yy = M.su + f * (H - M.su - M.giu);
		svg.append(el('line', { class: 'g-griglia', x1: M.s, x2: L - M.d, y1: yy, y2: yy }));
		const t = el('text', { class: 'g-etichetta', x: M.s + 2, y: yy - 4 });
		t.textContent = numero(v, cifre);
		svg.append(t);
	}
	const linea = p.map((q, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(q[1]).toFixed(1)}`).join('');
	svg.append(el('path', { class: 'g-area', d: `${linea}L${x(p.length - 1).toFixed(1)} ${H - M.giu}L${x(0).toFixed(1)} ${H - M.giu}Z` }));
	const tracciato = el('path', { class: 'g-linea', d: linea, pathLength: 1 });
	if (animato && !riduci.matches) tracciato.classList.add('disegna');
	svg.append(tracciato);
	const t0 = el('text', { class: 'g-etichetta', x: M.s, y: H - 6 });
	t0.textContent = dataBreve(p[0][0]);
	const t1 = el('text', { class: 'g-etichetta', x: L - M.d, y: H - 6, 'text-anchor': 'end' });
	t1.textContent = dataBreve(p[p.length - 1][0]);
	svg.append(t0, t1);
	svg.append(
		el('line', { class: 'g-guida', id: 'g-guida', y1: M.su, y2: H - M.giu, x1: 0, x2: 0 }),
		el('circle', { class: 'g-punto', id: 'g-punto', r: 5, cx: 0, cy: 0 })
	);
	punto(stato.idx, false);

	// Sintesi scritta dal codice, utile anche con lo screen reader.
	const prima = vals[0];
	const ultima = vals[vals.length - 1];
	const variazione = ((ultima - prima) / prima) * 100;
	const verso = Math.abs(variazione) < 0.05 ? 'è rimasto stabile' : variazione > 0 ? 'è salito' : 'è sceso';
	$('g-sintesi').textContent =
		`In ${stato.giorni} giorni 1 ${dati.base} ${verso}: da ${numero(prima, cifre)} a ${numero(ultima, cifre)} ${dati.quote}` +
		(Math.abs(variazione) < 0.05 ? '.' : ` (${variazione > 0 ? '+' : '−'}${numero(Math.abs(variazione), 1)}%).`);
	tela.setAttribute('aria-valuemin', 0);
	tela.setAttribute('aria-valuemax', p.length - 1);
}

// Sposta la guida e il pallino sul punto i e mostra il valore.
function punto(i, leggi = true) {
	const dati = stato.serie;
	if (!dati || !geo) return;
	const p = dati.punti;
	i = Math.max(0, Math.min(p.length - 1, i));
	stato.idx = i;
	const [d, v] = p[i];
	const xx = geo.x(i);
	const yy = geo.y(v);
	const guida = $('g-guida');
	const pallino = $('g-punto');
	guida.setAttribute('x1', xx);
	guida.setAttribute('x2', xx);
	pallino.setAttribute('cx', xx);
	pallino.setAttribute('cy', yy);
	const tip = $('g-tip');
	tip.hidden = false;
	tip.textContent = `${dataBreve(d)} · ${numero(v, cifreTasso(v))} ${dati.quote}`;
	const w = tip.offsetWidth;
	tip.style.left = `${Math.max(4, Math.min(geo.L - w - 4, xx - w / 2))}px`;
	const testo = `${dataLunga(d)}: 1 ${dati.base} = ${numero(v, cifreTasso(v))} ${dati.quote}`;
	const tela = $('g-tela');
	tela.setAttribute('aria-valuenow', i);
	tela.setAttribute('aria-valuetext', testo);
}

function indiceDa(e) {
	const r = $('g-tela').getBoundingClientRect();
	const f = (e.clientX - r.left - M.s) / (r.width - M.s - M.d);
	return Math.round(f * (stato.serie.punti.length - 1));
}

function collegaGrafico() {
	const tela = $('g-tela');
	tela.addEventListener('pointermove', (e) => stato.serie && punto(indiceDa(e)));
	tela.addEventListener('pointerdown', (e) => stato.serie && punto(indiceDa(e)));
	tela.addEventListener('keydown', (e) => {
		if (!stato.serie) return;
		const passo = e.shiftKey ? 5 : 1;
		const n = stato.serie.punti.length;
		const mappa = { ArrowLeft: stato.idx - passo, ArrowRight: stato.idx + passo, Home: 0, End: n - 1 };
		if (e.key in mappa) {
			e.preventDefault();
			punto(mappa[e.key]);
		}
	});
	$('periodo').addEventListener('click', (e) => {
		const b = e.target.closest('button');
		if (!b || Number(b.dataset.g) === stato.giorni) return;
		stato.giorni = Number(b.dataset.g);
		$('periodo').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
		caricaSerie();
	});
	new ResizeObserver(() => stato.serie && disegna(false)).observe(tela);
}

// ───────── Avvio ─────────
costruisciCartoline();
costruisciMostra();
costruisciSelettori();
collegaGrafico();
aggiornaPrezzi(false);
aggiornaCambio(false);
$('cambio-dest').textContent = stato.dest.nome;
caricaTassi();
