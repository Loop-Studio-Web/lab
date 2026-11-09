// Tab «Volo»: foto con 15 punti in % (veri <button>), fumetto ancorato che resta dentro la foto, frecce spaziali, passo avanti/indietro.
(() => {
	const I = window.LabI18n;
	I?.apply();
	const $ = (s, r = document) => r.querySelector(s);
	const PW = 1600;
	const PH = 1067;
	// nome, pilota, decollo, posti liberi, x, y, raggio del pallone (pixel della foto 1600×1067, centro del pallone); voli di fantasia, in ordine di decollo
	const FLIGHTS = [
		['Alba Rossa', 'Irene Basso', '05:20', 4, 433, 302, 25],
		['Nube Blu', 'Marco Ferri', '05:25', 0, 249, 466, 55],
		['Tramonto al contrario', 'Lia Conti', '05:30', 2, 446, 574, 32],
		['Tigli', 'Paolo Neri', '05:35', 6, 518, 620, 28],
		['Quarzo', 'Sara Vita', '05:40', 1, 478, 767, 28],
		['Piccolo Sole', 'Dario Pace', '05:45', 3, 266, 780, 28],
		['Girasole', 'Elena Ross', '05:50', 5, 876, 248, 38],
		['Bandiera', 'Tom Serra', '05:55', 0, 918, 620, 28],
		['Mandorla', 'Anna Gatti', '06:00', 2, 940, 543, 25],
		['Corallo', 'Nico Valli', '06:05', 4, 1005, 660, 28],
		['Aurora', 'Giada Fonte', '06:10', 1, 1134, 520, 28],
		['Ghiaccio', 'Luca Moro', '06:15', 6, 1194, 515, 40],
		['Grande Cielo', 'Marta Lupi', '06:20', 3, 1342, 335, 105],
		['Valle Bassa', 'Piero Alto', '06:30', 7, 934, 908, 25],
		['Ultima Luce', 'Vera Sala', '06:40', 2, 1008, 990, 8],
	].map(([n, p, t, s, x, y, r], i) => ({ i, n, p, t, s, x, y, r }));

	const photo = $('[data-photo]');
	const card = $('[data-card]');
	const pos = $('[data-pos]');
	const count = $('[data-count]');
	const nm = (f) => `<span lang="it">${f.n}</span>`;
	const seatsText = (f) => (f.s === 0 ? LabI18n.t('vo.full', 'Al completo') : f.s === 1 ? LabI18n.t('vo.seat1', '1 posto libero') : LabI18n.t('vo.seatN', '{n} posti liberi').replace('{n}', f.s));
	const seatsCls = (f) => (f.s === 0 ? 'is-out' : f.s <= 2 ? 'is-low' : 'is-ok');
	let sel = -1;

	const pins = FLIGHTS.map((f) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'vo-pin' + (f.s === 0 ? ' is-full' : '');
		b.style.left = (f.x / PW) * 100 + '%';
		b.style.top = (f.y / PH) * 100 + '%';
		b.style.setProperty('--s', ((f.r * 2 + 18) / 16).toFixed(2) + 'cqw'); // anello più largo del pallone: non lo copre
		b.style.setProperty('--d', (f.i * 0.07).toFixed(2) + 's');
		b.setAttribute('aria-expanded', 'false');
		b.setAttribute('aria-label', `${f.n}, ${LabI18n.t('vo.at', 'decollo {t}').replace('{t}', f.t)}, ${seatsText(f)}`);
		b.innerHTML = `<i aria-hidden="true" data-name="${f.n}"></i>`;
		b.addEventListener('click', () => (sel === f.i ? close() : open(f.i)));
		photo.insertBefore(b, card);
		return b;
	});
	count.textContent = LabI18n.t('vo.count', '{n} voli').replace('{n}', FLIGHTS.length) + ' · ' + LabI18n.t('vo.hint', 'tocca un pallone');

	function place() {
		if (sel < 0) return;
		const f = FLIGHTS[sel];
		const W = photo.clientWidth;
		const H = photo.clientHeight;
		const px = (f.x / PW) * W;
		const py = (f.y / PH) * H;
		const cw = card.offsetWidth;
		const ch = card.offsetHeight;
		const gap = W < 480 ? 16 : 26;
		const left = Math.min(W - cw - 6, Math.max(6, px - cw / 2));
		const above = py - ch - gap >= 6;
		card.classList.toggle('is-below', !above);
		card.style.left = left + 'px';
		card.style.top = (above ? py - ch - gap : Math.min(H - ch - 6, py + gap)) + 'px';
		card.style.setProperty('--ax', Math.min(cw - 14, Math.max(14, px - left)) + 'px');
	}
	function open(i) {
		if (sel >= 0) {
			pins[sel].classList.remove('is-sel');
			pins[sel].setAttribute('aria-expanded', 'false');
		}
		sel = i;
		const f = FLIGHTS[i];
		pins[i].classList.add('is-sel');
		pins[i].setAttribute('aria-expanded', 'true');
		photo.classList.add('has-sel');
		card.innerHTML = `<b>${nm(f)}</b><small>${LabI18n.t('vo.pilot', 'Pilota')} <span lang="it">${f.p}</span></small><dl><div><dt>${LabI18n.t('vo.takeoff', 'Decollo')}</dt><dd>${f.t}</dd></div><div><dt>${LabI18n.t('vo.seats', 'Posti')}</dt><dd class="${seatsCls(f)}">${seatsText(f)}</dd></div></dl>`;
		card.hidden = false;
		place();
		pos.textContent = LabI18n.t('vo.of', 'Volo {i} di {n}').replace('{i}', i + 1).replace('{n}', FLIGHTS.length);
	}
	function close() {
		if (sel < 0) return;
		pins[sel].classList.remove('is-sel');
		pins[sel].setAttribute('aria-expanded', 'false');
		sel = -1;
		card.hidden = true;
		photo.classList.remove('has-sel');
		pos.textContent = LabI18n.t('vo.pick', 'Scegli un pallone');
	}

	// clic sul cielo ed Esc chiudono
	photo.addEventListener('click', (e) => {
		if (!e.target.closest('.vo-pin,.vo-card')) close();
	});
	photo.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			const s = sel;
			close();
			if (s >= 0) pins[s].focus({ preventScroll: true });
			return;
		}
		const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
		const cur = pins.indexOf(document.activeElement);
		if (!dir || cur < 0) return;
		// il pallone più vicino nella direzione premuta (cono di ±60°)
		const a = FLIGHTS[cur];
		let best = -1;
		let bd = Infinity;
		for (const f of FLIGHTS) {
			if (f === a) continue;
			const dx = f.x - a.x;
			const dy = f.y - a.y;
			const d = Math.hypot(dx, dy);
			const cos = (dx * dir[0] + dy * dir[1]) / d;
			if (cos < 0.5) continue;
			const score = d * (2 - cos);
			if (score < bd) {
				bd = score;
				best = f.i;
			}
		}
		if (best < 0) return;
		e.preventDefault();
		pins[best].focus({ preventScroll: true });
		if (sel >= 0) open(best);
	});
	document.addEventListener('click', (e) => {
		const s = e.target.closest('[data-step]');
		if (!s) return;
		const n = FLIGHTS.length;
		const d = +s.dataset.step;
		open(sel < 0 ? (d > 0 ? 0 : n - 1) : (sel + d + n) % n);
	});
	new ResizeObserver(place).observe(photo);

	// gli anelli entrano a cascata una volta sola, quando la foto è in vista
	new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { photo.classList.add('is-in'); ob.disconnect(); } }, { threshold: 0.25 }).observe(photo);
})();
