import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home as HomeIcon, Music2, Play, Sparkles, Volume2 } from "lucide-react";
import { MotifIcon, motifLabel } from "../../data/motifs";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { useApp } from "../../context/AppContext";
import { generateActivity, type ColourRound, type LanguageRound, type MathsRound, type MusicRound } from "../../services/activityGenerator";
import { activityLabelKey, getDifficulty, recordComfort } from "../../services/adaptationEngine";
import { chime, playMelody, stopMelody } from "../../services/soundService";
import { load } from "../../lib/storage";
import type { ActivityResultState, Comfort } from "../../lib/types";
import { Button, Card, FlowerMeter } from "../../components/core";
import { GameShell, useFinish, useSkip } from "./gameUtils";

function FeedbackLine({ state }: { state: "idle" | "good" | "retry" }) {
  const { t } = useLang();
  return (
    <div aria-live="polite" style={{ textAlign: "center", fontWeight: 800, fontFamily: "var(--font-display)", minHeight: 30, marginTop: 14, fontSize: "1.08rem" }}>
      {state === "good" && <span className="pop-in" style={{ display: "inline-block", color: "var(--green-deep)" }}>{t("games.wellDoneMini")}</span>}
      {state === "retry" && <span className="pop-in" style={{ display: "inline-block", color: "#6f5713" }}>{t("games.gentleAgain")}</span>}
    </div>
  );
}

/* ================= Language ================= */

export function LanguageGame() {
  const { t, tx, lang } = useLang();
  const { profile, memories } = usePatient();
  const finish = useFinish("language");
  const skip = useSkip("language");

  const rounds = useMemo(() => {
    const g = generateActivity("language", profile, memories);
    return g.kind === "language" ? g.rounds : [];
  }, [profile, memories]);

  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [firstTry, setFirstTry] = useState(0);
  const [fb, setFb] = useState<"idle" | "good" | "retry">("idle");

  const r: LanguageRound | undefined = rounds[round];

  const pickOpt = (i: number) => {
    if (!r || fb === "good") return;
    if (i === r.answerIdx) {
      chime("success");
      setFb("good");
      const solved = wrong.size === 0 ? firstTry + 1 : firstTry;
      setFirstTry(solved);
      window.setTimeout(() => {
        if (round + 1 >= rounds.length) finish(solved, rounds.length, {});
        else { setRound((x) => x + 1); setWrong(new Set()); setFb("idle"); }
      }, 900);
    } else {
      chime("wrong");
      setFb("retry");
      setWrong((p) => new Set(p).add(i));
    }
  };

  if (!r) {
    return <GameShell title={t("activities.language")} onSkip={skip}><Card>🌿 {t("errors.fallback")}</Card></GameShell>;
  }

  return (
    <GameShell title={t("activities.language")} round={round + 1} totalRounds={rounds.length} onSkip={skip}>
      <p className="muted" style={{ fontWeight: 700, marginTop: 0 }}>
        {r.mode === "phrase" ? `✍️ ${t("games.completePhrase")}` : r.mode === "assoc" ? `🔗 ${t("games.wordAssoc")}` : `🖼 ${t("games.pictureName")}`}
      </p>
      {r.mode === "picture" && r.motif && (
        <Card className="fade-up" style={{ display: "flex", justifyContent: "center", marginBottom: 14, padding: 14 }}>
          <MotifIcon id={r.motif} size={92} label={motifLabel(r.motif, lang)} />
        </Card>
      )}
      <h2 className="display" style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.4 }}>
        {r.mode === "assoc" ? `${tx(r.prompt)} → ?` : tx(r.prompt)}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {r.options.map((opt, i) => (
          <button key={i} type="button" className="btn btn-large" disabled={wrong.has(i) || fb === "good"}
            style={{ background: wrong.has(i) ? "var(--rose-soft)" : "var(--surface)", color: wrong.has(i) ? "var(--rose-ink)" : "var(--ink)", boxShadow: "var(--shadow-sm)", opacity: wrong.has(i) ? 0.7 : 1 }}
            onClick={() => pickOpt(i)}>
            {tx(opt)}
          </button>
        ))}
      </div>
      <FeedbackLine state={fb} />
    </GameShell>
  );
}

/* ================= Music guess ================= */

export function MusicGame() {
  const { t, tx } = useLang();
  const { profile, memories } = usePatient();
  const finish = useFinish("music");
  const skip = useSkip("music");

  const rounds = useMemo(() => {
    const g = generateActivity("music", profile, memories);
    return g.kind === "music" ? g.rounds : [];
  }, [profile, memories]);

  const [round, setRound] = useState(0);
  const [stage, setStage] = useState<"title" | "where">("title");
  const [playing, setPlaying] = useState(false);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState<"idle" | "good" | "retry">("idle");

  const r: MusicRound | undefined = rounds[round];

  useEffect(() => () => stopMelody(), []);

  const play = () => {
    if (!r) return;
    setPlaying(true);
    const ok = playMelody(r.song.notes, 0.38, () => setPlaying(false));
    if (!ok) setPlaying(false);
  };

  const pickTitle = (i: number) => {
    if (!r || fb === "good") return;
    if (i === r.answerIdx) {
      chime("success");
      setFb("good");
      if (wrong.size === 0) setScore((s) => s + 1);
      window.setTimeout(() => { setStage("where"); setFb("idle"); setWrong(new Set()); }, 900);
    } else {
      chime("wrong");
      setFb("retry");
      setWrong((p) => new Set(p).add(i));
    }
  };

  const pickWhere = () => {
    chime("gentle");
    setScore((s) => s + 1); // reminiscence — every answer is welcome
    window.setTimeout(() => {
      if (round + 1 >= rounds.length) finish(Math.min(score + 1, rounds.length * 2), rounds.length * 2, {});
      else { setRound((x) => x + 1); setStage("title"); setWrong(new Set()); }
    }, 800);
  };

  if (!r) {
    return <GameShell title={t("activities.musicAct")} onSkip={skip}><Card>🌿 {t("errors.fallback")}</Card></GameShell>;
  }

  return (
    <GameShell title={t("activities.musicAct")} round={round + 1} totalRounds={rounds.length} onSkip={skip}>
      {stage === "title" ? (
        <>
          <p className="muted" style={{ fontWeight: 700, marginTop: 0 }}>🎶 {t("games.guessSong")}</p>
          <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 18px" }}>
            <button type="button" className="mic-big" onClick={play} aria-label={t("games.playTune")} style={{ width: 108, height: 108, animation: playing ? "pulseRing 1.2s ease-out infinite" : undefined, background: playing ? "var(--green-deep)" : "var(--green)" }}>
              {playing ? <Volume2 size={44} aria-hidden="true" /> : <Play size={44} aria-hidden="true" />}
            </button>
          </div>
          <p style={{ textAlign: "center", fontWeight: 700, color: "var(--ink-soft)" }}>{t("games.playTune")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {r.titleOptions.map((opt, i) => (
              <button key={i} type="button" className="btn btn-large" disabled={wrong.has(i) || fb === "good"}
                style={{ background: wrong.has(i) ? "var(--rose-soft)" : "var(--surface)", color: wrong.has(i) ? "var(--rose-ink)" : "var(--ink)", boxShadow: "var(--shadow-sm)" }}
                onClick={() => pickTitle(i)}>
                {tx(opt)}
              </button>
            ))}
          </div>
          <FeedbackLine state={fb} />
        </>
      ) : (
        <>
          <p className="muted" style={{ fontWeight: 700, marginTop: 0 }}>💭 {r.song.hint ? tx(r.song.hint) : t("games.whereHear")}</p>
          <h2 className="display" style={{ fontSize: "1.35rem", fontWeight: 800 }}>{t("games.whereHear")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            {r.whereOptions.map((opt, i) => (
              <button key={i} type="button" className="card card-press leaf" style={{ minHeight: 86, fontWeight: 700, fontFamily: "var(--font-display)", textAlign: "center", background: ["var(--peach-soft)", "var(--lav-soft)", "var(--sun-soft)", "var(--water-soft)"][i % 4], borderColor: "transparent" }} onClick={pickWhere}>
                {tx(opt)}
              </button>
            ))}
          </div>
        </>
      )}
    </GameShell>
  );
}

/* ================= Colour Match ================= */

export function ColourGame() {
  const { t, tx } = useLang();
  const { profile, memories } = usePatient();
  const finish = useFinish("colour");
  const skip = useSkip("colour");

  const rounds = useMemo(() => {
    const g = generateActivity("colour", profile, memories);
    return g.kind === "colour" ? g.rounds : [];
  }, [profile, memories]);

  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [fb, setFb] = useState<"idle" | "good" | "retry">("idle");
  const [wrong, setWrong] = useState<Set<number>>(new Set());

  const r: ColourRound | undefined = rounds[round];

  const pickOpt = (i: number) => {
    if (!r || fb === "good") return;
    if (i === r.answerIdx) {
      chime("success");
      setFb("good");
      const nc = wrong.size === 0 ? correct + 1 : correct;
      setCorrect(nc);
      window.setTimeout(() => {
        if (round + 1 >= rounds.length) finish(nc, rounds.length, {});
        else { setRound((x) => x + 1); setFb("idle"); setWrong(new Set()); }
      }, 900);
    } else {
      chime("wrong");
      setFb("retry");
      setWrong((p) => new Set(p).add(i));
    }
  };

  if (!r) {
    return <GameShell title={t("activities.colourMatch")} onSkip={skip}><Card>🌿 {t("errors.fallback")}</Card></GameShell>;
  }

  return (
    <GameShell title={t("activities.colourMatch")} round={round + 1} totalRounds={rounds.length} onSkip={skip}>
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 14px" }}>
        <span className="pop-in" key={round} style={{ width: 120, height: 120, borderRadius: 30, background: r.hex, boxShadow: "var(--shadow), inset 0 -8px 0 rgba(0,0,0,0.08)", border: "4px solid var(--surface)" }} role="img" aria-label="colour swatch" />
      </div>
      <h2 className="display" style={{ fontSize: "1.3rem", fontWeight: 800, textAlign: "center", margin: "0 0 16px" }}>{t("games.whichWord")}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {r.options.map((opt, i) => (
          <button key={i} type="button" className="btn btn-large" disabled={wrong.has(i) || fb === "good"}
            style={{ background: wrong.has(i) ? "var(--rose-soft)" : "var(--surface)", color: wrong.has(i) ? "var(--rose-ink)" : "var(--ink)", boxShadow: "var(--shadow-sm)", fontSize: "1.25rem" }}
            onClick={() => pickOpt(i)}>
            {tx(opt.name)}
          </button>
        ))}
      </div>
      <FeedbackLine state={fb} />
    </GameShell>
  );
}

/* ================= Everyday Maths ================= */

export function MathsGame() {
  const { t, tx } = useLang();
  const { profile, memories } = usePatient();
  const finish = useFinish("maths");
  const skip = useSkip("maths");

  const rounds = useMemo(() => {
    const g = generateActivity("maths", profile, memories);
    return g.kind === "maths" ? g.rounds : [];
  }, [profile, memories]);

  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [fb, setFb] = useState<"idle" | "good" | "retry">("idle");
  const [wrong, setWrong] = useState<Set<number>>(new Set());

  const r: MathsRound | undefined = rounds[round];

  const pickOpt = (i: number) => {
    if (!r || fb === "good") return;
    if (i === r.answerIdx) {
      chime("success");
      setFb("good");
      const nc = wrong.size === 0 ? correct + 1 : correct;
      setCorrect(nc);
      window.setTimeout(() => {
        if (round + 1 >= rounds.length) finish(nc, rounds.length, {});
        else { setRound((x) => x + 1); setFb("idle"); setWrong(new Set()); }
      }, 900);
    } else {
      chime("wrong");
      setFb("retry");
      setWrong((p) => new Set(p).add(i));
    }
  };

  if (!r) {
    return <GameShell title={t("activities.maths")} onSkip={skip}><Card>🌿 {t("errors.fallback")}</Card></GameShell>;
  }

  return (
    <GameShell title={t("activities.maths")} round={round + 1} totalRounds={rounds.length} onSkip={skip}>
      <Card className="fade-up leaf" style={{ background: "var(--lav-soft)", borderColor: "transparent", textAlign: "center", marginBottom: 18 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.5, color: "#4a3b73" }}>{tx(r.prompt)}</p>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {r.options.map((opt, i) => (
          <button key={i} type="button" className="btn btn-large" disabled={wrong.has(i) || fb === "good"}
            style={{ background: wrong.has(i) ? "var(--rose-soft)" : "var(--surface)", color: wrong.has(i) ? "var(--rose-ink)" : "var(--ink)", boxShadow: "var(--shadow-sm)", fontSize: "1.4rem", fontFamily: "var(--font-display)" }}
            onClick={() => pickOpt(i)}>
            ₹{opt}
          </button>
        ))}
      </div>
      <FeedbackLine state={fb} />
    </GameShell>
  );
}

/* ================= Result ================= */

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();
  const { showToast } = useApp();

  const result: ActivityResultState | null =
    (location.state as ActivityResultState | null) ?? load<ActivityResultState | null>("lastResult", null);

  const [comfort, setComfort] = useState<Comfort | null>(null);

  useEffect(() => {
    if (!result) navigate("/patient", { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const giveComfort = (c: Comfort) => {
    if (comfort) return;
    setComfort(c);
    recordComfort(result.type, result.topic, c);
    chime(c === "not" ? "gentle" : "success");
    showToast(t("result.thankYou"), "success");
  };

  const typeLabel = t(activityLabelKey(result.type));

  return (
    <div className="app-shell" style={{ minHeight: "100dvh" }}>
      <main className="page page--wide" style={{ paddingTop: 34 }}>
        <div style={{ textAlign: "center" }} className="pop-in">
          <svg width="92" height="92" viewBox="0 0 64 64" aria-hidden="true" style={{ animation: "sway 3s ease-in-out infinite", transformOrigin: "50% 100%" }}>
            <path d="M32 56V30" stroke="var(--green)" strokeWidth="5" strokeLinecap="round" />
            <path d="M32 38c0-10 7-17 17-19-1 10-7 17-17 19z" fill="var(--sage)" />
            <path d="M32 45c0-8-6-14-14-15 1 8 6 14 14 15z" fill="var(--green)" />
            <circle cx="32" cy="20" r="11" fill="var(--sun)" />
            <circle cx="32" cy="20" r="5" fill="#d9862b" />
          </svg>
          <h1 className="display" style={{ fontSize: "2rem", fontWeight: 800, margin: "12px 0 2px", color: "var(--green-deep)" }}>
            {result.skipped ? "🌿" : t("result.wellDone")}
          </h1>
          <p className="muted" style={{ fontWeight: 700 }}>{typeLabel}</p>
        </div>

        <Card className="fade-up" style={{ marginTop: 18, textAlign: "center" }}>
          {result.skipped ? (
            <>
              <p style={{ fontWeight: 700, margin: "0 0 4px" }}>{t("result.skipped")}</p>
              <p className="muted" style={{ margin: 0 }}>{t("result.tryAnytime")}</p>
            </>
          ) : (
            <FlowerMeter correct={result.correct} total={Math.max(1, result.total)} />
          )}
        </Card>

        {!result.skipped && (
          <Card className="fade-up" style={{ marginTop: 14 }}>
            <h2 className="display" style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 12px", textAlign: "center" }}>{t("result.howFeel")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {([
                { c: "good" as Comfort, emoji: "🙂", label: t("result.feelGood"), bg: "var(--green-soft)", fg: "var(--green-deep)" },
                { c: "okay" as Comfort, emoji: "😐", label: t("result.feelOkay"), bg: "var(--sun-soft)", fg: "#6f5713" },
                { c: "not" as Comfort, emoji: "🙁", label: t("result.feelNot"), bg: "var(--rose-soft)", fg: "var(--rose-ink)" },
              ]).map((o) => (
                <button key={o.c} type="button"
                  className="card card-press"
                  style={{ padding: "14px 6px", textAlign: "center", minHeight: 92, background: comfort === o.c ? o.bg : "var(--surface)", borderColor: comfort === o.c ? o.fg : "var(--line-soft)", opacity: comfort && comfort !== o.c ? 0.55 : 1 }}
                  onClick={() => giveComfort(o.c)}
                  aria-pressed={comfort === o.c}
                  disabled={comfort !== null}
                >
                  <span style={{ fontSize: "1.9rem", display: "block" }} aria-hidden="true">{o.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.92rem", color: o.fg }}>{o.label}</span>
                </button>
              ))}
            </div>
            {comfort === "not" && <p className="muted" style={{ textAlign: "center", marginTop: 12, marginBottom: 0 }}>{t("result.tryAnytime")}</p>}
          </Card>
        )}

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }} className="fade-up">
          {!result.skipped && (
            <Button large onClick={() => navigate("/patient/activities")} icon={<Sparkles size={20} aria-hidden="true" />}>
              {t("result.anotherOne")}
            </Button>
          )}
          <Button large variant={result.skipped ? "primary" : "outline"} onClick={() => navigate("/patient")} icon={<HomeIcon size={20} aria-hidden="true" />}>
            {t("common.goHome")}
          </Button>
        </div>
      </main>
    </div>
  );
}

export { Music2, getDifficulty };
