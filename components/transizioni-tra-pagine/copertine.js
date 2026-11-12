// Copertine generate da un seme fisso (mulberry32): niente immagini, niente licenze, stesso disegno a ogni caricamento.
// Copertine.svg(disco, etichetta) → stringa SVG (quadrata, viewBox 100). Copertine.colore(disco) → colore dell'etichetta del vinile.
(() => {
	const mulberry32 = (a) => () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const n = (v) => +v.toFixed(1);
	const hsl = (h, s, l) => `hsl(${Math.round(h % 360)} ${s}% ${l}%)`;

	const palette = (seed) => {
		const h = mulberry32(seed)() * 360;
		return { bg: hsl(h, 42, 16), a: hsl(h + 25, 85, 58), b: hsl(h + 170, 65, 60), c: hsl(h + 10, 30, 90) };
	};

	const tipi = {
		onde(r, p) {
			const cols = [p.a, p.b, p.c];
			let s = '';
			for (let i = 0; i < 7; i++) {
				const y = 12 + i * 13;
				const amp = 2 + r() * 5;
				const ph = r() * 6.28;
				const k = 0.06 + r() * 0.06;
				let d = '';
				for (let x = 0; x <= 100; x += 4) d += `${x ? 'L' : 'M'}${x} ${n(y + amp * Math.sin(x * k * 3 + ph))}`;
				s += `<path d="${d}" fill="none" stroke="${cols[i % 3]}" stroke-width="4.5" stroke-linecap="round"/>`;
			}
			return s;
		},
		sole(r, p) {
			const cy = 44 + r() * 8;
			const rad = 24 + r() * 6;
			let s = `<circle cx="50" cy="${n(cy)}" r="${n(rad)}" fill="${p.a}"/>`;
			for (let i = 0; i < 6; i++) s += `<rect x="0" y="${n(cy + 3 + i * 7)}" width="100" height="${n(1.2 + i * 0.9)}" fill="${p.bg}"/>`;
			return s + `<rect x="0" y="78" width="100" height="22" fill="${p.b}"/>`;
		},
		griglia(r, p) {
			const cols = [p.a, p.b, p.c];
			let s = '';
			for (let i = 0; i < 16; i++) {
				const x = (i % 4) * 25;
				const y = Math.floor(i / 4) * 25;
				const c = cols[Math.floor(r() * 3)];
				const t = Math.floor(r() * 4);
				const rot = 90 * Math.floor(r() * 4);
				const g = `transform="rotate(${rot} ${x + 12.5} ${y + 12.5})"`;
				if (t === 0) s += `<rect x="${x}" y="${y}" width="25" height="25" fill="${c}"/>`;
				else if (t === 1) s += `<circle cx="${x + 12.5}" cy="${y + 12.5}" r="10" fill="${c}"/>`;
				else if (t === 2) s += `<path d="M${x} ${y}h25a25 25 0 0 1-25 25z" fill="${c}" ${g}/>`;
				else s += `<path d="M${x} ${y + 25}a12.5 12.5 0 0 1 25 0z" fill="${c}" ${g}/>`;
			}
			return s;
		},
		archi(r, p) {
			const cols = [p.a, p.c, p.b, p.a, p.c, p.b];
			let s = '';
			for (let i = 0; i < 6; i++) s += `<circle cx="${n(46 + r() * 8)}" cy="100" r="${48 - i * 8}" fill="${cols[i]}"/>`;
			return s + `<circle cx="${n(20 + r() * 60)}" cy="${n(14 + r() * 10)}" r="6" fill="${p.c}"/>`;
		},
		triangoli(r, p) {
			const cols = [p.a, p.b, p.c, p.a, p.b];
			let s = '';
			for (let i = 0; i < 5; i++) {
				const pts = [0, 1, 2].map(() => `${n(r() * 110 - 5)},${n(r() * 110 - 5)}`).join(' ');
				s += `<polygon points="${pts}" fill="${cols[i]}" fill-opacity=".82"/>`;
			}
			return s;
		},
		cerchi(r, p) {
			const cols = [p.a, p.b, p.c, p.a, p.b];
			let s = '';
			for (let i = 0; i < 5; i++) s += `<circle cx="${n(15 + r() * 70)}" cy="${n(15 + r() * 70)}" r="${n(14 + r() * 22)}" fill="${cols[i]}" fill-opacity=".85"/>`;
			return s + `<circle cx="50" cy="50" r="40" fill="none" stroke="${p.c}" stroke-width="1.5"/>`;
		},
		punti(r, p) {
			const ox = 20 + r() * 60;
			const oy = 20 + r() * 60;
			let s = '';
			for (let i = 0; i < 100; i++) {
				const x = (i % 10) * 10 + 5;
				const y = Math.floor(i / 10) * 10 + 5;
				const rad = Math.max(0.6, 4.6 * (1 - Math.hypot(x - ox, y - oy) / 95));
				s += `<circle cx="${x}" cy="${y}" r="${n(rad)}" fill="${p.a}"/>`;
			}
			return s + `<circle cx="${n(ox)}" cy="${n(oy)}" r="9" fill="${p.c}"/>`;
		},
		strisce(r, p) {
			const cols = [p.a, p.c, p.b, p.bg, p.a];
			let s = '';
			let x = 0;
			let i = 0;
			while (x < 100) {
				const w = 6 + r() * 16;
				s += `<rect x="${n(x)}" y="0" width="${n(w + 0.3)}" height="100" fill="${cols[i++ % cols.length]}"/>`;
				x += w;
			}
			return s + `<circle cx="50" cy="50" r="17" fill="${p.bg}"/><circle cx="50" cy="50" r="9" fill="${p.a}"/>`;
		},
	};

	const svg = (disco, etichetta) => {
		const p = palette(disco.seed);
		const r = mulberry32(disco.seed);
		const aria = etichetta ? `role="img" aria-label="${etichetta.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
		return `<svg viewBox="0 0 100 100" width="400" height="400" xmlns="http://www.w3.org/2000/svg" ${aria} focusable="false"><rect width="100" height="100" fill="${p.bg}"/>${tipi[disco.tipo](r, p)}</svg>`;
	};

	window.Copertine = { svg, colore: (disco) => palette(disco.seed).a };
})();
