// Parte comune ai 3 tab di «Form a passi»: messaggi di errore tradotti, controllo dei campi, memoria locale, movimento.
// Nessuna dipendenza. Ogni campo sta in un .fp-f con, dentro, il controllo e un <p class="fp-err">.
window.FP = (() => {
	const I = window.LabI18n; // i18n.js è sempre caricato prima
	const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Messaggio per il primo problema del campo. Le chiavi sono letterali: il controllo delle traduzioni non vede quelle composte.
	const message = (el) => {
		const v = el.validity;
		if (v.customError) return el.dataset.msg || LabI18n.t('fp.err.req', 'Compila questo campo');
		if (v.valueMissing && el.dataset.reqMsg) return el.dataset.reqMsg;
		if (v.valueMissing) return el.type === 'radio' || el.type === 'checkbox' ? LabI18n.t('fp.err.pick', 'Scegli un’opzione') : LabI18n.t('fp.err.req', 'Compila questo campo');
		if (v.typeMismatch && el.type === 'email') return LabI18n.t('fp.err.email', 'Scrivi un indirizzo email valido, ad esempio nome@esempio.it');
		if (v.patternMismatch) return el.dataset.patternMsg || LabI18n.t('fp.err.pattern', 'Il formato non è corretto');
		if (v.rangeUnderflow && el.type === 'date') return LabI18n.t('fp.err.date', 'Scegli una data da {d} in poi', { d: el.min.split('-').reverse().join('/') });
		if (v.rangeUnderflow) return LabI18n.t('fp.err.min', 'Il valore minimo è {n}', { n: el.min });
		if (v.rangeOverflow) return LabI18n.t('fp.err.max', 'Il valore massimo è {n}', { n: el.max });
		return LabI18n.t('fp.err.pattern', 'Il formato non è corretto');
	};

	// Controlla un campo (o il gruppo con lo stesso name) e scrive l'errore accanto. Ritorna true se è valido.
	const check = (el) => {
		const wrap = el.closest('.fp-f');
		if (!wrap) return el.validity.valid; // scelte senza messaggio (interruttori, caselle facoltative)
		const err = wrap.querySelector('.fp-err');
		const group = el.name && (el.type === 'radio' || el.type === 'checkbox') ? [...wrap.querySelectorAll(`[name="${el.name}"]`)] : [el];
		const bad = group.find((c) => !c.validity.valid);
		group.forEach((c) => c.setAttribute('aria-invalid', bad ? 'true' : 'false'));
		if (err) {
			err.textContent = bad ? message(bad) : '';
			err.hidden = !bad;
			if (bad && err.id) group.forEach((c) => c.setAttribute('aria-describedby', err.id));
		}
		return !bad;
	};

	// Controlla tutti i campi attivi di un contenitore (quelli disabilitati non contano); mette il fuoco sul primo che non va.
	const checkAll = (root) => {
		let first = null;
		root.querySelectorAll('input, select, textarea').forEach((el) => {
			if (el.disabled || el.type === 'hidden' || el.type === 'button') return;
			if (!check(el) && !first) first = el;
		});
		first?.focus();
		return !first;
	};

	// Quando si corregge, l'errore sparisce subito; si mostra solo all'uscita dal campo o al tentativo di andare avanti.
	const live = (root) => {
		root.addEventListener('focusout', (e) => e.target.matches?.('input, select, textarea') && e.target.value !== '' && check(e.target));
		root.addEventListener('input', (e) => {
			const el = e.target;
			if (el.matches?.('input, select, textarea') && el.getAttribute('aria-invalid') === 'true') check(el);
		});
		root.addEventListener('change', (e) => {
			const el = e.target;
			if (el.matches?.('input, select, textarea') && el.getAttribute('aria-invalid') === 'true') check(el);
		});
	};

	// Memoria locale: può mancare o lanciare (finestra privata, dati bloccati): si usa solo come comodità.
	const store = {
		get(key) {
			try {
				return JSON.parse(localStorage.getItem(key) || 'null');
			} catch {
				return null;
			}
		},
		set(key, value) {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch {}
		},
		del(key) {
			try {
				localStorage.removeItem(key);
			} catch {}
		},
	};

	// Entrata/uscita direzionale di un pannello. Con «riduci movimento» non anima nulla.
	const slide = (el, dir, out, axis = 'x') => {
		if (reduce() || !el.animate) return Promise.resolve();
		const d = (axis === 'y' ? 22 : 14) * dir;
		const at = (v) => (axis === 'y' ? `0 ${v}px` : `${v}px 0`);
		const frames = out ? [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: at(-d) }] : [{ opacity: 0, translate: at(d) }, { opacity: 1, translate: '0 0' }];
		const a = el.animate(frames, { duration: out ? 140 : 260, easing: out ? 'ease-in' : 'cubic-bezier(0.23, 1, 0.32, 1)', fill: out ? 'forwards' : 'none' });
		return a.finished.then(() => out && a.cancel()).catch(() => {}); // l'uscita si annulla subito dopo: chi la segue nasconde l'elemento nello stesso istante
	};

	// Data minima di consegna: oggi + 2 giorni, in formato AAAA-MM-GG (ora locale).
	const minDate = (days = 2) => {
		const d = new Date();
		d.setDate(d.getDate() + days);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	};

	const euro = (n) => `${n.toLocaleString(I?.lang || 'it', { minimumFractionDigits: n % 1 ? 2 : 0 })} €`;

	return { reduce, check, checkAll, live, store, slide, minDate, euro };
})();
