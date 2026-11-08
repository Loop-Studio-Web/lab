// Certificazioni: due strisce di badge (disegnati di fantasia, nessun logo reale) generate da JS.
// Scorrono solo se la sezione è visibile (.is-live) e non in pausa; la copia per il giro continuo è aria-hidden.
(() => {
	const root = document.querySelector('[data-cf]');
	const rows = root.querySelector('[data-rows]');
	const btn = root.querySelector('[data-pause]');
	const NS = 'http://www.w3.org/2000/svg';

	// Icone: tracciati stile Lucide (ISC), 24×24.
	const ICON = {
		shield: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'],
		leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
		star: ['M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'],
		award: ['m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526', 'M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z'],
		clock: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'],
		thumb: ['M7 10v12', 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z'],
	};
	const BADGES = [
		[() => LabI18n.t('certificazioni.b1', 'Qualità verificata'), 'shield'],
		[() => LabI18n.t('certificazioni.b2', 'Materiali eco'), 'leaf'],
		[() => LabI18n.t('certificazioni.b3', 'Top rated'), 'star'],
		[() => LabI18n.t('certificazioni.b4', 'Premio 2026'), 'award'],
		[() => LabI18n.t('certificazioni.b5', 'Consegna rapida'), 'clock'],
		[() => LabI18n.t('certificazioni.b6', 'Clienti felici'), 'thumb'],
	];

	const badge = ([label, icon], i) => {
		const li = document.createElement('li');
		li.className = 'cf__badge';
		const svg = document.createElementNS(NS, 'svg');
		svg.setAttribute('viewBox', '-6 -6 36 36');
		svg.setAttribute('aria-hidden', 'true');
		const ring = document.createElementNS(NS, 'circle');
		ring.setAttribute('cx', '12');
		ring.setAttribute('cy', '12');
		ring.setAttribute('r', '17');
		ring.setAttribute('class', 'cf__ring' + (i % 3 === 0 ? ' cf__ring--red' : ''));
		svg.append(ring);
		const g = document.createElementNS(NS, 'g');
		g.setAttribute('class', 'cf__icon');
		ICON[icon].forEach((d) => {
			const p = document.createElementNS(NS, 'path');
			p.setAttribute('d', d);
			g.append(p);
		});
		svg.append(g);
		const text = document.createElement('span');
		text.textContent = label();
		li.append(svg, text);
		return li;
	};

	const build = (reverse) => {
		const row = document.createElement('div');
		row.className = 'cf__row' + (reverse ? ' cf__row--rev' : '');
		const track = document.createElement('div');
		track.className = 'cf__track';
		const list = reverse ? [...BADGES].reverse() : BADGES;
		// Due copie identiche: la seconda (aria-hidden) permette il giro continuo a -50%.
		[false, true].forEach((copy) => {
			const ul = document.createElement('ul');
			ul.className = 'cf__set';
			if (copy) ul.setAttribute('aria-hidden', 'true');
			list.forEach((b, i) => ul.append(badge(b, i)));
			track.append(ul);
		});
		row.append(track);
		return row;
	};
	rows.append(build(false), build(true));

	let paused = false;
	const renderBtn = () => {
		btn.setAttribute('aria-pressed', String(paused));
		btn.textContent = paused ? LabI18n.t('certificazioni.play', 'Riprendi') : LabI18n.t('certificazioni.pause', 'Pausa');
		root.classList.toggle('is-paused', paused);
	};
	btn.addEventListener('click', () => {
		paused = !paused;
		renderBtn();
	});

	// Anima solo se visibile.
	new IntersectionObserver((entries) => {
		root.classList.toggle('is-live', entries.some((e) => e.isIntersecting));
	}, { threshold: 0.1 }).observe(root);
	renderBtn();
})();
