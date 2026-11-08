// Pagine 404: il selettore a tab (stessa logica di tab-segmented) e il caricamento delle varianti.
// Ogni variante è un modulo in varianti/ che esporta { init(panel), start(), stop() }: si importa
// alla prima visita del tab; start() quando il tab è attivo E il palco è in vista, stop() altrimenti.

const VARIANTI = {
	testo: () => import('./varianti/testo.js'),
	infinito: () => import('./varianti/infinito.js'),
	particelle: () => import('./varianti/particelle.js'),
	bolle: () => import('./varianti/bolle.js'),
	comparse: () => import('./varianti/comparse.js'),
	tris: () => import('./varianti/tris.js'),
	// le altre arrivano una alla volta: senza modulo il pannello resta con «In costruzione»
};

const picker = document.querySelector('[data-picker]');
const list = picker.querySelector('[role="tablist"]');
const tabs = [...list.querySelectorAll('[role="tab"]')];
const bar = list.querySelector('.picker__bar');
const stage = document.querySelector('[data-stage]');

const moduli = new Map(); // nome → modulo già inizializzato
let attivo = null; // modulo della variante a vista
let inVista = false;

const nameOf = (tab) => tab.id.replace('t-', '');
const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');

function indicate(tab) {
	list.style.setProperty('--x', `${tab.offsetLeft}px`);
	list.style.setProperty('--w', `${tab.offsetWidth}px`);
}

function sync() {
	// Parte solo la variante del tab attivo, e solo se il palco è visibile.
	moduli.forEach((m) => (m === attivo && inVista && !document.hidden ? m.start() : m.stop()));
}

async function select(tab, { focus = false } = {}) {
	const name = nameOf(tab);
	tabs.forEach((t) => {
		const on = t === tab;
		t.setAttribute('aria-selected', String(on));
		t.tabIndex = on ? 0 : -1;
		document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
	});
	indicate(tab);
	tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
	if (focus) tab.focus();

	attivo = null;
	sync(); // ferma subito la variante che si lascia
	if (!VARIANTI[name]) return;
	if (!moduli.has(name)) {
		try {
			const mod = await VARIANTI[name]();
			mod.init(document.getElementById(`p-${name}`));
			moduli.set(name, mod);
		} catch (err) {
			console.error(`Variante «${name}» non caricata`, err);
			return;
		}
	}
	if (current() !== tab) return; // nel frattempo si è passati a un altro tab
	attivo = moduli.get(name);
	sync();
}

tabs.forEach((tab, i) => {
	tab.addEventListener('click', () => select(tab));
	tab.addEventListener('keydown', (e) => {
		const last = tabs.length - 1;
		const to = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
		if (to === undefined) return;
		e.preventDefault();
		select(tabs[to], { focus: true });
	});
});

// «Torna alla home» è finta nella scheda: non si esce dalla demo.
stage.addEventListener('click', (e) => {
	if (e.target.closest('[data-demo-link]')) e.preventDefault();
});

// Palco in vista (e scheda del browser visibile): le animazioni girano solo allora.
new IntersectionObserver(
	([entry]) => {
		inVista = entry.isIntersecting;
		sync();
	},
	{ threshold: 0.2 },
).observe(stage);
document.addEventListener('visibilitychange', sync);

new ResizeObserver(() => indicate(current())).observe(list);
document.fonts?.ready.then(() => indicate(current()));
indicate(current());
requestAnimationFrame(() => picker.classList.add('is-ready'));
select(current());
