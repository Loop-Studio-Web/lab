// La barra diventa solida quando l'immagine iniziale esce dallo schermo.
// Un IntersectionObserver avvisa solo al passaggio della soglia: niente
// listener su "scroll" che scatta a ogni pixel.
const nav = document.querySelector('[data-nav]');
const hero = document.querySelector('[data-hero]');

const navHeight = nav.offsetHeight;
new IntersectionObserver(([entry]) => nav.classList.toggle('is-solid', !entry.isIntersecting), {
	rootMargin: `-${navHeight}px 0px 0px 0px`,
}).observe(hero);
