/**
 * Rilevamento degli aggiornamenti della PWA.
 *
 * Una volta installata, l'app parte dalla cache del service worker: senza un
 * segnale esplicito il giocatore resterebbe su una versione vecchia a tempo
 * indeterminato. Qui teniamo d'occhio il worker in attesa e lo esponiamo come
 * store sottoscrivibile, così l'interfaccia può proporre la ricarica.
 */

type Listener = () => void;

let waiting: ServiceWorker | null = null;
let reloading = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

function track(registration: ServiceWorkerRegistration): void {
  // Un worker già in attesa significa che l'aggiornamento è pronto da subito.
  if (registration.waiting !== null && navigator.serviceWorker.controller !== null) {
    waiting = registration.waiting;
    emit();
  }

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (installing === null) return;
    installing.addEventListener('statechange', () => {
      // "installed" con un controller attivo = c'è una versione nuova pronta,
      // ma la vecchia sta ancora servendo la pagina.
      if (installing.state === 'installed' && navigator.serviceWorker.controller !== null) {
        waiting = installing;
        emit();
      }
    });
  });
}

/** Collega il rilevamento a una registrazione già ottenuta. */
export function watchForUpdates(registration: ServiceWorkerRegistration): void {
  track(registration);

  // Quando il nuovo worker prende il controllo, ricarichiamo una sola volta.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    globalThis.location.reload();
  });

  // Un controllo periodico intercetta i rilasci fatti mentre l'app resta aperta.
  globalThis.setInterval(
    () => {
      registration.update().catch(() => {
        /* offline o rete instabile: si riprova al giro dopo */
      });
    },
    60 * 60 * 1000,
  );
}

export function updateReady(): boolean {
  return waiting !== null;
}

export function subscribeUpdate(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Attiva la versione nuova: il worker prende il controllo e la pagina si ricarica. */
export function applyUpdate(): void {
  const target = waiting;
  if (target === null) return;
  target.postMessage({ type: 'SKIP_WAITING' });
}
