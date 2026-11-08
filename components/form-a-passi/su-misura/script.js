// Tab «Su misura»: i blocchi si aprono in base alle risposte; i campi dei blocchi chiusi sono disattivati (non bloccano l'invio).
(() => {
	window.LabI18n?.apply();
	const { check, checkAll, live, minDate } = FP;
	const lang = window.LabI18n?.lang || document.documentElement.lang || 'it';
	const $ = (s, r = document) => r.querySelector(s);
	const root = $('[data-stage]');
	const form = $('[data-form]', root);
	const blocks = [...form.querySelectorAll('[data-block]')]; // in ordine di documento: i genitori prima dei figli
	const meter = $('[data-meter]', root);
	const done = $('[data-done]', root);
	const al = [...form.querySelectorAll('[name="al"]')];
	const msg = form.elements.msg;
	const cnt = $('[data-cnt]', root);
	const drop = $('[data-drop]', root);
	const file = form.elements.img;
	const fileRow = $('[data-file]', root);
	const upErr = $('#e-s-up', root);
	let objUrl = '';
	const MAX_BYTES = 1024 * 1024;
	const TYPES = ['image/png', 'image/jpeg', 'image/webp'];

	form.elements.when.min = minDate(2);

	// Quanti campi (nomi distinti) sono attivi in questo momento
	const countFields = (onlyActive) => new Set([...form.elements].filter((c) => c.name && c.type !== 'submit' && (!onlyActive || !c.disabled)).map((c) => c.name)).size;
	const total = countFields(false);
	const updateMeter = () => (meter.textContent = LabI18n.t('sm.meter', '{n} campi su {max}', { n: countFields(true), max: total }));

	const syncAl = () => {
		const open = !al[0].disabled;
		al[0].dataset.msg = LabI18n.t('sm.err.al', 'Scegli almeno una voce');
		al[0].setCustomValidity(open && !al.some((c) => c.checked) ? 'x' : '');
	};

	// Apre/chiude i blocchi: aperto = il suo interruttore è spuntato e attivo (cioè anche il blocco che lo contiene è aperto).
	const sync = () => {
		blocks.forEach((b) => {
			const ctrl = form.querySelector(`[data-opens="${b.dataset.block}"]`);
			const open = ctrl.checked && !ctrl.disabled;
			b.classList.toggle('is-open', open);
			b.inert = !open;
			b.querySelectorAll('input, textarea, select').forEach((c) => {
				c.disabled = !open;
				if (!open) c.removeAttribute('aria-invalid');
			});
			if (!open) b.querySelectorAll('.fp-err').forEach((e) => ((e.textContent = ''), (e.hidden = true)));
		});
		// Un solo passaggio basta: un blocco genitore riattiva anche i campi dei figli, ma i figli vengono valutati dopo di lui e si richiudono se serve.
		syncAl();
		updateMeter();
	};

	// ——— Immagine ———
	const showUpErr = (text) => {
		upErr.textContent = text;
		upErr.hidden = !text;
		file.setAttribute('aria-invalid', text ? 'true' : 'false');
		if (text) file.setAttribute('aria-describedby', 's-up-h e-s-up');
	};
	const clearFile = () => {
		if (objUrl) URL.revokeObjectURL(objUrl);
		objUrl = '';
		file.value = '';
		fileRow.hidden = true;
		drop.hidden = false;
	};
	const takeFile = (f) => {
		showUpErr('');
		if (!f) return;
		if (!TYPES.includes(f.type)) return showUpErr(LabI18n.t('sm.err.type', 'Il file deve essere PNG, JPG o WebP')), (file.value = '');
		if (f.size > MAX_BYTES) return showUpErr(LabI18n.t('sm.err.size', 'Il file supera 1 MB')), (file.value = '');
		if (objUrl) URL.revokeObjectURL(objUrl);
		objUrl = URL.createObjectURL(f);
		$('[data-thumb]', root).src = objUrl;
		$('[data-fname]', root).textContent = `${f.name} · ${Math.max(1, Math.round(f.size / 1024))} KB`;
		fileRow.hidden = false;
		drop.hidden = true;
	};
	file.addEventListener('change', () => takeFile(file.files[0]));
	['dragenter', 'dragover'].forEach((ev) =>
		drop.addEventListener(ev, (e) => {
			e.preventDefault();
			drop.classList.add('is-over');
		}),
	);
	['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('is-over')));
	drop.addEventListener('drop', (e) => {
		e.preventDefault();
		const f = e.dataTransfer?.files?.[0];
		if (!f) return;
		try {
			const dt = new DataTransfer();
			dt.items.add(f);
			file.files = dt.files; // così il file sta anche nel campo vero del modulo
		} catch {}
		takeFile(f);
	});
	$('[data-rm]', root).addEventListener('click', () => {
		clearFile();
		showUpErr('');
		file.focus();
	});

	// ——— Riepilogo ———
	const fmtDate = (iso) => {
		const d = new Date(`${iso}T12:00`);
		return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
	};
	const row = (k, v) => {
		const r = document.createElement('div');
		const dt = document.createElement('dt');
		dt.textContent = k;
		const dd = document.createElement('dd');
		dd.textContent = v;
		r.append(dt, dd);
		return r;
	};
	const submit = () => {
		const fd = form.elements;
		const rows = [];
		rows.push(
			fd.who.value === 'gift'
				? row(LabI18n.t('sm.sum.who', 'Per'), LabI18n.t('sm.sum.gift', 'Regalo per {to}, dal {date}', { to: fd.to.value.trim(), date: fmtDate(fd.when.value) }) + (fd.hide.checked ? ` · ${LabI18n.t('sm.sum.nopr', 'senza prezzo')}` : ''))
				: row(LabI18n.t('sm.sum.who', 'Per'), LabI18n.t('sm.sum.me', 'Per me')),
		);
		if (fd.card.value === 'yes') rows.push(row(LabI18n.t('sm.sum.card', 'Biglietto'), `«${msg.value.trim()}»${file.files[0] ? ` + ${file.files[0].name}` : ''}`));
		if (fd.all.value === 'yes') {
			const names = al.filter((c) => c.checked).map((c) => (c.value === 'other' ? fd.other.value.trim() : c.nextElementSibling.textContent));
			rows.push(row(LabI18n.t('sm.sum.al', 'Allergie'), names.join(', ')));
		}
		rows.push(row(LabI18n.t('sm.sum.email', 'Email'), fd.email.value.trim()));
		$('[data-sum]', done).replaceChildren(...rows);
		$('[data-done-h]', done).textContent = LabI18n.t('sm.done.h', 'Richiesta pronta');
		const used = countFields(true);
		$('[data-done-p]', done).textContent =
			used < total
				? LabI18n.t('sm.done.p', 'Hai compilato {n} campi su {max}: gli altri non servivano. È solo un esempio: non è partito niente.', { n: used, max: total })
				: LabI18n.t('sm.done.all', 'Hai usato tutti i {max} campi possibili. È solo un esempio: non è partito niente.', { max: total });
		form.hidden = true;
		done.hidden = false;
		$('[data-done-h]', done).focus();
	};
	const reset = () => {
		clearFile();
		form.reset();
		form.querySelectorAll('.fp-err').forEach((e) => ((e.textContent = ''), (e.hidden = true)));
		form.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
		cnt.textContent = `0/${msg.maxLength}`;
		sync();
		done.hidden = true;
		form.hidden = false;
	};

	form.addEventListener('change', (e) => {
		sync();
		if (e.target.name === 'al') check(al[0]);
	});
	msg.addEventListener('input', () => (cnt.textContent = `${msg.value.length}/${msg.maxLength}`));
	live(form);
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		syncAl();
		if (!checkAll(form)) return;
		submit();
	});
	$('[data-again]', root).addEventListener('click', reset);

	sync();
})();
