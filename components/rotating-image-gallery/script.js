// Galleria ad anello. L'indice è cumulativo (mai riportato a zero) così, dopo
// l'ultima immagine, l'anello continua nello stesso verso invece di tornare
// indietro di 315°.
const STEP = 45;
const INTERVAL = 3500;

const stage = document.querySelector('[data-gallery]');
const ring = stage.querySelector('[data-ring]');
const faces = [...ring.querySelectorAll('img')];
const captionOut = document.querySelector('[data-caption-out]');
const playBtn = document.querySelector('[data-play]');

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let n = 0;
let timer = null;
let userPaused = reduced.matches; // con movimento ridotto non parte da solo
let hovering = false;
let visible = true;

function render() {
	ring.style.setProperty('--rot', `${-n * STEP}deg`);
	const i = ((n % faces.length) + faces.length) % faces.length;
	captionOut.textContent = faces[i].dataset.caption;
}

function go(delta, { manual = true } = {}) {
	n += delta;
	// Lo screen reader annuncia solo i cambi voluti dall'utente, non l'autoplay.
	captionOut.setAttribute('aria-live', manual ? 'polite' : 'off');
	render();
}

function syncTimer() {
	clearInterval(timer);
	timer = null;
	const running = !userPaused && !hovering && visible && !document.hidden;
	if (running) timer = setInterval(() => go(1, { manual: false }), INTERVAL);
}

function setPaused(paused) {
	userPaused = paused;
	playBtn.setAttribute('aria-pressed', String(paused));
	playBtn.setAttribute('aria-label', paused ? 'Riprendi la rotazione' : 'Metti in pausa la rotazione');
	syncTimer();
}

document.querySelector('[data-prev]').addEventListener('click', () => go(-1));
document.querySelector('[data-next]').addEventListener('click', () => go(1));
playBtn.addEventListener('click', () => setPaused(!userPaused));

stage.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowLeft') go(-1);
	else if (e.key === 'ArrowRight') go(1);
});

// Trascinamento: basta un gesto deciso di 40px per passare all'immagine accanto.
let startX = null;
stage.addEventListener('pointerdown', (e) => {
	startX = e.clientX;
	stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointerup', (e) => {
	if (startX === null) return;
	const dx = e.clientX - startX;
	startX = null;
	if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
});
stage.addEventListener('pointercancel', () => (startX = null));

// L'autoplay si ferma con il puntatore sopra, fuori schermo e a scheda nascosta.
stage.addEventListener('pointerenter', (e) => {
	if (e.pointerType === 'mouse') {
		hovering = true;
		syncTimer();
	}
});
stage.addEventListener('pointerleave', () => {
	hovering = false;
	syncTimer();
});
new IntersectionObserver(([entry]) => {
	visible = entry.isIntersecting;
	syncTimer();
}).observe(stage);
document.addEventListener('visibilitychange', syncTimer);

setPaused(userPaused);
render();
