/**
 * Effetti sonori sintetici via Web Audio — nessun file audio, nessuna dipendenza.
 * Tutto è racchiuso in try/catch: se l'AudioContext non è disponibile o l'utente
 * ha disattivato il suono, le chiamate non fanno nulla e non lanciano mai.
 */
import { loadSound, writeSound } from '../state/storage.ts';

export type SoundName = 'place' | 'capture' | 'win-bronze' | 'win-silver' | 'win-gold' | 'deny';

class SoundPlayer {
  private ctx: AudioContext | null = null;
  private enabledFlag: boolean;

  public constructor() {
    this.enabledFlag = loadSound();
  }

  public get enabled(): boolean {
    return this.enabledFlag;
  }

  public setEnabled(value: boolean): void {
    this.enabledFlag = value;
    writeSound(value);
    if (value) this.play('place');
  }

  private context(): AudioContext | null {
    try {
      const Ctor =
        globalThis.AudioContext ??
        (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor === undefined) return null;
      this.ctx ??= new Ctor();
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private tone(
    ctx: AudioContext,
    freq: number,
    startAt: number,
    duration: number,
    type: OscillatorType,
    peak: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  private arpeggio(ctx: AudioContext, freqs: readonly number[], step: number, type: OscillatorType): void {
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => this.tone(ctx, f, t0 + i * step, step * 1.8, type, 0.14));
  }

  public play(name: SoundName): void {
    if (!this.enabledFlag) return;
    const ctx = this.context();
    if (ctx === null) return;
    try {
      switch (name) {
        case 'place':
          this.tone(ctx, 200, ctx.currentTime, 0.08, 'triangle', 0.12);
          break;
        case 'capture':
          this.arpeggio(ctx, [523, 784], 0.07, 'sine');
          break;
        case 'win-bronze':
          this.arpeggio(ctx, [392, 523], 0.1, 'triangle');
          break;
        case 'win-silver':
          this.arpeggio(ctx, [392, 523, 659], 0.1, 'triangle');
          break;
        case 'win-gold':
          this.arpeggio(ctx, [523, 659, 784, 1047], 0.11, 'triangle');
          break;
        case 'deny':
          this.tone(ctx, 120, ctx.currentTime, 0.14, 'square', 0.08);
          break;
        default: {
          const exhaustive: never = name;
          return exhaustive;
        }
      }
    } catch {
      /* audio non critico */
    }
  }
}

export const sound = new SoundPlayer();

/** Vibrazione tattile su mobile, se supportata e concessa. */
export function haptic(pattern: number | readonly number[]): void {
  try {
    globalThis.navigator?.vibrate?.(pattern as number | number[]);
  } catch {
    /* ignora */
  }
}
