import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AlertItem, DiaryEntry, FamilyMessage, Memory, PatientProfile, PatientWallet, Reminder, VoiceNote } from "../lib/types";
import { load, save, todayKey, uid } from "../lib/storage";
import { mockPatient, seedAlerts, seedFamily, seedMemories, seedRoutine, seedVoices, seedWallet } from "../data/seed";
import { apiGetPatient, apiGetMemories, apiSavePatient, apiCreateMemory, apiUpdateMemory, apiDeleteMemory } from "../lib/api";
import { useApp } from "./AppContext";

export interface LocationState {
  sharing: boolean;
  zoneAlert: boolean;
  inside: boolean;
  lastUpdated: number;
}

interface PatientCtx {
  profile: PatientProfile;
  updateProfile: (p: PatientProfile) => void;
  memories: Memory[];
  addMemory: (m: Omit<Memory, "id" | "createdAt">) => string;
  updateMemory: (m: Memory) => void;
  deleteMemory: (id: string) => void;
  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, "id" | "doneDates">) => void;
  updateReminder: (r: Reminder) => void;
  deleteReminder: (id: string) => void;
  toggleReminderDone: (id: string) => void;
  isReminderDoneToday: (r: Reminder) => boolean;
  diary: DiaryEntry[];
  addDiary: (e: Omit<DiaryEntry, "id" | "date">) => void;
  deleteDiary: (id: string) => void;
  voices: VoiceNote[];
  addVoice: (v: Omit<VoiceNote, "id" | "date">) => void;
  family: FamilyMessage[];
  markFamilyRead: (id: string) => void;
  addFamilyMessage: (m: Omit<FamilyMessage, "id" | "date" | "read">) => void;
  unreadFamily: number;
  alerts: AlertItem[];
  addAlert: (a: Omit<AlertItem, "id" | "time">) => void;
  location: LocationState;
  setLocation: (l: Partial<LocationState>) => void;
  wallet: PatientWallet;
  updateWallet: (w: PatientWallet) => void;
}

const Ctx = createContext<PatientCtx | null>(null);

function initial<T>(key: string, fallback: T): T {
  return load<T>(key, fallback);
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile>(() => initial("patient", mockPatient));
  const [memories, setMemories] = useState<Memory[]>(() => initial("memories", seedMemories));
  const [reminders, setReminders] = useState<Reminder[]>(() => initial("routine", seedRoutine));
  const [diary, setDiary] = useState<DiaryEntry[]>(() => initial("diary", []));
  const [voices, setVoices] = useState<VoiceNote[]>(() => initial("voices", seedVoices));
  const [family, setFamily] = useState<FamilyMessage[]>(() => initial("family", seedFamily));
  const [alerts, setAlerts] = useState<AlertItem[]>(() => initial("alerts", seedAlerts));
  const [location, setLocationState] = useState<LocationState>(() =>
    initial("location", { sharing: true, zoneAlert: true, inside: true, lastUpdated: Date.now() - 10 * 60000 })
  );
  const [wallet, setWallet] = useState<PatientWallet>(() => initial("wallet", seedWallet));

  const { showToast, setSync } = useApp();

  // Hydrate from the real backend on mount. localStorage values above are
  // an instant-loading fallback if the backend isn't reachable (offline-first).
  useEffect(() => {
    setSync("syncing");
    Promise.all([apiGetPatient(), apiGetMemories()])
      .then(([serverProfile, serverMemories]) => {
        setProfile(serverProfile);
        setMemories(serverMemories);
        setSync("synced");
        setTimeout(() => setSync("online"), 1500);
      })
      .catch(() => {
        setSync("offline");
        showToast("Couldn't reach the server — showing saved data", "warn");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => save("patient", profile), [profile]);
  useEffect(() => save("memories", memories), [memories]);
  useEffect(() => save("routine", reminders), [reminders]);
  useEffect(() => save("diary", diary), [diary]);
  useEffect(() => save("voices", voices), [voices]);
  useEffect(() => save("family", family), [family]);
  useEffect(() => save("alerts", alerts), [alerts]);
  useEffect(() => save("location", location), [location]);
  useEffect(() => save("wallet", wallet), [wallet]);

  const updateProfile = useCallback((p: PatientProfile) => {
    setProfile(p);
    apiSavePatient(p).catch(() => showToast("Profile saved locally, but couldn't sync", "warn"));
  }, [showToast]);

  const addMemory = useCallback((m: Omit<Memory, "id" | "createdAt">) => {
    const id = uid();
    const newMemory: Memory = { ...m, id, createdAt: Date.now() };
    setMemories((prev) => [newMemory, ...prev]);
    apiCreateMemory(newMemory).catch(() => showToast("Memory saved locally, but couldn't sync", "warn"));
    return id;
  }, [showToast]);

  const updateMemory = useCallback((m: Memory) => {
    setMemories((prev) => prev.map((x) => (x.id === m.id ? m : x)));
    apiUpdateMemory(m).catch(() => showToast("Update saved locally, but couldn't sync", "warn"));
  }, [showToast]);

  const deleteMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((x) => x.id !== id));
    apiDeleteMemory(id).catch(() => showToast("Deleted locally, but couldn't sync", "warn"));
  }, [showToast]);

  const addReminder = useCallback((r: Omit<Reminder, "id" | "doneDates">) => {
    setReminders((prev) => [...prev, { ...r, id: uid(), doneDates: [] }].sort((a, b) => a.time.localeCompare(b.time)));
  }, []);

  const updateReminder = useCallback((r: Reminder) => {
    setReminders((prev) => prev.map((x) => (x.id === r.id ? r : x)).sort((a, b) => a.time.localeCompare(b.time)));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const toggleReminderDone = useCallback((id: string) => {
    const today = todayKey();
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const done = r.doneDates.includes(today);
        return { ...r, doneDates: done ? r.doneDates.filter((d) => d !== today) : [...r.doneDates, today] };
      })
    );
  }, []);

  const isReminderDoneToday = useCallback((r: Reminder) => r.doneDates.includes(todayKey()), []);

  const addDiary = useCallback((e: Omit<DiaryEntry, "id" | "date">) => {
    setDiary((prev) => [{ ...e, id: uid(), date: Date.now() }, ...prev]);
  }, []);

  const deleteDiary = useCallback((id: string) => setDiary((prev) => prev.filter((x) => x.id !== id)), []);

  const addVoice = useCallback((v: Omit<VoiceNote, "id" | "date">) => {
    setVoices((prev) => [{ ...v, id: uid(), date: Date.now() }, ...prev]);
  }, []);

  const markFamilyRead = useCallback((id: string) => {
    setFamily((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  }, []);

  const addFamilyMessage = useCallback((m: Omit<FamilyMessage, "id" | "date" | "read">) => {
    setFamily((prev) => [{ ...m, id: uid(), date: Date.now(), read: false }, ...prev]);
  }, []);

  const addAlert = useCallback((a: Omit<AlertItem, "id" | "time">) => {
    setAlerts((prev) => [{ ...a, id: uid(), time: Date.now() }, ...prev]);
  }, []);

  const setLocation = useCallback((l: Partial<LocationState>) => {
    setLocationState((prev) => ({ ...prev, ...l }));
  }, []);

  const updateWallet = useCallback((w: PatientWallet) => {
    setWallet({ ...w, updatedAt: Date.now() });
  }, []);

  const unreadFamily = family.filter((m) => !m.read).length;

  const value = useMemo(
    () => ({
      profile, updateProfile, memories, addMemory, updateMemory, deleteMemory,
      reminders, addReminder, updateReminder, deleteReminder, toggleReminderDone, isReminderDoneToday,
      diary, addDiary, deleteDiary, voices, addVoice, family, markFamilyRead, addFamilyMessage,
      unreadFamily, alerts, addAlert, location, setLocation, wallet, updateWallet,
    }),
    [profile, updateProfile, memories, addMemory, updateMemory, deleteMemory, reminders, addReminder,
      updateReminder, deleteReminder, toggleReminderDone, isReminderDoneToday, diary, addDiary, deleteDiary,
      voices, addVoice, family, markFamilyRead, addFamilyMessage, unreadFamily, alerts, addAlert, location, setLocation, wallet, updateWallet]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePatient(): PatientCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePatient outside PatientProvider");
  return v;
}
