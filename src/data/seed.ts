import type { AlertItem, FamilyMessage, Memory, PatientProfile, PatientWallet, Reminder, Tr, VoiceNote } from "../lib/types";

const tr = (en: string, as: string, bn: string): Tr => ({ en, as, bn });
const day = 86400000;
const now = Date.now();

export const ALL_INTERESTS = ["gardening", "music", "cooking", "family", "nature", "stories", "food", "travel"];

export const mockPatient: PatientProfile = {
  name: "Mitali",
  age: 72,
  preferredLanguage: "as",
  interests: ["gardening", "music", "cooking", "family"],
};

export const seedMemories: Memory[] = [
  {
    id: "mem-roses",
    type: "story",
    title: tr("The balcony rose garden", "বেলকনিৰ গোলাপ বাগিচা", "বারান্দার গোলাপ বাগান"),
    text: tr(
      "Mitali loved growing roses on the balcony of their old house in Jorhat. Every morning she watered them before tea, and the neighbours would stop to smell the pink ones.",
      "যোৰহাটৰ পুৰণি ঘৰৰ বেলকনিত মিতালিয়ে গোলাপ ফুলাই বৰ ভাল পাইছিল। প্ৰতি পুৱা চাহৰ আগতে তেওঁ পানী দিছিল, আৰু ওচৰ-চুবুৰীয়াই গোলাপী ফুলবোৰৰ গোন্ধ ল'বলৈ ৰৈ গৈছিল।",
      "যোরহাটের পুরোনো বাড়ির বারান্দায় মিতালি গোলাপ ফোটাতে খুব ভালোবাসতেন। প্রতি সকালে চায়ের আগে জল দিতেন, আর প্রতিবেশীরা গোলাপি ফুলগুলোর গন্ধ নিতে থেমে যেত।"
    ),
    tags: ["gardening", "nature"],
    sensitive: false,
    createdAt: now - 20 * day,
    recall: {
      question: tr("What did Mitali love growing on the balcony?", "বেলকনিত মিতালিয়ে কি ফুলাই ভাল পাইছিল?", "বারান্দায় মিতালি কী ফোটাতে ভালোবাসতেন?"),
      answer: tr("Roses", "গোলাপ", "গোলাপ"),
      options: [tr("Roses", "গোলাপ", "গোলাপ"), tr("Mangoes", "আম", "আম"), tr("Books", "কিতাপ", "বই"), tr("Umbrellas", "ছাতি", "ছাতা")],
    },
  },
  {
    id: "mem-bihu",
    type: "event",
    title: tr("Rongali Bihu in the village", "গাঁৱত ৰঙালী বিহু", "গ্রামে রঙালি বিহু"),
    text: tr(
      "Every Bohag month the whole village danced Bihu under the big banyan tree. Mitali wore her red-bordered gamosa-pattern sari and clapped till the dhol players laughed.",
      "প্ৰতি ব'হাগ মাহত গোটেই গাঁৱে ডাঙৰ বট গছৰ তলত বিহু নাচিছিল। মিতালিয়ে ৰঙা পাৰি থকা সাজু পিন্ধিছিল আৰু ঢোলবাদকসকল হঁহোৱালৈকে তালি বজাইছিল।",
      "প্রতি বৈশাখ মাসে পুরো গ্রাম বড় বটগাছের তলায় বিহু নাচত। মিতালি লাল পাড়ের শাড়ি পরতেন আর ঢোলিরা হাসা পর্যন্ত তালি দিতেন।"
    ),
    tags: ["music", "family", "stories"],
    sensitive: false,
    createdAt: now - 15 * day,
    recall: {
      question: tr("Which festival did the village dance under the banyan tree?", "বট গছৰ তলত গাঁৱে কোনটো উৎসৱ নাচিছিল?", "বটগাছের তলায় গ্রাম কোন উৎসব নাচত?"),
      answer: tr("Bihu", "বিহু", "বিহু"),
      options: [tr("Bihu", "বিহু", "বিহু"), tr("Diwali", "দীপাৱলী", "দিওয়ালি"), tr("Christmas", "বৰদিন", "বড়দিন"), tr("Holi", "হোলী", "হোলি")],
    },
  },
  {
    id: "mem-curry",
    type: "story",
    title: tr("Ma's fish curry recipe", "মাৰ মাছৰ তৰকাৰীৰ ৰেচিপি", "মায়ের মাছের তরকারির রেসিপি"),
    text: tr(
      "On Sundays Mitali cooked her mother's fish curry with bamboo shoot. The whole house smelled of ginger, and the grandchildren would race to sit closest to the pot.",
      "দেওবাৰে মিতালিয়ে মাকৰ ভেটুৱা মাছৰ তৰকাৰী ৰান্ধিছিল। গোটেই ঘৰত আদাৰ গোন্ধ বিয়পি পৰিছিল, আৰু নাতি-নাতিনীহঁতে হাড়িৰ ওচৰত বহিবলৈ দৌৰি গৈছিল।",
      "রোববার মিতালি তার মায়ের বাঁশকুর দিয়ে মাছের তরকারি রাঁধতেন। পুরো বাড়ি আদার গন্ধে ভরে যেত, আর নাতি-নাতনিরা হাঁড়ির কাছে বসতে দৌড় দিত।"
    ),
    tags: ["cooking", "food", "family"],
    sensitive: false,
    createdAt: now - 12 * day,
    recall: {
      question: tr("What did Mitali cook on Sundays?", "দেওবাৰে মিতালিয়ে কি ৰান্ধিছিল?", "রোববার মিতালি কী রাঁধতেন?"),
      answer: tr("Fish curry", "মাছৰ তৰকাৰী", "মাছের তরকারি"),
      options: [tr("Fish curry", "মাছৰ তৰকাৰী", "মাছের তরকারি"), tr("Noodles", "নুডলছ", "নুডলস"), tr("Cake", "কেক", "কেক"), tr("Pickles", "আচাৰ", "আচার")],
    },
  },
  {
    id: "mem-teagarden",
    type: "place",
    title: tr("The tea gardens of Jorhat", "যোৰহাটৰ চাহ বাগিচা", "যোরহাটের চা বাগান"),
    text: tr(
      "Mitali's brother worked in the tea gardens near Jorhat. In winter the family walked through the green rows at sunrise, when the mist still slept over the bushes.",
      "মিতালিৰ দাদা যোৰহাটৰ ওচৰৰ চাহ বাগিচাত কাম কৰিছিল। শীতত পৰিয়ালটো পুৱা সেউজীয়া শাৰীবোৰৰ মাজেৰে খোজ কাঢ়িছিল, যেতিয়া কুঁৱলীয়ে এতিয়াও জোপোহাবোৰত টোপনিয়াই আছিল।",
      "মিতালির দাদা যোরহাটের কাছে চা বাগানে কাজ করতেন। শীতে পরিবার ভোরে সবুজ সারির মধ্যে হাঁটত, যখন কুয়াশা তখনো ঝোপের উপর ঘুমিয়ে।"
    ),
    tags: ["nature", "travel", "family"],
    sensitive: false,
    createdAt: now - 9 * day,
    recall: {
      question: tr("Whose family walked through the tea gardens at sunrise?", "পুৱাৰ চাহ বাগিচাত কোনৰ পৰিয়াল খোজ কাঢ়িছিল?", "ভোরে চা বাগানে কার পরিবার হাঁটত?"),
      answer: tr("Mitali's", "মিতালিৰ", "মিতালির"),
      options: [tr("Mitali's", "মিতালিৰ", "মিতালির"), tr("The neighbour's", "ওচৰ-চুবুৰীয়াৰ", "প্রতিবেশীর"), tr("A stranger's", "অচিনাকিৰ", "অচেনা কারো"), tr("Nobody's", "কাৰো নহয়", "কারো নয়")],
    },
  },
  {
    id: "mem-flood",
    type: "event",
    title: tr("The year of the great flood", "মহা বানৰ বছৰটো", "মহা বন্যার বছরটা"),
    text: tr(
      "A difficult year when the Brahmaputra rose over the fields. The family stayed with relatives on higher ground. Mitali does not like to speak of this time.",
      "এটা কঠিন বছৰ যেতিয়া ব্ৰহ্মপুত্ৰই পথাৰবোৰ বুৰাই পেলাইছিল। পৰিয়ালটো ওখ ঠাইত আত্মীয়ৰ লগত আছিল। মিতালিয়ে এই সময়ৰ কথা ক'বলৈ ভাল নাপায়।",
      "একটি কঠিন বছর যখন ব্রহ্মপুত্র মাঠ ডুবিয়ে দিয়েছিল। পরিবার উঁচু জায়গায় আত্মীয়দের কাছে ছিল। মিতালি এই সময়ের কথা বলতে ভালোবাসেন না।"
    ),
    tags: ["family"],
    sensitive: true,
    createdAt: now - 30 * day,
  },
  {
    id: "mem-baban",
    type: "person",
    title: tr("Morning tea with Baban", "বাবনৰ লগত পুৱাৰ চাহ", "বাবনের সঙ্গে সকালের চা"),
    text: tr(
      "Baban, Mitali's husband, always made two cups of tea at dawn. He put a little extra ginger in hers, and they watched the garden wake up together on the veranda.",
      "মিতালিৰ স্বামী বাবনে সদায় পুৱা দুকাপ চাহ বনাইছিল। তেওঁ মিতালিৰটোত অলপ বেছি আদা দিছিল, আৰু দুয়োজনে বৰাণ্ডাত বহি বাগিচা সাৰ পোৱা চাইছিল।",
      "মিতালির স্বামী বাবন সবসময় ভোরে দু'কাপ চা বানাতেন। মিতালিরটায় একটু বেশি আদা দিতেন, আর দুজনে বারান্দায় বসে বাগান জাগা দেখতেন।"
    ),
    tags: ["family", "stories"],
    sensitive: false,
    createdAt: now - 6 * day,
    recall: {
      question: tr("Who made two cups of tea at dawn?", "পুৱা কোনে দুকাপ চাহ বনাইছিল?", "ভোরে কে দু'কাপ চা বানাতেন?"),
      answer: tr("Baban", "বাবন", "বাবন"),
      options: [tr("Baban", "বাবন", "বাবন"), tr("The postman", "ডাকবাবু", "ডাকবাবু"), tr("Priya", "প্ৰিয়া", "প্রিয়া"), tr("The neighbour", "ওচৰ-চুবুৰীয়া", "প্রতিবেশী")],
    },
  },
  {
    id: "mem-priya",
    type: "person",
    title: tr("Priya's crayon drawings", "প্ৰিয়াৰ ক্ৰেয়ন ছবি", "প্রিয়ার ক্রেয়ন ছবি"),
    text: tr(
      "Granddaughter Priya draws Mitali holding a big sun every visit. The drawings hang on the kitchen wall, and Mitali can tell you which one is which.",
      "নাতি প্ৰিয়াই প্ৰতিবাৰ আহোঁতে এটা ডাঙৰ বেলি ধৰি থকা মিতালিৰ ছবি আঁকে। ছবিকেইখন ৰান্ধনীঘৰৰ বেৰত ওলোমাই থোৱা আছে, আৰু কোনটো কোনটো মিতালিয়ে ক'ব পাৰে।",
      "নাতনি প্রিয়া প্রতিবার এসে একটা বড় সূর্য ধরা মিতালির ছবি আঁকে। ছবিগুলো রান্নাঘরের দেয়ালে ঝোলানো, আর কোনটা কোনটা মিতালি বলতে পারেন।"
    ),
    tags: ["family", "stories"],
    sensitive: false,
    createdAt: now - 3 * day,
    voiceNote: { label: "Priya saying hello", duration: 12 },
    recall: {
      question: tr("What does Priya draw every visit?", "প্ৰিয়াই প্ৰতিবাৰ আহোঁতে কি আঁকে?", "প্রিয়া প্রতিবার এসে কী আঁকে?"),
      answer: tr("Mitali holding a big sun", "ডাঙৰ বেলি ধৰি থকা মিতালি", "বড় সূর্য ধরা মিতালি"),
      options: [tr("Mitali holding a big sun", "ডাঙৰ বেলি ধৰি থকা মিতালি", "বড় সূর্য ধরা মিতালি"), tr("A train", "ৰেলগাড়ী", "ট্রেন"), tr("A fish", "মাছ", "মাছ"), tr("A phone", "ফোন", "ফোন")],
    },
  },
];

const dKey = (offset: number) => new Date(now - offset * day).toISOString().slice(0, 10);

export const seedRoutine: Reminder[] = [
  { id: "r1", time: "08:00", kind: "medicine", label: "Morning medicine", doneDates: [dKey(1)] },
  { id: "r2", time: "10:30", kind: "hydration", label: "A glass of water", doneDates: [dKey(1), dKey(2)] },
  { id: "r3", time: "13:00", kind: "meal", label: "Lunch together", doneDates: [dKey(1)] },
  { id: "r4", time: "17:00", kind: "walk", label: "Evening walk on the veranda", doneDates: [] },
  { id: "r5", time: "19:30", kind: "appointment", label: "Phone call with Dr. Sharma (Thu)", doneDates: [] },
];

export const seedVoices: VoiceNote[] = [
  { id: "v1", from: tr("Anima (daughter)", "অনিমা (জীয়ৰী)", "অনিমা (মেয়ে)"), label: tr("Remember our rose garden, Ma", "মাহঁত, আমাৰ গোলাপ বাগিচাটো মনত আছেনে", "মা, আমাদের গোলাপ বাগানটা মনে আছে"), duration: 24, date: now - 2 * day },
  { id: "v2", from: tr("Joy (son)", "জয় (পুতেক)", "জয় (ছেলে)"), label: tr("I'll bring pitha on Sunday", "দেওবাৰে মই পিঠা আনিম", "রোববার আমি পিঠা আনব"), duration: 15, date: now - day },
];

/* IMAGE PROVENANCE: the two illustration URLs below are AI-generated artwork
   produced specifically for this project (not photographs of real people and
   not scraped from any source). The family, names and messages are fictional
   demo content. If an image URL ever fails to load, MsgImage in Life.tsx
   renders a labelled vector placeholder instead. */
export const seedFamily: FamilyMessage[] = [
  { id: "f1", kind: "photo", from: tr("Anima, your daughter", "অনিমা, আপোনাৰ জীয়ৰী", "অনিমা, আপনার মেয়ে"), preview: tr("A photo from Sunday in the garden", "দেওবাৰে বাগিচাৰ এখন ফটো", "রোববার বাগানের একটা ছবি"), image: "https://image.qwenlm.ai/generated-images/b96401b5-4fdc-4bf7-acdb-bd9150ed18bf/_result.png", date: now - day, read: false },
  { id: "f2", kind: "voice", from: tr("Joy, your son", "জয়, আপোনাৰ পুতেক", "জয়, আপনার ছেলে"), preview: tr("A short hello before work", "কামলৈ যোৱাৰ আগতে এটা চমু নমস্কাৰ", "কাজে যাওয়ার আগে একটু ছোট্ট নমস্কার"), date: now - 2 * day, read: false },
  { id: "f3", kind: "text", from: tr("Ruma, your sister", "ৰুমা, আপোনাৰ ভগ্নী", "রুমা, আপনার বোন"), preview: tr("A note for you", "আপোনাৰ বাবে এটা টোকা", "আপনার জন্য একটা নোট"), body: tr("Thinking of you, didi. The marigolds in my garden made me think of yours. See you on Saturday with sweets.", "দেউতি আপোনাক মনত পেলাইছোঁ। মোৰ বাগিচাৰ গেন্দাবোৰে আপোনাৰটোৰ কথা মনত পেলালে। শনিবাৰে মিঠাই লৈ লগ পাম।", "দিদি আপনাকে মনে করছি। আমার বাগানের গাঁদাগুলো আপনারটার কথা মনে করিয়ে দিল। শনিবার মিষ্টি নিয়ে দেখা হবে।"), date: now - 3 * day, read: true },
  { id: "f4", kind: "photo", from: tr("Priya, your granddaughter", "প্ৰিয়া, আপোনাৰ নাতিনী", "প্রিয়া, আপনার নাতনি"), preview: tr("The newest drawing, just for you", "একেবাৰে নতুন ছবিখন, আপোনাৰ বাবেই", "একদম নতুন ছবিটা, শুধু আপনার জন্য"), image: "https://image.qwenlm.ai/generated-images/950871aa-b156-4b15-bf91-26ce341b9718/_result.png", date: now - 4 * day, read: true },
];

export const seedAlerts: AlertItem[] = [
  { id: "a1", kind: "reminder", text: tr("Routine reminder missed — evening walk", "দিনচৰ্যাৰ স্মাৰক ছুটি গ'ল — গধূলিৰ খোজ", "রুটিন রিমাইন্ডার ছুটে গেছে — সন্ধ্যার হাঁটা"), time: now - 3 * 3600000 },
  { id: "a2", kind: "family", text: tr("New family message from Anima", "অনিমাৰ পৰা নতুন বাৰ্তা", "অনিমার থেকে নতুন বার্তা"), time: now - day },
  { id: "a3", kind: "report", text: tr("Weekly report ready", "সাপ্তাহিক প্ৰতিবেদন সাজু", "সাপ্তাহিক রিপোর্ট তৈরি"), time: now - 2 * day },
];

export interface SongDef { id: string; title: Tr; notes: [number, number][]; section: "favourites" | "family" | "regional"; hint?: Tr }

export const SONGS: SongDef[] = [
  {
    id: "bihu-dhun", section: "regional",
    title: tr("Bihu Dance Tune", "বিহু নাচৰ সুৰ", "বিহু নাচের সুর"),
    notes: [[69, 1], [71, 1], [72, 1], [71, 1], [69, 1], [67, 2], [64, 1], [67, 2], [69, 1], [71, 1], [72, 1], [74, 2], [72, 1], [71, 1], [69, 3]],
    hint: tr("You danced to this at Bohag Bihu", "ব'হাগ বিহুত আপুনি ইয়াৰ লগত নাচিছিল", "বৈশাখ বিহুতে আপনি এটার সঙ্গে নেচেছিলেন"),
  },
  {
    id: "bhatiyali", section: "regional",
    title: tr("River Boat Song", "নদীৰ নাওৰ গান", "নদীর নৌকার গান"),
    notes: [[64, 2], [67, 1], [69, 2], [71, 1], [69, 1], [67, 2], [64, 1], [62, 3], [64, 2], [67, 2], [64, 3]],
  },
  {
    id: "twinkle", section: "favourites",
    title: tr("Twinkle Twinkle Little Star", "টুইংকল টুইংকল লিটল ষ্টাৰ", "টুইঙ্কল টুইঙ্কল লিটল স্টার"),
    notes: [[60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]],
    hint: tr("Mitali sang this to Anima as a baby", "মিতালিয়ে অনিমাক সৰুতে এইটো গাইছিল", "মিতালি অনিমাকে ছোটবেলায় এটা গাইতেন"),
  },
  {
    id: "evening-bhajan", section: "favourites",
    title: tr("Evening Prayer Tune", "সন্ধিয়াৰ প্ৰাৰ্থনাৰ সুৰ", "সন্ধ্যার প্রার্থনার সুর"),
    notes: [[62, 2], [64, 1], [65, 2], [67, 1], [65, 1], [64, 2], [62, 3], [60, 2], [62, 3]],
  },
  {
    id: "old-radio", section: "family",
    title: tr("The Old Radio Melody", "পুৰণি ৰেডিঅ'ৰ সুৰ", "পুরোনো রেডিওর সুর"),
    notes: [[65, 1], [67, 1], [69, 2], [67, 1], [65, 1], [64, 2], [62, 1], [64, 1], [65, 3], [64, 1], [62, 1], [60, 3]],
    hint: tr("Baban's radio played this at four o'clock tea", "বাবনৰ ৰেডিঅ'ত চাৰে চাৰিটাৰ চাহত এইটো বাজিছিল", "বাবনের রেডিওতে সাড়ে চারটের চায়ে এটা বাজত"),
  },
];

export interface RelaxSound { id: string; kind: "rain" | "garden" | "birds" | "water" | "night"; labelKey: string }
export const RELAX_SOUNDS: RelaxSound[] = [
  { id: "rain", kind: "rain", labelKey: "musicGarden.rain" },
  { id: "garden", kind: "garden", labelKey: "musicGarden.gardenBreeze" },
  { id: "birds", kind: "birds", labelKey: "musicGarden.birds" },
  { id: "water", kind: "water", labelKey: "musicGarden.water" },
  { id: "night", kind: "night", labelKey: "musicGarden.night" },
];

export const COLOURS: { id: string; hex: string; name: Tr }[] = [
  { id: "red", hex: "#c05b4d", name: tr("Red", "ৰঙা", "লাল") },
  { id: "blue", hex: "#4f7fb5", name: tr("Blue", "নীলা", "নীল") },
  { id: "green", hex: "#3e6b4a", name: tr("Green", "সেউজীয়া", "সবুজ") },
  { id: "yellow", hex: "#d9b53a", name: tr("Yellow", "হালধীয়া", "হলুদ") },
  { id: "orange", hex: "#d9862b", name: tr("Orange", "কমলা", "কমলা") },
  { id: "purple", hex: "#8a76b5", name: tr("Purple", "বেঙুনীয়া", "বেগুনি") },
];

export interface PhraseItem { prompt: Tr; options: Tr[]; answer: number }

export const PHRASES: PhraseItem[] = [
  { prompt: tr("A friend in need is a friend ___", "বিপদৰ বন্ধুৱেই প্ৰকৃত ___", "বিপদের বন্ধুই আসল ___"), options: [tr("indeed", "বন্ধু", "বন্ধু"), tr("asleep", "টোপনি", "ঘুম"), tr("a mango", "আম", "আম")], answer: 0 },
  { prompt: tr("Slow and steady wins the ___", "লেহেমীয়া আৰু স্থিৰে জিকে ___", "ধীরে আর স্থিরে জেতে ___"), options: [tr("rain", "বৰষুণ", "বৃষ্টি"), tr("race", "দৌৰ", "দৌড়"), tr("teapot", "চাহপাত্ৰ", "চায়ের পাত্র")], answer: 1 },
  { prompt: tr("The early bird catches the ___", "ৰাতিপুৱাৰ চৰাইয়ে ___ ধৰে", "ভোরের পাখি ___ ধরে"), options: [tr("train", "ৰেল", "ট্রেন"), tr("song", "গান", "গান"), tr("worm", "পোক", "পোকা")], answer: 2 },
  { prompt: tr("After rain comes ___", "বৰষুণৰ পিছত ___ আহে", "বৃষ্টির পরে ___ আসে"), options: [tr("sunshine", "ৰ'দ", "রোদ"), tr("umbrellas", "ছাতি", "ছাতা"), tr("shoes", "জোতা", "জুতো")], answer: 0 },
  { prompt: tr("Practice makes ___", "অভ্যাসে ___ কৰে", "অভ্যাসে ___ করে"), options: [tr("tea", "চাহ", "চা"), tr("perfect", "নিখুঁত", "নিখুঁত"), tr("clouds", "ডাৱৰ", "মেঘ")], answer: 1 },
];

export interface AssocItem { word: Tr; options: Tr[]; answer: number }

export const ASSOCIATIONS: AssocItem[] = [
  { word: tr("Rose", "গোলাপ", "গোলাপ"), options: [tr("Garden", "বাগিচা", "বাগান"), tr("Telephone", "টেলিফোন", "টেলিফোন"), tr("Shoe", "জোতা", "জুতো")], answer: 0 },
  { word: tr("Tea", "চাহ", "চা"), options: [tr("Rain", "বৰষুণ", "বৃষ্টি"), tr("Cup", "কাপ", "কাপ"), tr("Tiger", "বাঘ", "বাঘ")], answer: 1 },
  { word: tr("Dhol", "ঢোল", "ঢোল"), options: [tr("Book", "কিতাপ", "বই"), tr("Fish", "মাছ", "মাছ"), tr("Music", "সংগীত", "সংগীত")], answer: 2 },
  { word: tr("Rain", "বৰষুণ", "বৃষ্টি"), options: [tr("Umbrella", "ছাতি", "ছাতা"), tr("Bread", "পাউৰুটি", "রুটি"), tr("Bell", "ঘণ্টা", "ঘণ্টা")], answer: 0 },
  { word: tr("Morning", "পুৱা", "সকাল"), options: [tr("Lamp", "চাকি", "প্রদীপ"), tr("Birds", "চৰাই", "পাখি"), tr("Bed", "পাটি", "বিছানা")], answer: 1 },
];

/** Generic story-style questions used when no personalized memory fits */
export const FALLBACK_QUESTIONS: { question: Tr; options: Tr[]; answer: number; motif: string }[] = [
  { question: tr("Which of these is a flower?", "এইবোৰৰ ভিতৰত কোনটো ফুল?", "এগুলোর মধ্যে কোনটা ফুল?"), options: [tr("Lotus", "পদুম", "পদ্ম"), tr("Dhol", "ঢোল", "ঢোল"), tr("Teapot", "চাহপাত্ৰ", "চায়ের পাত্র")], answer: 0, motif: "lotus" },
  { question: tr("Which one do we drink from?", "কোনটোৰ পৰা আমি খাওঁ?", "কোনটা থেকে আমরা খাই?"), options: [tr("Jaapi", "জাপি", "জাপি"), tr("Tea cup", "চাহৰ কাপ", "চায়ের কাপ"), tr("Flute", "বাহী", "বাঁশি")], answer: 1, motif: "teacup" },
  { question: tr("Which one makes music?", "কোনটোৱে সংগীত বজায়?", "কোনটা সংগীত বাজায়?"), options: [tr("Umbrella", "ছাতি", "ছাতা"), tr("Laddu", "লাড্ডু", "লাড্ডু"), tr("Dhol", "ঢোল", "ঢোল")], answer: 2, motif: "dhol" },
];

/* ================= Personal Wallet Seed Data ================= */

export const seedWallet: PatientWallet = {
  patientId: "patient-mitali",
  name: "Mitali Das",
  age: 72,
  preferredLanguage: "as",
  homeAddress: "House No. 12, Lane 3, Panbazar, Guwahati, Assam - 781001",
  familyContacts: [
    {
      id: "fc-1",
      name: "Ananya Das",
      relationship: "Daughter",
      phone: "+91 98640 12345",
      isPrimary: true,
    },
    {
      id: "fc-2",
      name: "Rahul Das",
      relationship: "Son",
      phone: "+91 98640 67890",
      isPrimary: false,
    },
  ],
  careNotes: "Prefers morning walks. Loves gardening and listening to Bihu songs.",
  emergencyNote: "Allergic to penicillin. Takes blood pressure medication.",
  publicSafetyCard: {
    showName: true,
    showLanguage: true,
    showFamilyContact: true,
    showAddress: false,
  },
  locationSharingEnabled: false,
  createdAt: now - 30 * day,
  updatedAt: now - 2 * day,
};
