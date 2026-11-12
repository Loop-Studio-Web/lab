// Anteprima: pressione lunga (o clic/Invio) su una card → il foglio parte dalla card (FLIP) fino alla posizione di «anteprima».
// Con il dito ancora giù, trascinare in alto lo fa crescere fino a tutto schermo; rilasciando su un pulsante lo attiva.
// Il foglio resta aperto dopo il rilascio (si chiude con Esc, X o toccando fuori): meno gesti sbagliati.
(() => {
	const root = document.querySelector('[data-sf]');
	const tel = root.querySelector('[data-tel]');
	const home = root.querySelector('[data-home]');
	const grid = root.querySelector('[data-grid]');
	const back = root.querySelector('[data-back]');
	const pop = root.querySelector('[data-pop]');
	const menu = root.querySelector('[data-menu]');
	const img = root.querySelector('[data-img]');
	const capT = root.querySelector('[data-cap-t]');
	const capC = root.querySelector('[data-cap-c]');
	const live = root.querySelector('[data-live]');
	const btnClose = root.querySelector('[data-close]');
	const btnOpen = root.querySelector('[data-open]');
	const btnSave = root.querySelector('[data-save]');

	const POSTI = SEF.POSTI.slice(0, 4);
	const LUNGA = 380;
	const SALITA = 90; // px di trascinamento in alto per arrivare a tutto schermo
	const salvati = new Set();

	let stato = 'chiuso';
	let carta = null;
	let timer = 0;
	let lunga = false;
	let premuta = null;
	let sy = 0;
	let p = 0;
	let sopra = null;

	POSTI.forEach((post, i) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'pk-card';
		b.dataset.i = i;
		const im = document.createElement('img');
		im.src = SEF.img(post);
		im.alt = '';
		im.width = 900;
		im.height = 600;
		im.decoding = 'async';
		im.draggable = false;
		const t = document.createElement('span');
		t.textContent = post.t;
		b.append(im, t);
		grid.append(b);
	});

	// Dove sta la card rispetto al foglio a tutta cornice: serve per partire da lì e tornarci.
	const dalla = (c) => {
		const r = c.getBoundingClientRect();
		const f = tel.getBoundingClientRect();
		return { s: r.width / f.width, tx: r.left + r.width / 2 - (f.left + f.width / 2), ty: r.top + r.height / 2 - (f.top + f.height / 2) };
	};
	const poni = ({ s, tx, ty }, r = '0.9rem') => {
		pop.style.setProperty('--s', s);
		pop.style.setProperty('--tx', `${tx}px`);
		pop.style.setProperty('--ty', `${ty}px`);
		pop.style.setProperty('--r', r);
	};
	const pulisci = () => ['--s', '--tx', '--ty', '--r'].forEach((k) => pop.style.removeProperty(k));

	const apri = (c, daTastiera) => {
		if (stato !== 'chiuso') return;
		stato = 'anteprima';
		carta = c;
		const post = POSTI[Number(c.dataset.i)];
		img.src = SEF.img(post);
		capT.textContent = post.t;
		capC.textContent = post.c;
		btnSave.setAttribute('aria-pressed', String(salvati.has(post.n)));
		pop.classList.remove('is-full');
		pop.classList.add('is-drag');
		poni(dalla(c));
		pop.classList.add('is-on');
		void pop.getBoundingClientRect();
		pulisci();
		pop.classList.remove('is-drag');
		back.classList.add('is-on');
		menu.classList.add('is-on');
		home.inert = true;
		pop.inert = false;
		menu.inert = false;
		live.textContent = post.t;
		if (daTastiera) btnOpen.focus({ preventScroll: true });
		else pop.focus({ preventScroll: true });
	};
	const intero = () => {
		if (stato === 'chiuso') return;
		stato = 'intero';
		pop.classList.remove('is-drag');
		pulisci();
		pop.classList.add('is-full');
		menu.classList.remove('is-on');
		menu.inert = true;
		btnClose.focus({ preventScroll: true });
	};
	const chiudi = () => {
		if (stato === 'chiuso') return;
		stato = 'chiuso';
		pop.classList.remove('is-drag', 'is-full');
		poni(dalla(carta));
		pop.classList.remove('is-on');
		back.classList.remove('is-on');
		menu.classList.remove('is-on');
		home.inert = false;
		pop.inert = true;
		menu.inert = true;
		const c = carta;
		c.focus({ preventScroll: true });
		setTimeout(() => stato === 'chiuso' && pulisci(), 480);
	};

	// Pressione lunga e trascinamento in alto.
	const pulisciPressione = () => {
		clearTimeout(timer);
		premuta?.classList.remove('is-press');
		sopra?.classList.remove('is-target');
		premuta = null;
		sopra = null;
	};
	grid.addEventListener('pointerdown', (e) => {
		const c = e.target.closest('.pk-card');
		if (!c || e.button !== 0 || stato !== 'chiuso') return;
		premuta = c;
		sy = e.clientY;
		lunga = false;
		p = 0;
		c.classList.add('is-press');
		c.setPointerCapture(e.pointerId);
		timer = setTimeout(() => {
			lunga = true;
			c.classList.remove('is-press');
			apri(c, false);
		}, LUNGA);
	});
	grid.addEventListener('pointermove', (e) => {
		if (!premuta || stato !== 'anteprima' || !lunga) return;
		const dy = e.clientY - sy;
		p = Math.min(Math.max(-dy / SALITA, 0), 1);
		pop.classList.add('is-drag');
		pop.style.setProperty('--s', 0.72 + 0.28 * p);
		pop.style.setProperty('--ty', `${-6 * (1 - p)}%`);
		pop.style.setProperty('--r', `${2 - 0.4 * p}rem`);
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const att = el && el.closest('.pk-act');
		if (att !== sopra) {
			sopra?.classList.remove('is-target');
			sopra = att;
			sopra?.classList.add('is-target');
		}
	});
	const rilascio = (e) => {
		if (!premuta) return;
		const att = sopra;
		const fatta = lunga && stato === 'anteprima';
		const passa = p > 0.6;
		pulisciPressione();
		if (!fatta) return;
		if (passa && e.type === 'pointerup') intero();
		else {
			pop.classList.remove('is-drag');
			pulisci();
			if (att && e.type === 'pointerup') att.click();
		}
	};
	grid.addEventListener('pointerup', rilascio);
	grid.addEventListener('pointercancel', rilascio);
	grid.addEventListener('contextmenu', (e) => e.preventDefault());

	// Clic o Invio: stessa anteprima, senza bisogno di tenere premuto. Dopo una pressione lunga il clic finale si ignora.
	grid.addEventListener('click', (e) => {
		const c = e.target.closest('.pk-card');
		if (!c) return;
		if (lunga) {
			lunga = false;
			return;
		}
		apri(c, e.detail === 0);
	});

	btnOpen.addEventListener('click', intero);
	btnClose.addEventListener('click', chiudi);
	back.addEventListener('click', chiudi);
	pop.addEventListener('click', (e) => {
		if (stato === 'anteprima' && !e.target.closest('button')) intero();
	});
	btnSave.addEventListener('click', () => {
		const post = POSTI[Number(carta.dataset.i)];
		const si = !salvati.has(post.n);
		si ? salvati.add(post.n) : salvati.delete(post.n);
		btnSave.setAttribute('aria-pressed', String(si));
		live.textContent = `${si ? LabI18n.t('pk.saved', 'Salvata') : LabI18n.t('pk.unsaved', 'Rimossa dai salvati')}: ${post.t}`;
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') chiudi();
	});
})();
