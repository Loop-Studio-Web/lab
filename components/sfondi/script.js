// Stelle, lucciole, foglie e colonne sono decine di elementi quasi uguali: li crea
// questo script con un generatore a seme fisso (mulberry32), così lo sfondo è
// identico a ogni visita. Dentro un riquadro che non si vede, tutto è in pausa.
const rng = (seed) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const between = (r, a, b) => a + r() * (b - a);

const build = {
	stars(layer) {
		const r = rng(7);
		for (let i = 0; i < 40; i++) {
			const dx = between(r, 6, 16);
			const star = document.createElement('i');
			star.className = 'star';
			star.style.cssText =
				`--x:${between(r, 4, 96).toFixed(1)}%;--dx:${dx.toFixed(1)}rem;` +
				`--ang:${(-Math.atan(dx / 22) * 57.3).toFixed(1)}deg;` +
				`--dur:${between(r, 3, 5).toFixed(2)}s;--d:${between(r, 0, 4).toFixed(2)}s`;
			layer.append(star);
		}
	},
	fireflies(layer) {
		const r = rng(11);
		for (let i = 0; i < 15; i++) {
			const ff = document.createElement('i');
			ff.className = 'firefly';
			ff.style.cssText =
				`--x:${between(r, 6, 94).toFixed(1)}%;--y:${between(r, 20, 90).toFixed(1)}%;` +
				`--ax:${between(r, 2, 7).toFixed(1)}rem;--ay:${between(r, 1.5, 5).toFixed(1)}rem;` +
				`--tx:${between(r, 9, 20).toFixed(1)}s;--dx:${between(r, -20, 0).toFixed(1)}s;` +
				`--ty:${between(r, 7, 15).toFixed(1)}s;--dy:${between(r, -15, 0).toFixed(1)}s;` +
				`--tf:${between(r, 5, 11).toFixed(1)}s;--df:${between(r, 0, 8).toFixed(1)}s;--s:${between(r, 0.6, 1.3).toFixed(2)}`;
			ff.innerHTML = '<b></b>';
			layer.append(ff);
		}
	},
	leaves(layer) {
		const r = rng(3);
		const kinds = ['acero-rosso', 'acero-arancio', 'ovale-giallo', 'betulla-ruggine', 'quercia-bruna', 'ovale-verde'];
		for (let i = 0; i < 16; i++) {
			const d = between(r, 12, 20);
			const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			leaf.setAttribute('class', 'leaf');
			leaf.setAttribute('aria-hidden', 'true');
			leaf.style.cssText =
				`--x:${between(r, 2, 94).toFixed(1)}%;--size:${between(r, 2.2, 3.6).toFixed(2)}rem;` +
				`--dur:${d.toFixed(1)}s;--d:${(-between(r, 0, d)).toFixed(1)}s;` +
				`--r0:${between(r, -60, 0).toFixed(0)}deg;--r1:${between(r, 90, 220).toFixed(0)}deg;--y:${between(r, 0, 100).toFixed(0)}cqh`;
			leaf.innerHTML = `<use href="#${kinds[i % kinds.length]}"/>`;
			layer.append(leaf);
		}
	},
	rain(layer) {
		const r = rng(5);
		for (let i = 0; i < 144; i++) {
			const c = document.createElement('i');
			c.className = 'rain';
			c.style.cssText = `--i:${i};--h:${((300 / 144) * i).toFixed(1)};--d:${(-r() * 4).toFixed(2)}s;--y:${(r() * 100).toFixed(0)}`;
			layer.append(c);
		}
	},
};
document.querySelectorAll('[data-bg]').forEach((el) => build[el.dataset.bg](el.querySelector('[data-fill]')));

const observer = new IntersectionObserver(
	(entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)),
	{ rootMargin: '60px' },
);
document.querySelectorAll('.bg').forEach((el) => observer.observe(el));

// Illusione ottica: sul touch non c'è :hover, un tocco rivela e un altro nasconde.
const diag = document.querySelector('.bg--diag');
diag.addEventListener('click', () => {
	if (!matchMedia('(hover: hover)').matches) diag.classList.toggle('is-revealed');
});
