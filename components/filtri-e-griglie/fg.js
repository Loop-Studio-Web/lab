// Parte comune ai 4 tab di «Filtri e griglie»: dati di fantasia, scheda, riordino animato (FLIP) e morph con View Transitions.
// I contenuti (nomi, descrizioni) sono di fantasia: italiano in ITEMS, EN/ES in COPY.
(() => {
	const L = window.LabI18n;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const IMG = '../../_shared/img/';

	const CATS = {
		mare: LabI18n.t('fg.cat.mare', 'Mare'),
		montagna: LabI18n.t('fg.cat.montagna', 'Montagna'),
		natura: LabI18n.t('fg.cat.natura', 'Natura'),
		cultura: LabI18n.t('fg.cat.cultura', 'Cultura'),
	};

	// img = foto del pool condiviso; pos = inquadratura (object-position), così la stessa foto fa due voci diverse.
	const ITEMS = [
		{ id: 'rifugio', name: 'Rifugio sul lago', cat: 'montagna', price: 120, date: '2026-09-12', img: 'alpine-lake-m', pos: '50% 60%', text: 'Due notti in rifugio sopra un lago alpino, colazione al sorgere del sole e sentiero fino alla cresta.' },
		{ id: 'scogliera', name: 'Casa sulla scogliera', cat: 'mare', price: 210, date: '2026-08-02', img: 'manarola-m', pos: '40% 50%', text: 'Una casa di pescatori a picco sul mare: terrazza, barca per il tramonto e cena di pesce in paese.' },
		{ id: 'aurora', name: 'Notte d’aurora', cat: 'natura', price: 340, date: '2026-12-20', img: 'aurora-m', pos: '50% 40%', text: 'Tre notti sotto il cielo del nord con guida, thermos caldo e fotografo al seguito.' },
		{ id: 'dune', name: 'Dune e silenzio', cat: 'natura', price: 150, date: '2026-10-05', img: 'desert-m', pos: '50% 70%', text: 'Cammino all’alba tra le dune, tè nel campo tendato e stelle senza un’unica luce intorno.' },
		{ id: 'bosco', name: 'Bosco nella nebbia', cat: 'natura', price: 90, date: '2026-09-28', img: 'fog-forest-m', pos: '50% 50%', text: 'Passeggiata guidata tra abeti e nebbia al mattino presto; si torna per la colazione contadina.' },
		{ id: 'playa', name: 'Playa privada', cat: 'mare', price: 180, date: '2026-07-14', img: 'beach-m', pos: '50% 55%', text: 'Una baia con pochi ombrelloni, snorkeling incluso e un chiringuito che apre solo a mezzogiorno.' },
		{ id: 'pagoda', name: 'Pagoda al tramonto', cat: 'cultura', price: 260, date: '2026-11-10', img: 'pagoda-m', pos: '50% 45%', text: 'Visita serale con guida locale, cerimonia del tè e rientro a piedi tra le lanterne.' },
		{ id: 'ghiaccio', name: 'Lago ghiacciato', cat: 'montagna', price: 130, date: '2026-12-02', img: 'snow-lake-m', pos: '50% 50%', text: 'Ciaspolata fino a un lago d’inverno, pranzo al sacco caldo e rientro in slitta.' },
		{ id: 'cascata', name: 'Cascata nascosta', cat: 'natura', price: 75, date: '2026-10-19', img: 'waterfall-m', pos: '50% 50%', text: 'Mezza giornata in una forra poco conosciuta, con bagno finale per i coraggiosi.' },
		{ id: 'quota', name: 'Sentiero d’alta quota', cat: 'montagna', price: 95, date: '2026-08-23', img: 'alpine-lake-m', pos: '20% 30%', text: 'Un anello di sei ore sopra i duemila metri, per chi ha le gambe e vuole il panorama.' },
		{ id: 'borgo', name: 'Borgo sul mare', cat: 'cultura', price: 110, date: '2026-09-04', img: 'manarola-m', pos: '85% 60%', text: 'Un giorno tra vicoli, botteghe e vigneti a terrazza, con degustazione di vini in cantina.' },
		{ id: 'club', name: 'Beach club', cat: 'mare', price: 160, date: '2026-07-30', img: 'beach-m', pos: '15% 45%', text: 'Lettino, aperitivo e musica dal vivo al tramonto; la sera si resta a cena sulla sabbia.' },
	];

	// Nomi e descrizioni delle voci in EN/ES (l'italiano sta in ITEMS): [nome, testo].
	const COPY = {
		en: {
			rifugio: ['Lakeside refuge', 'Two nights in a mountain hut above an alpine lake, breakfast at sunrise and a trail up to the ridge.'],
			scogliera: ['House on the cliff', 'A fisherman’s house perched over the sea: terrace, a boat for the sunset and a seafood dinner in the village.'],
			aurora: ['Aurora night', 'Three nights under the northern sky with a guide, a hot flask and a photographer in tow.'],
			dune: ['Dunes and silence', 'A dawn walk among the dunes, tea at the tent camp and stars without a single light around.'],
			bosco: ['Forest in the fog', 'A guided walk through firs and early-morning fog; back in time for a farmhouse breakfast.'],
			playa: ['Private beach', 'A bay with just a few umbrellas, snorkelling included and a beach bar that only opens at noon.'],
			pagoda: ['Pagoda at sunset', 'An evening visit with a local guide, a tea ceremony and a walk back among the lanterns.'],
			ghiaccio: ['Frozen lake', 'A snowshoe hike to a winter lake, a hot packed lunch and a sleigh ride home.'],
			cascata: ['Hidden waterfall', 'Half a day in a little-known gorge, with a final swim for the brave.'],
			quota: ['High-altitude trail', 'A six-hour loop above two thousand metres, for those with the legs and a taste for views.'],
			borgo: ['Seaside village', 'A day among alleys, workshops and terraced vineyards, with a wine tasting in the cellar.'],
			club: ['Beach club', 'Sunbed, aperitif and live music at sunset; in the evening you stay for dinner on the sand.'],
		},
		es: {
			rifugio: ['Refugio junto al lago', 'Dos noches en un refugio sobre un lago alpino, desayuno al amanecer y sendero hasta la cresta.'],
			scogliera: ['Casa en el acantilado', 'Una casa de pescadores sobre el mar: terraza, barca para la puesta de sol y cena de pescado en el pueblo.'],
			aurora: ['Noche de aurora', 'Tres noches bajo el cielo del norte con guía, termo caliente y un fotógrafo a tu lado.'],
			dune: ['Dunas y silencio', 'Caminata al amanecer entre las dunas, té en el campamento y estrellas sin una sola luz alrededor.'],
			bosco: ['Bosque en la niebla', 'Paseo guiado entre abetos y niebla a primera hora; se vuelve a tiempo para el desayuno campesino.'],
			playa: ['Playa privada', 'Una bahía con pocas sombrillas, snorkel incluido y un chiringuito que solo abre a mediodía.'],
			pagoda: ['Pagoda al atardecer', 'Visita nocturna con guía local, ceremonia del té y regreso a pie entre los farolillos.'],
			ghiaccio: ['Lago helado', 'Excursión con raquetas hasta un lago en invierno, comida caliente de mochila y regreso en trineo.'],
			cascata: ['Cascada escondida', 'Medio día en una garganta poco conocida, con baño final para los valientes.'],
			quota: ['Sendero de alta montaña', 'Un circuito de seis horas por encima de los dos mil metros, para quien tiene piernas y quiere panorama.'],
			borgo: ['Pueblo junto al mar', 'Un día entre callejuelas, talleres y viñedos en terraza, con cata de vinos en la bodega.'],
			club: ['Beach club', 'Tumbona, aperitivo y música en vivo al atardecer; por la noche te quedas a cenar en la arena.'],
		},
	};
	const copy = COPY[L.lang];
	if (copy) ITEMS.forEach((it) => ([it.name, it.text] = copy[it.id]));

	const eur = new Intl.NumberFormat(L.lang, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
	const day = new Intl.DateTimeFormat(L.lang, { day: 'numeric', month: 'short' });
	const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

	const SORTS = {
		rec: () => 0,
		asc: (a, b) => a.price - b.price,
		desc: (a, b) => b.price - a.price,
		new: (a, b) => (a.date < b.date ? 1 : -1),
		az: (a, b) => a.name.localeCompare(b.name, L.lang),
	};

	// Una voce = un <li> con foto e testi. `button` mette un vero <button> attorno al contenuto (per il dettaglio).
	const card = (it, button) => {
		const li = document.createElement('li');
		li.className = 'fg-card';
		li.dataset.id = it.id;
		const inner = document.createElement(button ? 'button' : 'div');
		if (button) inner.type = 'button';
		inner.className = 'fg-card__in';
		const img = new Image();
		img.className = 'fg-card__img';
		img.src = IMG + it.img + '.webp';
		img.alt = '';
		img.loading = 'lazy';
		img.decoding = 'async';
		img.width = 900;
		img.height = 600;
		img.style.objectPosition = it.pos;
		const body = document.createElement('span');
		body.className = 'fg-card__body';
		const name = document.createElement('span');
		name.className = 'fg-card__name';
		name.textContent = it.name;
		const meta = document.createElement('span');
		meta.className = 'fg-card__meta';
		meta.innerHTML = '<span class="fg-card__cat"></span><b class="fg-card__price"></b><time class="fg-card__date"></time>';
		meta.querySelector('.fg-card__cat').textContent = CATS[it.cat];
		meta.querySelector('.fg-card__price').textContent = eur.format(it.price);
		const tm = meta.querySelector('time');
		tm.dateTime = it.date;
		tm.textContent = day.format(new Date(it.date));
		body.append(name, meta);
		inner.append(img, body);
		li.append(inner);
		return li;
	};

	// FLIP: si fotografano le posizioni, si cambia il DOM (`mutate`), poi ogni scheda ancora visibile parte dalla vecchia posizione
	// e scivola in quella nuova; le nuove entrano con una dissolvenza. Solo transform/opacity.
	const flip = (list, mutate) => {
		const kids = () => [...list.children];
		const before = new Map(kids().filter((k) => !k.hidden).map((k) => [k, k.getBoundingClientRect()]));
		mutate();
		if (reduce) return;
		kids().forEach((k, i) => {
			if (k.hidden) return;
			const r = k.getBoundingClientRect();
			const o = before.get(k);
			if (o) {
				const dx = o.left - r.left;
				const dy = o.top - r.top;
				if (dx || dy) k.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
			} else {
				k.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: Math.min(i * 18, 160), easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
			}
		});
	};

	// Cambia il DOM con una View Transition se c'è (le schede visibili si trasformano da sole, anche di dimensione); altrimenti, nessuna animazione.
	const morph = (mutate, scope) => {
		if (!document.startViewTransition || reduce) return mutate();
		const sr = scope.getBoundingClientRect();
		[...scope.children].forEach((k) => {
			const r = k.getBoundingClientRect();
			// solo le schede dentro il riquadro: le altre non devono volare fuori dal palco
			if (!k.hidden && r.bottom > sr.top && r.top < sr.bottom) k.style.viewTransitionName = 'c-' + k.dataset.id;
		});
		const t = document.startViewTransition(mutate);
		t.finished.finally(() => [...scope.children].forEach((k) => (k.style.viewTransitionName = '')));
	};

	const count = (n) => (n === 1 ? LabI18n.t('fg.count.one', '1 risultato') : LabI18n.t('fg.count.many', '{n} risultati', { n }));

	window.FG = { ITEMS, CATS, SORTS, card, flip, morph, count, eur, day, norm, reduce };
})();
