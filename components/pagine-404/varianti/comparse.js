// Variante Comparse (FR): finestrine finte compaiono a caso e, come il cursore (o il dito) si avvicina,
// scappano. Quella vera, «Retour à l'accueil», sta ferma sotto: si trova quando le altre si sono tolte.
// Il ciclo gira solo tra start() e stop(); con movimento ridotto le finestre sono ferme e il pulsante resta libero.

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');

// Le finestrine: titolo, messaggio, pulsante. «home» = il pulsante finto uguale a quello vero.
const FINESTRE = [
	{ t: 'Félicitations !', m: 'Vous êtes le 1 000 000e visiteur de cette page.', b: 'Réclamer', home: false },
	{ t: 'Information', m: 'Cette page n’existe pas. Nous non plus, parfois.', b: 'Retour à l’accueil', home: true },
	{ t: 'Cookies', m: 'Nous n’en avons pas. Accepter quand même ?', b: 'Accepter', home: false },
	{ t: 'Attention', m: 'Voulez-vous vraiment partir sans rien acheter ?', b: 'Retour à l’accueil', home: true },
	{ t: 'Mise à jour', m: 'La page 404 est prête à être installée.', b: 'Plus tard', home: false },
	{ t: 'Alerte', m: 'Un bouton vous observe depuis le début.', b: 'Retour à l’accueil', home: true },
	{ t: 'Newsletter', m: 'Un e-mail par siècle, promis.', b: 'Je m’abonne', home: false },
];

function mulberry32(a) {
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rnd = mulberry32(404);

let panel, layer, home;
let wins = [];
let raf = 0, last = 0, running = false, nextAt = 0, next = 0;
const ptr = { x: -9999, y: -9999, on: false };
let W = 0, H = 0, left = 0, top = 0;

const max = () => (coarse.matches ? 3 : 5);
const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

function measure() {
	const r = panel.getBoundingClientRect();
	W = r.width;
	H = r.height;
	left = r.left;
	top = r.top;
}

// Posizione a caso (centro della finestra), lontana dal puntatore e dentro il riquadro.
function pick(w, h, avoid = true) {
	const m = 8;
	let x = 0, y = 0;
	for (let i = 0; i < 12; i++) {
		x = m + w / 2 + rnd() * Math.max(1, W - w - m * 2);
		y = m + h / 2 + rnd() * Math.max(1, H - h - m * 2);
		if (!avoid || !ptr.on || Math.hypot(x - (ptr.x - left), y - (ptr.y - top)) > rem() * 8) break;
	}
	return [x, y];
}

function spawn() {
	const d = FINESTRE[next++ % FINESTRE.length];
	const el = document.createElement('div');
	el.className = 'cmp404__win';
	el.setAttribute('aria-hidden', 'true');
	el.innerHTML =
		`<div class="cmp404__win-in"><div class="cmp404__bar"><span>${d.t}</span><i>×</i></div>` +
		`<p>${d.m}</p><span class="cmp404__btn${d.home ? ' cmp404__btn--home' : ''}">${d.b}</span></div>`;
	layer.appendChild(el);
	const w = el.offsetWidth, h = el.offsetHeight;
	const [x, y] = pick(w, h);
	const o = { el, w, h, x, y, vx: 0, vy: 0, born: performance.now() };
	wins.push(o);
	draw(o);
}

function draw(o) {
	o.el.style.transform = `translate(${(o.x - o.w / 2).toFixed(1)}px, ${(o.y - o.h / 2).toFixed(1)}px)`;
}

function retire(o) {
	wins = wins.filter((w) => w !== o);
	o.el.classList.add('is-out');
	setTimeout(() => o.el.remove(), 260);
}

function frame(now) {
	raf = requestAnimationFrame(frame);
	const dt = last ? Math.min(now - last, 50) : 16;
	last = now;
	const k = dt / 16;
	const px = ptr.x - left;
	const py = ptr.y - top;
	const reach = rem() * 7;
	const panic = rem() * 2.6;

	for (const o of wins) {
		if (ptr.on) {
			const dx = o.x - px;
			const dy = o.y - py;
			// distanza dal bordo della finestra, non dal centro: scappa quando il puntatore la sfiora
			const d = Math.hypot(Math.max(Math.abs(dx) - o.w / 2, 0), Math.max(Math.abs(dy) - o.h / 2, 0));
			if (d < panic && now - o.born > 500) {
				// messa all'angolo o troppo vicino: salta altrove con un colpetto
				[o.x, o.y] = pick(o.w, o.h);
				o.vx = o.vy = 0;
				o.el.classList.remove('is-pop');
				void o.el.offsetWidth;
				o.el.classList.add('is-pop');
			} else if (d < reach) {
				const f = (1 - d / reach) ** 2 * 2.4 * k;
				const n = Math.hypot(dx, dy) || 1;
				o.vx += (dx / n) * f;
				o.vy += (dy / n) * f;
			}
		}
		o.vx *= 0.9;
		o.vy *= 0.9;
		o.x += o.vx * k;
		o.y += o.vy * k;
		// restano dentro il riquadro
		const hw = o.w / 2 + 4, hh = o.h / 2 + 4;
		if (o.x < hw) { o.x = hw; o.vx = Math.abs(o.vx) * 0.4; }
		if (o.x > W - hw) { o.x = W - hw; o.vx = -Math.abs(o.vx) * 0.4; }
		if (o.y < hh) { o.y = hh; o.vy = Math.abs(o.vy) * 0.4; }
		if (o.y > H - hh) { o.y = H - hh; o.vy = -Math.abs(o.vy) * 0.4; }
		draw(o);
	}

	// Ciclo di vita: prima si riempie, poi una esce e un'altra entra, così non si smette di cercare.
	if (now >= nextAt) {
		if (wins.length < max()) {
			spawn();
			nextAt = now + 900;
		} else {
			retire(wins[0]);
			nextAt = now + 1400;
		}
	}
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
	layer = document.createElement('div');
	layer.className = 'cmp404__layer';
	layer.setAttribute('aria-hidden', 'true');
	panel.appendChild(layer);
	home = panel.querySelector('.page404__home');

	panel.addEventListener('pointermove', onMove);
	panel.addEventListener('pointerdown', onMove);
	panel.addEventListener('pointerleave', onLeave);
	panel.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && onLeave());
	panel.addEventListener('pointercancel', onLeave);

	// Trovato il pulsante vero: le finestre si ritirano finché ci si resta sopra. Con la tastiera
	// (niente puntatore) sono subito nascoste, così il focus si vede.
	home.addEventListener('pointerenter', () => panel.classList.add('is-found'));
	home.addEventListener('pointerleave', () => panel.classList.remove('is-found'));
	home.addEventListener('focus', () => home.matches(':focus-visible') && panel.classList.add('is-found'));
	home.addEventListener('blur', () => panel.classList.remove('is-found'));

	new ResizeObserver(() => {
		if (!panel.hidden) measure();
	}).observe(panel);
}

export function start() {
	panel.classList.add('is-live');
	measure();
	if (running) return;
	if (reduced.matches) {
		// Ferme: tre finestre sparse, il pulsante vero libero; nessun ciclo.
		if (!wins.length) for (let i = 0; i < 3; i++) spawn();
		panel.classList.add('is-still');
		return;
	}
	running = true;
	last = 0;
	nextAt = 0;
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
