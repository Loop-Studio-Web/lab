// Variante Testo: un solo 404 che passa da un effetto all'altro (neon, segnale, ricomposizione,
// barre, lettere impilate, giro). Appare → resta (data-hold ms) → sfuma → entra il successivo.
// Le lettere e i keyframe dei glitch vengono da _shared/effetti-testo.js.

const fx = window.EffettiTesto;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

let panel, items, dots;
let index = -1;
let running = false;
let timers = [];

const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const clear = () => {
	timers.forEach(clearTimeout);
	timers = [];
};

export function init(el) {
	panel = el;
	items = [...el.querySelectorAll('.fx')];
	dots = [...el.querySelectorAll('.dots button')];
	dots.forEach((d, k) => d.addEventListener('click', () => goTo(k)));
	el.querySelectorAll('[data-stack]').forEach(fx.buildStack);
	el.querySelectorAll('[data-scramble]').forEach(fx.buildScramble);
	el.querySelectorAll('[data-orbit]').forEach(fx.buildOrbit);
	// Movimento ridotto: una sola scritta ferma, senza ciclo e senza pallini.
	if (reduced.matches) {
		const still = items.find((i) => i.dataset.fx === 'stack');
		items.forEach((i) => (i.hidden = i !== still));
		el.querySelector('.dots').hidden = true;
	}
}

// Un pallino salta a quell'effetto: si ferma il giro in corso e si riparte da lì.
function goTo(i) {
	if (!running || i === index) return;
	clear();
	items.forEach((it) => {
		it.hidden = true;
		it.classList.remove('is-out');
	});
	show(i);
}

function show(i) {
	index = i;
	const item = items[i];
	item.classList.remove('is-out');
	item.hidden = false; // da nascosto a visibile: le animazioni CSS ripartono da capo
	dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));

	// La pila si apre a ventaglio poco dopo l'entrata (col mouse lo fa l'hover nella scheda degli effetti).
	if (item.dataset.fx === 'stack') {
		const stack = item.querySelector('.stack');
		stack.setAttribute('aria-pressed', 'false');
		later(() => stack.setAttribute('aria-pressed', 'true'), 900);
	}

	later(() => {
		item.classList.add('is-out');
		later(() => {
			item.hidden = true;
			show((i + 1) % items.length);
		}, 320);
	}, Number(item.dataset.hold));
}

export function start() {
	if (running || reduced.matches) {
		panel?.classList.add('is-live');
		return;
	}
	running = true;
	panel.classList.add('is-live');
	// Riprende dall'effetto in corso; la prima volta parte dal primo.
	show(index < 0 ? 0 : index);
}

export function stop() {
	if (!panel) return;
	panel.classList.remove('is-live');
	if (!running) return;
	running = false;
	clear();
	items.forEach((i) => {
		i.hidden = true;
		i.classList.remove('is-out');
	});
}
