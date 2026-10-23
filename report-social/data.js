/* Dati di esempio del report: attività di fantasia ("Osteria Lunapiena"), 180 giorni fino al 21 ottobre 2026.
   Sono generati da un seme fisso (stessi numeri a ogni apertura) ma hanno la FORMA di quelli veri che le API
   di Instagram restituiscono: una serie al giorno per account (copertura, follower) e un elenco di contenuti
   con le loro metriche (copertura, mi piace, commenti, salvataggi, condivisioni). Per collegare un account
   vero basta sostituire questo file con la chiamata a un piccolo servizio che legge le API (serve un'app
   approvata da Meta e un token: non si fa dal browser). */
(function (root) {
	'use strict';

	var GIORNI = 180;
	var FINE = Date.UTC(2026, 9, 21); // mercoledì 21 ottobre 2026 (mese 9 = ottobre)
	var DAY = 86400000;

	function mulberry32(a) {
		return function () {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			var t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	var rnd = mulberry32(2026);

	/* Contenuti con anteprima: giorno = quanti giorni prima del 21 ottobre. */
	var CON_FOTO = [
		{ off: 1, formato: 'storia', titolo: 'Sera in piazzetta', img: 'img/sera-piazzetta.webp', reach: 3100, like: 0, commenti: 18, salvati: 0, condivisi: 44, pos: '50% 62%' },
		{ off: 4, formato: 'carosello', titolo: 'Il rosso della casa', img: 'img/vino-rosso.webp', reach: 5100, like: 300, commenti: 20, salvati: 95, condivisi: 40, pos: '50% 55%' },
		{ off: 6, formato: 'reel', titolo: 'Dal forno a legna', img: 'img/forno-a-legna.webp', reach: 8900, like: 520, commenti: 33, salvati: 118, condivisi: 96, pos: '55% 60%' },
		{ off: 11, formato: 'foto', titolo: 'Spaghetti al pomodoro fresco', img: 'img/spaghetti.webp', reach: 2800, like: 130, commenti: 11, salvati: 22, condivisi: 9, pos: '50% 62%' },
		{ off: 13, formato: 'reel', titolo: 'Impasto a mano, ogni mattina', img: 'img/impasto-a-mano.webp', reach: 12400, like: 690, commenti: 41, salvati: 160, condivisi: 135, pos: '50% 55%' },
		{ off: 19, formato: 'carosello', titolo: 'Il tagliere della casa', img: 'img/tagliere.webp', reach: 3300, like: 190, commenti: 12, salvati: 64, condivisi: 25, pos: '50% 50%' },
		{ off: 24, formato: 'foto', titolo: 'Pomodori e basilico dell’orto', img: 'img/pomodoro-basilico.webp', reach: 2100, like: 92, commenti: 6, salvati: 14, condivisi: 6, pos: '50% 60%' },
		{ off: 38, formato: 'reel', titolo: 'Margherita, due minuti di fuoco', img: 'img/forno-fiamme.webp', reach: 7600, like: 430, commenti: 28, salvati: 98, condivisi: 77, pos: '40% 70%' },
		{ off: 45, formato: 'foto', titolo: 'Tiramisù, come lo faceva la nonna', img: 'img/tiramisu.webp', reach: 2500, like: 118, commenti: 9, salvati: 26, condivisi: 8, pos: '50% 38%' },
		{ off: 52, formato: 'foto', titolo: 'Il cesto dell’orto', img: 'img/cesto-orto.webp', reach: 4200, like: 215, commenti: 14, salvati: 41, condivisi: 17, pos: '50% 50%' },
		{ off: 62, formato: 'storia', titolo: 'Farina e mani', img: 'img/farina-mani.webp', reach: 1700, like: 0, commenti: 7, salvati: 0, condivisi: 21, pos: '50% 30%' },
	];

	/* Tutti gli altri contenuti (senza anteprima): reel/caroselli/foto/storie sparsi sui 180 giorni. */
	var PROFILO = {
		reel: { peso: 0.26, reach: [1400, 2500], tasso: [0.045, 0.065] },
		carosello: { peso: 0.26, reach: [1100, 2000], tasso: [0.07, 0.095] },
		foto: { peso: 0.3, reach: [650, 1250], tasso: [0.035, 0.055] },
		storia: { peso: 0.18, reach: [450, 900], tasso: [0.012, 0.022] },
	};
	var TITOLI = {
		reel: ['Dietro le quinte', 'Il piatto del giorno', 'Tre ingredienti, un classico', 'Servizio del sabato sera'],
		carosello: ['Il menù della settimana', 'Le nostre cantine', 'Dal mercato al piatto', 'Quattro dolci, una scelta'],
		foto: ['Il banco dei dolci', 'Pranzo di lavoro', 'Il tavolo vicino alla finestra', 'Caffè e cantucci'],
		storia: ['Aperti stasera', 'Il dolce del giorno', 'Prenota per sabato', 'Si cena in giardino'],
	};
	function scegliFormato() {
		var r = rnd(),
			acc = 0,
			k;
		for (k in PROFILO) {
			acc += PROFILO[k].peso;
			if (r <= acc) return k;
		}
		return 'foto';
	}
	function fra(a, b) {
		return a + (b - a) * rnd();
	}

	var contenuti = [];
	CON_FOTO.forEach(function (c, i) {
		var idx = GIORNI - 1 - c.off;
		contenuti.push({
			id: 'p' + i,
			idx: idx,
			ora: 19,
			formato: c.formato,
			titolo: c.titolo,
			img: c.img,
			pos: c.pos,
			reach: c.reach,
			like: c.like,
			commenti: c.commenti,
			salvati: c.salvati,
			condivisi: c.condivisi,
		});
	});
	var occupati = {};
	CON_FOTO.forEach(function (c) {
		occupati[GIORNI - 1 - c.off] = 1;
	});
	var n = 0;
	for (var d = 0; d < GIORNI; d++) {
		var crescita = 0.82 + 0.4 * (d / (GIORNI - 1));
		/* circa 2,3 contenuti a settimana, più spesso nei giorni vicini al weekend */
		var giorno = new Date(FINE - (GIORNI - 1 - d) * DAY).getUTCDay();
		var p = [0.2, 0.28, 0.2, 0.28, 0.36, 0.36, 0.3][giorno];
		if (occupati[d] && rnd() < 0.7) continue;
		if (rnd() > p) continue;
		var f = scegliFormato(),
			pr = PROFILO[f];
		var reach = Math.round(fra(pr.reach[0], pr.reach[1]) * crescita);
		var ia = Math.round(reach * fra(pr.tasso[0], pr.tasso[1]));
		var like = f === 'storia' ? 0 : Math.round(ia * 0.72);
		var com = Math.round(ia * (f === 'storia' ? 0.35 : 0.06));
		var sal = f === 'storia' ? 0 : Math.round(ia * 0.14);
		contenuti.push({
			id: 'g' + n,
			idx: d,
			ora: [12, 18, 19, 20][Math.floor(rnd() * 4)],
			formato: f,
			titolo: TITOLI[f][n % 4],
			img: null,
			pos: null,
			reach: reach,
			like: like,
			commenti: com,
			salvati: sal,
			condivisi: Math.max(0, ia - like - com - sal),
		});
		n++;
	}
	contenuti.forEach(function (c) {
		c.interazioni = c.like + c.commenti + c.salvati + c.condivisi;
	});
	contenuti.sort(function (a, b) {
		return a.idx - b.idx || a.ora - b.ora;
	});

	/* Serie giornaliere. La copertura di un giorno = base (più alta nel weekend, in crescita lenta)
	   + la "coda" dei contenuti usciti nei giorni prima. */
	var CODA = [0.5, 0.22, 0.1, 0.06, 0.04, 0.02];
	var SETT = [0.88, 0.84, 0.9, 1.0, 1.18, 1.3, 1.1]; // domenica = 0
	var reachGiorno = [],
		follower = [],
		date = [];
	for (var i = 0; i < GIORNI; i++) {
		date.push(FINE - (GIORNI - 1 - i) * DAY);
		var wd = new Date(date[i]).getUTCDay();
		var base = 1050 * (0.95 + 0.14 * (i / (GIORNI - 1))) * SETT[wd] * (0.9 + 0.2 * rnd());
		reachGiorno.push(base);
	}
	contenuti.forEach(function (c) {
		for (var k = 0; k < CODA.length; k++) {
			if (c.idx + k < GIORNI) reachGiorno[c.idx + k] += c.reach * CODA[k];
		}
	});
	for (i = 0; i < GIORNI; i++) {
		reachGiorno[i] = Math.round(reachGiorno[i]);
		follower.push(Math.max(0, Math.round((14 + reachGiorno[i] / 260) * (0.75 + 0.5 * rnd()))));
	}

	/* Follower online: 7 giorni × 12 fasce da due ore (0-2, 2-4, … 22-24), media delle ultime 4 settimane. */
	var FOLLOWER_TOT = 5200;
	var online = [];
	var gauss = function (h, c, s) {
		return Math.exp(-Math.pow((h - c) / s, 2) / 2);
	};
	for (var g = 0; g < 7; g++) {
		var riga = [];
		var giornoSett = (g + 1) % 7; // g=0 lunedì … g=6 domenica
		var spinta = [0.72, 0.74, 0.82, 0.95, 1.12, 1.22, 1.05][g];
		var weekend = g >= 5;
		for (var b = 0; b < 12; b++) {
			var h = b * 2 + 1;
			// feriali: pausa pranzo netta e sera; weekend: mattina tarda, pranzo lungo, sera che si allunga
			var forma = weekend
				? 0.05 + 0.3 * gauss(h, 10.5, 2) + 0.7 * gauss(h, 14, 2.3) + 1.0 * gauss(h, 21, 2.4)
				: 0.05 + 0.4 * gauss(h, 8, 1.4) + 0.78 * gauss(h, 13, 1.2) + (0.7 + 0.12 * (g - 2)) * gauss(h, 20, 1.9);
			var boost = 1;
			riga.push(Math.round(FOLLOWER_TOT * 0.16 * forma * spinta * boost * (0.94 + 0.12 * rnd())));
		}
		online.push(riga);
	}

	root.DATI = {
		account: { nome: 'Osteria Lunapiena', handle: '@osteria.lunapiena', follower: FOLLOWER_TOT },
		fine: FINE,
		giorni: GIORNI,
		date: date,
		reach: reachGiorno,
		nuoviFollower: follower,
		contenuti: contenuti,
		online: online,
	};
	if (typeof module !== 'undefined') module.exports = root.DATI;
})(typeof window !== 'undefined' ? window : globalThis);
