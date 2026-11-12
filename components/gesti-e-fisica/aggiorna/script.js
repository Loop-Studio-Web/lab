// Tira per aggiornare: con l'elenco in cima (scrollTop 0) un trascinamento verso il basso sposta l'elenco con resistenza crescente (Fisica.elastico).
// Oltre la soglia, al rilascio l'elenco si ferma in posizione di «caricamento», poi la molla lo riporta su. Mouse via Pointer Events, tocco via touch events
// (serve preventDefault sul touchmove, che i Pointer Events non permettono).
(() => {
	const root = document.querySelector('[data-pu]');
	const scroll = root.querySelector('[data-scroll]');
	const ind = root.querySelector('[data-ind]');
	const list = root.querySelector('[data-list]');
	const live = document.querySelector('[data-live]');

	const SOGLIA = 48; // px di spostamento (già con la resistenza) oltre i quali si aggiorna
	const TENUTA = 56; // dove si ferma l'elenco mentre carica
	const GIA = [
		[LabI18n.t('aggiorna.g1', 'La biblioteca resta aperta fino a mezzanotte'), LabI18n.t('aggiorna.t2h', '2 ore fa')],
		[LabI18n.t('aggiorna.g2', 'Nuovo orario per il bus 14'), LabI18n.t('aggiorna.t3h', '3 ore fa')],
		[LabI18n.t('aggiorna.g3', 'Mercato del sabato: spostato in piazza Verdi'), LabI18n.t('aggiorna.tieri', 'ieri')],
		[LabI18n.t('aggiorna.g4', 'Chiude per lavori il ponte vecchio'), LabI18n.t('aggiorna.tieri', 'ieri')],
		[LabI18n.t('aggiorna.g5', 'Concerto in giardino, ingresso libero'), LabI18n.t('aggiorna.t2g', '2 giorni fa')],
		[LabI18n.t('aggiorna.g6', 'Aperte le iscrizioni ai corsi serali'), LabI18n.t('aggiorna.t3g', '3 giorni fa')],
	];
	const NUOVE = [
		LabI18n.t('aggiorna.n1', 'Pista ciclabile: inaugurato il primo tratto'),
		LabI18n.t('aggiorna.n2', 'Domenica si vota nel quartiere per il parco'),
		LabI18n.t('aggiorna.n3', 'Acqua sospesa in via dei Mille dalle 14'),
		LabI18n.t('aggiorna.n4', 'Mostra fotografica alla stazione vecchia'),
		LabI18n.t('aggiorna.n5', 'Il forno di via Roma torna a fare il pane di segale'),
		LabI18n.t('aggiorna.n6', 'Controlli sui rifiuti: cosa cambia'),
		LabI18n.t('aggiorna.n7', 'Torna la corsa di primavera, percorso nuovo'),
		LabI18n.t('aggiorna.n8', 'Una nuova fermata davanti all’ospedale'),
	];
	let prossima = 0;

	const crea = (titolo, quando, nuova) => {
		const li = document.createElement('li');
		li.className = 'pu__item' + (nuova ? ' pu__item--new' : '');
		li.innerHTML = '<b></b><small></small>';
		li.firstChild.textContent = titolo;
		li.lastChild.textContent = quando;
		return li;
	};
	GIA.forEach(([t, q]) => list.append(crea(t, q, false)));

	let pull = 0;
	let molla = null;
	let occupato = false;

	const metti = (p) => {
		pull = p;
		scroll.style.transform = p ? `translate3d(0,${p}px,0)` : '';
		const k = Math.min(p / SOGLIA, 1);
		ind.style.opacity = k;
		ind.style.transform = `translate3d(0,${(k - 1) * 14}px,0) scale(${0.6 + 0.4 * k})`;
		root.dataset.armed = String(p >= SOGLIA && !occupato);
	};
	const vai = (a, v, fine) => {
		molla && molla.stop();
		molla = Fisica.molla({ da: pull, a, v, rigidezza: 200, smorzamento: 24 }, metti, () => {
			molla = null;
			fine && fine();
		});
	};

	const aggiorna = () => {
		if (occupato) return;
		occupato = true;
		root.dataset.busy = 'true';
		root.dataset.armed = 'false';
		live.textContent = LabI18n.t('aggiorna.loading', 'Aggiornamento in corso');
		vai(TENUTA, 0);
		setTimeout(() => {
			const titolo = NUOVE[prossima % NUOVE.length];
			prossima++;
			list.prepend(crea(titolo, LabI18n.t('aggiorna.now', 'adesso'), true));
			while (list.children.length > 14) list.lastChild.remove();
			occupato = false;
			root.dataset.busy = 'false';
			live.textContent = LabI18n.t('aggiorna.done', 'Elenco aggiornato: una novità');
			vai(0, 0);
		}, 1200);
	};

	// Logica unica del gesto: parte solo se l'elenco è in cima, e conta solo il verso verso il basso.
	let y0 = null;
	let tirando = false;
	const inizia = (y) => {
		if (occupato || scroll.scrollTop > 0) return false;
		molla && molla.stop();
		molla = null;
		y0 = y;
		tirando = false;
		return true;
	};
	const muovi = (y) => {
		if (y0 === null) return false;
		const dy = y - y0;
		if (dy <= 0 && !tirando) return false;
		tirando = true;
		metti(Fisica.elastico(Math.max(dy, 0), 120, 0.9));
		return true;
	};
	const rilascia = () => {
		if (y0 === null) return;
		y0 = null;
		if (!tirando) return;
		tirando = false;
		if (pull >= SOGLIA) aggiorna();
		else vai(0, 0);
	};

	scroll.addEventListener('pointerdown', (e) => {
		if (e.pointerType === 'touch' || e.button !== 0) return;
		if (inizia(e.clientY)) scroll.setPointerCapture(e.pointerId);
	});
	scroll.addEventListener('pointermove', (e) => {
		if (e.pointerType !== 'touch') muovi(e.clientY);
	});
	scroll.addEventListener('pointerup', (e) => e.pointerType !== 'touch' && rilascia());
	scroll.addEventListener('pointercancel', (e) => e.pointerType !== 'touch' && rilascia());

	scroll.addEventListener('touchstart', (e) => inizia(e.touches[0].clientY), { passive: true });
	scroll.addEventListener(
		'touchmove',
		(e) => {
			if (muovi(e.touches[0].clientY) && e.cancelable) e.preventDefault();
		},
		{ passive: false },
	);
	scroll.addEventListener('touchend', rilascia);
	scroll.addEventListener('touchcancel', rilascia);

	root.querySelector('[data-refresh]').addEventListener('click', aggiorna);
})();
