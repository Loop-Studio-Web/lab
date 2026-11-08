// Assistente a domande guidate: un albero scritto a mano (nessuna AI). Ogni nodo ha una domanda e delle risposte che portano a un altro
// nodo; i nodi finali (`end`) offrono un contatto. Testi di fantasia: restano in italiano, con qualche nodo in spagnolo e inglese.
(() => {
	const root = document.querySelector('[data-as]');
	const log = root.querySelector('[data-log]');
	const opts = root.querySelector('[data-opts]');
	const restart = root.querySelector('[data-restart]');

	const HUMAN = ['Parla con una persona', 'human'];
	const TREE = {
		start: { q: 'Ciao! Sono l’assistente di Bianchi Idraulica. Di cosa hai bisogno?', a: [['Ho un’urgenza', 'urg'], ['Voglio un preventivo', 'prev'], ['Altro · Otra cosa · Other', 'lang']] },
		urg: { q: 'Capito. L’acqua sta uscendo adesso?', a: [['Sì, sta uscendo', 'urg-ora'], ['No, posso aspettare', 'urg-dopo'], HUMAN] },
		'urg-ora': { end: true, q: 'Chiudi il rubinetto generale e chiamaci subito: le urgenze rispondono anche di notte.', cta: ['Chiama +39 000 000 0000', 'tel'] },
		'urg-dopo': { end: true, q: 'Perfetto. Scrivici su WhatsApp con una foto del problema: ti rispondiamo entro un’ora in orario di lavoro.', cta: ['Scrivi su WhatsApp', 'chat'] },
		prev: { q: 'Per che tipo di lavoro?', a: [['Bagno completo', 'sopr'], ['Caldaia o riscaldamento', 'sopr'], HUMAN] },
		sopr: { end: true, q: 'Per questo serve un sopralluogo: è gratuito e il prezzo te lo scriviamo prima di iniziare.', cta: ['Prenota il sopralluogo', 'chat'] },
		lang: { q: 'Which language do you prefer? ¿En qué idioma prefieres hablar?', a: [['English', 'en'], ['Español', 'es'], HUMAN] },
		en: { end: true, lang: 'en', q: 'Great, we speak English. Send us a message and we’ll reply the same day.', cta: ['Message us', 'chat'] },
		es: { end: true, lang: 'es', q: 'Perfecto, hablamos español. Escríbenos y te respondemos el mismo día.', cta: ['Escríbenos', 'chat'] },
		human: { end: true, q: 'Nessun problema: una persona del nostro team ti richiama. Lasciaci il tuo numero.', cta: ['Chiedi di essere richiamato', 'tel'] },
	};

	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const bubble = (cls, text, lang) => {
		const p = document.createElement('p');
		p.className = 'as__msg ' + cls;
		p.textContent = text;
		if (lang) p.lang = lang;
		log.append(p);
		log.scrollTo({ top: log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
		return p;
	};

	const go = (id, fromKeyboard) => {
		const n = TREE[id];
		bubble('as__msg--bot', n.q, n.lang);
		opts.replaceChildren();
		if (n.end) {
			const a = document.createElement('a');
			a.className = 'as__cta';
			a.href = '#';
			a.textContent = n.cta[0];
			if (n.lang) a.lang = n.lang;
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
