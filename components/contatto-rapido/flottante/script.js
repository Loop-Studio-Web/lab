// Flottante: il bottone apre/chiude il menu (aria-expanded), Esc e clic fuori chiudono; lo stato «aperto ora» viene dall'orologio del visitatore.
(() => {
	const root = document.querySelector('[data-fl]');
	const fab = root.querySelector('[data-fab]');
	const status = root.querySelector('[data-status]');
	const hoursBtn = root.querySelector('[data-hours-btn]');
	const hours = root.querySelector('#fl-hours');

	// Orari di fantasia: giorno della settimana (0 = domenica) → [apre, chiude] in ore.
	const HOURS = { 0: null, 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 13] };
	const renderStatus = () => {
		const now = new Date();
		const h = now.getHours() + now.getMinutes() / 60;
		const today = HOURS[now.getDay()];
		const open = !!today && h >= today[0] && h < today[1];
		status.dataset.open = String(open);
		status.textContent = open
			? LabI18n.t('flottante.open', 'Aperto ora · rispondiamo subito')
			: LabI18n.t('flottante.shut', 'Chiuso · rispondiamo dalle 9:00');
	};

	const setOpen = (open, refocus) => {
		root.classList.toggle('is-open', open);
		fab.setAttribute('aria-expanded', String(open));
		if (open) renderStatus();
		else {
			hoursBtn.setAttribute('aria-expanded', 'false');
			hours.hidden = true;
			if (refocus) fab.focus();
		}
	};
	fab.addEventListener('click', () => setOpen(fab.getAttribute('aria-expanded') !== 'true'));
	hoursBtn.addEventListener('click', () => {
		const show = hours.hidden;
		hours.hidden = !show;
		hoursBtn.setAttribute('aria-expanded', String(show));
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && root.classList.contains('is-open')) setOpen(false, true);
	});
	document.addEventListener('click', (e) => {
		if (root.classList.contains('is-open') && !e.target.closest('.fl__dock')) setOpen(false);
	});
	root.querySelectorAll('[data-demo-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

	renderStatus();
	// Il respiro del bottone gira solo se la scheda è visibile.
	new IntersectionObserver((entries) => {
		root.classList.toggle('is-live', entries.some((e) => e.isIntersecting));
	}, { threshold: 0.1 }).observe(root);
})();
