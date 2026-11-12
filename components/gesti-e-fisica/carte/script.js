// Carte: la carta in cima segue il dito (Fisica.trascina); al rilascio decide la velocità oltre alla distanza.
// Lancio = molla verso fuori campo con la velocità del dito; altrimenti la molla la riporta al centro.
(() => {
	const root = document.querySelector('[data-cd]');
	const deck = root.querySelector('[data-deck]');
	const empty = root.querySelector('[data-empty]');
	const btns = root.querySelector('[data-btns]');
	const live = root.querySelector('[data-live]');
	const flash = root.querySelector('[data-flash]');
	const [btnNo, btnYes] = [root.querySelector('[data-no]'), root.querySelector('[data-yes]')];

	// Contenuti di fantasia (idee per il fine settimana). Le foto sono quelle già in _shared/img (WebP, 900 px).
	const CARTE = [
		{ t: LabI18n.t('carte.c1.t', 'Lago d’Orta'), tag: LabI18n.t('carte.tag.acqua', 'Acqua'), r: LabI18n.t('carte.c1.r', '2 ore da Milano · sentieri facili'), f: 'alpine-lake' },
		{ t: LabI18n.t('carte.c2.t', 'Cinque Terre'), tag: LabI18n.t('carte.tag.mare', 'Mare'), r: LabI18n.t('carte.c2.r', 'Treno locale · niente auto'), f: 'manarola' },
		{ t: LabI18n.t('carte.c3.t', 'Val Gardena'), tag: LabI18n.t('carte.tag.montagna', 'Montagna'), r: LabI18n.t('carte.c3.r', 'Baite e panorami · da 1.200 m'), f: 'snow-lake' },
		{ t: LabI18n.t('carte.c4.t', 'Matera'), tag: LabI18n.t('carte.tag.citta', 'Città'), r: LabI18n.t('carte.c4.r', 'Notti nei Sassi · 2 giorni'), f: 'desert' },
		{ t: LabI18n.t('carte.c5.t', 'Delta del Po'), tag: LabI18n.t('carte.tag.natura', 'Natura'), r: LabI18n.t('carte.c5.r', 'In bici tra le valli'), f: 'fog-forest' },
		{ t: LabI18n.t('carte.c6.t', 'Ortigia'), tag: LabI18n.t('carte.tag.mare', 'Mare'), r: LabI18n.t('carte.c6.r', 'Mercato e scogli · volo diretto'), f: 'beach' },
		{ t: LabI18n.t('carte.c7.t', 'Cascate del Serio'), tag: LabI18n.t('carte.tag.montagna', 'Montagna'), r: LabI18n.t('carte.c7.r', 'Sentiero con rifugio'), f: 'waterfall' },
		{ t: LabI18n.t('carte.c8.t', 'Cielo d’Islanda'), tag: LabI18n.t('carte.tag.natura', 'Natura'), r: LabI18n.t('carte.c8.r', 'Aurora boreale · 4 giorni'), f: 'aurora' },
	];

	let indice = 0;
	let molla = null;
	let occupata = false;
	const larghezza = () => deck.getBoundingClientRect().width;

	const crea = (c) => {
		const el = document.createElement('article');
		el.className = 'cd__card';
		el.innerHTML = `<img class="cd__photo" alt="" width="900" height="600" decoding="async" draggable="false"><span class="cd__shade"></span><span class="cd__stamp cd__stamp--yes"></span><span class="cd__stamp cd__stamp--no"></span><span class="cd__tag"></span><h2 class="cd__title"></h2><p class="cd__line"></p>`;
		el.querySelector('.cd__photo').src = `../../_shared/img/${c.f}-m.webp`;
		el.querySelector('.cd__tag').textContent = c.tag;
		el.querySelector('.cd__title').textContent = c.t;
		el.querySelector('.cd__line').textContent = c.r;
		el.querySelector('.cd__stamp--yes').textContent = LabI18n.t('carte.stampyes', 'Sì');
		el.querySelector('.cd__stamp--no').textContent = LabI18n.t('carte.stampno', 'No');
		return el;
	};

	// Mostra le prime tre carte non ancora scartate, dalla più lontana alla più vicina.
	const ridisponi = () => {
		const carte = [...deck.children];
		carte.forEach((el, d) => {
			el.style.setProperty('--d', d);
			el.classList.toggle('is-top', d === 0);
			el.tabIndex = d === 0 ? 0 : -1;
			el.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
		});
		const top = deck.firstElementChild;
		if (top) {
			top.setAttribute('role', 'group');
			top.setAttribute('aria-roledescription', LabI18n.t('carte.card', 'carta'));
		}
		const finito = !top;
		empty.hidden = !finito;
		btns.hidden = finito;
	};
	const riempi = () => {
		while (deck.children.length < 3 && indice + deck.children.length < CARTE.length) {
			deck.append(crea(CARTE[indice + deck.children.length]));
		}
		ridisponi();
	};

	const muovi = (el, x) => {
		const w = larghezza();
		const p = Math.min(Math.abs(x) / (w * 0.4), 1);
		el.style.transform = `translate3d(${x}px,0,0) rotate(${(x / w) * 16}deg)`;
		el.querySelector('.cd__stamp--yes').style.opacity = x > 0 ? p : 0;
		el.querySelector('.cd__stamp--no').style.opacity = x < 0 ? p : 0;
		deck.classList.add('is-moving');
		[...deck.children].slice(1).forEach((c) => c.style.setProperty('--p', p));
	};
	const azzera = () => {
		deck.classList.remove('is-moving');
		[...deck.children].forEach((c) => c.style.setProperty('--p', 0));
	};

	const torna = (el, x, v) => {
		molla = Fisica.molla({ da: x, a: 0, v, rigidezza: 220, smorzamento: 20 }, (px) => muovi(el, px), () => {
			molla = null;
			azzera();
		});
	};

	const lancia = (el, x, v, verso) => {
		const w = larghezza();
		const nome = el.querySelector('.cd__title').textContent;
		occupata = true;
		el.style.pointerEvents = 'none';
		flash.dataset.verso = verso > 0 ? 'yes' : 'no';
		flash.classList.remove('is-on');
		void flash.offsetWidth;
		flash.classList.add('is-on');
		// Le carte sotto avanzano subito: --p arriva a 1 mentre la carta esce.
		const conclusione = () => {
			el.remove();
			indice++;
			azzera();
			riempi();
			occupata = false;
			live.textContent = `${verso > 0 ? LabI18n.t('carte.liked', 'Ti piace') : LabI18n.t('carte.skipped', 'Saltata')}: ${nome}`;
			deck.firstElementChild?.focus({ preventScroll: true });
		};
		const fuori = verso * w * 1.3;
		let chiusa = false;
		const chiudi = () => {
			if (chiusa) return;
			chiusa = true;
			molla && molla.stop();
			molla = null;
			conclusione();
		};
		molla = Fisica.molla(
			{ da: x, a: fuori, v: verso * Math.max(Math.abs(v), 1400), rigidezza: 140, smorzamento: 18 },
			(px) => {
				muovi(el, px);
				if (Math.abs(px) > w * 1.1) chiudi();
			},
			chiudi,
		);
	};

	const decidi = (dx, vx) => {
		const w = larghezza();
		if (Math.abs(vx) > 600 && Math.sign(vx) === Math.sign(dx || vx)) return Math.sign(vx);
		if (Math.abs(dx) > w * 0.35) return Math.sign(dx);
		return 0;
	};

	let corrente = 0;
	const prepara = () => {
		const top = deck.firstElementChild;
		if (!top) return null;
		return top;
	};

	Fisica.trascina(deck, {
		onStart(e) {
			if (occupata) return;
			molla && molla.stop();
			molla = null;
			corrente = 0;
			const top = prepara();
			if (!top || !top.contains(e.target)) {
				deck._ignora = true;
				return;
			}
			deck._ignora = false;
			// riprende da dove la molla si era fermata: l'origine del gesto è il punto di contatto
			corrente = parseFloat((top.style.transform.match(/translate3d\((-?[\d.]+)px/) || [])[1]) || 0;
		},
		onMove({ dx }) {
			if (occupata || deck._ignora) return;
			const top = prepara();
			if (top) muovi(top, corrente + dx);
		},
		onEnd({ dx, vx, annullato }) {
			if (occupata || deck._ignora) return;
			const top = prepara();
			if (!top) return;
			const x = corrente + dx;
			const verso = annullato ? 0 : decidi(x, vx);
			if (verso) lancia(top, x, vx, verso);
			else torna(top, x, vx);
		},
	});

	// Gli stessi gesti con i pulsanti e con la tastiera: un lancio con velocità di default.
	const comanda = (verso) => {
		const top = prepara();
		if (!top || occupata) return;
		molla && molla.stop();
		const m = (top.style.transform.match(/translate3d\((-?[\d.]+)px/) || [])[1];
		lancia(top, parseFloat(m) || 0, 0, verso);
	};
	btnNo.addEventListener('click', () => comanda(-1));
	btnYes.addEventListener('click', () => comanda(1));
	deck.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			comanda(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			comanda(-1);
		}
	});
	root.querySelector('[data-again]').addEventListener('click', () => {
		indice = 0;
		riempi();
		deck.firstElementChild?.focus({ preventScroll: true });
	});

	riempi();
})();
