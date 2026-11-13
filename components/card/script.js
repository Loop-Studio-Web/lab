// Tre cose sole hanno bisogno di JS: l'inclinazione (scrive due variabili CSS),
// il configuratore (nome della finitura e un piccolo scossone) e il biglietto
// (conteggio dei pagamenti e animazione di stampa).
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// ——— Inclinazione condivisa: data-tilt="gradi massimi" ———
function tilt(el, max) {
	let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
	const frame = () => {
		cx += (tx - cx) * 0.14;
		cy += (ty - cy) * 0.14;
		el.style.setProperty('--rx', `${cx.toFixed(2)}deg`);
		el.style.setProperty('--ry', `${cy.toFixed(2)}deg`);
		raf = Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02 ? requestAnimationFrame(frame) : 0;
	};
	const go = () => raf || (raf = requestAnimationFrame(frame));
	el.addEventListener('pointermove', (e) => {
		if (reduce.matches) return;
		const r = el.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width;
		const py = (e.clientY - r.top) / r.height;
		ty = (px - 0.5) * 2 * max;
		tx = (0.5 - py) * 2 * max;
		el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
		el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
		go();
	});
	el.addEventListener('pointerleave', () => {
		tx = ty = 0;
		go();
	});
}
document.querySelectorAll('[data-tilt]').forEach((el) => tilt(el, Number(el.dataset.tilt) || 12));

// ——— Scheda prodotto ———
const shop = document.querySelector('.shop');
const finishName = shop.querySelector('[data-finish-name]');
const flask = shop.querySelector('.shop__visual svg');
shop.addEventListener('change', (e) => {
	if (e.target.name !== 'finish') return;
	finishName.textContent = e.target.dataset.name;
	if (!reduce.matches) {
		flask.animate(
			[{ rotate: '0deg' }, { rotate: '-5deg' }, { rotate: '3.5deg' }, { rotate: '-2deg' }, { rotate: '0deg' }],
			{ duration: 600, easing: 'ease-out' },
		);
	}
});
const tr = (k, it, v) => LabI18n.t(k, it, v);
const buy = shop.querySelector('[data-buy]');
const buyLive = shop.querySelector('[data-buy-live]');
buy.addEventListener('click', () => {
	const on = buy.getAttribute('aria-pressed') !== 'true';
	buy.setAttribute('aria-pressed', on);
	buy.querySelector('span').textContent = on ? tr('cd.js.incart', 'Nel carrello') : tr('cd.js.add', 'Aggiungi al carrello');
	buyLive.textContent = on ? tr('cd.js.added', 'Aggiunta al carrello: {n}', { n: finishName.textContent }) : tr('cd.js.removed', 'Tolta dal carrello');
});

// ——— Zaini: "Lo voglio" ———
document.querySelectorAll('[data-pick]').forEach((btn) =>
	btn.addEventListener('click', () => {
		const on = btn.getAttribute('aria-pressed') !== 'true';
		btn.setAttribute('aria-pressed', on);
		btn.textContent = on ? tr('cd.js.incart', 'Nel carrello') : tr('cd.js.want', 'Lo voglio');
	}),
);

// ——— Biglietto ———
const tk = document.querySelector('[data-ticket]');
const payers = [...tk.querySelectorAll('[data-payer]')];
const cps = [...tk.querySelectorAll('[data-cp]')];
const status = tk.querySelector('[data-status]');
const msg = tk.querySelector('[data-msg]');

const paint = () => {
	const paid = payers.filter((p) => p.dataset.paid === 'true').length;
	payers.forEach((p) => {
		const on = p.dataset.paid === 'true';
		const name = p.querySelector('.tk__who').textContent;
		p.querySelector('[data-toggle]').innerHTML =
			`${on ? tr('cd.js.paid', 'Pagato') : tr('cd.js.topay', 'Da pagare')}<span class="sr-only"> — ${tr('cd.js.tap', '{n}, tocca per cambiare', { n: name })}</span>`;
	});
	cps.forEach((cp, i) => {
		const last = i === cps.length - 1;
		cp.dataset.state = last ? (paid === payers.length ? 'done' : 'todo') : i < paid ? 'done' : i === paid ? 'current' : 'todo';
	});
	tk.style.setProperty('--fill', `${(Math.min(paid, 4) / 4) * 100}%`);
	status.textContent = paid === payers.length ? tr('cd.js.settled', 'Saldato') : tr('cd.js.due', 'Da saldare');
	return paid;
};

tk.addEventListener('click', (e) => {
	const t = e.target.closest('[data-toggle]');
	if (!t) return;
	const row = t.closest('[data-payer]');
	row.dataset.paid = row.dataset.paid === 'true' ? 'false' : 'true';
	const paid = paint();
	msg.textContent = tr('cd.js.count', '{p} su {n} hanno pagato.', { p: paid, n: payers.length });
});

tk.querySelector('[data-remind]').addEventListener('click', () => {
	const late = payers.filter((p) => p.dataset.paid !== 'true').map((p) => p.querySelector('.tk__who').textContent);
	msg.textContent = late.length ? tr('cd.js.remind', 'Promemoria inviato a {n}.', { n: late.join(tr('cd.js.and', ' e ')) }) : tr('cd.js.allok', 'Sono tutti in regola, niente da sollecitare.');
});

const print = () => {
	tk.classList.add('is-armed', 'is-reset');
	void tk.offsetWidth;
	tk.classList.remove('is-reset', 'is-armed');
};
tk.querySelector('[data-reprint]').addEventListener('click', print);

paint();
// Le traduzioni si applicano a DOMContentLoaded: ridisegna con i nomi già tradotti.
document.addEventListener('DOMContentLoaded', paint);
// Il biglietto esce quando la sezione entra in vista, non al caricamento della pagina.
tk.classList.add('is-armed', 'is-reset');
new IntersectionObserver((entries, obs) => {
	if (!entries.some((en) => en.isIntersecting)) return;
	obs.disconnect();
	tk.classList.remove('is-reset', 'is-armed');
}, { threshold: 0.3 }).observe(tk);
