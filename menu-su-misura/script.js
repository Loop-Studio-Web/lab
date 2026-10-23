/* Menù su misura. Si scelgono gli allergeni da evitare e il menù si riordina (GSAP Flip): in alto i piatti "per te",
   poi quelli da "chiedere in sala" (adattabili o con possibili tracce), in fondo quelli "non per te" con il motivo.
   Lo stato di ogni piatto lo calcola valuta() dagli ingredienti in data.js; le scelte vivono nell'hash dell'URL. */
(function () {
	'use strict';

	const { ALLERGENI, PIATTI, UNSPLASH } = window.MENU;
	const $ = (s) => document.querySelector(s);
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	gsap.registerPlugin(Flip);

	const allergene = new Map(ALLERGENI.map((a) => [a.id, a]));
	const minuscolo = (t) => t.charAt(0).toLowerCase() + t.slice(1);
	const elenco = (v) => (v.length < 2 ? v.join('') : v.slice(0, -1).join(', ') + ' e ' + v[v.length - 1]);
	const unici = (v) => [...new Set(v)];

	const STATI = {
		si: { badge: 'Per te', icona: 'i-si' },
		chiedi: { badge: 'Chiedi in sala', icona: 'i-chiedi' },
		no: { badge: 'Non per te', icona: 'i-no' },
	};

	/* ───────── Il calcolo: da ingredienti e allergeni scelti a uno stato ───────── */
	function valuta(p, sel) {
		if (!sel.size) return { stato: 'neutro' };
		const bloccanti = p.ingredienti.filter((i) => (i.a || []).some((a) => sel.has(a)));
		const fissi = bloccanti.filter((i) => !i.togli);
		const togliere = bloccanti.filter((i) => i.togli);
		const tracce = (p.tracce || []).filter((a) => sel.has(a));

		if (fissi.length) {
			const cosa = unici(fissi.flatMap((i) => i.a.filter((a) => sel.has(a)))).map((a) => minuscolo(allergene.get(a).it));
			const t = 'Contiene ' + elenco(cosa);
			return { stato: 'no', breve: t, testo: t + '.' };
		}
		if (togliere.length || tracce.length) {
			const nomiT = tracce.map((a) => minuscolo(allergene.get(a).it));
			const breve = [];
			const testo = [];
			if (togliere.length) {
				const senza = elenco(togliere.map((i) => minuscolo(i.n)));
				breve.push('Senza ' + senza);
				testo.push('Senza ' + senza + ' è per te');
			}
			if (tracce.length) {
				breve.push('Tracce di ' + elenco(nomiT));
				testo.push('Possibili tracce di ' + elenco(nomiT));
			}
			return { stato: 'chiedi', breve: breve.join(' · '), testo: testo.join('. ') + '. Chiedilo in sala.' };
		}
		return { stato: 'si', breve: '', testo: 'Nessuno degli allergeni che hai scelto.' };
	}

	/* ───────── Costruzione della pagina ───────── */
	const menu = $('#menu');
	const chipsBox = $('#chips');
	const annuncio = $('#annuncio');
	const barra = $('#barra');
	const barraStato = $('#barra-stato');

	const icona = (id) => `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><use href="#${id}" /></svg>`;
	/* Icona di un allergene: l'illustrazione (WebP con trasparenza) su un tondo avorio, così le parti scure restano leggibili
	   anche sul fondo notte. Decorativa: il nome dell'allergene sta sempre nel testo accanto. */
	const iconaAllergene = (id, lato) => `<span class="ai" style="--s:${lato}px" aria-hidden="true"><img src="img/allergeni/${id}.webp" alt="" width="128" height="128" decoding="async" /></span>`;

	const chips = ALLERGENI.map((a) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'chip';
		b.dataset.id = a.id;
		b.setAttribute('aria-pressed', 'false');
		b.innerHTML = `<span class="chip__icona" aria-hidden="true">${iconaAllergene(a.id, 30)}<span class="chip__spunta">${icona('i-si')}</span></span>${a.it}`;
		chipsBox.append(b);
		return b;
	});

	const fasce = {};
	[
		['piatti', 'Da mangiare', ''],
		['bevande', 'Da bere', ''],
		['si', 'Per te', 'Nessuno degli allergeni che hai scelto.'],
		['chiedi', 'Chiedi in sala', 'Si possono adattare, o possono esserci tracce.'],
		['no', 'Non per te', 'Contengono ciò che eviti.'],
	].forEach(([id, titolo, sotto]) => {
		const li = document.createElement('li');
		li.className = 'fascia';
		li.dataset.f = id;
		li.innerHTML = `<h2 class="fascia__t">${titolo}<span class="fascia__n" aria-hidden="true"></span></h2>` + (sotto ? `<p class="fascia__s">${sotto}</p>` : '');
		fasce[id] = li;
	});

	const carte = PIATTI.map((p) => {
		const li = document.createElement('li');
		li.className = 'piatto';
		li.dataset.id = p.id;
		li.dataset.stato = 'neutro';
		li.innerHTML = `
			<button class="piatto__btn" type="button" aria-haspopup="dialog">
				<img src="${p.img}" alt="" loading="lazy" decoding="async" style="object-position:${p.pos}" />
				<span class="piatto__stato">${icona('i-si')}<span class="piatto__stato-t">Per te</span></span>
				<span class="piatto__testi">
					<span class="piatto__tipo">${p.tipo === 'bevanda' ? 'Bevanda' : 'Piatto'} · ${p.prezzo} €</span>
					<span class="piatto__nome">${p.nome}</span>
					<span class="piatto__nota"></span>
				</span>
			</button>`;
		li.querySelector('button').addEventListener('click', () => apriScheda(p));
		return { p, li, nota: li.querySelector('.piatto__nota'), badge: li.querySelector('.piatto__stato'), badgeT: li.querySelector('.piatto__stato-t') };
	});

	/* ───────── Aggiornamento: stati, ordine nel DOM, Flip, barra ───────── */
	let sel = new Set();
	let visibili = new Set();

	function applica(nuova, { annunciare = true, entrata = false } = {}) {
		sel = nuova;
		chips.forEach((c) => c.setAttribute('aria-pressed', String(sel.has(c.dataset.id))));

		const els = carte.map((c) => c.li);
		const prima = !entrata && !reduce ? Flip.getState(els) : null;
		if (prima) {
			Flip.killFlipsOf(els);
			gsap.set(els, { clearProps: 'transform,width,height' });
		}

		const conta = { si: 0, chiedi: 0, no: 0 };
		carte.forEach((c) => {
			c.ris = valuta(c.p, sel);
			c.li.dataset.stato = c.ris.stato;
			if (c.ris.stato !== 'neutro') {
				conta[c.ris.stato]++;
				c.badgeT.textContent = STATI[c.ris.stato].badge;
				c.badge.querySelector('use').setAttribute('href', '#' + STATI[c.ris.stato].icona);
			}
			c.nota.textContent = c.ris.breve || '';
		});

		/* Senza scelte: "Da mangiare" e "Da bere". Con scelte: le tre fasce di stato, solo quelle non vuote. */
		const ordine = [];
		const attive = new Set();
		if (!sel.size) {
			ordine.push(fasce.piatti, ...carte.filter((c) => c.p.tipo === 'piatto').map((c) => c.li), fasce.bevande, ...carte.filter((c) => c.p.tipo === 'bevanda').map((c) => c.li));
			attive.add('piatti').add('bevande');
		} else {
			['si', 'chiedi', 'no'].forEach((k) => {
				const g = carte.filter((c) => c.ris.stato === k);
				if (!g.length) return;
				fasce[k].querySelector('.fascia__n').textContent = g.length;
				ordine.push(fasce[k], ...g.map((c) => c.li));
				attive.add(k);
			});
		}
		ordine.forEach((n) => menu.append(n));
		Object.keys(fasce).forEach((k) => {
			fasce[k].hidden = !attive.has(k);
			if (!attive.has(k)) menu.append(fasce[k]);
		});

		if (prima) Flip.from(prima, { duration: 0.55, ease: 'power3.inOut' });
		if (!reduce && !entrata) {
			const nuove = [...attive].filter((k) => !visibili.has(k)).map((k) => fasce[k]);
			if (nuove.length) gsap.fromTo(nuove, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.15, ease: 'power3.out', clearProps: 'opacity,transform' });
		}
		visibili = attive;

		riepilogo(conta);
		try {
			history.replaceState(null, '', sel.size ? '#' + [...sel].join(',') : location.pathname + location.search);
		} catch (e) {}
		if (annunciare && sel.size) {
			annuncio.textContent = '';
			requestAnimationFrame(() => (annuncio.textContent = `${conta.si} per te, ${conta.chiedi} da chiedere in sala, ${conta.no} non adatti.`));
		}
	}

	function riepilogo(conta) {
		const senza = [...sel].filter((a) => !PIATTI.some((p) => p.ingredienti.some((i) => (i.a || []).includes(a)) || (p.tracce || []).includes(a)));
		barraStato.innerHTML =
			`<span class="n n--si">${icona('i-si')}<b>${conta.si}</b> per te</span>` +
			`<span class="n n--chiedi">${icona('i-chiedi')}<b>${conta.chiedi}</b> da chiedere</span>` +
			`<span class="n n--no">${icona('i-no')}<b>${conta.no}</b> non adatti</span>` +
			(senza.length ? `<span class="n n--vuoti">Nessuna voce contiene ${elenco(senza.map((a) => minuscolo(allergene.get(a).it)))}.</span>` : '');
		barra.classList.toggle('is-on', sel.size > 0);
		barra.inert = sel.size === 0;
	}

	chips.forEach((c) =>
		c.addEventListener('click', () => {
			const n = new Set(sel);
			n.has(c.dataset.id) ? n.delete(c.dataset.id) : n.add(c.dataset.id);
			applica(n);
		}),
	);
	$('#b-azzera').addEventListener('click', () => applica(new Set()));

	/* ───────── Scheda del piatto ───────── */
	const scheda = $('#scheda');
	function apriScheda(p) {
		const r = valuta(p, sel);
		$('#s-img').src = p.img;
		$('#s-img').style.objectPosition = p.pos;
		$('#s-tipo').textContent = `${p.tipo === 'bevanda' ? 'Bevanda' : 'Piatto'} · ${p.prezzo} €`;
		$('#s-nome').textContent = p.nome;
		$('#s-descr').textContent = p.descr;

		const st = $('#s-stato');
		st.hidden = r.stato === 'neutro';
		st.dataset.stato = r.stato;
		if (r.stato !== 'neutro') st.innerHTML = `<span class="badge badge--${r.stato}">${icona(STATI[r.stato].icona)}${STATI[r.stato].badge}</span><span>${r.testo}</span>`;

		$('#s-ing').innerHTML = p.ingredienti
			.map((i) => {
				const evitato = (i.a || []).some((a) => sel.has(a));
				const tag = (i.a || []).map((a) => `<span class="ing__a${sel.has(a) ? ' is-sel' : ''}">${iconaAllergene(a, 22)}${minuscolo(allergene.get(a).it)}</span>`).join('');
				return `<li class="ing__i${evitato ? ' is-evitato' : ''}"><span class="ing__n">${i.n}</span>${tag}${i.togli ? '<span class="ing__t">si può togliere</span>' : ''}${evitato ? '<span class="sr-only">(da evitare)</span>' : ''}</li>`;
			})
			.join('');
		const tr = $('#s-tracce');
		tr.hidden = !(p.tracce && p.tracce.length);
		tr.textContent = tr.hidden ? '' : 'Possibili tracce di ' + elenco(p.tracce.map((a) => minuscolo(allergene.get(a).it))) + ' (cucina e fornitori in comune).';
		$('#s-credito').innerHTML = `Foto di <a href="${UNSPLASH}${p.foto.id}" target="_blank" rel="noopener">${p.foto.autore}</a> su Unsplash`;
		scheda.showModal();
		scheda.scrollTop = 0;
	}
	$('#s-chiudi').addEventListener('click', () => scheda.close());

	/* ───────── Cartello per il cameriere ───────── */
	const cameriere = $('#cameriere');
	$('#b-cameriere').addEventListener('click', () => {
		const scelti = ALLERGENI.filter((a) => sel.has(a.id));
		if (!scelti.length) return;
		$('#c-lista').innerHTML = scelti.map((a) => `<li>${iconaAllergene(a.id, 56)}${a.it}</li>`).join('');
		$('#c-en').textContent = scelti.map((a) => a.en).join(', ');
		cameriere.showModal();
	});
	$('#c-chiudi').addEventListener('click', () => cameriere.close());

	/* Un clic fuori dal contenuto (sullo sfondo del dialog) lo chiude. */
	[scheda, cameriere].forEach((d) =>
		d.addEventListener('click', (e) => {
			if (e.target === d) d.close();
		}),
	);

	/* ───────── Avvio: scelte dall'hash, entrata delle card ───────── */
	const iniziali = new Set(location.hash.slice(1).split(',').filter((id) => allergene.has(id)));
	applica(iniziali, { annunciare: false, entrata: true });
	if (!reduce) gsap.from(carte.map((c) => c.li), { opacity: 0, y: 18, duration: 0.5, ease: 'power3.out', stagger: 0.035, clearProps: 'opacity,transform' });
})();
