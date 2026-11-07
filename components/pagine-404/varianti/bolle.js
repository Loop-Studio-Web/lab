// Variante Bolle (IT): lo 0 è un anello di bolle. Ognuna ruota piano lungo il cerchio, "respira" e
// ha una molla verso la sua posizione; il cursore (o il dito) le scansa e loro tornano.
// Il ciclo gira solo tra start() e stop(); con movimento ridotto l'anello è fermo.

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');

let panel, ring, bubbles = [];
let raf = 0, last = 0, time = 0, running = false;
let R = 0; // raggio dell'anello in px
const ptr = { x: -9999, y: -9999, on: false };

function build() {
	const n = coarse.matches ? 14 : 20;
	for (let i = 0; i < n; i++) {
		const el = document.createElement('i');
		el.className = 'bolle404__b';
		// dimensioni alternate: grandi e piccole, così l'anello non sembra una collana
		const s = [0.2, 0.13, 0.17, 0.1][i % 4] + (i % 3) * 0.012;
		el.style.setProperty('--s', `${s}em`);
		ring.appendChild(el);
		bubbles.push({ el, a: (i / n) * Math.PI * 2, ph: i * 1.7, x: 0, y: 0, vx: 0, vy: 0 });
	}
}

function measure() {
	R = ring.getBoundingClientRect().width * 0.42;
}

function place(b, t) {
	// posizione di casa: sul cerchio, con un respiro radiale diverso per ogni bolla
	const a = b.a + t * 0.18;
	const r = R * (1 + Math.sin(t * 0.9 + b.ph) * 0.07);
	return [Math.cos(a) * r, Math.sin(a) * r];
}

function render(t, dt) {
	const rect = ring.getBoundingClientRect();
	const mx = ptr.x - (rect.left + rect.width / 2);
	const my = ptr.y - (rect.top + rect.height / 2);
	for (const b of bubbles) {
		const [hx, hy] = place(b, t);
		b.vx += (hx - b.x) * 0.06;
		b.vy += (hy - b.y) * 0.06;
		if (ptr.on) {
			const dx = b.x - mx;
			const dy = b.y - my;
			const d = Math.hypot(dx, dy) || 1;
			const reach = R * 1.1;
			if (d < reach) {
				const f = (1 - d / reach) ** 2 * 5;
				b.vx += (dx / d) * f;
				b.vy += (dy / d) * f;
			}
		}
		b.vx *= 0.84;
		b.vy *= 0.84;
		b.x += b.vx;
		b.y += b.vy;
		// una bolla spinta si gonfia un poco
		const push = Math.min(Math.hypot(b.x - hx, b.y - hy) / (R * 0.5), 1);
		b.el.style.transform = `translate(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px) scale(${(1 + push * 0.35).toFixed(3)})`;
	}
}

function frame(now) {
	raf = requestAnimationFrame(frame);
	const dt = last ? Math.min(now - last, 50) : 16;
	last = now;
	time += dt / 1000;
	render(time, dt);
}

function onMove(e) {
	ptr.x = e.clientX;
	ptr.y = e.clientY;
	ptr.on = true;
}
function onLeave() {
	ptr.on = false;
	ptr.x = ptr.y = -9999;
}

export function init(el) {
	panel = el;
	ring = el.querySelector('[data-ring]');
	build();
	panel.addEventListener('pointermove', onMove);
	panel.addEventListener('pointerdown', onMove);
	panel.addEventListener('pointerleave', onLeave);
	panel.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && onLeave());
	panel.addEventListener('pointercancel', onLeave);
	new ResizeObserver(() => {
		if (!panel.hidden) measure();
	}).observe(panel);
}

export function start() {
	panel.classList.add('is-live');
	measure();
	if (running) return;
	if (reduced.matches) {
		// Ferma: ogni bolla sulla sua posizione di casa.
		bubbles.forEach((b) => {
			[b.x, b.y] = place(b, 0);
			b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
		});
		return;
	}
	running = true;
	last = 0;
	raf = requestAnimationFrame(frame);
}

export function stop() {
	if (!panel) return;
	panel.classList.remove('is-live');
	if (!running) return;
	running = false;
	cancelAnimationFrame(raf);
	onLeave();
}
