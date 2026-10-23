/* Dati di esempio del menù: attività di fantasia ("Osteria Lunapiena"). Piatti e bevande sono descritti per
   INGREDIENTI, e ogni ingrediente porta i suoi allergeni: lo stato di un piatto ("per te", "chiedi in sala",
   "non per te") non è scritto a mano, lo calcola script.js. Per un ristorante vero basta sostituire questo file con la
   sua tabella ingredienti → allergeni, compilata e verificata da lui.
   - a: allergeni dell'ingrediente (id di ALLERGENI)
   - togli: l'ingrediente si può non servire (il piatto diventa "chiedi in sala")
   - tracce: allergeni che non sono ingredienti ma possono finire nel piatto (stessa friggitrice, stesso stabilimento…) */
(function (root) {
	'use strict';

	/* I 14 allergeni del Reg. UE 1169/2011, in ordine alfabetico, con il nome in inglese per il cartello al cameriere. */
	var ALLERGENI = [
		{ id: 'arachidi', it: 'Arachidi', en: 'Peanuts' },
		{ id: 'crostacei', it: 'Crostacei', en: 'Crustaceans' },
		{ id: 'guscio', it: 'Frutta a guscio', en: 'Tree nuts' },
		{ id: 'glutine', it: 'Glutine', en: 'Gluten' },
		{ id: 'latte', it: 'Latte', en: 'Milk' },
		{ id: 'lupini', it: 'Lupini', en: 'Lupin' },
		{ id: 'molluschi', it: 'Molluschi', en: 'Molluscs' },
		{ id: 'pesce', it: 'Pesce', en: 'Fish' },
		{ id: 'sedano', it: 'Sedano', en: 'Celery' },
		{ id: 'senape', it: 'Senape', en: 'Mustard' },
		{ id: 'sesamo', it: 'Sesamo', en: 'Sesame' },
		{ id: 'soia', it: 'Soia', en: 'Soy' },
		{ id: 'solfiti', it: 'Solfiti', en: 'Sulphites' },
		{ id: 'uova', it: 'Uova', en: 'Eggs' },
	];

	var UNSPLASH = 'https://unsplash.com/photos/';

	var PIATTI = [
		{
			id: 'spaghetti', tipo: 'piatto', nome: 'Spaghetti al pomodoro fresco', prezzo: 11, img: 'img/spaghetti.webp', pos: '50% 60%',
			descr: 'Pomodoro fresco, basilico e parmigiano.',
			ingredienti: [
				{ n: 'Spaghetti di grano duro', a: ['glutine'] },
				{ n: 'Pomodoro fresco' },
				{ n: 'Basilico' },
				{ n: 'Olio extravergine' },
				{ n: 'Parmigiano', a: ['latte'], togli: true },
			],
			tracce: ['uova'],
			foto: { autore: 'Vinn Koonyosying', id: 'PLyJqEJVre0' },
		},
		{
			id: 'diavola', tipo: 'piatto', nome: 'Diavola dal forno a legna', prezzo: 10, img: 'img/diavola.webp', pos: '50% 64%',
			descr: 'Pomodoro, mozzarella e salame piccante.',
			ingredienti: [
				{ n: 'Impasto a lunga lievitazione', a: ['glutine'] },
				{ n: 'Pomodoro' },
				{ n: 'Mozzarella fior di latte', a: ['latte'], togli: true },
				{ n: 'Salame piccante' },
				{ n: 'Olio extravergine' },
			],
			foto: { autore: 'James Hardman', id: 'F2rMgRhjJpg' },
		},
		{
			id: 'tagliere', tipo: 'piatto', nome: 'Tagliere della casa', prezzo: 16, img: 'img/tagliere.webp', pos: '50% 50%',
			descr: 'Salumi, formaggio, frutta secca e crackers.',
			ingredienti: [
				{ n: 'Prosciutto crudo e cotto' },
				{ n: 'Formaggio a crosta fiorita', a: ['latte'] },
				{ n: 'Mandorle e frutta secca', a: ['guscio'] },
				{ n: 'Crackers ai semi di sesamo', a: ['glutine', 'sesamo'], togli: true },
				{ n: 'Olive' },
				{ n: 'Confettura di fichi' },
			],
			foto: { autore: 'Hershe Go', id: 'aIZR_X-UDDQ' },
		},
		{
			id: 'torrette', tipo: 'piatto', nome: 'Torrette d’orto con salsa verde', prezzo: 12, img: 'img/torrette.webp', pos: '50% 48%',
			descr: 'Melanzane, zucchine e pomodoro con salsa al basilico.',
			ingredienti: [
				{ n: 'Melanzane grigliate' },
				{ n: 'Zucchine grigliate' },
				{ n: 'Pomodoro' },
				{ n: 'Scamorza', a: ['latte'], togli: true },
				{ n: 'Salsa verde di basilico e mandorle', a: ['guscio'], togli: true },
			],
			foto: { autore: 'Dina Spencer', id: 'NMGQnnuG3bk' },
		},
		{
			id: 'brodo', tipo: 'piatto', nome: 'Brodo dorato dell’orto', prezzo: 7, img: 'img/brodo.webp', pos: '50% 55%',
			descr: 'Brodo di verdure con zafferano e patate.',
			ingredienti: [
				{ n: 'Brodo di verdure con sedano', a: ['sedano'] },
				{ n: 'Zafferano' },
				{ n: 'Carote e patate' },
				{ n: 'Prezzemolo' },
				{ n: 'Olio extravergine' },
			],
			foto: { autore: 'Farhad Ibrahimzade', id: '-a1jW86-d4' },
		},
		{
			id: 'fritto', tipo: 'piatto', nome: 'Fritto di gamberi e calamari', prezzo: 17, img: 'img/fritto.webp', pos: '50% 55%',
			descr: 'Gamberi e calamari su cavolo nero, con salsa tartara.',
			ingredienti: [
				{ n: 'Gamberi', a: ['crostacei'] },
				{ n: 'Calamari', a: ['molluschi'] },
				{ n: 'Pastella di farina', a: ['glutine'] },
				{ n: 'Cavolo nero' },
				{ n: 'Salsa tartara', a: ['uova', 'senape'], togli: true },
			],
			tracce: ['pesce'],
			foto: { autore: 'Andres Rodriguez', id: '3jJtXTwLZw4' },
		},
		{
			id: 'risotto', tipo: 'piatto', nome: 'Risotto con cialda di parmigiano', prezzo: 13, img: 'img/risotto.webp', pos: '50% 62%',
			descr: 'Riso mantecato, con una cialda croccante.',
			ingredienti: [
				{ n: 'Riso Carnaroli' },
				{ n: 'Brodo vegetale con sedano', a: ['sedano'] },
				{ n: 'Vino bianco', a: ['solfiti'] },
				{ n: 'Burro', a: ['latte'] },
				{ n: 'Cialda di parmigiano', a: ['latte'], togli: true },
			],
			foto: { autore: 'Luna Hu', id: '7TaFlRyAhSQ' },
		},
		{
			id: 'pesce', tipo: 'piatto', nome: 'Pesce al forno con limone', prezzo: 18, img: 'img/pesce.webp', pos: '50% 50%',
			descr: 'Pesce intero con pomodoro, cipolla rossa e limone.',
			ingredienti: [
				{ n: 'Pesce intero', a: ['pesce'] },
				{ n: 'Limone' },
				{ n: 'Pomodoro e cipolla rossa' },
				{ n: 'Prezzemolo' },
				{ n: 'Olio extravergine' },
			],
			tracce: ['crostacei'],
			foto: { autore: 'Keesha’s Kitchen', id: 'KRbF_wsztBE' },
		},
		{
			id: 'insalata', tipo: 'piatto', nome: 'Pomodori antichi e basilico', prezzo: 8, img: 'img/insalata.webp', pos: '50% 56%',
			descr: 'Pomodori di varietà antiche, basilico e olio.',
			ingredienti: [
				{ n: 'Pomodori antichi' },
				{ n: 'Basilico' },
				{ n: 'Aglio' },
				{ n: 'Olio extravergine' },
			],
			foto: { autore: 'Serghey Savchuk', id: 'DvNnwWm_U7Y' },
		},
		{
			id: 'tortino', tipo: 'piatto', nome: 'Tortino al cioccolato con gelato', prezzo: 8, img: 'img/tortino.webp', pos: '42% 40%',
			descr: 'Cuore caldo di cioccolato e gelato alla vaniglia.',
			ingredienti: [
				{ n: 'Cioccolato fondente', a: ['soia'] },
				{ n: 'Farina', a: ['glutine'] },
				{ n: 'Uova', a: ['uova'] },
				{ n: 'Burro', a: ['latte'] },
				{ n: 'Gelato alla vaniglia', a: ['latte', 'uova'] },
				{ n: 'Granella di noci', a: ['guscio'], togli: true },
			],
			foto: { autore: 'Shivansh Sethi', id: 'dKT6Q7q2UKs' },
		},

		/* Bevande */
		{
			id: 'vino', tipo: 'bevanda', nome: 'Il rosso della casa', prezzo: 5, img: 'img/vino.webp', pos: '62% 62%',
			descr: 'Vino rosso, al calice.',
			ingredienti: [{ n: 'Vino rosso', a: ['solfiti'] }],
			foto: { autore: 'Hermes Rivera', id: 'aK6WGqxyHFw' },
		},
		{
			id: 'birra', tipo: 'bevanda', nome: 'Birra alla spina', prezzo: 5, img: 'img/birra.webp', pos: '66% 56%',
			descr: 'Bionda, media da 40 cl.',
			ingredienti: [{ n: 'Birra d’orzo', a: ['glutine'] }],
			foto: { autore: 'Josh Olalde', id: '-Ygu9Qx309s' },
		},
		{
			id: 'spritz', tipo: 'bevanda', nome: 'Spritz all’arancia', prezzo: 7, img: 'img/spritz.webp', pos: '45% 64%',
			descr: 'Vino spumante, aperitivo amaro, soda e arancia.',
			ingredienti: [
				{ n: 'Vino spumante', a: ['solfiti'] },
				{ n: 'Aperitivo amaro' },
				{ n: 'Soda' },
				{ n: 'Arancia' },
			],
			foto: { autore: 'Cory Bjork', id: 'bvKYXXVqBew' },
		},
		{
			id: 'analcolici', tipo: 'bevanda', nome: 'Tris di analcolici', prezzo: 9, img: 'img/analcolici.webp', pos: '50% 50%',
			descr: 'Tre cocktail senza alcol: cremoso, menta e lime, frutti rossi.',
			ingredienti: [
				{ n: 'Succo di lime e menta' },
				{ n: 'Frutto del drago e frutti rossi' },
				{ n: 'Sciroppo di mandorla', a: ['guscio'], togli: true },
				{ n: 'Albume montato', a: ['uova'], togli: true },
			],
			foto: { autore: 'Kobby Mendez', id: 'xBFTjrMIC0c' },
		},
		{
			id: 'shot', tipo: 'bevanda', nome: 'Tris di shot', prezzo: 6, img: 'img/shot.webp', pos: '40% 62%',
			descr: 'Ananas e zenzero, spinaci e mela, carota e pomodoro.',
			ingredienti: [
				{ n: 'Ananas e zenzero' },
				{ n: 'Spinaci, mela e sedano', a: ['sedano'] },
				{ n: 'Carota e pomodoro' },
			],
			foto: { autore: 'Toa Heftiba', id: '2bGL3ydxJzs' },
		},
	];

	root.MENU = { ALLERGENI: ALLERGENI, PIATTI: PIATTI, UNSPLASH: UNSPLASH };
})(window);
