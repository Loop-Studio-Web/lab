// Sei slider, una funzione ciascuno (in fondo). In comune: tenere d'occhio se lo slider è in vista,
// l'avanzamento automatico (solo in vista, fermo con puntatore/fuoco dentro e per sempre dopo il
// primo gesto dell'utente, e mai con prefers-reduced-motion) e il trascinamento col dito.
// Le slide non visibili sono `inert`: niente fuoco da tastiera e invisibili agli screen reader.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Mette .is-live sul riquadro quando almeno il 35% è visibile.
const watch = (root, onChange) => {
	new IntersectionObserver(
		([entry]) => {
			root.classList.toggle('is-live', entry.isIntersecting);
			onChange?.(entry.isIntersecting);
		},
		{ threshold: 0.35 }
	).observe(root);
};

// step() viene chiamata ogni `ms` finché il riquadro è in vista e nessuno lo sta usando.
const autoplay = (root, step, ms) => {
	let timer = 0;
	let stopped = false;
	let busy = false;
	const sync = () => {
		clearInterval(timer);
		timer = 0;
		if (!stopped && !busy && !reduceMotion.matches && root.classList.contains('is-live')) timer = setInterval(step, ms);
	};
	watch(root, sync);
	root.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && ((busy = true), sync()));
	root.addEventListener('pointerleave', () => ((busy = false), sync()));
	root.addEventListener('focusin', () => ((busy = true), sync()));
	root.addEventListener('focusout', () => ((busy = false), sync()));
	return {
		// Chiamato a ogni gesto dell'utente: l'avanzamento automatico non riparte più.
		stop() {
			stopped = true;
			sync();
		},
	};
};

// Trascinamento (touch/penna); il mouse usa le frecce. Lo scroll verticale della pagina resta libero
// (touch-action: pan-y), quindi per lo slider verticale basta la direzione `vertical`: scorrere in su = avanti.
const swipe = (root, onPrev, onNext, vertical = false) => {
	let start = null;
	const axis = (e) => (vertical ? e.clientY : e.clientX);
	root.addEventListener('pointerdown', (e) => {
		if (e.pointerType !== 'mouse') start = axis(e);
	});
	root.addEventListener('pointerup', (e) => {
		if (start === null) return;
		const d = axis(e) - start;
		start = null;
		if (Math.abs(d) > 40) (d < 0 ? onNext : onPrev)();
	});
	root.addEventListener('pointercancel', () => (start = null));
};

// Frecce della tastiera quando il fuoco è dentro lo slider.
const keys = (root, onPrev, onNext, vertical = false) =>
	root.addEventListener('keydown', (e) => {
		const [back, forth] = vertical ? ['ArrowDown', 'ArrowUp'] : ['ArrowLeft', 'ArrowRight'];
		if (e.key === back) onPrev();
		else if (e.key === forth) onNext();
		else return;
		e.preventDefault();
	});

const announce = (root, text) => {
	const live = root.querySelector('[data-live]');
	if (live) live.textContent = text;
};

// Collega frecce, tastiera e dito a due azioni; ogni gesto ferma l'avanzamento automatico.
const controls = (root, { prev, next, ap, vertical = false }) => {
	const user = (fn) => () => {
		ap?.stop();
		fn();
	};
	const p = user(prev);
	const n = user(next);
	root.querySelector('[data-prev]').addEventListener('click', p);
	root.querySelector('[data-next]').addEventListener('click', n);
	swipe(root, p, n, vertical);
	keys(root, p, n, vertical);
};

const sliders = {
	// Fruit soda: lo sfondo cambia colore, il frutto entra dal basso/alto e la fascia
	// dell'etichetta sulla lattina scorre (--left in CSS, da data-i).
	fruit(root) {
		const items = [...root.querySelectorAll('.fs__item')];
		const names = items.map((item) => item.querySelector('.fs__name').textContent);
		let i = 0;
		const go = (dir, byUser) => {
			const next = (i + (dir === 'next' ? 1 : -1) + items.length) % items.length;
			items.find((item) => item.classList.contains('is-leaving'))?.classList.remove('is-leaving');
			items[i].classList.replace('is-active', 'is-leaving');
			items[i].inert = true;
			items[next].classList.add('is-active');
			items[next].inert = false;
			i = next;
			root.dataset.dir = dir;
			root.dataset.i = i;
			if (byUser) announce(root, `Gusto ${names[i]}, ${i + 1} di ${items.length}`);
		};
		const ap = autoplay(root, () => go('next'), 5000);
		controls(root, { ap, prev: () => go('prev', true), next: () => go('next', true) });
	},

	// Film e animali: stessa meccanica. La prima slide del DOM è quella visibile; "avanti" la sposta in
	// fondo, "indietro" porta l'ultima in testa. Le miniature si costruiscono dalle slide (data-title,
	// data-genre, data-pos = punto della foto da tenere nel ritaglio verticale).
	rot(root) {
		const list = root.querySelector('.rot__list');
		const thumbs = root.querySelector('.rot__thumbs');
		const slides = [...list.children];
		const total = slides.length;
		const info = slides.map((s) => s.dataset);
		for (const slide of slides) {
			const thumb = document.createElement('div');
			thumb.className = 'rot__thumb';
			const img = document.createElement('img');
			img.src = slide.querySelector('img').getAttribute('src');
			img.alt = '';
			img.width = 200;
			img.height = 300;
			img.loading = 'lazy';
			img.style.setProperty('--pos', slide.dataset.pos);
			const text = document.createElement('div');
			text.className = 'rot__thumb-text';
			text.innerHTML = '<b></b><span></span>';
			text.firstChild.textContent = slide.dataset.title;
			text.lastChild.textContent = slide.dataset.genre;
			thumb.append(img, text);
			thumbs.append(thumb);
		}
		// Le miniature mostrano i PROSSIMI: la prima (= slide corrente) va in coda.
		thumbs.append(thumbs.firstElementChild);

		let current = 0;
		let locked = false;
		const sync = () => [...list.children].forEach((slide, k) => (slide.inert = k !== 0));
		sync();

		const show = (type, steps = 1, byUser = false) => {
			if (locked) return;
			locked = true;
			for (let s = 0; s < steps; s++) {
				if (type === 'next') {
					list.append(list.firstElementChild);
					thumbs.append(thumbs.firstElementChild);
				} else {
					list.prepend(list.lastElementChild);
					thumbs.prepend(thumbs.lastElementChild);
				}
			}
			current = (current + (type === 'next' ? steps : -steps) + total) % total;
			root.classList.remove('next', 'prev');
			void root.offsetWidth; // riavvia le animazioni
			root.classList.add(type);
			sync();
			setTimeout(() => {
				root.classList.remove('next', 'prev');
				locked = false;
			}, 1300);
			if (byUser) announce(root, `${info[current].title}, ${current + 1} di ${total}`);
		};

		const ap = autoplay(root, () => show('next'), +root.dataset.ms || 6500);
		controls(root, { ap, prev: () => show('prev', 1, true), next: () => show('next', 1, true) });
		// Negli animali anche un clic sulla miniatura porta a quella slide.
		if (root.dataset.thumbs === 'click') {
			thumbs.addEventListener('click', (e) => {
				const thumb = e.target.closest('.rot__thumb');
				if (!thumb) return;
				const steps = [...thumbs.children].indexOf(thumb) + 1;
				if (steps === total) return;
				ap.stop();
				show('next', steps, true);
			});
		}
	},

	// Moda: due strisce verticali che scorrono in versi opposti (--i in CSS). Niente rotella.
	vs(root) {
		const panels = [...root.querySelectorAll('.vs__panel')];
		const shots = [...root.querySelectorAll('.vs__shot')];
		const titles = panels.map((p) => p.querySelector('.vs__title').textContent);
		const total = panels.length;
		let i = 0;
		let locked = false;
		const go = (delta, byUser) => {
			if (locked) return;
			locked = true;
			setTimeout(() => (locked = false), 600);
			i = (i + delta + total) % total;
			root.style.setProperty('--i', i);
			root.dataset.i = i;
			panels.forEach((p, k) => (p.inert = k !== i));
			shots.forEach((s, k) => (s.inert = k !== i));
			if (byUser) announce(root, `${titles[i]}, look ${i + 1} di ${total}`);
		};
		const ap = autoplay(root, () => go(1), 4500);
		controls(root, { ap, vertical: true, prev: () => go(-1, true), next: () => go(1, true) });
	},

	// Caffè: tre classi (is-active, is-o1, is-o2) dicono quale colonna di bicchieri sta dove.
	cf(root) {
		const items = [...root.querySelectorAll('.cf__item')];
		const total = items.length;
		const names = items.map((item) => item.querySelector('h3').textContent.split(',')[0]);
		let active = 1;
		const place = (dir, byUser) => {
			const step = dir === 'next' ? 1 : -1;
			active = (active + step + total) % total;
			const o1 = dir === 'next' ? (active - 1 + total) % total : (active + 1) % total;
			const o2 = dir === 'next' ? (active + 1) % total : (o1 + 1) % total;
			root.classList.remove('next', 'prev');
			root.classList.add(dir);
			items.forEach((item, k) => {
				item.classList.toggle('is-active', k === active);
				item.classList.toggle('is-o1', k === o1);
				item.classList.toggle('is-o2', k === o2);
				item.inert = k !== active;
				// riavvia le animazioni dei bicchieri
				const parts = item.querySelectorAll('.cf__image img, .cf__image figcaption');
				parts.forEach((p) => (p.style.animation = 'none'));
				void item.offsetWidth;
				parts.forEach((p) => (p.style.animation = ''));
			});
			if (byUser) announce(root, `${names[active]}, ${active + 1} di ${total}`);
		};
		const ap = autoplay(root, () => place('next'), 5500);
		controls(root, { ap, prev: () => place('prev', true), next: () => place('next', true) });
	},

	// Magia di luce: l'ordine delle slide nel DOM decide da che parte ruotano (selettore ~ in CSS).
	mg(root) {
		const items = [...root.querySelectorAll('.mg__item')];
		const names = items.map((item) => item.querySelector('h3').textContent);
		let i = 0;
		const go = (delta, byUser) => {
			i = (i + delta + items.length) % items.length;
			items.forEach((item, k) => {
				item.classList.toggle('is-active', k === i);
				item.inert = k !== i;
			});
			if (byUser) announce(root, `${names[i]}, ${i + 1} di ${items.length}`);
		};
		const ap = autoplay(root, () => go(1), 6000);
		controls(root, { ap, prev: () => go(-1, true), next: () => go(1, true) });
	},
};

document.querySelectorAll('[data-slider]').forEach((root) => sliders[root.dataset.slider](root));
