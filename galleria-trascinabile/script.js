/* Galleria da trascinare. GSAP: Draggable (trascinamento con inerzia), Flip (la foto vola dalla tessera al
   pannello). Le tessere sono veri <button>, il dettaglio è un <dialog> nativo. Il suono parte spento. */
(() => {
	'use strict';

	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const $ = (s, r = document) => r.querySelector(s);
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	/* ───────── Dati: in ordine di griglia (per righe). `fx` = punto focale orizzontale del ritaglio 4:5. ───────── */
	const FOTO = [
		{ id: 'cipressi', nome: 'Cipressi all’alba', luogo: 'Toscana', autore: 'Samuele Bertoli', fx: 45,
			desc: 'Una strada di cipressi che serpeggia tra le colline, con il sole che nasce dietro la prima cresta e tinge di rame tutto il grano.' },
		{ id: 'blu', nome: 'Il vicolo blu', luogo: 'Chefchaouen, Marocco', autore: 'Hasmik Ghazaryan Olson', fx: 55,
			desc: 'Case, scale e porte dipinte in tutte le sfumature d’azzurro: basta un arco aperto per ritrovarsi dentro un colore solo.' },
		{ id: 'terrazze', nome: 'Terrazze di riso', luogo: '', autore: 'Jason Cooper', fx: 50,
			desc: 'Il riso cresce a gradini scavati nella collina e l’acqua scende da una terrazza all’altra. Dall’alto il pendio sembra una mappa a curve di livello.' },
		{ id: 'hanami', nome: 'Ciliegi di notte', luogo: 'Giappone', autore: 'Takashi Miyazaki', fx: 50,
			desc: 'In primavera i ciliegi in fiore si specchiano nell’acqua e, quando si accendono le luci, anche il riflesso diventa rosa.' },
		{ id: 'faro', nome: 'Faro nella tempesta', luogo: '', autore: 'Raphael Rychetsky', fx: 55,
			desc: 'Un faro su uno scoglio, un ponte di pietra, il mare che si alza. Anche con il cielo grigio la scena ha un colore: il rosso della lanterna.' },
		{ id: 'canyon', nome: 'Roccia a onde', luogo: 'Antelope Canyon, Arizona', autore: 'Matt Tsai', fx: 50,
			desc: 'Acqua e vento hanno levigato la roccia in onde. La luce che cade dall’alto la fa passare dal viola all’arancio nel giro di pochi passi.' },
		{ id: 'lofoten', nome: 'Casette rosse', luogo: 'Isole Lofoten, Norvegia', autore: 'Joshua Kettle', fx: 35,
			desc: 'Casette di pescatori sull’acqua ferma, nell’ora in cui il cielo si fa di piombo e i riflessi raddoppiano ogni colore.' },
		{ id: 'lavanda', nome: 'Lavanda', luogo: 'Provenza, Francia', autore: 'Antony Bec', fx: 50,
			desc: 'A fine giugno il campo diventa un’unica striscia viola che arriva fino alle montagne. Il profumo si sente prima di arrivare.' },
		{ id: 'sabbia', nome: 'Sabbia nera', luogo: 'Islanda', autore: 'Job Savelsberg', fx: 50,
			desc: 'Sabbia vulcanica nera e schiuma bianca: una spiaggia in due soli colori, con l’oceano grigio che non si ferma mai.' },
		{ id: 'oia', nome: 'Ora blu', luogo: 'Oia, Santorini', autore: 'Alex Kulikov', fx: 40,
			desc: 'Case bianche aggrappate alla costa e un mulino a vento che resiste. Nell’ora blu si accendono le luci e il bianco diventa azzurro.' },
		{ id: 'dolomiti', nome: 'Cresta tra le nuvole', luogo: 'Dolomiti', autore: 'Ruben Vermeulen', fx: 60,
			desc: 'Una cresta di roccia a strati che emerge dalla nebbia. Le Dolomiti cambiano faccia a ogni minuto, con le nuvole che salgono e scendono.' },
		{ id: 'ghiaccio', nome: 'Grotta di ghiaccio', luogo: '', autore: 'Jonatan Pie', fx: 45,
			desc: 'Dentro il ghiaccio la luce diventa blu. Una figura minuscola, in fondo, dà la misura della cavità.' },
		{ id: 'venezia', nome: 'Canal Grande', luogo: 'Venezia', autore: 'Karsten Würth', fx: 50,
			desc: 'Il Canal Grande all’ora in cui il cielo brucia, con la cupola della Salute in fondo e le barche che tracciano righe sull’acqua.' },
		{ id: 'tokyo', nome: 'Pioggia al neon', luogo: 'Tokyo', ia: true, fx: 55,
			desc: 'Una strada bagnata che moltiplica ogni insegna in un riflesso. Non esiste: è stata creata con un’intelligenza artificiale, e qui lo dichiariamo.' },
		{ id: 'nebbia', nome: 'Foresta nella nebbia', luogo: '', autore: 'Nicolas Jehly', fx: 50,
			desc: 'Muschio, rami e nebbia: nella foresta umida i colori restano bassi e anche il rumore si ferma.' },
		{ id: 'uyuni', nome: 'Lago specchio', luogo: 'Salar de Uyuni, Bolivia', autore: 'Matheus Oliveira', fx: 27,
			desc: 'Quando un velo d’acqua copre il sale, il deserto riflette il cielo e l’orizzonte sparisce. Camminarci è come stare dentro una nuvola.' },
	];
	const N = FOTO.length;
	const CELLA_INTRO = 7;
	const CELLA_FINE = 17;
	const COLONNE = 6;
	const pad = (n) => String(n).padStart(2, '0');
	const urlTessera = (f) => `img/${f.id}-tessera.webp`;
	const urlGrande = (f) => `img/${f.id}-grande.webp`;
	const pos = (f) => `${f.fx}% 50%`;

	const viewport = $('#viewport');
	const canvas = $('#canvas');
	const dlg = $('#dettaglio');
	const dImg = $('#d-img');
	const dFoto = $('#d-foto');
	const dGriglia = $('.d-griglia', dlg);

	/* ───────── Griglia ───────── */
	const tessere = []; // bottoni, per indice foto
	const cellaDi = []; // elementi cella, per indice foto

	function creaTessera(f, i) {
		const li = document.createElement('li');
		li.className = 'cella';
		const b = document.createElement('button');
		b.className = 'tessera';
		b.type = 'button';
		b.setAttribute('aria-label', `${pad(i + 1)}. ${f.nome}${f.luogo ? ', ' + f.luogo : ''}. Apri la foto`);
		const img = document.createElement('img');
		img.src = urlTessera(f);
		img.alt = '';
		img.width = 520;
		img.height = 650;
		img.draggable = false;
		img.decoding = 'async';
		const num = document.createElement('span');
		num.className = 'tessera__num';
		num.setAttribute('aria-hidden', 'true');
		num.textContent = pad(i + 1);
		const nome = document.createElement('span');
		nome.className = 'tessera__nome';
		nome.setAttribute('aria-hidden', 'true');
		nome.textContent = f.nome;
		b.append(img, num, nome);
		b.addEventListener('click', () => {
			if (mosso) {
				mosso = false;
				return;
			}
			apri(i, b);
		});
		li.append(b);
		tessere[i] = b;
		cellaDi[i] = li;
		return li;
	}

	function creaIntro() {
		const li = document.createElement('li');
		li.className = 'cella cella--testo';
		li.innerHTML =
			'<div class="cella__dentro"><p class="kicker">Loop Studio Lab</p>' +
			'<div class="cella__corpo"><h1>Sedici luoghi, da trascinare.</h1>' +
			'<p>Muovi la griglia, tocca una foto per aprirla. Con il suono acceso ha anche una voce.</p></div></div>';
		return li;
	}

	function creaFine() {
		const li = document.createElement('li');
		li.className = 'cella cella--testo cella--fine';
		li.innerHTML =
			'<div class="cella__dentro"><svg viewBox="0 0 1465 753" role="img" aria-label="Loop Studio"><use href="#i-infinity" /></svg>' +
			'<div class="cella__corpo"><h2>Una galleria così, sul tuo sito?</h2>' +
			'<p>Foto, ritmo e un gesto che invita a restare.</p></div>' +
			'<a class="invito" href="https://theloopstudio.org/contatti/" target="_blank" rel="noopener">Parliamone<span class="sr-only"> (si apre in una nuova scheda)</span></a></div>';
		return li;
	}

	let p = 0;
	for (let c = 0; c < COLONNE * 3; c++) {
		let el;
		if (c === CELLA_INTRO) el = creaIntro();
		else if (c === CELLA_FINE) el = creaFine();
		else el = creaTessera(FOTO[p], p++);
		el.dataset.cella = c;
		canvas.append(el);
	}

	/* ───────── Trascinamento (Draggable + inerzia) ───────── */
	gsap.registerPlugin(Draggable, Flip, InertiaPlugin);
	let mosso = false;
	let px = 0;
	let py = 0;
	let suggerimentoNascosto = false;
	const suggerimento = $('#suggerimento');
	const nascondiSuggerimento = () => {
		if (suggerimentoNascosto) return;
		suggerimentoNascosto = true;
		suggerimento.classList.add('is-hidden');
	};

	const drag = Draggable.create(canvas, {
		type: 'x,y',
		trigger: viewport,
		bounds: viewport,
		inertia: !reduce,
		edgeResistance: 0.85,
		minimumMovement: 4,
		dragClickables: true,
		onPress() {
			mosso = false;
			px = this.x;
			py = this.y;
		},
		onDragStart() {
			canvas.classList.add('is-dragging');
			viewport.classList.add('is-grabbing');
			nascondiSuggerimento();
			suono.play('afferra');
		},
		onDrag() {
			if (Math.hypot(this.x - px, this.y - py) > 6) mosso = true;
		},
		onDragEnd() {
			canvas.classList.remove('is-dragging');
			viewport.classList.remove('is-grabbing');
			if (mosso) suono.play('rilascia');
		},
		onRelease() {
			canvas.classList.remove('is-dragging');
			viewport.classList.remove('is-grabbing');
		},
	})[0];

	function limiti(x, y) {
		const vw = viewport.clientWidth;
		const vh = viewport.clientHeight;
		const cw = canvas.offsetWidth;
		const ch = canvas.offsetHeight;
		return {
			x: cw <= vw ? (vw - cw) / 2 : Math.min(0, Math.max(vw - cw, x)),
			y: ch <= vh ? (vh - ch) / 2 : Math.min(0, Math.max(vh - ch, y)),
		};
	}
	function vaiA(x, y, durata = 0.6, istantaneo = false) {
		const t = limiti(x, y);
		if (istantaneo || reduce) {
			gsap.killTweensOf(canvas);
			gsap.set(canvas, t);
			drag.update();
			return;
		}
		gsap.to(canvas, { ...t, duration: durata, ease: 'power3.out', overwrite: true, onUpdate: () => drag.update() });
	}
	const corrente = () => ({ x: gsap.getProperty(canvas, 'x'), y: gsap.getProperty(canvas, 'y') });

	// Posizione iniziale: griglia centrata.
	vaiA((viewport.clientWidth - canvas.offsetWidth) / 2, (viewport.clientHeight - canvas.offsetHeight) / 2, 0, true);
	const centra = () => {
		const c = corrente();
		vaiA(c.x, c.y, 0, true);
		drag.applyBounds(viewport);
	};
	addEventListener('resize', centra);

	// Rotella e trackpad spostano la griglia (con Maiusc la rotella va in orizzontale).
	viewport.addEventListener(
		'wheel',
		(e) => {
			if (dlg.open) return;
			e.preventDefault();
			nascondiSuggerimento();
			const orizz = e.shiftKey && !e.deltaX;
			const dx = orizz ? e.deltaY : e.deltaX;
			const dy = orizz ? 0 : e.deltaY;
			const c = corrente();
			vaiA(c.x - dx, c.y - dy, 0.45);
		},
		{ passive: false },
	);

	// Chi naviga da tastiera: la tessera messa a fuoco entra sempre nello schermo.
	canvas.addEventListener('focusin', (e) => {
		const cella = e.target.closest('.cella');
		if (!cella) return;
		const r = cella.getBoundingClientRect();
		const v = viewport.getBoundingClientRect();
		const m = 28;
		let dx = 0;
		let dy = 0;
		if (r.left < v.left + m) dx = v.left + m - r.left;
		else if (r.right > v.right - m) dx = v.right - m - r.right;
		if (r.top < v.top + 64) dy = v.top + 64 - r.top;
		else if (r.bottom > v.bottom - 70) dy = v.bottom - 70 - r.bottom;
		if (dx || dy) {
			const c = corrente();
			vaiA(c.x + dx, c.y + dy, 0.5);
		}
	});
	// Frecce: passano alla tessera vicina (saltando le celle di testo).
	canvas.addEventListener('keydown', (e) => {
		const passo = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -COLONNE, ArrowDown: COLONNE }[e.key];
		const cella = e.target.closest('.cella');
		if (!passo || !cella) return;
		let c = +cella.dataset.cella + passo;
		while (c >= 0 && c < COLONNE * 3) {
			const f = canvas.querySelector(`[data-cella="${c}"] .tessera, [data-cella="${c}"] .invito`);
			if (f) {
				e.preventDefault();
				f.focus();
				return;
			}
			c += passo;
		}
	});

	function portaInVista(tessera) {
		const cella = tessera.closest('.cella');
		const r = cella.getBoundingClientRect();
		const v = viewport.getBoundingClientRect();
		const c = corrente();
		vaiA(c.x + (v.left + v.width / 2 - (r.left + r.width / 2)), c.y + (v.top + v.height / 2 - (r.top + r.height / 2)), 0, true);
	}

	/* ───────── Dettaglio ───────── */
	let corr = -1;
	let occupato = false;
	let vola = null;
	const elTesto = ['.d-num', '.d-luogo', '#d-titolo', '.d-desc', '.d-credito', '.d-nav', '.d-chiudi'];

	function riempi(f, i) {
		$('#d-num').textContent = `${pad(i + 1)} / ${N}`;
		$('#d-luogo').textContent = f.luogo ? (f.ia ? `${f.luogo} · immagine generata con IA` : f.luogo) : '';
		$('#d-titolo').textContent = f.nome;
		$('#d-desc').textContent = f.desc;
		$('#d-credito').textContent = f.ia ? 'Immagine generata con intelligenza artificiale, non una fotografia.' : `Foto: ${f.autore}, su Unsplash.`;
		dFoto.style.setProperty('--pos', pos(f));
		dImg.alt = `${f.nome}${f.luogo ? ', ' + f.luogo : ''}`;
	}
	async function precarica(f) {
		const im = new Image();
		im.src = urlGrande(f);
		try {
			await Promise.race([im.decode(), sleep(900)]);
		} catch {
			/* se la decodifica fallisce si parte comunque con quello che c'è */
		}
		return im.src;
	}
	function creaVola(f, src, da) {
		const el = document.createElement('img');
		el.className = 'vola';
		el.alt = '';
		el.src = src;
		el.style.setProperty('--pos', pos(f));
		dlg.append(el);
		const r = da.getBoundingClientRect();
		gsap.set(el, { x: r.left, y: r.top, width: r.width, height: r.height });
		return el;
	}

	async function apri(i, tessera) {
		if (dlg.open || occupato) return;
		occupato = true;
		corr = i;
		const f = FOTO[i];
		riempi(f, i);
		suono.play('scatto');
		const src = await precarica(f);
		dImg.src = src;
		dlg.showModal();
		dlg.focus({ preventScroll: true }); // il browser metterebbe il focus su "Chiudi" (con anello): lo teniamo sul dialog
		if (reduce) {
			gsap.fromTo(dGriglia, { opacity: 0 }, { opacity: 1, duration: 0.2 });
			occupato = false;
			return;
		}
		dImg.style.opacity = 0;
		vola = creaVola(f, src, $('img', tessera));
		gsap.fromTo(dGriglia, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
		Flip.fit(vola, dFoto, {
			duration: 0.75,
			ease: 'power4.inOut',
			onComplete: () => {
				dImg.style.opacity = 1;
				vola?.remove();
				vola = null;
				occupato = false;
			},
		});
		gsap.fromTo(
			elTesto.map((s) => $(s, dlg)),
			{ y: 26, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.4 },
		);
	}

	async function chiudi() {
		if (!dlg.open || occupato) return;
		occupato = true;
		suono.play('chiudi');
		const tessera = tessere[corr];
		portaInVista(tessera);
		const fine = () => {
			dlg.close();
			vola?.remove();
			vola = null;
			gsap.set([dGriglia, dImg, ...elTesto.map((s) => $(s, dlg))], { clearProps: 'opacity,transform' });
			occupato = false;
		};
		if (reduce) {
			gsap.to(dGriglia, { opacity: 0, duration: 0.15, onComplete: fine });
			return;
		}
		const f = FOTO[corr];
		vola = creaVola(f, dImg.currentSrc || dImg.src, dFoto);
		dImg.style.opacity = 0;
		gsap.to(elTesto.map((s) => $(s, dlg)), { opacity: 0, y: 12, duration: 0.25, ease: 'power2.in' });
		gsap.to(dGriglia, { opacity: 0, duration: 0.5, ease: 'power2.inOut', delay: 0.1 });
		Flip.fit(vola, $('img', tessera), { duration: 0.65, ease: 'power4.inOut', onComplete: fine });
	}

	async function vai(delta) {
		if (!dlg.open || occupato) return;
		occupato = true;
		const n = (corr + delta + N) % N;
		const f = FOTO[n];
		corr = n;
		portaInVista(tessere[n]);
		suono.play('afferra');
		const src = await precarica(f);
		const parti = [dImg, ...['.d-num', '.d-luogo', '#d-titolo', '.d-desc', '.d-credito'].map((s) => $(s, dlg))];
		const d = reduce ? 0 : 0.2;
		gsap
			.timeline({ onComplete: () => (occupato = false) })
			.to(parti, { opacity: 0, duration: d })
			.add(() => {
				riempi(f, n);
				dImg.src = src;
			})
			.to(parti, { opacity: 1, duration: reduce ? 0 : 0.4, stagger: reduce ? 0 : 0.04, ease: 'power2.out' });
	}

	$('#d-chiudi').addEventListener('click', chiudi);
	$('#d-prec').addEventListener('click', () => vai(-1));
	$('#d-succ').addEventListener('click', () => vai(1));
	dlg.addEventListener('cancel', (e) => {
		e.preventDefault(); // Esc: si chiude con l'animazione di ritorno
		chiudi();
	});
	dlg.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') vai(-1);
		if (e.key === 'ArrowRight') vai(1);
	});

	/* ───────── Suono (parte spento; si accende solo con un gesto) ───────── */
	const suono = (() => {
		const file = { afferra: 'afferra.mp3', rilascia: 'rilascia.mp3', scatto: 'apri-scatto.mp3', chiudi: 'chiudi.mp3', bordone: 'bordone-loop.m4a' };
		const volume = { afferra: 0.35, rilascia: 0.5, scatto: 0.6, chiudi: 0.45 };
		let ctx = null;
		let acceso = false;
		let caricato = false;
		let bufferi = {};
		let bordone = null;
		let ultimo = 0;

		async function carica() {
			await Promise.all(
				Object.entries(file).map(async ([k, f]) => {
					const r = await fetch(`audio/${f}`);
					bufferi[k] = await ctx.decodeAudioData(await r.arrayBuffer());
				}),
			);
			caricato = true;
		}
		function avviaBordone() {
			const src = ctx.createBufferSource();
			src.buffer = bufferi.bordone;
			src.loop = true;
			const g = ctx.createGain();
			g.gain.setValueAtTime(0, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2.5);
			src.connect(g).connect(ctx.destination);
			src.start();
			bordone = { src, g };
		}
		async function accendi() {
			ctx ||= new (window.AudioContext || window.webkitAudioContext)();
			await ctx.resume();
			if (!caricato) await carica();
			acceso = true;
			avviaBordone();
		}
		function spegni() {
			acceso = false;
			if (!bordone) return;
			const { src, g } = bordone;
			g.gain.cancelScheduledValues(ctx.currentTime);
			g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
			setTimeout(() => src.stop(), 700);
			bordone = null;
		}
		function play(k) {
			if (!acceso || !bufferi[k]) return;
			if (k === 'afferra') {
				const t = performance.now();
				if (t - ultimo < 250) return;
				ultimo = t;
			}
			const s = ctx.createBufferSource();
			s.buffer = bufferi[k];
			const g = ctx.createGain();
			g.gain.value = volume[k] ?? 0.4;
			s.connect(g).connect(ctx.destination);
			s.start();
		}
		// Se la scheda va in secondo piano l'audio si ferma, e riparte al ritorno.
		document.addEventListener('visibilitychange', () => {
			if (!ctx || !acceso) return;
			document.hidden ? ctx.suspend() : ctx.resume();
		});
		return { accendi, spegni, play, get acceso() { return acceso; } };
	})();

	const bottone = $('#suono');
	bottone.addEventListener('click', async () => {
		bottone.classList.remove('invita');
		if (suono.acceso) {
			suono.spegni();
			bottone.setAttribute('aria-pressed', 'false');
			return;
		}
		bottone.setAttribute('aria-busy', 'true');
		try {
			await suono.accendi();
			bottone.setAttribute('aria-pressed', 'true');
		} catch (err) {
			console.warn('Audio non disponibile', err);
		}
		bottone.removeAttribute('aria-busy');
	});
	// L'invito: le barre "respirano" tre volte poco dopo l'arrivo, poi si fermano.
	setTimeout(() => {
		if (!suono.acceso) bottone.classList.add('invita');
	}, 1800);

	/* ───────── Entrata ───────── */
	if (!reduce) {
		gsap.from('.cella', {
			opacity: 0,
			scale: 0.92,
			y: 30,
			duration: 0.8,
			ease: 'power3.out',
			stagger: { each: 0.035, from: 'center', grid: [3, COLONNE] },
			clearProps: 'opacity,transform',
		});
	}
	setTimeout(nascondiSuggerimento, 9000);
})();
