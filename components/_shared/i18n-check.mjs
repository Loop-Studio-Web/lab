// Controllo delle traduzioni, nessun token: node components/_shared/i18n-check.mjs [cartella-scheda …]
// Per ogni scheda con un i18n.js: ogni data-i18n / data-i18n-attr / LabI18n.t('chiave') usato nelle pagine
// ha la chiave sia in en sia in es, e non ci sono chiavi orfane (nel dizionario ma mai usate).
// Esce con codice 1 se trova problemi.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const schede = (args.length ? args : readdirSync(root)).filter(
	(d) => !d.startsWith('_') && existsSync(join(root, d, 'i18n.js')),
);

const walk = (dir) =>
	readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		if (statSync(p).isDirectory()) return f === 'img' || f === 'fonts' || f === 'video' ? [] : walk(p);
		return /\.(html|js)$/.test(f) && f !== 'i18n.js' ? [p] : [];
	});

const BLOCCHI = {
	en: /\ben:\s*\{([\s\S]*?)\n\t\}/,
	es: /\bes:\s*\{([\s\S]*?)\n\t\}/,
};

let problemi = 0;
for (const s of schede) {
	const src = readFileSync(join(root, s, 'i18n.js'), 'utf8');
	const dict = { en: new Set(), es: new Set() };
	for (const l of ['en', 'es']) {
		const blocco = src.match(BLOCCHI[l]);
		for (const m of (blocco?.[1] ?? '').matchAll(/'([^']+)':/g)) dict[l].add(m[1]);
	}
	const usate = new Set();
	for (const f of walk(join(root, s))) {
		const t = readFileSync(f, 'utf8');
		for (const m of t.matchAll(/data-i18n="([^"]+)"/g)) usate.add(m[1]);
		for (const m of t.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(',').forEach((p) => usate.add(p.split('=')[1].trim()));
		for (const m of t.matchAll(/LabI18n\.t\(\s*'([^']+)'/g)) usate.add(m[1]);
	}
	const err = [];
	for (const k of usate) for (const l of ['en', 'es']) if (!dict[l].has(k)) err.push(`manca ${l}: ${k}`);
	for (const l of ['en', 'es']) for (const k of dict[l]) if (!usate.has(k)) err.push(`orfana ${l}: ${k}`);
	for (const k of dict.en) if (!dict.es.has(k)) err.push(`solo en: ${k}`);
	for (const k of dict.es) if (!dict.en.has(k)) err.push(`solo es: ${k}`);
	console.log(`${s}: ${usate.size} chiavi usate, ${err.length ? err.length + ' problemi' : 'ok'}`);
	err.forEach((e) => console.log('  ' + e));
	problemi += err.length;
}
if (!schede.length) console.log('Nessuna scheda con i18n.js');
process.exit(problemi ? 1 : 0);
