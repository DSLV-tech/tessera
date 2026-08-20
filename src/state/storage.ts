/**
 * Persistenza best-effort e a prova di sandbox.
 *
 * In un deploy reale (GitHub Pages, Vercel…) usa localStorage e ricorda i
 * progressi fra una sessione e l'altra. In ambienti dove lo storage è assente o
 * vietato — anteprima in un iframe sandboxed, modalità privata con quota zero —
 * ogni accesso è racchiuso in try/catch e l'app ricade silenziosamente in
 * memoria volatile, senza mai lanciare eccezioni.
 */
const KEY = 'tessera:v2';
/** Chiave del formato precedente, letta una sola volta per non perdere i progressi. */
const LEGACY_KEY = 'tessera:v1';
const SCHEMA_VERSION = 2;

/** Ciò che sappiamo di un livello già giocato: medaglia migliore e record di punti. */
export interface LevelRecord {
  readonly tier: string;
  readonly best: number;
}

export interface SaveShape {
  readonly version: number;
  readonly levels: Readonly<Record<string, LevelRecord>>;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Il formato v1 era `{ progress: { id: medaglia } }`: nessun punteggio salvato.
 * Lo promuoviamo a v2 mettendo il record a zero — la medaglia è ciò che conta
 * per lo sblocco, e il punteggio si riempirà alla prossima partita.
 */
function migrateFromV1(parsed: unknown): SaveShape | null {
  if (!isRecord(parsed) || !isRecord(parsed['progress'])) return null;
  const levels: Record<string, LevelRecord> = {};
  for (const [id, tier] of Object.entries(parsed['progress'])) {
    if (typeof tier === 'string') levels[id] = { tier, best: 0 };
  }
  return { version: SCHEMA_VERSION, levels };
}

function parseV2(parsed: unknown): SaveShape | null {
  if (!isRecord(parsed) || !isRecord(parsed['levels'])) return null;
  const levels: Record<string, LevelRecord> = {};
  for (const [id, entry] of Object.entries(parsed['levels'])) {
    if (!isRecord(entry)) continue;
    const tier = entry['tier'];
    const best = entry['best'];
    if (typeof tier !== 'string') continue;
    levels[id] = { tier, best: typeof best === 'number' && Number.isFinite(best) ? best : 0 };
  }
  return { version: SCHEMA_VERSION, levels };
}

function readKey(key: string): unknown {
  if (store === null) return null;
  try {
    const raw = store.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/**
 * Legge il salvataggio, promuovendo i formati vecchi invece di scartarli: un
 * cambio di schema non deve mai azzerare mesi di partite.
 */
export function loadSave(): SaveShape | null {
  if (store === null) return null;
  const current = readKey(KEY);
  if (current !== null) {
    const parsed = parseV2(current);
    if (parsed !== null) return parsed;
  }
  const legacy = readKey(LEGACY_KEY);
  if (legacy !== null) {
    const migrated = migrateFromV1(legacy);
    if (migrated !== null) {
      writeSave(migrated);
      return migrated;
    }
  }
  return null;
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
    store.removeItem(LEGACY_KEY);
    store.removeItem(DAILY_KEY);
  } catch {
    /* ignora */
  }
}

const DAILY_KEY = 'tessera:daily';

/** Esiti del livello del giorno, indicizzati per data (`daily-2026-08-20`). */
export function loadDaily(): Readonly<Record<string, LevelRecord>> {
  const raw = readKey(DAILY_KEY);
  if (!isRecord(raw)) return {};
  const clean: Record<string, LevelRecord> = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (!isRecord(entry)) continue;
    const tier = entry['tier'];
    const best = entry['best'];
    if (typeof tier !== 'string') continue;
    clean[key] = { tier, best: typeof best === 'number' && Number.isFinite(best) ? best : 0 };
  }
  return clean;
}

export function writeDaily(entries: Readonly<Record<string, LevelRecord>>): void {
  if (store === null) return;
  try {
    // Si conservano solo le ultime edizioni: lo storico completo non serve a
    // nulla e farebbe crescere il salvataggio all'infinito.
    const recent = Object.entries(entries).sort(([a], [b]) => (a < b ? 1 : -1)).slice(0, 30);
    store.setItem(DAILY_KEY, JSON.stringify(Object.fromEntries(recent)));
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

const SEEN_KEY = 'tessera:seen';

/**
 * Modalità di cui si è già visto il tutorial. Un set in memoria fa da riserva
 * quando lo storage è vietato, così l'intro non riappare a ogni livello nella
 * stessa sessione anche senza persistenza.
 */
const seenMemory = new Set<string>();

export function loadSeenModes(): ReadonlySet<string> {
  const result = new Set(seenMemory);
  if (store !== null) {
    try {
      const raw = store.getItem(SEEN_KEY);
      if (raw !== null) {
        for (const mode of raw.split(',')) if (mode !== '') result.add(mode);
      }
    } catch {
      /* ignora */
    }
  }
  return result;
}

export function markSeenMode(mode: string): void {
  seenMemory.add(mode);
  if (store === null) return;
  try {
    const current = new Set(loadSeenModes());
    current.add(mode);
    store.setItem(SEEN_KEY, [...current].join(','));
  } catch {
    /* ignora */
  }
}

export function clearSeenModes(): void {
  seenMemory.clear();
  if (store === null) return;
  try {
    store.removeItem(SEEN_KEY);
  } catch {
    /* ignora */
  }
}

const LEGAL_KEY = 'tessera:legal';

/** Presa visione dell'informativa privacy/cookie (per non rimostrare il banner). */
export function loadLegalAck(): boolean {
  if (store === null) return false;
  try {
    return store.getItem(LEGAL_KEY) === 'ack';
  } catch {
    return false;
  }
}

export function writeLegalAck(): void {
  if (store === null) return;
  try {
    store.setItem(LEGAL_KEY, 'ack');
  } catch {
    /* ignora */
  }
}
