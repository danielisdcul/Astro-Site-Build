import { selahCoffee } from './selah-coffee.ts';
import { vitaTerra } from './vita-terra.ts';
import { hum } from './hum.ts';
import type { Project } from './types.ts';

// Project registry — import new project files above and add them to this array.
// Add new projects here. This order controls the full Work page and home-page groups.
// Use showOnHome to curate the landing page and featured to choose its card layout.
export const projects: Project[] = [selahCoffee, vitaTerra, hum];
