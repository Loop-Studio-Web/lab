// FAQ con ricerca (Pedivella): ricerca che perdona gli errori e conosce i sinonimi, testo trovato evidenziato,
// filtri per tema, link diretto a ogni risposta. Niente librerie.
import { TEMI, DOMANDE, PIU_CERCATE, PAROLE_VUOTE } from './data.js';

const $ = (id) => document.getElementById(id);
const riduci = matchMedia('(prefers-reduced-motion: reduce)');
const evidenzia = typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';

// ───────── Parole: normalizzazione e confronto ─────────
// "Èbike!" e "ebike" devono essere la stessa cosa: minuscole, senza accenti, solo lettere e numeri.
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
const PAROLA = /[\p{L}\p{N}]+/gu;
const paroleDi = (s) => norm(s).match(PAROLA) ?? [];
const uniche = (lista) => [...new Set(lista)];

// Distanza tra due parole (inserimento, cancellazione, sostituzione, scambio di due lettere), con taglio.
function distanza(a, b, max) {
	if (Math.abs(a.length - b.length) > max) return max + 1;
	const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
	for (let j = 1; j <= b.length; j++) d[0][j] = j;
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
		}
	}
	return d[a.length][b.length];
}

// Quanto una parola scritta dall'utente (t) assomiglia a una parola del testo (w):
// 3 uguale · 2 inizia così (si sta ancora scrivendo) · 1 con un errore di battitura · 0 niente.
function grado(t, w) {
	if (t === w) return 3;
	if (t.length >= 2 && w.startsWith(t)) return 2;
	if (t.length >= 4 && t[0] === w[0]) {
		const max = t.length >= 8 ? 2 : 1;
		if (distanza(t, w, max) <= max) return 1;
	}
	return 0;
}

// Peso di un colpo: il titolo conta più delle parole affini, che contano più del corpo della risposta.
const PESI = { titolo: [0, 5, 8, 10], affini: [0, 3, 5, 7], corpo: [0, 1, 2, 3] };

// ───────── Indice ─────────
const indice = DOMANDE.map((d, n) => {
	const corpo = [...d.risposta, ...(d.voci ?? []).map(([voce]) => voce)].join(' ');
	return {
		...d,
		n,
		numero: String(n + 1).padStart(2, '0'),
		parole: {
			titolo: uniche(paroleDi(d.titolo)),
			affini: uniche(paroleDi(d.affini ?? '')),
			corpo: uniche(paroleDi(corpo))
		}
	};
});
const nomeTema = Object.fromEntries(TEMI.map((t) => [t.id, t.nome]));

// Punteggio di una domanda per l'elenco di parole cercate: una per una, la migliore tra titolo, affini e corpo.
function valuta(d, token) {
	let punti = 0;
	let dove = null;
	for (const parte of ['titolo', 'affini', 'corpo']) {
		for (const w of d.parole[parte]) {
			const g = grado(token, w);
			if (g && PESI[parte][g] > punti) {
				punti = PESI[parte][g];
				dove = parte;
			}
		}
	}
	return { punti, dove };
}

function cerca(q) {
	let token = paroleDi(q);
	const utili = token.filter((t) => !PAROLE_VUOTE.has(t));
	if (utili.length) token = utili;
	token = uniche(token);
	if (!token.length) return { token, elenco: indice.map((d) => ({ d, punti: 0 })), parziale: false };

	const righe = indice.map((d) => {
		const per = token.map((t) => valuta(d, t));
		return { d, per, punti: per.reduce((s, p) => s + p.punti, 0), tutte: per.every((p) => p.punti > 0) };
	});
	const tutte = righe.filter((r) => r.tutte);
	if (tutte.length || token.length === 1) return { token, elenco: ordina(tutte), parziale: false };
	// Nessuna risposta contiene tutte le parole: si mostrano quelle che ne contengono almeno una, dichiarandolo.
	return { token, elenco: ordina(righe.filter((r) => r.punti > 0)), parziale: true };
}
const ordina = (righe) => [...righe].sort((a, b) => b.punti - a.punti || a.d.n - b.d.n);

// ───────── Stato e indirizzo ─────────
const stato = { q: '', tema: 'tutti', r: '' };

function leggiHash() {
	const p = new URLSearchParams(location.hash.slice(1));
	stato.q = p.get('q') ?? '';
	stato.tema = TEMI.some((t) => t.id === p.get('t')) ? p.get('t') : 'tutti';
	stato.r = indice.some((d) => d.id === p.get('r')) ? p.get('r') : '';
}
function hashDi({ q, tema, r }) {
	const p = new URLSearchParams();
	if (q.trim()) p.set('q', q.trim());
	if (tema !== 'tutti') p.set('t', tema);
	if (r) p.set('r', r);
	const s = p.toString();
	return s ? '#' + s : '';
}
function scriviHash() {
	history.replaceState(null, '', location.pathname + location.search + hashDi(stato));
}

// ───────── Costruzione della pagina ─────────
const lista = $('lista');
const campo = $('cerca');
const voci = new Map(); // id → { li, det, estratto, ... }

function costruisci() {
	const frag = document.createDocumentFragment();
	for (const d of indice) {
		const li = document.createElement('li');
		li.className = 'voce';
		const det = document.createElement('details');
		det.className = 'cart';
		det.id = 'd-' + d.id;

		const sum = document.createElement('summary');
		sum.className = 'cart__sum';
		sum.innerHTML =
			'<span class="cart__stub" aria-hidden="true"><span class="cart__foro"></span><span class="cart__num"></span></span>' +
			'<span class="cart__corpo"><span class="cart__tema"></span><span class="cart__titolo"></span>' +
			'<span class="cart__estratto" aria-hidden="true" hidden></span></span>' +
			'<span class="cart__segno" aria-hidden="true"></span>';
		sum.querySelector('.cart__num').textContent = d.numero;
		sum.querySelector('.cart__tema').textContent = nomeTema[d.tema];
		sum.querySelector('.cart__titolo').textContent = d.titolo;

		const ris = document.createElement('div');
		ris.className = 'cart__risposta';
		for (const par of d.risposta) {
			const p = document.createElement('p');
			p.textContent = par;
			ris.append(p);
		}
		if (d.voci) {
			const dl = document.createElement('dl');
			dl.className = 'listino';
			for (const [voce, prezzo] of d.voci) {
				const riga = document.createElement('div');
				const dt = document.createElement('dt');
				const dd = document.createElement('dd');
				dt.textContent = voce;
				dd.textContent = prezzo;
				riga.append(dt, dd);
				dl.append(riga);
			}
			ris.append(dl);
		}
		const azioni = document.createElement('div');
		azioni.className = 'cart__azioni';
		const copia = document.createElement('button');
		copia.type = 'button';
		copia.className = 'copia';
		copia.innerHTML =
			'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
			'<span class="copia__testo">Copia il link a questa risposta</span>';
		copia.addEventListener('click', () => copiaLink(d, copia));
		azioni.append(copia);
		ris.append(azioni);

		det.append(sum, ris);
		li.append(det);
		frag.append(li);

		const v = { d, li, det, estratto: sum.querySelector('.cart__estratto'), visibile: true, auto: false };
		voci.set(d.id, v);
		det.addEventListener('toggle', () => aperturaCambiata(v));
		sum.addEventListener('keydown', (e) => tastiSommario(e, sum));
	}
	lista.append(frag);

	// Temi: pulsanti con aria-pressed (si sceglie un filtro, non si apre un pannello).
	const elencoTemi = $('temi');
	for (const t of [{ id: 'tutti', nome: 'Tutte le domande' }, ...TEMI]) {
		const li = document.createElement('li');
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'tema';
		b.dataset.tema = t.id;
		b.innerHTML = '<span class="tema__nome"></span><span class="tema__n"></span>';
		b.querySelector('.tema__nome').textContent = t.nome;
		b.addEventListener('click', () => {
			stato.tema = t.id;
			aggiorna();
		});
		li.append(b);
		elencoTemi.append(li);
	}

	// Ricerche suggerite.
	const sug = $('suggerite');
	for (const s of PIU_CERCATE) sug.append(chipRicerca(s));

	// Dati strutturati per i motori di ricerca (domande e risposte).
	const ld = document.createElement('script');
	ld.type = 'application/ld+json';
	ld.textContent = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: indice.map((d) => ({
			'@type': 'Question',
			name: d.titolo,
			acceptedAnswer: {
				'@type': 'Answer',
				text: [...d.risposta, ...(d.voci ?? []).map(([voce, prezzo]) => `${voce}: ${prezzo}.`)].join(' ')
			}
		}))
	});
	document.head.append(ld);
}

function chipRicerca(testo) {
	const b = document.createElement('button');
	b.type = 'button';
	b.className = 'chip';
	b.textContent = testo;
	b.addEventListener('click', () => {
		campo.value = testo;
		stato.q = testo;
		stato.tema = 'tutti';
		aggiorna();
		campo.focus();
	});
	return b;
}

// ───────── Disegno dello stato ─────────
let ultimoAnnuncio = 0;
let primoDisegno = true;

function aggiorna() {
	const q = stato.q.trim();
	const trovato = cerca(q);
	const perTema = (id) => trovato.elenco.filter((r) => id === 'tutti' || r.d.tema === id).length;
	const elenco = trovato.elenco.filter((r) => stato.tema === 'tutti' || r.d.tema === stato.tema);

	// Conteggi sui temi e tema attivo.
	for (const b of document.querySelectorAll('.tema')) {
		const attivo = b.dataset.tema === stato.tema;
		b.setAttribute('aria-pressed', String(attivo));
		const n = perTema(b.dataset.tema);
		b.querySelector('.tema__n').textContent = n;
		b.querySelector('.tema__n').dataset.vuoto = n === 0;
		b.setAttribute('aria-label', `${b.querySelector('.tema__nome').textContent}, ${n} ${n === 1 ? 'domanda' : 'domande'}`);
	}

	// Visibili, nell'ordine di rilevanza. Chi compare ora (prima nascosto) entra con una piccola animazione.
	const visibili = new Set(elenco.map((r) => r.d.id));
	if (stato.r && !visibili.has(stato.r)) stato.r = ''; // un link a una risposta che il filtro nasconde non ha senso
	let entrata = 0;
	for (const [id, v] of voci) {
		const ora = visibili.has(id);
		if (ora && (!v.visibile || primoDisegno) && !riduci.matches) {
			v.li.style.setProperty('--i', Math.min(entrata++, 8));
			v.li.classList.remove('entra');
			void v.li.offsetWidth;
			v.li.classList.add('entra');
		}
		v.visibile = ora;
		v.li.hidden = !ora;
	}
	const ordine = elenco.map((r) => voci.get(r.d.id).li);
	const attuale = [...lista.children].filter((li) => !li.hidden);
	if (ordine.some((li, i) => li !== attuale[i])) lista.prepend(...ordine);

	// Estratto sotto la domanda: dove la parola è stata trovata, se non è nel titolo.
	const riga = new Map(elenco.map((r) => [r.d.id, r]));
	for (const [id, v] of voci) {
		const r = riga.get(id);
		const testo = q && r?.per ? estratto(r, trovato.token) : '';
		v.estratto.hidden = !testo;
		v.estratto.textContent = testo;
	}

	// Una sola risposta: si apre da sola (e si richiude se la ricerca cambia, a meno che non l'abbia aperta l'utente).
	for (const [id, v] of voci) {
		const unica = q && elenco.length === 1 && visibili.has(id) && !trovato.parziale;
		if (unica && !v.det.open) impostaAperta(v, true, true);
		else if (!unica && v.auto && v.det.open) impostaAperta(v, false, true);
		if (!unica) v.auto = false;
	}

	testiDiStato(q, trovato, elenco, perTema('tutti'));
	evidenziaTesto(trovato.token, q);
	$('cerca-pulisci').hidden = !campo.value;
	$('cerca-tasto').hidden = Boolean(campo.value);
	if (!applicandoHash) scriviHash();
	primoDisegno = false;
}

// Frase che dice perché la risposta è stata trovata, quando non basta il titolo: un pezzo della risposta con la
// parola dentro. Se la parola cercata è solo un sinonimo (non compare nel testo) si mostra l'inizio della risposta,
// che parla con le parole giuste ("gomma" → "la foratura si ripara mentre aspetti").
function estratto({ d, per }, token) {
	const fuori = token.filter((_, i) => per[i].punti > 0 && per[i].dove !== 'titolo');
	if (!fuori.length) return '';
	const testo = d.risposta.join(' ');
	const m = primaCorrispondenza(testo, fuori);
	if (!m) {
		const fine = testo.search(/[.!?](\s|$)/);
		return fine > 0 && fine < 150 ? testo.slice(0, fine + 1) : testo.slice(0, 130).replace(/\s\S*$/, '') + ' …';
	}
	const da = Math.max(0, m.inizio - 55);
	const a = Math.min(testo.length, m.fine + 85);
	const prima = da > 0 ? testo.slice(da, m.inizio).replace(/^\S*\s/, '') : testo.slice(0, m.inizio);
	const dopo = a < testo.length ? testo.slice(m.fine, a).replace(/\s\S*$/, '') : testo.slice(m.fine, a);
	return (da > 0 ? '… ' : '') + prima + testo.slice(m.inizio, m.fine) + dopo + (a < testo.length ? ' …' : '');
}

function primaCorrispondenza(testo, token) {
	for (const m of testo.matchAll(PAROLA)) {
		const w = norm(m[0]);
		if (token.some((t) => grado(t, w) > 0)) return { inizio: m.index, fine: m.index + m[0].length };
	}
	return null;
}

function testiDiStato(q, trovato, elenco, totaleTema) {
	const n = elenco.length;
	const nomi = stato.tema === 'tutti' ? '' : ` · ${nomeTema[stato.tema]}`;
	const quante = `${n} ${n === 1 ? 'risposta' : 'risposte'}`;
	const visibile = q ? `${quante} per «${q}»${nomi}` : `${n} ${n === 1 ? 'domanda' : 'domande'}${nomi}`;
	$('conto').textContent = visibile;

	// Annuncio per lo screen reader: ritardato, così non legge ogni lettera scritta.
	clearTimeout(ultimoAnnuncio);
	ultimoAnnuncio = setTimeout(() => ($('esito').textContent = visibile), 450);

	const par = $('parziale');
	par.hidden = !(trovato.parziale && n);
	if (!par.hidden) par.textContent = 'Nessuna risposta contiene tutte le parole: ecco quelle che ne contengono almeno una.';

	const vuoto = $('vuoto');
	vuoto.hidden = n > 0;
	if (n === 0) {
		const azioni = $('vuoto-azioni');
		azioni.replaceChildren();
		if (stato.tema !== 'tutti' && totaleTema > 0) {
			$('vuoto-titolo').textContent = `In «${nomeTema[stato.tema]}» non c’è niente per «${q}».`;
			$('vuoto-testo').textContent = `Ma in altri temi ${totaleTema === 1 ? 'c’è una risposta' : `ci sono ${totaleTema} risposte`}.`;
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'chip chip--chiaro';
			b.textContent = 'Cerca in tutti i temi';
			b.addEventListener('click', () => {
				stato.tema = 'tutti';
				aggiorna();
			});
			azioni.append(b);
		} else {
			$('vuoto-titolo').textContent = `Nessuna risposta per «${q}».`;
			$('vuoto-testo').textContent = 'Prova con una parola sola, o con una di queste:';
			for (const s of PIU_CERCATE) {
				const c = chipRicerca(s);
				c.classList.add('chip--chiaro');
				azioni.append(c);
			}
		}
	}
}

// ───────── Evidenziazione del testo trovato ─────────
// CSS Custom Highlight API: segna i pezzi di testo senza toccare l'HTML (lo screen reader legge le frasi intere).
// Dove non esiste la pagina funziona uguale, solo senza evidenziazione.
function evidenziaTesto(token, q) {
	if (!evidenzia) return;
	CSS.highlights.delete('trovato');
	if (!q || !token.length) return;
	const intervalli = [];
	for (const [, v] of voci) {
		if (!v.visibile) continue;
		const cammina = document.createTreeWalker(v.li, NodeFilter.SHOW_TEXT, {
			acceptNode: (n) => (n.parentElement.closest('.cart__tema, .copia, .cart__num') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
		});
		for (let nodo = cammina.nextNode(); nodo; nodo = cammina.nextNode()) {
			for (const m of nodo.data.matchAll(PAROLA)) {
				const w = norm(m[0]);
				if (token.some((t) => grado(t, w) > 0)) {
					const r = new Range();
					r.setStart(nodo, m.index);
					r.setEnd(nodo, m.index + m[0].length);
					intervalli.push(r);
				}
			}
		}
	}
	if (intervalli.length) CSS.highlights.set('trovato', new Highlight(...intervalli));
}

// ───────── Aprire, chiudere, link diretto ─────────
function impostaAperta(v, aperta, auto = false) {
	// 'toggle' arriva più tardi: si ricorda che il cambio l'abbiamo fatto noi, non l'utente.
	if (v.det.open !== aperta) v.atteso = aperta;
	v.det.open = aperta;
	v.auto = auto && aperta;
}
function aperturaCambiata(v) {
	if (v.atteso === v.det.open) {
		v.atteso = undefined;
		return;
	}
	v.auto = false;
	if (v.det.open) stato.r = v.d.id;
	else if (stato.r === v.d.id) stato.r = '';
	scriviHash();
}

let applicandoHash = false;
function vaiAllaRisposta(id) {
	const v = voci.get(id);
	if (!v) return;
	// Se la risposta non è tra quelle mostrate, si toglie ciò che la nasconde.
	if (!v.visibile) {
		stato.q = '';
		stato.tema = 'tutti';
		campo.value = '';
		aggiorna();
	}
	impostaAperta(v, true);
	v.li.scrollIntoView({ block: 'center', behavior: riduci.matches ? 'auto' : 'smooth' });
	v.li.classList.remove('lampo');
	void v.li.offsetWidth;
	v.li.classList.add('lampo');
	v.det.querySelector('summary').focus({ preventScroll: true });
}

async function copiaLink(d, bottone) {
	const url = location.origin + location.pathname + location.search + hashDi({ ...stato, r: d.id });
	let ok = false;
	try {
		await navigator.clipboard.writeText(url);
		ok = true;
	} catch {
		const t = document.createElement('textarea');
		t.value = url;
		t.setAttribute('readonly', '');
		t.style.cssText = 'position:fixed;opacity:0';
		document.body.append(t);
		t.select();
		try {
			ok = document.execCommand('copy');
		} catch {}
		t.remove();
		bottone.focus();
	}
	const testo = bottone.querySelector('.copia__testo');
	const prima = 'Copia il link a questa risposta';
	testo.textContent = ok ? 'Link copiato' : 'Non riesco a copiarlo: usa l’indirizzo della pagina';
	bottone.classList.toggle('copia--fatto', ok);
	clearTimeout(bottone._t);
	bottone._t = setTimeout(() => {
		testo.textContent = prima;
		bottone.classList.remove('copia--fatto');
	}, 2200);
}

// ───────── Tastiera ─────────
function sommariVisibili() {
	return [...lista.querySelectorAll('.voce:not([hidden]) > details > summary')];
}
function tastiSommario(e, sum) {
	const tutti = sommariVisibili();
	const i = tutti.indexOf(sum);
	let vai = null;
	if (e.key === 'ArrowDown') vai = tutti[i + 1];
	else if (e.key === 'ArrowUp') vai = i === 0 ? campo : tutti[i - 1];
	else if (e.key === 'Home') vai = tutti[0];
	else if (e.key === 'End') vai = tutti[tutti.length - 1];
	if (vai) {
		e.preventDefault();
		vai.focus();
	}
}

campo.addEventListener('input', () => {
	stato.q = campo.value;
	stato.r = '';
	aggiorna();
});
campo.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		if (campo.value) {
			e.preventDefault();
			campo.value = '';
			stato.q = '';
			aggiorna();
		} else campo.blur();
	} else if (e.key === 'ArrowDown') {
		const primo = sommariVisibili()[0];
		if (primo) {
			e.preventDefault();
			primo.focus();
		}
	}
});
$('cerca-form').addEventListener('submit', (e) => {
	e.preventDefault();
	campo.blur();
});
$('cerca-pulisci').addEventListener('click', () => {
	campo.value = '';
	stato.q = '';
	aggiorna();
	campo.focus();
});
document.addEventListener('keydown', (e) => {
	if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
	if (e.target.closest('input, textarea, select, [contenteditable]')) return;
	e.preventDefault();
	campo.focus();
	campo.select();
});

// ───────── Avvio ─────────
function daIndirizzo() {
	applicandoHash = true;
	leggiHash();
	campo.value = stato.q;
	const r = stato.r;
	aggiorna();
	applicandoHash = false;
	if (r) vaiAllaRisposta(r);
}
costruisci();
daIndirizzo();
addEventListener('hashchange', daIndirizzo);
