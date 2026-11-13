// Assistente a domande guidate: un albero scritto a mano (nessuna AI). Ogni nodo ha una domanda e delle risposte che portano a un altro
// nodo; i nodi finali (`end`) offrono un contatto. Testi di fantasia, tradotti con LabI18n (chiavi `as.*`).
(() => {
	const root = document.querySelector('[data-as]');
	const log = root.querySelector('[data-log]');
	const opts = root.querySelector('[data-opts]');
	const restart = root.querySelector('[data-restart]');

	const tr = (key, it) => LabI18n.t(key, it);
	const HUMAN = [tr('as.human', 'Parla con una persona'), 'human'];
	const TREE = {
		start: { q: tr('as.start.q', 'Ciao! Sono l’assistente di Bianchi Idraulica. Di cosa hai bisogno?'), a: [[tr('as.start.urg', 'Ho un’urgenza'), 'urg'], [tr('as.start.prev', 'Voglio un preventivo'), 'prev'], HUMAN] },
		urg: { q: tr('as.urg.q', 'Capito. L’acqua sta uscendo adesso?'), a: [[tr('as.urg.yes', 'Sì, sta uscendo'), 'urg-ora'], [tr('as.urg.no', 'No, posso aspettare'), 'urg-dopo'], HUMAN] },
		'urg-ora': { end: true, q: tr('as.now.q', 'Chiudi il rubinetto generale e chiamaci subito: le urgenze rispondono anche di notte.'), cta: tr('as.now.cta', 'Chiama +39 000 000 0000') },
		'urg-dopo': { end: true, q: tr('as.later.q', 'Perfetto. Scrivici su WhatsApp con una foto del problema: ti rispondiamo entro un’ora in orario di lavoro.'), cta: tr('as.later.cta', 'Scrivi su WhatsApp') },
		prev: { q: tr('as.prev.q', 'Per che tipo di lavoro?'), a: [[tr('as.prev.bath', 'Bagno completo'), 'sopr'], [tr('as.prev.boiler', 'Caldaia o riscaldamento'), 'sopr'], HUMAN] },
		sopr: { end: true, q: tr('as.visit.q', 'Per questo serve un sopralluogo: è gratuito e il prezzo te lo scriviamo prima di iniziare.'), cta: tr('as.visit.cta', 'Prenota il sopralluogo') },
		human: { end: true, q: tr('as.human.q', 'Nessun problema: una persona del nostro team ti richiama. Lasciaci il tuo numero.'), cta: tr('as.human.cta', 'Chiedi di essere richiamato') },
	};

	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const bubble = (cls, text) => {
		const p = document.createElement('p');
		p.className = 'as__msg ' + cls;
		p.textContent = text;
		log.append(p);
		log.scrollTo({ top: log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
		return p;
	};

	const go = (id, fromKeyboard) => {
		const n = TREE[id];
		bubble('as__msg--bot', n.q);
		opts.replaceChildren();
		if (n.end) {
			const a = document.createElement('a');
			a.className = 'as__cta';
			a.href = '#';
			a.textContent = n.cta;
			a.dataset.demoLink = '';
			a.addEventListener('click', (e) => e.preventDefault());
			opts.append(a);
			restart.hidden = false;
			if (fromKeyboard) a.focus();
			return;
		}
		restart.hidden = true;
		n.a.forEach(([label, next], i) => {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'as__opt' + (next === 'human' ? ' as__opt--ghost' : '');
			b.textContent = label;
			b.addEventListener('click', (e) => {
				bubble('as__msg--me', label);
				// e.detail === 0: attivato da tastiera, quindi il focus segue la conversazione.
				go(next, e.detail === 0);
			});
			opts.append(b);
			if (i === 0 && fromKeyboard) b.focus();
		});
	};

	restart.addEventListener('click', (e) => {
		log.replaceChildren();
		go('start', e.detail === 0);
	});
	go('start');
})();
