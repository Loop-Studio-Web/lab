// Comandi condivisi dai due tab: gruppo di pulsanti a scelta singola e interruttore (aria-pressed).
window.NP = {
	seg(group, onPick) {
		const btns = [...group.querySelectorAll('button')];
		const set = (v) => {
			btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
			onPick(v);
		};
		group.addEventListener('click', (e) => {
			const b = e.target.closest('button');
			if (b && !b.disabled) set(b.dataset.v);
		});
		return set;
	},
	toggle(btn, onChange) {
		const set = (on) => {
			btn.setAttribute('aria-pressed', String(on));
			onChange(on);
		};
		btn.addEventListener('click', () => set(btn.getAttribute('aria-pressed') !== 'true'));
		return set;
	},
};
