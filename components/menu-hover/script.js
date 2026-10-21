// Link di demo: niente navigazione. Il clic (o il tocco) segna la voce come attiva,
// così l'eco resta accesa anche su touch, dove non c'è :hover.
document.querySelectorAll('[data-demo-link]').forEach((link) => {
	link.addEventListener('click', (e) => {
		e.preventDefault();
		const menu = link.closest('.menu');
		menu.querySelectorAll('[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
		link.setAttribute('aria-current', 'page');
	});
});
