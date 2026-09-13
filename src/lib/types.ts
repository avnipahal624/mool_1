export type Lang = "en" | "as" | "bn";

/** Localized string */
export interface Tr {
  en: string;
  as: string;
  bn: string;
}

export type MemoryType = "person" | "place" | "event" | "story";

export interface RecallData {
  question: Tr;
  answer: Tr;
  options: Tr[];
}

export interface Memory {
  id: string;
  type: MemoryType;
  title: Tr | { en: string; as?: string; bn?: string };
  text: Tr | { en: string; as?: string; bn?: string };
  tags: string[];
  sensitive: boolean;
  createdAt: number;
  voiceNote?: { label: string; duration: number };
  recall?: RecallData;
}

export type ReminderKind = "medicine" | "hydration" | "meal" | "walk" | "appointment";

export interface Reminder {
  id: string;
  time: string; // "08:00"
  kind: ReminderKind;
  label: string;
  doneDates: string[]; // YYYY-MM-DD keys
}

export interface DiaryEntry {
  id: string;
  date: number;
  kind: "text" | "voice";
  text?: string;
  duration?: number;
}

export interface VoiceNote {
  id: string;
  from: Tr;
  label: Tr;
  duration: number; // seconds
  date: number;
}

export interface FamilyMessage {
  id: string;
  kind: "photo" | "video" | "voice" | "text";
  from: Tr;
  preview: Tr;
  body?: Tr;
  image?: string;
  date: number;
  read: boolean;
}

export interface AlertItem {
  id: string;
  kind: "reminder" | "family" | "report" | "water" | "walk" | "love";
  text: Tr;
  time: number;
}

export interface PatientProfile {
  name: string;
  age: number;
  preferredLanguage: Lang;
  interests: string[];
}

export interface AuthState {
  role: "patient" | "caregiver" | null;
  demo: boolean;
  signedIn: boolean;
}

export interface ActivityResultState {
  type: string;
  topic?: string;
  correct: number;
  total: number;
  timeMs: number;
  skipped?: boolean;
  fallback?: boolean;
}

export type Comfort = "good" | "okay" | "not";

/* ================= Personal Wallet ================= */

export interface FamilyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  avatar?: string;
}

export interface PatientWallet {
  patientId: string;
  name: string;
  age: number;
  preferredLanguage: Lang;
  homeAddress: string;
  familyContacts: FamilyContact[];
  emergencyContact?: FamilyContact;
  careNotes?: string;
  emergencyNote?: string;
  publicSafetyCard: {
    showName: boolean;
    showLanguage: boolean;
    showFamilyContact: boolean;
    showAddress: boolean;
  };
  locationSharingEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PublicSafetyCard {
  name: string;
  preferredLanguage: Lang;
  primaryContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  helpMessage: string;
}
