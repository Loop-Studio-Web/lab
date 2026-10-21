// Il selettore mensile/annuale scrive la sua scelta su data-bill del blocco; il
// resto (scorrimento dei prezzi, "/mese" → "/mese, pagato all'anno") è CSS.
document.querySelectorAll('.pricing').forEach((block) => {
	block.querySelectorAll('input[type="radio"]').forEach((radio) => {
		radio.addEventListener('change', () => {
			if (!radio.checked) return;
			block.dataset.bill = radio.value;
			block.querySelectorAll('[data-per]').forEach((el) => {
				el.textContent = radio.value === 'year' ? '/mese, pagato all’anno' : '/mese';
			});
		});
	});
});
