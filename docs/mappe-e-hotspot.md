# Scheda «mappe-e-hotspot» (Lotto 2, categoria Navigazione)

Stato 9/11: fasi 1-3 chiuse; **tab 1 «Quartiere» approvato**; **tab 2 «Volo» in bozza (9/11 sera), da mostrare all'autore**. Prossimo: correzioni su Volo, poi tab 3 «Giro» (aggiungere il bottone al guscio `index.html`).

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

## Tab 2 «Volo»: com'è fatto (bozza 9/11)
- File: `volo/{index.html,style.css,script.js}`, chiavi `vo.*` in `i18n.js` (EN/ES, `i18n-check` ok), bottone nel guscio. Nel `script.js` si usa `LabI18n.t(...)` scritto per esteso (il controllo non vede alias come `T`).
- Punti = anelli sottili (1,5 px, filo scuro; ingresso a cascata una volta sola, hover = ispessimento + nome, invito «tocca un pallone» nella barra; niente pulsare). Anelli vuoti dimensionati sul pallone (raggio per volo in `FLIGHTS`, `cqw`), così non lo coprono; tratteggiato = al completo (scelta dell autore 9/11). 15 `<button>` in % sulla foto (centri dei palloni stimati a occhio sui 1600×1067: se un punto non sta sul pallone, correggere la tabella `FLIGHTS`). Tab = ordine di decollo; frecce = pallone più vicino nella direzione (cono ±60°); frecce ‹ › sotto la foto per il tocco (a 360 i palloni vicini sono piccoli).
- Fumetto in px, riposizionato dentro la foto (sopra o sotto, freccina che segue il punto); Esc/clic sul cielo lo chiude; anelli che pulsano solo con la foto visibile (`.is-live`); anello tratteggiato = volo al completo.
- Largo e basso: la foto si restringe con `100svh` per stare senza scroll nel guscio (1366×600 ok).
- Non fatto: telefono vero, Firefox/Safari, lettore di schermo; scheda non ancora nel sito madre (si fa con la scheda completa).
