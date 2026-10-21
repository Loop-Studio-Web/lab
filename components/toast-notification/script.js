// Toast: una funzione showToast() e basta, niente stato globale oltre alla
// regione che li contiene. Le icone sono Lucide (ISC) inline.
const ICONS = {
	success: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
	error: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
	info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
	warning:
		'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
};
const CLOSE = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';

const MAX_VISIBLE = 3;
const region = document.getElementById('toast-region');

const svg = (paths, cls) =>
	`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

function dismiss(toast) {
	if (toast.dataset.leaving) return;
	toast.dataset.leaving = 'true';
	const remove = () => toast.remove();
	toast.addEventListener('transitionend', remove, { once: true });
	setTimeout(remove, 400); // rete di sicurezza se transitionend non parte
}

function showToast({ type = 'info', title, text = '', duration = 5000, action, into = region } = {}) {
	// Oltre il limite, il più vecchio se ne va per far posto al nuovo.
	if (into === region) {
		const live = [...region.children].filter((t) => !t.dataset.leaving);
		if (live.length >= MAX_VISIBLE) dismiss(live[0]);
	}

	const toast = document.createElement('div');
	toast.className = `toast toast--${type in ICONS ? type : 'neutral'}`;
	toast.innerHTML = `
		${svg(ICONS[type] ?? ICONS.info, 'toast__icon')}
		<div class="toast__body">
			<p class="toast__title"></p>
			${text ? '<p class="toast__text"></p>' : ''}
		</div>
		<div class="toast__actions">
			${action ? '<button type="button" class="toast__btn toast__undo"></button>' : ''}
			<button type="button" class="toast__btn toast__close" aria-label="Chiudi notifica">${svg(CLOSE, '')}</button>
		</div>
		${duration ? '<span class="toast__bar"></span>' : ''}`;
	toast.querySelector('.toast__title').textContent = title;
	if (text) toast.querySelector('.toast__text').textContent = text;
	if (action) {
		const undo = toast.querySelector('.toast__undo');
		undo.textContent = action.label;
		undo.addEventListener('click', () => {
			action.onClick?.();
			dismiss(toast);
		});
	}
	toast.querySelector('.toast__close').addEventListener('click', () => dismiss(toast));

	if (duration) {
		// Il tempo lo conta un timer (la barra è solo un indicatore: con
		// movimento ridotto si nasconde e il toast scade comunque).
		toast.style.setProperty('--duration', `${duration}ms`);
		let remaining = duration;
		let startedAt = performance.now();
		let timer = setTimeout(() => dismiss(toast), remaining);
		const pause = (on) => {
			toast.toggleAttribute('data-paused', on);
			if (on) {
				clearTimeout(timer);
				remaining -= performance.now() - startedAt;
			} else {
				startedAt = performance.now();
				timer = setTimeout(() => dismiss(toast), remaining);
			}
		};
		// In pausa con puntatore o focus dentro il toast (un solo motivo alla volta).
		let holds = 0;
		const hold = (delta) => {
			const was = holds > 0;
			holds = Math.max(0, holds + delta);
			if (was !== holds > 0) pause(holds > 0);
		};
		toast.addEventListener('pointerenter', () => hold(1));
		toast.addEventListener('pointerleave', () => hold(-1));
		toast.addEventListener('focusin', () => hold(1));
		toast.addEventListener('focusout', () => hold(-1));
	}
	into.append(toast);
}

const PRESETS = {
	success: () => showToast({ type: 'success', title: 'Salvato', text: 'Le modifiche sono state pubblicate.' }),
	error: () => showToast({ type: 'error', title: 'Non è andata', text: 'Il server non risponde. Riprova tra poco.' }),
	info: () => showToast({ type: 'info', title: 'Nuova versione', text: 'Ricarica la pagina per aggiornare.' }),
	warning: () => showToast({ type: 'warning', title: 'Spazio quasi finito', text: 'Resta il 10% dell’archivio.' }),
	action: () =>
		showToast({
			type: 'neutral',
			title: 'Messaggio archiviato',
			duration: 8000,
			action: { label: 'Annulla', onClick: () => showToast({ type: 'success', title: 'Ripristinato' }) },
		}),
	sticky: () =>
		showToast({ type: 'info', title: 'Sincronizzazione in corso', text: 'Questo non scompare da solo.', duration: 0 }),
};

document.querySelectorAll('[data-toast]').forEach((btn) => {
	btn.addEventListener('click', () => PRESETS[btn.dataset.toast]?.());
});

// Esempi fermi in cima alla pagina (non scadono e non compaiono come popup):
// mostrano l'aspetto dei toast anche nella miniatura del sito, dove nessuno clicca.
const samples = document.querySelector('[data-samples]');
[
	{ type: 'success', title: 'Salvato', text: 'Le modifiche sono state pubblicate.' },
	{ type: 'error', title: 'Non è andata', text: 'Il server non risponde. Riprova tra poco.' },
	{ type: 'warning', title: 'Spazio quasi finito', text: 'Resta il 10% dell’archivio.' },
].forEach((s) => showToast({ ...s, duration: 0, into: samples }));
