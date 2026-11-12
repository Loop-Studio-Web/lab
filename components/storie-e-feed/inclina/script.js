// Inclinazione: gli strati della card si muovono in base all'inclinazione del telefono (deviceorientation),
// al puntatore (mouse) o alle frecce. Il punto neutro è la posizione in cui si tiene il telefono all'attivazione («Ricentra» lo rifà).
// Su iPhone il permesso si chiede da un clic; senza HTTPS o senza sensori resta tutto dritto e lo si dice a parole.
(() => {
	const root = document.querySelector('[data-in]');
	const scene = root.querySelector('[data-scene]');
	const card = root.querySelector('[data-card]');
	const photo = root.querySelector('[data-photo]');
	const glare = root.querySelector('[data-glare]');
	const chip = root.querySelector('[data-chip]');
	const mark = root.querySelector('[data-mark]');
	const text = root.querySelector('[data-text]');
	const shadow = root.querySelector('[data-shadow]');
	const status = root.querySelector('[data-status]');
	const btnEnable = root.querySelector('[data-enable]');
	const btnReset = root.querySelector('[data-reset]');

	const post = SEF.POSTI[7];
	photo.src = SEF.img(post);
	chip.textContent = post.a;
	root.querySelector('[data-t]').textContent = post.t;
	root.querySelector('[data-c]').textContent = post.c;
	card.tabIndex = 0;
	card.setAttribute('role', 'group');
	card.setAttribute('aria-label', post.t);

	const MAX = Math.sin((22 * Math.PI) / 180); // 22° di inclinazione portano al massimo
	const ridotto = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const AMP = ridotto ? 0.35 : 1;
	const clamp = (v) => Math.max(-1, Math.min(1, v));

	let sensore = false; // un evento vero è arrivato
	let ultimo = null;
	let base = null;
	let punt = { x: 0, y: 0, su: false };
	let tasti = { x: 0, y: 0 };
	let cx = 0;
	let cy = 0;
	let raf = 0;
	let visibile = true;

	const bersaglio = () => {
		if (sensore && base) {
			// rel = base^T · ultimo; per rotazioni piccole rel[0][2] ≈ rollio attorno all'asse lungo, rel[2][1] ≈ beccheggio.
			let r02 = 0;
			let r21 = 0;
			for (let k = 0; k < 3; k++) {
				r02 += base[k][0] * ultimo[k][2];
				r21 += base[k][2] * ultimo[k][1];
			}
			let x = r02;
			let y = r21;
			const ang = (screen.orientation && screen.orientation.angle) || 0;
			if (ang === 90) [x, y] = [y, -x];
			else if (ang === 270) [x, y] = [-y, x];
			return { x: clamp(x / MAX), y: clamp(y / MAX) };
		}
		if (punt.su) return punt;
		return tasti;
	};
	const disegna = () => {
		const x = cx * AMP;
		const y = cy * AMP;
		card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
		photo.style.transform = `translate3d(${-x * 0.9}rem, ${-y * 0.9}rem, 0)`;
		glare.style.transform = `translate3d(${x * 28}%, ${y * 28}%, 0)`;
		chip.style.transform = `translate3d(${x * 0.35}rem, ${y * 0.35}rem, 0)`;
		text.style.transform = `translate3d(${x * 0.7}rem, ${y * 0.7}rem, 0)`;
		mark.style.transform = `translate3d(${x * 1.1}rem, ${y * 1.1}rem, 0)`;
		shadow.style.transform = `translate3d(${-x * 1.4}rem, 0, 0) scaleX(${1 - Math.abs(x) * 0.08})`;
	};
	const tick = () => {
		raf = 0;
		if (!visibile) return;
		const b = bersaglio();
		const k = ridotto ? 1 : 0.14;
		cx += (b.x - cx) * k;
		cy += (b.y - cy) * k;
		disegna();
		if (Math.abs(b.x - cx) > 0.002 || Math.abs(b.y - cy) > 0.002) raf = requestAnimationFrame(tick);
	};
	const sveglia = () => {
		if (!raf && visibile) raf = requestAnimationFrame(tick);
	};

	// Puntatore (solo mouse e penna) e tastiera.
	scene.addEventListener('pointermove', (e) => {
		if (e.pointerType === 'touch') return;
		const r = scene.getBoundingClientRect();
		punt = { x: clamp(((e.clientX - r.left) / r.width - 0.5) * 2), y: clamp(((e.clientY - r.top) / r.height - 0.5) * 2), su: true };
		sveglia();
	});
	scene.addEventListener('pointerleave', () => {
		punt.su = false;
		sveglia();
	});
	card.addEventListener('keydown', (e) => {
		const passo = 0.35;
		if (e.key === 'ArrowLeft') tasti.x = clamp(tasti.x - passo);
		else if (e.key === 'ArrowRight') tasti.x = clamp(tasti.x + passo);
		else if (e.key === 'ArrowUp') tasti.y = clamp(tasti.y - passo);
		else if (e.key === 'ArrowDown') tasti.y = clamp(tasti.y + passo);
		else if (e.key === 'Enter') tasti = { x: 0, y: 0 };
		else return;
		e.preventDefault();
		sveglia();
	});

	// Sensore. L'angolo dello schermo scambia gli assi se il telefono è girato in orizzontale.
	// Rotazione del telefono come matrice (convenzione W3C: Rz(alfa)·Rx(beta)·Ry(gamma)). Gli angoli di Eulero da soli
	// diventano instabili col telefono quasi in piedi (gamma impazzisce); la rotazione relativa dalla posizione di partenza no.
	const matrice = (e) => {
		const r = Math.PI / 180;
		const [ca, sa] = [Math.cos((e.alpha || 0) * r), Math.sin((e.alpha || 0) * r)];
		const [cb, sb] = [Math.cos(e.beta * r), Math.sin(e.beta * r)];
		const [cg, sg] = [Math.cos(e.gamma * r), Math.sin(e.gamma * r)];
		const rxy = [[cg, 0, sg], [sb * sg, cb, -sb * cg], [-cb * sg, sb, cb * cg]]; // Rx·Ry
		return [
			[ca * rxy[0][0] - sa * rxy[1][0], ca * rxy[0][1] - sa * rxy[1][1], ca * rxy[0][2] - sa * rxy[1][2]],
			[sa * rxy[0][0] + ca * rxy[1][0], sa * rxy[0][1] + ca * rxy[1][1], sa * rxy[0][2] + ca * rxy[1][2]],
			rxy[2],
		];
	};
	const onOri = (e) => {
		if (e.beta == null || e.gamma == null) return;
		ultimo = matrice(e);
		if (!sensore) {
			sensore = true;
			base = ultimo;
			status.textContent = LabI18n.t('in.on', 'Inclinazione attiva: muovi il telefono.');
		}
		sveglia();
	};
	const avvia = () => {
		window.addEventListener('deviceorientation', onOri);
		setTimeout(() => {
			if (!sensore) status.textContent = LabI18n.t('in.none', 'Nessun dato dai sensori: servono una pagina HTTPS e il permesso (nella modale del sito, anche quello dell’iframe).');
		}, 1500);
	};
	btnEnable.addEventListener('click', async () => {
		const Ev = window.DeviceOrientationEvent;
		if (Ev && typeof Ev.requestPermission === 'function') {
			try {
				if ((await Ev.requestPermission()) !== 'granted') {
					status.textContent = LabI18n.t('in.denied', 'Permesso negato: la card resta dritta (si può dare di nuovo da Impostazioni di Safari).');
					return;
				}
			} catch {
				status.textContent = LabI18n.t('in.none', 'Nessun dato dai sensori: servono una pagina HTTPS e il permesso (nella modale del sito, anche quello dell’iframe).');
				return;
			}
		}
		btnEnable.hidden = true;
		avvia();
	});
	btnReset.addEventListener('click', () => {
		tasti = { x: 0, y: 0 };
		if (sensore) base = ultimo;
		sveglia();
	});

	// Dove c'è il tocco e l'API, il pulsante serve (iPhone: permesso; Android: avvio esplicito, uguale per tutti).
	if ('DeviceOrientationEvent' in window && matchMedia('(pointer: coarse)').matches) {
		btnEnable.hidden = false;
		status.textContent = LabI18n.t('in.hint', 'Tocca il pulsante e poi inclina il telefono.');
	} else {
		status.textContent = LabI18n.t('in.pointer', 'Muovi il puntatore sulla card.');
	}

	new IntersectionObserver(([en]) => {
		visibile = en.isIntersecting;
		if (visibile) sveglia();
	}).observe(scene);
	disegna();
})();
