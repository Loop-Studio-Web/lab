// Domande frequenti di "Pedivella", ciclofficina regionale di fantasia.
// Nome, prezzi, orari e regole sono INVENTATI (verosimili): servono a far provare la ricerca.
//
// Ogni domanda:
//   id       → serve al link diretto (#r=id)
//   tema     → uno degli id di TEMI
//   titolo   → la domanda, come la scriverebbe un cliente
//   risposta → paragrafi (testo semplice: la ricerca li evidenzia riga per riga)
//   voci     → opzionale: tabellina "voce … prezzo", mostrata come listino
//   affini   → parole che il cliente potrebbe usare ma che nel testo non compaiono
//              ("gomma" per camera d'aria): la ricerca le conosce, la pagina non le mostra

export const TEMI = [
	{ id: 'riparazioni', nome: 'Riparazioni' },
	{ id: 'prezzi', nome: 'Prezzi e tempi' },
	{ id: 'garanzia', nome: 'Garanzia' },
	{ id: 'ebike', nome: 'E-bike' },
	{ id: 'noleggio', nome: 'Noleggio' }
];

// Ricerche suggerite sotto il campo e quando non si trova niente.
export const PIU_CERCATE = ['gomma bucata', 'freni', 'batteria', 'noleggio', 'garanzia', 'preventivo'];

// Parole troppo comuni per contare nella ricerca ("come posso pagare" → "pagare").
export const PAROLE_VUOTE = new Set(
	(
		'a ad al allo alla ai agli alle da dal dallo dalla dai dagli dalle di del dello della dei degli delle ' +
		'in nel nello nella nei negli nelle su sul sullo sulla sui sugli sulle con per tra fra il lo la i gli le ' +
		'un uno una e ed o ma che chi cui non mi ti ci si vi ne è sono ho ha hanno posso può puoi come cosa ' +
		'quanto quanti quale quali quando dove se mia mio tua tuo mie miei fate fai fare ve vi vostra vostro'
	).split(' ')
);

export const DOMANDE = [
	// ───────── Riparazioni ─────────
	{
		id: 'gomma-bucata',
		tema: 'riparazioni',
		titolo: 'Ho bucato: quanto costa e quanto ci vuole?',
		risposta: [
			'Se ci porti la bici senza appuntamento la foratura si ripara mentre aspetti: circa 20 minuti. Controlliamo anche il copertone e il nastro, perché spesso il foro viene da una scheggia ancora incastrata.'
		],
		voci: [
			['Manodopera ruota anteriore', '8 €'],
			['Manodopera ruota posteriore', '12 €'],
			['Camera d’aria 26" o 28"', '7 €'],
			['Camera d’aria MTB o corsa', '9 €']
		],
		affini: 'gomma gomme bucata bucato forato foratura sgonfia sgonfio pneumatico toppa copertone ruota'
	},
	{
		id: 'freni',
		tema: 'riparazioni',
		titolo: 'Fate la messa a punto dei freni, anche a disco?',
		risposta: [
			'Sì: freni a pattino, a V e a disco, meccanici e idraulici. Se la leva è molle o il freno stride di solito basta una registrazione; se le pastiglie sono sotto 1 mm le sostituiamo prima di restituirti la bici.',
			'Il disco si controlla sempre: se è storto o sotto la misura minima te lo facciamo vedere prima di cambiarlo.'
		],
		voci: [
			['Registrazione freni (per ruota)', '10 €'],
			['Sostituzione pastiglie (per ruota)', '12 € + pezzi'],
			['Spurgo freno idraulico (per freno)', '25 €']
		],
		affini: 'freno frenata frenare ferodo cigola fischia leva molla disco idraulico spurgo'
	},
	{
		id: 'cambio',
		tema: 'riparazioni',
		titolo: 'Il cambio salta o fa rumore: si può sistemare?',
		risposta: [
			'Quasi sempre sì. Controlliamo prima il cavo e la guaina, poi la catena (se è allungata salta anche con un cambio perfetto), infine il deragliatore e il gancio del telaio. Ti diciamo cosa serve prima di lavorare.'
		],
		voci: [
			['Registrazione del cambio', '10 €'],
			['Sostituzione catena', '10 € + catena'],
			['Cavi e guaine del cambio', '18 € + pezzi']
		],
		affini: 'marce scatta scatti rumore rumoroso ingranaggi pignone corona trasmissione deragliatore'
	},
	{
		id: 'altre-marche',
		tema: 'riparazioni',
		titolo: 'Riparate bici di qualsiasi marca?',
		risposta: [
			'Sì: city, corsa, MTB, gravel, pieghevoli e cargo, di qualunque marca e anche senza marca. Se ci serve un pezzo che non abbiamo ti avvisiamo subito e lo ordiniamo.',
			'Non ripariamo i telai in carbonio rotti: ti indirizziamo a un laboratorio specializzato e ti aiutiamo a capire se conviene.'
		],
		affini: 'marche modello corsa mountain bike gravel pieghevole cargo telaio carbonio crepa compatibile'
	},
	{
		id: 'prenotare',
		tema: 'riparazioni',
		titolo: 'Devo prenotare o posso passare e basta?',
		risposta: [
			'Per forature e piccoli lavori puoi passare quando vuoi: si va in ordine di arrivo.',
			'Per tagliandi e revisioni conviene prenotare (anche a voce, passando): così ti diciamo in che giorno lasciarla e quando sarà pronta. In primavera, nel fine settimana, i posti vanno via in fretta.'
		],
		affini: 'prenotazione appuntamento coda attesa fila passare orario'
	},
	{
		id: 'ritiro-domicilio',
		tema: 'riparazioni',
		titolo: 'Venite a ritirare la bici a casa?',
		risposta: [
			'Sì, il martedì e il giovedì entro 10 km dall’officina: 12 € tra andata e ritorno, gratis se prenoti un tagliando completo. Si prenota telefonando entro il giorno prima.'
		],
		affini: 'ritiro consegna domicilio furgone trasporto portare lasciare casa ritirare'
	},

	// ───────── Prezzi e tempi ─────────
	{
		id: 'tagliando',
		tema: 'prezzi',
		titolo: 'Cosa comprende il tagliando e quanto costa?',
		risposta: [
			'Il base: pulizia e lubrificazione della catena, registrazione di cambio e freni, pressione delle gomme, serraggio di viti e ruote. Il completo aggiunge la pulizia della trasmissione, il controllo dei cuscinetti e la centratura delle ruote.',
			'La revisione totale smonta tutto, ingrassa e sostituisce ciò che è consumato: il prezzo dipende dai ricambi e te lo diciamo prima.'
		],
		voci: [
			['Tagliando base', '35 €'],
			['Tagliando completo', '80 €'],
			['Revisione totale', 'da 140 €']
		],
		affini: 'revisione manutenzione controllo costo prezzo lubrificazione cuscinetti centratura serraggio'
	},
	{
		id: 'tempi',
		tema: 'prezzi',
		titolo: 'Quanto tempo devo lasciarvi la bici?',
		risposta: [
			'I tempi sono quelli della tabella, in giorni lavorativi. Se serve un ricambio che non abbiamo ti avvisiamo il giorno stesso e puoi decidere se aspettare o ritirare la bici com’è.'
		],
		voci: [
			['Foratura e piccoli lavori', 'mentre aspetti'],
			['Tagliando base', '24–48 ore'],
			['Tagliando completo', '3–4 giorni'],
			['Pezzo da ordinare', '3–7 giorni']
		],
		affini: 'tempo durata giorni ore attesa pronta pronto consegna ritiro ricambio ordine ordinare'
	},
	{
		id: 'preventivo',
		tema: 'prezzi',
		titolo: 'Fate un preventivo prima di intervenire?',
		risposta: [
			'Sì, sempre, e non costa niente. Guardiamo la bici con te, scriviamo cosa serve e quanto costa. Sotto i 25 € si procede senza preventivo scritto, ma sempre dopo che ti abbiamo detto la cifra.',
			'Se durante il lavoro salta fuori dell’altro ti chiamiamo: non facciamo mai niente che non hai approvato.'
		],
		affini: 'stima costo gratis gratuito sorpresa approvare conto spesa quanto verrà'
	},
	{
		id: 'tariffa',
		tema: 'prezzi',
		titolo: 'Quanto costa un’ora di lavoro?',
		risposta: [
			'La manodopera è 28 € all’ora, calcolata a quarti d’ora. I lavori più comuni hanno comunque un prezzo fisso (lo trovi nelle altre risposte), così non devi fare conti.'
		],
		affini: 'tariffa oraria costo orario manodopera prezzo lavoro meccanico quarto'
	},
	{
		id: 'pagamento',
		tema: 'prezzi',
		titolo: 'Come posso pagare?',
		risposta: [
			'Contanti, carta e bancomat; sopra i 200 € anche bonifico. Rilasciamo scontrino o fattura: se ti serve la fattura dillo prima di pagare, la intestiamo a te o alla tua ditta.'
		],
		affini: 'pagare pagamento contanti carta bancomat bonifico fattura scontrino ricevuta rate'
	},

	// ───────── Garanzia ─────────
	{
		id: 'garanzia-durata',
		tema: 'garanzia',
		titolo: 'Quanto dura la garanzia sui lavori?',
		risposta: [
			'90 giorni sulla manodopera, dalla data sulla scheda di lavoro: se qualcosa che abbiamo fatto non tiene, lo rifacciamo senza costi. I ricambi hanno la garanzia del costruttore, di solito 24 mesi.'
		],
		affini: 'durata mesi giorni lavoro manodopera ricambi costruttore scadenza'
	},
	{
		id: 'si-rompe',
		tema: 'garanzia',
		titolo: 'E se si rompe dopo pochi giorni?',
		risposta: [
			'Portala subito: la guardiamo entro un giorno lavorativo. Se il difetto dipende dal nostro lavoro o da un pezzo difettoso, riparazione e ricambio non ti costano niente.',
			'Se invece dipende da una caduta o dall’usura te lo spieghiamo con il pezzo in mano e ti diamo un prezzo onesto per sistemarlo.'
		],
		affini: 'rotto guasto difetto reclamo rifare problema ritorno sostituzione rimborso'
	},
	{
		id: 'non-coperto',
		tema: 'garanzia',
		titolo: 'Cosa non è coperto dalla garanzia?',
		risposta: [
			'Urti, cadute, uso scorretto e manutenzione fatta da altri dopo il nostro intervento. Sono fuori garanzia anche le parti d’usura (pastiglie, catena, copertoni, cavi, nastro del manubrio): durano meno per natura, ma ti diciamo a che punto sono.'
		],
		affini: 'esclusioni escluso coperto copertura usura consumo caduta incidente urto'
	},
	{
		id: 'scheda-lavoro',
		tema: 'garanzia',
		titolo: 'Mi serve lo scontrino per far valere la garanzia?',
		risposta: [
			'Basta la scheda di lavoro che ti diamo al ritiro, con la data e l’elenco di ciò che abbiamo fatto. Se la perdi ritroviamo tutto dal tuo nome nel nostro registro; lo scontrino serve solo per la garanzia dei pezzi del costruttore.'
		],
		affini: 'ricevuta documento prova perso registro fattura'
	},

	// ───────── E-bike ─────────
	{
		id: 'ebike-motori',
		tema: 'ebike',
		titolo: 'Riparate motori e batterie delle e-bike?',
		risposta: [
			'Motore e display dei principali sistemi centrali (Bosch, Shimano, Yamaha) li diagnostichiamo con il computer del costruttore. Il motore non lo apriamo: se è guasto lo sostituiamo o lo mandiamo all’assistenza ufficiale. Le batterie le testiamo, ma le celle non si riparano.'
		],
		voci: [
			['Diagnosi con computer', '20 € (scalati se ripari)'],
			['Test di capacità della batteria', '15 €']
		],
		affini: 'elettrica elettrico ebike assistenza guasto display centralina celle pedalata assistita'
	},
	{
		id: 'ebike-trasformare',
		tema: 'ebike',
		titolo: 'Posso trasformare la mia bici in elettrica?',
		risposta: [
			'Sì, se il telaio è adatto: serve una forcella con lo spazio per la ruota motore, oppure un movimento centrale standard. Prima la guardiamo insieme (gratis) e ti diciamo se conviene.',
			'Un kit con ruota motore e batteria parte da 790 €, montato, e richiede due giorni di lavoro.'
		],
		affini: 'trasformazione conversione elettrificare kit elettrica motore ruota montaggio prezzo'
	},
	{
		id: 'ebike-batteria-inverno',
		tema: 'ebike',
		titolo: 'Come conservo la batteria in inverno?',
		risposta: [
			'Carica al 50–60%, in un posto asciutto tra i 10 e i 20 °C (non in un garage gelido, non vicino al termosifone), staccata dalla bici. Una volta al mese controlla che non sia scesa sotto il 30% e ricaricala un poco.',
			'Non lasciarla scarica: è il modo più veloce per rovinarla.'
		],
		affini: 'conservare conservazione stagione freddo garage ricaricare scarica durata autonomia ebike elettrica'
	},
	{
		id: 'ebike-velocita',
		tema: 'ebike',
		titolo: 'Posso togliere il limite di velocità alla mia e-bike?',
		risposta: [
			'No, non lo facciamo. Per legge la pedalata assistita si ferma a 25 km/h e 250 W; chi la sblocca rischia sanzioni e il sequestro del mezzo, e perde garanzia e copertura assicurativa.',
			'Se vuoi andare più forte, ti consigliamo di lavorare su rapporti, gomme e pressione: la differenza si sente.'
		],
		affini: 'velocità limitare sbloccare tuning potenza multa legge omologazione manomissione elettrica ebike'
	},
	{
		id: 'ebike-usura',
		tema: 'ebike',
		titolo: 'Perché la mia e-bike consuma pastiglie e copertoni più in fretta?',
		risposta: [
			'Pesa 10–15 kg più di una bici normale e accelera di più: i freni lavorano di più e i copertoni si consumano prima. Controlla le pastiglie ogni 1.000 km circa e scegli copertoni pensati per le e-bike.',
			'Noi li guardiamo gratis a ogni tagliando.'
		],
		affini: 'usura consumo consuma elettrica ebike peso freni gomme durano poco'
	},

	// ───────── Noleggio ─────────
	{
		id: 'noleggio-costo',
		tema: 'noleggio',
		titolo: 'Quanto costa noleggiare una bici?',
		risposta: [
			'Nel prezzo ci sono casco, lucchetto e kit per le forature. Il seggiolino per bambini costa 5 € al giorno. Per i gruppi da 6 persone in su c’è il 10% di sconto.'
		],
		voci: [
			['City bike', '12 € al giorno'],
			['MTB', '18 € al giorno'],
			['E-bike', '35 € al giorno'],
			['Settimana (7 giorni)', '5 giorni pagati']
		],
		affini: 'affitto affittare noleggiare prezzo costo tariffa giorno settimana gruppo sconto seggiolino bambino'
	},
	{
		id: 'noleggio-cauzione',
		tema: 'noleggio',
		titolo: 'Serve una cauzione o un documento?',
		risposta: [
			'Sì: un documento d’identità e una cauzione di 100 € per city e MTB, 250 € per le e-bike. Si versa in contanti o con un blocco sulla carta (non un addebito) e torna indietro alla riconsegna, se la bici è come l’hai ritirata: forature e usura normale non contano.',
			'L’età minima è 16 anni; sotto i 18 serve un genitore al ritiro.'
		],
		affini: 'deposito caparra documento identità carta età minorenni restituita genitori'
	},
	{
		id: 'noleggio-orari',
		tema: 'noleggio',
		titolo: 'A che ora posso ritirare e riconsegnare?',
		risposta: [
			'Ritiro e riconsegna negli orari dell’officina: dal martedì al sabato, 9–12:30 e 15–19:30. La domenica mattina, 9–12, si ritira solo su prenotazione; il lunedì siamo chiusi.',
			'Se riporti la bici con meno di un’ora di ritardo non c’è nessun supplemento; oltre, si paga mezza giornata.'
		],
		affini: 'quando apertura aperto chiuso domenica lunedì ritardo prenotazione weekend ritirare riportare restituire'
	},
	{
		id: 'noleggio-imprevisti',
		tema: 'noleggio',
		titolo: 'Cosa succede se piove o se buco durante il noleggio?',
		risposta: [
			'Se disdici il giorno prima non paghi niente; se piove forte il giorno stesso ti rimborsiamo la giornata non usata (riportaci la bici entro mezzogiorno).',
			'Se buchi, nel kit trovi camera d’aria e leve; se non te la senti telefonaci e dicci dove sei: entro 15 km veniamo noi.'
		],
		affini: 'pioggia maltempo disdetta annullare cancellare rimborso foratura gomma bucata assistenza soccorso telefono'
	}
];
