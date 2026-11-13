/* Barre di ricerca: le prime due sono solo CSS; qui vivono la ricerca simulata (3),
   il combobox con i filtri (4) e la palette dei comandi (5). Un solo elenco di dati
   di fantasia e un solo modo di disegnare le opzioni, condivisi dalle ultime tre. */
(() => {
	const LI = { it: 0, en: 1, es: 2 }[LabI18n.lang] ?? 0;
	const tr = (k, it, v) => LabI18n.t(k, it, v);
	// Categorie: l'id resta italiano (filtra i chip), il nome mostrato segue la lingua.
	const CATN = { Servizi: tr('br.js.c1', 'Servizi'), Progetti: tr('br.js.c2', 'Progetti'), Guide: tr('br.js.c3', 'Guide'), Azioni: tr('br.js.c4', 'Azioni') };
	// cat, icona, nome [it, en, es], parole affini [it, en, es]: contenuti di fantasia, adattati a ogni lingua.
	const DATA = [
		['Servizi', 'layout-template', ['Sito vetrina', 'Showcase website', 'Web escaparate'], ['web pagine homepage', 'web pages homepage', 'web páginas inicio']],
		['Servizi', 'shopping-cart', ['Negozio online', 'Online shop', 'Tienda online'], ['ecommerce vendere prodotti', 'ecommerce sell products', 'ecommerce vender productos']],
		['Servizi', 'camera', ['Servizio fotografico', 'Photo shoot', 'Sesión de fotos'], ['foto video scatti', 'photo video shots', 'foto vídeo fotografías']],
		['Servizi', 'megaphone', ['Reel e social', 'Reels and social', 'Reels y redes'], ['instagram tiktok contenuti', 'instagram tiktok content', 'instagram tiktok contenidos']],
		['Servizi', 'palette', ['Logo e identità', 'Logo and identity', 'Logo e identidad'], ['marchio brand colori', 'brand mark colours', 'marca colores']],
		['Servizi', 'settings', ['Manutenzione e supporto', 'Maintenance and support', 'Mantenimiento y soporte'], ['assistenza aggiornamenti', 'help updates', 'asistencia actualizaciones']],
		['Progetti', 'sparkles', ['Trattoria Il Faro', 'The Lighthouse Inn', 'Mesón El Faro'], ['sito menù ristorante prenotazioni', 'site menu restaurant bookings', 'web carta restaurante reservas']],
		['Progetti', 'sparkles', ['Studio Aurora', 'Aurora Studio', 'Estudio Aurora'], ['sito fisioterapia appuntamenti', 'site physiotherapy appointments', 'web fisioterapia citas']],
		['Progetti', 'sparkles', ['Officina Ferri', 'Ferris Garage', 'Taller Ferrer'], ['sito preventivi auto', 'site quotes cars', 'web presupuestos coches']],
		['Progetti', 'sparkles', ['Lumen Yoga', 'Lumen Yoga', 'Lumen Yoga'], ['sito corsi foto calendario', 'site classes photos calendar', 'web clases fotos calendario']],
		['Guide', 'file-text', ['Quanto costa un sito?', 'How much does a website cost?', '¿Cuánto cuesta una web?'], ['prezzi budget preventivo', 'prices budget quote', 'precios presupuesto']],
		['Guide', 'file-text', ['Come scegliere le foto', 'How to choose photos', 'Cómo elegir las fotos'], ['immagini fotografo scatti', 'images photographer shots', 'imágenes fotógrafo fotografías']],
		['Guide', 'file-text', ['Dominio e hosting spiegati', 'Domain and hosting explained', 'Dominio y alojamiento explicados'], ['indirizzo web server', 'address web server', 'dirección web servidor']],
		['Guide', 'file-text', ['Social: quanto pubblicare', 'Social: how often to post', 'Redes: cuánto publicar'], ['reel frequenza post', 'reels frequency posts', 'reels frecuencia publicaciones']],
		['Azioni', 'house', ['Torna alla home', 'Back to home', 'Volver al inicio'], ['inizio principale', 'start main', 'inicio principal']],
		['Azioni', 'mail', ['Scrivici un messaggio', 'Send us a message', 'Escríbenos un mensaje'], ['contatti email', 'contact email', 'contacto correo']],
		['Azioni', 'calendar', ['Prenota una chiamata', 'Book a call', 'Reserva una llamada'], ['appuntamento call', 'appointment call', 'cita llamada']],
		['Azioni', 'message-circle', ['Domande frequenti', 'Frequently asked questions', 'Preguntas frecuentes'], ['faq aiuto', 'faq help', 'faq ayuda']],
	].map(([cat, icon, label, kw]) => ({ cat, icon, label: label[LI], kw: kw[LI] }));
	const SITE = DATA.filter((d) => d.cat !== 'Azioni'); // le Azioni vivono solo nella palette

	/* ----- comuni ----- */
	const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
	const terms = (q) => norm(q).split(/\s+/).filter(Boolean);

	function search(list, q, cat) {
		const t = terms(q);
		const pool = list.filter((d) => !cat || d.cat === cat);
		if (!t.length) return pool;
		const hit = pool.filter((d) => {
			const hay = norm(d.label + ' ' + d.kw);
			return t.every((w) => hay.includes(w));
		});
		// chi inizia con la prima parola cercata passa avanti (sort stabile)
		return hit.sort((a, b) => Number(norm(b.label).startsWith(t[0])) - Number(norm(a.label).startsWith(t[0])));
	}

	function icon(name) {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'ic');
		svg.setAttribute('aria-hidden', 'true');
		const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		use.setAttribute('href', '#i-' + name);
		svg.append(use);
		return svg;
	}

	// Il testo con le parole cercate evidenziate (nodi di testo e <mark>, mai innerHTML).
	function highlight(text, q) {
		const n = norm(text); // stessa lunghezza di text (i dati sono in forma precomposta)
		const marks = [];
		for (const w of terms(q)) {
			let i = n.indexOf(w);
			while (i !== -1) {
				marks.push([i, i + w.length]);
				i = n.indexOf(w, i + w.length);
			}
		}
		marks.sort((a, b) => a[0] - b[0]);
		const merged = [];
		for (const m of marks) {
			const last = merged[merged.length - 1];
			if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]);
			else merged.push([...m]);
		}
		const frag = document.createDocumentFragment();
		let pos = 0;
		for (const [a, b] of merged) {
			if (a > pos) frag.append(text.slice(pos, a));
			const mark = document.createElement('mark');
			mark.textContent = text.slice(a, b);
			frag.append(mark);
			pos = b;
		}
		if (pos < text.length) frag.append(text.slice(pos));
		return frag;
	}

	// Disegna le opzioni dentro `ul`; con `grouped` mette un titolo a ogni cambio di categoria.
	function paint(ul, items, q, active, prefix, { grouped = false, showCat = false } = {}) {
		ul.replaceChildren();
		let lastCat = '';
		items.forEach((d, i) => {
			if (grouped && d.cat !== lastCat) {
				lastCat = d.cat;
				const g = document.createElement('li');
				g.className = 'opts__group';
				g.setAttribute('role', 'presentation');
				g.textContent = CATN[d.cat];
				ul.append(g);
			}
			const li = document.createElement('li');
			li.className = 'opt';
			li.id = `${prefix}-${i}`;
			li.setAttribute('role', 'option');
			li.setAttribute('aria-selected', String(i === active));
			li.dataset.i = String(i);
			const label = document.createElement('span');
			label.className = 'opt__label';
			label.append(highlight(d.label, q));
			li.append(icon(d.icon), label);
			if (showCat) {
				const c = document.createElement('span');
				c.className = 'opt__cat';
				c.textContent = CATN[d.cat];
				li.append(c);
			}
			ul.append(li);
		});
	}

	// Frecce, Invio ed Esc per un elenco di opzioni: la logica è la stessa in 4 e 5.
	function keyboard(e, st, { count, onSelect, onEscape }) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (!count()) return;
			const dir = e.key === 'ArrowDown' ? 1 : -1;
			st.active = (st.active + dir + count()) % count();
			st.render();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (st.active >= 0) onSelect(st.active);
		} else if (e.key === 'Escape') {
			onEscape(e);
		}
	}

	// Sposta l'evidenza sul posto, senza ridisegnare l'elenco (il puntatore tiene l'elemento sotto il dito).
	function hoverOption(e, ul, input, st, prefix) {
		const li = e.target.closest('.opt');
		if (!li || e.pointerType === 'touch') return;
		const i = Number(li.dataset.i);
		if (i === st.active) return;
		ul.querySelector('[aria-selected="true"]')?.setAttribute('aria-selected', 'false');
		li.setAttribute('aria-selected', 'true');
		st.active = i;
		input.setAttribute('aria-activedescendant', `${prefix}-${i}`);
	}

	function keepVisible(ul, input, prefix, active) {
		if (active < 0) return input.removeAttribute('aria-activedescendant');
		input.setAttribute('aria-activedescendant', `${prefix}-${active}`);
		document.getElementById(`${prefix}-${active}`)?.scrollIntoView({ block: 'nearest' });
	}

	/* ----- 3. Cerca e svuota ----- */
	const sf = document.querySelector('[data-sf]');
	if (sf) {
		const input = sf.querySelector('.sf__input');
		const status = sf.querySelector('[data-status]');
		const idle = 'Scrivi per cercare';
		let timer;
		const setState = (s) => {
			sf.dataset.state = s;
			sf.setAttribute('aria-busy', String(s === 'loading'));
		};
		const reset = () => {
			clearTimeout(timer);
			setState('idle');
			status.textContent = idle;
		};
		input.addEventListener('input', () => {
			clearTimeout(timer);
			const q = input.value.trim();
			if (!q) return reset();
			setState('loading');
			timer = setTimeout(() => {
				const n = search(SITE, q).length;
				setState('done');
				status.replaceChildren();
				const strong = document.createElement('strong');
				strong.textContent = n === 0 ? tr('br.js.none', 'Nessun risultato') : n === 1 ? tr('br.js.one', '1 risultato') : tr('br.js.many', '{n} risultati', { n });
				status.append(strong, tr('br.js.for', ' per “{q}”', { q }));
			}, 600);
		});
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && input.value) {
				e.preventDefault();
				input.value = '';
				reset();
			}
		});
		sf.querySelector('.sf__clear').addEventListener('click', () => {
			input.value = '';
			reset();
			input.focus();
		});
		sf.addEventListener('submit', (e) => e.preventDefault());
	}

	/* ----- 4. Suggerimenti e filtri ----- */
	const combo = document.querySelector('[data-combo]');
	if (combo) {
		const input = combo.querySelector('.combo__input');
		const pop = combo.querySelector('[data-pop]');
		const ul = pop.querySelector('.opts');
		const none = pop.querySelector('[data-none]');
		const msg = combo.querySelector('[data-msg]');
		const chips = [...combo.querySelectorAll('.chip')];
		const st = { cat: '', items: [], active: -1, open: false };

		st.render = () => {
			st.items = search(SITE, input.value, st.cat).slice(0, 5);
			if (st.active >= st.items.length) st.active = st.items.length - 1;
			paint(ul, st.items, input.value, st.active, 'cb', { showCat: !st.cat });
			none.hidden = st.items.length > 0;
			none.textContent = tr('br.js.nonefor', 'Nessun risultato per “{q}”', { q: input.value.trim() });
			keepVisible(ul, input, 'cb', st.active);
		};
		const open = () => {
			st.open = true;
			pop.classList.add('is-open');
			input.setAttribute('aria-expanded', 'true');
		};
		const close = () => {
			st.open = false;
			st.active = -1;
			pop.classList.remove('is-open');
			input.setAttribute('aria-expanded', 'false');
			input.removeAttribute('aria-activedescendant');
		};
		const select = (i) => {
			const d = st.items[i];
			input.value = d.label;
			close();
			msg.replaceChildren();
			const strong = document.createElement('strong');
			strong.textContent = d.label;
			msg.append(tr('br.js.chose', 'Hai scelto '), strong, ` (${CATN[d.cat]})`);
		};

		input.addEventListener('focus', () => {
			st.render();
			open();
		});
		input.addEventListener('input', () => {
			st.active = input.value.trim() ? 0 : -1; // il primo risultato è già pronto per Invio
			st.render();
			open();
		});
		input.addEventListener('keydown', (e) => {
			if (!st.open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
				st.render();
				open();
			}
			keyboard(e, st, {
				count: () => st.items.length,
				onSelect: select,
				onEscape: (ev) => {
					if (st.open) {
						ev.preventDefault();
						close();
					} else if (input.value) {
						ev.preventDefault();
						input.value = '';
					}
				},
			});
		});
		ul.addEventListener('mousedown', (e) => e.preventDefault()); // il campo non perde il focus
		ul.addEventListener('click', (e) => {
			const li = e.target.closest('.opt');
			if (li) select(Number(li.dataset.i));
		});
		ul.addEventListener('pointermove', (e) => hoverOption(e, ul, input, st, 'cb'));
		combo.addEventListener('focusout', (e) => {
			if (!combo.contains(e.relatedTarget)) close();
		});
		for (const chip of chips) {
			chip.addEventListener('click', () => {
				st.cat = chip.dataset.cat;
				chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
				st.active = input.value.trim() ? 0 : -1;
				input.focus();
				st.render();
				open();
			});
		}
	}

	/* ----- 5. Palette dei comandi ----- */
	const dlg = document.querySelector('[data-pal]');
	const trigger = document.querySelector('[data-pal-open]');
	if (dlg && trigger) {
		const input = dlg.querySelector('.pal__input');
		const ul = dlg.querySelector('.opts');
		const none = dlg.querySelector('[data-pal-none]');
		const out = document.querySelector('[data-pal-msg]');
		const ORDER = ['Azioni', 'Servizi', 'Guide', 'Progetti'];
		const st = { items: [], active: 0 };

		const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
		if (mac) document.querySelector('[data-mod]').textContent = '⌘';

		st.render = () => {
			const q = input.value.trim();
			let items = ORDER.flatMap((c) => search(DATA, q, c));
			if (!q) items = ORDER.flatMap((c) => items.filter((d) => d.cat === c).slice(0, 4));
			st.items = items;
			if (st.active >= items.length) st.active = items.length - 1;
			paint(ul, items, q, st.active, 'pl', { grouped: true });
			none.hidden = items.length > 0;
			keepVisible(ul, input, 'pl', st.active);
		};
		const openPal = () => {
			if (dlg.open) return;
			input.value = '';
			st.active = 0;
			st.render();
			dlg.showModal();
			ul.scrollTop = 0;
		};
		const select = (i) => {
			const d = st.items[i];
			dlg.close();
			out.replaceChildren();
			const strong = document.createElement('strong');
			strong.textContent = d.label;
			out.append(tr('br.js.opened', 'Hai aperto '), strong);
		};

		trigger.addEventListener('click', openPal);
		document.addEventListener('keydown', (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				dlg.open ? dlg.close() : openPal();
			}
		});
		input.addEventListener('input', () => {
			st.active = 0;
			st.render();
			ul.scrollTop = 0;
		});
		input.addEventListener('keydown', (e) => {
			keyboard(e, st, { count: () => st.items.length, onSelect: select, onEscape: () => {} }); // Esc chiude il dialog da sé
		});
		ul.addEventListener('click', (e) => {
			const li = e.target.closest('.opt');
			if (li) select(Number(li.dataset.i));
		});
		ul.addEventListener('pointermove', (e) => hoverOption(e, ul, input, st, 'pl'));
		dlg.addEventListener('click', (e) => {
			if (e.target === dlg) dlg.close(); // clic sullo sfondo
		});
	}
})();
