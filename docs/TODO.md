# TODO Lab — da leggere a inizio sessione (unico punto di ripartenza)

Una riga per voce: cosa · dove sta il dettaglio · prossimo passo. A ogni step chiuso: aggiornare qui, committare, dire «/clear»
e riprendere con «leggi docs/TODO.md, riparti dalla prima voce». Cronache lunghe NON qui: restano in `docs/`. Le cose del sito madre stanno nel suo TODO (`Loop-Studio/docs/TODO.md`).

Stato al 2026-11-09 sera: online = `origin/main` dopo il push del 9/11 sera (Lab e Loop-Studio, con il via dell'autore). Schede approvate: 15 della suite + `comandi-rapidi`, `form-a-passi`, `tabelle-e-confronti`; 15 Demo + pagine-404. Server di prova: `http://localhost:8765/components/<id>/` (sempre l'URL a cartella, mai `index.html`; tab via `#id`). Ogni scheda nuova va aggiunta subito anche nel sito madre (`src/data/lab-components.ts` + `src/i18n/lab.ts`, IT/EN/ES). **Axe + PSI solo a Lab concluso, dopo il deploy.**

## In corso / prossimi (in ordine)

1. **`mappe-e-hotspot`** (Lotto 2, categoria Navigazione): **tab 1 «Quartiere» APPROVATO 9/11** (pushato); **tab 2 «Volo» in bozza, da far vedere all'autore** (`#volo`, commit locale). Poi correzioni e tab 3 «Giro» (mappa antica, tracciato che si disegna, marcatore ∞); aggiungere il bottone al guscio `index.html` (ora ha 2 tab) e la scheda nel sito madre. Dettagli, dubbi aperti e trappole in `docs/mappe-e-hotspot.md`. Poi i Lotti 3-4 (`docs/nuove-schede.md`): una scheda alla volta, bozza → correzioni.
2. **Controllo responsive, voci ancora aperte** (con il via dell'autore): (a) `vh` residui (`85vh` in `ComponentPreviewModal` e `ProjectCard` nel sito madre; molti nelle vetrine); (b) media query in `px` nelle vetrine, da convertire in `rem` quando si tocca il concept; (c) 24 `@media (hover: hover)` senza `pointer: fine` nelle vetrine (2 nel sito madre); (d) non controllati: bersagli di tocco < 24 px, 320 px, telefono/tablet orizzontale, `/portfolio/foto-video/*`, `/pacchetti/social`, `/foto-video`; (e) guardare a occhio 360 e 1366×600 delle pagine chiave.
3. **Layout a due colonne** per le suite con scroll o vuoto laterale: valutare caso per caso (`prima-dopo/ba.css`, `blocchi-di-fiducia/fd.css`).
4. **Migrare le schede approvate a `_shared/scheda.css`** (l'impalcatura è copiata identica in `pc.css`, `fd.css`…; per ora la usa solo `form-a-passi`). Una scheda alla volta, screenshot prima/dopo a 1536×695, 1440×900 e 390; solo dopo il via.
5. **Non provati sulle schede 4-6 recenti** (`comandi-rapidi`, `form-a-passi`, `tabelle-e-confronti`): telefono vero, Firefox/Safari, lettore di schermo, 1366×600/1920×950 dove non indicato. Dubbi: palette di `comandi-rapidi` copre quasi tutto il palco, keywords solo in italiano; `form-a-passi` «Su misura» scorre al suo interno.

## Regole fisse per le schede nuove
- **Le schede devono differire tra loro** (regola dell'autore, 9/11): ogni scheda nuova ha un impianto, un layout e un gesto propri; niente «finto sito + card centrata + 3 tab» ripetuto. Prima del concept guardare le schede esistenti e dire in cosa la nuova è diversa.
- **Categorie bilanciate** (regola dell'autore, 9/11): nel concept citare il conteggio per categoria (`grep -o "category: '[^']*'" ../Loop-Studio/src/data/lab-components.ts | sort | uniq -c`) e scegliere la meno rappresentata che sta bene. Al 9/11: Interazione 5, Galleria e media 3, Feedback 3, Effetti 3, Navigazione 2, Layout 2, Form 1 (2 con `form-a-passi`), Card 1. Se una categoria resta vuota o sproporzionata, si decide con l'autore se tenerla o crearne di nuove.
- **Traduzioni IT/EN/ES a runtime**: `_shared/i18n.js` (lingua `?lang` → browser → IT; la modale del sito madre passa `?lang`) + `<scheda>/i18n.js` con `LabI18n.add({ en, es })`. L'italiano sta SOLO nell'HTML; `data-i18n="chiave"` (attributi: `data-i18n-attr="aria-label=chiave"`); testi scritti da JS con `LabI18n.t('chiave', 'IT')` con la chiave letterale (il controllo non vede chiavi composte). **Trappola:** un testo scritto da JS NON va marcato `data-i18n` (apply lo sovrascrive a DOMContentLoaded). Controllo: `node components/_shared/i18n-check.mjs`.
- Si traduce l'interfaccia (titolo, descrizione, «come si usa», «consiglio», etichette); contenuti d'esempio solo se brevi, con `lang="…"` sul frammento; `pagine-404` mai. Lo spagnolo è ~20-25% più lungo: provare il layout con quello. Ogni scheda ha `<meta name="robots" content="noindex">`.
- **Articoli del sito madre sempre in italiano**; il sito non va sponsorizzato all'estero finché le traduzioni non sono pronte.
- Pannello rosso «glass» e due colonne solo sotto `?embed` / schermi larghi; controllare sulla **lista condivisa dei formati** (`node C:/Users/utente/studio-kit/scripts/viewports.mjs <url> <out> core`, dati e regole in `studio-kit/docs/responsive.md`: telefono 360/390/414, tablet 768, 1366×600, 1536×695, 1920×950; dal 9/11 sostituisce 1440×900/1920×1000/390). Niente scroll orizzontale (l'alone `::before` ne ha già creato uno).
- Hosting: GitHub Pages basta; si rivaluta Cloudflare se il repo supera ~200 MB, il deploy ~3 min, o servono cache `immutable`/Brotli per i frame del lotto 4.

## Aperti, noti (non urgenti)
- **pagine-404:** frasi JA/KO/PT scritte da Claude, da far controllare a un madrelingua (FR chiuso, attesa PT); il tocco del Pendolo su telefono vero non è provato.
- `bordi-animati` mobile ~72 (TBT; rimedio = cambiare tecnica, decisione dell'autore); SkyTracker icone 64 px mostrate a 90; `menu-su-misura` CLS 0,05.
- Worker `lab-cambio-worker`: cancellare dalla Dashboard Cloudflare.
