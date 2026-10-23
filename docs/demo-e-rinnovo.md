# Lab: cronaca del rinnovo e delle Demo, scelte e trappole di ogni pagina

Spostato da `CLAUDE.md` il 23/10/2026 per snellirlo (si carica a ogni sessione). **Da leggere solo quando si tocca quella pagina.** Lo stato attuale e le regole sempre valide stanno in `CLAUDE.md`.

## Stato del rinnovo dei Componenti (aggiornato 2026-10-22)

Rinnovo chiuso a livello di codice: **28 schede**, le 14 vecchie eliminate senza recuperi (restano solo nella storia di git).
Tutto **committato e pubblicato il 22/10** (Lab: lotti 1-4 + chiusura; sito: `lab-components.ts` nuovo, `allow="clipboard-write"`,
testi di `lab.astro`). Si pusha dopo il via esplicito, controllando prima l'allineamento git su entrambe le repo; il sito va pushato
DOPO (o insieme) al Lab, perché le sue `previewUrl` puntano alle nuove cartelle su GitHub Pages.

- **Lotti**: 1 bento-spotlight, toast-notification, sticky-navbar, rotating-image-gallery, video-trailer-popup · 2 bottoni, like, interruttori,
  hamburger, campi-testo, loader, prezzi-toggle, tab-segmented, stepper-timeline, cookie · 3 card, flip-card, bordi-animati, sfondi, cursori,
  galleria-fisarmonica, marquee-loghi · 4 effetti-testo, menu-hover, campanella, orario-arco, stelle-voto, copia-appunti.
- **Scelte da ricordare (lotto 4)**: i due effetti di testo a scorrimento seguono lo scroll della PAGINA (`view-timeline: --card` sul riquadro,
  range `cover 0% → 45-50%`; uno scroller proprio cattura la rotella a metà); `sibling-index()`/`sibling-count()` sono sperimentali, quindi `--i`/`--count`
  inline come fallback. Campanella parte ACCESA (miniatura più forte). Orario-arco: due istanze dallo stesso codice, demo d'ingresso `data-sweep`
  solo sulla prima. Stelle-voto: stelle ORO (non palette, riconoscibili). Copia-appunti: ripiega su `execCommand` se `clipboard-write` manca.
  Trappola: un `<button>` eredita `text-align: center` e sposta i pseudo-elementi assoluti senza offset → `text-align: start`.

## Prossimi passi

1. Fatto il 22/10: tutto pubblicato (ultimo Lab `4cb0971`), `/lab/` online verificato, **axe 0 violazioni** su `/lab/` + 28 schede, **PSI mobile**
   `/lab/` 97, schede campione 98-100, a11y 100, **CLS 0** (era 0,198 su sfondi: misure del logo spostate in `base.css` + preload dei font).
   SEO 91 sulle schede = manca la meta description (demo in iframe, ignorato).
   **Aperto, noto**: `bordi-animati` mobile ~72 (TBT ~1,5 s). Non è il filtro elettrico: sono i due alone (`.glow`, filtro SVG
   con `feMorphology`/blur + gradiente conico animato) che ricalcolano il bordo a ogni fotogramma sulla CPU; prima la sezione era fuori dal primo
   schermo mobile e il punteggio sembrava 98. Già fatto: alone animato solo se in vista, un solo rumore per seme nell'elettrico. Stringere l'area dei
   filtri non serve (misurato). Rimedi veri = cambiare tecnica (es. gradiente ruotato con `transform`, alone con `box-shadow`): decisione dell'autore.
2. Prova su telefono vero a discrezione dell'autore; filtri SVG e `feTurbulence` (sfondi, bordi) sono i candidati a rallentare su telefoni lenti.
3. **Demo (ex Esperimenti): riorganizzazione del 23/10/2026**, lotto 1 fatto. Sezione rinominata "Demo" (i Componenti
   restano "Componenti"; "esperimenti" è ormai solo la pagina personale di Domenico). Stato:
   - **Slider**: UNA scheda `components/slider/` (Componente n. 29); le 6 vecchie cartelle sono rimandi di una riga. Diritti risolti (locandine
     film nostre, etichetta lattina nostra, moda = foto Unsplash con fotografo citato sotto OGNI slide, animali e magic free to use).
     Trappola: `@container` non può stilare il contenitore stesso → variabili sui figli o `@media`.
   - **Demo (7)**: `calendario`, `booking-widget`, `google-reviews-widget`, `skyTracker`, `3d-medusa`, `3d-infinito`, `3d-farfalla`. Widget e SkyTracker
     ripuliti (font dal pool via `base.css`, firma `studio.js`, niente CDN/FontAwesome). Sorgenti React in repo private
     `lab-booking-widget` / `lab-google-reviews-widget` (clonate in `Websites\`, build con `npm run build` e copia di `dist/*`).
     Proxy meteo di SkyTracker: dal 24/10 è il Worker `lab-meteo` (`https://lab-meteo.domenicociardullo85.workers.dev`, repo `Websites\lab-meteo-worker`, chiave come secret `WEATHER_API_KEY`
     messa dall'autore, cache 10 min, risposta ridotta, testi in italiano). Il VECCHIO `skytracker-weather-proxy` rispondeva 403 all'origine `loop-studio-web.github.io` (il SkyTracker online era
     già rotto): da ritirare DOPO il push e la verifica online. Stessa chiave del vecchio (l'autore non l'ha cambiata).
   - **3D**: l'ape (modello CC-BY, 28 MB) è sostituita da tre pagine procedurali, ciascuna con foto Unsplash di fondo (crediti in pagina e in
     `Assets\Lab_Componenti\CREDITS.md`). Codice condiviso in `components/_shared/three/` (`kit.js` + three r129 minificato, `RoomEnvironment`); gli
     import usano un import map per `three`. Gli anelli dell'infinito vengono da contorni tracciati (`3d-infinito/marchio.js`), non dai path SVG,
     che si auto-intersecano. `three-js-animation/` è solo un rimando a `3d-medusa/`. In GLSL mai `smoothstep(a,b,x)` con a>b: usare `1.0 - smoothstep(b,a,x)`.
   - **Ondata A, fatte in bozza (24/10)**: `storytelling-css/` (storia a scorrimento in solo CSS: una timeline nominata
     `--storia`, palco sticky con margine negativo, `offset-path`, `@property` integer per la quota; fallback impilato con `display:contents` + `order`;
     `@property` va a livello radice, non dentro `@supports`) e `galleria-trascinabile/` (GSAP Draggable+Flip+Inertia in `components/_shared/gsap/`,
     tessere `<button>`, dettaglio `<dialog>`, suono spento di default con pulsante "Suono"; audio in `audio/`, Web Audio dopo un gesto; la foto che vola
     usa il file grande con `object-position` uguale al punto focale del ritaglio 4:5 così il passaggio non salta). Trappola: Draggable fa `preventDefault`
     sul mousedown, quindi il clic col mouse non mette il focus sulla tessera (il ritorno del focus vale per la tastiera).
   - **Galleria da riordinare** (24/10): `galleria-riordinabile/`, 16 foto di animali (Unsplash, fotografi nel codice e nei crediti), mosaico
     la cui FORMA dipende dalla posizione (`:nth-child`: 1ª 2×2, 4ª 2×1, le prime 4 = vetrina). Solo GSAP core + Flip (`gsap.min.js`, `Flip.min.js`), niente Draggable: il
     trascinamento è fatto con pointer events (una COPIA `.fantasma` fixed segue il puntatore, la cella originale diventa segnaposto tratteggiato e si riordina nel DOM
     con `Flip.getState` → `killFlipsOf` → `clearProps` → mutazione → `Flip.from`). Mouse da qualunque punto, tocco solo dalla maniglia (`touch-action: none` solo su
     quella, altrimenti la pagina non scorre), tastiera Spazio/frecce/Esc con regione `aria-live`. Salva = localStorage. Proiezione a tutto schermo con luce ambiente
     (stessa foto sfocata), swipe, link al fotografo. **Trappole**: (1) un `::before` è il primo figlio e un'immagine posizionata dopo lo copre → velo di contrasto
     e anello vanno con `z-index` esplicito; (2) un `outline` su un bottone che contiene un'`<img>` viene dipinto SOTTO l'immagine: per l'anello di focus/sollevata
     usare un `::after` sulla cella (`:has(.tessera:focus-visible)`); (3) `setPointerCapture` va fatto SOLO quando il trascinamento parte (a `pointerdown` sposterebbe
     il `click` sul contenitore); (4) spostare un nodo nel DOM gli toglie il focus: dopo `Flip` rimettere `focus()` e ignorare il `focusout` con un flag; (5) misurare il
     contrasto delle etichette sullo sfondo SENZA testo (nascondere `.tessera__testi` e fotografare), altrimenti i bordi sfumati delle lettere falsano la misura.
   - **Sito madre**: `src/data/lab-demos.ts` (le demo non stanno più in `portfolio-projects.ts`), filtro per categoria condiviso (`CategoryFilter.astro`),
     titolo e introduzione alla sezione, screenshot 16:9 rigenerati. Categorie: Animazioni 3D, Scroll e gallerie, Widget e strumenti, Dati e API (decise il 23/10).
   - **Report social** (24/10): `report-social/` (`data.js` dati finti di un'attività di fantasia, "Osteria Lunapiena", generati con seme fisso
     nella FORMA delle API di Instagram; `script.js` calcola 7/30/90 giorni vs periodo precedente e disegna tutto in SVG/HTML, niente librerie). Regola dei grafici: un
     protagonista rosso, il resto grigio, mai testo rosso. Linea con curva monotona, descrizione al passaggio/frecce, vista Tabella (anche mappa oraria), «In breve» scritta
     dal codice, barre che si riordinano (`--r` + `translate` su righe assolute di altezza fissa), mappa `color-mix`. Sotto 52rem i contenuti migliori sono una fila a scorrimento
     (`scroll-snap`). **Trappole**: `Intl` it-IT non mette il punto nei numeri a 4 cifre (`useGrouping: 'always'`); `container-type` sul `.rep` fa valere `cqw` nei figli;
     `drive.mjs` accetta i tasti " ", Tab, Enter, ArrowLeft/Right, Home, End (ArrowUp/Down crashano: `dispatchEvent` in `eval`; pulisce da solo il profilo di Chrome) e uno step con due `eval` perde il primo.
   - **Preventivatore FATTO (24/10, approvato)**: `preventivatore/` = build Vite+React della repo `Websites\lab-preventivatore` (da creare su `Loop-Studio-Web/lab-preventivatore` al push;
     `npm run build`, copia di `dist/*`, `npm test` per il calcolo). Impresa di fantasia "Ti Pittu" (nome dell'autore). Identità PROPRIA e chiara (carta, inchiostro, blu `#0267b6` dal logo,
     Cormorant + Noto Sans Mono dal pool) perché il widget è del cliente e deve sembrare diverso da booking. Tutti i prezzi in `src/prezzi.js`, calcolo puro in `src/calcola.js`, scelte
     nell'hash dell'URL (`stato.js`), scontrino sticky (barra in basso sotto 52rem, normale nell'ultimo passo). **Trappole**: Cormorant ha cifre old-style di default → `font-variant-numeric: lining-nums`;
     `position: static` sullo scontrino sposta lo zigzag `::after` assoluto (usare `relative`); `url()` dei font nell'`index.html` sorgente (non nel CSS importato, Vite non li risolve); più `click()` nello
     stesso `eval` di `drive.mjs` non lasciano ridisegnare React (serve `wait` tra un passo e l'altro). Aperto: il logo è IA? (CREDITS.md) e se dichiararlo.
   - **Menù su misura** (24/10): `menu-su-misura/` = Osteria Lunapiena (la stessa del Report social), 10 piatti + 5 bevande, JS puro + GSAP core/Flip, niente framework.
     `data.js` descrive ogni piatto per INGREDIENTI (`a` = allergeni, `togli` = si può non servire, `tracce` = allergeni non ingredienti); `valuta()` in `script.js` ne ricava lo stato
     `si` / `chiedi` (adattabile o solo tracce) / `no` (+ frase pronta). Fasce e card sono `li` di una stessa `ol`: senza scelte "Da mangiare"/"Da bere", con scelte "Per te"/"Chiedi in sala"/"Non per te";
     le card si riordinano con Flip (le fasce solo in dissolvenza). Scelte nell'hash (`#glutine,latte`), barra di riepilogo sticky, scheda piatto e cartello "Mostra al cameriere" (IT+EN) in `<dialog>`.
     Icone allergeni = foglio dell'autore (generato con ChatGPT, dichiarato in pagina) ritagliato (WebP con alpha in `img/allergeni/`, `iconaAllergene()` in `script.js`) su tondo avorio `.ai` CON contorno scuro (4 `drop-shadow` da 0,7px): senza, le parti bianche (latte, uovo) spariscono sull'avorio e le nere sul fondo notte.
     Identità propria (notte + luna, non il nero/rosso dello studio). **Trappole**: la spia dei chip ha misura fissa, sennò scegliere un allergene fa andare a capo gli altri e sposta le card; il velo di
     contrasto sta in `.piatto__testi::before` (segue l'altezza del testo: con la riga del motivo il velo fisso falliva a 4,07:1; ora ≥ 6,1:1); per misurare il contrasto nascondere SOLO le parole, non il
     blocco che contiene il velo; in `drive.mjs` `eval` e `wait` nello stesso passo: l'eval parte PRIMA dell'attesa (separarli) e il tasto Escape non esiste (chiudere il dialog con `.close()`).
   - **Convertitore di valute** (24/10): `convertitore-valute/` = agenzia di fantasia "Tre Timbri" (Kyoto, Marrakech, New York, Londra), JS puro (modulo ES), niente librerie.
     Cartoline con prezzi nella valuta scelta + biglietto del cambio (importo, da/a, risultato) + grafico SVG 30/90 giorni (puntatore e frecce, `role="slider"`). I tassi NON si chiamano dal browser:
     arrivano dal Worker `lab-cambio` (repo `Websites\lab-cambio-worker`, `/rates` e `/series`, cache 1 h / 6 h, CORS solo per le nostre origini, dati Frankfurter v2 = banche centrali, MAD viene dalla banca del Marocco, non dalla BCE).
     `API` in `data.js`: in locale `http://127.0.0.1:8787` (`npx wrangler dev` nella repo del Worker), online `https://lab-cambio.domenicociardullo85.workers.dev` (DEPLOYATO e provato il 24/10: cache HIT, CORS per Pages e sito, 403/400; account Cloudflare = quello dell'autore, lo stesso del proxy meteo).
     Se il Worker non risponde: tassi di esempio (`TASSI_ESEMPIO`) e timbro tratteggiato. Identità propria e CHIARA dentro il palco scuro (foglio sabbia, terracotta `#a63a18`, petrolio, senape; Anton + Hanken + Playwrite IS solo per gli appunti).
     **Trappole**: `date` di `/rates` = la più vecchia tra le valute (le altre sono datate un giorno dopo); la serie non passa `to` (Frankfurter arriva all'ultimo giorno); la cache locale di `wrangler dev` sopravvive ai riavvii (`.wrangler/state`);
     terracotta `#b8431f` falliva il contrasto sulla sabbia (4,3:1) → `#a63a18`; `Intl` it-IT scrive "USD" e non "$" (voluto, non ambiguo).
   - **FAQ con ricerca** (23/10): `faq-ricerca/` (NELLA RADICE del Lab come le altre Demo, non in `components/`) = ciclofficina di fantasia "Pedivella" (nome cercato sul web:
     "Pedalia" esiste, "Pimp My Bike" è usato altrove), JS puro a moduli, niente librerie. `data.js` = 24 domande in 5 temi, ciascuna con `affini` (sinonimi che il cliente potrebbe scrivere, non mostrati);
     `script.js`: normalizza (minuscole, senza accenti), `grado()` 3 uguale / 2 inizio parola / 1 un errore (distanza di Damerau-Levenshtein, stessa lettera iniziale), pesi titolo > affini > corpo, AND tra le parole
     (se nessuna le contiene tutte, ripiega su OR e lo dichiara), parole vuote ignorate. Evidenziazione con **CSS Custom Highlight API** (`::highlight(trovato)`, Range sui nodi di testo: per questo titolo e risposte sono
     nodi di testo semplici, niente markup dentro), senza ripiego `<mark>`. Estratto sotto la domanda chiusa (pezzo della risposta con la parola; se è solo un sinonimo, l'inizio della risposta). Stato nell'hash (`#q=…&t=…&r=…`,
     `replaceState`); `r` = risposta aperta, `Copia link` riproduce lo stato. Dati strutturati FAQPage generati dallo script. Identità: abete `#103a24`, lime `#d7e51c`, avorio; Jura 500 + Hanken + Noto Sans Mono.
     Logo **generato con Gemini** (dichiarato in pagina), foto di sfondo di camera obscura (Unsplash) **solo sfocata** (`img/officina-sfocata.webp`, 60 KB): nell'originale si leggono SONY, Michelin, Kenda, ecc. Crediti in `CREDITS.md`.
     **Trappole**: (1) la `mask` con le tacche del tagliando taglia anche `outline` e `box-shadow` fuori dalla carta → anello del focus con `outline-offset` negativo; (2) un `<button>` eredita `text-align: center` (`text-align: start`);
     (3) una griglia con figli a scorrimento orizzontale si allarga oltre lo schermo senza `grid-template-columns: minmax(0, 1fr)`; (4) nelle regole dentro `@container` serve più specificità se la regola base è scritta dopo;
     (5) `toggle` di `<details>` arriva in ritardo: per distinguere apertura nostra e dell'utente si usa un valore atteso (`v.atteso`), non un flag con `setTimeout`; (6) `drive.mjs` non conosce i tasti `/` e le frecce su/giù: `dispatchEvent`
     con `KeyboardEvent` nell'`eval`, e il clic vero (per la clipboard) con `down`/`up` alle coordinate. `::details-content` (apertura animata) solo Chrome/Edge: altrove si apre di colpo. Non provata su Safari/Firefox né su telefono vero.
   - **Prossimi**: ondata B resta il conto alla rovescia (più un Componente che una Demo: valutare). A fine lotto: README
     (aggiungere le Demo nuove e il badge del conteggio), push (Lab prima del sito), axe + PSI, repo personali, proxy meteo sull'org; poi, a Demo finite, decidere se portare il Preventivatore nel sito madre
     (prezzi veri da concordare, tabelle pacchetti da leggere).
   - **Prestazioni** (skill Emil `animation-performance`, installata): `bordi-animati` ha `filter: blur(32px)` su `.electric__bloom`; 2 `transition: all`
     da togliere (`campi-testo/style.css` righe 123 e 190; quello di movies-slider è sparito con la scheda Slider).
   Anche le Demo vanno firmate con il logo (`studio.js`).
