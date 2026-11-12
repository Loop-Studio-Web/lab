// Pannello a tre soste: si trascina dalla maniglia; al rilascio si proietta dove andrebbe con la velocità attuale e si sceglie la sosta più vicina.
(() => {
	const tel = document.querySelector('[data-pn]');
	const sheet = tel.querySelector('[data-sheet]');
	const grab = tel.querySelector('[data-grab]');
	const handle = tel.querySelector('[data-handle]');
	const list = tel.querySelector('[data-list]');
	const stato = document.querySelector('[data-state]');

	// Contenuti di fantasia.
	const LUOGHI = [
		['Bar Aurora', '120 m', 'Caffè', 200],
		['Farmacia Rossi', '240 m', 'Salute', 150],
		['Forno del Borgo', '300 m', 'Pane', 35],
		['Libreria Tre Archi', '410 m', 'Libri', 270],
		['Giardino delle Mura', '520 m', 'Parco', 120],
		['Pizzeria Da Nino', '640 m', 'Cena', 15],
		['Bici Officina', '700 m', 'Bici', 190],
		['Gelateria Nuvola', '850 m', 'Gelato', 320],
	];
	LUOGHI.forEach(([nome, dist, cat, h]) => {
		const li = document.createElement('li');
		li.className = 'pn__item';
		li.innerHTML = '<span class="pn__ico"></span><span><b></b><br /><small></small></span><small></small>';
		const [ico, testo, d] = [li.children[0], li.children[1], li.children[2]];
		ico.style.setProperty('--h', h);
		ico.textContent = nome[0];
		testo.querySelector('b').textContent = nome;
		testo.querySelector('small').textContent = cat;
		d.textContent = dist;
		list.append(li);
	});

	let H = 0;
	let soste = [0, 0, 0]; // translateY in px: chiuso, metà, aperto
	let indice = 1;
	let y = 0;
	let molla = null;
	let mosso = false;

	const misura = () => {
		H = tel.clientHeight;
		const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
		soste = [H - 4.6 * rem, H * 0.5, H * 0.07];
	};
	const metti = (v) => {
		y = v;
		sheet.style.transform = `translate3d(0,${v}px,0)`;
	};
	const annuncia = () => {
		const frasi = [
			LabI18n.t('pannello.s0', 'Pannello chiuso'),
			LabI18n.t('pannello.s1', 'Pannello a metà'),
			LabI18n.t('pannello.s2', 'Pannello aperto'),
		];
		stato.textContent = frasi[indice];
	};
	const vai = (i, v = 0) => {
		indice = Math.max(0, Math.min(2, i));
		tel.dataset.snap = indice;
		molla && molla.stop();
		molla = Fisica.molla({ da: y, a: soste[indice], v, rigidezza: 220, smorzamento: 26 }, metti, () => (molla = null));
		annuncia();
	};

	// Fuori dalle soste estreme il pannello oppone resistenza (elastico) invece di fermarsi di colpo.
	const vincola = (v) => {
		if (v < soste[2]) return soste[2] - Fisica.elastico(soste[2] - v, 48);
		if (v > soste[0]) return soste[0] + Fisica.elastico(v - soste[0], 48);
		return v;
	};

	let partenza = 0;
	Fisica.trascina(grab, {
		onStart() {
			molla && molla.stop();
			molla = null;
			partenza = y;
			mosso = false;
		},
		onMove({ dy }) {
			if (Math.abs(dy) > 4) mosso = true;
			metti(vincola(partenza + dy));
		},
		onEnd({ dy, vy, annullato }) {
			if (!mosso) return;
			// Dove arriverebbe tra ~0,2 s alla velocità attuale.
			const proiettata = annullato ? y : y + vy * 0.2;
			let migliore = 0;
			soste.forEach((s, i) => {
				if (Math.abs(s - proiettata) < Math.abs(soste[migliore] - proiettata)) migliore = i;
			});
			vai(migliore, vy);
			setTimeout(() => (mosso = false), 0);
		},
	});

	// Tocco/clic sulla maniglia = sosta successiva (e un clic dopo un trascinamento non conta).
	handle.addEventListener('click', () => {
		if (mosso) return;
		vai(indice === 2 ? 0 : indice + 1);
	});
	handle.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			vai(indice + 1);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			vai(indice - 1);
		}
	});

	misura();
	metti(soste[indice]);
	tel.dataset.snap = indice;
	annuncia();
	addEventListener('resize', () => {
		misura();
		molla && molla.stop();
		metti(soste[indice]);
	});
})();
