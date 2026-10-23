# Loop Studio Lab — Contesto per Claude

Repo `Loop-Studio-Web/lab` (remoto `https://github.com/Loop-Studio-Web/lab`), pubblicata come **GitHub Pages**
su `loop-studio-web.github.io/lab/`, nessun build. Contiene i **Componenti** (schede dimostrative, una cartella
ciascuna in `components/<id>/`) e le **Demo** (ex "Esperimenti", rinominate il 23/10/2026). Il sito madre (repo `Loop-Studio`) li presenta in
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
- Sito madre: `src/data/lab-components.ts` (29 schede, array ordinato a mano: id = nome cartella, title, category, description,
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

## Stato (aggiornato 2026-10-23)

Tutto **pubblicato** (online = `origin/main`): **29 Componenti** e **15 Demo**. Cronaca, scelte e trappole di ogni lotto e di ogni Demo: **`docs/demo-e-rinnovo.md`** (leggerla prima di toccare quella pagina).

- **Demo** (stanno nella RADICE del Lab, non in `components/`; dati e schede nel sito madre in `src/data/lab-demos.ts`): `3d-medusa`, `3d-infinito`, `3d-farfalla`, `storytelling-css`, `galleria-trascinabile`, `galleria-riordinabile`, `booking-widget`, `google-reviews-widget`, `preventivatore`, `menu-su-misura`, `report-social`, `convertitore-valute`, `faq-ricerca`, `skyTracker`, `calendario`. Slider: una sola scheda `components/slider/`; le vecchie cartelle `animals-webpage`, `movies-slider`, `slider-fruit-soda`, `slider-magic-effects`, `starbucks-coffee`, `vertical-slider` (→ `components/slider/#id`) e `three-js-animation` (→ `3d-medusa/`) sono rimandi di una riga: le card vecchie online puntano a loro.
- **Sorgenti fuori da questa repo** (repo private su `Loop-Studio-Web`, cartelle in `Websites\`): `lab-booking-widget`, `lab-google-reviews-widget`, `lab-preventivatore` (React/Vite: `npm run build`, poi copiare `dist/*` nella cartella della Demo; `npm test` per il calcolo), `lab-calendario` (Astro, cartella `Lab-Calendario-demo`: `npm run build`, copiare `dist/index.html` e `dist/assets`), e i Worker `lab-meteo-worker` e `lab-cambio-worker` (online su `domenicociardullo85.workers.dev`; le chiavi sono secret di Cloudflare, mai in repo; PowerShell: `npx.cmd`).
- **Collaudi (23/10, dopo il deploy):** axe 0 violazioni su 15 Demo + `/lab/`; PSI mobile 87-100 su 12 Demo su 15. Le tre scene Three.js (infinito 35, farfalla 61, medusa 78) hanno un TBT enorme perché PSI disegna WebGL in software (SwiftShader): su un telefono con GPU non c'è; `kit.js` già mette in pausa fuori vista e limita il pixel ratio. SEO 91 ovunque = manca la meta description (demo in iframe, ignorato); `calendario` SEO 60 = `noindex` voluto.
- **Come si fa un collaudo axe:** `drive.mjs` con un passo `eval` che inietta `axe-core` (CDN con versione fissata) e fa `await axe.run()`; a volte la prima prova dà `load-error` o un errore Trusted Types: riprovare. Controllare che il server locale (8765) sia vivo, altrimenti si collauda una 404 (tutte le pagine "uguali" = 404).
- **Aperti, noti:** `bordi-animati` mobile ~72 (TBT; rimedio = cambiare tecnica, decisione dell'autore); SkyTracker usa icone 64 px mostrate a 90 (best-practices 96); `menu-su-misura` CLS 0,05 residuo; il conto alla rovescia NON è una Demo: l'autore lo vuole come concept nella repo `vetrine`.
