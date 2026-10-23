// Farfalla 3D interattiva, tutta procedurale (nessun file 3D).
//  - ali: griglia polare dalla radice dell'ala, contorno da punti di controllo, motivo (nervature, bordo,
//    puntini, occhio) disegnato nello shader; battito con curvatura che fa "frustare" le punte;
//  - corpo, testa, occhi, antenne e zampe: geometrie semplici di three;
//  - volo: figura a otto da sola, insegue il puntatore quando si muove; il clic sulla farfalla
//    (o i bottoni) cambia i colori delle ali con un colpo d'ali.
import { THREE, createStage, damp, reduceMotion } from '../components/_shared/three/kit.js';

const stage = createStage(document.getElementById('scena'), { fov: 30, z: 12 });

if (stage) {
	const { scene, size } = stage;
	const deg = Math.PI / 180;

	// ---------- Colori delle ali: A interno, B esterno, C chiaro (puntini, riflessi), D scuro (bordo, nervature) ----------
	const COLORWAYS = [
		{ A: '#ff3b30', B: '#a3120b', C: '#ffffff', D: '#150707' },
		{ A: '#eaf6ff', B: '#4b9dff', C: '#ffffff', D: '#0b1630' },
		{ A: '#ffb02e', B: '#e85d00', C: '#fff3cf', D: '#2a1200' },
		{ A: '#8a5cff', B: '#22d3ee', C: '#efe9ff', D: '#0b0720' },
	];
	const wingColors = {
		uA: { value: new THREE.Color(COLORWAYS[0].A) },
		uB: { value: new THREE.Color(COLORWAYS[0].B) },
		uC: { value: new THREE.Color(COLORWAYS[0].C) },
		uD: { value: new THREE.Color(COLORWAYS[0].D) },
	};
	const target = Object.fromEntries(Object.keys(wingColors).map((k) => [k, new THREE.Color(wingColors[k].value)]));
	let colorIndex = 0;
	const setColorway = (i) => {
		colorIndex = i;
		const c = COLORWAYS[i];
		for (const k of ['A', 'B', 'C', 'D']) target['u' + k].set(c[k]);
		buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
	};

	// ---------- Ali ----------
	// Contorno: punti di controllo [angolo in gradi, raggio], interpolati con coseno (dolce, senza angoli).
	const outline = (pts) => (a) => {
		for (let i = 0; i < pts.length - 1; i++) {
			const [a0, r0] = pts[i];
			const [a1, r1] = pts[i + 1];
			if (a >= a0 && a <= a1) {
				const t = (1 - Math.cos(((a - a0) / (a1 - a0)) * Math.PI)) / 2;
				return r0 + (r1 - r0) * t;
			}
		}
		return pts[pts.length - 1][1];
	};
	const foreOutline = outline([
		[-14, 0.85],
		[0, 1.2],
		[18, 1.65],
		[36, 1.98],
		[54, 1.78],
		[74, 1.3],
		[102, 0.6],
	]);
	const hindOutline = outline([
		[-128, 0.45],
		[-112, 0.8],
		[-92, 1.0],
		[-76, 1.3], // coda
		[-62, 1.05],
		[-44, 1.12],
		[-26, 1.0],
		[-8, 0.8],
	]);

	const wingGeometry = (fn, a0, a1, nA = 56, nR = 22) => {
		const pos = [];
		const polar = [];
		const idx = [];
		for (let i = 0; i <= nA; i++) {
			const t = i / nA;
			const ang = (a0 + (a1 - a0) * t) * deg;
			const R = fn(a0 + (a1 - a0) * t);
			for (let j = 0; j <= nR; j++) {
				const s = j / nR;
				pos.push(Math.cos(ang) * R * s, Math.sin(ang) * R * s, 0);
				polar.push(s, t);
			}
		}
		for (let i = 0; i < nA; i++) {
			for (let j = 0; j < nR; j++) {
				const a = i * (nR + 1) + j;
				const b = a + nR + 1;
				idx.push(a, b, a + 1, b, b + 1, a + 1);
			}
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		g.setAttribute('aPolar', new THREE.Float32BufferAttribute(polar, 2));
		g.setIndex(idx);
		return g;
	};

	const wingUniforms = { uBend: { value: 0 }, ...wingColors };
	const wingMaterial = (hind) =>
		new THREE.ShaderMaterial({
			uniforms: { ...wingUniforms, uHind: { value: hind ? 1 : 0 } },
			side: THREE.DoubleSide,
			transparent: true,
			polygonOffset: true,
			polygonOffsetFactor: hind ? 2 : 0,
			polygonOffsetUnits: hind ? 2 : 0,
			vertexShader: /* glsl */ `
				attribute vec2 aPolar;
				uniform float uBend;
				varying vec2 vP;
				varying float vFacing;
				void main() {
					vP = aPolar;
					vec3 p = position;
					float d = length(p.xy);
					p.z += uBend * d * d * 0.2;                 // le punte seguono in ritardo il battito
					vec4 mv = modelViewMatrix * vec4(p, 1.0);
					vFacing = abs(normalize(normalMatrix * vec3(0.0, 0.0, 1.0)).z);
					gl_Position = projectionMatrix * mv;
				}`,
			fragmentShader: /* glsl */ `
				uniform vec3 uA, uB, uC, uD;
				uniform float uHind;
				varying vec2 vP;     // x = distanza dalla radice (0-1), y = posizione lungo il bordo (0-1)
				varying float vFacing;
				void main() {
					float s = vP.x;
					float t = vP.y;
					vec3 col = mix(uA, uB, smoothstep(0.1, 0.9, s));
					// nervature: raggi dalla radice
					float veins = smoothstep(0.0, 0.08, abs(fract(t * 10.0) - 0.5) - 0.42);
					col = mix(col, uD, veins * 0.5 * smoothstep(0.08, 0.35, s));
					// bordo scuro con puntini chiari
					float band = smoothstep(0.78, 0.88, s);
					col = mix(col, uD, band);
					float dots = (1.0 - smoothstep(0.2, 0.34, length(vec2((fract(t * 18.0) - 0.5) * 1.0, (s - 0.935) * 7.0))));
					col = mix(col, uC, dots * step(0.8, s));
					// occhio sulla seconda ala
					if (uHind > 0.5) {
						float d = length(vec2((t - 0.42) * 1.5, (s - 0.58) * 1.15));
						col = mix(col, uD, (1.0 - smoothstep(0.17, 0.2, d)));
						col = mix(col, uC, (1.0 - smoothstep(0.11, 0.14, d)));
						col = mix(col, uD, (1.0 - smoothstep(0.06, 0.085, d)));
						col += uC * (1.0 - smoothstep(0.0, 0.03, length(vec2((t - 0.4) * 1.5, (s - 0.62) * 1.15)))) * 0.8;
					}
					// peluria scura vicino al corpo
					col = mix(uD, col, smoothstep(0.0, 0.22, s));
					// riflesso morbido e bordo sfumato
					col *= 0.82 + 0.28 * smoothstep(0.2, 0.8, s) * (0.6 + 0.4 * vFacing);
					float alpha = (1.0 - smoothstep(0.975, 1.0, s));
					gl_FragColor = vec4(col, alpha);
				}`,
		});

	const foreGeo = wingGeometry(foreOutline, -14, 102);
	const hindGeo = wingGeometry(hindOutline, -128, -8);
	const foreMat = wingMaterial(false);
	const hindMat = wingMaterial(true);

	const makeWing = (mirror) => {
		const pivot = new THREE.Group();
		const fore = new THREE.Mesh(foreGeo, foreMat);
		const hind = new THREE.Mesh(hindGeo, hindMat);
		fore.position.set(0.04, 0.22, 0.01);
		hind.position.set(0.04, 0.02, 0);
		pivot.add(hind, fore);
		if (mirror) pivot.scale.x = -1;
		return pivot;
	};
	const wingR = makeWing(false);
	const wingL = makeWing(true);

	// ---------- Corpo ----------
	const bodyMat = new THREE.MeshStandardMaterial({ color: '#1b1210', roughness: 0.75, metalness: 0.05 });
	const furMat = new THREE.MeshStandardMaterial({ color: '#35201b', roughness: 1 });
	const eyeMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.12, metalness: 0.4 });
	const ellipsoid = (mat, sx, sy, sz, x, y, z) => {
		const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), mat);
		m.scale.set(sx, sy, sz);
		m.position.set(x, y, z);
		return m;
	};
	const tube = (points, radius, mat, seg = 24) =>
		new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), seg, radius, 6), mat);

	const body = new THREE.Group();
	body.add(
		ellipsoid(bodyMat, 0.085, 0.62, 0.085, 0, -0.62, 0), // addome
		ellipsoid(furMat, 0.15, 0.3, 0.14, 0, 0.14, 0), // torace
		ellipsoid(furMat, 0.105, 0.11, 0.1, 0, 0.47, 0.02), // testa
		ellipsoid(eyeMat, 0.052, 0.058, 0.05, 0.075, 0.5, 0.06),
		ellipsoid(eyeMat, 0.052, 0.058, 0.05, -0.075, 0.5, 0.06),
	);
	for (const side of [-1, 1]) {
		body.add(
			tube([[0.03 * side, 0.56, 0.05], [0.18 * side, 1.0, 0.12], [0.44 * side, 1.38, 0.08], [0.58 * side, 1.5, 0.02]], 0.011, bodyMat),
			ellipsoid(bodyMat, 0.03, 0.045, 0.03, 0.59 * side, 1.51, 0.02),
		);
		for (const k of [0, 1, 2]) {
			body.add(tube([[0.05 * side, 0.2 - k * 0.1, -0.04], [0.2 * side, 0.1 - k * 0.14, -0.14], [0.26 * side, -0.1 - k * 0.14, -0.2]], 0.008, bodyMat, 10));
		}
	}

	const butterfly = new THREE.Group(); // posizione e rotta
	const inner = new THREE.Group(); // inclinazione e rollio
	inner.rotation.order = 'XYZ';
	inner.add(body, wingR, wingL);
	inner.scale.setScalar(1.15);
	butterfly.add(inner);
	scene.add(butterfly);

	scene.add(new THREE.AmbientLight('#ffffff', 0.9));
	const sun = new THREE.DirectionalLight('#fff4e0', 1.4);
	sun.position.set(2, 4, 6);
	scene.add(sun);

	// ---------- Interazione ----------
	const buttons = [...document.querySelectorAll('.colore')];
	buttons.forEach((b, i) =>
		b.addEventListener('click', () => {
			setColorway(i);
			burst = 1;
		}),
	);

	const pointer = { x: 0, y: 0, lastMove: -10, inside: false };
	let burst = 0;
	addEventListener('pointermove', (e) => {
		pointer.x = (e.clientX / innerWidth) * 2 - 1;
		pointer.y = -((e.clientY / innerHeight) * 2 - 1);
		pointer.lastMove = performance.now() / 1000;
		pointer.inside = true;
	});
	document.addEventListener('pointerleave', () => (pointer.inside = false));
	addEventListener('pointerdown', (e) => {
		if (e.target.closest('.colore')) return;
		const px = (e.clientX / innerWidth) * 2 - 1;
		const py = -((e.clientY / innerHeight) * 2 - 1);
		// colpo sulla farfalla: distanza in unità di mondo dalla sua posizione attuale
		const wx = px * (size.visW / 2) - butterfly.position.x;
		const wy = py * (size.visH / 2) - butterfly.position.y;
		if (Math.hypot(wx, wy) < 1.5) {
			setColorway((colorIndex + 1) % COLORWAYS.length);
			burst = 1;
		}
	});

	// ---------- Volo ----------
	let phase = 0;
	let heading = 0;
	let bank = 0;
	const vel = { x: 0, y: 0 };
	const prev = { x: 0, y: 0 };

	stage.onFrame((dt, t) => {
		const calm = reduceMotion.matches;
		const now = performance.now() / 1000;

		// Dove vuole andare: il puntatore se si è mosso da poco, altrimenti una figura a otto.
		const chase = !calm && pointer.inside && now - pointer.lastMove < 2.2;
		const A = size.visW * (calm ? 0.05 : 0.16);
		const B = size.visH * (calm ? 0.04 : 0.12);
		const tx = chase ? pointer.x * (size.visW / 2) * 0.92 : Math.sin(t * 0.42) * A;
		const ty = chase ? pointer.y * (size.visH / 2) * 0.92 : Math.sin(t * 0.84 + 0.8) * B - size.visH * 0.04;
		const lambda = chase ? 2.4 : 1.4;

		butterfly.position.x = damp(butterfly.position.x, tx, lambda, dt);
		butterfly.position.y = damp(butterfly.position.y, ty, lambda, dt);
		butterfly.position.z = damp(butterfly.position.z, chase ? 0.6 : 0, 1.5, dt);

		vel.x = (butterfly.position.x - prev.x) / Math.max(dt, 1e-4);
		vel.y = (butterfly.position.y - prev.y) / Math.max(dt, 1e-4);
		prev.x = butterfly.position.x;
		prev.y = butterfly.position.y;
		const speed = Math.hypot(vel.x, vel.y);

		// Prua verso la direzione di volo (angolo più corto), rollio nelle curve.
		if (speed > 0.25) {
			const want = Math.atan2(-vel.x, vel.y);
			let d = want - heading;
			d = Math.atan2(Math.sin(d), Math.cos(d));
			heading += d * (1 - Math.exp(-2.2 * dt));
		}
		butterfly.rotation.z = heading;
		bank = damp(bank, Math.max(-0.6, Math.min(0.6, -vel.x * 0.12)), 3, dt);
		inner.scale.setScalar(damp(inner.scale.x, size.aspect < 0.85 ? 0.62 : 1.15, 6, dt));
		inner.rotation.x = -0.7;
		inner.rotation.y = bank;

		// Battito: più rapido e ampio quando corre o dopo un clic.
		burst = damp(burst, 0, 2.4, dt);
		const freq = calm ? 1.1 : 2.4 + Math.min(speed * 0.9, 2.2) + burst * 3;
		const amp = calm ? 0.3 : 0.75 + Math.min(speed * 0.08, 0.2) + burst * 0.2;
		phase += dt * freq * Math.PI * 2;
		const flap = -0.3 - amp * (Math.sin(phase) + 0.18 * Math.sin(phase * 2));
		wingR.rotation.y = flap;
		wingL.rotation.y = -flap;
		wingUniforms.uBend.value = -Math.cos(phase) * amp * 0.9; // la punta segue con ritardo
		body.position.z = Math.sin(phase) * 0.03; // il corpo sobbalza appena

		// Colori: transizione morbida verso il bersaglio.
		for (const k of Object.keys(wingColors)) {
			const c = wingColors[k].value;
			c.r = damp(c.r, target[k].r, 6, dt);
			c.g = damp(c.g, target[k].g, 6, dt);
			c.b = damp(c.b, target[k].b, 6, dt);
		}
	});
}
