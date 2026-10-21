// Un solo gesto per tutte le versioni: il pulsante alterna aria-pressed, il CSS
// fa il resto. Quando il cuore si accende aggiungiamo per un attimo la classe
// .is-burst, che fa partire le animazioni "a una volta" (scintille, particelle,
// cuoricini); si toglie da sola, così si può ripetere subito.
const BURST_MS = 1000;

function setLiked(btn, on) {
	btn.setAttribute('aria-pressed', String(on));

	// Contatore numerico (foto) e contatore che scorre (roll).
	const count = btn.querySelector('[data-count]');
	if (count) count.textContent = String(Number(count.dataset.count) + (on ? 1 : 0));
	const live = btn.querySelector('[data-live]');
	if (live) live.textContent = on ? 'Mi piace aggiunto' : 'Mi piace tolto';

	if (on) {
		btn.classList.remove('is-burst');
		void btn.offsetWidth; // riavvia le animazioni anche a clic ravvicinati
		btn.classList.add('is-burst');
		clearTimeout(btn._burstTimer);
		btn._burstTimer = setTimeout(() => btn.classList.remove('is-burst'), BURST_MS);
	} else {
		btn.classList.remove('is-burst');
	}
}

document.querySelectorAll('[data-like]').forEach((btn) => {
	btn.addEventListener('click', () => setLiked(btn, btn.getAttribute('aria-pressed') !== 'true'));
});

// Foto: il doppio clic mette il "mi piace" (non lo toglie, come su Instagram) e
// mostra un cuore grande al centro.
document.querySelectorAll('[data-dbl]').forEach((photo) => {
	const btn = photo.querySelector('[data-like]');
	photo.addEventListener('dblclick', (e) => {
		if (e.target.closest('button')) return;
		if (btn.getAttribute('aria-pressed') !== 'true') setLiked(btn, true);
		photo.classList.remove('is-pop');
		void photo.offsetWidth;
		photo.classList.add('is-pop');
		setTimeout(() => photo.classList.remove('is-pop'), 900);
	});
});
