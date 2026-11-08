// Viste: stesso elenco in tre forme (griglia, lista, poster). Il cambio è un FLIP a cascata: ogni scheda parte dalla vecchia
// posizione (e dalla vecchia inclinazione) e arriva alla nuova, una dopo l'altra; la foto non si stira mai. Funziona ovunque.
// Il poster ha inclinazioni e scarti generati con un seme fisso, quindi sparsi ma stabili. La scelta si ricorda nella sessione.
(() => {
	const { ITEMS, card, count, reduce } = window.FG;
	const root = document.querySelector('[data-fg]');
	const grid = root.querySelector('[data-grid]');
	const scroller = root.querySelector('.fg__scroll');
	const btns = [...root.querySelectorAll('[data-view]')];
	const VIEWS = ['grid', 'list', 'poster'];

	// mulberry32: generatore a seme fisso
	const rng = (a) => () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const rand = rng(20261108);
	const pose = new Map();
	ITEMS.forEach((it) => {
		const li = card(it);
		const p = { rot: +(rand() * 12 - 6).toFixed(2), dx: +(rand() * 1.8 - 0.9).toFixed(2), dy: +(rand() * 2 - 0.8).toFixed(2) };
		li.style.setProperty('--rot', p.rot + 'deg');
		li.style.setProperty('--dx', p.dx + 'rem');
		li.style.setProperty('--dy', p.dy + 'rem');
		pose.set(li, p);
		grid.append(li);
	});
	root.querySelector('[data-count]').textContent = count(ITEMS.length);

	let view = 'grid';
	let moving;
	const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
	// trasformazione "a riposo" della scheda in una vista: solo il poster ne ha una
	const rest = (li, v) => {
		if (v !== 'poster') return '';
		const p = pose.get(li);
		return `translate(${p.dx * rem}px, ${p.dy * rem}px) rotate(${p.rot}deg)`;
	};
	// posizione di layout (senza transform) rispetto al riquadro visibile
	const spot = () => new Map([...grid.children].map((li) => [li, { x: li.offsetLeft, y: li.offsetTop - scroller.scrollTop }]));

	const set = (next, animate) => {
		const prev = view;
		const before = animate && !reduce ? spot() : null;
		view = next;
		grid.classList.toggle('fg-grid--list', next === 'list');
		grid.classList.toggle('fg-grid--poster', next === 'poster');
		btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === next)));
		try { sessionStorage.setItem('fg-view', next); } catch {}
		if (!before) return;
		scroller.scrollTop = 0;
		grid.classList.add('is-moving');
		clearTimeout(moving);
		moving = setTimeout(() => grid.classList.remove('is-moving'), 1000);
		const after = spot();
		[...grid.children].forEach((li, i) => {
			const a = before.get(li);
			const b = after.get(li);
			const delay = Math.min(i * 28, 280);
			li.animate(
				[
					{ transform: `translate(${a.x - b.x}px, ${a.y - b.y}px) ${rest(li, prev)}`, opacity: 0.55 },
					{ transform: rest(li, next) || 'none', opacity: 1 },
				],
				{ duration: 520, delay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' }
			);
			li.firstElementChild.lastElementChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: delay + 140, easing: 'ease-out', fill: 'backwards' });
		});
	};

	btns.forEach((b) => b.addEventListener('click', () => b.getAttribute('aria-pressed') !== 'true' && set(b.dataset.view, true)));
	let saved = null;
	try { saved = sessionStorage.getItem('fg-view'); } catch {}
	if (VIEWS.includes(saved) && saved !== 'grid') set(saved, false);
})();
