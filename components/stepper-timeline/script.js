// Stepper: stato di ogni passo in data-state (done / current / todo); il
// testo del pannello è un annuncio per gli screen reader (aria-live) e il
// pulsante "Indietro" si disattiva sul primo passo.
const tr = (k, it) => LabI18n.t(k, it);
const CONTENT = [
	[tr('st.js1', 'Parlaci dell’attività'), tr('st.js2', 'Che cosa fate, per chi lo fate e da quanto tempo. Bastano poche righe.')],
	[tr('st.js3', 'Cosa vi serve'), tr('st.js4', 'Un sito nuovo, foto e video, la gestione dei social: scegliete una o più cose.')],
	[tr('st.js5', 'Come vi raggiungiamo'), tr('st.js6', 'Un’email e, se preferite, un numero di telefono. Rispondiamo entro un giorno.')],
	[tr('st.js7', 'Tutto pronto'), tr('st.js8', 'Controllate il riepilogo e inviate: nessun impegno, vi proponiamo un preventivo.')],
];
const wiz = document.querySelector('[data-wiz]');
const steps = [...wiz.querySelectorAll('.step')];
const title = wiz.querySelector('[data-title]');
const text = wiz.querySelector('[data-text]');
const back = wiz.querySelector('[data-back]');
const next = wiz.querySelector('[data-next]');
let i = 0;

function render() {
	steps.forEach((s, k) => {
		s.dataset.state = k < i ? 'done' : k === i ? 'current' : 'todo';
		if (k === i) s.setAttribute('aria-current', 'step');
		else s.removeAttribute('aria-current');
	});
	wiz.style.setProperty('--progress', String(i / (steps.length - 1)));
	[title.textContent, text.textContent] = CONTENT[i];
	back.disabled = i === 0;
	next.textContent = i === steps.length - 1 ? tr('st.js9', 'Ricomincia') : tr('st.next', 'Avanti');
}
next.addEventListener('click', () => {
	i = i === steps.length - 1 ? 0 : i + 1;
	render();
});
back.addEventListener('click', () => {
	i = Math.max(0, i - 1);
	render();
});
render();
