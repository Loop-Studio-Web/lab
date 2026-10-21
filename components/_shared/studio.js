// Firma dello studio: un solo componente per tutte le pagine del Lab.
// Basta <script src="../_shared/studio.js"></script> in fondo al body. Inserisce il
// logo in alto e la firma in fondo, con link al sito madre in una nuova scheda
// (le pagine vivono spesso dentro un iframe). Percorsi relativi allo script stesso:
// funziona da qualunque cartella.
(() => {
	const here = document.currentScript.src;
	const url = (file) => new URL(file, here).href;
	const SITE = 'https://theloopstudio.org/';

	const css = document.createElement('link');
	css.rel = 'stylesheet';
	css.href = url('studio.css');
	document.head.append(css);

	const link = (className) => {
		const a = document.createElement('a');
		a.className = className;
		a.href = SITE;
		a.target = '_blank';
		a.rel = 'noopener';
		a.innerHTML =
			`<img src="${url('logo-on-dark.svg')}" alt="Loop Studio" width="182" height="96" />` +
			'<span class="sr-only">(si apre in una nuova scheda)</span>';
		return a;
	};

	document.body.prepend(link('studio-corner'));

	const footer = document.createElement('footer');
	footer.className = 'studio-mark';
	footer.innerHTML = '<p>Realizzato da</p>';
	footer.append(link('studio-mark__link'));
	document.body.append(footer);
})();
