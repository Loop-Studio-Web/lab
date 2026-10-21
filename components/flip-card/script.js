// Con mouse e tastiera gira il CSS (:hover e :focus-visible). Sul touch non c'è
// "sopra": lì un tocco gira la card e un secondo tocco la riporta com'era.
const canHover = matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('.flip').forEach((card) =>
	card.addEventListener('click', () => {
		if (!canHover.matches) card.classList.toggle('is-flipped');
	}),
);

// Caldo e freddo: due facce di un solo elemento. La faccia nascosta è `inert`,
// così Tab non entra nel pulsante che non si vede.
const season = document.querySelector('[data-season]');
const faces = season.querySelectorAll('.season__face');
season.querySelectorAll('[data-flip]').forEach((btn) =>
	btn.addEventListener('click', () => {
		const cold = season.classList.toggle('is-flipped');
		faces[0].inert = cold;
		faces[1].inert = !cold;
		// Il focus passa al pulsante della faccia che adesso si vede.
		faces[cold ? 1 : 0].querySelector('[data-flip]').focus({ preventScroll: true });
	}),
);
