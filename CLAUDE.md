# Loop Studio Lab — Contesto per Claude

Repo `Loop-Studio-Web/lab` (remoto `https://github.com/Loop-Studio-Web/lab`), pubblicata come **GitHub Pages**
su `loop-studio-web.github.io/lab/`, nessun build. Contiene i **Componenti** (schede dimostrative, una cartella
ciascuna in `components/<id>/`) e gli **Esperimenti**. Il sito madre (repo `Loop-Studio`) li presenta in
`/lab/` con una miniatura e una modale "Prova dal vivo" che incornicia la pagina in un iframe.
Regole generali, due PC, org GitHub, commit/push: nel CLAUDE.md di `Loop-Studio` (valgono anche qui).
Spiegare cosa si fa e perché (l'autore è alle prime armi con Astro), critiche oneste.

## Flusso di lavoro

Si procede a **lotti**: ogni lotto si costruisce, si mostra all'autore (link `http://localhost:8765/components/<id>/`),
si raccolgono le correzioni, poi il lotto dopo. **Niente collaudi formali durante le iterazioni.** Alla fine:
Impeccable `detect` + `critique`, axe, Lighthouse, poi scheda di progetto/README. **Commit solo con l'ok
dell'autore, push solo dopo il via esplicito** (il deploy parte dal push su `main`).

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
- Sito madre: `src/data/lab-components.ts` (array ordinato a mano: id, title, category, description, previewUrl) + `src/pages/lab.astro`
  (filtro categorie, badge conteggio). **Ancora invariati**: puntano alle vecchie versioni online; si aggiornano alla chiusura.

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
  `video-src/` (originali 4K, NON pubblicare), `CREDITS.md`, `_work/` (screenshot di verifica), `_tmp/`, `_build/` (script).
  Crediti: solo la fonte (Unsplash/Pexels), mai per singola foto. Idee sorgente: `C:\Users\utente\Documents\Assets\Vetrine\Ispiration_Components`
  (txt e zip CodePen "free to use"; i loro testi/font/immagini remoti vanno sostituiti con nostri).
- **Server di prova**: `python -m http.server 8765` dalla radice del Lab, in background (porta libera prima; fermare solo il processo avviato da noi, mai `taskkill /IM`).
- **Screenshot/test**: `node C:\Users\utente\Documents\Assets\Lab_Componenti\_build\drive.mjs <url> <outDir> <W> <H> <steps.json> [mobile]`;
  passi `{eval, wait, shot, key, mouse:[x,y]}` (`mouse` = puntatore vero, scatta `:hover`); stampa gli errori JS. Per misurare dove cliccare: `eval` di `getBoundingClientRect()`.
- Python con Pillow/numpy/scipy/rembg: `C:\Users\utente\tools\img-venv\Scripts\python.exe`. Script di build in `_build/` (es. `build_card_img.py`).
- Foto: Unsplash blocca curl (non aggirare): WebSearch → WebFetch della pagina foto per l'id CDN, poi `curl images.unsplash.com/photo-<id>?w=2400&q=80&fm=jpg`. Pexels video: `curl https://www.pexels.com/download/video/<id>/`.
- Per scrivere file lunghi usare lo strumento Write (gli heredoc di Bash con tanti apici possono fallire in silenzio).

## Stato del rinnovo dei Componenti (aggiornato 2026-10-22)

Rinnovo della sezione Componenti (gli Esperimenti vengono dopo). Fasi 1-3 (concept, struttura, asset) chiuse e approvate.
**Tutto è solo locale, NON committato** (né qui né nel sito); repo allineata al remoto al 21-22/10.

- **Lotto 1 (approvato)**: bento-spotlight, toast-notification, sticky-navbar, rotating-image-gallery, video-trailer-popup.
- **Lotto 2 (approvato)**: bottoni, like, interruttori, hamburger, campi-testo, loader, prezzi-toggle, tab-segmented, stepper-timeline, cookie.
- **Lotto 3 (approvato 22/10)**: card, flip-card, bordi-animati, sfondi, cursori, galleria-fisarmonica, marquee-loghi. Con il marchio vero (borraccia, zaini, tessera, scontrino) e la firma dello studio. Cursori: SVG degli animali (da Download dell'autore) dentro un cerchio piccolo con il nome sotto.
- **Da fare, lotto 4** (sorgenti già lette, nessun file scritto):
  - **effetti-testo**, due sezioni. *Glitch*: glitch1 (hover, clip, `data-text`, foto di sfondo dal pool), glitch2 ("the deepend", Medula One, comparsa + clip casuale), glitch3 (20 passi di clip), glitch4 ("PSYCHO", Bungee Shade, `@property` + clip-path); la copia glitch è `aria-hidden`. *Altri*: unscramble scroll-driven (zip `2026-07-23-scroll-driven-text-unscramble-in-css`, Noto Sans Mono) e versione circolare "Round and round" (text_effect3): usano `sibling-index()`/`sibling-count()` (sperimentali) → mettere `--i`/`--count` inline come fallback, e funzionano solo se la pagina supera il box; ombra sfumata (text_effect1); lettere impilate (text_effect4, senza css-doodle); titolo con barre animate (text_effect4 bis, "Álvaro Montoro" → nome nostro). Font disponibili in `Assets/.../fonts`: medula-one, bungee-shade, noto-sans-mono, playwrite-is, cormorant, jura.
  - **menu-hover** (text_effect5: voci con riflesso via `text-shadow` in hover/focus, Jura, categoria Navigazione), **campanella** (zip `2026-07-14-css-hyper-realistic-animated-glowing-bell`), **orario-arco** (`Time.txt`, Inter → Hanken; forse sotto Form), **stelle-voto** e **copia-appunti** (miei).
  - Ognuna con `studio.js`, prima sezione forte a 1600×1000, reduced-motion, tastiera.
- **Esperimenti (dopo)**: 5 slider a schermo intero sono troppi (ne terrei 2-3); la GSAP draggable zoom grid (zip `2026-07-14-draggable-zoom-grid-gallery-using-gsap`) = nuovo Esperimento con contenuto nostro. Anche gli Esperimenti vanno firmati con il logo.

## Chiusura (a fine lotto 4)

1. Sito, `src/data/lab-components.ts`: 28 schede con id fissi, ordine curato (apertura con varietà), commento di testa aggiornato; facoltativo campo `variants`
   ("7 varianti"). Categorie: Layout (bento-spotlight, prezzi-toggle, stepper-timeline), Navigazione (sticky-navbar, hamburger, menu-hover, tab-segmented),
   Interazione (interruttori, bottoni, like), Form (campi-testo, orario-arco?), Card (card, flip-card, bordi-animati), Feedback (toast-notification, cookie,
   loader, stelle-voto, copia-appunti), Effetti (effetti-testo, sfondi, cursori, campanella), Galleria e media (rotating-image-gallery, galleria-fisarmonica,
   video-trailer-popup, marquee-loghi). Verificare anche i testi della pagina `/lab/` e la miniatura di ogni scheda.
2. Questa repo: aggiornare `README.md` e `index.html` (elenco "Components (prototype)", con la firma dello studio); eliminare le vecchie cartelle
   rimaste (auto-text-anim, bouncing-letter, button-ripple-effect, circular-progress-bar, circular-progress-bar2, click-effect, dark-mode-toggle,
   dark-mode2, double-click-heart, feedback-ui, loading-bar, popup-box, responsive-navbar2, sibling-fade). Prima grep dei riferimenti (oggi solo
   `lab-components.ts`, README e `index.html`). Le cartelle vecchie senza `base.css` NON hanno la firma: spariscono comunque.
3. Dopo la bozza approvata: test formali (Impeccable `detect` + `critique`, axe, Lighthouse; prova su telefono vero; filtri SVG e `feTurbulence` su telefoni lenti),
   poi scheda di progetto e README. Commit solo con l'ok, push solo dopo il via esplicito; controllare l'allineamento git su entrambe le repo.
