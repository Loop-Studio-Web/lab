# Transizioni tra pagine (scheda 5 del piano, categoria Navigazione)

Concept approvato dall'autore il 12/11/2026: **negozio di dischi** inventato (dati di fantasia), mini sito di 3 pagine vere,
selettore di stile (Dissolvenza / Scorrimento / Volo / Nessuna). **Bozza costruita il 12/11** (viewports `core` senza overflow, i18n-check ok,
voce nel sito madre in locale). Differenze dalla struttura sotto: `stile.js` (in `<head>`) contiene anche `pageswap`/`pagereveal`
(devono essere registrati prima del primo disegno); `barra.js` (primo elemento del body) scrive UNA volta la striscia con il selettore
+ la barra del negozio, e dà `Ttp.link()` (porta `?lang`/`?embed`); `script.js` compone catalogo e scheda disco da `dati.js`.
**Non provato ancora**: la transizione vera nei browser (solo screenshot statici), iframe del sito madre, tasto Indietro, bfcache.

## Fase 2: struttura

```
components/transizioni-tra-pagine/
  index.html          Catalogo: griglia di copertine (prima sezione, forte a 1600×1000 scalata 0,25)
  disco/index.html    Scheda disco, legge ?d=<id> e si compone da dati.js (una sola pagina, non una per disco)
  contatto/index.html Contatto: terza pagina, entra di lato
  style.css           layout delle 3 pagine
  transizioni.css     @view-transition + 4 stili, scelti da html[data-stile]
  stile.js            piccolo, in <head> (sincrono): legge sessionStorage e mette data-stile PRIMA del primo disegno
  script.js           selettore, pageswap/pagereveal (nome condiviso solo sulla copertina cliccata), direzione avanti/indietro
  dati.js             i dischi (id, titolo, artista, anno, tracce, seme) + IT/EN/ES dei contenuti
  copertine.js        genera copertina SVG + vinile da seme fisso (mulberry32), usata da catalogo e scheda
  i18n.js             LabI18n.add({ en, es })
```
- Barra con logo e link comune alle 3 pagine, con `view-transition-name` proprio: resta ferma mentre il resto cambia.
- Copertina: stesso `view-transition-name` solo sull'elemento cliccato (impostato in `pageswap`, e sulla scheda in `pagereveal`), così non ci sono nomi duplicati.
- Scheda disco: il vinile esce dalla copertina e gira **solo quando visibile** (`.is-live`), fermo con `prefers-reduced-motion`.

## Dati e asset

- **Nessuna immagine esterna**: le copertine sono generate da JS (forme, colori, cerchi da seme fisso), quindi niente licenze, niente peso, nessun file da scaricare. Un seme per disco, 8 dischi.
- Dischi, artisti e titoli di fantasia (verificare che non coincidano con nomi reali noti), tracce brevi, anni 1970-2020.
- Font già in `_shared/fonts`; nessuno nuovo. Palco scuro, accento `#ff3b30`, simbolo infinito dal `<symbol id="i-infinity">` se serve.
- IT solo nell'HTML; titoli e tracce in EN/ES dove hanno senso (i nomi degli artisti restano). Controllo: `node components/_shared/i18n-check.mjs`.

## Regole di movimento
- Solo `transform`, `opacity`, `clip-path`; mai `transition: all`; durate 250-450 ms con `--ease-out`.
- Stile «Volo» = shared element; «Scorrimento» = direzione secondo l'ordine delle pagine (Catalogo → Disco → Contatto); «Dissolvenza» = predefinito; «Nessuna» = senza `@view-transition`.
- `prefers-reduced-motion`: solo dissolvenza brevissima.
- Fallback: dove `@view-transition` non esiste (Firefox) la navigazione è normale; nota visibile in pagina con i browser supportati.

## Da provare (rischi)
1. Dentro l'iframe della modale del sito madre e su GitHub Pages (sotto `/lab/`): same-origin quindi dovrebbe andare, da verificare.
2. Tasto Indietro del browser (transizione inversa) e riapertura da cache (bfcache).
3. Firefox (ripiego) e Safari 18.2+; telefono vero a Lab finito (voce 4(iii) del TODO).
4. Spagnolo più lungo nei titoli delle tracce.
5. Peso: tutto ≲ 60 KB gzip, nessuna immagine.

## Ordine di costruzione (fase 3 = nessun asset da creare; si passa alla bozza)
1. `dati.js` + `copertine.js` e catalogo statico.
2. Scheda disco e contatto, barra comune.
3. `transizioni.css` con i 4 stili + `stile.js` + selettore.
4. i18n, voce nel sito madre (`lab-components.ts`, `i18n/lab.ts`), viewports `core`, poi mostrare all'autore.
