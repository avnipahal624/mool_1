import React, { useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SkipButton, usePageTitle } from "../../components/chrome";
import { recordSession, recordSkip } from "../../services/adaptationEngine";
import { save } from "../../lib/storage";
import type { ActivityResultState } from "../../lib/types";

/** Shared game shell: title, round counter, skip. */
export function GameShell({ title, round, totalRounds, onSkip, children, note }: {
  title: string;
  round?: number;
  totalRounds?: number;
  onSkip: () => void;
  children: React.ReactNode;
  note?: string;
}) {
  const { t } = useLangLocal();
  usePageTitle(title, "A gentle activity in MOOL.");
  return (
    <div className="app-shell" style={{ minHeight: "100dvh" }}>
      <header className="header">
        <h1 style={{ flex: 1, fontSize: "1.15rem" }}>{title}</h1>
        {round !== undefined && totalRounds !== undefined && (
          <span className="display" style={{ fontWeight: 800, color: "var(--green-deep)", fontSize: "1rem", marginRight: 10 }} aria-label={`${t("games.round")} ${round} ${t("games.of")} ${totalRounds}`}>
            {round}/{totalRounds}
          </span>
        )}
        <SkipButton onSkip={onSkip} />
      </header>
      <main className="page">
        {note && (
          <div className="card pop-in fade-up" style={{ background: "var(--sun-soft)", borderColor: "transparent", padding: "13px 16px", marginBottom: 14, fontWeight: 700, color: "#6f5713" }} role="status">
            🌿 {note}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

import { useLang } from "../../context/LanguageContext";
function useLangLocal() {
  return useLang();
}

/** Finish an activity: persist stats + go to the result screen. */
export function useFinish(type: string, topic?: string) {
  const navigate = useNavigate();
  const startedAt = useRef(Date.now());
  return (correct: number, total: number, extra?: Partial<ActivityResultState>) => {
    const timeMs = Date.now() - startedAt.current;
    const result: ActivityResultState = { type, topic, correct, total, timeMs, ...extra };
    recordSession(type, { correct, total, timeMs, topic });
    save("lastResult", result);
    navigate("/patient/activity/result", { state: result });
  };
}

/** Skip an activity: record it and go to a gentle result. */
export function useSkip(type: string, topic?: string) {
  const navigate = useNavigate();
  const startedAt = useRef(Date.now());
  return () => {
    recordSkip(type, topic);
    const result: ActivityResultState = { type, topic, correct: 0, total: 0, timeMs: Date.now() - startedAt.current, skipped: true };
    save("lastResult", result);
    navigate("/patient/activity/result", { state: result });
  };
}

/** Topic override when arriving from a specific memory ("This memory can inspire…"). */
export function useMemoryTopic(): { memoryId: string | null; topic: string | undefined } {
  const [params] = useSearchParams();
  const memoryId = params.get("memoryId");
  const { memories } = usePatient();
  const mem = memoryId ? memories.find((m) => m.id === memoryId) : undefined;
  return { memoryId, topic: mem && !mem.sensitive ? memoryTopic(mem).id : undefined };
}

import { usePatient } from "../../context/PatientContext";
import { memoryTopic } from "../../services/memoryService";
