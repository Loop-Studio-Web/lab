// Solo il riquadro vettoriale ha bisogno di JS: passando sopra (o col focus)
// il nome si trasforma nell'indirizzo, al clic l'indirizzo si copia.
const box = document.querySelector('.box');
const btn = box.querySelector('.box__btn');
const done = box.querySelector('[data-hint="done"]');
let timer;

const open = (on) => box.classList.toggle('is-open', on);
btn.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && open(true));
btn.addEventListener('pointerleave', () => open(false));
btn.addEventListener('focus', () => open(true));
btn.addEventListener('blur', () => open(false));

btn.addEventListener('click', async () => {
	try {
		await navigator.clipboard.writeText(btn.dataset.copy);
		done.textContent = 'Indirizzo copiato';
	} catch {
		// Clipboard non disponibile (es. dentro certi iframe): lo diciamo, non fingiamo.
		done.textContent = 'Copia non riuscita: seleziona e copia a mano';
	}
	box.classList.add('is-copied');
	clearTimeout(timer);
	timer = setTimeout(() => box.classList.remove('is-copied'), 2200);
});
