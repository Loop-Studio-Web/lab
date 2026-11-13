// Parte la scena vera solo al primo gesto: fino ad allora c'è il poster (vedi components/_shared/three/avvio.js).
import { alPrimoGesto } from '../components/_shared/three/avvio.js';

await alPrimoGesto();
await import('./scena.js');
