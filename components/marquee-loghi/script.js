// Duplica il gruppo di ogni striscia (la copia è nascosta ai lettori di schermo e
// non prende il focus) e collega il pulsante di pausa.
document.querySelectorAll('[data-marquee]').forEach((m) => {
	const group = m.querySelector('.marquee__group');
	const copy = group.cloneNode(true);
	copy.setAttribute('aria-hidden', 'true');
	copy.removeAttribute('aria-label');
	copy.inert = true;
	m.append(copy);
});

// I link della demo non portano da nessuna parte.
document.querySelectorAll('[data-demo-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

const toggle = document.querySelector('[data-toggle]');
const first = document.querySelector('[data-marquee]');
toggle.addEventListener('click', () => {
	const paused = first.classList.toggle('is-paused');
	toggle.setAttribute('aria-pressed', paused);
	toggle.querySelector('span').textContent = paused ? 'Riprendi' : 'Metti in pausa';
});
