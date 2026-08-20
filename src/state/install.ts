/**
 * Installabilità PWA (Android/desktop Chrome).
 *
 * Chrome non mostra più un prompt automatico: emette `beforeinstallprompt`, che
 * l'app deve intercettare per offrire un proprio pulsante "Installa". L'ascolto
 * parte a livello di modulo (importato in main) per non perdere l'evento se
 * arriva prima del montaggio dei componenti.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });
  globalThis.addEventListener('appinstalled', () => {
    deferred = null;
    emit();
  });
}

export function canInstall(): boolean {
  return deferred !== null;
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function promptInstall(): Promise<void> {
  const event = deferred;
  if (event === null) return;
  deferred = null;
  emit();
  try {
    await event.prompt();
    await event.userChoice;
  } catch {
    /* l'utente ha annullato o l'evento è scaduto */
  }
}

/** true su iOS Safari, dove l'installazione è manuale (Condividi → Aggiungi a Home). */
export function isIosSafari(): boolean {
  try {
    const ua = globalThis.navigator?.userAgent ?? '';
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const webkit = /WebKit/.test(ua);
    const notChromeOrFirefox = !/CriOS|FxiOS/.test(ua);
    const standalone =
      (globalThis.navigator as unknown as { standalone?: boolean }).standalone === true ||
      globalThis.matchMedia?.('(display-mode: standalone)').matches === true;
    return iOS && webkit && notChromeOrFirefox && !standalone;
  } catch {
    return false;
  }
}
