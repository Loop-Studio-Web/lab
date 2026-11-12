# Lab — riferimento (trappole, asset e strumenti, stato)

Spostato da `CLAUDE.md` il 2026-11-08 per alleggerirlo: si legge solo quando il lavoro lo tocca.

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

- **Font: prima di scegliere o aggiungerne uno, aprire il catalogo `C:\Users\utente\studio-kit\fonts\index.html` (dati `fonts.json`): solo font con licenza accertata, più l'elenco degli scartati. Mai usare un font «gratis» non presente lì: prima si controlla lo zip (procedura in `studio-kit/fonts/README.md`).**
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

## Stato (aggiornato 2026-10-24)

Tutto **pubblicato** (online = `origin/main`): **30 Componenti** e **15 Demo**. **Lab concluso per ottobre 2026**: nuovi elementi solo dopo le altre sezioni del sito madre (dettagli in `docs/demo-e-rinnovo.md`). Cronaca, scelte e trappole di ogni lotto e di ogni Demo: **`docs/demo-e-rinnovo.md`** (leggerla prima di toccare quella pagina).

- **Demo** (stanno nella RADICE del Lab, non in `components/`; dati e schede nel sito madre in `src/data/lab-demos.ts`): `3d-medusa`, `3d-infinito`, `3d-farfalla`, `storytelling-css`, `galleria-trascinabile`, `galleria-riordinabile`, `booking-widget`, `google-reviews-widget`, `preventivatore`, `menu-su-misura`, `report-social`, `convertitore-valute`, `faq-ricerca`, `skyTracker`, `calendario`. Slider: una sola scheda `components/slider/`; le vecchie cartelle `animals-webpage`, `movies-slider`, `slider-fruit-soda`, `slider-magic-effects`, `starbucks-coffee`, `vertical-slider` (→ `components/slider/#id`) e `three-js-animation` (→ `3d-medusa/`) sono rimandi di una riga: le card vecchie online puntano a loro.
- **Sorgenti fuori da questa repo** (repo private su `Loop-Studio-Web`, cartelle in `Websites\`): `lab-booking-widget`, `lab-google-reviews-widget`, `lab-preventivatore` (React/Vite: `npm run build`, poi copiare `dist/*` nella cartella della Demo; `npm test` per il calcolo), `lab-calendario` (Astro, cartella `Lab-Calendario-demo`: `npm run build`, copiare `dist/index.html` e `dist/assets`), e i Worker `lab-meteo-worker` (**non più usato dal 2026-11-05**: SkyTracker chiama MET Norway + Nominatim dal browser; Worker cancellato e chiave WeatherAPI revocata il 2026-11-05, vedi «Meteo» in `docs/demo-e-rinnovo.md`) e `lab-cambio-worker` (**non più usato dal 2026-11-03**: la demo del Convertitore chiama Frankfurter dal browser, il Worker è già stato cancellato dalla Dashboard, confermato il 2026-11-12; il codice resta in `Websites\lab-cambio-worker` come esempio). Regola: i Worker pubblici consumano la quota dell'intero account Cloudflare (condivisa con lo Scadenziario), quindi per le demo si preferiscono API senza chiave dal browser o dati di esempio. PowerShell: `npx.cmd`.
- **Collaudi (23/10, dopo il deploy):** axe 0 violazioni su 15 Demo + `/lab/`; PSI mobile 87-100 su 12 Demo su 15. Le tre scene Three.js (infinito 35, farfalla 61, medusa 78) hanno un TBT enorme perché PSI disegna WebGL in software (SwiftShader): su un telefono con GPU non c'è; `kit.js` già mette in pausa fuori vista e limita il pixel ratio. SEO 91 ovunque = manca la meta description (demo in iframe, ignorato); `calendario` SEO 60 = `noindex` voluto.
- **Come si fa un collaudo axe:** `drive.mjs` con un passo `eval` che inietta `axe-core` (CDN con versione fissata) e fa `await axe.run()`; a volte la prima prova dà `load-error` o un errore Trusted Types: riprovare. Controllare che il server locale (8765) sia vivo, altrimenti si collauda una 404 (tutte le pagine "uguali" = 404).
- **Aperti, noti:** `bordi-animati` mobile ~72 (TBT; rimedio = cambiare tecnica, decisione dell'autore); SkyTracker usa icone 64 px mostrate a 90 (best-practices 96); `menu-su-misura` CLS 0,05 residuo; il conto alla rovescia NON è una Demo: l'autore lo vuole come concept nella repo `vetrine`.
