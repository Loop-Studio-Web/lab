# Scheda «mappe-e-hotspot» (Lotto 2, categoria Navigazione)

Stato 9/11: fasi 1-3 chiuse (concept, struttura, asset approvati dall'autore). Prossimo: **bozza del tab 1 da sola**, mostrarla, poi tab 2 e 3.

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
