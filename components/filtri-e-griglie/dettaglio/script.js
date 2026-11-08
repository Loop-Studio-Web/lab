// Dettaglio: la foto della scheda diventa la foto del <dialog> (View Transition con lo stesso nome sui due elementi) e, chiudendo,
// torna alla scheda. Senza View Transitions il <dialog> si apre lo stesso. Il focus torna alla scheda che ha aperto.
(() => {
	const { ITEMS, CATS, card, eur, day, reduce } = window.FG;
	const root = document.querySelector('[data-fg]');
	const grid = root.querySelector('[data-grid]');
	const dlg = document.querySelector('[data-dlg]');
	const dimg = dlg.querySelector('[data-dimg]');
	let from = null; // la scheda aperta

	ITEMS.forEach((it) => grid.append(card(it, true)));

	const fill = (it) => {
		dimg.src = '../../_shared/img/' + it.img + '.webp';
		dimg.style.objectPosition = it.pos;
		dlg.querySelector('[data-dname]').textContent = it.name;
		dlg.querySelector('[data-dtext]').textContent = it.text;
		const m = dlg.querySelector('[data-dmeta]');
		m.replaceChildren();
		[CATS[it.cat], eur.format(it.price), day.format(new Date(it.date))].forEach((s, i) => {
			const e = document.createElement(i === 1 ? 'b' : 'span');
			e.textContent = s;
			m.append(e);
		});
	};

	const run = (change) => (document.startViewTransition && !reduce ? document.startViewTransition(change) : change());

	const open = (li) => {
		const it = ITEMS.find((x) => x.id === li.dataset.id);
		const thumb = li.querySelector('.fg-card__img');
		from = li;
		thumb.style.viewTransitionName = 'fg-photo';
		run(() => {
			thumb.style.viewTransitionName = '';
			fill(it);
			dimg.style.viewTransitionName = 'fg-photo';
			dlg.showModal();
		});
	};

	const close = () => {
		if (!dlg.open) return;
		const li = from;
		run(() => {
			dimg.style.viewTransitionName = '';
			dlg.close();
			if (li) {
				li.querySelector('.fg-card__img').style.viewTransitionName = 'fg-photo';
				li.querySelector('button').focus({ preventScroll: true });
			}
		})?.finished?.finally(() => li && (li.querySelector('.fg-card__img').style.viewTransitionName = ''));
	};

	grid.addEventListener('click', (e) => {
		const li = e.target.closest('.fg-card');
		if (li) open(li);
	});
	dlg.querySelector('[data-close]').addEventListener('click', close);
	dlg.addEventListener('cancel', (e) => {
		e.preventDefault(); // Esc passa dalla stessa chiusura animata
		close();
	});
	dlg.addEventListener('click', (e) => e.target === dlg && close()); // clic sullo sfondo
	dlg.querySelector('[data-demo-link]').addEventListener('click', (e) => e.preventDefault());
})();
