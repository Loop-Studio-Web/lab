// Vetro e materiali: lastre trascinabili su un fondale, luce che segue il puntatore, slider per la lastra scelta.
(() => {
	const stage = document.querySelector('[data-stage]');
	const slabs = [...stage.querySelectorAll('[data-slab]')];
	const picked = document.querySelector('[data-picked]');
	const kInput = document.querySelector('[data-k]');
	const tInput = document.querySelector('[data-t]');
	const disp = document.getElementById('vm-disp');
	const root = document.documentElement;

	// Il vetro liquido (backdrop-filter con url() a un filtro SVG) esiste solo nei Chromium.
	const liquidOk = /Chrome\//.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
	root.dataset.lg = liquidOk ? 'on' : 'off';

	const state = new Map();
	let top = 1;
	let current = null;

	const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

	function paint(slab) {
		const s = state.get(slab);
		slab.style.setProperty('--x', s.x);
		slab.style.setProperty('--y', s.y);
		slab.style.setProperty('--k', s.k);
		slab.style.setProperty('--t', s.t);
		if (slab.dataset.slab === 'liquid') disp.setAttribute('scale', String(10 + s.k * 0.7));
	}

	function select(slab) {
		current = slab;
		slabs.forEach((el) => el.setAttribute('aria-pressed', String(el === slab)));
		const s = state.get(slab);
		slab.style.zIndex = String(++top);
		picked.textContent = slab.querySelector('.slab__name').textContent;
		kInput.value = s.k;
		tInput.value = s.t;
	}

	slabs.forEach((slab) => {
		state.set(slab, { x: Number(slab.dataset.x), y: Number(slab.dataset.y), k: 60, t: 50 });
		paint(slab);
		const ok = slab.dataset.slab !== 'liquid' || liquidOk;
		slab.querySelector('[data-state]').textContent = ok ? LabI18n.t('vm.on', 'Attivo') : LabI18n.t('vm.fallback', 'Ripiego: smerigliato');
	});
	select(slabs[slabs.length - 1]);
	// Il nome tradotto esiste solo dopo DOMContentLoaded (LabI18n.apply).
	document.addEventListener('DOMContentLoaded', () => {
		picked.textContent = current.querySelector('.slab__name').textContent;
	});

	// Luce: posizione del puntatore relativa a ogni lastra (percentuale) e angolo per il metallo.
	let lx = 0;
	let ly = 0;
	let queued = false;
	function light() {
		queued = false;
		for (const slab of slabs) {
			const r = slab.getBoundingClientRect();
			slab.style.setProperty('--mx', `${((lx - r.left) / r.width) * 100}%`);
			slab.style.setProperty('--my', `${((ly - r.top) / r.height) * 100}%`);
			const a = Math.atan2(ly - (r.top + r.height / 2), lx - (r.left + r.width / 2));
			slab.style.setProperty('--ang', `${(a * 180) / Math.PI + 90}deg`);
		}
	}
	function aim(e) {
		lx = e.clientX;
		ly = e.clientY;
		if (!queued) {
			queued = true;
			requestAnimationFrame(light);
		}
	}
	stage.addEventListener('pointermove', aim);

	// Trascinamento (Pointer Events); il tocco funziona perché la lastra ha touch-action: none.
	let drag = null;
	stage.addEventListener('pointerdown', (e) => {
		const slab = e.target.closest('[data-slab]');
		if (!slab) return;
		select(slab);
		const r = stage.getBoundingClientRect();
		const s = state.get(slab);
		drag = { slab, id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: s.x, y0: s.y, w: r.width, h: r.height };
		slab.setPointerCapture(e.pointerId);
		slab.classList.add('is-lifted');
		aim(e);
	});
	stage.addEventListener('pointermove', (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		const s = state.get(drag.slab);
		const sw = (drag.slab.offsetWidth / drag.w) * 100;
		const sh = (drag.slab.offsetHeight / drag.h) * 100;
		s.x = clamp(drag.x0 + ((e.clientX - drag.sx) / drag.w) * 100, 0, 100 - sw);
		s.y = clamp(drag.y0 + ((e.clientY - drag.sy) / drag.h) * 100, 0, 100 - sh);
		paint(drag.slab);
	});
	const end = (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		drag.slab.classList.remove('is-lifted');
		drag = null;
	};
	stage.addEventListener('pointerup', end);
	stage.addEventListener('pointercancel', end);

	// Tastiera: frecce spostano la lastra a fuoco.
	stage.addEventListener('keydown', (e) => {
		const slab = e.target.closest('[data-slab]');
		const d = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key];
		if (!slab || !d) return;
		e.preventDefault();
		const s = state.get(slab);
		s.x = clamp(s.x + d[0], 0, 100 - (slab.offsetWidth / stage.clientWidth) * 100);
		s.y = clamp(s.y + d[1], 0, 100 - (slab.offsetHeight / stage.clientHeight) * 100);
		paint(slab);
	});
	stage.addEventListener('click', (e) => {
		const slab = e.target.closest('[data-slab]');
		if (slab && slab !== current) select(slab);
	});

	kInput.addEventListener('input', () => {
		state.get(current).k = Number(kInput.value);
		paint(current);
	});
	tInput.addEventListener('input', () => {
		state.get(current).t = Number(tInput.value);
		paint(current);
	});

	// Le macchie del fondale si muovono solo con il palco visibile.
	new IntersectionObserver(([en]) => stage.classList.toggle('is-live', en.isIntersecting)).observe(stage);
})();
