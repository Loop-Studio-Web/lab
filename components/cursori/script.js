// Ogni zona [data-zone] scrive la posizione del puntatore (--x, --y, in px dentro
// la zona) e se è dentro (.is-in). Il resto lo fa il CSS; qui solo ciò che il CSS
// non può: il raggio che "ondeggia", play/pausa dei video e l'etichetta dell'animale.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('[data-zone]').forEach((zone) => {
	const move = (e) => {
		const r = zone.getBoundingClientRect();
		zone.style.setProperty('--x', (e.clientX - r.left).toFixed(1));
		zone.style.setProperty('--y', (e.clientY - r.top).toFixed(1));
	};
	zone.addEventListener('pointerenter', (e) => {
		move(e);
		zone.classList.add('is-in');
	});
	zone.addEventListener('pointermove', move);
	zone.addEventListener('pointerleave', () => zone.classList.remove('is-in', 'is-over'));
});

// I link della demo non portano da nessuna parte.
document.querySelectorAll('[data-demo-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

// ——— Torcia ———
const torch = document.querySelector('[data-torch]');
const slider = torch.querySelector('input[type="range"]');
let radius = Number(slider.value);
let live = false;
let t = 0;
const flicker = () => {
	t += 0.05;
	torch.style.setProperty('--r', `${(radius + (reduce.matches ? 0 : Math.sin(t * 3) * 3)).toFixed(1)}px`);
	if (live && !reduce.matches) requestAnimationFrame(flicker);
};
slider.addEventListener('input', () => {
	radius = Number(slider.value);
	flicker();
});
// Al caricamento la torcia sta al centro della mappa, non nell'angolo.
const r0 = torch.getBoundingClientRect();
torch.style.setProperty('--x', (r0.width / 2).toFixed(1));
torch.style.setProperty('--y', (r0.height / 2).toFixed(1));
new IntersectionObserver((entries) => {
	live = entries[0].isIntersecting;
	if (live) flicker();
}).observe(torch);
flicker();

// ——— Video ———
const zoneVideo = document.querySelector('.zone--video');
const syncCursor = (player) => {
	const paused = player.querySelector('video').paused;
	zoneVideo.dataset.cursor = paused ? 'paused' : 'playing';
};
zoneVideo.querySelectorAll('.player').forEach((player) => {
	const video = player.querySelector('video');
	const btn = player.querySelector('.player__btn');
	player.dataset.state = 'paused';
	btn.addEventListener('click', () => {
		if (video.paused) video.play();
		else video.pause();
	});
	video.addEventListener('play', () => {
		player.dataset.state = 'playing';
		btn.setAttribute('aria-label', 'Metti in pausa');
		syncCursor(player);
	});
	video.addEventListener('pause', () => {
		player.dataset.state = 'paused';
		btn.setAttribute('aria-label', 'Riproduci');
		syncCursor(player);
	});
	player.addEventListener('pointerenter', () => syncCursor(player));
});
// Una sola scheda alla volta: se un video parte, gli altri della pagina si fermano.
zoneVideo.addEventListener(
	'play',
	(e) => zoneVideo.querySelectorAll('video').forEach((v) => v !== e.target && v.pause()),
	true,
);

// ——— Animali: icona e nome seguono l'elemento sotto il puntatore ———
const pets = document.querySelector('[data-pets]');
const petName = pets.querySelector('.pet-name');
const petIcons = pets.querySelectorAll('.cursor--pet img');
pets.addEventListener('pointermove', (e) => {
	const pet = e.target.closest('.pet');
	pets.classList.toggle('is-over', Boolean(pet));
	if (!pet) return;
	petName.textContent = pet.dataset.label;
	petIcons.forEach((img) => img.classList.toggle('is-on', img.dataset.icon === pet.dataset.label));
});
