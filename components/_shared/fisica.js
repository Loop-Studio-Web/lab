// Fisica del gesto, condivisa dalle schede «Gesti e fisica» e «Storie e feed». Nessuna dipendenza.
//   Fisica.molla({ da, a, v, rigidezza, smorzamento }, onFrame, onFine)  molla interrompibile; ritorna { stop }
//   Fisica.traccia()                                                      stima la velocità dagli ultimi ~100 ms
//   Fisica.elastico(x, limite)                                            resistenza oltre il bordo (rubber-band)
//   Fisica.trascina(el, { onStart, onMove, onEnd })                       Pointer Events con cattura del puntatore
// Con prefers-reduced-motion la molla salta subito al valore finale.
(() => {
	const ridotto = matchMedia('(prefers-reduced-motion: reduce)');
	const PASSO = 1 / 120;

	// Molla a passo fisso (Euler semi-implicito): stabile anche se il frame salta. v in unità/secondo.
	function molla({ da = 0, a = 0, v = 0, rigidezza = 170, smorzamento = 22, massa = 1 }, onFrame, onFine) {
		let x = da;
		let vel = v;
		let attiva = true;
		let id = 0;
		let ultimo = 0;
		let resto = 0;
		const fine = () => {
			attiva = false;
			cancelAnimationFrame(id);
			if (onFine) onFine();
		};
		if (ridotto.matches) {
			onFrame(a, 0);
			fine();
			return { stop() {} };
		}
		const tick = (t) => {
			if (!attiva) return;
			resto += Math.min((t - ultimo) / 1000, 0.064);
			ultimo = t;
			while (resto >= PASSO) {
				vel += ((-rigidezza * (x - a) - smorzamento * vel) / massa) * PASSO;
				x += vel * PASSO;
				resto -= PASSO;
			}
			onFrame(x, vel);
			if (!attiva) return;
			if (Math.abs(vel) < 0.5 && Math.abs(x - a) < 0.05) {
				onFrame(a, 0);
				fine();
				return;
			}
			id = requestAnimationFrame(tick);
		};
		id = requestAnimationFrame((t) => {
			ultimo = t;
			tick(t);
		});
		return {
			stop() {
				attiva = false;
				cancelAnimationFrame(id);
			},
		};
	}

	// Velocità (px/s) dagli ultimi campioni: ignora quelli più vecchi di 100 ms.
	function traccia() {
		let campioni = [];
		return {
			aggiungi(x, y) {
				const t = performance.now();
				campioni.push({ x, y, t });
				campioni = campioni.filter((c) => t - c.t <= 100);
			},
			velocita() {
				if (campioni.length < 2) return { x: 0, y: 0 };
				const p = campioni[0];
				const u = campioni[campioni.length - 1];
				const dt = (u.t - p.t) / 1000;
				return dt > 0 ? { x: (u.x - p.x) / dt, y: (u.y - p.y) / dt } : { x: 0, y: 0 };
			},
			reset() {
				campioni = [];
			},
		};
	}

	// Oltre il limite il movimento si fa sempre più duro, ma non si ferma di colpo.
	function elastico(x, limite, k = 0.55) {
		const s = Math.sign(x);
		const a = Math.abs(x);
		return s * (1 - 1 / ((a * k) / limite + 1)) * limite;
	}

	// Il CSS dell'elemento imposta touch-action per asse (pan-y se il gesto è orizzontale, e viceversa).
	function trascina(el, { onStart, onMove, onEnd }) {
		let attivo = null;
		const tr = traccia();
		el.addEventListener('pointerdown', (e) => {
			if (e.button !== 0 || attivo !== null) return;
			attivo = e.pointerId;
			el.setPointerCapture(e.pointerId);
			const o = { x: e.clientX, y: e.clientY };
			el._fisicaOrigine = o;
			tr.reset();
			tr.aggiungi(e.clientX, e.clientY);
			if (onStart) onStart(e);
		});
		el.addEventListener('pointermove', (e) => {
			if (e.pointerId !== attivo) return;
			tr.aggiungi(e.clientX, e.clientY);
			const o = el._fisicaOrigine;
			onMove({ dx: e.clientX - o.x, dy: e.clientY - o.y, x: e.clientX, y: e.clientY, event: e });
		});
		const fine = (annullato) => (e) => {
			if (e.pointerId !== attivo) return;
			attivo = null;
			const o = el._fisicaOrigine;
			const v = tr.velocita();
			onEnd({ dx: e.clientX - o.x, dy: e.clientY - o.y, vx: v.x, vy: v.y, annullato });
		};
		el.addEventListener('pointerup', fine(false));
		el.addEventListener('pointercancel', fine(true));
	}

	window.Fisica = { molla, traccia, elastico, trascina, ridotto: () => ridotto.matches };
})();
