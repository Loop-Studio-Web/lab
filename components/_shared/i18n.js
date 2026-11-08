// Traduzioni a runtime (IT / EN / ES) per le schede del Lab.
// L'italiano sta SOLO nell'HTML (default, niente flash). Qui: scelta della lingua e applicazione del dizionario.
//
// Uso in una pagina (nell'<head>, script sincroni, in quest'ordine):
//   <script src="../_shared/i18n.js"></script>      scelta lingua + <html lang> prima del rendering
//   <script src="i18n.js"></script>                 dizionario della scheda: LabI18n.add({ en:{…}, es:{…} })
// Nell'HTML:
//   data-i18n="chiave"                       sostituisce il testo dell'elemento
//   data-i18n-attr="alt=chiave,aria-label=k" sostituisce attributi
// Da JS: LabI18n.t('chiave', 'Testo italiano di ripiego', { n: 3 })   ({n} nel testo si sostituisce)
//
// Lingua: ?lang=en|es|it  →  lingua del browser  →  italiano. La modale del sito madre aggiunge ?lang.
(() => {
	const LANGS = ['it', 'en', 'es'];
	const fromQuery = new URLSearchParams(location.search).get('lang');
	const fromBrowser = (navigator.languages || [navigator.language || ''])
		.map((l) => String(l).slice(0, 2).toLowerCase())
		.find((l) => LANGS.includes(l));
	const lang = LANGS.includes(fromQuery) ? fromQuery : fromBrowser || 'it';
	document.documentElement.lang = lang;

	// noindex è già nell'HTML; qui solo il dizionario.
	const dict = { en: {}, es: {} };
	const add = (d) => {
		for (const l of ['en', 'es']) Object.assign(dict[l], d[l]);
	};

	// Stringhe comuni a tutte le schede (firma dello studio, guscio a tab): tradotte una volta sola.
	add({
		en: {
			'studio.by': 'Made by',
			'studio.newtab': '(opens in a new tab)',
			'suite.items': '{n} items in this component · choose',
			'suite.next': 'Next:',
			'suite.again': 'Start again from',
		},
		es: {
			'studio.by': 'Realizado por',
			'studio.newtab': '(se abre en una pestaña nueva)',
			'suite.items': '{n} elementos en esta ficha · elige',
			'suite.next': 'Siguiente:',
			'suite.again': 'Empezar de nuevo desde',
		},
	});

	const t = (key, fallback = '', vars) => {
		let s = (lang !== 'it' && dict[lang][key]) || fallback;
		if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
		return s;
	};

	const apply = (root = document) => {
		if (lang === 'it') return;
		root.querySelectorAll('[data-i18n]').forEach((el) => {
			const s = dict[lang][el.dataset.i18n];
			if (s !== undefined) el.textContent = s;
		});
		root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
			el.dataset.i18nAttr.split(',').forEach((pair) => {
				const [attr, key] = pair.split('=').map((x) => x.trim());
				const s = dict[lang][key];
				if (attr && s !== undefined) el.setAttribute(attr, s);
			});
		});
	};

	window.LabI18n = { lang, t, add, apply };
	// Idempotente: chi ha bisogno del testo tradotto prima (suite.js) richiama apply() da sé.
	document.addEventListener('DOMContentLoaded', () => apply(), { once: true });
})();
