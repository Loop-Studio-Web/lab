// Storie: i post raggruppati per autore. Ogni storia dura 5 s; il tempo lo conta questo script (barre con scaleX),
// si ferma con la pressione lunga, col pulsante, a scheda non visibile. Il gesto in giù usa Fisica.trascina + molla.
(() => {
	const root = document.querySelector('[data-sf]');
	const tel = root.querySelector('[data-tel]');
	const ring = root.querySelector('[data-ring]');
	const view = root.querySelector('[data-view]');
	const hit = root.querySelector('[data-hit]');
	const img = root.querySelector('[data-img]');
	const av = root.querySelector('[data-av]');
	const nameEl = root.querySelector('[data-name]');
	const bars = root.querySelector('[data-bars]');
	const capT = root.querySelector('[data-cap-t]');
	const capC = root.querySelector('[data-cap-c]');
	const live = root.querySelector('[data-live]');
	const btnPause = root.querySelector('[data-pause]');
	const btnClose = root.querySelector('[data-close]');
	const btnPrev = root.querySelector('[data-prev]');
	const btnNext = root.querySelector('[data-next]');

	const AUTORI = SEF.autori();
	const DURATA = 5000;
	const HOLD_MS = 250;
	const ridotto = Fisica.ridotto();

	let a = 0; // autore aperto
	let s = 0; // storia dell'autore
	let t = 0; // ms trascorsi nella storia corrente
	let aperto = false;
	let manuale = false;
	let tenuto = false;
	let visibile = true;
	let raf = 0;
	let ultimo = 0;
	let origine = null;
	const visti = new Set();

	AUTORI.forEach((au, i) => {
		const li = document.createElement('li');
		li.className = 'st-item';
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'st-btn';
		b.dataset.i = i;
		b.setAttribute('aria-label', `${LabI18n.t('st.open', 'Storie di')} ${au.nome}`);
		const im = document.createElement('img');
		im.src = SEF.img(au.posti[0]);
		im.alt = '';
		im.width = 56;
		im.height = 56;
		im.loading = 'lazy';
		b.append(im);
		const nome = document.createElement('span');
		nome.className = 'st-who';
		nome.textContent = au.nome;
		li.append(b, nome);
		ring.append(li);
	});

	const corrente = () => AUTORI[a].posti[s];
	const fermo = () => manuale || tenuto || !visibile || ridotto;

	const costruisciBarre = () => {
		bars.textContent = '';
		AUTORI[a].posti.forEach(() => {
			const b = document.createElement('span');
			b.className = 'st-bar';
			b.append(document.createElement('i'));
			bars.append(b);
		});
	};
	const disegna = () => {
		[...bars.children].forEach((b, i) => {
			const p = i < s ? 1 : i === s ? (ridotto ? 1 : t / DURATA) : 0;
			b.firstChild.style.transform = `scaleX(${p})`;
		});
	};
	const mostra = () => {
		const au = AUTORI[a];
		const p = corrente();
		img.src = SEF.img(p);
		av.src = SEF.img(au.posti[0]);
		nameEl.textContent = au.nome;
		capT.textContent = p.t;
		capC.textContent = p.c;
		live.textContent = `${au.nome}: ${p.t}`;
		const prossima = AUTORI[a].posti[s + 1] || (AUTORI[a + 1] && AUTORI[a + 1].posti[0]);
		if (prossima) new Image().src = SEF.img(prossima);
		t = 0;
		disegna();
	};

	const avanza = (verso) => {
		if (verso > 0) {
			if (s < AUTORI[a].posti.length - 1) s++;
			else if (a < AUTORI.length - 1) {
				visti.add(a);
				a++;
				s = 0;
				costruisciBarre();
			} else return chiudi();
		} else if (s > 0) s--;
		else if (a > 0) {
			a--;
			s = AUTORI[a].posti.length - 1;
			costruisciBarre();
		}
		mostra();
	};

	const tick = (ts) => {
		raf = requestAnimationFrame(tick);
		const dt = Math.min(ts - ultimo, 64);
		ultimo = ts;
		if (fermo()) return;
		t += dt;
		if (t >= DURATA) return avanza(1);
		disegna();
	};
	const avvia = () => {
		cancelAnimationFrame(raf);
		ultimo = performance.now();
		raf = requestAnimationFrame(tick);
	};

	const apri = (i, da) => {
		a = i;
		s = 0;
		manuale = false;
		tenuto = false;
		btnPause.setAttribute('aria-pressed', 'false');
		origine = da;
		const r = da.getBoundingClientRect();
		const f = tel.getBoundingClientRect();
		view.style.setProperty('--ox', `${r.left + r.width / 2 - f.left}px`);
		view.style.setProperty('--oy', `${r.top + r.height / 2 - f.top}px`);
		costruisciBarre();
		mostra();
		view.inert = false;
		view.classList.remove('is-hold');
		requestAnimationFrame(() => view.classList.add('is-open'));
		aperto = true;
		btnPause.hidden = ridotto;
		view.focus({ preventScroll: true });
		avvia();
	};
	function chiudi() {
		if (!aperto) return;
		aperto = false;
		cancelAnimationFrame(raf);
		visti.add(a);
		const btn = ring.querySelector(`[data-i="${a}"]`);
		if (btn) btn.classList.add('is-seen');
		view.classList.remove('is-open', 'is-drag', 'is-hold');
		view.style.transform = '';
		view.inert = true;
		(btn || origine)?.focus({ preventScroll: true });
	}

	ring.addEventListener('click', (e) => {
		const b = e.target.closest('.st-btn');
		if (b) apri(Number(b.dataset.i), b);
	});
	btnClose.addEventListener('click', chiudi);
	btnPrev.addEventListener('click', () => avanza(-1));
	btnNext.addEventListener('click', () => avanza(1));
	btnPause.addEventListener('click', () => {
		manuale = !manuale;
		btnPause.setAttribute('aria-pressed', String(manuale));
	});
	view.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') chiudi();
		else if (e.key === 'ArrowRight') avanza(1);
		else if (e.key === 'ArrowLeft') avanza(-1);
		else if (e.key === ' ' && !e.target.closest('button') && !ridotto) {
			e.preventDefault();
			btnPause.click();
		}
	});

	// Gesto sul livello dell'immagine: tocco sui lati, pressione lunga = pausa, trascinamento in giù = chiudi con la molla.
	let timer = 0;
	let trascinando = false;
	let mosso = false;
	let x0 = 0;
	let molla = null;
	const altezza = () => tel.getBoundingClientRect().height;
	const applica = (dy) => {
		const p = Math.min(dy / altezza(), 1);
		view.style.transform = `translate3d(0, ${dy}px, 0) scale(${1 - p * 0.22})`;
		view.style.opacity = String(1 - p * 0.5);
	};
	Fisica.trascina(hit, {
		onStart(e) {
			molla && molla.stop();
			molla = null;
			x0 = e.clientX;
			trascinando = false;
			mosso = false;
			timer = setTimeout(() => {
				tenuto = true;
				view.classList.add('is-hold');
			}, HOLD_MS);
		},
		onMove({ dx, dy }) {
			if (!trascinando && !mosso && Math.hypot(dx, dy) > 10) {
				mosso = true;
				clearTimeout(timer);
				if (dy > 0 && dy > Math.abs(dx)) {
					trascinando = true;
					view.classList.add('is-drag');
				}
			}
			if (trascinando) applica(Math.max(dy, 0));
		},
		onEnd({ dy, vy, annullato }) {
			clearTimeout(timer);
			if (trascinando) {
				trascinando = false;
				const h = altezza();
				if (!annullato && (dy > h * 0.25 || vy > 700)) {
					view.style.transform = '';
					view.style.opacity = '';
					chiudi();
					return;
				}
				molla = Fisica.molla({ da: Math.max(dy, 0), a: 0, v: vy, rigidezza: 220, smorzamento: 22 }, applica, () => {
					molla = null;
					view.classList.remove('is-drag');
					view.style.transform = '';
					view.style.opacity = '';
				});
				return;
			}
			if (tenuto) {
				tenuto = false;
				view.classList.remove('is-hold');
				return;
			}
			if (mosso || annullato) return;
			const r = hit.getBoundingClientRect();
			avanza(x0 - r.left < r.width * 0.3 ? -1 : 1);
		},
	});

	// Il tempo corre solo se il telefono è visibile (tab attivo e finestra in primo piano).
	new IntersectionObserver(([en]) => {
		visibile = en.isIntersecting && !document.hidden;
	}).observe(tel);
	document.addEventListener('visibilitychange', () => {
		visibile = !document.hidden;
	});
})();
