/**
 * Worker del livello del giorno.
 *
 * La generazione richiede una ricerca sul tabellone per fissare soglie di
 * medaglia sensate: mezzo secondo abbondante di calcolo, che sul thread
 * principale significherebbe interfaccia congelata. Qui gira a parte.
 */
import { buildDailyLevel } from '../domain/daily.ts';

self.addEventListener('message', (event: MessageEvent<number>) => {
  try {
    self.postMessage({ ok: true, level: buildDailyLevel(new Date(event.data)) });
  } catch {
    self.postMessage({ ok: false });
  }
});
