# Solo CSS 2026 (scheda 6 del piano, categoria Layout)

Concept approvato dall'autore il 12/11/2026 («procedi»): **«manuale di bordo»**, una pagina lunga in colonna con indice a sinistra,
5 funzioni CSS recenti, ognuna con effetto vivo + riga di CSS + badge di supporto + ripiego dichiarato. Layout con 3 schede (era 2).
Diversa dalle altre: non è un palco centrato né un finto sito, si legge scorrendo e lo scroll è il gesto. **Bozza costruita il 12/11 (da mostrare all'autore):** `components/solo-css-2026/`, voce nel sito madre committata in locale, `viewports.mjs core` senza overflow, `i18n-check` ok.
Trabocchetti: `::scroll-marker-group` NON compare se lo scroller è un figlio di un contenitore `display: grid` (il genitore `.sc-demo` è a blocco); il ripiego del popover è il popover nativo al centro dello schermo (non «sotto al bottone» come previsto).
Da provare ancora: Firefox/Safari (ripieghi), iframe della modale, telefono vero.

## Fase 2: struttura

```
components/solo-css-2026/
  index.html     una sola pagina: indice laterale + 5 sezioni (la prima, scroll-spy, è quella che si vede in miniatura)
  style.css      tutto il CSS; ogni funzione dentro @supports, il ripiego è lo stile base
  i18n.js        LabI18n.add({ en, es })
```
- **Nessuno `script.js`**: il JS della scheda è solo `_shared/i18n.js` (traduzioni) e `studio.js`. È il senso del titolo; dirlo nella nota in pagina.
- Sezioni (ognuna `<section id>` con h2, demo, `<pre><code>` con le righe chiave, badge):
  1. **Scroll-spy**: `scroll-target-group` + `:target-current` sull'indice. Ripiego: indice statico con ancore.
  2. **Carosello**: `::scroll-marker`, `::scroll-button()`, `scroll-snap`. Ripiego: fila con snap, senza puntini.
  3. **Anchor positioning**: `anchor-name`, `position-area`, `position-try`, con `popover` nativo. Ripiego: popover sotto al bottone.
  4. **Barra che si nasconde**: `animation-timeline: scroll()` / `scroll-state()`. Ripiego: barra sempre visibile.
  5. **`corner-shape`**: squircle, smussi, tagli. Ripiego: `border-radius`.
- Badge supporto: 3 pallini (Chrome/Edge, Firefox, Safari), stato scritto a mano in HTML dopo la verifica su caniuse (non si rileva da JS); data della verifica in pagina.
- Il ripiego si mostra anche a richiesta? Idea scartata per ora: complicherebbe il CSS. Il badge basta.

## Badge verificati (12/11/2026, MDN browser-compat-data 8.1.9, non caniuse)
| Funzione | Chrome/Edge | Firefox | Safari |
|---|---|---|---|
| `scroll-target-group`, `:target-current` | 140 / 135 | no | no |
| `::scroll-marker`, `::scroll-button()` | 135 | no | no |
| anchor positioning (`anchor-name`, `position-area`, `position-try`) | 125-129 | 147 | 26 |
| `popover` | 114 | 125 | 17 (iOS 18.3) |
| `animation-timeline` (`scroll()`) | 115 | 159 | 26 |
| `scroll-state()` (container query) | 133 | no | no |
| `corner-shape` | 139 | solo preview | 27.3 |

Decisioni: sezioni 1, 2 e (se si usa `scroll-state`) 4 sono solo Chromium → ripiego ben visibile. Per la 4 usare `animation-timeline: scroll()`
(ormai in tutti e tre) e non `scroll-state()`. La 3 è ormai Baseline-ish. `corner-shape`: Chromium + Safari 27.3.

## Dati e asset
- **Nessun asset**: niente immagini, niente font nuovi. Codice in `ui-monospace, ...` (stack di sistema, nessun file, peso zero).
- Card del carosello e tooltip con testi di fantasia brevi, IT nell'HTML, EN/ES in `i18n.js`. Le righe di CSS non si traducono.
- Palco scuro, `--accent` rosso per l'evidenza (voce corrente dell'indice, puntino attivo).

## Regole da rispettare
- Rem, `svh/dvh`, hover con `pointer: fine` + `:focus-visible`, `prefers-reduced-motion` (spento anche lo scroll-driven), solo `transform`/`opacity`.
- Dentro il box «Prova dal vivo» lo scroll è quello della pagina nell'iframe: lo scroll-spy e la barra devono funzionare lì.
- Spagnolo +25%: prova del layout (indice stretto).

## Da provare (rischi)
1. **Verificare su caniuse prima di scrivere** ogni funzione (cutoff mio: giugno 2026). Se `scroll-target-group` è troppo poco supportato, la sezione 1 diventa confronto «con / senza».
2. Scroll-driven dentro l'iframe della modale e su GitHub Pages.
3. Firefox/Safari per i ripieghi (voce 4 del TODO); telefono vero a Lab finito.
4. Telefono stretto: l'indice a sinistra diventa barra in alto o si nasconde (decidere in bozza).

## Ordine di costruzione
1. Verifica caniuse e fissare i badge.
2. HTML + stile base (i ripieghi), poi le 5 funzioni dentro `@supports`, una per volta.
3. i18n, voce nel sito madre (`lab-components.ts`, `i18n/lab.ts`, categoria Layout), `viewports.mjs core`, poi mostrare all'autore.
