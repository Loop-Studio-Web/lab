// Feed: post generati dai dati condivisi. Aggancio con scroll-snap; lo zoom lento parte solo sul post visibile (IntersectionObserver).
// Doppio tocco/clic sulla foto = cuore (non lo toglie, come nelle app vere); il pulsante cuore invece alterna.
(() => {
	const root = document.querySelector('[data-sf]');
	const scroller = root.querySelector('[data-scroll]');
	const burst = root.querySelector('[data-burst]');
	const live = root.querySelector('[data-live]');
	const lang = document.documentElement.lang || 'it';
	const ICO = {
		heart: '<path d="M12 21s-7.5-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2 0 3.5 1 5.4 3 1.9-2 3.4-3 5.4-3 3.6 0 5.7 3.7 4.2 7.1C19.5 16.4 12 21 12 21z" />',
		save: '<path d="M6 4h12v17l-6-4.5L6 21z" />',
		down: '<path d="m6 9 6 6 6-6" />',
	};
	const icona = (k) => `<svg class="sf-ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;
	const numero = (n) => n.toLocaleString(lang);

	const bottone = (cls, k, etichetta) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = `sf-round ${cls}`;
		b.innerHTML = icona(k);
		b.setAttribute('aria-label', etichetta);
		return b;
	};

	SEF.POSTI.forEach((p, i) => {
		const post = document.createElement('article');
		post.className = 'fe-post';
		post.dataset.i = i;
		post.innerHTML = `<img class="fe-img" alt="" width="900" height="600" decoding="async" draggable="false"><span class="fe-shade"></span>
			<div class="fe-meta"><p class="fe-who"></p><h2></h2><p></p></div><div class="fe-side"></div>`;
		const foto = post.querySelector('.fe-img');
		foto.src = SEF.img(p);
		if (i > 1) foto.loading = 'lazy';
		post.querySelector('.fe-who').textContent = p.a;
		post.querySelector('h2').textContent = p.t;
		post.querySelector('.fe-meta p:last-child').textContent = p.c;

		let mi = 120 + p.n * 87;
		const side = post.querySelector('.fe-side');
		const cuore = bottone('fe-like', 'heart', LabI18n.t('fe.like', 'Mi piace'));
		cuore.setAttribute('aria-pressed', 'false');
		const conta = document.createElement('span');
		conta.textContent = numero(mi);
		const wrapLike = document.createElement('div');
		wrapLike.className = 'fe-act';
		wrapLike.append(cuore, conta);
		const salva = bottone('fe-save', 'save', LabI18n.t('fe.save', 'Salva'));
		salva.setAttribute('aria-pressed', 'false');
		const wrapSalva = document.createElement('div');
		wrapSalva.className = 'fe-act';
		wrapSalva.append(salva);
		side.append(wrapLike, wrapSalva);
		if (i < SEF.POSTI.length - 1) {
			const giu = bottone('fe-next', 'down', LabI18n.t('fe.next', 'Foto successiva'));
			const wrapGiu = document.createElement('div');
			wrapGiu.className = 'fe-act';
			wrapGiu.append(giu);
			side.append(wrapGiu);
			giu.addEventListener('click', () => post.nextElementSibling.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
		}

		const imposta = (si) => {
			if (cuore.getAttribute('aria-pressed') === String(si)) return;
			cuore.setAttribute('aria-pressed', String(si));
			mi += si ? 1 : -1;
			conta.textContent = numero(mi);
		};
		cuore.addEventListener('click', () => {
			imposta(cuore.getAttribute('aria-pressed') !== 'true');
			live.textContent = `${cuore.getAttribute('aria-pressed') === 'true' ? LabI18n.t('fe.liked', 'Ti piace') : LabI18n.t('fe.unliked', 'Non ti piace più')}: ${p.t}`;
		});
		salva.addEventListener('click', () => {
			const si = salva.getAttribute('aria-pressed') !== 'true';
			salva.setAttribute('aria-pressed', String(si));
			live.textContent = `${si ? LabI18n.t('fe.saved', 'Salvata') : LabI18n.t('fe.unsaved', 'Rimossa dai salvati')}: ${p.t}`;
		});

		// Doppio tocco: due rilasci ravvicinati e vicini sulla foto (non sui pulsanti).
		let ultimo = { t: 0, x: 0, y: 0 };
		post.addEventListener('pointerup', (e) => {
			if (e.target.closest('button') || e.button !== 0) return;
			const ora = performance.now();
			if (ora - ultimo.t < 320 && Math.hypot(e.clientX - ultimo.x, e.clientY - ultimo.y) < 40) {
				ultimo.t = 0;
				imposta(true);
				const r = scroller.parentElement.getBoundingClientRect();
				burst.style.left = `${e.clientX - r.left}px`;
				burst.style.top = `${e.clientY - r.top}px`;
				burst.classList.remove('is-on');
				void burst.getBoundingClientRect();
				burst.classList.add('is-on');
				live.textContent = `${LabI18n.t('fe.liked', 'Ti piace')}: ${p.t}`;
			} else ultimo = { t: ora, x: e.clientX, y: e.clientY };
		});
		scroller.append(post);
	});

	const io = new IntersectionObserver(
		(voci) => voci.forEach((v) => v.target.classList.toggle('is-live', v.isIntersecting)),
		{ root: scroller, threshold: 0.6 },
	);
	scroller.querySelectorAll('.fe-post').forEach((p) => io.observe(p));
})();
