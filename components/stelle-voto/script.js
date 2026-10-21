const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-star" /></svg>';
const comma = (n) => String(n).replace('.', ',');

// Le cinque stelle di ogni riga non sono scritte a mano.
document.querySelectorAll('[data-stars]').forEach((row) => (row.innerHTML = STAR.repeat(5)));

// Sezioni in vista: le barre della media crescono quando compaiono (.is-live).
const live = new IntersectionObserver(
	(entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)),
	{ threshold: 0.35 },
);
document.querySelectorAll('[data-live]').forEach((el) => live.observe(el));

// ——— Voto a cinque stelle: veri radio, --shown dice quante stelle accendere ———
const MESSAGES = ['Molto male', 'Si può migliorare', 'Nella media', 'Bene', 'Eccezionale!'];

document.querySelectorAll('[data-pick]').forEach((pick) => {
	const row = pick.querySelector('[data-pick-row]');
	const msg = pick.querySelector('[data-pick-msg]');
	const name = `voto-${Math.random().toString(36).slice(2, 7)}`;
	let value = 0;

	for (let i = 1; i <= 5; i++) {
		const label = document.createElement('label');
		label.className = 'pick__star';
		label.style.setProperty('--i', i);
		label.innerHTML =
			`<input type="radio" class="sr-only" name="${name}" value="${i}" />` +
			`<span class="pick__face">${STAR}${STAR}</span>` +
			`<span class="sr-only">${i} ${i === 1 ? 'stella' : 'stelle'}: ${MESSAGES[i - 1]}</span>`;
		row.append(label);
	}

	const show = (n) => {
		pick.style.setProperty('--shown', n);
		msg.textContent = n ? MESSAGES[n - 1] : 'Tocca una stella';
	};

	// Anteprima al passaggio (solo puntatore preciso): le stelle si accendono fino a quella sotto il mouse.
	row.addEventListener('pointerover', (e) => {
		const label = e.target.closest('.pick__star');
		if (label && e.pointerType === 'mouse') show(+label.style.getPropertyValue('--i'));
	});
	row.addEventListener('pointerleave', () => show(value));

	row.addEventListener('change', (e) => {
		value = +e.target.value;
		show(value);
		const label = e.target.closest('.pick__star');
		label.classList.remove('is-pop');
		void label.offsetWidth;
		label.classList.add('is-pop');
		if (!reduceMotion.matches) sparks(label.querySelector('.pick__face'));
	});
	show(0);
});

// Sette scintille che escono dalla stella scelta (angoli a passo fisso, niente casualità).
function sparks(face) {
	for (let k = 0; k < 7; k++) {
		const spark = document.createElement('i');
		spark.className = 'spark';
		face.append(spark);
		const angle = (k / 7) * Math.PI * 2 + 0.3;
		const dist = 26 + (k % 2) * 8;
		spark
			.animate(
				[
					{ translate: '0 0', scale: 1, opacity: 1 },
					{ translate: `${Math.cos(angle) * dist}px ${Math.sin(angle) * dist}px`, scale: 0, opacity: 0 },
				],
				{ duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
			)
			.finished.then(() => spark.remove());
	}
}

// ——— Mezze stelle: l'input range sotto, il puntatore sopra ———
document.querySelectorAll('[data-half]').forEach((root) => {
	const input = root.querySelector('.half__input');
	const stars = root.querySelector('[data-half-stars]');
	const out = root.querySelector('[data-half-out]');

	const paint = (v) => stars.style.setProperty('--value', v);
	const commit = () => {
		const v = input.valueAsNumber;
		paint(v);
		out.textContent = v ? `${comma(v)} su 5` : 'Nessun voto';
		input.setAttribute('aria-valuetext', v ? `${comma(v)} stelle su 5` : 'Nessun voto');
	};
	// Posizione del puntatore → mezza stella più vicina verso l'alto (mai zero col mouse).
	const fromPointer = (e) => {
		const r = stars.getBoundingClientRect();
		const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
		return Math.max(0.5, Math.ceil(f * 10) / 2);
	};

	stars.addEventListener('pointermove', (e) => {
		if (e.pointerType === 'mouse' || stars.hasPointerCapture(e.pointerId)) paint(fromPointer(e));
	});
	stars.addEventListener('pointerleave', (e) => {
		if (!stars.hasPointerCapture(e.pointerId)) commit();
	});
	stars.addEventListener('pointerdown', (e) => {
		stars.setPointerCapture(e.pointerId);
		input.value = fromPointer(e);
		commit();
		input.focus({ preventScroll: true });
	});
	stars.addEventListener('pointerup', (e) => {
		if (stars.hasPointerCapture(e.pointerId)) stars.releasePointerCapture(e.pointerId);
	});
	stars.addEventListener('pointercancel', commit);
	input.addEventListener('input', commit);
	root.querySelector('[data-half-clear]').addEventListener('click', () => {
		input.value = 0;
		commit();
	});
	commit();
});
