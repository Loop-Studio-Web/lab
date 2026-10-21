// Copia negli appunti: clipboard API, poi execCommand, poi selezione a mano.
const ICONS =
	'<span class="copy__icons" aria-hidden="true">' +
	'<svg class="copy__icon copy__icon--copy" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>' +
	'<svg class="copy__icon copy__icon--done" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>' +
	'</span>';

const status = document.querySelector('[data-copy-status]');

async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Senza permesso (iframe di un altro sito): la vecchia strada, da dentro un gesto dell'utente.
		const active = document.activeElement;
		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
		document.body.append(area);
		area.select();
		let ok = false;
		try {
			ok = document.execCommand('copy');
		} catch {}
		area.remove();
		active?.focus?.({ preventScroll: true });
		return ok;
	}
}

const sourceOf = (btn) => {
	const target = btn.dataset.copyTarget && document.querySelector(btn.dataset.copyTarget);
	const text = target ? ('value' in target ? target.value : target.textContent) : btn.dataset.copy;
	return { target, text: text.trim() };
};

document.querySelectorAll('[data-copy], [data-copy-target]').forEach((btn) => {
	const label = btn.querySelector('.copy__label');
	const tip = btn.querySelector('.copy__tip');
	const original = {
		label: label?.textContent,
		aria: btn.getAttribute('aria-label'),
	};
	btn.insertAdjacentHTML('afterbegin', ICONS);
	let timer;

	const setState = (state, message) => {
		clearTimeout(timer);
		if (state === 'idle') delete btn.dataset.state;
		else btn.dataset.state = state;
		if (label) label.textContent = state === 'copied' ? btn.dataset.done : state === 'failed' ? 'Copia a mano' : original.label;
		if (tip) tip.textContent = state === 'failed' ? 'Copia a mano' : btn.dataset.done;
		if (state === 'idle') {
			if (original.aria) btn.setAttribute('aria-label', original.aria);
			return;
		}
		status.textContent = message;
		timer = setTimeout(() => setState('idle'), 2000);
	};

	btn.addEventListener('click', async () => {
		const { target, text } = sourceOf(btn);
		if (await copyText(text)) {
			setState('copied', `${btn.dataset.done}: ${text} negli appunti`);
		} else {
			// Ultima risorsa: seleziona il testo, ci pensa l'utente con Ctrl+C.
			if (target && 'select' in target) target.select();
			else if (target) getSelection().selectAllChildren(target);
			setState('failed', 'Non è stato possibile copiare: il testo è selezionato, premi Ctrl+C');
		}
	});
});

// Campo del link: un clic seleziona tutto, comodo anche senza il pulsante.
document.querySelectorAll('.share__input').forEach((input) => input.addEventListener('focus', () => input.select()));
