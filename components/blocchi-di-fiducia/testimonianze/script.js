// Testimonianze: scroll-snap orizzontale (dito, rotellina, frecce) + bottoni e puntini generati da JS.
(() => {
	const root = document.querySelector('[data-ts]');
	const track = root.querySelector('[data-track]');
	const slides = [...track.children];
	const dots = root.querySelector('[data-dots]');
	const prev = root.querySelector('[data-prev]');
	const next = root.querySelector('[data-next]');
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const behavior = reduce ? 'auto' : 'smooth';
	let index = 0;

	const go = (i) => {
		const n = Math.min(Math.max(i, 0), slides.length - 1);
		track.scrollTo({ left: slides[n].offsetLeft - track.offsetLeft, behavior });
	};

	const dotBtns = slides.map((_, i) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'ts__dot';
		b.setAttribute('aria-label', LabI18n.t('testimonianze.dot', 'Citazione {n} di {m}', { n: i + 1, m: slides.length }));
		b.addEventListener('click', () => go(i));
		dots.append(b);
		return b;
	});

	const render = () => {
		dotBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
		prev.disabled = index === 0;
		next.disabled = index === slides.length - 1;
		slides.forEach((s, i) => s.classList.toggle('is-current', i === index));
	};

	let raf = 0;
	track.addEventListener('scroll', () => {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(() => {
			const w = slides[0].offsetWidth;
			const i = Math.round(track.scrollLeft / w);
			if (i !== index) {
				index = Math.min(Math.max(i, 0), slides.length - 1);
				render();
			}
		});
	}, { passive: true });

	prev.addEventListener('click', () => go(index - 1));
	next.addEventListener('click', () => go(index + 1));
	track.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
		else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
	});
	render();
})();
