const reduced = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Cursore luminoso ----------
   Il cursore nativo è nascosto (caret-color: transparent) e disegniamo il
   nostro: la sua posizione è la larghezza del testo fino a selectionStart,
   misurata con un canvas che usa gli stessi font del campo. */
(() => {
	const input = document.querySelector('.glow__input');
	const caret = document.querySelector('.glow__caret');
	const ctx = document.createElement('canvas').getContext('2d');
	const place = () => {
		const cs = getComputedStyle(input);
		ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
		const before = input.value.slice(0, input.selectionStart ?? input.value.length);
		const pad = parseFloat(cs.paddingLeft);
		const max = input.clientWidth - parseFloat(cs.paddingRight);
		const x = Math.min(pad + ctx.measureText(before).width - input.scrollLeft, max);
		caret.style.setProperty('--x', `${x}px`);
	};
	['input', 'keyup', 'click', 'select', 'focus', 'scroll'].forEach((ev) => input.addEventListener(ev, place));
	place();
})();

/* ---------- Polvere di fata ----------
   Un canvas dietro al campo: a ogni lettera nascono particelle vicino al
   punto in cui si sta scrivendo; salgono, svaniscono e basta. Il ciclo di
   disegno gira solo finché ci sono particelle. */
(() => {
	const stage = document.querySelector('[data-dust]');
	const canvas = stage.querySelector('canvas');
	const input = stage.querySelector('input');
	const ctx = canvas.getContext('2d');
	const measure = document.createElement('canvas').getContext('2d');
	let dots = [];
	let running = false;
	let w = 0;
	let h = 0;

	const size = () => {
		const r = stage.getBoundingClientRect();
		const dpr = Math.min(devicePixelRatio || 1, 2);
		w = r.width;
		h = r.height;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};
	new ResizeObserver(size).observe(stage);
	size();

	const caretX = () => {
		const cs = getComputedStyle(input);
		measure.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
		const box = input.getBoundingClientRect();
		const base = stage.getBoundingClientRect();
		const pad = parseFloat(cs.paddingLeft);
		const x = pad + measure.measureText(input.value).width;
		return { x: box.left - base.left + Math.min(x, box.width - 8), y: box.top - base.top + box.height / 2 };
	};

	const burst = (n) => {
		if (reduced.matches) return;
		const { x, y } = caretX();
		for (let i = 0; i < n; i++) {
			dots.push({
				x: x + (Math.random() - 0.5) * 18,
				y: y + (Math.random() - 0.5) * 30,
				vx: (Math.random() - 0.5) * 0.9,
				vy: -0.3 - Math.random() * 0.9,
				r: 0.8 + Math.random() * 1.8,
				life: 0,
				max: 40 + Math.random() * 30,
			});
		}
		if (!running) {
			running = true;
			requestAnimationFrame(tick);
		}
	};

	function tick() {
		ctx.clearRect(0, 0, w, h);
		dots = dots.filter((d) => d.life < d.max);
		for (const d of dots) {
			d.life++;
			d.x += d.vx;
			d.y += d.vy;
			d.vy += 0.004;
			const a = 1 - d.life / d.max;
			ctx.globalAlpha = a;
			ctx.shadowColor = '#fff';
			ctx.shadowBlur = 8;
			ctx.fillStyle = '#fff';
			ctx.beginPath();
			ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
			ctx.fill();
		}
		if (dots.length) requestAnimationFrame(tick);
		else {
			running = false;
			ctx.clearRect(0, 0, w, h);
		}
	}

	input.addEventListener('input', (e) => {
		input.classList.add('is-typing');
		clearTimeout(input._t);
		input._t = setTimeout(() => input.classList.remove('is-typing'), 220);
		if (e.inputType && e.inputType.startsWith('insert')) burst(10);
	});
})();

/* ---------- Il fantasma ---------- */
(() => {
	const wrap = document.querySelector('[data-ghost]');
	const input = wrap.querySelector('input');
	const bubble = wrap.querySelector('[data-ghost-bubble]');
	const mouth = wrap.querySelector('.ghost__mouth');
	let chatter = null;
	input.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' || !input.value.trim()) return;
		bubble.textContent = input.value;
		input.value = '';
		clearInterval(chatter);
		if (reduced.matches) return;
		let i = 0;
		chatter = setInterval(() => {
			mouth.classList.toggle('ghost__mouth--open');
			if (++i > 6) {
				clearInterval(chatter);
				mouth.classList.remove('ghost__mouth--open');
			}
		}, 300);
	});
})();

/* ---------- Etichetta che sale: niente JS (:placeholder-shown) ---------- */

/* ---------- Codice a sei cifre ---------- */
(() => {
	const box = document.querySelector('[data-otp]');
	const msg = document.querySelector('[data-otp-msg]');
	const cells = [...box.querySelectorAll('input')];
	const idle = msg.textContent;
	const report = () => {
		const code = cells.map((c) => c.value).join('');
		box.classList.toggle('is-done', code.length === cells.length);
		msg.textContent = code.length === cells.length ? `Codice inserito: ${code}` : idle;
	};
	cells.forEach((cell, i) => {
		cell.addEventListener('input', () => {
			cell.value = cell.value.replace(/\D/g, '').slice(-1);
			if (cell.value && cells[i + 1]) cells[i + 1].focus();
			report();
		});
		cell.addEventListener('keydown', (e) => {
			if (e.key === 'Backspace' && !cell.value && cells[i - 1]) {
				cells[i - 1].value = '';
				cells[i - 1].focus();
				report();
			} else if (e.key === 'ArrowLeft' && cells[i - 1]) cells[i - 1].focus();
			else if (e.key === 'ArrowRight' && cells[i + 1]) cells[i + 1].focus();
		});
		cell.addEventListener('focus', () => cell.select());
		cell.addEventListener('paste', (e) => {
			e.preventDefault();
			const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, cells.length - i);
			[...digits].forEach((d, k) => (cells[i + k].value = d));
			cells[Math.min(i + digits.length, cells.length - 1)].focus();
			report();
		});
	});

	const line = document.querySelector('[data-otp-line]');
	line.addEventListener('input', () => (line.value = line.value.replace(/\D/g, '').slice(0, 6)));
})();

/* ---------- Password ---------- */
(() => {
	const eye = document.querySelector('[data-eye]');
	const field = eye.closest('.pw__wrap').querySelector('input');
	eye.addEventListener('click', () => {
		const show = eye.getAttribute('aria-pressed') !== 'true';
		eye.setAttribute('aria-pressed', String(show));
		eye.setAttribute('aria-label', show ? 'Nascondi la password' : 'Mostra la password');
		field.type = show ? 'text' : 'password';
	});

	const input = document.querySelector('[data-strength]');
	const text = document.querySelector('[data-strength-text]');
	const meter = input.parentElement.querySelector('.meter');
	const rules = {
		len: (v) => v.length >= 8,
		case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
		num: (v) => /\d/.test(v),
		sym: (v) => /[^\w\s]/.test(v),
	};
	const labels = ['', 'Debole', 'Discreta', 'Buona', 'Ottima'];
	const hint = text.textContent;
	input.addEventListener('input', () => {
		const v = input.value;
		let score = 0;
		for (const [key, test] of Object.entries(rules)) {
			const ok = test(v);
			input.parentElement.querySelector(`[data-rule="${key}"]`).toggleAttribute('data-ok', ok);
			if (ok) score++;
		}
		if (!v) score = 0;
		meter.dataset.score = String(score);
		text.textContent = v ? `Robustezza: ${labels[score] || 'molto debole'}` : hint;
	});
})();
