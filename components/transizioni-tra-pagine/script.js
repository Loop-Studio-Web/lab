// Contenuto delle pagine (catalogo e scheda disco) composto da dati.js + copertine.js.
// Sincrono, in fondo al <main>: il contenuto c'è già al primo disegno, e la transizione lo trova.
(() => {
	const { dischi, find } = window.TtpDati;
	const { link } = window.Ttp;

	const catalogo = document.querySelector('[data-catalog]');
	if (catalogo) {
		catalogo.innerHTML = dischi
			.map(
				(d) =>
					`<li><a class="cover" data-disco="${d.id}" href="${link('disco/', { d: d.id })}">` +
					`<span class="cover__art">${window.Copertine.svg(d)}</span>` +
					`<span class="cover__title">${d.title}</span>` +
					`<span class="cover__meta">${d.artist} · ${d.year}</span></a></li>`,
			)
			.join('');
	}

	const pagina = document.querySelector('[data-disco-page]');
	if (pagina) {
		const id = new URLSearchParams(location.search).get('d');
		const d = find(id) || dischi[0];
		const alt = window.LabI18n.t('ttp.cover.alt', 'Copertina di {title}', { title: d.title });
		pagina.querySelector('[data-cover]').innerHTML = window.Copertine.svg(d, alt);
		pagina.querySelector('[data-title]').textContent = d.title;
		pagina.querySelector('[data-artist]').textContent = d.artist;
		pagina.querySelector('[data-year]').textContent = d.year;
		pagina.querySelector('.vinyl__label').style.background = window.Copertine.colore(d);
		pagina.querySelector('[data-tracks]').innerHTML = d.tracks.map(([nome, durata]) => `<li><span>${nome}</span><span class="tracks__time">${durata}</span></li>`).join('');
		pagina.querySelector('[data-back]').href = link('./');
		document.title = `${d.title} — Cera & Solco — Loop Studio Lab`;
	}

	// Il vinile gira solo quando si vede.
	const art = document.querySelector('.disc-art');
	if (art && 'IntersectionObserver' in window) {
		new IntersectionObserver(([en]) => art.classList.toggle('is-live', en.isIntersecting)).observe(art);
	}

	window.LabI18n.apply();
})();
