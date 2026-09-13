import { MOTIFS, motifsByCat, MOTIF_IDS } from "../data/motifs";
import { ASSOCIATIONS, COLOURS, FALLBACK_QUESTIONS, PHRASES, SONGS, type SongDef } from "../data/seed";
import type { Lang, Memory, PatientProfile, Tr } from "../lib/types";
import { pickTopic, pickTopicN, settingsFor } from "./adaptationEngine";
import { getEligibleMemories, pick, profileTopics, shuffle, topicById, trPick } from "./memoryService";

const tr = (en: string, as: string, bn: string): Tr => ({ en, as, bn });

export type Generated =
  | { kind: "memory_match"; topic: string; category: string; iconPool: string[] }
  | { kind: "pattern"; topic: string; options: string[] }
  | { kind: "story"; rounds: StoryRound[]; personalized: boolean }
  | { kind: "attention"; rounds: AttentionRound[] }
  | { kind: "language"; rounds: LanguageRound[] }
  | { kind: "music"; rounds: MusicRound[] }
  | { kind: "colour"; rounds: ColourRound[] }
  | { kind: "maths"; rounds: MathsRound[] };

export interface StoryRound {
  memory?: Memory;
  question: Tr;
  options: Tr[];
  answerIdx: number;
  motif?: string;
  isVoice?: boolean;
  voiceFrom?: Tr;
  voiceLabel?: Tr;
}

export interface AttentionRound {
  mode: "changed" | "odd";
  icons: string[];
  changedIndex: number;
  oddIndex: number;
}

export interface LanguageRound {
  mode: "phrase" | "assoc" | "picture";
  prompt: Tr;
  options: Tr[];
  answerIdx: number;
  motif?: string;
}

export interface MusicRound {
  song: SongDef;
  titleOptions: Tr[];
  answerIdx: number;
  whereOptions: Tr[];
}

export interface ColourRound { hex: string; options: { id: string; hex: string; name: Tr }[]; answerIdx: number }
export interface MathsRound { prompt: Tr; options: number[]; answerIdx: number }

/**
 * Rule/template-based generation — no external AI needed.
 * Personalized content is chosen from eligible (non-sensitive) memories
 * and the patient's tagged interests. Throws when personalization is
 * impossible so callers can show the gentle fallback.
 */
export function generateActivity(type: string, profile: PatientProfile, allMemories: Memory[], opts?: { memoryId?: string; voices?: { from: Tr; label: Tr }[] }): Generated {
  const eligible = getEligibleMemories(allMemories);
  const s = settingsFor(type);

  switch (type) {
    case "memory_match": {
      const topic = pickTopic(profile, type);
      const cat = topicById(topic).category;
      let pool = motifsByCat(cat);
      const others = MOTIF_IDS.filter((id) => MOTIFS[id].cat !== cat);
      pool = [...pool, ...shuffle(others)];
      return { kind: "memory_match", topic, category: cat, iconPool: pool.slice(0, Math.max(6, s.pairs)) };
    }

    case "pattern": {
      const topic = pickTopic(profile, type);
      const cat = topicById(topic).category;
      const optsPool = shuffle([...motifsByCat(cat), ...motifsByCat("nature")]).slice(0, Math.max(4, s.options + 2));
      return { kind: "pattern", topic, options: optsPool };
    }

    case "story": {
      const rounds: StoryRound[] = [];
      const withRecall = eligible.filter((m) => m.recall);
      if (withRecall.length === 0) {
        // Personalization impossible — caller surfaces the gentle fallback + generic rounds
        FALLBACK_QUESTIONS.slice(0, 3).forEach((q) => {
          rounds.push({ question: q.question, options: q.options, answerIdx: q.answer, motif: q.motif });
        });
        const g: Generated = { kind: "story", rounds, personalized: false };
        return g;
      }
      const want = Math.min(s.rounds, withRecall.length);
      const chosen = shuffle(withRecall).slice(0, want);
      chosen.forEach((mem) => {
        const rec = mem.recall!;
        const correct = trPick(rec.answer, "en");
        const correctOpt = rec.options.find((o) => trPick(o, "en") === correct) ?? rec.options[0];
        const distractors = shuffle(rec.options.filter((o) => trPick(o, "en") !== correct)).slice(0, Math.max(1, s.options - 1));
        const opts = shuffle([correctOpt, ...distractors]);
        rounds.push({
          memory: mem,
          question: rec.question,
          options: opts,
          answerIdx: opts.findIndex((x) => trPick(x, "en") === correct),
          isVoice: Boolean(mem.voiceNote),
          voiceFrom: undefined,
          voiceLabel: undefined,
        });
      });
      // Occasionally surface a family voice note round instead of a plain question
      if (opts?.voices && opts.voices.length > 0 && Math.random() < 0.5) {
        const v = pick(opts.voices);
        const names = opts.voices.map((x) => x.from);
        const voiceOpts = shuffle(names);
        rounds.push({
          question: tr("Who sent this voice message?", "এই মাতৰ বাৰ্তাটো কোনে পঠিয়াইছে?", "এই কণ্ঠবার্তাটা কে পাঠিয়েছে?"),
          options: voiceOpts,
          answerIdx: voiceOpts.findIndex((x) => trPick(x, "en") === trPick(v.from, "en")),
          isVoice: true,
          voiceFrom: v.from,
          voiceLabel: v.label,
        });
      }
      return { kind: "story", rounds, personalized: true };
    }

    case "attention": {
      const topic = pickTopic(profile, type);
      const cat = topicById(topic).category;
      const rounds: AttentionRound[] = [];
      for (let i = 0; i < 3; i++) {
        const pool = shuffle(motifsByCat(cat).concat(shuffle(MOTIF_IDS).slice(0, 6)));
        const n = s.grid * s.grid;
        const mode: "changed" | "odd" = i % 2 === 0 ? "changed" : "odd";
        const icons: string[] = [];
        const oddIndex = Math.floor(Math.random() * n);
        if (mode === "odd") {
          const base = pool[0];
          const odd = pool.find((x) => x !== base) ?? "lotus";
          for (let k = 0; k < n; k++) icons.push(k === oddIndex ? odd : base);
        } else {
          for (let k = 0; k < n; k++) icons.push(pool[k % Math.min(pool.length, 4 + i)]);
        }
        rounds.push({ mode, icons, changedIndex: Math.floor(Math.random() * n), oddIndex });
      }
      return { kind: "attention", rounds };
    }

    case "language": {
      const rounds: LanguageRound[] = [];
      const phrases = shuffle(PHRASES).slice(0, 2);
      phrases.forEach((p) => rounds.push({ mode: "phrase", prompt: p.prompt, options: p.options, answerIdx: p.answer }));
      const assoc = shuffle(ASSOCIATIONS).slice(0, 2);
      assoc.forEach((a) => rounds.push({ mode: "assoc", prompt: a.word, options: a.options, answerIdx: a.answer }));
      const topic = pickTopic(profile, type);
      const pics = shuffle(motifsByCat(topicById(topic).category)).slice(0, 2);
      pics.forEach((pid) => {
        const correctName = MOTIFS[pid].name;
        const others = shuffle(MOTIF_IDS.filter((id) => id !== pid)).slice(0, 2).map((id) => MOTIFS[id].name);
        const options = shuffle([correctName, ...others]);
        rounds.push({
          mode: "picture",
          prompt: tr("What is this?", "এইটো কি?", "এটা কী?"),
          options,
          answerIdx: options.findIndex((o) => trPick(o, "en") === trPick(correctName, "en")),
          motif: pid,
        });
      });
      return { kind: "language", rounds: shuffle(rounds).slice(0, Math.min(s.rounds, 5)) };
    }

    case "music": {
      const rounds: MusicRound[] = shuffle(SONGS).slice(0, 2).map((song) => {
        const wrong = shuffle(SONGS.filter((x) => x.id !== song.id)).slice(0, 2).map((x) => x.title);
        const titleOptions = shuffle([song.title, ...wrong]);
        return {
          song,
          titleOptions,
          answerIdx: titleOptions.findIndex((t) => trPick(t, "en") === trPick(song.title, "en")),
          whereOptions: shuffle([
            tr("At weddings", "বিয়াত", "বিয়েতে"),
            tr("On the radio", "ৰেডিঅ'ত", "রেডিওতে"),
            tr("At prayers", "প্ৰাৰ্থনাত", "প্রার্থনায়"),
            tr("At harvest festivals", "শস্যৰ উৎসৱত", "ফসল উৎসবে"),
          ]).slice(0, Math.max(3, s.options)),
        };
      });
      return { kind: "music", rounds };
    }

    case "colour": {
      const rounds: ColourRound[] = [];
      const pool = shuffle(COLOURS);
      for (let i = 0; i < 4; i++) {
        const correct = pool[i % pool.length];
        const others = shuffle(COLOURS.filter((c) => c.id !== correct.id)).slice(0, s.options - 1);
        const options = shuffle([correct, ...others]);
        rounds.push({ hex: correct.hex, options, answerIdx: options.findIndex((o) => o.id === correct.id) });
      }
      return { kind: "colour", rounds };
    }

    case "maths": {
      const rounds: MathsRound[] = [];
      const d = settingsFor(type).options; // reuse difficulty mapping (2..4)
      for (let i = 0; i < 4; i++) {
        rounds.push(buildMaths(d, i));
      }
      return { kind: "maths", rounds };
    }

    default:
      return generateActivity("memory_match", profile, allMemories, opts);
  }
}

function buildMaths(diffLevel: number, i: number): MathsRound {
  const left = tr("How much is left?", "কিমান বাকী থাকিল?", "কত টাকা বাকি থাকল?");
  const totalQ = tr("How much altogether?", "মুঠ কিমান হ'ল?", "মোট কত হল?");
  if (diffLevel <= 2) {
    const a = 5 + Math.floor(Math.random() * 20);
    const b = 1 + Math.floor(Math.random() * Math.min(9, a));
    if (i % 2 === 0) {
      return mathsRound(tr(`You have ₹${a} and spend ₹${b}. ${left.en}`, `আপোনাৰ ₹${a} আছে আৰু ₹${b} খৰচ কৰিলে। ${left.as}`, `আপনার ₹${a} আছে আর ₹${b} খরচ করলেন। ${left.bn}`), a - b);
    }
    return mathsRound(tr(`You pick ${b} marigolds, then ${a - b} more. ${totalQ.en}`, `আপুনি ${b}টা গেন্দা তুলিলে, তাৰ পিছত আৰু ${a - b}টা। ${totalQ.as}`, `আপনি ${b}টা গাঁদা তুললেন, তারপর আরও ${a - b}টা। ${totalQ.bn}`), a);
  }
  if (diffLevel === 3) {
    const a = 20 + Math.floor(Math.random() * 60);
    const b = 5 + Math.floor(Math.random() * 15);
    return mathsRound(tr(`You have ₹${a} and spend ₹${b} on vegetables. ${left.en}`, `আপোনাৰ ₹${a} আছে আৰু পাচলিত ₹${b} খৰচ কৰিলে। ${left.as}`, `আপনার ₹${a} আছে আর সবজিতে ₹${b} খরচ করলেন। ${left.bn}`), a - b);
  }
  const a = 10 + Math.floor(Math.random() * 30);
  const b = 5 + Math.floor(Math.random() * 20);
  const c = 2 + Math.floor(Math.random() * 8);
  return mathsRound(tr(`You have ₹${a}, find ₹${b}, then give ₹${c} away. ${left.en}`, `আপোনাৰ ₹${a} আছে, ₹${b} পালে, তাৰ পিছত ₹${c} দিলে। ${left.as}`, `আপনার ₹${a} আছে, ₹${b} পেলেন, তারপর ₹${c} দিলেন। ${left.bn}`), a + b - c);
}

function mathsRound(prompt: Tr, answer: number): MathsRound {
  const wrong = new Set<number>();
  while (wrong.size < 2) {
    const delta = (Math.floor(Math.random() * 8) + 1) * (Math.random() < 0.5 ? -1 : 1);
    const w = answer + delta;
    if (w !== answer && w >= 0) wrong.add(w);
  }
  const options = shuffle([answer, ...wrong]);
  return { prompt, options, answerIdx: options.indexOf(answer) };
}

export function topicsForHub(profile: PatientProfile): { id: string; label: Tr }[] {
  return profileTopics(profile).map((tp) => ({ id: tp.id, label: tp.label }));
}

export function hubTopicFor(profile: PatientContextLike, actType: string, allMemories: Memory[], lang: Lang): string {
  const topic = pickTopicN(profile.profile, actType, 1)[0];
  void allMemories;
  void lang;
  return trPick(topicById(topic).label, lang);
}

export interface PatientContextLike { profile: PatientProfile }
