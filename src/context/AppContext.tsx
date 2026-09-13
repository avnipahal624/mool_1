import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AuthState } from "../lib/types";
import { load, save, uid } from "../lib/storage";

export type ToastKind = "success" | "warn" | "error" | "info";
export interface Toast { id: string; msg: string; kind: ToastKind }

export type SyncState = "online" | "offline" | "syncing" | "synced";

interface Settings {
  textSize: "small" | "normal" | "large";
  voiceOn: boolean;
}

interface AppCtx {
  auth: AuthState;
  signIn: (role: "patient" | "caregiver", demo: boolean) => void;
  signOut: () => void;
  online: boolean;
  sync: SyncState;
  setSync: (s: SyncState) => void;
  toasts: Toast[];
  showToast: (msg: string, kind?: ToastKind) => void;
  dismissToast: (id: string) => void;
  settings: Settings;
  setTextSize: (s: Settings["textSize"]) => void;
  setVoiceOn: (v: boolean) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() =>
    load<AuthState>("auth", { role: null, demo: false, signedIn: false })
  );
  const [online, setOnline] = useState<boolean>(() => navigator.onLine);
  const [sync, setSync] = useState<SyncState>(() => (navigator.onLine ? "online" : "offline"));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>("settings", { textSize: "normal", voiceOn: true })
  );
  const syncTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string, kind: ToastKind = "info") => {
    const id = uid();
    setToasts((prev) => [...prev.slice(-2), { id, msg, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const goOffline = () => { setOnline(false); setSync("offline"); };
    const goOnline = () => {
      setOnline(true);
      setSync("syncing");
      if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
      syncTimer.current = window.setTimeout(() => {
        setSync("synced");
        window.setTimeout(() => setSync("online"), 2600);
      }, 1500);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("ts-small", "ts-normal", "ts-large");
    document.documentElement.classList.add(`ts-${settings.textSize}`);
  }, [settings.textSize]);

  const signIn = useCallback((role: "patient" | "caregiver", demo: boolean) => {
    const next: AuthState = { role, demo, signedIn: true };
    setAuth(next);
    save("auth", next);
  }, []);

  const signOut = useCallback(() => {
    const next: AuthState = { role: null, demo: false, signedIn: false };
    setAuth(next);
    save("auth", next);
  }, []);

  const setTextSize = useCallback((s: Settings["textSize"]) => {
    setSettings((prev) => { const next = { ...prev, textSize: s }; save("settings", next); return next; });
  }, []);

  const setVoiceOn = useCallback((v: boolean) => {
    setSettings((prev) => { const next = { ...prev, voiceOn: v }; save("settings", next); return next; });
  }, []);

  const value = useMemo(
    () => ({ auth, signIn, signOut, online, sync, setSync, toasts, showToast, dismissToast, settings, setTextSize, setVoiceOn }),
    [auth, signIn, signOut, online, sync, setSync, toasts, showToast, dismissToast, settings, setTextSize, setVoiceOn]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}
