// Base comune delle scene three.js del Lab: renderer, camera, ciclo di disegno e piccoli
// aiuti. Ogni scena importa solo ciò che le serve; three arriva dall'import map della pagina.
// Il ciclo si ferma da solo quando la scheda è nascosta o la scena esce dallo schermo.
import * as THREE from 'three';

export { THREE };

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Inseguimento esponenziale: avvicina `current` a `target` in modo indipendente dai fotogrammi.
// Se il bersaglio cambia a metà strada riparte dal valore attuale (niente scatti), come una transition.
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export const smoothstep = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

// Generatore con seme fisso: stessa scena a ogni caricamento.
export const mulberry32 = (seed) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// onDemand: disegna solo quando una funzione di onFrame restituisce true (o dopo un ridimensionamento / invalidate()):
// per le scene che da ferme non cambiano, così la GPU e il thread principale restano liberi.
export function createStage(container, { fov = 30, z = 12, maxDpr = 1.75, antialias = true, onDemand = false } = {}) {
	let renderer;
	try {
		renderer = new THREE.WebGLRenderer({ alpha: true, antialias, powerPreference: 'high-performance' });
	} catch {
		container.dataset.nogl = '';
		return null;
	}
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
	renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
	container.append(renderer.domElement);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
	camera.position.z = z;

	// size.visW / visH: dimensioni del mondo visibili sul piano z = 0, per posizionare gli oggetti in proporzione al riquadro.
	const size = { w: 1, h: 1, aspect: 1, visW: 1, visH: 1 };
	let dirty = true;
	const fit = () => {
		const r = container.getBoundingClientRect();
		size.w = Math.max(1, Math.round(r.width));
		size.h = Math.max(1, Math.round(r.height));
		size.aspect = size.w / size.h;
		renderer.setSize(size.w, size.h, false);
		camera.aspect = size.aspect;
		camera.updateProjectionMatrix();
		dirty = true;
		size.visH = 2 * Math.tan((fov * Math.PI) / 360) * z;
		size.visW = size.visH * size.aspect;
	};
	new ResizeObserver(fit).observe(container);
	fit();

	const frames = [];
	let last = 0;
	let time = 0;
	let raf = 0;
	let inView = true;
	let live = false;

	const loop = (now) => {
		raf = requestAnimationFrame(loop);
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		time += dt;
		let moving = false;
		for (const fn of frames) if (fn(dt, time) === true) moving = true;
		if (onDemand && !moving && !dirty) return;
		dirty = false;
		renderer.render(scene, camera);
		if (!live) {
			live = true;
			// Dal secondo disegno: la scena vera è sullo schermo e il poster (se c'è) può sparire.
			requestAnimationFrame(() => container.classList.add('is-live'));
		}
	};
	const start = () => {
		if (raf || document.hidden || !inView) return;
		last = performance.now();
		raf = requestAnimationFrame(loop);
	};
	const stop = () => {
		cancelAnimationFrame(raf);
		raf = 0;
	};
	document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
	new IntersectionObserver(([entry]) => {
		inView = entry.isIntersecting;
		inView ? start() : stop();
	}).observe(container);
	start();

	return {
		renderer,
		scene,
		camera,
		size,
		onFrame: (fn) => frames.push(fn),
		invalidate: () => (dirty = true),
	};
}
