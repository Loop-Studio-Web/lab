// Cursore ad arco. Il valore vive nell'<input type="range"> (tastiera e lettori di
// schermo gratis); qui si disegna il pallino sull'arco e si legge il puntatore.
const pad = (n) => String(n).padStart(2, '0');

const formats = {
	time: (v) => {
		const hour = Math.floor(v / 60);
		const part = hour < 5 ? 'Notte' : hour < 12 ? 'Mattina' : hour < 18 ? 'Pomeriggio' : hour < 22 ? 'Sera' : 'Notte';
		return { text: `${pad(hour)}:${pad(v % 60)}`, caption: part };
	},
	duration: (v) => {
		const h = Math.floor(v / 60);
		const m = v % 60;
		const text = h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
		const caption = v <= 45 ? 'Ritratto o ritocco veloce' : v <= 120 ? 'Servizio fotografico di media durata' : 'Shooting completo';
		return { text, caption };
	},
};

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const colorAt = (stops, t) => {
	const x = (stops.length - 1) * t;
	const i = Math.min(Math.floor(x), stops.length - 2);
	const a = hex(stops[i]);
	const b = hex(stops[i + 1]);
	return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * (x - i))).join(' ')})`;
};

document.querySelectorAll('[data-arc]').forEach((root) => {
	const input = root.querySelector('.arc__input');
	const svg = root.querySelector('.arc__svg');
	const track = root.querySelector('.arc__track');
	const thumb = root.querySelector('.arc__thumb');
	const out = root.querySelector('[data-out]');
	const caption = root.parentElement.querySelector('[data-caption]');
	const stops = JSON.parse(root.dataset.stops);
	const format = formats[root.dataset.format];
	const min = +input.min;
	const max = +input.max;
	const step = +input.step;
	const length = track.getTotalLength();
	const [viewW, viewH] = svg.getAttribute('viewBox').split(' ').slice(2).map(Number);

	// Il gradiente del tracciato nasce dalle stesse tinte che colorano il pallino.
	root.querySelector('.arc__grad').innerHTML = stops
		.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`)
		.join('');
	const gradId = `arc-grad-${Math.random().toString(36).slice(2, 7)}`;
	root.querySelector('.arc__grad').id = gradId;
	track.setAttribute('stroke', `url(#${gradId})`);

	const draw = () => {
		const value = input.valueAsNumber;
		const t = (value - min) / (max - min);
		const p = track.getPointAtLength(t * length);
		thumb.style.left = `${(p.x / viewW) * 100}%`;
		thumb.style.top = `${(p.y / viewH) * 100}%`;
		thumb.style.setProperty('--color', colorAt(stops, t));
		const { text, caption: label } = format(value);
		out.textContent = text;
		if (caption) caption.textContent = label;
		input.setAttribute('aria-valuetext', text);
	};

	// Punto del tracciato con la stessa x del puntatore (la x cresce sempre lungo l'arco).
	const lengthAtX = (x) => {
		let lo = 0;
		let hi = length;
		for (let i = 0; i < 22; i++) {
			const mid = (lo + hi) / 2;
			if (track.getPointAtLength(mid).x < x) lo = mid;
			else hi = mid;
		}
		return lo;
	};
	const fromPointer = (e) => {
		const rect = svg.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * viewW;
		const t = lengthAtX(x) / length;
		const raw = min + t * (max - min);
		input.value = Math.min(max, Math.max(min, Math.round(raw / step) * step));
		draw();
	};

	root.addEventListener('pointerdown', (e) => {
		if (e.button !== 0) return;
		root.setPointerCapture(e.pointerId);
		root.classList.add('is-dragging');
		fromPointer(e);
		input.focus({ preventScroll: true });
	});
	root.addEventListener('pointermove', (e) => {
		if (root.hasPointerCapture(e.pointerId)) fromPointer(e);
	});
	const end = (e) => {
		root.classList.remove('is-dragging');
		if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
	};
	root.addEventListener('pointerup', end);
	root.addEventListener('pointercancel', end);

	input.addEventListener('input', draw);
	draw();

	// Demo d'ingresso (data-sweep): ogni volta che il riquadro entra nella finestra il pallino
	// scivola dall'alba al valore di partenza. Appena l'utente lo tocca (mouse, dito, tastiera)
	// la demo si ferma per sempre: un campo di form non deve muoversi da solo mentre lo si usa.
	if (root.hasAttribute('data-sweep') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
		const target = input.valueAsNumber;
		let touched = false;
		let frame = 0;
		const setValue = (v) => {
			input.value = v;
			draw();
		};
		const stop = () => {
			touched = true;
			cancelAnimationFrame(frame);
		};
		const sweep = () => {
			cancelAnimationFrame(frame);
			const start = performance.now();
			const tick = (now) => {
				const t = Math.min(1, (now - start) / 2000);
				const eased = 1 - (1 - t) ** 3;
				setValue(Math.round((min + (target - min) * eased) / step) * step);
				if (t < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		};
		root.addEventListener('pointerdown', stop);
		input.addEventListener('keydown', stop);
		new IntersectionObserver(
			([entry]) => {
				if (touched) return;
				if (entry.isIntersecting) sweep();
				else {
					cancelAnimationFrame(frame);
					setValue(min); // fuori vista torna all'alba, pronto a rifare l'ingresso
				}
			},
			{ threshold: 0.6 },
		).observe(root);
	}
});
