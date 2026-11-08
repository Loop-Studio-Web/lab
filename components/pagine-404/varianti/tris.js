// Variante Tris (PT): lo 0 è la griglia del gioco del galo. L'utente è X, il computer O.
// Il computer gioca bene ma sbaglia ogni tanto (si può vincere). Vincere o pareggiare accende «Voltar ao início»;
// perdere fa ricominciare. Nessun ciclo di animazione: start()/stop() non hanno nulla da fare.

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const MISTAKE = 0.22; // probabilità che il computer giochi a caso
const X_PATH = '<path pathLength="1" d="M5 5 L35 35"/><path pathLength="1" d="M35 5 L5 35"/>';
const O_PATH = '<circle pathLength="1" cx="20" cy="20" r="15"/>';
const NOMI = [1, 2, 3].flatMap((r) => [1, 2, 3].map((c) => `Linha ${r}, coluna ${c}`));

let panel, cells, status, again;
let g = new Array(9).fill('');
let over = true, timer = 0;

const winner = (b) => {
	for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a, c, d] };
	return b.every(Boolean) ? { who: 'draw' } : null;
};

// Minimax: O massimizza, X minimizza. Con 9 celle è istantaneo.
function score(b, turn, depth) {
	const w = winner(b);
	if (w) return w.who === 'O' ? 10 - depth : w.who === 'X' ? depth - 10 : 0;
	let best = turn === 'O' ? -99 : 99;
	for (let i = 0; i < 9; i++) {
		if (b[i]) continue;
		b[i] = turn;
		const s = score(b, turn === 'O' ? 'X' : 'O', depth + 1);
		b[i] = '';
		best = turn === 'O' ? Math.max(best, s) : Math.min(best, s);
	}
	return best;
}
function pickMove() {
	const free = g.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
	if (Math.random() < MISTAKE) return free[Math.floor(Math.random() * free.length)];
	let best = -99, moves = [];
	for (const i of free) {
		g[i] = 'O';
		const s = score(g, 'X', 1);
		g[i] = '';
		if (s > best) { best = s; moves = [i]; } else if (s === best) moves.push(i);
	}
	return moves[Math.floor(Math.random() * moves.length)];
}

function put(i, m) {
	g[i] = m;
	const c = cells[i];
	c.dataset.m = m;
	c.disabled = true;
	c.setAttribute('aria-label', `${NOMI[i]}: ${m}`);
	c.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 40 40" aria-hidden="true">${m === 'X' ? X_PATH : O_PATH}</svg>`);
}

function finish(w) {
	over = true;
	cells.forEach((c) => (c.disabled = true));
	if (w.line) w.line.forEach((i) => cells[i].classList.add('is-win'));
	if (w.who === 'O') {
		status.textContent = 'Perdeste. Outra vez!';
		timer = setTimeout(reset, 1800);
		return;
	}
	panel.classList.add('is-unlocked');
	status.textContent = w.who === 'X' ? 'Ganhaste! Já podes voltar.' : 'Empate. Já podes voltar.';
	again.hidden = false;
}

function reset() {
	clearTimeout(timer);
	g = new Array(9).fill('');
	over = false;
	cells.forEach((c, i) => {
		c.querySelector('svg')?.remove();
		c.classList.remove('is-win');
		c.disabled = false;
		delete c.dataset.m;
		c.setAttribute('aria-label', `${NOMI[i]}: vazia`);
	});
	again.hidden = true;
	status.textContent = 'A tua vez: és o X.';
}

function play(i) {
	if (over || g[i]) return;
	put(i, 'X');
	let w = winner(g);
	if (w) return finish(w);
	over = true; // tocca al computer: nessuna mossa dell'utente nel frattempo
	status.textContent = '…';
	timer = setTimeout(() => {
		put(pickMove(), 'O');
		w = winner(g);
		if (w) return finish(w);
		over = false;
		status.textContent = 'A tua vez.';
	}, 420);
}

export function init(el) {
	panel = el;
	status = panel.querySelector('.tris404__status');
	again = panel.querySelector('.tris404__again');
	cells = [...panel.querySelectorAll('.tris404__cell')];
	cells.forEach((c, i) => c.addEventListener('click', () => play(i)));
	again.addEventListener('click', () => {
		panel.classList.remove('is-unlocked');
		reset();
		cells[0].focus();
	});
	reset();
}

export function start() {}
export function stop() {}
