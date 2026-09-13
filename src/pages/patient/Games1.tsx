import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Play } from "lucide-react";
import { MotifIcon, motifLabel, motifsByCat, MOTIF_IDS } from "../../data/motifs";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { generateActivity, type AttentionRound, type StoryRound } from "../../services/activityGenerator";
import { settingsFor } from "../../services/adaptationEngine";
import { shuffle, topicById, pick } from "../../services/memoryService";
import { chime } from "../../services/soundService";
import { GameShell, useFinish, useSkip, useMemoryTopic } from "./gameUtils";
import { Button, Card } from "../../components/core";
import type { Memory } from "../../lib/types";

/* ================= Memory Match ================= */

interface FlipCard { uid: number; icon: string }

export function MemoryMatchGame() {
  const { t, lang } = useLang();
  const { profile, memories } = usePatient();
  const { topic } = useMemoryTopic();
  const finish = useFinish("memory_match", topic);
  const skip = useSkip("memory_match", topic);

  const pairs = settingsFor("memory_match").pairs;

  const deck = useMemo<FlipCard[]>(() => {
    const gen = generateActivity("memory_match", profile, memories);
    let pool = gen.kind === "memory_match" ? gen.iconPool : MOTIF_IDS;
    if (topic) {
      const cat = topicById(topic).category;
      pool = [...motifsByCat(cat), ...shuffle(MOTIF_IDS.filter((id) => motifsByCat(cat).indexOf(id) < 0))];
    }
    const icons = pool.slice(0, pairs);
    return shuffle([...icons, ...icons].map((icon, i) => ({ uid: i, icon })));
  }, [profile, memories, pairs, topic]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [goodMoves, setGoodMoves] = useState(0);
  const lock = useRef(false);

  const click = (uid: number) => {
    if (lock.current || flipped.includes(uid) || matched.has(uid)) return;
    chime("tap");
    const next = [...flipped, uid];
    setFlipped(next);
    if (next.length === 2) {
      lock.current = true;
      setMoves((m) => m + 1);
      const [a, b] = next;
      const isMatch = deck[a].icon === deck[b].icon;
      window.setTimeout(() => {
        if (isMatch) {
          chime("match");
          setMatched((prev) => {
            const s = new Set(prev);
            s.add(a); s.add(b);
            return s;
          });
          setGoodMoves((g) => g + 1);
        } else {
          chime("wrong");
        }
        setFlipped([]);
        lock.current = false;
      }, isMatch ? 500 : 850);
    }
  };

  useEffect(() => {
    if (matched.size === deck.length && deck.length > 0) {
      const timer = window.setTimeout(() => finish(goodMoves, moves || pairs, {}), 800);
      return () => window.clearTimeout(timer);
    }
  }, [matched, deck.length, finish, goodMoves, moves, pairs]);

  const gridCols = pairs <= 3 ? 3 : pairs <= 4 ? 4 : 4;

  return (
    <GameShell title={t("activities.memoryMatch")} onSkip={skip}>
      <p className="muted fade-up" style={{ marginTop: 0, fontWeight: 700 }}>🌿 {t("games.findPair")}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 10 }} className="pop-in">
        {deck.map((c) => {
          const up = flipped.includes(c.uid) || matched.has(c.uid);
          return (
            <button
              key={c.uid}
              type="button"
              className={`flip ${up ? "flipped" : ""} ${matched.has(c.uid) ? "matched" : ""}`}
              style={{ border: "none", background: "none", padding: 0, aspectRatio: "1", cursor: "pointer" }}
              onClick={() => click(c.uid)}
              aria-label={up ? motifLabel(c.icon, lang) : t("games.hiddenCard")}
              disabled={matched.has(c.uid)}
            >
              <span className="flip-inner" style={{ display: "block", width: "100%", height: "100%" }}>
                <span className="flip-face flip-front">
                  <svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0C16 6 16 14 10 20 4 14 4 6 10 0Z" fill="#f6f1e6" opacity="0.85" /></svg>
                </span>
                <span className="flip-face flip-back">
                  <MotifIcon id={c.icon} size={54} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p style={{ textAlign: "center", fontWeight: 700, color: "var(--ink-soft)", marginTop: 18 }}>
        {Math.round(matched.size / 2)} / {pairs} {t("games.pairsFound")} · {moves} {t("games.moves")}
      </p>
    </GameShell>
  );
}

/* ================= Pattern Memory ================= */

export function PatternGame() {
  const { t, lang } = useLang();
  const { profile, memories } = usePatient();
  const { topic } = useMemoryTopic();
  const finish = useFinish("pattern", topic);
  const skip = useSkip("pattern", topic);

  const seqLen = settingsFor("pattern").seqLen;

  const data = useMemo(() => {
    const gen = generateActivity("pattern", profile, memories);
    const options = gen.kind === "pattern" ? gen.options : MOTIF_IDS.slice(0, 5);
    const seq: string[] = [];
    for (let i = 0; i < seqLen; i++) {
      let next = pick(options);
      if (seq[seq.length - 1] === next) next = pick(options);
      seq.push(next);
    }
    return { options, seq };
  }, [profile, memories, seqLen]);

  const [phase, setPhase] = useState<"show" | "input" | "done">("show");
  const [showIdx, setShowIdx] = useState(-1);
  const [inputIdx, setInputIdx] = useState(0);
  const [errors, setErrors] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const show = useRef<number[]>([]);

  const play = () => {
    setPhase("show");
    setInputIdx(0);
    setShowIdx(-1);
    show.current.forEach((h) => window.clearTimeout(h));
    show.current = [];
    data.seq.forEach((_, i) => {
      const on = window.setTimeout(() => { setShowIdx(i); chime("tap"); }, 500 + i * 850);
      const off = window.setTimeout(() => setShowIdx(-1), 500 + i * 850 + 620);
      show.current.push(on, off);
    });
    const end = window.setTimeout(() => setPhase("input"), 500 + data.seq.length * 850 + 200);
    show.current.push(end);
  };

  useEffect(() => { play(); return () => show.current.forEach((h) => window.clearTimeout(h)); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (icon: string) => {
    if (phase !== "input") return;
    if (icon === data.seq[inputIdx]) {
      chime("tap");
      const next = inputIdx + 1;
      setInputIdx(next);
      if (next === data.seq.length) {
        chime("success");
        setPhase("done");
        window.setTimeout(() => finish(Math.max(1, seqLen - errors), seqLen, {}), 700);
      }
    } else {
      chime("wrong");
      setErrors((e) => e + 1);
      setShakeId(icon);
      window.setTimeout(() => setShakeId(null), 350);
    }
  };

  return (
    <GameShell title={t("activities.patternMemory")} onSkip={skip}>
      <div aria-live="polite" style={{ textAlign: "center", minHeight: 30, fontWeight: 700, color: "var(--ink-soft)" }}>
        {phase === "show" ? `👀 ${t("games.rememberThis")}` : phase === "input" ? `👆 ${t("games.tapSequence")}` : "🌱"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "14px 0 22px", minHeight: 46 }} aria-label="sequence progress">
        {data.seq.map((s, i) => (
          <span key={i} style={{ width: 40, height: 40, borderRadius: 12, background: phase === "show" && showIdx === i ? "var(--sun-soft)" : "var(--surface-2)", border: `2px solid ${phase === "show" && showIdx === i ? "var(--sun)" : "var(--line)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
            {phase === "show" && showIdx === i ? <MotifIcon id={s} size={30} /> : i < inputIdx && phase !== "show" ? <MotifIcon id={s} size={30} /> : <span style={{ color: "var(--ink-mute)", fontWeight: 800 }}>{i + 1}</span>}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, data.options.length)}, 1fr)`, gap: 12, maxWidth: 330, margin: "0 auto" }}>
        {data.options.map((icon) => (
          <button key={icon} type="button" className={`card card-press ${shakeId === icon ? "shake" : ""}`} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, opacity: phase === "input" ? 1 : 0.55 }} onClick={() => tap(icon)} disabled={phase !== "input"} aria-label={motifLabel(icon, lang)}>
            <MotifIcon id={icon} size={56} />
          </button>
        ))}
      </div>
      {phase === "input" && errors > 0 && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Button variant="soft" onClick={play} icon={<Eye size={18} aria-hidden="true" />}>{t("games.watchAgain")}</Button>
        </div>
      )}
    </GameShell>
  );
}

/* ================= Story Recall ================= */

export function StoryGame() {
  const { t, tx, lang } = useLang();
  const { profile, memories, voices } = usePatient();
  const { memoryId } = useMemoryTopic();
  const finish = useFinish("story");
  const skip = useSkip("story");

  const gen = useMemo(() => {
    const g = generateActivity("story", profile, memories, { voices: voices.map((v) => ({ from: v.from, label: v.label })) });
    if (g.kind !== "story") return { rounds: [] as StoryRound[], personalized: true };
    if (memoryId) {
      const mem = memories.find((m) => m.id === memoryId && !m.sensitive && m.recall);
      if (mem) {
        const rec = mem.recall!;
        const head: StoryRound = {
          memory: mem,
          question: rec.question,
          options: rec.options,
          answerIdx: rec.options.findIndex((o) => o.en === rec.answer.en),
        };
        return { rounds: [head, ...g.rounds.filter((r) => r.memory?.id !== memoryId)].slice(0, 3), personalized: true };
      }
    }
    return g;
  }, [profile, memories, voices, memoryId]);

  const [round, setRound] = useState(0);
  const [wrongPicks, setWrongPicks] = useState<Set<number>>(new Set());
  const [solvedFirstTry, setSolvedFirstTry] = useState(0);
  const [revealed, setRevealed] = useState<null | number>(null);
  const [peek, setPeek] = useState(false);

  const r: StoryRound | undefined = gen.rounds[round];

  const pickOption = (i: number) => {
    if (!r || revealed !== null) return;
    if (i === r.answerIdx) {
      chime("success");
      setRevealed(i);
      if (wrongPicks.size === 0) setSolvedFirstTry((s) => s + 1);
      window.setTimeout(() => {
        if (round + 1 >= gen.rounds.length) {
          finish(solvedFirstTryRef.current, gen.rounds.length, { fallback: !gen.personalized });
        } else {
          setRound((x) => x + 1);
          setWrongPicks(new Set());
          setRevealed(null);
          setPeek(false);
        }
      }, 1000);
    } else {
      chime("wrong");
      setWrongPicks((prev) => new Set(prev).add(i));
    }
  };

  const solvedFirstTryRef = useRef(0);
  useEffect(() => { solvedFirstTryRef.current = solvedFirstTry; }, [solvedFirstTry]);

  if (!r) {
    return (
      <GameShell title={t("activities.storyRecall")} onSkip={skip}>
        <Card>🌿 {t("errors.fallback")}</Card>
      </GameShell>
    );
  }

  return (
    <GameShell title={t("activities.storyRecall")} round={round + 1} totalRounds={gen.rounds.length} onSkip={skip} note={!gen.personalized ? t("errors.fallback") : undefined}>
      {r.isVoice && !r.memory ? (
        <Card className="fade-up leaf" style={{ background: "var(--lav-soft)", borderColor: "transparent", display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
          <button type="button" className="btn btn-icon btn-primary" style={{ borderRadius: "50%", flexShrink: 0 }} onClick={() => chime("gentle")} aria-label={t("common.play")}>
            <Play size={20} aria-hidden="true" />
          </button>
          <div>
            <div style={{ fontWeight: 800, fontFamily: "var(--font-display)" }}>🎙 {r.voiceLabel ? tx(r.voiceLabel) : ""}</div>
            <div className="muted">{t("games.listenMemory")}</div>
          </div>
        </Card>
      ) : r.memory ? (
        <Card className="fade-up leaf" style={{ background: "var(--peach-soft)", borderColor: "transparent", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#7a4a1c" }}>{tx(r.memory.title)}</div>
          <p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>{peek ? tx(r.memory.text) : tx(r.memory.text).slice(0, 130) + "…"}</p>
          {!peek && <button type="button" className="linkish" style={{ marginTop: 8 }} onClick={() => setPeek(true)}>{t("games.showMe")}</button>}
        </Card>
      ) : r.motif ? (
        <Card className="fade-up leaf" style={{ display: "flex", justifyContent: "center", marginBottom: 14, padding: 12 }}>
          <MotifIcon id={r.motif} size={84} label={motifLabel(r.motif, lang)} />
        </Card>
      ) : null}

      <h2 className="display" style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 14px" }}>{t("games.storyQ")} {tx(r.question)}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {r.options.map((opt, i) => {
          const isWrong = wrongPicks.has(i);
          const isRight = revealed === i;
          return (
            <button
              key={i}
              type="button"
              className={`btn btn-large ${isRight ? "btn-primary" : isWrong ? "shake" : ""}`}
              style={{ background: isRight ? "var(--green)" : isWrong ? "var(--rose-soft)" : "var(--surface)", color: isRight ? "#fdfbf3" : isWrong ? "var(--rose-ink)" : "var(--ink)", boxShadow: "var(--shadow-sm)" }}
              onClick={() => pickOption(i)}
              disabled={isWrong || revealed !== null}
            >
              {tx(opt)} {isRight && "✓"}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}

/* ================= Attention ================= */

export function AttentionGame() {
  const { t, lang } = useLang();
  const { profile, memories } = usePatient();
  const finish = useFinish("attention");
  const skip = useSkip("attention");
  const showMs = settingsFor("attention").showMs;

  const rounds = useMemo(() => {
    const g = generateActivity("attention", profile, memories);
    return g.kind === "attention" ? g.rounds : [];
  }, [profile, memories]);

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"memorize" | "answer">("memorize");
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongTap, setWrongTap] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  const r: AttentionRound | undefined = rounds[round];

  useEffect(() => {
    setPhase("memorize");
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase("answer"), showMs);
    return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
  }, [round, showMs]);

  if (!r) {
    return (
      <GameShell title={t("activities.attention")} onSkip={skip}>
        <Card>🌿 {t("errors.fallback")}</Card>
      </GameShell>
    );
  }

  const gridN = Math.round(Math.sqrt(r.icons.length));
  const oddIcon = r.icons.find((x) => x !== r.icons[0]) ?? pick(MOTIF_IDS);

  const displayIcon = (i: number): string => {
    if (r.mode === "changed" && phase === "answer" && i === r.changedIndex) {
      return r.icons[i] === "lotus" ? "marigold" : "lotus";
    }
    return r.icons[i];
  };

  const tap = (i: number) => {
    if (phase !== "answer") return;
    const target = r.mode === "changed" ? r.changedIndex : r.oddIndex;
    if (i === target) {
      chime("success");
      const nc = correctCount + 1;
      setCorrectCount(nc);
      window.setTimeout(() => {
        if (round + 1 >= rounds.length) finish(nc, rounds.length, {});
        else setRound((x) => x + 1);
      }, 650);
    } else {
      chime("wrong");
      setWrongTap(i);
      window.setTimeout(() => setWrongTap(null), 350);
    }
  };

  void oddIcon;

  return (
    <GameShell
      title={t("activities.attention")}
      round={round + 1}
      totalRounds={rounds.length}
      onSkip={skip}
    >
      <div aria-live="polite" style={{ textAlign: "center", fontWeight: 700, color: "var(--ink-soft)", minHeight: 28, margin: "2px 0 14px" }}>
        {phase === "memorize" ? `👀 ${t("games.rememberThis")}…` : `🔍 ${r.mode === "changed" ? t("games.whatChanged") : t("games.spotTheOdd")}`}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridN}, 1fr)`, gap: 8, maxWidth: 340, margin: "0 auto", opacity: phase === "memorize" ? 1 : 1 }} className="pop-in">
        {r.icons.map((_, i) => (
          <button
            key={`${round}-${i}`}
            type="button"
            className={`card ${wrongTap === i ? "shake" : ""}`}
            style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, cursor: phase === "answer" ? "pointer" : "default", transition: "all 0.2s ease" }}
            onClick={() => tap(i)}
            disabled={phase !== "answer"}
            aria-label={`${t("games.cell")} ${i + 1}: ${motifLabel(displayIcon(i), lang)}`}
          >
            <MotifIcon id={displayIcon(i)} size={gridN > 3 ? 40 : 52} />
          </button>
        ))}
      </div>
      {phase === "memorize" && (
        <div style={{ maxWidth: 340, margin: "18px auto 0", height: 8, borderRadius: 99, background: "var(--line-soft)", overflow: "hidden" }} aria-hidden="true">
          <div style={{ height: "100%", background: "var(--sage)", animation: `growX ${showMs}ms linear both`, transformOrigin: "left" }} />
        </div>
      )}
      <style>{`@keyframes growX { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </GameShell>
  );
}

export type { Memory };
