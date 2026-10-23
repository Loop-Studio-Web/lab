// Infinito 3D a scorrimento: i due anelli del nostro marchio, estrusi dai path SVG veri.
// Lo scroll della pagina (0-1 sul palco "sticky") interpola una serie di pose chiave;
// il risultato viene inseguito con smorzamento, così la scena ha inerzia e non scatta.
import { THREE, createStage, damp, reduceMotion, smoothstep } from '../components/_shared/three/kit.js';
import { RoomEnvironment } from '../components/_shared/three/RoomEnvironment.min.js';
import { ANELLO_ROSSO, ANELLO_BIANCO } from './marchio.js';

const stage = createStage(document.getElementById('scena'), { fov: 30, z: 12 });

if (stage) {
	const { scene, renderer, size } = stage;

	// Riflessi: ambiente di studio generato in codice (nessuna immagine HDR da scaricare).
	const pmrem = new THREE.PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.85;

	// ---------- Anelli: contorni puliti del marchio → estrusione smussata ----------
	// (I path SVG originali si sovrappongono a sé stessi nell'incrocio e rompono la triangolazione:
	// i contorni in marchio.js sono già risolti, vedi il commento in quel file.)
	const extrude = ({ outer, holes }) => {
		const v = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
		const shape = new THREE.Shape(v(outer));
		for (const h of holes) shape.holes.push(new THREE.Path(v(h)));
		return new THREE.ExtrudeGeometry(shape, {
			depth: 70,
			bevelEnabled: true,
			bevelThickness: 20,
			bevelSize: 15,
			bevelSegments: 6,
			curveSegments: 1,
		});
	};
	const gRed = extrude(ANELLO_ROSSO);
	const gWhite = extrude(ANELLO_BIANCO);

	// Centro e scala comuni: gli anelli restano nella posizione relativa del logo.
	const box = new THREE.Box3().union(new THREE.Box3().setFromBufferAttribute(gRed.attributes.position)).union(
		new THREE.Box3().setFromBufferAttribute(gWhite.attributes.position),
	);
	const c = box.getCenter(new THREE.Vector3());
	const width = box.max.x - box.min.x;
	for (const g of [gRed, gWhite]) g.translate(-c.x, -c.y, -c.z);

	const matRed = new THREE.MeshPhysicalMaterial({
		color: '#f2180d',
		roughness: 0.34,
		metalness: 0.0,
		clearcoat: 0.8,
		clearcoatRoughness: 0.15,
		envMapIntensity: 0.5,
	});
	const matWhite = new THREE.MeshPhysicalMaterial({
		color: '#f3f3f3',
		roughness: 0.38,
		metalness: 0.0,
		clearcoat: 0.6,
		clearcoatRoughness: 0.2,
		envMapIntensity: 0.8,
	});
	const red = new THREE.Mesh(gRed, matRed);
	const white = new THREE.Mesh(gWhite, matWhite);

	const logo = new THREE.Group(); // rotazione e scala dell'insieme
	const pivotRed = new THREE.Group();
	const pivotWhite = new THREE.Group();
	pivotRed.add(red);
	pivotWhite.add(white);
	logo.add(pivotRed, pivotWhite);
	const unit = 4.4 / width; // larghezza del marchio nel mondo = 4,4 unità a scala 1
	logo.scale.setScalar(unit);
	const holder = new THREE.Group();
	holder.add(logo);
	scene.add(holder);

	// Luci: una principale morbida e una controluce calda che richiama il nucleo del tunnel.
	const key = new THREE.DirectionalLight('#ffffff', 1.1);
	key.position.set(3, 4, 6);
	scene.add(key);
	const rim = new THREE.PointLight('#ff6a3d', 40, 20);
	rim.position.set(-3, 1, -4);
	scene.add(rim);

	// ---------- Pose chiave sullo scroll ----------
	// ry/rx: rotazione dell'insieme; s: scala; dx: distanza orizzontale di ciascun anello dal marchio
	// montato; sep: separazione in profondità; tz: rotazione opposta dei due anelli.
	const TAU = Math.PI * 2;
	const KEYS = [
		{ p: 0.0, ry: 1.1, rx: 0.35, s: 0.75, dx: 4.6, sep: 0, tz: 0.6 },
		{ p: 0.17, ry: 0, rx: 0, s: 1, dx: 0, sep: 0, tz: 0 },
		{ p: 0.4, ry: TAU, rx: 0, s: 1.12, dx: 0, sep: 0, tz: 0 },
		{ p: 0.62, ry: TAU + 0.55, rx: -0.42, s: 1.05, dx: 0, sep: 1.5, tz: 0.16 },
		{ p: 0.82, ry: TAU, rx: 0, s: 1.15, dx: 0, sep: 0, tz: 0 },
		{ p: 1.0, ry: TAU, rx: 0, s: 1.25, dx: 0, sep: 0, tz: 0 },
	];
	const at = (p) => {
		let i = 0;
		while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
		const a = KEYS[i];
		const b = KEYS[i + 1];
		const t = smoothstep(a.p, b.p, p);
		const out = {};
		for (const k of ['ry', 'rx', 's', 'dx', 'sep', 'tz']) out[k] = a[k] + (b[k] - a[k]) * t;
		return out;
	};

	// ---------- Scroll e didascalie ----------
	const corsa = document.querySelector('.corsa');
	const didascalie = [...document.querySelectorAll('.didascalia')];
	const suggerimento = document.querySelector('.suggerimento');
	let progress = 0;
	let active = -1;
	const SOGLIE = [0.0, 0.23, 0.5, 0.75];
	const read = () => {
		const r = corsa.getBoundingClientRect();
		const total = r.height - innerHeight;
		progress = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
		let i = 0;
		SOGLIE.forEach((s, k) => progress >= s && (i = k));
		if (i !== active) {
			active = i;
			didascalie.forEach((d, k) => d.classList.toggle('is-on', k === i));
		}
		suggerimento.classList.toggle('is-off', progress > 0.02);
	};
	addEventListener('scroll', read, { passive: true });
	read();

	// Stato attuale (inseguito) delle pose.
	const cur = { ...at(progress) };
	let first = true;

	stage.onFrame((dt, t) => {
		const calm = reduceMotion.matches;
		const want = at(progress);
		const lambda = first ? 100 : calm ? 9 : 4.5;
		first = false;
		for (const k of Object.keys(want)) cur[k] = damp(cur[k], want[k], lambda, dt);

		const narrow = size.aspect < 0.85;
		const fit = narrow ? 0.62 : 1;
		const float = calm ? 0 : Math.sin(t * 0.8) * 0.06;

		logo.rotation.y = cur.ry;
		logo.rotation.x = cur.rx;
		holder.scale.setScalar(cur.s * fit);
		holder.position.y = float;
		pivotRed.position.x = -cur.dx / unit;
		pivotWhite.position.x = cur.dx / unit;
		pivotRed.position.z = cur.sep / unit;
		pivotWhite.position.z = -cur.sep / unit;
		pivotRed.rotation.z = cur.tz;
		pivotWhite.rotation.z = -cur.tz;
	});
}
