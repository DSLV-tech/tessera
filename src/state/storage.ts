/**
 * Persistenza best-effort e a prova di sandbox.
 *
 * In un deploy reale (GitHub Pages, Vercel…) usa localStorage e ricorda i
 * progressi fra una sessione e l'altra. In ambienti dove lo storage è assente o
 * vietato — anteprima in un iframe sandboxed, modalità privata con quota zero —
 * ogni accesso è racchiuso in try/catch e l'app ricade silenziosamente in
 * memoria volatile, senza mai lanciare eccezioni.
 */
const KEY = 'tessera:v1';

interface SaveShape {
  readonly progress: Record<string, string>;
}

function safeLocalStorage(): Storage | null {
  try {
    const ls = globalThis.localStorage;
    const probe = '__tessera_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

const store = safeLocalStorage();

/** true quando i progressi verranno effettivamente ricordati fra le sessioni. */
export const persistenceAvailable = store !== null;

export function loadSave(): SaveShape | null {
  if (store === null) return null;
  try {
    const raw = store.getItem(KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'progress' in parsed &&
      typeof (parsed as { progress: unknown }).progress === 'object'
    ) {
      return parsed as SaveShape;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeSave(save: SaveShape): void {
  if (store === null) return;
  try {
    store.setItem(KEY, JSON.stringify(save));
  } catch {
    /* quota piena o storage revocato: la partita prosegue senza persistenza */
  }
}

export function clearSave(): void {
  if (store === null) return;
  try {
    store.removeItem(KEY);
  } catch {
    /* ignora */
  }
}

const SOUND_KEY = 'tessera:sound';

/** Preferenza audio: attiva di default se lo storage non dice il contrario. */
export function loadSound(): boolean {
  if (store === null) return true;
  try {
    return store.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function writeSound(enabled: boolean): void {
  if (store === null) return;
  try {
    store.setItem(SOUND_KEY, enabled ? 'on' : 'off');
  } catch {
    /* ignora */
  }
}
