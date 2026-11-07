# Scheda «pagine-404» — concept (fase 1 CHIUSA il 2026-11-07, struttura e asset da fare)

Una sola scheda del Lab (`components/pagine-404/`, categoria Effetti) con un selettore tipo `tab-segmented` e tante varianti di
pagina 404. Nessun codice scritto finora.

## Regole comuni a ogni variante
Palco scuro fisso, testo breve ironico, pulsante «Torna alla home» (tradotto nella lingua della variante), marchio vero piccolo
(firma `studio.js`), `prefers-reduced-motion` con versione ferma, animazioni/canvas solo quando la scheda è visibile
(IntersectionObserver `.is-live`), tetto di particelle più basso su telefono, tastiera e tocco. Lingua FISSA per variante (niente
selettore di lingua: decisione dell'autore, la varietà è parte della battuta).

## Le 7 varianti (lingua e battuta provvisorie)
1. **Testo** (IT): un solo 404 che alterna in sequenza gli effetti di `components/effetti-testo` (Neon rotto, Segnale disturbato,
   Si ricompone scorrendo, Barre che entrano, Lettere impilate, Giro dopo giro): appare, resta, scompare, entra il successivo;
   pallini sotto = effetto in corso. Gli effetti vanno ESTRATTI in una parte condivisa (`_shared/`), non copiati.
   «Questa pagina è uscita a prendere un caffè. Non è più tornata.»
2. **Infinito** (ES): "4∞4" con il marchio vero al posto dello 0 + scia di particelle, il cursore le sposta (tocco sul telefono).
   NB: il 404 vero del sito madre (`Loop-Studio/src/pages/404.astro`) ha già 4∞4 con l'infinito che gira: questa è la sua
   evoluzione. «Esta página salió a comprar tabaco. Y no volvió.»
3. **Particelle** (EN): il «404» è fatto di centinaia di puntini (canvas) che si sfaldano al passaggio/tocco e si ricompongono.
   «Nothing here. We checked twice.»
4. **Comparse** (IT): bottoni e finestrine compaiono e scappano finché il cursore trova «Torna alla home».
   «Stavamo cercando anche noi. Se la trovi, dicci dov'era.»
5. **Tris** (EN), da Sruthi: lo 0 è la griglia del tris giocabile (X contro il computer); chi vince o pareggia ottiene «Torna alla
   home». «You lost the page. You won't lose this game.»
6. **Pendolo** (ES), da Tribe AI: palline che oscillano col cursore (pendolo di Newton), una rossa esce dalla fila.
   «La página rebotó y se fue.»
7. **Bolle** (IT), da glyphic: lo 0 è un anello luminoso di bolle in CSS + blur che reagisce al cursore.
   «Qui c'era una pagina. Ora c'è una bolla.»

Costo: Tris e Pendolo hanno logica propria → per ultime, tagliabili. Lingue: IT 3, EN 2, ES 2.

## Riferimenti
- Galleria https://www.404s.design/ (21 schede viste; tag/«Surprise me» ne mostrano forse altre).
- Zip dell'autore in Download (`nov 07 - 21_33.zip`): 3 immagini del 404 di glyphic.bio (0 = anello di bolle 3D; versione luminosa e nera).
- Asset: nessuno da generare (infinito in SVG/CSS dal `<symbol id="i-infinity">` di `components/card`).

## Fase 2 — Struttura (PROPOSTA 2026-11-07, in attesa del via dell'autore)

```
components/
  _shared/
    effetti-testo.css   NUOVO: aspetto di Neon rotto, Segnale disturbato, Barre che entrano, Lettere impilate,
                        Si ricompone, Giro dopo giro (+ @property, @keyframes unscramble/orbit-turn, cut-a..d)
    effetti-testo.js    NUOVO: mulberry32 + glitchFrames (keyframe a seme fisso), splitWord, readable,
                        buildStack/buildScramble/buildOrbit (oggi inline in effetti-testo/script.js)
    fonts/              + Bungee Shade, Medula One (spostati da effetti-testo/fonts; Noto Sans Mono c'è già) + OFL
  effetti-testo/        resta com'è per l'utente: html invariato; style.css tiene solo ciò che NON si estrae
                        (Al passaggio, Comparsa, Ombra, .group, .replay, scrubstage) + `animation-timeline` allo scroll
  pagine-404/
    index.html          intestazione, <symbol id="i-infinity"> (come le altre schede), tablist a 7 tab (markup di
                        tab-segmented), UN palco con 7 pannelli `hidden`; solo il pannello attivo vive
    style.css           comune: palco scuro, tipografia del 404, pulsante «Torna alla home», marchio, reduced-motion
    script.js           selettore (da tab-segmented, copiato: è piccolo), IntersectionObserver `.is-live`,
                        carica la variante al primo tab con `import()` e chiama start()/stop() al cambio e fuori vista
    varianti/
      testo.css/.js  infinito.css/.js  particelle.js  comparse.css/.js  tris.css/.js  pendolo.js  bolle.css/.js
      (ognuna esporta {init(el), start(), stop()}; il canvas sta nel JS, il resto in CSS)
```

Decisioni di struttura e motivi:
- **Estrazione di `effetti-testo`, non copia.** Si sposta in `_shared/` solo ciò che la variante Testo riusa (6 effetti su 9);
  Al passaggio, Comparsa e Ombra restano nella scheda. Rischio: toccare una scheda già online → prima/dopo si confronta lo
  screenshot di `effetti-testo` (stesse misure, `drive.mjs`) e si controlla ONLINE dopo il push (trappola `_shared`/.nojekyll).
- **TRAPPOLA: due effetti sono guidati dallo scroll** (Si ricompone, Giro dopo giro: `animation-timeline: --card`). In un 404
  non si scorre: nel file condiviso restano le variabili (`--page-offset`, `--rotate`) e i keyframe; l'`animation-timeline` lo
  aggiunge la scheda `effetti-testo`, mentre la variante Testo le anima nel TEMPO (`animation: unscramble 2.4s`). Gli altri
  quattro sono già a tempo.
- **Sequenza della variante Testo**: classi `.fx-*` accese una alla volta da `testo.js` (appare → resta ~3 s → esce), un `<p
  class="sr-only">` con la frase vera, il testo decorativo `aria-hidden`; pallini = `role="presentation"`. Con reduced-motion:
  una sola frase ferma, senza ciclo.
- **Canvas (Particelle, Pendolo, Tris)**: un `<canvas>` per variante, creato alla prima visita, `devicePixelRatio` tetto 2,
  particelle ~350 su desktop e ~150 su telefono (`matchMedia('(pointer: coarse)')`); `requestAnimationFrame` solo tra
  start() e stop(). Tris: logica in un oggetto di 9 celle + minimax (non serve altro), DOM con veri `<button>` per tastiera.
  Pendolo: fisica semplice a passo fisso (angolo, velocità, smorzamento), non librerie.
- **Marchio**: il `<symbol id="i-infinity">` sta in `index.html` (convenzione delle altre schede); Infinito lo usa al posto
  dello 0, le altre varianti lo mostrano piccolo accanto al pulsante (firma `studio.js` già presente in alto a sinistra).
- **Lingua**: `lang="it|en|es"` sul pannello (lettori di schermo), `<html lang="it">` per l'interfaccia (titolo, tab).
- **Ordine di costruzione**: (1) estrazione + pagina con selettore e Testo; (2) Infinito; (3) Bolle; (4) Comparse; (5) Particelle;
  (6) Tris; (7) Pendolo. Bozza all'autore dopo (3) e poi a ogni coppia; Tris e Pendolo tagliabili.
- **Sito madre**: `src/data/lab-components.ts` +1 scheda (`pagine-404`, categoria Effetti, description IT), conteggi 30→31 (CLAUDE.md
  del Lab, badge). Miniatura: la card rende la pagina a 1600×1000 × 0,25 → la PRIMA variante visibile deve essere la più forte
  (valutare di aprire su Particelle o Infinito invece che su Testo).

## Prossimi passi
Fase 2: il via dell'autore su questa struttura. Fase 3 (asset: nessuno pesante, solo i due font spostati e le loro OFL), poi costruzione con skill `animate`/`emil-design-eng`, bozza all'autore PRIMA di ogni collaudo. Se la variante 2
sostituirà il 404 del sito madre: decisione a parte.
