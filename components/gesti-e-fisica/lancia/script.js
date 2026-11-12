// Lancia: durante il trascinamento la pallina segue il dito; al rilascio parte con la velocità misurata,
// perde velocità per attrito e rimbalza sui bordi (restituzione 0,72). Il ciclo si ferma quando la pallina è ferma.
(() => {
	const campo = document.querySelector('[data-ln]');
	const palla = campo.querySelector('[data-ball]');
	const lettura = campo.querySelector('[data-speed]');
	const live = document.querySelector('[data-live]');

	const ATTRITO = 1.7; // quota di velocità persa al secondo (esponenziale)
	const RIMBALZO = 0.72;
	let W = 0;
	let Hh = 0;
	let D = 0;
	let x = 0;
	let y = 0;
	let vx = 0;
	let vy = 0;
	let anima = 0;
	let ultimo = 0;

	// Generatore a seme fisso per i lanci casuali.
	const mulberry32 = (a) => () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const rnd = mulberry32(2026);

	const misura = () => {
		W = campo.clientWidth;
		Hh = campo.clientHeight;
		D = palla.offsetWidth;
	};
	const metti = (px, py) => {
		x = Math.max(0, Math.min(W - D, px));
		y = Math.max(0, Math.min(Hh - D, py));
		palla.style.transform = `translate3d(${x}px,${y}px,0)`;
	};
	const velocita = () => {
		lettura.textContent = anima ? `${Math.round(Math.hypot(vx, vy))} px/s` : '';
	};

	const passo = (t) => {
		const dt = Math.min((t - ultimo) / 1000, 0.05);
		ultimo = t;
		const f = Math.exp(-ATTRITO * dt);
		vx *= f;
		vy *= f;
		let nx = x + vx * dt;
		let ny = y + vy * dt;
		if (nx < 0 || nx > W - D) {
			nx = nx < 0 ? 0 : W - D;
			vx = -vx * RIMBALZO;
		}
		if (ny < 0 || ny > Hh - D) {
			ny = ny < 0 ? 0 : Hh - D;
			vy = -vy * RIMBALZO;
		}
		metti(nx, ny);
		velocita();
		if (Math.hypot(vx, vy) < 12) {
			ferma();
			return;
		}
		anima = requestAnimationFrame(passo);
	};
	const ferma = () => {
		cancelAnimationFrame(anima);
		anima = 0;
		vx = vy = 0;
		velocita();
	};
	const parti = (px, py) => {
		ferma();
		if (Fisica.ridotto()) return; // senza movimento: la pallina resta dove è stata lasciata
		vx = px;
		vy = py;
		ultimo = performance.now();
		anima = requestAnimationFrame(passo);
	};

	let ox = 0;
	let oy = 0;
	Fisica.trascina(palla, {
		onStart() {
			ferma();
			ox = x;
			oy = y;
		},
		onMove({ dx, dy }) {
			metti(ox + dx, oy + dy);
		},
		onEnd({ vx: ex, vy: ey, annullato }) {
			if (!annullato) parti(ex, ey);
		},
	});

	document.querySelector('[data-relaunch]').addEventListener('click', () => {
		const ang = rnd() * Math.PI * 2;
		if (Fisica.ridotto()) {
			metti(rnd() * (W - D), rnd() * (Hh - D));
		} else {
			parti(Math.cos(ang) * 1800, Math.sin(ang) * 1800);
		}
		live.textContent = LabI18n.t('lancia.launched', 'Pallina lanciata');
	});

	misura();
	metti((W - D) / 2, (Hh - D) / 2);
	addEventListener('resize', () => {
		misura();
		metti(x, y);
	});
	// Fuori dallo schermo il ciclo non deve girare.
	new IntersectionObserver((e) => {
		if (!e.some((i) => i.isIntersecting)) ferma();
	}).observe(campo);
})();
