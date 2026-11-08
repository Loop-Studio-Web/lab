// Tendina: un bottone (aria-pressed) apre/chiude una maschera obliqua sulla foto "dopo".
(() => {
	const ba = document.querySelector('[data-ba]');
	const btn = document.querySelector('[data-toggle]');
	const set = (open) => {
		ba.toggleAttribute('data-open', open);
		btn.setAttribute('aria-pressed', String(open));
		btn.textContent = open ? LabI18n.t('tendina.close', 'Richiudi la tendina') : LabI18n.t('tendina.open', 'Apri la tendina');
	};
	btn.addEventListener('click', () => set(!ba.hasAttribute('data-open')));
	ba.addEventListener('click', () => set(!ba.hasAttribute('data-open'))); // anche toccando la foto
	set(false); // testo iniziale nella lingua scelta
})();
