// Variante Pendolo (JA): la culla di Newton. Cinque palline appese, l'ultima è rossa. Si afferra una pallina
// d'estremità e si lascia andare: l'urto passa lungo la fila. Se l'ultima rossa viene lanciata abbastanza in
// alto si stacca, rimbalza sul fondo del riquadro ed esce a destra («la pagina è rimbalzata ed è andata via»);
// poi una nuova rossa scende dalla sbarra. A riposo la fila fa da sola una dimostrazione ogni tanto.
// Fisica a passo fisso (1/240 s): ogni pallina è un pendolo, l'urto tra vicine è elastico tra masse uguali.

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');

const N = 5; // palline; l'ultima (indice 4) è quella rossa
const K = 20; // g/L → periodo ~1,4 s
const DAMP = 0.45; // attrito dell'aria: la fila si ferma da sola in una decina di secondi
const H = 1 / 240;
const GRAVITY = 1800; // px/s² per la pallina lanciata
const LIMIT = 1.15; // angolo massimo del trascinamento (rad)
const AMPS = [1, 0.55]; // dimostrazioni automatiche: forte (la rossa parte), poi piccola

let panel, rig, canvas, ctx;
let W = 0, Hh = 0, dpr = 1;
let r = 20, L = 100, py = 0, px = [], baseY = 0, floorY = 0;
const th = new Array(N).fill(0);
const om = new Array(N).fill(0);

// pallina rossa: 'hang' appesa · 'fly' lanciata · 'away' fuori scena · 'drop' scende dalla sbarra
let red = 'hang';
let fly = { x: 0, y: 0, vx: 0, vy: 0 };
let timer = 0;
let dropS = 1;

let held = -1; // indice della pallina tenuta (dal dito o dalla dimostrazione)
let drag = null; // { id, idx, sign, max, lastT, om }
let auto = null; // { idx, sign, amp, t }
let kicks = 0;
let clock = 0;
let lastEvent = 0;
let acc = 0;
let last = 0;
let raf = 0;
let running = false;
let measured = false;

const sinc = Math.sin;
const easeOut = (u) => 1 - (1 - u) ** 3;
const rightEnd = () => (red === 'hang' ? N - 1 : N - 2);

function measure() {
	const pr = panel.getBoundingClientRect();
	const rr = rig.getBoundingClientRect();
	W = pr.width;
	Hh = pr.height;
	dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvas.width = Math.round(W * dpr);
	canvas.height = Math.round(Hh * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	const top = rr.top - pr.top;
	const cx = rr.left - pr.left + rr.width / 2;
	r = Math.min(rr.height * 0.17, rr.width / 13);
	py = top + 8; // dove le corde si attaccano alla sbarra
	baseY = top + rr.height - 4;
	L = baseY - py - r - 12;
	px = Array.from({ length: N }, (_, i) => cx + (i - (N - 1) / 2) * 2 * r);
	floorY = Hh - r - 8;
	measured = true;
}

// ——— Fisica ———
function collide() {
	const n = red === 'hang' ? N : N - 1;
	for (let pass = 0; pass < 2; pass++) {
		for (let a = 0; a < n - 1; a++) {
			const b = a + 1;
			if (a === held || b === held) continue;
			const gap = px[b] + L * sinc(th[b]) - (px[a] + L * sinc(th[a])) - 2 * r;
			if (gap >= 0) continue;
			const va = om[a] * Math.cos(th[a]);
			const vb = om[b] * Math.cos(th[b]);
			if (va <= vb) continue; // si stanno già allontanando
			const e = 0.99;
			const oa = om[a];
			const ob = om[b];
			om[a] = ((1 - e) * oa + (1 + e) * ob) / 2;
			om[b] = ((1 + e) * oa + (1 - e) * ob) / 2;
		}
	}
}

function step() {
	const n = red === 'hang' ? N : N - 1;
	for (let i = 0; i < n; i++) {
		if (i === held) continue;
		om[i] += (-K * sinc(th[i]) - DAMP * om[i]) * H;
		th[i] += om[i] * H;
	}
	collide();

	// la rossa, se sta salendo abbastanza in alto (picco > 0,8 rad), si stacca dalla corda
	const i = N - 1;
	if (red === 'hang' && held !== i && th[i] > 0.3 && om[i] >= 0) {
		const cosPeak = Math.cos(th[i]) - (om[i] * om[i]) / (2 * K);
		if (cosPeak < Math.cos(0.8)) {
			fly = {
				x: px[i] + L * sinc(th[i]),
				y: py + L * Math.cos(th[i]),
				vx: Math.max(L * om[i] * Math.cos(th[i]) * 1.1, 280),
				vy: -L * om[i] * sinc(th[i]),
			};
			th[i] = om[i] = 0;
			red = 'fly';
			lastEvent = clock;
		}
	}
}

function calm() {
	const n = red === 'hang' ? N : N - 1;
	for (let i = 0; i < n; i++) if (Math.abs(th[i]) > 0.25 || Math.abs(om[i]) > 1.4) return false;
	return true;
}

function update(dt) {
	clock += dt;

	// la pallina tenuta dalla dimostrazione (o dal tap): sale piano, si ferma un attimo, parte
	if (auto) {
		auto.t += dt;
		const u = Math.min(auto.t / 0.55, 1);
		th[auto.idx] = auto.sign * auto.amp * easeOut(u);
		om[auto.idx] = 0;
		held = auto.idx;
		if (auto.t > 0.67) {
			auto = null;
			held = -1;
			lastEvent = clock;
		}
	}

	acc += dt;
	while (acc >= H) {
		step();
		acc -= H;
	}

	if (red === 'fly') {
		fly.vy += GRAVITY * dt;
		fly.x += fly.vx * dt;
		fly.y += fly.vy * dt;
		if (fly.y > floorY && fly.vy > 0) {
			fly.y = floorY;
			fly.vy *= -0.55; // rimbalza
		}
		if (fly.x > W + 2 * r) {
			red = 'away';
			timer = 0;
		}
	} else if (red === 'away') {
		timer += dt;
		if (timer > 1.2 && (calm() || timer > 5)) {
			red = 'drop';
			dropS = 0;
		}
	} else if (red === 'drop') {
		dropS += dt / 0.7;
		if (dropS >= 1) {
			red = 'hang';
			dropS = 1;
			th[N - 1] = om[N - 1] = 0;
			lastEvent = clock;
		}
	} else if (!drag && !auto && clock - lastEvent > 1 && calm()) {
		// tutto fermo: dimostrazione (prima quella forte, poi quella piccola)
		auto = { idx: 0, sign: -1, amp: AMPS[kicks++ % AMPS.length], t: 0 };
	}
}

// ——— Disegno ———
function ball(x, y, isRed) {
	const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
	if (isRed) {
		g.addColorStop(0, '#ff9a90');
		g.addColorStop(0.45, '#ff3b30');
		g.addColorStop(1, '#9c1209');
	} else {
		g.addColorStop(0, '#ffffff');
		g.addColorStop(0.5, '#cfcfcf');
		g.addColorStop(1, '#6f6f6f');
	}
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 6.2832);
	ctx.fill();
}

function paint() {
	ctx.clearRect(0, 0, W, Hh);
	const x0 = px[0] - 1.6 * r;
	const x1 = px[N - 1] + 1.6 * r;

	// telaio: sbarra in alto, due montanti, base
	ctx.fillStyle = '#4a4a4a';
	ctx.fillRect(x0, py - 8, x1 - x0, 6);
	ctx.fillStyle = '#2f2f2f';
	ctx.fillRect(x0 - 2, py - 8, 4, baseY - py + 10);
	ctx.fillRect(x1 - 2, py - 8, 4, baseY - py + 10);
	ctx.fillStyle = '#3a3a3a';
	ctx.fillRect(x0 - 8, baseY, x1 - x0 + 16, 5);

	// corde e palline
	const pos = [];
	for (let i = 0; i < N; i++) {
		if (i === N - 1 && red !== 'hang' && red !== 'drop') continue;
		const len = i === N - 1 && red === 'drop' ? L * easeOut(dropS) : L;
		const a = i === N - 1 && red === 'drop' ? 0 : th[i];
		pos.push([i, px[i] + len * sinc(a), py + len * Math.cos(a)]);
	}
	ctx.strokeStyle = 'rgb(255 255 255 / 0.4)';
	ctx.lineWidth = 1.4;
	ctx.beginPath();
	for (const [i, x, y] of pos) {
		ctx.moveTo(px[i], py - 5);
		ctx.lineTo(x, y);
	}
	ctx.stroke();
	for (const [i, x, y] of pos) ball(x, y, i === N - 1);
	if (red === 'fly') ball(fly.x, fly.y, true);
}

function frame(now) {
	raf = requestAnimationFrame(frame);
	const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
	last = now;
	update(dt);
	paint();
}

// ——— Puntatore ———
function local(e) {
	const b = panel.getBoundingClientRect();
	return [e.clientX - b.left, e.clientY - b.top];
}

// quale pallina d'estremità è sotto il puntatore (-1 se nessuna)
function pick(x, y) {
	const reach = r * (coarse.matches ? 2.2 : 1.4);
	for (const [idx, sign] of [[0, -1], [rightEnd(), 1]]) {
		if (idx === 0 && rightEnd() === 0) continue;
		const bx = px[idx] + L * sinc(th[idx]);
		const by = py + L * Math.cos(th[idx]);
		if (Math.hypot(x - bx, y - by) < reach) return { idx, sign };
	}
	return null;
}

function onDown(e) {
	if (!running || auto || red === 'fly' || e.target.closest('a, button')) return;
	const [x, y] = local(e);
	const hit = pick(x, y);
	if (!hit) return;
	panel.setPointerCapture(e.pointerId);
	held = hit.idx;
	drag = { id: e.pointerId, ...hit, max: 0, lastT: e.timeStamp, om: 0 };
	panel.classList.add('is-grabbing');
}

function onMove(e) {
	const [x, y] = local(e);
	if (!drag) {
		if (e.pointerType === 'mouse') panel.classList.toggle('is-grab', running && !auto && !!pick(x, y));
		return;
	}
	if (e.pointerId !== drag.id) return;
	const i = drag.idx;
	const raw = Math.atan2(x - px[i], Math.max(y - py, 8));
	const next = drag.sign < 0 ? Math.min(0, Math.max(-LIMIT, raw)) : Math.max(0, Math.min(LIMIT, raw));
	const dt = Math.max((e.timeStamp - drag.lastT) / 1000, 0.004);
	drag.om = drag.om * 0.5 + ((next - th[i]) / dt) * 0.5; // velocità del gesto, per il lancio
	drag.lastT = e.timeStamp;
	th[i] = next;
	om[i] = 0;
	drag.max = Math.max(drag.max, Math.abs(next));
}

function onUp(e) {
	if (!drag || e.pointerId !== drag.id) return;
	const { idx, sign, max } = drag;
	const still = e.timeStamp - drag.lastT > 80;
	om[idx] = still ? 0 : Math.max(-8, Math.min(8, drag.om));
	drag = null;
	held = -1;
	lastEvent = clock;
	panel.classList.remove('is-grabbing');
	if (e.type === 'pointerup' && max < 0.06) {
		auto = { idx, sign, amp: 0.6, t: 0.3 }; // un semplice tocco = una spinta
	}
}

export function init(el) {
	panel = el;
	rig = el.querySelector('.pen404__rig');
	canvas = el.querySelector('.pen404__canvas');
	ctx = canvas.getContext('2d');
	panel.addEventListener('pointerdown', onDown);
	panel.addEventListener('pointermove', onMove);
	panel.addEventListener('pointerup', onUp);
	panel.addEventListener('pointercancel', onUp);
	panel.addEventListener('pointerleave', () => panel.classList.remove('is-grab'));
	new ResizeObserver(() => {
		if (panel.hidden || !panel.classList.contains('is-live')) return;
		measure();
		if (!running) paint();
	}).observe(panel);
}

export function start() {
	panel.classList.add('is-live');
	measure();
	if (running) return;
	if (reduced.matches) {
		paint(); // ferma: fila a riposo, nessuna dimostrazione
		return;
	}
	running = true;
	last = 0;
	lastEvent = clock;
	raf = requestAnimationFrame(frame);
}

export function stop() {
	if (!panel) return;
	panel.classList.remove('is-live', 'is-grab', 'is-grabbing');
	if (!running) return;
	running = false;
	cancelAnimationFrame(raf);
	drag = null;
	held = -1;
	auto = null;
}
