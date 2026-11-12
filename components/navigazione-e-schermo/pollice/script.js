// Zona del pollice: calcola quali bersagli cadono nella fascia «facile» (stessi raggi della mappa in style.css)
// e, a richiesta, la misura reale di ogni bersaglio rispetto alle soglie 24 e 44 px.
(() => {
	const root = document.querySelector('[data-pz]');
	const out = document.querySelector('[data-out]');
	const targets = [...root.querySelectorAll('[data-t]')];
	const navBtns = [...root.querySelectorAll('.pz__navb')];
	const EASY = 0.62; // raggio della fascia facile, in larghezze del telefono
	const PIVOT_Y = 0.94;

	const distance = (b, box, hand) => {
		const cx = b.left + b.width / 2 - box.left;
		const cy = b.top + b.height / 2 - box.top;
		const px = hand === 'dx' ? box.width : hand === 'sx' ? 0 : null;
		const d = (x) => Math.hypot(cx - x, cy - PIVOT_Y * box.height);
		return px === null ? Math.min(d(0), d(box.width)) : d(px);
	};

	const update = () => {
		const box = root.getBoundingClientRect();
		const hand = root.dataset.hand;
		const easy = navBtns.filter((b) => distance(b.getBoundingClientRect(), box, hand) <= EASY * box.width).length;
		let text = LabI18n.t('pz.out.nav', 'In zona facile: <b>{n} pulsanti su {tot}</b> della barra di navigazione.', { n: easy, tot: navBtns.length });
		if (root.dataset.sizes === 'on') {
			const small = root.querySelectorAll('[data-s="bad"]').length;
			const mid = root.querySelectorAll('[data-s="mid"]').length;
			text += ' ' + LabI18n.t('pz.out.size', 'Bersagli: {a} sotto 24 px, {b} sotto 44 px.', { a: small, b: mid });
		}
		out.innerHTML = text;
	};

	const measure = () => {
		targets.forEach((t) => {
			const r = t.getBoundingClientRect();
			const w = Math.round(Math.min(r.width, r.height));
			t.dataset.px = w + ' px';
			t.dataset.s = w < 24 ? 'bad' : w < 44 ? 'mid' : 'ok';
		});
	};

	NP.seg(document.querySelector('[data-hand]'), (v) => {
		root.dataset.hand = v;
		update();
	});
	NP.seg(document.querySelector('[data-nav]'), (v) => {
		root.dataset.nav = v;
		update();
	});
	NP.toggle(document.querySelector('[data-sizes]'), (on) => {
		root.dataset.sizes = on ? 'on' : 'off';
		update();
	});
	// il pulsante attivo della barra segue il tocco
	root.querySelector('.pz__nav').addEventListener('click', (e) => {
		const b = e.target.closest('.pz__navb');
		if (!b) return;
		navBtns.forEach((x) => {
			x.classList.toggle('is-on', x === b);
			x.toggleAttribute('aria-current', x === b);
			if (x === b) x.setAttribute('aria-current', 'page');
		});
	});

	measure();
	update();
	addEventListener('resize', () => {
		measure();
		update();
	});
})();
