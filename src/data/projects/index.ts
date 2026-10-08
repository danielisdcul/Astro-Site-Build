import { selahCoffee } from './selah-coffee.ts';
import { vitaTerra } from './vita-terra.ts';
import { hum } from './hum.ts';
import type { Project } from './types.ts';

// Register projects here in display order. showOnHome curates Home; featured chooses its card layout.
export const projects: Project[] = [selahCoffee, vitaTerra, hum];
