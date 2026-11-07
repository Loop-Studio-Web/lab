// Effetti di testo: il movimento è tutto CSS. Il testo spezzato in lettere e i keyframe dei glitch
// stanno in ../_shared/effetti-testo.js. Qui:
//  1. le animazioni partono e si fermano con la sezione in vista (.is-live),
//  2. i pulsanti-demo su touch,
//  3. si costruiscono le lettere dove servono (impilate, ricomposizione, giro).

const fx = window.EffettiTesto;

// 1. Sezioni in vista: .is-live. Le intro (data-restart) ripartono da capo a ogni ingresso.
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

// 2. Pulsanti-demo: su touch non esiste :hover, un tocco accende e un altro spegne.
document.querySelectorAll('[data-hglitch], [data-stack]').forEach((btn) => {
	btn.addEventListener('click', () => {
		btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
	});
});

// 3. Lettere.
document.querySelectorAll('[data-stack]').forEach(fx.buildStack);
document.querySelectorAll('[data-scramble]').forEach(fx.buildScramble);
document.querySelectorAll('[data-orbit]').forEach(fx.buildOrbit);
