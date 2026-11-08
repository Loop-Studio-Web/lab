# TODO Lab — da leggere a inizio sessione (unico punto di ripartenza)

Una riga per voce: cosa · dove sta il dettaglio · prossimo passo. A ogni step chiuso: aggiornare qui, committare, dire «/clear»
e riprendere con «leggi docs/TODO.md, riparti dalla prima voce». Cronache lunghe NON qui: restano in `docs/`.

Stato al 2026-11-08: online = `origin/main`; **9 commit locali NON pushati** (docs 404, font in `_shared`, effetti estratti, CLAUDE.md, pagine-404 fino a Bolle). Prima del push: controllare la pagina ONLINE di `effetti-testo` (trappola `_shared`/`.nojekyll`).

## In corso / prossimi (in ordine)
1. **Scheda «pagine-404»** · concept e struttura in `docs/pagine-404.md` (albero cartelle, trappola scroll→tempo, ordine di costruzione). Codice in `components/pagine-404/`: selettore a 7 tab (`script.js`), moduli `varianti/<nome>.js` con `{init(panel),start(),stop()}` caricati con `import()`; senza modulo = «In costruzione». Per aggiungere una variante: pannello già in `index.html`, riga in `VARIANTI` di `script.js`, CSS con `<link>` in `index.html`.
   - **Fatte e APPROVATE (7/11):** Testo (IT), Infinito (ES), Bolle (KO). **Comparse (FR) costruita 8/11, DA MOSTRARE all'autore** (finestrine finte che scappano dal cursore; `varianti/comparse.*`).
   - **Da fare, in ordine:** Particelle (EN), Tris (PT), Pendolo (JA; font `dela-gothic-one-ja` già in `_shared/fonts`, rifare il subset se la frase cambia). Skill `animate` / `emil-design-eng` durante la costruzione.
   - **Lingue (una per variante):** Testo IT, Infinito ES, Particelle EN, Comparse FR, Tris PT, Pendolo JA, Bolle KO. Frasi JA/KO/FR/PT scritte da Claude: **DA FAR CONTROLLARE da un madrelingua.** Font JA/KO: subset ~5 KB in `_shared/fonts/` (Dela Gothic One, Black Han Sans, OFL) e nel catalogo studio-kit. Altri font: `studio-kit/fonts/` (accenti IT/ES: Gak Tahu, Love Is Amour; solo EN: Ngaco, DaComment, Bangpop, Grow Year, Rahull).
   - **Bozza all'autore PRIMA di ogni collaudo.** Server di prova 8765 fermo: riavviarlo da `Lab` (`npx serve -l 8765`) e fermarlo per PID a fine lavoro.
   - **Miniatura/variante d'apertura:** da decidere dopo averle viste. **Sito madre:** +1 scheda in `src/data/lab-components.ts` (30→31) a fine lavori.
   - **404 del sito madre** (`Loop-Studio/src/pages/404.astro`, Infinito con canvas): fatto in locale, l'autore deve rivederlo in scuro/chiaro/telefono prima del push (voce nel TODO di `Loop-Studio`).
2. **Dopo pagine-404**: il Lab resta «concluso» (vedi `docs/riferimento.md`, sezione Stato); nuove schede solo se decise dall'autore.

## Aperti, noti (non urgenti)
- `bordi-animati` mobile ~72 (TBT; rimedio = cambiare tecnica, decisione dell'autore); SkyTracker icone 64 px mostrate a 90; `menu-su-misura` CLS 0,05.
- Worker `lab-cambio-worker`: cancellare dalla Dashboard Cloudflare.
