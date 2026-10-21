// Le animazioni continue (CSS e SMIL del filtro elettrico) girano solo mentre
// la loro sezione è visibile, e restano ferme con prefers-reduced-motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const smil = document.querySelector('[data-smil]');

const setSmil = () => {
	const visible = document.querySelector('.stage--electric').classList.contains('is-live');
	if (visible && !reduce.matches) smil.unpauseAnimations();
	else smil.pauseAnimations();
};

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
		setSmil();
	},
	{ rootMargin: '80px' },
);
document.querySelectorAll('.stage').forEach((s) => observer.observe(s));
reduce.addEventListener('change', setSmil);
