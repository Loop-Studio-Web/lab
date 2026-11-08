// Tab «Una domanda alla volta»: una sezione per volta, Invio avanza, lettere A-D sulle scelte, Alt+↑ indietro.
(() => {
	window.LabI18n?.apply();
	const { check, checkAll, live, slide, minDate } = FP;
	const lang = window.LabI18n?.lang || document.documentElement.lang || 'it';
	const $ = (s, r = document) => r.querySelector(s);
	const root = $('[data-stage]');
	const form = $('[data-form]', root);
	const qs = [...form.querySelectorAll('[data-q]')];
	const last = qs.length - 1; // l'ultima è il riepilogo
	const backBtn = $('[data-back]', root);
	const nextBtn = $('[data-next]', root);
	const nextT = $('[data-next-t]', root);
	const keys = $('[data-keys]', root);
	const foot = $('[data-foot]', root);
	const done = $('[data-done]', root);
	const countEl = $('[data-count]', root);
	const bar = $('[data-bar]', root);
	const sumEl = $('[data-sum]', root);
	const qty = form.elements.qty;
	const dateEl = form.elements.date;
	let idx = 0;
	let busy = false;
	let autoTimer = 0;

	dateEl.min = minDate(1);
	form.querySelectorAll('[name="occ"]').forEach((r) => (r.dataset.reqMsg = LabI18n.t('dom.err.occ', 'Scegli un’occasione')));
	const clampQty = () => {
		const n = Math.max(1, Math.min(60, Math.round(Number(qty.value) || 1)));
		qty.value = String(n);
	};
	$('[data-dec]', root).addEventListener('click', () => {
		qty.value = String((Number(qty.value) || 1) - 1);
		clampQty();
		check(qty);
	});
	$('[data-inc]', root).addEventListener('click', () => {
		qty.value = String((Number(qty.value) || 0) + 1);
		clampQty();
		check(qty);
	});

	const ui = () => {
		countEl.textContent = LabI18n.t('dom.counter', '{n} / {tot}', { n: idx + 1, tot: qs.length });
		const p = idx / last;
		bar.style.setProperty('--p', p);
		bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
		backBtn.hidden = idx === 0;
		const isLast = idx === last;
		nextT.textContent = isLast ? LabI18n.t('dom.send', 'Invia') : LabI18n.t('dom.ok', 'OK');
		keys.hidden = isLast || !!form.querySelector('[data-q]:not([hidden]) [name="occ"]');
	};
	const focusIn = (q) => {
		const h = q.querySelector('h2');
		if (h) return h.focus({ preventScroll: true });
		const c = q.querySelector('input:not([type="radio"])') || q.querySelector('input');
		c?.focus({ preventScroll: true });
		if (c?.type === 'number') c.select();
	};
	const buildSummary = () => {
		const occ = form.querySelector('[name="occ"]:checked');
		const rows = [
			[LabI18n.t('dom.sum.name', 'Nome'), form.elements.name.value.trim()],
			[LabI18n.t('dom.sum.occ', 'Occasione'), occ ? occ.parentElement.querySelector('span').textContent : ''],
			[LabI18n.t('dom.sum.qty', 'Biscotti'), qty.value],
			[LabI18n.t('dom.sum.date', 'Per il'), fmtDate(dateEl.value)],
			[LabI18n.t('dom.sum.email', 'Email'), form.elements.email.value.trim()],
		];
		sumEl.replaceChildren(
			...rows.map(([k, v]) => {
				const row = document.createElement('div');
				const dt = document.createElement('dt');
				dt.textContent = k;
				const dd = document.createElement('dd');
				dd.textContent = v;
				row.append(dt, dd);
				return row;
			}),
		);
	};
	const fmtDate = (iso) => {
		const d = new Date(`${iso}T12:00`);
		return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
	};

	const go = async (to) => {
		if (busy || to === idx || to < 0 || to > last) return;
		busy = true;
		clearTimeout(autoTimer);
		const dir = to > idx ? 1 : -1; // avanti: la domanda esce in su e la nuova sale da sotto
		await slide(qs[idx], dir, true, 'y');
		qs[idx].hidden = true;
		idx = to;
		qs[idx].hidden = false;
		if (idx === last) buildSummary();
		ui();
		slide(qs[idx], dir, false, 'y');
		focusIn(qs[idx]);
		busy = false;
	};
	const next = () => {
		if (busy) return;
		if (idx < last) {
			if (idx === 2) clampQty();
			if (!checkAll(qs[idx])) return;
			return go(idx + 1);
		}
		for (let i = 0; i < last; i += 1) if (!checkAll(qs[i])) return go(i);
		submit();
	};
	const submit = () => {
		$('[data-done-h]', done).textContent = LabI18n.t('dom.done.h', 'Grazie, {name}!', { name: form.elements.name.value.trim().split(/\s+/)[0] });
		$('[data-done-p]', done).textContent = LabI18n.t('dom.done.p', 'Ti rispondiamo a {email} entro un giorno. È solo un esempio: non è partito niente.', { email: form.elements.email.value.trim() });
		root.querySelector('.dq-top').hidden = true;
		form.hidden = true;
		foot.hidden = true;
		done.hidden = false;
		$('[data-done-h]', done).focus();
	};
	const reset = () => {
		form.reset();
		form.querySelectorAll('.fp-err').forEach((e) => ((e.textContent = ''), (e.hidden = true)));
		form.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
		qs.forEach((q, i) => (q.hidden = i !== 0));
		idx = 0;
		root.querySelector('.dq-top').hidden = false;
		form.hidden = false;
		foot.hidden = false;
		done.hidden = true;
		ui();
		focusIn(qs[0]);
	};

	live(form);
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		next();
	});
	form.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio') {
			e.preventDefault();
			next();
		}
	});
	// Scelta: un clic (o una lettera) basta, si va avanti dopo un attimo per far vedere cosa si è scelto.
	form.addEventListener('change', (e) => {
		if (e.target.name !== 'occ') return;
		clearTimeout(autoTimer);
		autoTimer = setTimeout(next, FP.reduce() ? 0 : 320);
	});
	document.addEventListener('keydown', (e) => {
		if (e.ctrlKey || e.metaKey || done.hidden === false) return;
		if (e.altKey && e.key === 'ArrowUp') {
			e.preventDefault();
			return go(idx - 1);
		}
		const typing = e.target.matches?.('input:not([type="radio"]), textarea, select');
		if (!e.altKey && !typing && form.querySelector('[data-q]:not([hidden]) [name="occ"]')) {
			const radio = form.querySelector(`[name="occ"][value="${e.key.toLowerCase()}"]`);
			if (radio) {
				e.preventDefault();
				radio.checked = true;
				radio.focus({ preventScroll: true });
				radio.dispatchEvent(new Event('change', { bubbles: true }));
			}
		}
	});
	nextBtn.addEventListener('click', next);
	backBtn.addEventListener('click', () => go(idx - 1));
	$('[data-again]', root).addEventListener('click', reset);

	ui();
	// Niente fuoco automatico all'apertura: dentro il guscio a tab scrollerebbe la pagina e aprirebbe la tastiera sul telefono.
})();
