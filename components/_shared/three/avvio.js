// Avvio al primo gesto: le scene three.js sono pesanti (modulo da 700 KB, geometrie, riflessi) e, finché nessuno
// le tocca, basta la foto ferma (poster) che sta già nell'HTML. Al primo scroll, tocco, tasto o movimento del
// puntatore la scena vera viene scaricata e prende il posto della foto (kit.js mette `is-live` sul contenitore).
// `?live` nell'indirizzo la fa partire subito (serve per fotografare il poster).
// Restituisce l'evento che l'ha fatta partire (undefined con ?live): chi ha pulsanti può rifare il clic perso nel frattempo.
const GESTI = ['scroll', 'wheel', 'pointerdown', 'pointermove', 'touchstart', 'keydown'];

export function alPrimoGesto() {
	if (/[?&]live(&|$)/.test(location.search)) return Promise.resolve();
	return new Promise((resolve) => {
		const via = (evento) => {
			for (const g of GESTI) removeEventListener(g, via);
			resolve(evento);
		};
		for (const g of GESTI) addEventListener(g, via, { passive: true, once: true });
	});
}
