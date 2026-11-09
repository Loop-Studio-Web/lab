# Scheda «mappe-e-hotspot» (Lotto 2, categoria Navigazione)

Stato 9/11 sera: **tutti e 3 i tab approvati** (Quartiere, Volo, Giro). Prossimo: aggiungere la scheda nel sito madre.

## Concept (3 tab, tre mondi diversi, prefisso `mh`)
1. **Quartiere** · «Borgo Lanterna» (inventato): mappa SVG inline, ~20 luoghi in 5 categorie, elenco filtrabile + «aperto ora» (con cursore «Simula ora»), pan/zoom con tastiera e +/−, elenco↔mappa sincronizzati; a telefono l'elenco è un foglio sotto la mappa.
2. **Volo** · «Giornata in volo»: foto mongolfiere Cappadocia, 15 `<button>` in % sulla foto (voli: nome, orario, posti), fumetto ancorato che si riposiziona ai bordi, frecce/Tab in ordine.
3. **Giro** · «Il giro del mondo»: mappa antica, tracciato rosso `#ff3b30` che si disegna (`stroke-dashoffset`), marcatore ∞ vero (`#i-infinity`) con `getPointAtLength`, timeline di tappe/porti a scroll.
Differenza dalle altre schede: lo spazio è l'interfaccia (pan/zoom, punti su foto, scroll che guida la mappa).

## Struttura
`components/mappe-e-hotspot/`: `index.html` (suite a tab, come `tabelle-e-confronti`), `mh.css`, `i18n.js` (IT/EN/ES, chiavi letterali) + cartelle `quartiere/`, `volo/`, `giro/` (ognuna `index.html`, `style.css`, `script.js`). Dati in testa a ciascun `script.js`. Nomi propri inventati in italiano con `lang="it"`. Da aggiungere nel sito madre (`lab-components.ts` + `i18n/lab.ts`, Navigazione) con la bozza.

## Asset (fatti)
- `volo/img/mongolfiere.webp` 1600×1067, 53 KB (Daniel Seßler, Unsplash).
- `giro/img/mappa-antica.webp` 1400×728, 168 KB, grigi, solo i due emisferi (Visscher, Europeana/Rijksmuseum, pubblico dominio). Caricare solo a tab visibile. Porti: coordinare a occhio sul 1400×728 e verificare con screenshot.
- Script `Assets/Lab_Componenti/_build/prep-mh.py`; crediti già in `CREDITS.md`.
- `quartiere/mappa-bozza.svg`: sfondo viewBox 800×524 (isolati, fiume curvo, parco+stagno, viale). **Da rifinire:** i ponti sono bastoncini che sbordano dal fiume; poi i punti si generano da JS nei vuoti degli isolati; nomi (Rio Lanterna, Giardino dei Tigli) da JS.

## Regole da ricordare
Budget peso HTML+CSS+JS ≲ 60 KB gzip, immagini ≲ 300 KB. Controlli: `viewports.mjs core` (1536×695, 1366×600, 360), `i18n-check`. Niente test formali; axe + PSI dopo il deploy a Lab concluso. Nessun push senza via.

## Tab 1 «Quartiere»: com'è fatto (bozza 9/11)
- File: `index.html` (guscio, 1 tab), `mh.css` (comune: riquadro, interruttore, forme dei punti), `i18n.js` (35 chiavi IT/EN/ES, ok), `quartiere/{index.html,style.css,script.js}`. `mappa-bozza.svg` eliminato: la mappa è generata da JS (isolati, parco con alberi a seme fisso, fiume con ponti calcolati sulla curva).
- Punti = veri `<button>` in % sul riquadro, controscalati con `scale(1/var(--z))`; `tabindex=-1` (da tastiera si usa l'elenco). Forme + pieno/vuoto (aperto/chiuso) oltre al colore. Fumetto ancorato che si sposta ai bordi.
- Pan (trascinare; clic sullo sfondo chiude il fumetto), zoom +/−/reset, Ctrl+rotella, frecce/+/−/0 con la mappa a fuoco. `touch-action: pan-y` finché non è ingrandita.
- Elenco `contain: size` (non allunga il riquadro); sotto 36rem di contenitore va sotto la mappa (max 13rem).
- Controllato con `viewports.mjs core` (nessun overflow; sotto 768 la pagina scorre, voluto) e un giro con `drive.mjs` (selezione, zoom, «aperto ora», simula ora).
- **Non fatto/da decidere:** zoom con i bottoni centrato sul punto scelto; il guscio con un solo tab mostra «1 elementi in questa scheda» (si sistema con i 3 tab); non aggiunta ancora nel sito madre (si fa con la scheda completa); nessuna prova su telefono vero, Firefox/Safari, lettore di schermo; pinch su touch non gestito.

## Tab 3 «Giro»: com'è fatto (bozza 9/11 sera, da approvare)
- File: `giro/{index.html,style.css,script.js}`, chiavi `gi.*` in `i18n.js` (EN/ES, `i18n-check` ok), bottone nel guscio. Il `<symbol id="i-infinity">` è copiato nella pagina (nero sul chiaro via `--ink`).
- Viaggio di Magellano/Elcano 1519-1522, 9 tappe. Percorso in 3 tratti (`RUNS` in pixel 1400×728) perché la mappa è a due emisferi: esce da un bordo e rientra dall'altro. Ogni tratto è un `<path>` a sé (il dash riparte a ogni sottopercorso); lunghezze con `getTotalLength`, marcatore con `getPointAtLength`. Tratto e marcatore in unità utente scalate con `--k` (restano leggibili a telefono).
- Controlli: `<input type=range>` con tacche alle tappe, prev/next, «Riproduci» (20 s; con reduced-motion una tappa ogni 2 s), porti = `<button>` in %. Si apre alla tappa 4 (la miniatura mostra già il rosso).
- Coordinate dei porti stimate a occhio: da verificare sulla mappa (Cebu/Tidore vicine, Sanlúcar sulla costa). Ultima tappa = prima (nessun bottone sulla mappa, si raggiunge col passo avanti).
- Controllato con `viewports.mjs core` (nessun overflow; 1366×600 con la mappa ristretta da `100svh - 16rem`). Non fatto: telefono vero, Firefox/Safari, lettore di schermo; scheda non ancora nel sito madre.

## Tab 2 «Volo»: com'è fatto (bozza 9/11)
- File: `volo/{index.html,style.css,script.js}`, chiavi `vo.*` in `i18n.js` (EN/ES, `i18n-check` ok), bottone nel guscio. Nel `script.js` si usa `LabI18n.t(...)` scritto per esteso (il controllo non vede alias come `T`).
- Punti = **piccolo punto luce** (0,5 rem) al centro del pallone, con alone che respira piano (3,8 s, sfalsato, solo con la foto in vista); niente anelli (rovinavano la foto: scelta dell'autore 9/11). Ingresso a cascata lenta una volta sola; hover/focus = punto più grande + nome; selezionato = punto rosso con bordo bianco; al completo = punto vuoto senza luce. Invito «tocca un pallone» nella barra. Se la foto cambia (palloni più grandi) i raggi `r` in `FLIGHTS` non servono più.
- Fumetto in px, riposizionato dentro la foto (sopra o sotto, freccina che segue il punto); Esc/clic sul cielo lo chiude; anelli che pulsano solo con la foto visibile (`.is-live`); anello tratteggiato = volo al completo.
- Largo e basso: la foto si restringe con `100svh` per stare senza scroll nel guscio (1366×600 ok).
- Non fatto: telefono vero, Firefox/Safari, lettore di schermo; scheda non ancora nel sito madre (si fa con la scheda completa).
