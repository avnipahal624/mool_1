import type { Lang, Memory, PatientProfile, Tr } from "../lib/types";
import type { MotifCategory } from "../data/motifs";

/**
 * Core privacy rule of Memory Garden:
 * memories marked sensitive MUST NEVER enter activity generation.
 * Every activity pipeline calls getEligibleMemories().
 */
export function getEligibleMemories(memories: Memory[]): Memory[] {
  return memories.filter((m) => !m.sensitive);
}

export function getMemoriesByType(memories: Memory[], type: string): Memory[] {
  if (type === "all") return memories;
  return memories.filter((m) => m.type === type);
}

export interface Topic {
  id: string;
  label: Tr;
  category: MotifCategory;
}

export const TOPICS: Topic[] = [
  { id: "gardening", label: { en: "flowers & gardens", as: "ফুল আৰু বাগিচা", bn: "ফুল আর বাগান" }, category: "flowers" },
  { id: "nature", label: { en: "nature & birds", as: "প্ৰকৃতি আৰু চৰাই", bn: "প্রকৃতি আর পাখি" }, category: "nature" },
  { id: "cooking", label: { en: "cooking & food", as: "ৰান্ধনি আৰু খাদ্য", bn: "রান্না আর খাবার" }, category: "foods" },
  { id: "food", label: { en: "food & treats", as: "খাদ্য আৰু মিঠাই", bn: "খাবার আর মিষ্টি" }, category: "foods" },
  { id: "music", label: { en: "music & instruments", as: "সংগীত আৰু বাদ্য", bn: "সংগীত আর বাদ্য" }, category: "instruments" },
  { id: "family", label: { en: "family & festivals", as: "পৰিয়াল আৰু উৎসৱ", bn: "পরিবার আর উৎসব" }, category: "festival" },
  { id: "stories", label: { en: "stories & home", as: "সাধু আৰু ঘৰ", bn: "গল্প আর ঘর" }, category: "household" },
  { id: "travel", label: { en: "places & journeys", as: "ঠাই আৰু যাত্ৰা", bn: "জায়গা আর ভ্রমণ" }, category: "nature" },
];

export function topicById(id: string): Topic {
  return TOPICS.find((tp) => tp.id === id) ?? TOPICS[0];
}

/** Map the patient's interests to usable activity topics. */
export function profileTopics(profile: PatientProfile): Topic[] {
  const picks = profile.interests
    .map((i) => TOPICS.find((tp) => tp.id === i))
    .filter((tp): tp is Topic => Boolean(tp));
  if (picks.length === 0) return [TOPICS[0], TOPICS[4]];
  return picks;
}

/** Memory → activity topic (used by "This memory can inspire"). */
export function memoryTopic(mem: Memory): Topic {
  const t = mem.tags.find((tag) => TOPICS.some((tp) => tp.id === tag));
  return topicById(t ?? "stories");
}

export function trPick(t: Tr, lang: Lang): string {
  return t[lang] ?? t.en;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
