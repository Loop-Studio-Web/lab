// Effetti di testo: il movimento è tutto CSS. Qui:
//  1. i keyframe "a scatti" dei glitch (21 tagli casuali, ma sempre gli stessi: seme fisso),
//  2. le animazioni partono e si fermano con la sezione in vista (.is-live),
//  3. il testo spezzato in lettere dove serve (impilate, ricomposizione, giro).

const mulberry32 = (seed) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// 1. Tagli casuali: ogni passo mostra una fascia orizzontale del testo-copia.
const glitchFrames = (name, seed, steps = 20, maxHeight = 34) => {
	const rnd = mulberry32(seed);
	let css = `@keyframes ${name} {`;
	for (let i = 0; i <= steps; i++) {
		const top = Math.round(rnd() * (100 - maxHeight));
		const height = 4 + Math.round(rnd() * (maxHeight - 4));
		css += `${((i / steps) * 100).toFixed(2)}%{clip-path:inset(${top}% 0 ${100 - top - height}% 0)}`;
	}
	return css + '}';
};
const style = document.createElement('style');
style.textContent = [
	glitchFrames('cut-a', 11),
	glitchFrames('cut-b', 29),
	glitchFrames('cut-c', 53, 20, 40),
	glitchFrames('cut-d', 97, 20, 40),
].join('\n');
document.head.append(style);

// 2. Sezioni in vista: .is-live. Le intro (data-restart) ripartono da capo a ogni ingresso.
const live = new IntersectionObserver(
	(entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)),
	{ rootMargin: '40px', threshold: 0.2 },
);
document.querySelectorAll('[data-live]').forEach((el) => live.observe(el));

document.querySelectorAll('[data-replay]').forEach((btn) => {
	btn.addEventListener('click', () => {
		const target = btn.closest('[data-live]');
		target.classList.remove('is-live');
		void target.offsetWidth; // forza il ricalcolo: l'animazione riparte da zero
		target.classList.add('is-live');
	});
});

// Pulsanti-demo: su touch non esiste :hover, un tocco accende e un altro spegne.
document.querySelectorAll('[data-hglitch], [data-stack]').forEach((btn) => {
	btn.addEventListener('click', () => {
		btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
	});
});

// 3a. Lettere impilate: la parola ripetuta in 5 strati, ognuno con il suo colore (via CSS, --i).
document.querySelectorAll('[data-stack]').forEach((btn) => {
	const word = btn.dataset.stack;
	btn.textContent = '';
	for (let i = 0; i < 5; i++) {
		const layer = document.createElement('span');
		layer.className = 'stack__layer';
		layer.style.setProperty('--i', i);
		layer.setAttribute('aria-hidden', 'true');
		layer.textContent = word;
		btn.append(layer);
	}
});

// 3b. Parole e lettere. Il testo vero resta (nascosto) per chi usa lo screen reader;
// quello spezzato è solo decorazione. --i = posizione della lettera nella parola (da 1).
const splitWord = (word) => {
	const span = document.createElement('span');
	[...word].forEach((ch, i) => {
		const letter = document.createElement('span');
		letter.style.setProperty('--i', i + 1);
		letter.textContent = ch;
		span.append(letter);
	});
	return span;
};
const readable = (text) => {
	const p = document.createElement('p');
	p.className = 'sr-only';
	p.textContent = text;
	return p;
};

document.querySelectorAll('[data-scramble]').forEach((el) => {
	const text = el.textContent.trim();
	el.textContent = '';
	const visual = document.createElement('div');
	visual.className = 'scramble__words';
	visual.setAttribute('aria-hidden', 'true');
	text.split(/\s+/).forEach((w) => {
		const word = splitWord(w);
		word.className = 'scramble__word';
		visual.append(word);
	});
	el.append(readable(text), visual);
});

document.querySelectorAll('[data-orbit]').forEach((el) => {
	const text = el.textContent.trim();
	const words = text.split(/\s+/);
	el.textContent = '';
	const ring = document.createElement('ul');
	ring.className = 'orbit__ring';
	ring.setAttribute('aria-hidden', 'true');
	ring.style.setProperty('--count', words.length);
	words.forEach((w, i) => {
		const li = document.createElement('li');
		li.style.setProperty('--i', i + 1);
		li.append(...splitWord(w).childNodes);
		ring.append(li);
	});
	ring.insertAdjacentHTML(
		'beforeend',
		'<svg class="orbit__mark" viewBox="0 0 1465 753"><use href="#i-infinity" /></svg>',
	);
	el.append(readable(text), ring);
});
