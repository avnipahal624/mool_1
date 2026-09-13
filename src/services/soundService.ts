/**
 * Gentle WebAudio engine — synthesized chimes, melodies and ambient
 * garden sounds. No audio assets, never autoplays.
 */
type Ctx = AudioContext;

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let ambient: { stop: () => void } | null = null;
let melodyTimer: number | null = null;
let melodyBus: GainNode | null = null;
let chirpTimer: number | null = null;
let volume = 0.8;

function ensure(): Ctx | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
}

function noteFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.16) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

export function chime(kind: "tap" | "success" | "match" | "gentle" | "wrong" = "tap"): boolean {
  const c = ensure();
  if (!c || !ctx) return false;
  const t = ctx.currentTime + 0.02;
  if (kind === "tap") tone(660, t, 0.18, "sine", 0.1);
  if (kind === "gentle") tone(392, t, 0.5, "sine", 0.12);
  if (kind === "success") { tone(523.25, t, 0.22, "sine", 0.14); tone(659.25, t + 0.14, 0.24, "sine", 0.14); tone(783.99, t + 0.28, 0.4, "sine", 0.12); }
  if (kind === "match") { tone(523.25, t, 0.16, "triangle", 0.14); tone(783.99, t + 0.1, 0.3, "triangle", 0.12); }
  if (kind === "wrong") tone(220, t, 0.25, "sine", 0.08);
  return true;
}

export function playMelody(notes: [number, number][], tempoBeats = 0.4, onEnd?: () => void): boolean {
  const c = ensure();
  if (!c || !ctx || !master) { onEnd?.(); return false; }
  stopMelody();
  const bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(master);
  melodyBus = bus;
  const start = ctx.currentTime + 0.06;
  let cursor = start;
  notes.forEach(([midi, beats]) => {
    const dur = beats * tempoBeats * 0.92;
    const osc = ctx!.createOscillator();
    const g = ctx!.createGain();
    osc.type = "triangle";
    osc.frequency.value = noteFreq(midi);
    g.gain.setValueAtTime(0.0001, cursor);
    g.gain.exponentialRampToValueAtTime(0.15, cursor + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, cursor + dur);
    osc.connect(g);
    g.connect(bus);
    osc.start(cursor);
    osc.stop(cursor + dur + 0.05);
    cursor += beats * tempoBeats;
  });
  const totalMs = (cursor - start) * 1000 + 120;
  melodyTimer = window.setTimeout(() => { melodyTimer = null; melodyBus = null; onEnd?.(); }, totalMs);
  return true;
}

export function stopMelody() {
  if (melodyTimer !== null) { clearTimeout(melodyTimer); melodyTimer = null; }
  if (melodyBus) {
    try { melodyBus.disconnect(); } catch { /* noop */ }
    melodyBus = null;
  }
}

function noiseBuffer(c: Ctx): AudioBuffer {
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export type AmbientKind = "rain" | "garden" | "birds" | "water" | "night";

export function startAmbient(kind: AmbientKind): boolean {
  const c = ensure();
  if (!c || !ctx || !master) return false;
  stopAmbient();
  const stops: (() => void)[] = [];

  const noiseLoop = (filterType: BiquadFilterType, freq: number, gain: number, q = 0.8) => {
    const src = ctx!.createBufferSource();
    src.buffer = noiseBuffer(ctx!);
    src.loop = true;
    const f = ctx!.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx!.createGain();
    g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(master!);
    src.start();
    stops.push(() => { try { src.stop(); } catch { /* noop */ } });
    return { f, g };
  };

  const scheduleChirps = (every: number) => {
    const chirp = () => {
      if (!ctx || !master) return;
      const t = ctx.currentTime + 0.02;
      const base = 2200 + Math.random() * 1300;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * (0.7 + Math.random() * 0.4), t + 0.09);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(g); g.connect(master);
      osc.start(t); osc.stop(t + 0.2);
      if (Math.random() < 0.5) {
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(base * 1.2, t + 0.16);
        g2.gain.setValueAtTime(0.0001, t + 0.16);
        g2.gain.exponentialRampToValueAtTime(0.05, t + 0.18);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        osc2.connect(g2); g2.connect(master);
        osc2.start(t + 0.16); osc2.stop(t + 0.35);
      }
    };
    chirp();
    chirpTimer = window.setInterval(chirp, every);
    stops.push(() => { if (chirpTimer !== null) { clearInterval(chirpTimer); chirpTimer = null; } });
  };

  if (kind === "rain") noiseLoop("lowpass", 750, 0.22);
  if (kind === "water") noiseLoop("bandpass", 1100, 0.16, 1.4);
  if (kind === "garden") { noiseLoop("lowpass", 420, 0.09); scheduleChirps(2600); }
  if (kind === "birds") { noiseLoop("lowpass", 900, 0.03); scheduleChirps(1100); }
  if (kind === "night") {
    noiseLoop("lowpass", 260, 0.05);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 110;
    g.gain.value = 0.045;
    osc.connect(g); g.connect(master);
    osc.start();
    stops.push(() => { try { osc.stop(); } catch { /* noop */ } });
  }

  ambient = { stop: () => stops.forEach((s) => s()) };
  return true;
}

export function stopAmbient() {
  if (ambient) { ambient.stop(); ambient = null; }
}

export function isAmbientPlaying(): boolean {
  return ambient !== null;
}

export function speak(text: string, enabled: boolean) {
  if (!enabled) return;
  try {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* voice unavailable — ignore */ }
}
