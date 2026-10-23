// Dati della Demo "Convertitore di valute": agenzia di fantasia "Tre Timbri".
// FINTI: agenzia e prezzi. VERI: i tassi, che arrivano dal nostro Worker (lab-cambio).

// Indirizzo del Worker. In locale (server di prova sulla 8765) si usa quello di `wrangler dev`.
export const API = ['localhost', '127.0.0.1'].includes(location.hostname)
	? 'http://127.0.0.1:8787'
	: 'https://lab-cambio.domenicociardullo85.workers.dev';

// Valute del convertitore e dei prezzi (le stesse che il Worker inoltra).
export const VALUTE = [
	'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'MAD', 'CAD', 'AUD', 'NZD', 'CNY', 'HKD', 'SGD', 'KRW', 'INR', 'THB',
	'TRY', 'BRL', 'MXN', 'ZAR', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'AED', 'EGP', 'ISK', 'ILS', 'IDR'
];

// Le valute del selettore "Mostra i prezzi in".
export const VALUTE_PREZZI = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'MAD'];

export const DESTINAZIONI = [
	{
		id: 'kyoto',
		nome: 'Kyoto',
		paese: 'Giappone',
		valuta: 'JPY',
		notti: 6,
		prezzo: 1890,
		img: 'img/kyoto.webp',
		alt: 'Il tempio Kiyomizu-dera a Kyoto al tramonto, tra i ciliegi in fiore',
		pos: '70% 50%',
		appunto: 'Il Kiyomizu-dera in fiore',
		foto: 'Nathalie Lays'
	},
	{
		id: 'marrakech',
		nome: 'Marrakech',
		paese: 'Marocco',
		valuta: 'MAD',
		notti: 4,
		prezzo: 690,
		img: 'img/marrakech.webp',
		alt: 'Una piazza di Marrakech di sera, con le bancarelle illuminate',
		pos: '68% 50%',
		appunto: 'La piazza del mercato, di sera',
		foto: 'Abdou Faiz'
	},
	{
		id: 'new-york',
		nome: 'New York',
		paese: 'Stati Uniti',
		valuta: 'USD',
		notti: 5,
		prezzo: 1490,
		img: 'img/new-york.webp',
		alt: 'Lo skyline di Manhattan al tramonto, visto dall’acqua',
		pos: '56% 50%',
		appunto: 'Manhattan all’ora blu',
		foto: 'Luca Bravo'
	},
	{
		id: 'londra',
		nome: 'Londra',
		paese: 'Regno Unito',
		valuta: 'GBP',
		notti: 4,
		prezzo: 890,
		img: 'img/londra.webp',
		alt: 'Il Tower Bridge di Londra illuminato al tramonto, con lo Shard sullo sfondo',
		pos: '50% 50%',
		appunto: 'Tower Bridge al tramonto',
		foto: 'David Monaghan'
	}
];

// Tassi di esempio (copia di una risposta vera del Worker): si usano solo se il Worker non risponde,
// e la pagina lo dice ("tassi di esempio"). Base EUR.
export const TASSI_ESEMPIO = {
	date: '2026-10-23',
	rates: {
		EUR: 1, AED: 4.1216, AUD: 1.6, BRL: 5.6555, CAD: 1.5729, CHF: 0.92319, CNY: 7.4824, CZK: 24.319, DKK: 7.4807,
		EGP: 61.718, GBP: 0.83811, HKD: 8.8077, HUF: 366.65, IDR: 20267, ILS: 3.4887, INR: 106.34, ISK: 136.38,
		JPY: 176.38, KRW: 1486.56, MAD: 11.0002, MXN: 21.036, NOK: 10.4971, NZD: 1.9723, PLN: 4.3838, RON: 5.3508,
		SEK: 11.1287, SGD: 1.4335, THB: 37.83, TRY: 55.719, USD: 1.1223, ZAR: 18.5078
	}
};
