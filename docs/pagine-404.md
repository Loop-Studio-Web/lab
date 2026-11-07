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

## Prossimi passi
Fase 2 (struttura: cartelle, file, dove vivono le parti condivise e come si estrae `effetti-testo`), fase 3 (asset: nessuno
pesante), poi costruzione con skill `animate`/`emil-design-eng`, bozza all'autore PRIMA di ogni collaudo. Se la variante 2
sostituirà il 404 del sito madre: decisione a parte.
