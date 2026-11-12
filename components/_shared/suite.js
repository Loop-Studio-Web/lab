// Scheda raggruppata: tab in alto, una pagina per tab in un iframe (caricato alla prima visita).
// Markup: [data-suite] > [role=tablist] > button[role=tab][data-src], e .suite__panels vuoto.
// I tab sono generati qui dagli iframe; la pagina interna riceve ?embed (vedi studio.js).
(() => {
	const I = window.LabI18n;
	const t = (key, it, vars) => (I ? I.t(key, it, vars) : it.replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m)));
	I?.apply(); // i tab vanno tradotti prima che questo script ne legga i titoli
	const lang = I?.lang;
	const root = document.querySelector('[data-suite]');
	const list = root.querySelector('[role="tablist"]');
	const tabs = [...list.querySelectorAll('[role="tab"]')];
	const panels = root.querySelector('.suite__panels');
	const bar = list.querySelector('.suite__bar');

	const top = root.querySelector('.suite__top');
	const n = tabs.length;
	const pad = (i) => String(i + 1).padStart(2, '0');
	const next = (i) => tabs[(i + 1) % n];

	// Numeri sui tab: dicono che è una sequenza.
	tabs.forEach((t, i) => {
		const num = document.createElement('span');
		num.className = 'suite__n';
		num.setAttribute('aria-hidden', 'true');
		num.textContent = pad(i);
		t.prepend(num);
	});

	// Riga-invito sopra i tab: puntini di avanzamento + «N elementi · scegli».
	const hint = document.createElement('div');
	hint.className = 'suite__hint';
	const dots = document.createElement('span');
	dots.className = 'suite__dots';
	dots.setAttribute('aria-hidden', 'true');
	const dotEls = tabs.map(() => dots.appendChild(document.createElement('i')));
	const msg = document.createElement('span');
	msg.textContent = t('suite.items', '{n} elementi in questa scheda · scegli', { n });
	hint.append(dots, msg);
	top.prepend(hint);

	// Barra in fondo: «Prossimo: …» (sull'ultimo tab, torna al primo).
	const more = document.createElement('button');
	more.type = 'button';
	more.className = 'suite__next';
	const moreLabel = document.createElement('span');
	const moreArrow = document.createElement('span');
	moreArrow.className = 'suite__arrow';
	moreArrow.setAttribute('aria-hidden', 'true');
	more.append(moreLabel, moreArrow);
	root.append(more);
	more.addEventListener('click', () => {
		const i = tabs.indexOf(current());
		select(next(i), { focus: true });
	});

	const frames = tabs.map((tab, i) => {
		const f = document.createElement('iframe');
		f.id = `p-${i}`;
		f.title = tab.dataset.title || tab.textContent.trim();
		f.setAttribute('role', 'tabpanel');
		f.setAttribute('aria-labelledby', tab.id);
		f.hidden = true;
		f.allow = 'accelerometer; gyroscope'; // serve al tab «Inclinazione» di Storie e feed; negli altri non cambia nulla
		panels.append(f);
		tab.setAttribute('aria-controls', f.id);
		return f;
	});

	const indicate = (tab) => {
		list.style.setProperty('--x', `${tab.offsetLeft}px`);
		list.style.setProperty('--w', `${tab.offsetWidth}px`);
	};
	const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');

	function select(tab, { focus = false, push = true } = {}) {
		tabs.forEach((t, i) => {
			const on = t === tab;
			t.setAttribute('aria-selected', String(on));
			t.tabIndex = on ? 0 : -1;
			frames[i].hidden = !on;
			if (on && !frames[i].src) frames[i].src = `${t.dataset.src}${t.dataset.src.includes('?') ? '&' : '?'}embed${lang ? `&lang=${lang}` : ''}`;
		});
		indicate(tab);
		const at = tabs.indexOf(tab);
		dotEls.forEach((d, i) => d.classList.toggle('is-on', i === at));
		moreLabel.textContent = `${at === n - 1 ? t('suite.again', 'Ricomincia da') : t('suite.next', 'Prossimo:')} `;
		const to = document.createElement('b');
		to.textContent = next(at).dataset.title;
		moreLabel.append(to);
		more.classList.toggle('is-loop', at === n - 1);
		tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
		if (focus) tab.focus();
		if (push) history.replaceState(null, '', `#${tab.dataset.id}`);
	}

	tabs.forEach((tab, i) => {
		tab.addEventListener('click', () => select(tab));
		tab.addEventListener('keydown', (e) => {
			const last = tabs.length - 1;
			const to = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
			if (to === undefined) return;
			e.preventDefault();
			select(tabs[to], { focus: true });
		});
	});

	new ResizeObserver(() => indicate(current())).observe(list);
	document.fonts?.ready.then(() => indicate(current()));
	const fromHash = tabs.find((t) => `#${t.dataset.id}` === location.hash);
	select(fromHash || tabs[0], { push: false });
	indicate(current());
	requestAnimationFrame(() => root.classList.add('is-ready'));

	// Invito animato, una volta sola: la barra rossa accenna al tab successivo e torna.
	// Parte solo se l'utente non ha ancora toccato nulla e non chiede meno movimento.
	if (!fromHash && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
		let touched = false;
		list.addEventListener('pointerdown', () => (touched = true), { once: true });
		list.addEventListener('keydown', () => (touched = true), { once: true });
		const first = current();
		setTimeout(() => {
			if (touched || current() !== first) return;
			const t = next(0);
			list.style.setProperty('--x', `${first.offsetLeft + (t.offsetLeft - first.offsetLeft) * 0.22}px`);
			setTimeout(() => !touched && current() === first && indicate(first), 450);
		}, 1400);
	}
})();
