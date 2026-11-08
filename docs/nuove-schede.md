# 15 schede nuove — concept APPROVATO (2026-11-08, fase 1 chiusa)

Ognuna è una suite a tab (stesso guscio `_shared/suite.css/.js` dei raggruppamenti). Ordine = lotti di costruzione.
Prima di costruire una scheda: fase 2 (struttura cartelle, dati, asset), poi bozza all'autore, poi (solo dopo il deploy) axe + PSI.

## Lotto 1 (veloci e forti)
1. **Prima / Dopo** — cursore trascinabile, tendina, tasto di scambio, lente. Serve coppia di foto libere con crediti (nel pool non ce ne sono).
6. **Blocchi di fiducia** — contatori al passaggio, barre, striscia certificazioni, testimonianze.
8. **Contatto rapido** — bottone flottante (WhatsApp/telefono/orari), barra CTA mobile, assistente a domande guidate senza AI.
5. **Filtri e griglie che si riordinano** — filtri, ordinamento, ricerca live, griglia/lista con FLIP, dettaglio con morph.

## Lotto 2 (il lavoro vero)
2. **Palette comandi ⌘K** — `<dialog>`, tastiera, gruppi, scorciatoie.
3. **Form a passi** — validazione nativa, avanzamento, bozza salvata, upload trascinando, riepilogo.
7. **Tabelle e confronti** — intestazione fissa, righe espandibili, ordinamento, a telefono diventano carte.
4. **Mappe e hotspot** — mappa SVG senza tessere/cookie di terzi, elenco filtrabile «aperto ora», punti cliccabili su foto.

## Lotto 3 (wow)
9. **Immagini con shader** — WebGL puro (niente Three.js), fallback CSS, attivo solo se visibile.
10. **Vetro e materiali** — vetro liquido (filtri SVG), smerigliato, metallo, carta, grana. Fallback dichiarati (il forte è solo Chrome).
12. **Transizioni tra pagine** — mini sito di 3 pagine, view transitions cross-document, fallback pulito.
13. **Gesti e fisica** — carte da scartare, pannello dal basso, trascina-e-lancia, tira per aggiornare (`apple-design`, `mobile-native`).

## Lotto 4 (più pesanti)
11. **Scroll cinematografico** — sequenza di frame su canvas, scena fissata, scorrimento orizzontale. Servono frame da un video: PESO da tenere sotto controllo.
14. **Grafici** — linee, ciambella, barre, mappa di calore, mini-grafici, tooltip accessibili (skill `dataviz`).
15. **Solo CSS 2026** — `::scroll-marker`, anchor positioning, barra che si nasconde, `corner-shape`, scroll-spy. Ogni elemento con fallback e nota sui browser (verificare caniuse prima).

## Riserve
Configuratore di prodotto; lightbox con zoom/gesti; barra accessibilità (overlay discussi: mai presentarla come conformità); conto alla rovescia resta fuori (repo `vetrine`).

## Peso (preoccupazione dell'autore)
Budget proposto per scheda, pagina iniziale: HTML+CSS+JS ≲ 60 KB gzip; immagini WebP/AVIF ≲ 300 KB; tutto ciò che è pesante (frame, shader, video) si carica solo a tab/sezione visibile (`loading=lazy`, IntersectionObserver). Misurare su ogni bozza il trasferimento reale.
Hosting: vedi decisione GitHub Pages vs Cloudflare in `docs/TODO.md`.
