// Scambio: due bottoni (aria-pressed) dissolvono tra le foto; tenendo premuta la foto si sbircia l'altra versione.
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
	ba.addEventListener('pointerdown', () => { peek = true; render(); });
	['pointerup', 'pointercancel', 'pointerleave'].forEach((e) => ba.addEventListener(e, () => { if (peek) { peek = false; render(); } }));
	ba.addEventListener('contextmenu', (e) => e.preventDefault());
	render();
})();
