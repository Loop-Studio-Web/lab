/* Galleria da riordinare. 16 foto in un mosaico la cui forma dipende dalla posizione (le prime quattro sono la
   vetrina). Si trascina con il mouse da qualunque punto e col dito dalla maniglia; da tastiera Spazio solleva,
   le frecce spostano, Spazio posa, Esc annulla. GSAP Flip anima le altre tessere mentre si riordina.
   Le tessere sono veri <button>; la foto in grande è un <dialog> nativo. L'ordine si salva in localStorage. */
(() => {
	'use strict';

	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const $ = (s, r = document) => r.querySelector(s);
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const pad = (n) => String(n).padStart(2, '0');
	const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

	const CHIAVE = 'lab-galleria-riordinabile';
	const VETRINA = 4; // le prime 4 posizioni sono la vetrina del sito

	/* ───────── Dati. `fx`/`fy` = punto focale del soggetto: il ritaglio cambia forma a ogni posizione. ───────── */
	const FOTO = [
		{ id: 'pappagallo', nome: 'Coppia di ara', autore: 'David Clode', utente: 'davidclode', luogo: 'Birdworld Kuranda, Queensland, Australia', fx: 55, fy: 50 },
		{ id: 'leone', nome: 'Leone', autore: 'Alexas_Fotos', utente: 'alexas_fotos', luogo: 'Tierpark Hellabrunn, Monaco di Baviera', fx: 70, fy: 50 },
		{ id: 'panda', nome: 'Panda rosso', autore: 'Xiangkun ZHU', utente: 'arttoinspire', luogo: '', fx: 45, fy: 38 },
		{ id: 'pesce', nome: 'Pesce pagliaccio', autore: 'Christian Lue', utente: 'christianlue', luogo: '', fx: 50, fy: 48 },
		{ id: 'gufo', nome: 'Gufo', autore: 'James Toose', utente: 'portablepeopleproductions', luogo: 'York, Regno Unito', fx: 55, fy: 45 },
		{ id: 'cavalli', nome: 'Cavalli nella neve', autore: 'Sheila Swayze', utente: 'frozenmoments', luogo: 'Columbia Britannica, Canada', fx: 45, fy: 60 },
		{ id: 'lupo', nome: 'Lupo', autore: 'kenny goossen', utente: 'kennygoossen', luogo: '', fx: 45, fy: 50 },
		{ id: 'fenicottero', nome: 'Fenicottero andino', autore: 'Chris Stenger', utente: 'chrisstenger', luogo: 'Salar de Atacama, Cile', fx: 56, fy: 42 },
		{ id: 'tartaruga', nome: 'Tartaruga marina', autore: 'Giorgia Doglioni', utente: 'gio_aroundtheworld', luogo: '', fx: 58, fy: 48 },
		{ id: 'camaleonte', nome: 'Camaleonte', autore: 'Sergey Omelchenko', utente: 'serjom', luogo: '', fx: 60, fy: 42 },
		{ id: 'elefante', nome: 'Elefanti al tramonto', autore: 'Jordan Heinrichs', utente: 'jordanheinrichs', luogo: '', fx: 42, fy: 55 },
		{ id: 'colibri', nome: 'Colibrì', autore: 'Dulcey Lima', utente: 'dulceylima', luogo: 'Winfield, Illinois, USA', fx: 68, fy: 40 },
		{ id: 'pinguino', nome: 'Pinguino reale', autore: 'Ian Parker', utente: 'evanescentlight', luogo: 'Georgia del Sud', fx: 52, fy: 50 },
		{ id: 'zebra', nome: 'Zebra', autore: 'Jason Zhao', utente: 'j_zhao', luogo: 'Masai Mara, Kenya', fx: 42, fy: 55 },
		{ id: 'manto', nome: 'Il manto della zebra', autore: 'Stephane YAICH', utente: 'stefyaich', luogo: '', fx: 50, fy: 50 },
		{ id: 'gatto', nome: 'Gatto soriano', autore: 'Sam Chang', utente: 'answer603', luogo: 'Taiwan', fx: 50, fy: 40 },
	];
	const PER_ID = Object.fromEntries(FOTO.map((f) => [f.id, f]));
	const N = FOTO.length;
	// L'ordine di partenza: le due appena caricate ("Nuova") sono in fondo, e sono le più forti.
	const ORDINE_INIZIALE = ['cavalli', 'lupo', 'tartaruga', 'elefante', 'gufo', 'fenicottero', 'panda', 'pinguino', 'camaleonte', 'zebra', 'pesce', 'colibri', 'gatto', 'manto', 'pappagallo', 'leone'];
	const NUOVE = new Set(['pappagallo', 'leone']);
	const urlTessera = (f) => `img/${f.id}-tessera.webp`;
	const urlGrande = (f) => `img/${f.id}-grande.webp`;

	const mosaico = $('#mosaico');
	const annuncio = $('#annuncio');
	const stato = $('#stato');
	const salvaBtn = $('#salva');
	const annullaBtn = $('#annulla');
	const ricominciaBtn = $('#ricomincia');

	gsap.registerPlugin(Flip);

	// Stato dei due modi di spostare una foto (mouse/dito e tastiera): dichiarato qui perché lo leggono più funzioni.
	let presa = null;
	let levata = null;

	/* ───────── Ordine salvato ───────── */
	function leggiSalvato() {
		try {
			const s = JSON.parse(localStorage.getItem(CHIAVE));
			if (s && Array.isArray(s.ordine) && s.ordine.length === N && new Set(s.ordine).size === N && s.ordine.every((id) => PER_ID[id])) return s.ordine;
		} catch {
			/* niente memoria locale (navigazione privata, blocco dei dati): si parte dall'ordine iniziale */
		}
		return null;
	}
	let salvato = leggiSalvato();

	/* ───────── Mosaico ───────── */
	const celle = new Map(); // id → <li>

	function creaCella(f) {
		const li = document.createElement('li');
		li.className = 'cella';
		li.dataset.id = f.id;
		if (!salvato && NUOVE.has(f.id)) li.dataset.nuova = '';
		li.style.setProperty('--fx', `${f.fx}%`);
		li.style.setProperty('--fy', `${f.fy}%`);
		li.innerHTML =
			`<button class="tessera" type="button" aria-describedby="aiuto-tastiera">` +
			`<img class="tessera__foto" src="${urlTessera(f)}" alt="" width="1200" height="800" draggable="false" decoding="async" />` +
			`<span class="tessera__alto" aria-hidden="true"><span class="chip tessera__num"></span><span class="chip chip--vetrina">In vetrina</span><span class="chip chip--nuova">Nuova</span></span>` +
			`<span class="tessera__presa" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16" focusable="false"><use href="#i-presa" /></svg></span>` +
			`<span class="tessera__testi" aria-hidden="true"><span class="tessera__nome">${f.nome}</span>` +
			`<span class="tessera__dett"><span>Foto di ${f.autore}</span><svg viewBox="0 0 16 16" width="16" height="16" focusable="false"><use href="#i-freccia" /></svg></span></span>` +
			`</button>`;
		celle.set(f.id, li);
		return li;
	}

	const celleInOrdine = () => [...mosaico.children];
	const ordineDaDom = () => celleInOrdine().map((li) => li.dataset.id);
	const uguali = (a, b) => a.join() === b.join();
	const bottone = (li) => $('.tessera', li);

	for (const id of salvato ?? ORDINE_INIZIALE) mosaico.append(creaCella(PER_ID[id]));

	/* Numeri e nomi accessibili seguono la posizione. La forma delle tessere la decide il CSS (nth-child). */
	function aggiornaNumeri() {
		celleInOrdine().forEach((li, i) => {
			const f = PER_ID[li.dataset.id];
			li.dataset.pos = i + 1;
			$('.tessera__num', li).textContent = pad(i + 1);
			const nuova = li.hasAttribute('data-nuova') ? ', nuova' : '';
			bottone(li).setAttribute('aria-label', `Foto ${i + 1} di ${N}: ${f.nome}${i < VETRINA ? ', in vetrina' : ''}${nuova}`);
		});
		// La copia in mano porta il numero del posto che sta per occupare.
		if (presa?.ghost) $('.tessera__num', presa.ghost).textContent = pad(+presa.li.dataset.pos);
	}
	aggiornaNumeri();

	const annuncia = (testo) => {
		annuncio.textContent = '';
		requestAnimationFrame(() => (annuncio.textContent = testo));
	};

	/* Cambia l'ordine nel DOM e fa scorrere le tessere dal vecchio al nuovo posto (Flip: x/y e dimensioni). */
	let anim = null;
	function conFlip(mutazione) {
		const cs = celleInOrdine();
		const prima = Flip.getState(cs);
		Flip.killFlipsOf(cs);
		gsap.set(cs, { clearProps: 'transform,width,height' });
		mutazione();
		aggiornaNumeri();
		if (reduce) return;
		anim = Flip.from(prima, { duration: 0.5, ease: 'power3.inOut' });
	}
	function applicaOrdine(ids) {
		conFlip(() => ids.forEach((id) => mosaico.append(celle.get(id))));
	}

	/* ───────── Storia (annulla), stato e salvataggio ───────── */
	const pila = [];
	function registraMossa(prima) {
		if (uguali(prima, ordineDaDom())) return;
		pila.push(prima);
		if (pila.length > 50) pila.shift();
		aggiornaStato();
	}
	function aggiornaStato() {
		const o = ordineDaDom();
		const modificato = !uguali(o, salvato ?? ORDINE_INIZIALE);
		salvaBtn.disabled = !modificato;
		annullaBtn.disabled = pila.length === 0;
		ricominciaBtn.disabled = uguali(o, ORDINE_INIZIALE);
		stato.dataset.stato = modificato ? 'modificato' : salvato ? 'salvato' : 'iniziale';
		stato.textContent = modificato ? 'Modifiche non salvate' : salvato ? 'Ordine salvato in questo browser' : 'Ordine iniziale';
	}
	aggiornaStato();

	function annullaUltima() {
		if (presa || levata || !pila.length) return;
		applicaOrdine(pila.pop());
		aggiornaStato();
		annuncia('Ultima mossa annullata.');
	}
	annullaBtn.addEventListener('click', annullaUltima);
	ricominciaBtn.addEventListener('click', () => {
		if (presa || levata) return;
		registraMossa(ordineDaDom());
		applicaOrdine(ORDINE_INIZIALE);
		aggiornaStato();
		annuncia('Ordine iniziale ripristinato.');
	});
	salvaBtn.addEventListener('click', () => {
		const o = ordineDaDom();
		try {
			localStorage.setItem(CHIAVE, JSON.stringify({ v: 1, ordine: o }));
		} catch {
			stato.dataset.stato = 'modificato';
			stato.textContent = 'Il browser non permette di salvare qui';
			return;
		}
		salvato = o;
		celleInOrdine().forEach((li) => li.removeAttribute('data-nuova')); // salvate: non sono più "nuove"
		aggiornaNumeri();
		aggiornaStato();
		annuncia('Ordine salvato.');
	});
	document.addEventListener('keydown', (e) => {
		if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !dlg.open) {
			e.preventDefault();
			annullaUltima();
		}
	});

	/* ───────── Trascinamento (mouse da ovunque, tocco dalla maniglia) ───────── */
	let soppressaClick = false;
	let raf = 0;
	let ultimoRiordino = 0;

	mosaico.addEventListener('pointerdown', (e) => {
		if (presa || levata || (e.pointerType === 'mouse' && e.button !== 0)) return;
		const li = e.target.closest('.cella');
		if (!li) return;
		const daPresa = !!e.target.closest('.tessera__presa');
		if (e.pointerType !== 'mouse' && !daPresa) return; // col dito la pagina scorre: si afferra solo dalla maniglia
		presa = { li, pid: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, attiva: false };
		if (daPresa) e.preventDefault();
	});
	mosaico.addEventListener('pointermove', (e) => {
		if (!presa || e.pointerId !== presa.pid) return;
		presa.x = e.clientX;
		presa.y = e.clientY;
		if (!presa.attiva && Math.hypot(presa.x - presa.x0, presa.y - presa.y0) > 6) iniziaTrascinamento();
	});
	mosaico.addEventListener('pointerup', (e) => {
		if (presa && e.pointerId === presa.pid) finisciTrascinamento(false);
	});
	mosaico.addEventListener('pointercancel', (e) => {
		if (presa && e.pointerId === presa.pid) finisciTrascinamento(true);
	});
	document.addEventListener(
		'keydown',
		(e) => {
			if (e.key === 'Escape' && presa?.attiva) {
				e.preventDefault();
				finisciTrascinamento(true);
			}
		},
		true,
	);

	function iniziaTrascinamento() {
		const { li } = presa;
		presa.attiva = true;
		presa.prima = ordineDaDom();
		try {
			mosaico.setPointerCapture(presa.pid); // gli eventi restano nostri anche se la tessera cambia posto nel DOM
		} catch {
			/* il puntatore non è più attivo: il trascinamento prosegue con gli eventi normali */
		}
		const r = li.getBoundingClientRect();
		const k = Math.min(1, 280 / r.width); // in mano la copia non supera ~280 px
		presa.off = { x: presa.x0 - r.left, y: presa.y0 - r.top };

		const g = document.createElement('div');
		g.className = 'fantasma tessera';
		g.setAttribute('aria-hidden', 'true');
		g.innerHTML = bottone(li).innerHTML;
		gsap.set(g, { x: r.left, y: r.top, width: r.width, height: r.height });
		document.body.append(g);
		presa.ghost = g;
		if (k < 1) {
			gsap.to(g, { width: r.width * k, height: r.height * k, duration: reduce ? 0 : 0.22, ease: 'power3.out' });
			gsap.to(presa.off, { x: presa.off.x * k, y: presa.off.y * k, duration: reduce ? 0 : 0.22, ease: 'power3.out' });
		}

		li.classList.add('is-segnaposto');
		mosaico.classList.add('is-trascinando');
		document.documentElement.classList.add('sta-trascinando');
		raf = requestAnimationFrame(ciclo);
	}

	/* Un fotogramma: la copia segue il puntatore, la pagina scorre ai bordi, e se il puntatore è sopra
	   un'altra tessera il segnaposto prende il suo posto (con una pausa, per non rimbalzare). */
	function ciclo(t) {
		if (!presa?.attiva) return;
		gsap.set(presa.ghost, { x: presa.x - presa.off.x, y: presa.y - presa.off.y });
		const m = 90;
		if (presa.y < m) scrollBy(0, -Math.ceil(((m - presa.y) / m) * 18));
		else if (presa.y > innerHeight - m) scrollBy(0, Math.ceil(((presa.y - (innerHeight - m)) / m) * 18));
		if (t - ultimoRiordino > 240) {
			const sotto = document.elementsFromPoint(presa.x, presa.y).find((n) => n.classList?.contains('cella'));
			if (sotto && sotto !== presa.li) {
				const lista = celleInOrdine();
				conFlip(() => (lista.indexOf(presa.li) < lista.indexOf(sotto) ? sotto.after(presa.li) : sotto.before(presa.li)));
				ultimoRiordino = t;
			}
		}
		raf = requestAnimationFrame(ciclo);
	}

	function finisciTrascinamento(annulla) {
		const p = presa;
		presa = null;
		if (!p.attiva) return;
		cancelAnimationFrame(raf);
		if (p.pid != null && mosaico.hasPointerCapture(p.pid)) mosaico.releasePointerCapture(p.pid);
		soppressaClick = true;
		setTimeout(() => (soppressaClick = false), 60);

		if (annulla) applicaOrdine(p.prima);
		anim?.progress(1); // le altre tessere arrivano subito: il posto finale è quello vero
		const r = p.li.getBoundingClientRect();
		const f = PER_ID[p.li.dataset.id];
		gsap.to(p.ghost, {
			x: r.left,
			y: r.top,
			width: r.width,
			height: r.height,
			duration: reduce ? 0 : 0.34,
			ease: 'power3.out',
			onComplete: () => {
				p.ghost.remove();
				p.li.classList.remove('is-segnaposto');
				mosaico.classList.remove('is-trascinando');
				document.documentElement.classList.remove('sta-trascinando');
			},
		});
		if (annulla) {
			annuncia('Spostamento annullato.');
			return;
		}
		registraMossa(p.prima);
		const n = +p.li.dataset.pos;
		if (!uguali(p.prima, ordineDaDom())) annuncia(`${f.nome}, posizione ${n} di ${N}${n <= VETRINA ? ', in vetrina' : ''}.`);
	}

	/* ───────── Tastiera: Spazio solleva, frecce spostano, Spazio/Invio posa, Esc annulla ───────── */
	let nelloSpostamento = false;

	function sposta(li, nuovo) {
		const lista = celleInOrdine();
		const i = lista.indexOf(li);
		nuovo = Math.max(0, Math.min(N - 1, nuovo));
		if (nuovo === i) return;
		nelloSpostamento = true; // spostare un nodo nel DOM gli toglie il focus: non è un "esco dalla tessera"
		conFlip(() => (i < nuovo ? lista[nuovo].after(li) : lista[nuovo].before(li)));
		bottone(li).focus({ preventScroll: true });
		nelloSpostamento = false;
		setTimeout(() => li.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }), reduce ? 0 : 520);
		annuncia(`${PER_ID[li.dataset.id].nome}, posizione ${nuovo + 1} di ${N}${nuovo < VETRINA ? ', in vetrina' : ''}.`);
	}
	function posa() {
		const { li, prima } = levata;
		levata = null;
		li.classList.remove('is-sollevata');
		registraMossa(prima);
		aggiornaStato();
		annuncia(`Posata in posizione ${li.dataset.pos}.`);
	}
	function annullaSollevamento() {
		const { li, prima } = levata;
		levata = null;
		li.classList.remove('is-sollevata');
		applicaOrdine(prima);
		bottone(li).focus({ preventScroll: true });
		annuncia('Spostamento annullato.');
	}

	mosaico.addEventListener('keydown', (e) => {
		const btn = e.target.closest('.tessera');
		if (!btn || presa) return;
		const li = btn.parentElement;
		if (e.key === ' ') {
			e.preventDefault();
			if (!levata) {
				levata = { li, prima: ordineDaDom() };
				li.classList.add('is-sollevata');
				annuncia(`${PER_ID[li.dataset.id].nome} sollevata, posizione ${li.dataset.pos} di ${N}. Frecce per spostarla, Spazio per posarla, Esc per annullare.`);
			} else if (levata.li === li) posa();
			return;
		}
		if (!levata || levata.li !== li) return;
		const i = celleInOrdine().indexOf(li);
		const dove = { ArrowLeft: i - 1, ArrowUp: i - 1, ArrowRight: i + 1, ArrowDown: i + 1, Home: 0, End: N - 1 }[e.key];
		if (dove !== undefined) {
			e.preventDefault();
			sposta(li, dove);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			posa();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			annullaSollevamento();
		}
	});
	// Su un bottone lo Spazio "clicca" al rilascio: qui serve solo a sollevare.
	mosaico.addEventListener('keyup', (e) => {
		if (e.key === ' ' && e.target.closest('.tessera')) e.preventDefault();
	});
	mosaico.addEventListener('focusout', (e) => {
		if (levata && !nelloSpostamento && e.target.closest('.cella') === levata.li && !levata.li.contains(e.relatedTarget)) posa();
	});

	/* ───────── Proiezione ───────── */
	const dlg = $('#proiezione');
	const pFoto = $('#p-foto');
	const pAmb = $('#p-amb');
	const pScena = $('#p-scena');
	const pBarra = $('#p-barra');
	let serie = [];
	let corr = -1;
	let occupato = false;
	const caricate = new Map();

	function precarica(f) {
		if (!caricate.has(f.id)) {
			const im = new Image();
			im.src = urlGrande(f);
			caricate.set(f.id, im.decode().catch(() => {}));
		}
		return caricate.get(f.id);
	}
	const attendi = (f) => Promise.race([precarica(f), sleep(900)]);
	const vicine = () => requestIdleCallback?.(() => [serie[(corr + 1) % N], serie[(corr - 1 + N) % N]].forEach((id) => precarica(PER_ID[id])));

	function riempi(f, i) {
		pFoto.alt = f.nome + (f.luogo ? `, ${f.luogo}` : '');
		pFoto.src = urlGrande(f);
		pAmb.src = urlTessera(f);
		$('#p-nome').textContent = f.nome;
		$('#p-luogo').textContent = f.luogo;
		$('#p-credito').innerHTML =
			`Foto di <a href="https://unsplash.com/@${f.utente}?utm_source=loop_studio_lab&utm_medium=referral" target="_blank" rel="noopener">${f.autore}<span class="sr-only"> (si apre in una nuova scheda)</span></a> su Unsplash`;
		$('#p-pos').textContent = `${pad(i + 1)} / ${N}`;
		$('#p-vetrina').hidden = i >= VETRINA;
	}

	async function apri(id, li) {
		if (dlg.open || occupato) return;
		occupato = true;
		serie = ordineDaDom(); // la proiezione scorre nell'ordine ATTUALE della griglia
		corr = serie.indexOf(id);
		await attendi(PER_ID[id]);
		riempi(PER_ID[id], corr);
		const r = li.getBoundingClientRect();
		dlg.showModal();
		dlg.focus({ preventScroll: true });
		if (reduce) {
			dlg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
		} else {
			// Dissolvenza e un leggero ingrandimento che parte dalla tessera cliccata.
			const s = pScena.getBoundingClientRect();
			pScena.style.transformOrigin = `${r.left + r.width / 2 - s.left}px ${r.top + r.height / 2 - s.top}px`;
			pScena.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 360, easing: EASE_OUT });
			$('.p-ambiente', dlg).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'ease-out' });
			pBarra.animate([{ opacity: 0, transform: 'translateY(0.75rem)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, delay: 80, easing: EASE_OUT, fill: 'backwards' });
			for (const el of dlg.querySelectorAll('.p-chiudi, .p-freccia')) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 120, easing: 'ease-out', fill: 'backwards' });
		}
		occupato = false;
		vicine();
	}

	async function chiudi() {
		if (!dlg.open || occupato) return;
		occupato = true;
		const li = celle.get(serie[corr]);
		if (!reduce) {
			await Promise.all([
				pScena.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.96)' }], { duration: 200, easing: EASE_OUT, fill: 'forwards' }).finished,
				dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' }).finished,
			]);
		}
		dlg.close();
		for (const a of [...dlg.getAnimations({ subtree: true }), ...pScena.getAnimations()]) a.cancel();
		occupato = false;
		bottone(li).focus({ preventScroll: true });
		li.scrollIntoView({ block: 'nearest' });
	}

	async function vai(d) {
		if (!dlg.open || occupato) return;
		occupato = true;
		corr = (corr + d + N) % N;
		const f = PER_ID[serie[corr]];
		const dir = d > 0 ? 1 : -1;
		const caricamento = attendi(f);
		if (!reduce) await pScena.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-24 * dir}px)` }], { duration: 140, easing: 'ease-out', fill: 'forwards' }).finished;
		await caricamento;
		riempi(f, corr);
		for (const a of pScena.getAnimations()) a.cancel();
		if (!reduce) {
			pAmb.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
			pBarra.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
			await pScena.animate([{ opacity: 0, transform: `translateX(${24 * dir}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 280, easing: EASE_OUT }).finished;
		}
		occupato = false;
		vicine();
	}

	mosaico.addEventListener('click', (e) => {
		const btn = e.target.closest('.tessera');
		if (!btn) return;
		if (soppressaClick) {
			soppressaClick = false;
			return;
		}
		if (levata || e.target.closest('.tessera__presa')) return; // la maniglia è solo per trascinare
		apri(btn.parentElement.dataset.id, btn.parentElement);
	});
	$('#p-chiudi').addEventListener('click', chiudi);
	$('#p-prec').addEventListener('click', () => vai(-1));
	$('#p-succ').addEventListener('click', () => vai(1));
	dlg.addEventListener('cancel', (e) => {
		e.preventDefault(); // Esc: si chiude con la sua animazione
		chiudi();
	});
	dlg.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') vai(-1);
		if (e.key === 'ArrowRight') vai(1);
	});
	// Swipe orizzontale sul tocco; un clic su uno spazio vuoto (non su foto, testi o pulsanti) chiude.
	let swipe = null;
	let mossoSwipe = false;
	dlg.addEventListener('pointerdown', (e) => {
		mossoSwipe = false;
		swipe = e.target.closest('button, a') ? null : { x: e.clientX, y: e.clientY };
	});
	dlg.addEventListener('pointerup', (e) => {
		if (!swipe) return;
		const dx = e.clientX - swipe.x;
		const dy = e.clientY - swipe.y;
		swipe = null;
		if (Math.abs(dx) > 10 || Math.abs(dy) > 10) mossoSwipe = true;
		if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) vai(dx < 0 ? 1 : -1);
	});
	dlg.addEventListener('click', (e) => {
		if (mossoSwipe) return;
		if (e.target === dlg || e.target === pScena || e.target.closest('.p-ambiente')) chiudi();
	});

	/* ───────── Entrata ───────── */
	if (!reduce) {
		gsap.from(celleInOrdine(), { opacity: 0, y: 22, duration: 0.55, ease: 'power3.out', stagger: 0.03, clearProps: 'opacity,transform' });
	}
})();
