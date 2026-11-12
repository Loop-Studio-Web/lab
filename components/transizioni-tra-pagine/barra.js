// Barra comune alle 3 pagine (striscia della demo con il selettore + barra del negozio), scritta UNA volta qui.
// Script sincrono messo come primo elemento del <body>: la barra esiste già al primo disegno, così nella
// transizione è lo stesso blocco e resta ferma (view-transition-name «barra», vedi transizioni.css).
// Espone window.Ttp.link(percorso, extra): URL relativo alla cartella della scheda che porta con sé ?lang e ?embed.
(() => {
	const base = new URL('./', document.currentScript.src);
	const q = new URLSearchParams(location.search);

	const link = (percorso, extra = {}) => {
		const u = new URL(percorso, base);
		['lang', 'embed'].forEach((k) => q.has(k) && u.searchParams.set(k, q.get(k)));
		Object.entries(extra).forEach(([k, v]) => u.searchParams.set(k, v));
		return u.pathname + u.search;
	};
	window.Ttp = { link };

	const path = location.pathname;
	const corrente = path.includes('/contatto/') ? 'contatto' : path.includes('/disco/') ? 'disco' : 'catalogo';
	const attuale = (id) => (corrente === id ? ' aria-current="page"' : '');

	const stili = [
		['dissolvenza', LabI18n.t('ttp.s.fade', 'Dissolvenza')],
		['scorrimento', LabI18n.t('ttp.s.slide', 'Scorrimento')],
		['volo', LabI18n.t('ttp.s.fly', 'Volo')],
		['nessuna', LabI18n.t('ttp.s.none', 'Nessuna')],
	];
	const scelto = document.documentElement.dataset.stile;

	const header = document.createElement('header');
	header.className = 'ttp-top';
	header.innerHTML =
		`<div class="ttp-demo">` +
		`<span class="ttp-demo__label">${LabI18n.t('ttp.style', 'Transizione')}</span>` +
		`<div class="ttp-seg" role="group" aria-label="${LabI18n.t('ttp.style.aria', 'Stile di transizione tra le pagine')}">` +
		stili.map(([id, nome]) => `<button type="button" data-stile="${id}" aria-pressed="${id === scelto}">${nome}</button>`).join('') +
		`</div>` +
		`<p class="ttp-support" role="note" hidden>${LabI18n.t('ttp.unsupported', 'Questo browser non anima il cambio pagina: la navigazione resta normale.')}</p>` +
		`</div>` +
		`<div class="ttp-shop">` +
		`<a class="ttp-brand" href="${link('./')}">Cera <span aria-hidden="true">&amp;</span><span class="sr-only">e</span> Solco</a>` +
		`<nav aria-label="${LabI18n.t('ttp.nav', 'Negozio')}">` +
		`<a href="${link('./')}"${corrente === 'catalogo' || corrente === 'disco' ? ' aria-current="page"' : ''}>${LabI18n.t('ttp.catalog', 'Catalogo')}</a>` +
		`<a href="${link('contatto/')}"${attuale('contatto')}>${LabI18n.t('ttp.contact', 'Contatto')}</a>` +
		`</nav></div>`;
	document.currentScript.before(header);

	if (!('PageRevealEvent' in window)) header.querySelector('.ttp-support').hidden = false;

	header.querySelector('.ttp-seg').addEventListener('click', (e) => {
		const b = e.target.closest('button[data-stile]');
		if (!b) return;
		document.documentElement.dataset.stile = b.dataset.stile;
		try {
			sessionStorage.setItem('ttp-stile', b.dataset.stile);
		} catch {
			/* storage bloccato: vale solo per questa pagina */
		}
		header.querySelectorAll('[data-stile]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
	});
})();
