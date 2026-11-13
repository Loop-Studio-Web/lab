// Medusa 3D a scorrimento: tutta procedurale (nessun file 3D). Tre pezzi:
//  - la campana: mezza sfera deformata nello shader (pulsazione, bordo ondulato, canali radiali);
//  - tentacoli e braccia orali: nastri che guardano sempre la camera, posizionati dallo shader;
//  - "neve marina": puntini che salgono piano.
// Il gruppo insegue la posa della sezione visibile con uno smorzamento esponenziale.
import { THREE, createStage, damp, reduceMotion, mulberry32, smoothstep } from '../components/_shared/three/kit.js';

const stage = createStage(document.getElementById('scena'), { fov: 30, z: 12 });

if (stage) {
	const { scene, size } = stage;

	const uniforms = {
		uTime: { value: 0 },
		uPulse: { value: 0 },
		uGain: { value: 1 },
	};

	// ---------- Campana ----------
	const bell = new THREE.Mesh(
		new THREE.SphereGeometry(1, 72, 40, 0, Math.PI * 2, 0, Math.PI / 2),
		new THREE.ShaderMaterial({
			uniforms,
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			vertexShader: /* glsl */ `
				uniform float uTime;
				uniform float uPulse;
				varying vec3 vNormal;
				varying vec3 vView;
				varying float vH;
				varying float vAng;
				void main() {
					vec3 p = position;
					float h = clamp(p.y, 0.0, 1.0);                 // 0 = bordo, 1 = cima
					float rim = 1.0 - smoothstep(0.0, 0.3, h);
					float ang = atan(p.z, p.x);
					float c = uPulse;                               // 0 = rilassata, 1 = contratta
					p.xz *= 1.0 - 0.17 * c * (0.35 + 0.65 * rim);
					p.y *= 0.74 + 0.12 * c;
					p.y -= rim * (0.045 + 0.03 * c) * sin(ang * 9.0 + uTime * 1.6);
					p.xz *= 1.0 + rim * 0.035 * sin(ang * 9.0 + uTime * 1.6 + 1.2);
					vec4 mv = modelViewMatrix * vec4(p, 1.0);
					vNormal = normalize(normalMatrix * normal);
					vView = -mv.xyz;
					vH = h;
					vAng = ang;
					gl_Position = projectionMatrix * mv;
				}`,
			fragmentShader: /* glsl */ `
				uniform float uGain;
				varying vec3 vNormal;
				varying vec3 vView;
				varying float vH;
				varying float vAng;
				void main() {
					float facing = abs(dot(normalize(vNormal), normalize(vView)));
					float fres = pow(1.0 - facing, 2.0);
					vec3 deep = vec3(0.55, 0.05, 0.07);
					vec3 red = vec3(1.0, 0.23, 0.19);
					vec3 col = mix(deep, red, smoothstep(0.0, 0.9, vH));
					col = mix(col, vec3(1.0, 0.88, 0.86), fres * 0.85);
					// canali radiali sotto la pelle
					float seg = 6.2831853 / 20.0;
					float dLine = 0.5 - abs(fract(vAng / seg) - 0.5);
					float line = (1.0 - smoothstep(0.0, 0.05, dLine)) * (1.0 - vH * 0.55);
					// quattro gonadi a ferro di cavallo
					float gon = (1.0 - smoothstep(0.0, 0.1, abs(vH - 0.62))) * smoothstep(0.25, 0.95, 0.5 + 0.5 * cos(vAng * 4.0));
					col += vec3(1.0, 0.9, 0.88) * (line * 0.45 + gon * 0.7);
					float alpha = (0.18 + 0.55 * fres + line * 0.35 + gon * 0.5) * uGain;
					gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
				}`,
		}),
	);
	bell.renderOrder = 2;

	// ---------- Tentacoli e braccia: nastri che guardano la camera ----------
	const ribbons = ({ count, segs, seed, radius, len, width, arm }) => {
		const rnd = mulberry32(seed);
		const attr = { T: [], S: [], A: [], L: [], P: [], W: [], R: [] };
		const idx = [];
		for (let i = 0; i < count; i++) {
			const ang = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.25;
			const L = len[0] + rnd() * (len[1] - len[0]);
			const P = rnd() * Math.PI * 2;
			const W = width[0] + rnd() * (width[1] - width[0]);
			const R = radius[0] + rnd() * (radius[1] - radius[0]);
			for (let j = 0; j <= segs; j++) {
				for (const side of [-1, 1]) {
					attr.T.push(j / segs);
					attr.S.push(side);
					attr.A.push(ang);
					attr.L.push(L);
					attr.P.push(P);
					attr.W.push(W);
					attr.R.push(R);
				}
				if (j < segs) {
					const b = i * (segs + 1) * 2 + j * 2;
					idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
				}
			}
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(attr.T.length * 3), 3));
		geo.setAttribute('aT', new THREE.Float32BufferAttribute(attr.T, 1));
		geo.setAttribute('aSide', new THREE.Float32BufferAttribute(attr.S, 1));
		geo.setAttribute('aAng', new THREE.Float32BufferAttribute(attr.A, 1));
		geo.setAttribute('aLen', new THREE.Float32BufferAttribute(attr.L, 1));
		geo.setAttribute('aPh', new THREE.Float32BufferAttribute(attr.P, 1));
		geo.setAttribute('aW', new THREE.Float32BufferAttribute(attr.W, 1));
		geo.setAttribute('aR', new THREE.Float32BufferAttribute(attr.R, 1));
		geo.setIndex(idx);

		const mesh = new THREE.Mesh(
			geo,
			new THREE.ShaderMaterial({
				uniforms: { ...uniforms, uArm: { value: arm ? 1 : 0 } },
				transparent: true,
				depthWrite: false,
				side: THREE.DoubleSide,
				vertexShader: /* glsl */ `
					attribute float aT, aSide, aAng, aLen, aPh, aW, aR;
					uniform float uTime, uPulse, uArm;
					varying float vT;
					varying float vSide;
					void main() {
						float t = aT;
						float c = uPulse;
						vec3 p = vec3(cos(aAng), 0.0, sin(aAng)) * aR * (1.0 - 0.16 * c);
						p.y = -t * aLen * (1.0 - 0.1 * c);
						float a1 = sin(t * 5.0 - uTime * 2.2 + aPh) * (0.1 + 0.35 * t) * t;
						float a2 = cos(t * 4.0 - uTime * 1.7 + aPh * 1.7) * (0.1 + 0.3 * t) * t;
						p.x += a1 + cos(aAng) * t * (0.18 + 0.22 * c);
						p.z += a2 + sin(aAng) * t * (0.18 + 0.22 * c);
						vec4 mv = modelViewMatrix * vec4(p, 1.0);
						float w = aW * (1.0 - 0.75 * t);
						w *= 1.0 + uArm * 0.7 * sin(t * 26.0 + aPh);   // le braccia sono arricciate
						mv.x += aSide * w;
						vT = t;
						vSide = aSide;
						gl_Position = projectionMatrix * mv;
					}`,
				fragmentShader: /* glsl */ `
					uniform float uGain, uArm;
					varying float vT;
					varying float vSide;
					void main() {
						vec3 top = mix(vec3(1.0, 0.93, 0.9), vec3(1.0, 0.7, 0.66), uArm);
						vec3 tip = vec3(1.0, 0.23, 0.19);
						vec3 col = mix(top, tip, smoothstep(0.0, 0.85, vT));
						float edge = 1.0 - pow(abs(vSide), 2.0) * 0.55;
						float alpha = (1.0 - vT * vT) * mix(0.6, 0.85, uArm) * edge * uGain;
						gl_FragColor = vec4(col, alpha);
					}`,
			}),
		);
		mesh.frustumCulled = false;
		mesh.renderOrder = 1;
		return mesh;
	};

	const tentacles = ribbons({ count: 30, segs: 36, seed: 7, radius: [0.82, 0.95], len: [1.7, 2.9], width: [0.012, 0.022] });
	const arms = ribbons({ count: 4, segs: 44, seed: 21, radius: [0.1, 0.22], len: [1.5, 2.1], width: [0.07, 0.1], arm: true });

	const medusa = new THREE.Group();
	medusa.add(tentacles, arms, bell);
	medusa.rotation.order = 'YXZ';
	scene.add(medusa);

	// ---------- Neve marina ----------
	const rnd = mulberry32(99);
	const N = 150;
	const pos = new Float32Array(N * 3);
	const seed = new Float32Array(N);
	for (let i = 0; i < N; i++) {
		pos.set([(rnd() - 0.5) * 11, (rnd() - 0.5) * 8, rnd() * 7 - 3], i * 3);
		seed[i] = rnd();
	}
	const snowGeo = new THREE.BufferGeometry();
	snowGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	snowGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
	const snow = new THREE.Points(
		snowGeo,
		new THREE.ShaderMaterial({
			uniforms: { ...uniforms, uDpr: { value: Math.min(window.devicePixelRatio || 1, 1.75) } },
			transparent: true,
			depthWrite: false,
			vertexShader: /* glsl */ `
				attribute float aSeed;
				uniform float uTime, uDpr;
				void main() {
					vec3 p = position;
					p.y = mod(p.y + uTime * (0.08 + aSeed * 0.12) + 4.0, 8.0) - 4.0;
					p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.12;
					vec4 mv = modelViewMatrix * vec4(p, 1.0);
					gl_PointSize = (2.0 + aSeed * 3.5) * uDpr * (9.0 / -mv.z);
					gl_Position = projectionMatrix * mv;
				}`,
			fragmentShader: /* glsl */ `
				uniform float uGain;
				void main() {
					float d = length(gl_PointCoord - 0.5);
					float a = (1.0 - smoothstep(0.05, 0.5, d)) * 0.4 * uGain;
					gl_FragColor = vec4(0.85, 1.0, 0.98, a);
				}`,
		}),
	);
	snow.renderOrder = 0;
	scene.add(snow);

	// ---------- Pose: una per sezione (x e y in frazione di metà riquadro) ----------
	const POSES = {
		banner: { x: 0, y: -0.58, s: 1.05, tilt: 0, turn: 0 },
		intro: { x: 0.52, y: 0.02, s: 0.9, tilt: -0.28, turn: 0.7 },
		leggera: { x: -0.52, y: 0.05, s: 0.9, tilt: 0.28, turn: -0.7 },
		contatti: { x: 0, y: 0.3, s: 0.8, tilt: 0.06, turn: 0.25 },
	};
	const sezioni = [...document.querySelectorAll('.sezione')];
	let active = 'banner';
	const pick = () => {
		const mid = innerHeight / 2;
		let bestD = Infinity;
		for (const s of sezioni) {
			const r = s.getBoundingClientRect();
			const d = Math.abs(r.top + r.height / 2 - mid);
			if (d < bestD) {
				bestD = d;
				active = s.id;
			}
		}
	};
	addEventListener('scroll', pick, { passive: true });
	pick();

	// Posa iniziale già a posto: niente volo d'ingresso da un angolo.
	// baseY tiene la posizione "ferma": l'ondeggiamento del nuoto si somma solo alla fine,
	// altrimenti lo smorzamento lo rileggerebbe a ogni fotogramma e la medusa deriverebbe.
	let placed = false;
	let baseY = 0;

	stage.onFrame((dt, t) => {
		const calm = reduceMotion.matches;

		// Pulsazione: contrazione veloce, rilascio lento.
		const phase = (t * (calm ? 0.45 : 0.78)) % 1;
		const c = (smoothstep(0, 0.26, phase) - smoothstep(0.26, 1, phase)) * (calm ? 0.4 : 1);
		uniforms.uTime.value = t * (calm ? 0.5 : 1);
		uniforms.uPulse.value = c;

		const narrow = size.aspect < 0.85;
		const P = POSES[active] ?? POSES.banner;
		const tx = P.x * (narrow ? 0.2 : 1) * (size.visW / 2);
		const ty = P.y * (size.visH / 2);
		const ts = P.s * (narrow ? 0.78 : 1);
		const lambda = placed ? (calm ? 8 : 1.8) : 100;
		placed = true;

		medusa.position.x = damp(medusa.position.x, tx, lambda, dt);
		baseY = damp(baseY, ty, lambda, dt);
		medusa.scale.setScalar(damp(medusa.scale.x, ts, lambda, dt));
		medusa.rotation.z = damp(medusa.rotation.z, P.tilt, lambda, dt);
		medusa.rotation.y = damp(medusa.rotation.y, P.turn, lambda, dt);
		medusa.rotation.x = -0.2;

		// Nuota: sale un po' a ogni contrazione, ondeggia piano.
		medusa.position.y = baseY + (0.1 * c + 0.05 * Math.sin(t * 0.6)) * (calm ? 0.3 : 1);

		// Sui telefoni la medusa sta dietro ai testi: più trasparente.
		uniforms.uGain.value = damp(uniforms.uGain.value, narrow ? 0.62 : 1, 3, dt);
	});
}
