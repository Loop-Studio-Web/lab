// Scheda raggruppata: tab in alto, una pagina per tab in un iframe (caricato alla prima visita).
// Markup: [data-suite] > [role=tablist] > button[role=tab][data-src], e .suite__panels vuoto.
// I tab sono generati qui dagli iframe; la pagina interna riceve ?embed (vedi studio.js).
(() => {
	const root = document.querySelector('[data-suite]');
	const list = root.querySelector('[role="tablist"]');
	const tabs = [...list.querySelectorAll('[role="tab"]')];
	const panels = root.querySelector('.suite__panels');
	const bar = list.querySelector('.suite__bar');

	const frames = tabs.map((tab, i) => {
		const f = document.createElement('iframe');
		f.id = `p-${i}`;
		f.title = tab.dataset.title || tab.textContent.trim();
		f.setAttribute('role', 'tabpanel');
		f.setAttribute('aria-labelledby', tab.id);
		f.hidden = true;
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
			if (on && !frames[i].src) frames[i].src = `${t.dataset.src}${t.dataset.src.includes('?') ? '&' : '?'}embed`;
		});
		indicate(tab);
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
})();
