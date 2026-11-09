# Loop Studio Lab — Contesto per Claude

Repo `Loop-Studio-Web/lab` (remoto `https://github.com/Loop-Studio-Web/lab`), pubblicata come **GitHub Pages**
su `loop-studio-web.github.io/lab/`, nessun build. Contiene i **Componenti** (schede dimostrative, una cartella
ciascuna in `components/<id>/`) e le **Demo** (ex "Esperimenti", rinominate il 23/10/2026). Il sito madre (repo `Loop-Studio`) li presenta in
`/lab/` con una miniatura e una modale "Prova dal vivo" che incornicia la pagina in un iframe.
Regole generali, due PC, org GitHub, commit/push: nel CLAUDE.md di `Loop-Studio` (valgono anche qui).
Spiegare cosa si fa e perché (l'autore è alle prime armi con Astro), critiche oneste.

**A inizio sessione leggere `docs/TODO.md`** (unico punto di ripartenza: stato, prossimi passi in ordine). A ogni step chiuso
aggiornarlo, committare, dire «/clear» e dare il testo «leggi docs/TODO.md, riparti dalla prima voce». **Una voce finita o non più utile si ELIMINA subito dal TODO (niente spunte, niente sezioni «chiusi»): ogni riga letta costa token** (regola dell'autore, 2026-11-09). Lo stato dei lavori non
si scrive in memoria né qui: sta nel TODO. I progetti si gestiscono con la chat di Code aperta in questa cartella; le piccole
modifiche si possono fare anche da fuori.

## Flusso di lavoro

Si procede a **lotti**: ogni lotto si costruisce, si mostra all'autore (link `http://localhost:8765/components/<id>/`),
si raccolgono le correzioni, poi il lotto dopo. **Collaudi sul Lab (regola dell'autore, 22/10/2026): niente test formali**
(niente Impeccable `detect`/`critique`, niente Lighthouse locale): solo **axe** e **PageSpeed Insights con la chiave**, DOPO il
deploy, sulle pagine online. **Commit liberi, a pezzi logici; push solo dopo il via esplicito** (il deploy parte dal push su `main`).

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
- Sito madre: `src/data/lab-components.ts` (30 schede, array ordinato a mano: id = nome cartella, title, category, description,
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


## Dettagli in `docs/` (leggere solo quando il lavoro li tocca)

- **`docs/riferimento.md`**: trappole già incontrate (GitHub Pages/`.nojekyll`, CSS, SVG…), asset e strumenti fuori repo (font, foto, `drive.mjs`, server 8765, Python), stato delle 30 schede + 15 Demo e dei collaudi. **Leggerlo prima di costruire una scheda nuova.**
- `docs/demo-e-rinnovo.md`: cronaca, scelte e trappole di ogni lotto e di ogni Demo (leggerla prima di toccare quella pagina).
- `docs/pagine-404.md`: scheda in costruzione «pagine-404» (concept, struttura, ordine).
