# Loop Studio Lab — Contesto per Claude

Repo `Loop-Studio-Web/lab` (remoto `https://github.com/Loop-Studio-Web/lab`), pubblicata come **GitHub Pages**
su `loop-studio-web.github.io/lab/`, nessun build. Contiene i **Componenti** (schede dimostrative, una cartella
ciascuna in `components/<id>/`) e gli **Esperimenti**. Il sito madre (repo `Loop-Studio`) li presenta in
`/lab/` con una miniatura e una modale "Prova dal vivo" che incornicia la pagina in un iframe.
Regole generali, due PC, org GitHub, commit/push: nel CLAUDE.md di `Loop-Studio` (valgono anche qui).
Spiegare cosa si fa e perché (l'autore è alle prime armi con Astro), critiche oneste.

## Flusso di lavoro

Si procede a **lotti**: ogni lotto si costruisce, si mostra all'autore (link `http://localhost:8765/components/<id>/`),
si raccolgono le correzioni, poi il lotto dopo. **Collaudi sul Lab (regola dell'autore, 22/10/2026): niente test formali**
(niente Impeccable `detect`/`critique`, niente Lighthouse locale): solo **axe** e **PageSpeed Insights con la chiave**, DOPO il
deploy, sulle pagine online. **Commit solo con l'ok dell'autore, push solo dopo il via esplicito** (il deploy parte dal push su `main`).

## Struttura

- `components/_shared/` — **tutto ciò che è condiviso, riusare prima di scrivere**:
  - `base.css`: variabili (palco scuro: `--bg #000`, `--surface #1a1a1a`, `--line`, `--text`, `--muted`, `--accent #ff3b30`,
    `--font-display`, `--font-text`, `--ease-out`, `--ease-in-out`), reset, struttura tipo `.demo` / `.demo__head` /
    `.demo__section` / `.demo__label` / `.stage` / `.demo__note`, `.sr-only`, regola `prefers-reduced-motion`
    (eccezione `[data-motion-ok]` per loader/avanzamenti).
  - `studio.js` + `studio.css` + `logo-on-dark.svg`: **componente unico "firma dello studio"** (logo piccolo e sobrio in
    alto a sinistra + "Realizzato da" in fondo, link a `https://theloopstudio.org/` in nuova scheda). Ogni pagina ha solo
    `<script src="../_shared/studio.js"></script>` prima di `</body>`. Mai copiare il blocco nelle pagine.
  - `fonts/`: Bricolage Grotesque, Hanken Grotesk, Anton, Jura 500 (+ licenze OFL).
  - `img/`: pool di foto WebP (`*-m.webp` 900 px; `beach-l`): alpine-lake, aurora, beach, desert, fog-forest, manarola, pagoda, snow-lake, waterfall.
- `components/<id>/`: `index.html` (+ `style.css`, `script.js`, `img/`, `video/`, `fonts/` se servono). Ogni scheda apribile da sola.
- Ogni pagina nuova: `<link rel="stylesheet" href="../_shared/base.css">`, `<link rel="icon" href="data:,">`, `<html lang="it">`,
  titolo "Nome — Loop Studio Lab", `<main class="demo">`, il tag script di `studio.js`.
- Sito madre: `src/data/lab-components.ts` (28 schede, array ordinato a mano: id = nome cartella, title, category, description,
  previewUrl) + `src/pages/lab.astro` (filtro categorie, badge conteggio). Il modal del sito ha `allow="clipboard-write"`.
  Categorie: Layout, Navigazione, Interazione, Form, Card, Feedback, Effetti, Galleria e media.

## Regole di costruzione (valgono per tutte le schede)

- **Ogni scheda deve funzionare dentro il box "Prova dal vivo"** (iframe ~70rem × 85vh) e nella miniatura (la card renderizza la pagina a
  1600×1000 scalata 0,25: la PRIMA sezione deve essere la più forte a quella misura). Niente dipendenza dalla larghezza finestra; lo scroll
  funziona solo se la pagina è più alta del box.
- Palco fisso scuro (nessun cambio col tema di sistema; solo `interruttori` mostra il cambio tema).
- Niente Tailwind/jQuery/CDN/FontAwesome/Google Fonts: font self-hosted (OFL), rem non px, veri `<button>`, `aria-expanded`/`aria-pressed`,
  tastiera e tocco, hover solo in `@media (hover:hover) and (pointer:fine)`, `:active` con `scale(.97)`, mai `transition: all`,
  `prefers-reduced-motion` sempre, `@starting-style` per le entrate, `<dialog>` nativo per i modali, link di demo con `data-demo-link`
  + `preventDefault`. Animazioni continue/pesanti **solo quando la sezione è visibile** (IntersectionObserver che mette `.is-live`;
  fuori: `animation-play-state: paused`; le animazioni SMIL si fermano con `svg.pauseAnimations()`).
- Elementi ripetuti (stelle, foglie, colonne…) generati da JS con generatore a seme fisso (mulberry32), non copiati a mano.
- Per le unità relative al riquadro: `container-type: size` + `cqw/cqh`.
- Consultare le skill di design durante la costruzione (`emil-design-eng`, `animate`).
- **Marchio**: simbolo infinito sempre quello vero (rosso `#ff3b30` + bianco, nero su fondo chiaro), mai monocolore o a mano. Nel Lab è il
  `<symbol id="i-infinity">` in `components/card/index.html` (il ramo bianco segue `--ink`; per il rosso usare il colore costante, non `--accent`,
  che alcuni scope ridefiniscono). Path originali in `Loop-Studio/src/components/InfinityMark.astro` (viewBox `521 1413 1465 753`). Usarlo dove si può.

## Trappole già incontrate

- **GitHub Pages usa Jekyll e ignora le cartelle che iniziano con `_`**: senza `.nojekyll` nella radice `components/_shared/` dà 404 online (in locale funziona, `http.server` non ha la regola). Il file c'è: non toglierlo. Dopo ogni push controllare la pagina ONLINE, non solo il locale.
- Rosso con testo bianco: `--accent` (#ff3b30) dà solo 3,5:1; per sfondi con testo bianco usare `--accent-strong` (#d42a20, ≈5:1) come fa il sito madre.
- `backdrop-filter` su un antenato fa da contenitore ai figli `position: fixed`: sfondo/blur su un `::before`.
- Margin collapsing: margine verticale su figlio `display:block` esce dal genitore → genitore `display:flex/grid`.
- Icone che ruotano (hamburger → X): righe `position:absolute; inset:50% auto auto 50%; translate:-50% -50%`.
- Una regola generica sul selettore di un'icona batte le classi dei casi: avvolgerla in `:where()`.
- `.stage` è una griglia centrata: i figli flex con larghezze in % collassano → dare `width: 100%` al contenitore.
- Attributo `height` di `<img>` batte `aspect-ratio`: aggiungere `height: auto`.
- `<symbol viewBox>` usato in un `<svg viewBox>` con lo stesso offset si sposta fuori scena: l'svg esterno deve essere `viewBox="0 0 W H"`.
- Spazio sul robot degli interruttori: `preventDefault` sempre, altrimenti scrolla.
- Toast/popup mai in avvio automatico; la galleria 3D vuole il retro visibile e la prospettiva che ingrandisce il fronte.
- Filtri SVG animati e `feTurbulence` sono pesanti: pochi elementi, poche ottave, solo quando visibili.

## Asset di lavoro e strumenti (fuori repo)

- `C:\Users\utente\Documents\Assets\Lab_Componenti\`: `fonts/` (+`licenses/`), `photos-candidate/`, `photos-new/` (+`photos-new-list.txt` con i fotografi),
  `svg/` (flask, backpack, leaves, marchi, prezzi-*, biscotto), `icons/` (Lucide), `cutouts/`, `out/img` e `out/video`, `video/` (≤0,9 MB, muti),
  `video-src/` (originali 4K, NON pubblicare), `CREDITS.md`, `_build/` (script).
  Crediti: solo la fonte (Unsplash/Pexels), mai per singola foto. Idee sorgente: `C:\Users\utente\Documents\Assets\Vetrine\Ispiration_Components`
  (txt e zip CodePen "free to use"; i loro testi/font/immagini remoti vanno sostituiti con nostri).
- **Server di prova**: `python -m http.server 8765` dalla radice del Lab, in background (porta libera prima; fermare solo il processo avviato da noi, mai `taskkill /IM`).
- **Screenshot/test**: `node C:\Users\utente\Documents\Assets\Lab_Componenti\_build\drive.mjs <url> <outDir> <W> <H> <steps.json> [mobile]`;
  passi `{eval, wait, shot, key, mouse:[x,y]}` (`mouse` = puntatore vero, scatta `:hover`); stampa gli errori JS. Per misurare dove cliccare: `eval` di `getBoundingClientRect()`.
- Python con Pillow/numpy/scipy/rembg: `C:\Users\utente\tools\img-venv\Scripts\python.exe`. Script di build in `_build/` (es. `build_card_img.py`).
- Foto: Unsplash blocca curl (non aggirare): WebSearch → WebFetch della pagina foto per l'id CDN, poi `curl images.unsplash.com/photo-<id>?w=2400&q=80&fm=jpg`. Pexels video: `curl https://www.pexels.com/download/video/<id>/`.
- Per scrivere file lunghi usare lo strumento Write (gli heredoc di Bash con tanti apici possono fallire in silenzio).

## Stato del rinnovo dei Componenti (aggiornato 2026-10-22)

Rinnovo chiuso a livello di codice: **28 schede**, le 14 vecchie eliminate senza recuperi (restano solo nella storia di git).
Tutto **committato/pronto in locale ma NON pushato** (Lab: lotti 1-4 + chiusura; sito: `lab-components.ts` nuovo, `allow="clipboard-write"`,
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

1. Via esplicito → push del Lab e del sito (deploy automatico); verificare la pagina `/lab/` online (28 card, filtri, miniature, modal "Prova dal vivo").
2. **axe** e **PSI con la chiave** sulle pagine online (nessun altro collaudo). Prova su telefono vero a discrezione dell'autore; filtri SVG e
   `feTurbulence` (sfondi, bordi) sono i candidati a rallentare su telefoni lenti.
3. **Esperimenti** (dopo): 5 slider a schermo intero sono troppi (ne terrei 2-3); la GSAP draggable zoom grid (zip `2026-07-14-draggable-zoom-grid-gallery-using-gsap`)
   = nuovo Esperimento con contenuto nostro. Anche gli Esperimenti vanno firmati con il logo (`studio.js`).
