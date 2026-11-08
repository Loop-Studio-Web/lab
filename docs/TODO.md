# TODO Lab — da leggere a inizio sessione (unico punto di ripartenza)

Una riga per voce: cosa · dove sta il dettaglio · prossimo passo. A ogni step chiuso: aggiornare qui, committare, dire «/clear»
e riprendere con «leggi docs/TODO.md, riparti dalla prima voce». Cronache lunghe NON qui: restano in `docs/`.

Stato al 2026-11-08: online = `origin/main`; **12 commit locali NON pushati** (docs 404, font in `_shared`, effetti estratti, CLAUDE.md, pagine-404 fino a Bolle). Prima del push: controllare la pagina ONLINE di `effetti-testo` (trappola `_shared`/`.nojekyll`).

## In corso / prossimi (in ordine)
1. **Scheda «pagine-404»** · concept e struttura in `docs/pagine-404.md` (albero cartelle, trappola scroll→tempo, ordine di costruzione). Codice in `components/pagine-404/`: selettore a 7 tab (`script.js`), moduli `varianti/<nome>.js` con `{init(panel),start(),stop()}` caricati con `import()`; senza modulo = «In costruzione». Per aggiungere una variante: pannello già in `index.html`, riga in `VARIANTI` di `script.js`, CSS con `<link>` in `index.html`.
   - **Fatte e APPROVATE (7/11):** Testo (IT), Infinito (ES), Bolle (KO). **Comparse (FR) APPROVATA 8/11** (finestrine finte che scappano dal cursore, «404» rosso; `varianti/comparse.*`): frasi FR corrette dal madrelingua l'8/11 (frase, «Faire une réclamation», cookie, «Un bouton vous observe. Ne bougez pas.») e applicate.
   - **Particelle (EN) APPROVATA 8/11** (`varianti/particelle.*`: «404» campionato dal testo in puntini, 0 rosso, cursore li sparpaglia, clic = raffica, soffio di vento ogni 6-10 s; reduced-motion = fermo).
   - **Tris (PT) APPROVATA 8/11** (frase della battuta in rosso; frasi PT/KO già mandate al madrelingua) (`varianti/tris.*`: lo 0 è la griglia del gioco del galo, X contro il computer che sbaglia il 22% delle volte; vincere/pareggiare accende «Voltar ao início»; perdere = si ricomincia). 
   - **Pendolo (JA) COSTRUITA 8/11, in attesa di approvazione** (`varianti/pendolo.*`): culla di Newton in canvas, 5 palline (l'ultima rossa); si afferra una pallina d'estremità e si lascia (tocco = spinta); se la rossa sale oltre ~0,8 rad si stacca, rimbalza sul fondo ed esce a destra, poi una nuova scende dalla sbarra; a riposo dimostrazione automatica (forte, poi piccola). Frase «ページは跳ね返って、どこかへ行ってしまった。» e «ホームに戻る» usano solo i caratteri del subset già in `_shared/fonts` (nessun nuovo subset). Reduced-motion = fila ferma. **Da fare: l'autore la prova (trascinare, tocco su telefono), poi controllo madrelingua.** Con l'approvazione: 7 varianti chiuse → sito madre +1 scheda (30→31), decisione miniatura.
   - **Lingue (una per variante):** Testo IT, Infinito ES, Particelle EN, Comparse FR, Tris PT, Pendolo JA, Bolle KO. Frasi JA/KO/FR/PT scritte da Claude: **DA FAR CONTROLLARE da un madrelingua.** Font JA/KO: subset ~5 KB in `_shared/fonts/` (Dela Gothic One, Black Han Sans, OFL) e nel catalogo studio-kit. Altri font: `studio-kit/fonts/` (accenti IT/ES: Gak Tahu, Love Is Amour; solo EN: Ngaco, DaComment, Bangpop, Grow Year, Rahull).
   - **Bozza all'autore PRIMA di ogni collaudo.** Server di prova 8765 fermo: riavviarlo da `Lab` (`npx serve -l 8765`) e fermarlo per PID a fine lavoro.
   - **Miniatura/variante d'apertura:** da decidere dopo averle viste. **Sito madre:** +1 scheda in `src/data/lab-components.ts` (30→31) a fine lavori.
   - **404 del sito madre** (`Loop-Studio/src/pages/404.astro`, Infinito con canvas): fatto in locale, l'autore deve rivederlo in scuro/chiaro/telefono prima del push (voce nel TODO di `Loop-Studio`).
2. **Dopo pagine-404**: il Lab resta «concluso» (vedi `docs/riferimento.md`, sezione Stato); nuove schede solo se decise dall'autore.

## Aperti, noti (non urgenti)
- `bordi-animati` mobile ~72 (TBT; rimedio = cambiare tecnica, decisione dell'autore); SkyTracker icone 64 px mostrate a 90; `menu-su-misura` CLS 0,05.
- Worker `lab-cambio-worker`: cancellare dalla Dashboard Cloudflare.
