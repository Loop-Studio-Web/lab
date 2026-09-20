// Sfalsamento d'ingresso delle tessere: una custom property per tessera,
// letta dal CSS (--delay) invece di N regole @keyframes separate.
document.querySelectorAll('.bento-tile').forEach((tile, i) => {
	tile.style.setProperty('--delay', `${i * 70}ms`);
});

// Spotlight: un solo listener su tutta la griglia (event delegation) invece
// di uno per tessera. Aggiornamento delle custom property --x/--y limitato
// a un aggiornamento per frame con requestAnimationFrame, così anche molti
// eventi "pointermove" ravvicinati non sovraccaricano il thread principale.
const grid = document.querySelector('.bento-grid');
let pending = null;
let ticking = false;

function applyPending() {
	if (pending) {
		const { tile, x, y } = pending;
		const rect = tile.getBoundingClientRect();
		tile.style.setProperty('--x', `${x - rect.left}px`);
		tile.style.setProperty('--y', `${y - rect.top}px`);
		pending = null;
	}
	ticking = false;
}

grid.addEventListener('pointermove', (e) => {
	const tile = e.target.closest('.bento-tile');
	if (!tile) return;
	pending = { tile, x: e.clientX, y: e.clientY };
	if (!ticking) {
		ticking = true;
		requestAnimationFrame(applyPending);
	}
});
