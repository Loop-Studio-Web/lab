// Variante Particelle (EN): il «404» è fatto di puntini. Si campiona il testo disegnato in un canvas
// fuori schermo (un punto ogni `step` px), ogni puntino ha una casa e una molla che ce lo riporta.
// Il cursore (o il dito) li sparpaglia; un tocco/clic fa scoppiare una raffica; ogni tanto un soffio
// di vento li scompone da soli. Il canvas sta sotto il testo, solo tra start() e stop().

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');

let panel, canvas, ctx, code;
let W = 0, H = 0, dpr = 1;
let parts = [];
let raf = 0;
let last = 0;
let clock = 0;
let nextGust = 4;
let running = false;
let measuredFor = '';
const ptr = { x: -9999, y: -9999, on: false, vx: 0, vy: 0 };

function sample() {
	const r = panel.getBoundingClientRect();
	const c = code.getBoundingClientRect();
	const cs = getComputedStyle(code);
	const fontPx = parseFloat(cs.fontSize);
	const step = Math.max(coarse.matches ? 5 : 4, Math.round(fontPx / 30));

	// testo nero su un canvas fuori schermo, nella stessa posizione del segnaposto
	const off = document.createElement('canvas');
	off.width = Math.ceil(W);
	off.height = Math.ceil(H);
	const o = off.getContext('2d', { willReadFrequently: true });
	o.font = `${cs.fontWeight} ${fontPx}px ${cs.fontFamily}`;
	o.textAlign = 'center';
	o.textBaseline = 'middle';
	o.fillStyle = '#000';
	const cx = c.left - r.left + c.width / 2;
	const cy = c.top - r.top + c.height / 2;
	o.fillText('404', cx, cy);
	const data = o.getImageData(0, 0, off.width, off.height).data;

	// la cifra centrale (lo 0) è rossa: la si riconosce dalla x, nel terzo di mezzo del testo
	const total = o.measureText('404').width;
	const left = cx - total / 2;
	const homes = [];
	for (let y = step / 2; y < H; y += step) {
		for (let x = step / 2; x < W; x += step) {
			if (data[((y | 0) * off.width + (x | 0)) * 4 + 3] > 128) {
				const u = (x - left) / total;
				homes.push({ x, y, red: u > 0.34 && u < 0.66 });
			}
		}
	}
	return { homes, step };
}

function build() {
	const { homes, step } = sample();
	const old = parts;
	parts = homes.map((h, i) => {
		const p = old[i];
		return {
			hx: h.x,
			hy: h.y,
			red: h.red,
			// se c'erano già puntini (ridimensionamento) restano dove sono e tornano a casa
			x: p ? p.x : h.x,
			y: p ? p.y : h.y,
			vx: p ? p.vx : 0,
			vy: p ? p.vy : 0,
			r: step * (0.3 + Math.random() * 0.16),
			ph: Math.random() * 6.2832,
			k: 0.06 + Math.random() * 0.05, // ogni puntino ha la sua molla: non tornano tutti insieme
		};
	});
}

function measure() {
	const r = panel.getBoundingClientRect();
	const sig = `${Math.round(r.width)}x${Math.round(r.height)}`;
	W = r.width;
	H = r.height;
	dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvas.width = Math.round(W * dpr);
	canvas.height = Math.round(H * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	if (sig !== measuredFor || !parts.length) {
		measuredFor = sig;
		build();
	}
}

function burst(x, y, power = 1) {
	const R = 170 * power;
	for (const p of parts) {
		const dx = p.x - x;
		const dy = p.y - y;
		const d = Math.hypot(dx, dy) || 1;
		if (d < R) {
			const f = (1 - d / R) * 16 * power;
			p.vx += (dx / d) * f + (Math.random() - 0.5) * 4;
			p.vy += (dy / d) * f + (Math.random() - 0.5) * 4;
		}
	}
}

function paint(time, still) {
	ctx.clearRect(0, 0, W, H);
	for (let pass = 0; pass < 2; pass++) {
		ctx.fillStyle = pass ? '#ff3b30' : '#ffffff';
		ctx.beginPath();
		for (const p of parts) {
			if (p.red !== !!pass) continue;
			const br = still ? 1 : 1 + 0.18 * Math.sin(time * 2 + p.ph);
			ctx.moveTo(p.x + p.r * br, p.y);
			ctx.arc(p.x, p.y, p.r * br, 0, 6.2832);
		}
		ctx.fill();
	}
}

function tick(dt) {
	clock += dt;
	if (clock > nextGust) {
		// soffio di vento da un lato, ogni tanto: il 404 si scompone e si rimette insieme
		nextGust = clock + 6 + Math.random() * 4;
		const fromLeft = Math.random() < 0.5;
		for (const p of parts) {
			const lead = fromLeft ? p.hx / W : 1 - p.hx / W;
			p.vx += (fromLeft ? 1 : -1) * (5 + Math.random() * 4) * (1 - lead * 0.6);
			p.vy += (Math.random() - 0.5) * 8;
		}
	}
	const R = coarse.matches ? 80 : 110;
	for (const p of parts) {
		p.vx += (p.hx - p.x) * p.k;
		p.vy += (p.hy - p.y) * p.k;
		if (ptr.on) {
			const dx = p.x - ptr.x;
			const dy = p.y - ptr.y;
			const d2 = dx * dx + dy * dy;
			if (d2 < R * R) {
				const d = Math.sqrt(d2) || 1;
				const f = (1 - d / R) ** 2 * 6;
				p.vx += (dx / d) * f + ptr.vx * 0.05;
				p.vy += (dy / d) * f + ptr.vy * 0.05;
			}
		}
		p.vx *= 0.86;
		p.vy *= 0.86;
		p.x += p.vx;
		p.y += p.vy;
	}
}

function frame(now) {
	raf = requestAnimationFrame(frame);
	const dt = last ? Math.min(now - last, 50) : 16;
	last = now;
	tick(dt / 1000);
	paint(clock, false);
	ptr.vx *= 0.8;
	ptr.vy *= 0.8;
}

function local(e) {
	const r = panel.getBoundingClientRect();
	return [e.clientX - r.left, e.clientY - r.top];
}
function onMove(e) {
	const [x, y] = local(e);
	if (ptr.on) {
		ptr.vx = x - ptr.x;
		ptr.vy = y - ptr.y;
	}
	ptr.x = x;
	ptr.y = y;
	ptr.on = true;
}
function onLeave() {
	ptr.on = false;
	ptr.x = ptr.y = -9999;
}
function onDown(e) {
	if (e.target.closest('a, button')) return;
	onMove(e);
	if (running) burst(ptr.x, ptr.y);
}

export function init(el) {
	panel = el;
	code = el.querySelector('.par404__code');
	canvas = el.querySelector('.par404__canvas');
	ctx = canvas.getContext('2d');
	panel.addEventListener('pointermove', onMove);
	panel.addEventListener('pointerdown', onDown);
	panel.addEventListener('pointerleave', onLeave);
	panel.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && onLeave());
	panel.addEventListener('pointercancel', onLeave);
	new ResizeObserver(() => {
		if (!panel.hidden && panel.classList.contains('is-live')) measure();
	}).observe(panel);
}

export async function start() {
	panel.classList.add('is-live');
	// il campionamento deve usare il font vero, non quello di ripiego
	await document.fonts.load(`800 64px ${getComputedStyle(code).fontFamily}`, '404').catch(() => {});
	if (!panel.classList.contains('is-live')) return; // nel frattempo start() è stata annullata da stop()
	measure();
	if (running) return;
	if (reduced.matches) {
		paint(0, true); // ferma: il 404 composto, senza respiro
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
