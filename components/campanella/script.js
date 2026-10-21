// Campanella grande: accende e spegne la lampada.
const bell = document.querySelector('[data-bell]');
const status = document.querySelector('[data-bell-status]');
bell.addEventListener('click', () => {
	const on = bell.getAttribute('aria-pressed') !== 'true';
	bell.setAttribute('aria-pressed', on);
	bell.classList.toggle('off', !on);
	status.textContent = on ? 'Notifiche attive' : 'Notifiche spente';
});

// Fuori dalla vista il dondolio e i raggi si fermano (.is-live).
const live = new IntersectionObserver(
	(entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)),
	{ rootMargin: '60px' },
);
document.querySelectorAll('[data-live]').forEach((el) => live.observe(el));

// Campanella piccola: contatore e scampanio.
const icon = document.querySelector('[data-bell-icon]');
const badge = document.querySelector('[data-badge]');
const announce = document.querySelector('[data-bell-live]');
let unread = 0;

const render = () => {
	badge.hidden = unread === 0;
	badge.textContent = unread > 9 ? '9+' : unread;
	icon.setAttribute('aria-label', unread ? `Notifiche: ${unread} non lette` : 'Notifiche: nessuna non letta');
};

document.querySelector('[data-notify]').addEventListener('click', () => {
	unread += 1;
	render();
	announce.textContent = `Nuova notifica, ${unread} non lette`;
	// Riavvia lo scampanio e il "pop" del contatore anche a clic ravvicinati.
	icon.classList.remove('is-ringing');
	badge.classList.remove('is-new');
	void icon.offsetWidth;
	icon.classList.add('is-ringing');
	badge.classList.add('is-new');
});

icon.addEventListener('click', () => {
	unread = 0;
	render();
	announce.textContent = 'Tutte le notifiche sono state lette';
});
