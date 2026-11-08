// Motore dei comandi rapidi (palette ⌘K) (usato da entrambi i tab).
// PaletteComandi.create({ stage, trigger, items, onRun }) costruisce la <dialog> dentro il palco e la gestisce.
// items: [{ label, group, icon, kbd:['G','H'], seq:['g','h'], keywords, children:[…], run() }]
// Dialog NON modale (show), ancorata al palco: così si vede aperta nella miniatura e non ruba il focus al caricamento.
// Pattern ARIA: combobox sull'input + listbox; il focus resta nel campo, l'opzione attiva è aria-activedescendant.
(() => {
	const MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
	const MOD = MAC ? '⌘' : 'Ctrl';
	const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

	const svg = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
	const ICONS = {
		page: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
		mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
		download: svg('<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>'),
		sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/>'),
		moon: svg('<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'),
		user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
		calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4"/>'),
		tag: svg('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>'),
		check: svg('<path d="m5 12 5 5 9-10"/>'),
		undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
		chev: svg('<path d="m9 6 6 6-6 6"/>'),
	};

	// Ricerca: prima sottostringa (migliore), poi sottosequenza. Restituisce {score, idx} o null.
	function fuzzy(q, text) {
		const p = text.indexOf(q);
		if (p >= 0) {
			const idx = Array.from({ length: q.length }, (_, i) => p + i);
			return { score: 60 + (p === 0 ? 30 : text[p - 1] === ' ' ? 15 : 0) - p * 0.2, idx };
		}
		let ti = 0, prev = -2, score = 0;
		const idx = [];
		for (const ch of q) {
			const k = text.indexOf(ch, ti);
			if (k < 0) return null;
			score += (k === prev + 1 ? 3 : 1) + (k === 0 || text[k - 1] === ' ' ? 2 : 0);
			idx.push(k);
			prev = k;
			ti = k + 1;
		}
		return { score, idx };
	}

	function flat(items, out = []) {
		items.forEach((it) => { out.push(it); if (it.children) flat(it.children, out); });
		return out;
	}

	function create({ stage, trigger, items, onRun, placeholder }) {
		const uid = Math.random().toString(36).slice(2, 7);
		stage.insertAdjacentHTML(
			'beforeend',
			`<div class="pc-scrim" aria-hidden="true"></div>
			<dialog class="pc" aria-label="${LabI18n.t('pc.dialog', 'Comandi rapidi')}">
				<div class="pc__top">
					<span class="pc__crumbs"></span>
					<input class="pc__input" type="text" role="combobox" aria-expanded="true" aria-controls="pc-l-${uid}" aria-autocomplete="list" aria-label="${LabI18n.t('pc.search', 'Cerca un comando')}" autocomplete="off" spellcheck="false" enterkeyhint="go">
					<button type="button" class="pc__x" aria-label="${LabI18n.t('pc.close', 'Chiudi')}">esc</button>
				</div>
				<div class="pc__scroll"><div class="pc__hl" aria-hidden="true"></div><ul class="pc__list" id="pc-l-${uid}" role="listbox" aria-label="${LabI18n.t('pc.results', 'Comandi')}"></ul></div>
				<p class="pc__empty" hidden></p>
				<div class="pc__foot" aria-hidden="true">
					<span><kbd>↑</kbd><kbd>↓</kbd> ${LabI18n.t('pc.nav', 'naviga')}</span>
					<span><kbd>↵</kbd> ${LabI18n.t('pc.run', 'esegui')}</span>
					<span class="pc__back"><kbd>⌫</kbd> ${LabI18n.t('pc.back', 'indietro')}</span>
				</div>
				<p class="sr-only" aria-live="polite" data-live></p>
			</dialog>`
		);
		const dlg = stage.querySelector('.pc');
		const scrim = stage.querySelector('.pc-scrim');
		const input = dlg.querySelector('.pc__input');
		const list = dlg.querySelector('.pc__list');
		const hl = dlg.querySelector('.pc__hl');
		const scroller = dlg.querySelector('.pc__scroll');
		const crumbs = dlg.querySelector('.pc__crumbs');
		const empty = dlg.querySelector('.pc__empty');
		const live = dlg.querySelector('[data-live]');
		const defaultPh = placeholder || LabI18n.t('pc.ph', 'Scrivi un comando o cerca…');

		let stack = [{ label: '', items }];
		let rows = []; // {it, li}
		let active = 0;

		const kbdHtml = (it) => (it.kbd ? it.kbd.map((k) => `<kbd>${k}</kbd>`).join('') : '');

		function render() {
			const level = stack[stack.length - 1];
			const q = norm(input.value.trim());
			let entries = level.items.map((it) => {
				if (!q) return { it, idx: [], score: 0 };
				const m = fuzzy(q, norm(it.label));
				if (m) return { it, ...m };
				const k = it.keywords ? fuzzy(q, norm(it.keywords)) : null;
				return k ? { it, idx: [], score: k.score - 40 } : null;
			}).filter(Boolean);
			if (q) entries.sort((a, b) => b.score - a.score);

			list.textContent = '';
			rows = [];
			let group = null;
			entries.forEach((e, n) => {
				if (!q && e.it.group && e.it.group !== group) {
					group = e.it.group;
					const h = document.createElement('li');
					h.className = 'pc__group';
					h.setAttribute('role', 'presentation');
					h.textContent = group;
					list.append(h);
				}
				const li = document.createElement('li');
				li.className = 'pc__opt';
				li.id = `pc-o-${uid}-${n}`;
				li.setAttribute('role', 'option');
				li.setAttribute('aria-selected', 'false');
				let label = '';
				[...e.it.label].forEach((ch, i) => { label += e.idx.includes(i) ? `<mark>${ch}</mark>` : ch.replace('&', '&amp;').replace('<', '&lt;'); });
				li.innerHTML = `<span class="pc__ic" aria-hidden="true">${ICONS[e.it.icon] || ICONS.page}</span><span class="pc__label">${label}</span><span class="pc__kbd">${kbdHtml(e.it)}</span>${e.it.children ? `<span class="pc__more" aria-hidden="true">${ICONS.chev}</span>` : ''}`;
				li.addEventListener('pointermove', (ev) => { if (ev.pointerType === 'mouse' && active !== n) setActive(n); });
				li.addEventListener('click', () => choose(n));
				list.append(li);
				rows.push({ it: e.it, li });
			});

			crumbs.textContent = '';
			stack.slice(1).forEach((l) => {
				const c = document.createElement('span');
				c.textContent = l.label.replace(/…$/, '');
				crumbs.append(c);
			});
			dlg.classList.toggle('is-sub', stack.length > 1);
			input.placeholder = stack.length > 1 ? LabI18n.t('pc.phsub', 'Filtra…') : defaultPh;

			empty.hidden = rows.length > 0;
			if (!rows.length) empty.textContent = LabI18n.t('pc.empty', 'Nessun comando per «{q}»', { q: input.value.trim() });
			input.setAttribute('aria-expanded', rows.length ? 'true' : 'false');
			live.textContent = rows.length ? LabI18n.t('pc.count', '{n} comandi', { n: rows.length }) : empty.textContent;
			active = 0;
			setActive(0, { jump: true });
		}

		function setActive(n, { jump = false, scroll = false } = {}) {
			if (!rows.length) { hl.style.opacity = '0'; input.removeAttribute('aria-activedescendant'); return; }
			active = (n + rows.length) % rows.length;
			rows.forEach((r, i) => r.li.setAttribute('aria-selected', i === active ? 'true' : 'false'));
			const li = rows[active].li;
			input.setAttribute('aria-activedescendant', li.id);
			if (scroll) {
				const top = li.offsetTop, bottom = top + li.offsetHeight;
				if (active === 0) scroller.scrollTop = 0;
				else if (top - 4 < scroller.scrollTop) scroller.scrollTop = top - 4;
				else if (bottom + 4 > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = bottom + 4 - scroller.clientHeight;
			}
			if (jump) hl.classList.add('is-jump');
			hl.style.opacity = '1';
			hl.style.height = `${li.offsetHeight}px`;
			hl.style.transform = `translateY(${li.offsetTop}px)`;
			if (jump) { void hl.offsetWidth; hl.classList.remove('is-jump'); }
		}

		function choose(n) {
			const r = rows[n];
			if (!r) return;
			if (r.it.children) {
				stack.push({ label: r.it.label, items: r.it.children });
				input.value = '';
				render();
				return;
			}
			close();
			execute(r.it, stack.slice(1).map((l) => l.label));
		}
		function execute(it, trail) {
			it.run?.();
			onRun?.(it, trail);
		}

		function open({ focus = true } = {}) {
			stack = [{ label: '', items }];
			input.value = '';
			if (!dlg.open) dlg.show();
			stage.classList.add('is-open');
			trigger?.setAttribute('aria-expanded', 'true');
			render();
			if (focus) input.focus({ preventScroll: true });
		}
		function close({ restoreFocus = true } = {}) {
			if (!dlg.open) return;
			const had = dlg.contains(document.activeElement);
			dlg.close();
			stage.classList.remove('is-open');
			trigger?.setAttribute('aria-expanded', 'false');
			if (had && restoreFocus) trigger?.focus({ preventScroll: true });
		}

		input.addEventListener('input', render);
		dlg.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1, { scroll: true }); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1, { scroll: true }); }
			else if (e.key === 'Home' && !input.value) { e.preventDefault(); setActive(0, { scroll: true }); }
			else if (e.key === 'End' && !input.value) { e.preventDefault(); setActive(rows.length - 1, { scroll: true }); }
			else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
			else if (e.key === 'Escape') {
				e.preventDefault();
				if (stack.length > 1 && !input.value) { stack.pop(); render(); } else close();
			}
			else if (e.key === 'Backspace' && !input.value && stack.length > 1) { e.preventDefault(); stack.pop(); render(); }
			else if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
		});
		dlg.querySelector('.pc__x').addEventListener('click', () => close());
		scrim.addEventListener('click', () => close());
		trigger?.addEventListener('click', () => (dlg.open && stage.classList.contains('is-open') ? input.focus() : open()));

		// Scorciatoie globali: ⌘/Ctrl+K, «/», e sequenze a due tasti (g poi h) a palette chiusa.
		const seqCmds = flat(items).filter((c) => c.seq);
		let pending = null;
		document.addEventListener('keydown', (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				if (dlg.open && document.activeElement === input) close(); else open();
				return;
			}
			if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
			if (dlg.open && dlg.contains(document.activeElement)) return;
			const el = e.target;
			if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
			const k = e.key.toLowerCase();
			if (k === '/') { e.preventDefault(); open(); return; }
			if (pending) {
				const first = pending.key;
				clearTimeout(pending.timer);
				pending = null;
				const hit = seqCmds.find((c) => c.seq[0] === first && c.seq[1] === k);
				if (hit) { e.preventDefault(); close({ restoreFocus: false }); execute(hit, []); return; }
			}
			if (seqCmds.some((c) => c.seq[0] === k)) {
				pending = { key: k, timer: setTimeout(() => (pending = null), 1100) };
			}
		});

		open({ focus: false });
		return { open, close, dialog: dlg };
	}

	window.PaletteComandi = { create, MOD, MODK: MAC ? '⌘K' : 'Ctrl K' };
})();
