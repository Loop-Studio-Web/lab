// Variante Infinito (ES): «4∞4» con il marchio vero al posto dello 0. Intorno al marchio una nube di
// puntini scorre lungo la curva dell'infinito; il cursore (o il dito) li sposta e loro tornano
// sulla curva. Il canvas sta sotto il testo, solo tra start() e stop().

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');

let panel, canvas, ctx, mark;
let W = 0, H = 0, dpr = 1;
let cx = 0, cy = 0, ax = 0, ay = 0; // centro e semiassi della curva (px CSS)
let parts = [];
let trail = [];
let raf = 0;
let last = 0;
let running = false;
const ptr = { x: -9999, y: -9999, on: false, vx: 0, vy: 0 };

// Lemniscata di Gerono, t in radianti: due anelli, incrocio al centro.
function home(p, time) {
	const t = p.t + time * p.speed;
	const s = Math.sin(t);
	const d = 1 + s * s;
	return [cx + (ax * Math.cos(t)) / d + p.ox, cy + (ay * s * Math.cos(t)) / d + p.oy];
}

function measure() {
	const r = panel.getBoundingClientRect();
	W = r.width;
	H = r.height;
	dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvas.width = Math.round(W * dpr);
	canvas.height = Math.round(H * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	const m = mark.getBoundingClientRect();
	cx = m.left - r.left + m.width / 2;
	cy = m.top - r.top + m.height / 2;
	ax = m.width * 2.1; // la curva avvolge tutto il «404», non solo il marchio
	ay = m.height * 1.7;
	if (!parts.length) build();
}

function build() {
	const n = coarse.matches ? 140 : 300;
	parts = Array.from({ length: n }, (_, i) => ({
		t: (i / n) * Math.PI * 2 + Math.random() * 0.1,
		speed: 0.35 + Math.random() * 0.25,
		ox: (Math.random() - 0.5) * 44,
		oy: (Math.random() - 0.5) * 44,
		r: 0.7 + Math.random() * 1.5,
		red: Math.random() < 0.7,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		placed: false,
	}));
}

function draw(time) {
	// Coda: invece di cancellare, si sbiadisce il fotogramma precedente.
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'rgba(0,0,0,0.22)';
	ctx.fillRect(0, 0, W, H);
	ctx.globalCompositeOperation = 'source-over';

	for (const p of parts) {
		const [hx, hy] = home(p, time);
		if (!p.placed) {
			p.x = hx;
			p.y = hy;
			p.placed = true;
		}
		// molla verso la curva
		p.vx += (hx - p.x) * 0.055;
		p.vy += (hy - p.y) * 0.055;
		// il cursore spinge via, più forte da vicino e se si muove
		if (ptr.on) {
			const dx = p.x - ptr.x;
			const dy = p.y - ptr.y;
			const d2 = dx * dx + dy * dy;
			const R = coarse.matches ? 90 : 120;
			if (d2 < R * R) {
				const d = Math.sqrt(d2) || 1;
				const f = (1 - d / R) ** 2 * 7;
				p.vx += (dx / d) * f + ptr.vx * 0.04;
				p.vy += (dy / d) * f + ptr.vy * 0.04;
			}
		}
		p.vx *= 0.88;
		p.vy *= 0.88;
		p.x += p.vx;
		p.y += p.vy;
		ctx.fillStyle = p.red ? '#ff3b30' : '#ffffff';
		ctx.globalAlpha = p.red ? 0.95 : 0.8;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.r, 0, 6.2832);
		ctx.fill();
	}

	// scintille lasciate dal cursore
	for (let i = trail.length - 1; i >= 0; i--) {
		const s = trail[i];
		s.life -= 0.022;
		if (s.life <= 0) {
			trail.splice(i, 1);
			continue;
		}
		s.x += s.vx;
		s.y += s.vy;
		s.vy += 0.02;
		ctx.globalAlpha = s.life;
		ctx.fillStyle = s.red ? '#ff3b30' : '#ffffff';
		ctx.beginPath();
		ctx.arc(s.x, s.y, s.r * s.life + 0.4, 0, 6.2832);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
}

function frame(now) {
	raf = requestAnimationFrame(frame);
	const dt = last ? Math.min(now - last, 50) : 16;
	last = now;
	frame.time = (frame.time || 0) + dt / 1000;
	draw(frame.time);
	ptr.vx *= 0.8;
	ptr.vy *= 0.8;
}

function spark(x, y) {
	if (trail.length > (coarse.matches ? 40 : 90)) return;
	for (let k = 0; k < 2; k++) {
		trail.push({
			x,
			y,
			vx: (Math.random() - 0.5) * 1.2 - ptr.vx * 0.02,
			vy: (Math.random() - 0.5) * 1.2 - 0.4,
			r: 1 + Math.random() * 1.6,
			life: 1,
			red: Math.random() < 0.6,
		});
	}
}

function onMove(e) {
	const r = panel.getBoundingClientRect();
	const x = e.clientX - r.left;
	const y = e.clientY - r.top;
	if (ptr.on) {
		ptr.vx = x - ptr.x;
		ptr.vy = y - ptr.y;
	}
	ptr.x = x;
	ptr.y = y;
	ptr.on = true;
	spark(x, y);
}
function onLeave() {
	ptr.on = false;
	ptr.x = ptr.y = -9999;
}

export function init(el) {
	panel = el;
	mark = el.querySelector('.inf404__mark');
	canvas = el.querySelector('.inf404__canvas');
	ctx = canvas.getContext('2d');
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
		// Ferma: la nube disegnata una volta, sulla curva, senza coda.
		ctx.clearRect(0, 0, W, H);
		parts.forEach((p) => {
			const [x, y] = home(p, 0);
			ctx.fillStyle = p.red ? '#ff3b30' : '#ffffff';
			ctx.globalAlpha = 0.85;
			ctx.beginPath();
			ctx.arc(x, y, p.r, 0, 6.2832);
			ctx.fill();
		});
		ctx.globalAlpha = 1;
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
