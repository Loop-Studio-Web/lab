// Tab «Sotto-comandi»: tre comandi con secondo livello (persona, scadenza, etichetta) più due comandi semplici.
(() => {
	const stage = document.querySelector('[data-stage]');
	const card = stage.querySelector('[data-card]');
	const log = stage.querySelector('[data-log]');
	const open = stage.querySelector('[data-open]');
	open.querySelector('[data-mod]').textContent = `${window.PaletteComandi.MODK}`;
	const field = (n) => card.querySelector(`[data-f="${n}"]`);
	field('state').textContent = LabI18n.t('sub.open', 'Da fare');

	const set = (name, html, entry) => {
		const el = field(name);
		el.innerHTML = html;
		el.classList.remove('is-new');
		void el.offsetWidth;
		el.classList.add('is-new');
		const li = document.createElement('li');
		li.textContent = entry;
		log.prepend(li);
		while (log.children.length > 3) log.lastChild.remove();
	};
	const text = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

	const people = ['Anna', 'Marco', 'Giulia', 'Luca'].map((n) => ({
		icon: 'user',
		label: n,
		run: () => set('who', text(n), LabI18n.t('sub.l.who', 'Assegnata a {n}', { n })),
	}));
	const dueOpts = [
		[LabI18n.t('sub.d.today', 'Oggi'), 'today'],
		[LabI18n.t('sub.d.tomorrow', 'Domani'), 'tomorrow'],
		[LabI18n.t('sub.d.week', 'Fra una settimana'), 'week'],
		[LabI18n.t('sub.d.none', 'Nessuna'), 'none'],
	].map(([l]) => ({
		icon: 'calendar',
		label: l,
		run: () => set('due', text(l), LabI18n.t('sub.l.due', 'Scadenza: {d}', { d: l })),
	}));
	const labels = [
		[LabI18n.t('sub.t.urgent', 'Urgente'), '#ff3b30'],
		[LabI18n.t('sub.t.client', 'Cliente'), '#4aa3ff'],
		[LabI18n.t('sub.t.internal', 'Interno'), '#4cc9a4'],
	].map(([l, c]) => ({
		icon: 'tag',
		label: l,
		run: () => set('label', `<i class="tk__dot" style="--c:${c}"></i>${text(l)}`, LabI18n.t('sub.l.label', 'Etichetta: {t}', { t: l })),
	}));

	const items = [
		{ icon: 'user', label: LabI18n.t('sub.c.assign', 'Assegna a…'), keywords: 'persona assegna responsabile person assign owner persona asignar responsable', children: people },
		{ icon: 'calendar', label: LabI18n.t('sub.c.due', 'Imposta la scadenza…'), keywords: 'data scadenza quando date due deadline when fecha vencimiento cuando', children: dueOpts },
		{ icon: 'tag', label: LabI18n.t('sub.c.label', 'Aggiungi un’etichetta…'), keywords: 'etichetta colore tag label colour color etiqueta', children: labels },
		{
			icon: 'check',
			label: LabI18n.t('sub.c.done', 'Segna come fatta'),
			keywords: 'completa fatto finito complete done finished completar hecho terminado',
			run: () => {
				card.classList.add('is-done');
				set('state', LabI18n.t('sub.done', 'Fatta'), LabI18n.t('sub.l.done', 'Segnata come fatta'));
			},
		},
		{
			icon: 'undo',
			label: LabI18n.t('sub.c.reset', 'Ripristina tutto'),
			keywords: 'reset annulla ripristina undo restore cancel deshacer restaurar cancelar',
			run: () => {
				card.classList.remove('is-done');
				set('who', '—', LabI18n.t('sub.l.reset', 'Attività ripristinata'));
				set('due', '—', '');
				set('label', '—', '');
				set('state', LabI18n.t('sub.open', 'Da fare'), '');
				[...log.children].filter((li) => !li.textContent).forEach((li) => li.remove());
			},
		},
	];

	window.PaletteComandi.create({ stage, trigger: open, items });
})();
