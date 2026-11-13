// Parte la scena vera solo al primo gesto: fino ad allora c'è il poster (vedi components/_shared/three/avvio.js).
import { alPrimoGesto } from '../components/_shared/three/avvio.js';

const gesto = await alPrimoGesto();
await import('./scena.js');
// Se il gesto era su un colore (tocco o tasto), la scena non c'era ancora ad ascoltarlo: si rifà il clic.
gesto?.target?.closest?.('.colore')?.click();
