// Dati di fantasia condivisi dai tre tab di «Storie e feed»: nove post con foto del pool _shared/img.
// Le storie sono i post raggruppati per autore; i nomi degli autori sono uguali in ogni lingua.
(() => {
	const POSTI = [
		{ n: 1, a: 'Marta', f: 'alpine-lake', t: LabI18n.t('sef.p1.t', 'Colazione sul lago'), c: LabI18n.t('sef.p1.c', 'Sveglia alle sei, acqua ferma e il primo caffè sul pontile.') },
		{ n: 2, a: 'Luca', f: 'manarola', t: LabI18n.t('sef.p2.t', 'Ultimo treno per Manarola'), c: LabI18n.t('sef.p2.c', 'Case a strapiombo e la luce che si spegne piano sul mare.') },
		{ n: 3, a: 'Giulia', f: 'snow-lake', t: LabI18n.t('sef.p3.t', 'Silenzio a duemila metri'), c: LabI18n.t('sef.p3.c', 'Il lago è ancora ghiacciato: si sente solo il vento.') },
		{ n: 4, a: 'Paolo', f: 'desert', t: LabI18n.t('sef.p4.t', 'Dune all’alba'), c: LabI18n.t('sef.p4.c', 'Un’ora di cammino prima che il sole diventi troppo forte.') },
		{ n: 5, a: 'Elena', f: 'fog-forest', t: LabI18n.t('sef.p5.t', 'Nebbia nel bosco'), c: LabI18n.t('sef.p5.c', 'Il sentiero sparisce dopo dieci passi, ed è questo il bello.') },
		{ n: 6, a: 'Sara', f: 'beach', t: LabI18n.t('sef.p6.t', 'Marea bassa'), c: LabI18n.t('sef.p6.c', 'La spiaggia si allarga e compaiono le conchiglie.') },
		{ n: 7, a: 'Luca', f: 'waterfall', t: LabI18n.t('sef.p7.t', 'La cascata dopo la pioggia'), c: LabI18n.t('sef.p7.c', 'Ieri era un filo d’acqua, oggi si sente dal parcheggio.') },
		{ n: 8, a: 'Marta', f: 'aurora', t: LabI18n.t('sef.p8.t', 'Notte d’Islanda'), c: LabI18n.t('sef.p8.c', 'Venti minuti di verde nel cielo, poi di nuovo buio.') },
		{ n: 9, a: 'Giulia', f: 'pagoda', t: LabI18n.t('sef.p9.t', 'Pagoda sotto la pioggia'), c: LabI18n.t('sef.p9.c', 'I tetti gocciolano e i turisti sono tutti al coperto.') },
	];
	const img = (p) => `../../_shared/img/${p.f}-m.webp`;
	const autori = () => {
		const m = new Map();
		POSTI.forEach((p) => {
			if (!m.has(p.a)) m.set(p.a, { nome: p.a, posti: [] });
			m.get(p.a).posti.push(p);
		});
		return [...m.values()];
	};
	window.SEF = { POSTI, img, autori };
})();
