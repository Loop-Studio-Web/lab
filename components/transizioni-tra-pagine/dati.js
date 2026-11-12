// I dischi del negozio «Cera & Solco» (tutto di fantasia). Il catalogo e la scheda si compongono da qui.
// Titoli e tracce sono in IT/EN/ES; artisti e anni restano uguali. `seed` e `tipo` disegnano la copertina (copertine.js).
(() => {
	const dischi = [
		{
			id: 'marea-lenta', artist: 'Quartetto Salvia', year: 1974, seed: 11, tipo: 'onde',
			it: { title: 'Marea lenta', tracks: [['Bassa marea', '4:12'], ['Sale di notte', '5:03'], ['Conchiglie', '3:41'], ['Ritorno al porto', '6:20']] },
			en: { title: 'Slow tide', tracks: [['Low tide', '4:12'], ['Salt at night', '5:03'], ['Seashells', '3:41'], ['Back to the harbour', '6:20']] },
			es: { title: 'Marea lenta', tracks: [['Marea baja', '4:12'], ['Sal de noche', '5:03'], ['Caracolas', '3:41'], ['Regreso al puerto', '6:20']] },
		},
		{
			id: 'neon-di-provincia', artist: 'I Cavalli di Sabbia', year: 1983, seed: 23, tipo: 'griglia',
			it: { title: 'Neon di provincia', tracks: [['Insegna spenta', '3:38'], ['Bar dello Sport', '4:01'], ['Ultima corriera', '3:27'], ['Domenica sera', '5:15']] },
			en: { title: 'Provincial neon', tracks: [['Dead sign', '3:38'], ['Sports bar', '4:01'], ['Last bus', '3:27'], ['Sunday evening', '5:15']] },
			es: { title: 'Neón de provincia', tracks: [['Letrero apagado', '3:38'], ['Bar deportivo', '4:01'], ['Último autobús', '3:27'], ['Domingo por la noche', '5:15']] },
		},
		{
			id: 'fuoco-freddo', artist: 'Ada Roverella', year: 1991, seed: 37, tipo: 'sole',
			it: { title: 'Fuoco freddo', tracks: [['Cenere', '3:50'], ['Vetro soffiato', '4:22'], ['Fuoco freddo', '5:40'], ['Finestra aperta', '3:09']] },
			en: { title: 'Cold fire', tracks: [['Ashes', '3:50'], ['Blown glass', '4:22'], ['Cold fire', '5:40'], ['Open window', '3:09']] },
			es: { title: 'Fuego frío', tracks: [['Ceniza', '3:50'], ['Vidrio soplado', '4:22'], ['Fuego frío', '5:40'], ['Ventana abierta', '3:09']] },
		},
		{
			id: 'atlante-dei-venti', artist: 'Tramonto Elettrico', year: 2004, seed: 41, tipo: 'archi',
			it: { title: 'Atlante dei venti', tracks: [['Maestrale', '4:44'], ['Scirocco', '3:55'], ['Tramontana', '4:31'], ['Bonaccia', '6:02']] },
			en: { title: 'Atlas of winds', tracks: [['Mistral', '4:44'], ['Sirocco', '3:55'], ['Tramontane', '4:31'], ['Dead calm', '6:02']] },
			es: { title: 'Atlas de los vientos', tracks: [['Mistral', '4:44'], ['Siroco', '3:55'], ['Tramontana', '4:31'], ['Calma chicha', '6:02']] },
		},
		{
			id: 'piccolo-sole', artist: 'Duo Pellicano', year: 1978, seed: 58, tipo: 'cerchi',
			it: { title: 'Piccolo sole', tracks: [['Alba in cucina', '3:12'], ['Piccolo sole', '2:58'], ['Bucato', '3:45'], ['Controluce', '4:20']] },
			en: { title: 'Little sun', tracks: [['Dawn in the kitchen', '3:12'], ['Little sun', '2:58'], ['Washing day', '3:45'], ['Backlight', '4:20']] },
			es: { title: 'Pequeño sol', tracks: [['Alba en la cocina', '3:12'], ['Pequeño sol', '2:58'], ['Día de colada', '3:45'], ['Contraluz', '4:20']] },
		},
		{
			id: 'stanza-12', artist: 'Lumen Club', year: 2012, seed: 64, tipo: 'punti',
			it: { title: 'Stanza 12', tracks: [['Corridoio', '3:33'], ['Ascensore', '4:08'], ['Stanza 12', '6:10'], ['Check-out', '3:02']] },
			en: { title: 'Room 12', tracks: [['Corridor', '3:33'], ['Lift', '4:08'], ['Room 12', '6:10'], ['Check-out', '3:02']] },
			es: { title: 'Habitación 12', tracks: [['Pasillo', '3:33'], ['Ascensor', '4:08'], ['Habitación 12', '6:10'], ['Salida', '3:02']] },
		},
		{
			id: 'salto-nel-blu', artist: 'Irene Falcò', year: 1971, seed: 79, tipo: 'triangoli',
			it: { title: 'Salto nel blu', tracks: [['Trampolino', '2:49'], ['Salto nel blu', '4:15'], ['Acqua alta', '3:58'], ['Riva', '4:36']] },
			en: { title: 'Leap into the blue', tracks: [['Springboard', '2:49'], ['Leap into the blue', '4:15'], ['High water', '3:58'], ['Shore', '4:36']] },
			es: { title: 'Salto al azul', tracks: [['Trampolín', '2:49'], ['Salto al azul', '4:15'], ['Agua alta', '3:58'], ['Orilla', '4:36']] },
		},
		{
			id: 'terra-bassa', artist: 'Nino Calce & Orchestra', year: 2019, seed: 93, tipo: 'strisce',
			it: { title: 'Terra bassa', tracks: [['Argine', '5:21'], ['Nebbia di pianura', '4:49'], ['Risaia', '3:36'], ['Cascina', '4:07']] },
			en: { title: 'Lowland', tracks: [['Embankment', '5:21'], ['Plain fog', '4:49'], ['Rice paddy', '3:36'], ['Farmstead', '4:07']] },
			es: { title: 'Tierra baja', tracks: [['Dique', '5:21'], ['Niebla de llanura', '4:49'], ['Arrozal', '3:36'], ['Alquería', '4:07']] },
		},
	];

	const lang = window.LabI18n ? window.LabI18n.lang : 'it';
	// Disco con titolo e tracce nella lingua della pagina.
	const local = (d) => ({ ...d, ...(d[lang] || d.it) });

	window.TtpDati = { dischi: dischi.map(local), find: (id) => dischi.map(local).find((d) => d.id === id) };
})();
