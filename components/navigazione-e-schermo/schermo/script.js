// Schermo reale: modello semplice delle unità di altezza (vh, svh, dvh, lvh) e della tastiera, più i
// tipi di campo (inputmode/autocomplete). Le misure sono quelle del telefono disegnato, non della finestra.
(() => {
	const root = document.querySelector('[data-sc]');
	const page = root.querySelector('[data-page]');
	const kbEl = root.querySelector('[data-kb-el]');
	const status = root.querySelector('.sc__status');
	const barBrowser = root.querySelector('.sc__bar-browser');
	const field = root.querySelector('[data-field]');
	const attrsOut = document.querySelector('[data-attrs]');
	const vvOut = document.querySelector('[data-vv]');
	const ctl = (name) => document.querySelector('[data-ctl="' + name + '"]');
	const bars = Object.fromEntries([...root.querySelectorAll('.sc__bar')].map((b) => [b.dataset.u, b]));

	const TYPES = {
		text: { type: 'text', inputmode: 'text', autocomplete: 'off', autocapitalize: 'sentences', keys: 'qwerty' },
		email: { type: 'email', inputmode: 'email', autocomplete: 'email', autocapitalize: 'off', keys: 'email' },
		tel: { type: 'tel', inputmode: 'tel', autocomplete: 'tel', keys: 'pad' },
		number: { type: 'text', inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off', keys: 'pad' },
		code: { type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', keys: 'pad' },
	};
	const ROWS = {
		qwerty: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
		email: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm@.'],
		pad: ['123', '456', '789', '0'],
	};
	const placeholders = () => ({
		text: LabI18n.t('sc.ph.text', 'Scrivi un messaggio…'),
		email: LabI18n.t('sc.ph.email', 'nome@esempio.it'),
		tel: LabI18n.t('sc.ph.tel', '+39 000 000 0000'),
		number: LabI18n.t('sc.ph.number', 'Importo'),
		code: LabI18n.t('sc.ph.code', 'Codice a 6 cifre'),
	});

	const drawKeys = (kind) => {
		kbEl.className = 'sc__kb' + (kind === 'pad' ? ' sc__kb--pad' : '');
		kbEl.replaceChildren(
			...ROWS[kind].map((row) => {
				const r = document.createElement('div');
				r.className = 'sc__row';
				[...row].forEach((ch) => {
					const k = document.createElement('span');
					k.className = 'sc__key';
					k.textContent = ch;
					r.append(k);
				});
				return r;
			}),
		);
	};

	const px = (n) => Math.round(n) + ' px';
	const setBar = (u, value, visible, label) => {
		const bar = bars[u];
		bar.style.height = value + 'px';
		bar.style.setProperty('--vis', visible + 'px');
		bar.querySelector('i').textContent = px(value);
		const hidden = Math.round(value - visible);
		bar.querySelector('em').textContent = hidden > 0 ? LabI18n.t('sc.hidden', '−{n} px tagliati', { n: hidden }) : '';
		bar.title = label;
	};

	const measure = () => {
		const H = root.clientHeight;
		const app = root.dataset.ctx === 'app';
		const open = root.dataset.bar === 'open';
		const chrome = status.offsetHeight;
		const barH = barBrowser.offsetHeight;
		let lvh, svh, dvh;
		if (app) lvh = svh = dvh = H;
		else {
			lvh = H - chrome;
			svh = lvh - barH;
			dvh = open ? svh : lvh;
		}
		const visible = page.clientHeight;
		const kb = root.dataset.kb === 'on' ? kbEl.offsetHeight : 0;
		setBar('vh', lvh, visible, '100vh');
		setBar('svh', svh, visible, '100svh');
		setBar('dvh', dvh, visible, '100dvh');
		setBar('lvh', lvh, visible, '100lvh');
		setBar('vv', visible - kb, visible, 'visualViewport.height');
	};

	const setType = (v) => {
		const t = TYPES[v];
		field.type = t.type;
		field.setAttribute('inputmode', t.inputmode);
		field.setAttribute('autocomplete', t.autocomplete);
		t.autocapitalize ? field.setAttribute('autocapitalize', t.autocapitalize) : field.removeAttribute('autocapitalize');
		t.pattern ? field.setAttribute('pattern', t.pattern) : field.removeAttribute('pattern');
		field.placeholder = placeholders()[v];
		field.value = '';
		const list = ['type', 'inputmode', 'pattern', 'autocomplete', 'autocapitalize'].filter((k) => t[k]).map((k) => k + '="' + t[k] + '"');
		attrsOut.textContent = '<input ' + list.join(' ') + '>';
		drawKeys(t.keys);
		measure();
	};

	const setKb = NP.toggle(ctl('kb'), (on) => {
		root.dataset.kb = on ? 'on' : 'off';
		measure();
	});
	const setEnv = NP.toggle(ctl('env'), (on) => {
		root.dataset.env = on ? 'on' : 'off';
	});
	const syncApp = () => {
		const app = root.dataset.ctx === 'app';
		ctl('bar').querySelectorAll('button').forEach((b) => (b.disabled = app));
		ctl('env').disabled = !app;
	};
	NP.seg(ctl('ctx'), (v) => {
		root.dataset.ctx = v;
		syncApp();
		measure();
	});
	NP.seg(ctl('bar'), (v) => {
		root.dataset.bar = v;
		measure();
	});
	NP.seg(ctl('cut'), (v) => {
		root.dataset.cut = v;
		measure();
	});
	NP.seg(ctl('type'), setType);

	// Il campo apre la tastiera disegnata, ma non su un telefono vero (ha già la sua); un tocco fuori la chiude; Esc pure.
	const coarse = matchMedia('(pointer: coarse)');
	field.addEventListener('focus', () => {
		if (!coarse.matches) setKb(true);
	});
	page.addEventListener('pointerdown', (e) => {
		if (!e.target.closest('[data-composer]') && root.dataset.kb === 'on') setKb(false);
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && root.dataset.kb === 'on') setKb(false);
	});
	root.querySelector('[data-composer]').addEventListener('submit', (e) => e.preventDefault());

	// Misura reale del browser in cui sta girando la pagina.
	const vv = window.visualViewport;
	const real = () => {
		const w = vv ? vv.width : innerWidth;
		const h = vv ? vv.height : innerHeight;
		vvOut.textContent = LabI18n.t('sc.real', 'Il tuo schermo ora: visualViewport {w} × {h} px', { w: Math.round(w), h: Math.round(h) });
	};
	if (vv) vv.addEventListener('resize', real);
	addEventListener('resize', () => {
		real();
		measure();
	});

	setEnv(true);
	syncApp();
	setType('text');
	real();
	// i font arrivano dopo il primo disegno: si rimisura quando il layout si assesta
	document.fonts && document.fonts.ready.then(measure);
})();
