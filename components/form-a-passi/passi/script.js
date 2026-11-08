// Tab «Passi»: 4 passi con validazione nativa, scontrino che si compila, bozza in localStorage.
(() => {
	window.LabI18n?.apply(); // i testi letti dal DOM (nomi dei box e dei gusti) devono essere già tradotti
	const { store, check, checkAll, live, slide, minDate, euro } = FP;
	const lang = window.LabI18n?.lang || document.documentElement.lang || 'it';
	const KEY = 'fp-passi-draft';
	const PRICE = { 6: 11, 12: 19, 24: 34 };
	const EXTRA = { pistacchio: 2 };
	const SHIP = 4;
	const MAXF = 3;

	const $ = (s, r = document) => r.querySelector(s);
	const root = $('[data-stage]');
	const form = $('[data-form]', root);
	const steps = [...form.querySelectorAll('[data-step]')];
	const last = steps.length - 1;
	const rail = $('[data-rail]', root);
	const railBtns = [...rail.querySelectorAll('[data-goto]')];
	const backBtn = $('[data-back]', root);
	const nextBtn = $('[data-next]', root);
	const nav = $('[data-nav]', root);
	const saved = $('[data-saved]', root);
	const draftBox = $('[data-draft]', root);
	const done = $('[data-done]', root);
	const sumEl = $('[data-sum]', root);
	const countEl = $('[data-count]', root);
	const linesEl = $('[data-lines]', root);
	const emptyEl = $('[data-empty]', root);
	const totalEl = $('[data-total]', root);
	const flavs = [...form.querySelectorAll('[name="flav"]')];
	const f = { name: form.elements.name, email: form.elements.email, cap: form.elements.cap, date: form.elements.date, ok: form.elements.ok };
	let step = 0;
	let reached = 0;
	let busy = false;

	// Prezzi, data minima e messaggi che dipendono dalla lingua
	root.querySelectorAll('[data-price]').forEach((i) => (i.textContent = euro(PRICE[i.dataset.price])));
	f.date.min = minDate(2);
	form.querySelectorAll('[name="size"]').forEach((r) => (r.dataset.reqMsg = LabI18n.t('passi.err.size', 'Scegli un box')));
	f.cap.dataset.patternMsg = LabI18n.t('passi.err.cap', 'Il CAP ha 5 cifre');
	f.ok.dataset.reqMsg = LabI18n.t('passi.err.ok', 'Conferma per inviare l’ordine');

	// ——— Lettura dei dati ———
	const sizeEl = () => form.querySelector('[name="size"]:checked');
	const sizeVal = () => sizeEl()?.value || '';
	const sizeName = () => sizeEl()?.nextElementSibling.querySelector('b').textContent || '';
	const flavLabel = (cb) => {
		const sp = cb.nextElementSibling;
		return (sp.querySelector('[data-i18n]') || sp).textContent.trim();
	};
	const flavList = () => flavs.filter((c) => c.checked).map((c) => ({ value: c.value, label: flavLabel(c) }));
	const fmtDate = (iso) => {
		const d = new Date(`${iso}T12:00`);
		return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
	};
	const pcs = () => LabI18n.t('passi.pcs', 'biscotti');

	// ——— Scontrino ———
	const lines = () => {
		const out = [];
		const size = sizeVal();
		const fl = flavList();
		if (size) out.push({ key: 'size', label: LabI18n.t('passi.r.box', 'Box {name}', { name: sizeName() }), sub: `${size} ${pcs()}`, price: PRICE[size] });
		fl.forEach((x) => EXTRA[x.value] && out.push({ key: `x-${x.value}`, label: LabI18n.t('passi.r.extra', '{f}, supplemento', { f: x.label }), price: EXTRA[x.value] }));
		if (fl.length) out.push({ key: 'flav', label: LabI18n.t('passi.r.flav', 'Gusti'), sub: fl.map((x) => x.label).join(', ') });
		if (size) out.push({ key: 'ship', label: LabI18n.t('passi.r.ship', 'Spedizione'), price: size === '24' ? 0 : SHIP });
		if (f.date.value && fmtDate(f.date.value)) out.push({ key: 'date', label: LabI18n.t('passi.r.date', 'Consegna dal'), sub: fmtDate(f.date.value) });
		return out;
	};
	const rows = new Map();
	const renderReceipt = () => {
		const L = lines();
		const keep = new Set(L.map((l) => l.key));
		rows.forEach((li, k) => {
			if (!keep.has(k)) {
				li.remove();
				rows.delete(k);
			}
		});
		L.forEach((l, i) => {
			let li = rows.get(l.key);
			if (!li) rows.set(l.key, (li = document.createElement('li')));
			const left = document.createElement('span');
			left.append(l.label);
			if (l.sub) {
				const s = document.createElement('small');
				s.textContent = l.sub;
				left.append(s);
			}
			const parts = [left];
			if (l.price !== undefined) {
				const b = document.createElement('b');
				b.textContent = l.price === 0 ? LabI18n.t('passi.free', 'gratis') : euro(l.price);
				parts.push(b);
			}
			li.replaceChildren(...parts);
			if (linesEl.children[i] !== li) linesEl.insertBefore(li, linesEl.children[i] || null); // non si rimuove un nodo già al suo posto: ripartirebbe l'entrata
		});
		emptyEl.hidden = L.length > 0;
		totalEl.textContent = euro(L.reduce((n, l) => n + (l.price || 0), 0));
	};

	// ——— Passi ———
	const updateUI = () => {
		rail.style.setProperty('--p', step / last);
		railBtns.forEach((b, i) => {
			const li = b.closest('li');
			b.disabled = i > reached;
			if (i === step) b.setAttribute('aria-current', 'step');
			else b.removeAttribute('aria-current');
			li.classList.toggle('is-done', i < step);
			b.firstElementChild.textContent = i < step ? '✓' : String(i + 1);
		});
		backBtn.hidden = step === 0;
		nextBtn.textContent = step === last ? LabI18n.t('passi.send', 'Invia ordine') : LabI18n.t('passi.next', 'Avanti');
	};
	const show = (i) => {
		steps.forEach((s, k) => (s.hidden = k !== i));
		step = i;
		reached = Math.max(reached, i);
		if (i === last) buildSummary();
		updateUI();
	};
	const go = async (to, focus = true) => {
		if (busy || to === step) return;
		busy = true;
		const dir = to > step ? 1 : -1;
		await slide(steps[step], dir, true);
		show(to);
		slide(steps[step], dir, false);
		if (focus) steps[step].querySelector('legend').focus({ preventScroll: true });
		save();
		busy = false;
	};
	const syncFlav = () => {
		const n = flavList().length;
		flavs[0].dataset.msg = LabI18n.t('passi.err.flav', 'Scegli almeno un gusto');
		flavs[0].setCustomValidity(n ? '' : 'x');
		flavs.forEach((c) => (c.disabled = !c.checked && n >= MAXF));
		countEl.textContent = LabI18n.t('passi.count', 'Scelti {n} di {max}', { n, max: MAXF });
	};
	const validStep = (i) => {
		if (i === 1) syncFlav();
		return checkAll(steps[i]);
	};
	const next = () => {
		if (busy) return;
		if (!validStep(step)) return;
		if (step < last) return go(step + 1);
		for (let i = 0; i < last; i += 1) if (!validStep(i)) return go(i); // dopo una bozza ripresa, un passo precedente può essere incompleto
		submit();
	};

	// ——— Riepilogo e invio ———
	function buildSummary() {
		const fl = flavList();
		const data = [
			[LabI18n.t('passi.sum.box', 'Box'), `${sizeName()} · ${sizeVal()} ${pcs()}`, 0],
			[LabI18n.t('passi.sum.flav', 'Gusti'), fl.map((x) => x.label).join(', '), 1],
			[LabI18n.t('passi.sum.who', 'Per'), `${f.name.value} · ${f.email.value}`, 2],
			[LabI18n.t('passi.sum.where', 'Dove'), `${f.cap.value} · ${fmtDate(f.date.value)}`, 2],
		];
		const els = data.map(([k, v, to]) => {
			const row = document.createElement('div');
			const dt = document.createElement('dt');
			dt.textContent = k;
			const dd = document.createElement('dd');
			const val = document.createElement('span');
			val.textContent = v;
			const edit = document.createElement('button');
			edit.type = 'button';
			edit.className = 'fp-link';
			edit.textContent = LabI18n.t('passi.edit', 'Modifica');
			edit.setAttribute('aria-label', `${LabI18n.t('passi.edit', 'Modifica')}: ${k}`);
			edit.addEventListener('click', () => go(to));
			dd.append(val, edit);
			row.append(dt, dd);
			return row;
		});
		const tot = document.createElement('div');
		const tdt = document.createElement('dt');
		tdt.textContent = LabI18n.t('passi.total', 'Totale');
		const tdd = document.createElement('dd');
		tdd.textContent = totalEl.textContent;
		tot.append(tdt, tdd);
		sumEl.replaceChildren(...els, tot);
	}
	function submit() {
		const n = String(1000 + Math.floor(Math.random() * 9000));
		const first = f.name.value.trim().split(/\s+/)[0];
		$('[data-done-h]', done).textContent = LabI18n.t('passi.done.h', 'Grazie, {name}!', { name: first });
		$('[data-done-p]', done).textContent = LabI18n.t('passi.done.p', 'Ordine n° {n}, {tot}. È solo un esempio: non è partito niente.', { n, tot: totalEl.textContent });
		store.del(KEY);
		saved.textContent = '';
		[rail, form, nav].forEach((x) => (x.hidden = true));
		done.hidden = false;
		$('[data-done-h]', done).focus();
	}
	function reset() {
		form.reset();
		form.querySelectorAll('.fp-err').forEach((e) => ((e.textContent = ''), (e.hidden = true)));
		form.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
		syncFlav();
		countEl.textContent = '';
		reached = 0;
		show(0);
		done.hidden = true;
		[rail, form, nav].forEach((x) => (x.hidden = false));
		renderReceipt();
		store.del(KEY);
		saved.textContent = '';
		hideDraft();
		steps[0].querySelector('legend').focus({ preventScroll: true });
	}

	// ——— Bozza ———
	const snap = () => ({ size: sizeVal(), flav: flavList().map((x) => x.value), name: f.name.value, email: f.email.value, cap: f.cap.value, date: f.date.value, step });
	const isEmpty = (d) => !d.size && !d.flav.length && !d.name && !d.email && !d.cap && !d.date;
	function save() {
		const d = snap();
		if (isEmpty(d)) {
			store.del(KEY);
			saved.textContent = '';
			return;
		}
		store.set(KEY, d);
		saved.textContent = LabI18n.t('passi.saved', 'Bozza salvata alle {h}', { h: new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) });
	}
	function hideDraft() {
		draftBox.hidden = true;
	}
	const resume = () => {
		const d = store.get(KEY);
		if (!d) return hideDraft();
		form.querySelectorAll('[name="size"]').forEach((r) => (r.checked = r.value === d.size));
		flavs.forEach((c) => (c.checked = (d.flav || []).includes(c.value)));
		['name', 'email', 'cap', 'date'].forEach((k) => (f[k].value = d[k] || ''));
		syncFlav();
		renderReceipt();
		reached = Math.max(0, Math.min(d.step || 0, last));
		show(reached);
		steps[step].querySelector('legend').focus({ preventScroll: true });
		hideDraft();
	};

	// ——— Eventi ———
	form.addEventListener('change', (e) => {
		if (e.target.name === 'flav') syncFlav();
		renderReceipt();
		save();
		hideDraft();
	});
	form.addEventListener('input', (e) => {
		if (e.target === f.cap) f.cap.value = f.cap.value.replace(/\D/g, '');
		renderReceipt();
		save();
		hideDraft();
	});
	live(form);
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		next();
	});
	form.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
			e.preventDefault();
			next();
		}
	});
	nextBtn.addEventListener('click', next);
	backBtn.addEventListener('click', () => go(step - 1));
	railBtns.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.goto))));
	$('[data-resume]', root).addEventListener('click', resume);
	$('[data-discard]', root).addEventListener('click', () => {
		store.del(KEY);
		hideDraft();
	});
	$('[data-again]', root).addEventListener('click', reset);

	syncFlav();
	countEl.textContent = '';
	renderReceipt();
	updateUI();
	const old = store.get(KEY);
	if (old && !isEmpty(old)) draftBox.hidden = false;
})();
