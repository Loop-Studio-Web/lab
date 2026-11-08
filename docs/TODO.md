# TODO Lab — da leggere a inizio sessione (unico punto di ripartenza)

Una riga per voce: cosa · dove sta il dettaglio · prossimo passo. A ogni step chiuso: aggiornare qui, committare, dire «/clear»
e riprendere con «leggi docs/TODO.md, riparti dalla prima voce». Cronache lunghe NON qui: restano in `docs/`. Le cose del sito madre stanno nel suo TODO (`Loop-Studio/docs/TODO.md`).

Stato al 2026-11-08 sera: online = `origin/main` (push fatto 8/11, con il via dell'autore). 15 schede (suite a tab) + 15 Demo + pagine-404; `prima-dopo` approvata. Server di prova: `http://localhost:8765/components/<id>/` (sempre l'URL a cartella, mai `index.html`: `serve` lo reindirizza e rompe i percorsi; tab via `#id`).

**Push: SOLO a fine Lotto 1 (decisione 8/11), in blocco, di Lab e di Loop-Studio.** Nel sito madre (`src/data/lab-components.ts` + `src/i18n/lab.ts`, commit locale) sono già aggiunte `prima-dopo`, `blocchi-di-fiducia`, `contatto-rapido` (ogni scheda nuova: aggiungere subito anche lì, IT/EN/ES).

## In corso / prossimi (in ordine)

1. ~~`blocchi-di-fiducia`~~ **APPROVATA 8/11** (4 tab; barre in 5 tinte, testimonianze con 4 tipi di firma: iniziali, foto Unsplash con credito, avatar SVG, logo). Commit 630619a e successivo, NON pushati.
2. ~~`contatto-rapido`~~ **APPROVATA 8/11** (3 tab: flottante con «aperto ora», barra CTA che si nasconde, assistente ad albero; box «Prova dal vivo» senza scroll fino a ~357 px di altezza). NON pushata.
3. ~~`filtri-e-griglie`~~ **APPROVATA 9/11** (3 tab: filtri+ricerca, «Viste» = griglia/lista/poster sparso con FLIP a cascata, dettaglio con morph foto→`<dialog>`). Dati/helper in `fg.js`. Aggiunta nel sito madre (IT/EN/ES, commit locale). Non provati: telefono vero, Firefox/Safari, 1920×1000. **Lotto 1 chiuso e PUSHATO 9/11 (Lab e Loop-Studio). Axe + PSI rimandati a Lab concluso (decisione dell'autore).**
4. **`comandi-rapidi` (Lotto 2, 1ª scheda): BOZZA PRONTA 9/11, da mostrare all'autore** (`http://localhost:8765/components/comandi-rapidi/`). 2 tab: «Comandi» (finto sito «Aurora Viaggi» con foto del pool: pagine, azioni, tema; scorciatoie G+H/S/P/C, ⌘/Ctrl+K, «/») e «Sotto-comandi» (scheda attività: Assegna a… / Scadenza… / Etichetta…, briciole, Backspace). Motore unico in `pc.js` (dialog NON modale ancorata al palco, combobox+listbox ARIA, evidenziazione che scivola). Aggiunta nel sito madre (commit locale). Controllato: i18n ok, flusso con tastiera ok a 1536×695. **Non provati:** telefono, 1440×900/1920×1000, Firefox/Safari, lettore di schermo. Dubbi aperti: la palette copre quasi tutto il palco (valutare altezza); keywords di ricerca solo in italiano.
5. **Lotti 2-4 (restanti)** (palette ⌘K, form a passi, tabelle, mappe; shader, vetro, transizioni, gesti; scroll cinematografico, grafici, solo CSS 2026): elenco e budget di peso in `docs/nuove-schede.md`. Una scheda alla volta: bozza all'autore → correzioni → (solo dopo il deploy) axe + PSI.
6. **Layout a due colonne** (foto/demo a sinistra, testi a destra, firma in fondo; vedi `prima-dopo/ba.css` e `blocchi-di-fiducia/fd.css`): valutare caso per caso per le suite già esistenti che hanno scroll o vuoto laterale (dopo il Lotto 1).

## Regole fisse per le schede nuove
- **Traduzioni IT/EN/ES a runtime**: `_shared/i18n.js` (lingua `?lang` → browser → IT; la modale del sito madre passa `?lang`) + `<scheda>/i18n.js` con `LabI18n.add({ en, es })`. L'italiano sta SOLO nell'HTML; `data-i18n="chiave"` (attributi: `data-i18n-attr="aria-label=chiave"`); testi scritti da JS con `LabI18n.t('chiave', 'IT')` con la chiave letterale (il controllo non vede chiavi composte). **Trappola:** un testo scritto da JS NON va marcato `data-i18n` (apply lo sovrascrive a DOMContentLoaded). Controllo: `node components/_shared/i18n-check.mjs`.
- Si traduce l'interfaccia (titolo, descrizione, «come si usa», «consiglio», etichette); contenuti d'esempio solo se brevi, con `lang="…"` sul frammento; `pagine-404` mai. Lo spagnolo è ~20-25% più lungo: provare il layout con quello. Ogni scheda ha `<meta name="robots" content="noindex">`.
- **Articoli del sito madre sempre in italiano**; il sito non va sponsorizzato all'estero finché le traduzioni non sono pronte.
- Pannello rosso «glass» e due colonne solo sotto `?embed` / schermi larghi; controllare a 1440×900, 1536×695, 1920×1000 e 390 (niente scroll orizzontale: l'alone `::before` ne ha già creato uno).
- Hosting: GitHub Pages basta; si rivaluta Cloudflare se il repo supera ~200 MB, il deploy ~3 min, o servono cache `immutable`/Brotli per i frame del lotto 4.

## Aperti, noti (non urgenti)
- **pagine-404:** frasi JA/KO/PT scritte da Claude, da far controllare a un madrelingua (FR chiuso, attesa PT); il tocco del Pendolo su telefono vero non è provato.
- `bordi-animati` mobile ~72 (TBT; rimedio = cambiare tecnica, decisione dell'autore); SkyTracker icone 64 px mostrate a 90; `menu-su-misura` CLS 0,05.
- Worker `lab-cambio-worker`: cancellare dalla Dashboard Cloudflare.
