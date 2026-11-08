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
