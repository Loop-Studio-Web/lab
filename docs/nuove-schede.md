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

## Lotti 3-4 RIVISTI (12/11/2026, concordato con l'autore): 7 schede nuove, totale 30
Oggi nel sito madre ci sono 23 schede (le suite contano una); con 7 nuove si arriva a 30. Le Demo restano 15 (il calendario è già la Demo `calendario`: niente calendario custom nei Componenti). Il numero non è tassativo, ma ci si ferma a 30 prima di aumentare; le altre idee stanno in `docs/idee-future.md`.

Nuova categoria **Mobile** (4 schede, di due registri: utile e spettacolare, perché finora il «wow» era solo desktop).
Spostamenti, senza schede nuove: `contatto-rapido` Interazione → Mobile. `tabelle-e-confronti` resta in Card.

| # | Scheda | Categoria | Note |
|---|---|---|---|
| 1 | **Gesti e fisica** | Mobile | Tab: carte da scartare, pannello dal basso (3 soste), trascina-e-lancia, tira per aggiornare. Modulo condiviso `_shared/fisica.js` (molla, velocità, rubber-band). Pointer Events, `touch-action` per asse, pulsanti equivalenti, `prefers-reduced-motion`. Skill `apple-design`, `mobile-native`. |
| 2 | **Storie e feed** | Mobile | Viewer a storie (tocco sui lati, pausa a pressione lunga, giù per chiudere), feed verticale a schermo intero con aggancio, peek con pressione lunga. Tab sperimentale «Inclinazione» (giroscopio, ripiego sul puntatore) SOLO se si riesce a provarla su telefono vero: su iOS serve un permesso e la modale del sito madre dovrebbe avere `allow="accelerometer; gyroscope"`. `navigator.vibrate` non esiste su iPhone: mai centrale. |
| 3 | **Navigazione e schermo** | Mobile | Due tab: barra in basso e zona del pollice; notch, `svh/dvh/lvh`, tastiera virtuale, `inputmode`/`autocomplete`, input senza zoom. Le regole di studio-kit in forma dimostrabile. |
| 4 | **Vetro e materiali** | Card | Vetro liquido (filtri SVG), smerigliato, metallo, carta, grana. Fallback dichiarati (il forte è solo Chrome). |
| 5 | **Transizioni tra pagine** | Navigazione | Mini sito di 3 pagine, view transitions cross-document, fallback pulito. Provare dentro l'iframe e su Pages. |
| 6 | **Solo CSS 2026** | Layout | `::scroll-marker`, anchor positioning, barra che si nasconde, `corner-shape`, scroll-spy. Ogni elemento con fallback e nota sui browser (verificare caniuse prima). |
| 7 | **Grafici** | Card | Linee, ciambella, barre, mappa di calore, mini-grafici, tooltip accessibili (skill `dataviz`). Niente categoria «Dati» per ora. |

Conteggi attesi a fine piano: Mobile 4, Navigazione 4, Interazione 4, Card 4, Layout 3, Effetti 3, Feedback 3, Galleria 3, Form 2 (30).
Sito madre: categoria **Mobile** in `src/pages/lab.astro` e `src/i18n/lab.ts` (IT/EN/ES), spostamento di `contatto-rapido`, una voce per scheda in `src/data/lab-components.ts`.
Ordine: 1 → 2 → 3 (Mobile, con prova su telefono sulla stessa rete Wi-Fi) → 4 → 5 → 6 → 7. Prima di ognuna: fase 2 (cartelle, dati, asset).

Fuori piano, passate in `docs/idee-future.md`: Scroll cinematografico, Indicatori e dashboard, Selettori, Immagini con shader, categoria Dati, riserve vecchie.

## Peso (preoccupazione dell'autore)
Budget proposto per scheda, pagina iniziale: HTML+CSS+JS ≲ 60 KB gzip; immagini WebP/AVIF ≲ 300 KB; tutto ciò che è pesante (frame, shader, video) si carica solo a tab/sezione visibile (`loading=lazy`, IntersectionObserver). Misurare su ogni bozza il trasferimento reale.
Hosting: vedi decisione GitHub Pages vs Cloudflare in `docs/TODO.md`.

---

# Fase 2 — Lotto 1: struttura (PROPOSTA 8/11, in attesa del via)

**Cartelle.** Ogni scheda = una cartella suite con le pagine dei tab *dentro*, non sorelle (niente 15×4 cartelle sparse in `components/`).
`suite.js` accetta già `data-src="cursore/"` (percorso relativo): nessuna modifica al guscio. Ogni tab resta apribile da solo.

```
components/
  prima-dopo/            index.html (guscio suite)  + img/ (coppie condivise dai tab)
    cursore/ tendina/ scambio/ lente/        ognuno: index.html, style.css, script.js
  blocchi-di-fiducia/    index.html
    contatori/ barre/ certificazioni/ testimonianze/
  contatto-rapido/       index.html
    flottante/ barra-cta/ assistente/
  filtri-e-griglie/      index.html
    filtri/ ricerca/ griglia-lista/ dettaglio/
```
Percorsi nei tab: `../../_shared/base.css`, `../../_shared/studio.js` (un livello in più). Dati di fantasia: array JS in testa a `script.js`
(nessun JSON da fetchare: funziona anche da `file://` e non aggiunge richieste). Generatori a seme fisso dove serve (mulberry32).

**Asset per scheda** (budget: pagina ≲ 60 KB gzip, immagini ≲ 300 KB):
- **Prima/Dopo**: serve UNA coppia, condivisa dai 4 tab. Proposta: ritocco *dimostrabile* dalla stessa foto del pool (es. `manarola`: grigia/spenta
  → colore; oppure sfocata → nitida), prodotto con Pillow in `prima-dopo/img/` (2 WebP ~900 px, ~80 KB l'uno). Zero crediti da gestire e il "dopo" è onesto.
  Una seconda coppia vera (restauro/ristrutturazione da Unsplash/Wikimedia con crediti) solo se la vuoi: costa ~150 KB e una riga di crediti.
- **Blocchi di fiducia**: nessuna foto. Contatori/barre da JS; certificazioni = badge SVG generici disegnati a mano (mai loghi reali);
  testimonianze con nomi e frasi di fantasia, avatar = iniziali su cerchio (nessuna foto di persone).
- **Contatto rapido**: nessuna foto. Icone SVG inline (telefono, chat, orologio); numero e orari finti (`+39 000 000 0000`); assistente = albero
  di domande/risposte in un oggetto JS, nessuna AI.
- **Filtri e griglie**: 9 foto del pool come "prodotti/luoghi" (già in `_shared/img`, 0 KB nuovi); 12-16 voci di fantasia (nome, categoria, prezzo, data)
  riusando le foto più volte con inquadrature diverse (`object-position`).

**Ordine di costruzione**: Prima/Dopo → Blocchi di fiducia → Contatto rapido → Filtri e griglie (dal più semplice al più denso). Dopo ogni scheda: link
`http://localhost:8765/components/<id>/` all'autore, correzioni, poi la successiva.

**Da decidere con l'autore prima di scrivere codice**: (a) coppia Prima/Dopo = ritocco dalla stessa foto (consigliato) o foto vera con crediti;
(b) cartelle dei tab *dentro* la suite (consigliato) o sorelle come i raggruppamenti vecchi; (c) lingua dei testi: tutto IT.

**Decisioni dell'autore 8/11:** (1) coppia Prima/Dopo = ritocco della stessa foto; (2) tab DENTRO la cartella della scheda; (3) lingua: IT in
prevalenza (~70%) con punte ES/EN **nei contenuti di fantasia** (testimonianze, nomi, domande dell'assistente), mai nei comandi/aria-label
(restano IT); frammenti con `lang="es|en"`; stringhe raccolte in un oggetto in testa a `script.js` (traduzione futura del sito).
