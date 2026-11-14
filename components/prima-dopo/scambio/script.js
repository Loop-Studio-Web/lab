// Scambio: due bottoni (aria-pressed) dissolvono tra le foto; un tocco sulla foto scambia, tenendola premuta si sbircia l'altra versione.
(() => {
	const ba = document.querySelector('[data-ba]');
	const tag = ba.querySelector('[data-tag]');
	const btns = [...document.querySelectorAll('[data-v]')];
	let state = 'prima';
	let peek = false;
	const render = () => {
		const shown = peek ? (state === 'dopo' ? 'prima' : 'dopo') : state;
		ba.dataset.shown = shown;
		tag.textContent = shown === 'dopo' ? LabI18n.t('pd.after', 'Dopo') : LabI18n.t('pd.before', 'Prima');
		tag.className = `ba__tag ba__tag--${shown}`;
		btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state)));
	};
	btns.forEach((b) => b.addEventListener('click', () => { state = b.dataset.v; render(); }));
	// Tocco breve sulla foto: scambia in modo stabile. Tenuta premuta (oltre HOLD ms): sbircia l'altra e al rilascio torna.
	const HOLD = 250;
	let timer = 0;
	const release = () => { clearTimeout(timer); timer = 0; if (peek) { peek = false; render(); } };
	ba.addEventListener('pointerdown', () => { timer = setTimeout(() => { timer = 0; peek = true; render(); }, HOLD); });
	ba.addEventListener('pointerup', () => {
		if (timer) { clearTimeout(timer); timer = 0; state = state === 'dopo' ? 'prima' : 'dopo'; render(); return; }
		release();
	});
	['pointercancel', 'pointerleave'].forEach((e) => ba.addEventListener(e, release));
	ba.addEventListener('contextmenu', (e) => e.preventDefault());
	render();
})();
