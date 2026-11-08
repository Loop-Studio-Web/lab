// Tab «Palette»: i comandi sono dati; la palette li mostra, il finto sito li esegue.
(() => {
	const stage = document.querySelector('[data-stage]');
	const site = stage.querySelector('[data-site]');
	const status = stage.querySelector('[data-status]');
	const open = stage.querySelector('[data-open]');
	open.querySelector('[data-mod]').textContent = `${window.PaletteComandi.MODK}`;

	const G = {
		pages: LabI18n.t('pc.g.pages', 'Pagine'),
		actions: LabI18n.t('pc.g.actions', 'Azioni'),
		look: LabI18n.t('pc.g.look', 'Aspetto'),
	};
	const go = (id) => () => {
		site.querySelectorAll('[data-p]').forEach((s) => (s.hidden = s.dataset.p !== id));
		site.dataset.page = id;
	};
	const theme = (v) => () => (site.dataset.theme = v);

	const items = [
		{ group: G.pages, icon: 'page', label: LabI18n.t('palette.c.home', 'Vai alla Home'), kbd: ['G', 'H'], seq: ['g', 'h'], keywords: 'home inizio casa', run: go('home') },
		{ group: G.pages, icon: 'page', label: LabI18n.t('palette.c.serv', 'Vai ai Servizi'), kbd: ['G', 'S'], seq: ['g', 's'], keywords: 'servizi offerta', run: go('servizi') },
		{ group: G.pages, icon: 'page', label: LabI18n.t('palette.c.prog', 'Vai ai Progetti'), kbd: ['G', 'P'], seq: ['g', 'p'], keywords: 'progetti lavori portfolio', run: go('progetti') },
		{ group: G.pages, icon: 'page', label: LabI18n.t('palette.c.cont', 'Vai ai Contatti'), kbd: ['G', 'C'], seq: ['g', 'c'], keywords: 'contatti scrivici', run: go('contatti') },
		{ group: G.actions, icon: 'mail', label: LabI18n.t('palette.c.mail', 'Copia l’indirizzo email'), keywords: 'copia email scrivi' },
		{ group: G.actions, icon: 'download', label: LabI18n.t('palette.c.price', 'Scarica il listino'), keywords: 'listino prezzi pdf download' },
		{ group: G.look, icon: 'sun', label: LabI18n.t('palette.c.light', 'Tema chiaro'), keywords: 'tema chiaro luce giorno', run: theme('light') },
		{ group: G.look, icon: 'moon', label: LabI18n.t('palette.c.dark', 'Tema scuro'), keywords: 'tema scuro notte buio', run: theme('dark') },
	];

	let timer;
	window.PaletteComandi.create({
		stage,
		trigger: open,
		items,
		onRun(it) {
			status.textContent = LabI18n.t('palette.done', 'Fatto: {l}', { l: it.label });
			status.classList.add('is-on');
			clearTimeout(timer);
			timer = setTimeout(() => status.classList.remove('is-on'), 2200);
		},
	});
})();
