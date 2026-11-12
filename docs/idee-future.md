# Idee future (fuori piano) — 12/11/2026

Il Lab resta a 30 Componenti + 15 Demo finché l'autore non decide di crescere (numero non tassativo). Qui stanno le idee scartate dal piano attuale (`docs/nuove-schede.md`), da riprendere una alla volta. Una voce che si realizza o non serve più si elimina.

- **Categoria «Dati»**: `tabelle-e-confronti` + Grafici + Indicatori. Si crea solo con almeno 3 schede, oppure rinunciando a una scheda esistente più debole (da valutare).
- **Indicatori e dashboard**: numeri chiave con variazione, mini-grafici, misuratori, stati. Distinto da `blocchi-di-fiducia/contatori`.
- **Selettori** (Form): intervallo a due maniglie, quantità/ospiti, tag con suggerimenti. NIENTE calendario custom (c'è la Demo `calendario` e il `booking-widget`); senza calendario è troppo poco, quindi serve un'idea in più. Il codice OTP c'è già in `campi-testo`.
- **Scroll cinematografico**: sequenza di frame su canvas, scena fissata, scorrimento orizzontale. Pesante (frame da un video) e riapre la questione hosting (GitHub Pages vs Cloudflare, soglia ~200 MB).
- **Immagini con shader**: WebGL puro, fallback CSS, attivo solo se visibile. La più rischiosa per le prestazioni.
- **Configuratore di prodotto**; **lightbox con zoom e gesti** (candidata anche per Mobile); **barra accessibilità** (overlay discussi: mai presentarla come conformità).
- Il conto alla rovescia resta fuori: è un concept nella repo `vetrine`.
- Mobile: **Inclinazione** (giroscopio) se non entra come tab di «Storie e feed»; **barra di navigazione a pollice** più elaborata.
