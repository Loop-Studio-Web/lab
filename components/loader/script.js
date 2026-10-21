const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const ease = (t) => 1 - Math.pow(1 - t, 3);

// Un avanzamento finto: scorre fino a `target` in `ms` millisecondi con una
// curva che rallenta verso la fine, come succede davvero nei caricamenti.
function run(ms, target, onTick) {
	if (reduced.matches) return onTick(target);
	const t0 = performance.now();
	const step = (now) => {
		const t = Math.min((now - t0) / ms, 1);
		onTick(target * ease(t));
		if (t < 1) requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}

const ring = document.querySelector('[data-ring]');
const ringBar = ring.querySelector('[data-ring-bar]');
const ringNum = ring.querySelector('[data-ring-num]');
function playRing() {
	run(2400, 100, (v) => {
		ringBar.style.strokeDashoffset = String(100 - v);
		ringNum.textContent = String(Math.round(v));
		ring.setAttribute('aria-valuenow', String(Math.round(v)));
	});
}

const bar = document.querySelector('[data-bar]');
const barFill = bar.querySelector('[data-bar-fill]');
const barNum = bar.querySelector('[data-bar-num]');
function playBar() {
	run(3200, 100, (v) => {
		barFill.style.transform = `scaleX(${v / 100})`;
		barNum.textContent = `${Math.round(v)}%`;
		bar.setAttribute('aria-valuenow', String(Math.round(v)));
	});
}

const plays = { ring: playRing, bar: playBar };
document.querySelectorAll('[data-replay]').forEach((b) => b.addEventListener('click', () => plays[b.dataset.replay]()));

// Partono quando la sezione entra nello schermo (non prima: nessuno le vedrebbe).
const io = new IntersectionObserver((entries) => {
	for (const e of entries) {
		if (!e.isIntersecting) continue;
		plays[e.target.dataset.auto]();
		io.unobserve(e.target);
	}
}, { threshold: 0.4 });
ring.dataset.auto = 'ring';
bar.dataset.auto = 'bar';
io.observe(ring);
io.observe(bar);
