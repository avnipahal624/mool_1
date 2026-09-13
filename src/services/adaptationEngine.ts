import { load, save, todayKey } from "../lib/storage";
import type { Comfort } from "../lib/types";
import { profileTopics, topicById, shuffle } from "./memoryService";
import type { PatientProfile } from "../lib/types";

export interface TopicStat {
  plays: number;
  skips: number;
  not: number;
}

export interface TypeStat {
  attempts: number;
  correct: number;
  skips: number;
  timeMs: number;
  sessions: number;
  comfortGood: number;
  comfortOkay: number;
  comfortNot: number;
  topics: Record<string, TopicStat>;
  last: number;
}

export interface LogEntry {
  type: string;
  topic?: string;
  correct: number;
  total: number;
  ts: number;
  skipped?: boolean;
}

const STATS_KEY = "adapt_stats_v1";
const LOG_KEY = "adapt_log_v1";

type Stats = Record<string, TypeStat>;

function getStats(): Stats {
  return load<Stats>(STATS_KEY, {});
}

function emptyStat(): TypeStat {
  return { attempts: 0, correct: 0, skips: 0, timeMs: 0, sessions: 0, comfortGood: 0, comfortOkay: 0, comfortNot: 0, topics: {}, last: 0 };
}

function topicStatOf(st: TypeStat, topic?: string): TopicStat | null {
  if (!topic) return null;
  if (!st.topics[topic]) st.topics[topic] = { plays: 0, skips: 0, not: 0 };
  return st.topics[topic];
}

/** Record a completed (or partially completed) session. This drives future difficulty. */
export function recordSession(type: string, r: { correct: number; total: number; timeMs: number; topic?: string; skipped?: boolean }) {
  const stats = getStats();
  const st = stats[type] ?? emptyStat();
  st.sessions += 1;
  st.attempts += r.total;
  st.correct += r.correct;
  st.timeMs += r.timeMs;
  st.last = Date.now();
  const tp = topicStatOf(st, r.topic);
  if (tp) tp.plays += 1;
  stats[type] = st;
  save(STATS_KEY, stats);

  const log = load<LogEntry[]>(LOG_KEY, []);
  log.push({ type, topic: r.topic, correct: r.correct, total: r.total, ts: Date.now(), skipped: r.skipped });
  if (log.length > 200) log.splice(0, log.length - 200);
  save(LOG_KEY, log);
}

export function recordSkip(type: string, topic?: string) {
  const stats = getStats();
  const st = stats[type] ?? emptyStat();
  st.skips += 1;
  st.last = Date.now();
  const tp = topicStatOf(st, topic);
  if (tp) tp.skips += 1;
  stats[type] = st;
  save(STATS_KEY, stats);
}

/** Comfort feedback — "not" measurably reduces that topic's future frequency. */
export function recordComfort(type: string, topic: string | undefined, comfort: Comfort) {
  const stats = getStats();
  const st = stats[type] ?? emptyStat();
  if (comfort === "good") st.comfortGood += 1;
  if (comfort === "okay") st.comfortOkay += 1;
  if (comfort === "not") {
    st.comfortNot += 1;
    const tp = topicStatOf(st, topic);
    if (tp) tp.not += 2; // strong, measurable reduction
  }
  st.last = Date.now();
  stats[type] = st;
  save(STATS_KEY, stats);
}

export function getStat(type: string): TypeStat {
  return getStats()[type] ?? emptyStat();
}

/** 1 = gentle, 2 = everyday, 3 = lively. Derived from rolling accuracy + comfort. */
export function getDifficulty(type: string): 1 | 2 | 3 {
  const st = getStat(type);
  if (st.attempts < 5) return 2;
  const acc = st.correct / st.attempts;
  let d: 1 | 2 | 3 = 2;
  if (acc >= 0.75) d = 3;
  else if (acc < 0.5) d = 1;
  // Repeated discomfort pulls difficulty down, always
  if (st.comfortNot >= 2 && d > 1) d = (d - 1) as 1 | 2 | 3;
  return d;
}

export function topicWeight(st: TypeStat, topicId: string): number {
  const tp = st.topics[topicId];
  if (!tp) return 1;
  return Math.max(0.12, 1 + tp.plays * 0.05 - tp.skips * 0.45 - tp.not * 0.5);
}

/** Weighted topic choice — skipped / "not great" topics surface less often. */
export function pickTopic(profile: PatientProfile, type: string): string {
  const topics = profileTopics(profile);
  const st = getStat(type);
  const weighted = topics.map((tp) => ({ id: tp.id, w: topicWeight(st, tp.id) }));
  const total = weighted.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of weighted) {
    r -= x.w;
    if (r <= 0) return x.id;
  }
  return topics[0].id;
}

export function pickTopicN(profile: PatientProfile, type: string, n: number): string[] {
  const out: string[] = [];
  const topics = profileTopics(profile);
  const pool = [...topics];
  for (let i = 0; i < n; i++) {
    if (pool.length === 0) break;
    const st = getStat(type);
    const weighted = pool.map((tp) => ({ id: tp.id, w: topicWeight(st, tp.id) }));
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    let chosen = weighted[0].id;
    for (const x of weighted) {
      r -= x.w;
      if (r <= 0) { chosen = x.id; break; }
    }
    out.push(chosen);
    const idx = pool.findIndex((tp) => tp.id === chosen);
    if (idx >= 0) pool.splice(idx, 1);
  }
  return out;
}

export interface GameSettings {
  pairs: number;        // memory match
  seqLen: number;       // pattern
  options: number;      // answer buttons
  grid: number;         // attention grid side
  showMs: number;       // attention display time
  rounds: number;
}

/** Difficulty → concrete gameplay numbers. Changing these changes the next game. */
export function settingsFor(type: string): GameSettings {
  const d = getDifficulty(type);
  const map: Record<number, GameSettings> = {
    1: { pairs: 3, seqLen: 3, options: 2, grid: 3, showMs: 5000, rounds: 3 },
    2: { pairs: 4, seqLen: 4, options: 3, grid: 3, showMs: 3600, rounds: 4 },
    3: { pairs: 6, seqLen: 5, options: 4, grid: 4, showMs: 2600, rounds: 5 },
  };
  return map[d];
}

export function totalCompleted(): number {
  return Object.values(getStats()).reduce((s, st) => s + st.sessions - st.skips + st.skips, 0);
}

export function todayCount(): number {
  const today = todayKey();
  return load<LogEntry[]>(LOG_KEY, []).filter((e) => new Date(e.ts).toISOString().slice(0, 10) === today && !e.skipped).length;
}

export function weekCount(): number {
  const cutoff = Date.now() - 7 * 86400000;
  return load<LogEntry[]>(LOG_KEY, []).filter((e) => e.ts >= cutoff && !e.skipped).length;
}

export function favouriteActivity(): string | null {
  const stats = getStats();
  let best: string | null = null;
  let bestN = 0;
  for (const [type, st] of Object.entries(stats)) {
    const n = st.sessions - st.skips;
    if (n > bestN) { bestN = n; best = type; }
  }
  return best;
}

export function favouriteTopicName(): string | null {
  const stats = getStats();
  const counts: Record<string, number> = {};
  for (const st of Object.values(stats)) {
    for (const [topic, tp] of Object.entries(st.topics)) {
      counts[topic] = (counts[topic] ?? 0) + tp.plays - tp.skips - tp.not;
    }
  }
  let best: string | null = null;
  let bestN = -Infinity;
  for (const [topic, n] of Object.entries(counts)) {
    if (n > bestN) { bestN = n; best = topic; }
  }
  return best;
}

export function mostSkippedType(): string | null {
  const stats = getStats();
  let best: string | null = null;
  let bestN = 1;
  for (const [type, st] of Object.entries(stats)) {
    if (st.skips > bestN) { bestN = st.skips; best = type; }
  }
  return best;
}

export function highEngagementType(): string | null {
  const stats = getStats();
  let best: string | null = null;
  let bestAcc = 0.69;
  for (const [type, st] of Object.entries(stats)) {
    if (st.attempts >= 8) {
      const acc = st.correct / st.attempts;
      if (acc > bestAcc) { bestAcc = acc; best = type; }
    }
  }
  return best;
}

export function recentLog(n: number): LogEntry[] {
  return load<LogEntry[]>(LOG_KEY, []).slice(-n).reverse();
}

export function uniqueRoutineDays(reminders: { doneDates: string[] }[]): number {
  const set = new Set<string>();
  reminders.forEach((r) => r.doneDates.forEach((d) => set.add(d)));
  return set.size;
}

export function activityLabelKey(type: string): string {
  const map: Record<string, string> = {
    memory_match: "activities.memoryMatch",
    pattern: "activities.patternMemory",
    story: "activities.storyRecall",
    attention: "activities.attention",
    language: "activities.language",
    music: "activities.musicAct",
    colour: "activities.colourMatch",
    maths: "activities.maths",
  };
  return map[type] ?? "activities.memoryMatch";
}

export function shuffledTopicsFor(profile: PatientProfile, type: string): string[] {
  return shuffle(profileTopics(profile).map((tp) => tp.id));
}

/* Seed a gentle demo history once, so the caregiver dashboard,
   insights and weekly report feel alive from the first open. */
(function seedDemoHistory() {
  if (load<boolean>("adapt_seeded", false)) return;
  save("adapt_seeded", true);
  const now = Date.now();
  const mk = (p: Partial<TypeStat>): TypeStat => ({ ...emptyStat(), ...p });
  const stats: Stats = {
    memory_match: mk({ attempts: 26, correct: 19, sessions: 4, timeMs: 420000, comfortGood: 3, topics: { gardening: { plays: 3, skips: 0, not: 0 }, family: { plays: 1, skips: 0, not: 0 } } }),
    music: mk({ attempts: 12, correct: 10, sessions: 2, timeMs: 260000, comfortGood: 2, topics: { music: { plays: 2, skips: 0, not: 0 } } }),
    story: mk({ attempts: 10, correct: 6, sessions: 2, skips: 1, timeMs: 200000, comfortOkay: 1, comfortNot: 1, topics: { cooking: { plays: 2, skips: 1, not: 1 }, family: { plays: 1, skips: 0, not: 0 } } }),
    pattern: mk({ attempts: 12, correct: 8, sessions: 2, timeMs: 180000, comfortGood: 1, topics: { gardening: { plays: 2, skips: 0, not: 0 } } }),
  };
  stats.memory_match.last = now - 3600000;
  stats.music.last = now - 2 * 3600000;
  const log: LogEntry[] = [
    { type: "pattern", topic: "gardening", correct: 3, total: 4, ts: now - 2 * 86400000 },
    { type: "story", topic: "cooking", correct: 2, total: 3, ts: now - 2 * 86400000, skipped: true },
    { type: "memory_match", topic: "gardening", correct: 4, total: 7, ts: now - 86400000 },
    { type: "music", topic: "music", correct: 2, total: 2, ts: now - 86400000 },
    { type: "memory_match", topic: "gardening", correct: 5, total: 6, ts: now - 3 * 3600000 },
    { type: "music", topic: "music", correct: 2, total: 2, ts: now - 2 * 3600000 },
    { type: "story", topic: "family", correct: 2, total: 3, ts: now - 1 * 3600000 },
  ];
  save(STATS_KEY, stats);
  save(LOG_KEY, log);
})();

export { topicById };
