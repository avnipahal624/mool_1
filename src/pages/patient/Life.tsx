import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, CalendarDays, Check, Heart, Home as HomeIcon, LogOut, Mic, Music2, Pause, Play,
  Settings as SettingsIcon, Sparkles, Sprout, Volume2,
} from "lucide-react";
import { FooterLegal, Header, PageShell, usePageTitle } from "../../components/chrome";
import { Button, Card, EmptyState, Modal, RecordButton, SectionTitle, Tag, Toggle } from "../../components/core";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { useApp } from "../../context/AppContext";
import { RELAX_SOUNDS, SONGS } from "../../data/seed";
import { MotifIcon } from "../../data/motifs";
import { chime, isAmbientPlaying, playMelody, setVolume, speak, startAmbient, stopAmbient, stopMelody } from "../../services/soundService";
import { activityLabelKey, favouriteActivity, favouriteTopicName, totalCompleted, uniqueRoutineDays } from "../../services/adaptationEngine";
import { getEligibleMemories, topicById } from "../../services/memoryService";
import { timeAgo } from "../../lib/storage";
import type { Lang, Memory, MemoryType } from "../../lib/types";

/* ================= My Memories (patient, view-only) ================= */

export function PatientMemories() {
  const { t, tx } = useLang();
  const { memories } = usePatient();
  usePageTitle("My Memories", "A gentle walk through saved memories.");
  const [tab, setTab] = useState<string>("person");

  const eligible = useMemo(() => getEligibleMemories(memories), [memories]);

  const tabs: { id: MemoryType | "music"; key: string }[] = [
    { id: "person", key: "patientMemories.people" },
    { id: "place", key: "patientMemories.places" },
    { id: "event", key: "patientMemories.events" },
    { id: "story", key: "patientMemories.stories" },
    { id: "music", key: "patientMemories.music" },
  ];

  const shown = eligible.filter((m) =>
    tab === "music" ? m.tags.includes("music") || m.voiceNote : m.type === tab
  );

  const typeIcon = (m: Memory) =>
    m.voiceNote ? "🎙" : m.type === "person" ? "👵" : m.type === "place" ? "🏞" : m.type === "event" ? "🎉" : "📖";

  return (
    <PageShell nav="patient" header={<Header title={t("patientMemories.title")} />}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }} role="tablist" aria-label={t("patientMemories.title")}>
        {tabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} type="button" className={`chip ${tab === x.id ? "chip-on" : ""}`} onClick={() => setTab(x.id)}>
            {t(x.key)}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState emoji="🌱" title={t("patientMemories.empty")} desc={t("patientMemories.emptyDesc")} />
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shown.map((m) => (
            <Card key={m.id} className="leaf">
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: "1.7rem", lineHeight: 1 }} aria-hidden="true">{typeIcon(m)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="display" style={{ fontWeight: 800, fontSize: "1.12rem" }}>{tx(m.title)}</div>
                  <p style={{ margin: "6px 0 0", lineHeight: 1.65 }}>{tx(m.text)}</p>
                  <p className="muted" style={{ fontSize: "0.88rem", fontWeight: 700, margin: "8px 0 0" }}>💛 {t("patientMemories.addedBy")}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

/* ================= Diary ================= */

export function Diary() {
  const { t } = useLang();
  const { diary, addDiary } = usePatient();
  const { showToast } = useApp();
  usePageTitle("My Diary", "Write or record a little something — every word is a seed.");
  const [mode, setMode] = useState<"menu" | "write" | "voice" | "view">("menu");
  const [text, setText] = useState("");

  const saveText = () => {
    if (!text.trim()) return;
    addDiary({ kind: "text", text: text.trim() });
    setText("");
    setMode("view");
    showToast(t("diary.savedToast"), "success");
  };

  return (
    <PageShell nav="patient" header={<Header title={t("diary.title")} back={mode === "menu" ? true : "/patient/diary"} />}>
      {mode === "menu" && (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button type="button" className="card card-press leaf" style={{ background: "var(--sage-soft)", borderColor: "transparent", display: "flex", alignItems: "center", gap: 14, minHeight: 84, textAlign: "left", width: "100%" }} onClick={() => setMode("write")}>
            <span style={{ fontSize: "1.8rem" }} aria-hidden="true">✍️</span>
            <span className="display" style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--green-deep)" }}>{t("diary.write")}</span>
          </button>
          <button type="button" className="card card-press leaf" style={{ background: "var(--lav-soft)", borderColor: "transparent", display: "flex", alignItems: "center", gap: 14, minHeight: 84, textAlign: "left", width: "100%" }} onClick={() => setMode("voice")}>
            <span style={{ fontSize: "1.8rem" }} aria-hidden="true">🎙</span>
            <span className="display" style={{ fontWeight: 800, fontSize: "1.2rem", color: "#5c4b8a" }}>{t("diary.recordVoice")}</span>
          </button>
          <button type="button" className="card card-press leaf" style={{ background: "var(--peach-soft)", borderColor: "transparent", display: "flex", alignItems: "center", gap: 14, minHeight: 84, textAlign: "left", width: "100%" }} onClick={() => setMode("view")}>
            <span style={{ fontSize: "1.8rem" }} aria-hidden="true">📖</span>
            <span className="display" style={{ fontWeight: 800, fontSize: "1.2rem", color: "#7a4a1c" }}>{t("diary.view")}</span>
          </button>
        </div>
      )}

      {mode === "write" && (
        <Card className="fade-up">
          <label className="label" htmlFor="diary-text" style={{ marginTop: 0 }}>{t("diary.write")}</label>
          <textarea id="diary-text" className="textarea" style={{ minHeight: 160 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("diary.placeholder")} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button large onClick={saveText} disabled={!text.trim()}>{t("diary.saveEntry")}</Button>
          </div>
        </Card>
      )}

      {mode === "voice" && (
        <Card className="fade-up" style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{t("diary.recordVoice")}</p>
          <RecordButton
            idleLabel={t("common.record")}
            recordingLabel={t("addMemory.recording")}
            onDone={(secs) => {
              addDiary({ kind: "voice", duration: secs });
              showToast(t("diary.voiceSaved"), "success");
              setMode("view");
            }}
          />
        </Card>
      )}

      {mode === "view" && (
        diary.length === 0 ? (
          <EmptyState emoji="🍃" title={t("diary.empty")} desc={t("diary.emptyDesc")} action={<Button onClick={() => setMode("voice")} icon={<Mic size={18} aria-hidden="true" />}>{t("diary.recordVoice")}</Button>} />
        ) : (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {diary.map((e) => (
              <Card key={e.id} className="leaf">
                <div className="muted" style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 6 }}>
                  {new Date(e.date).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })} · {new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                {e.kind === "text" ? (
                  <p style={{ margin: 0, lineHeight: 1.65 }}>{e.text}</p>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" className="btn btn-icon btn-primary" style={{ borderRadius: "50%" }} onClick={() => chime("gentle")} aria-label={t("common.play")}>
                      <Play size={18} aria-hidden="true" />
                    </button>
                    <span style={{ fontWeight: 700 }}>🎙 {e.duration}s</span>
                    <span className="muted">· {t("memoryBank.voiceNote")}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      )}
    </PageShell>
  );
}

/* ================= Music Garden ================= */

export function MusicGarden() {
  const { t, tx } = useLang();
  const { profile } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Music Garden", "Favourite songs, family songs, regional tunes and sounds to relax. Never autoplays.");
  const [current, setCurrent] = useState<{ kind: "song" | "sound"; id: string } | null>(null);
  const [vol, setVol] = useState(80);

  useEffect(() => () => { stopAmbient(); stopMelody(); }, []);

  const toggleSong = (id: string) => {
    if (current?.kind === "song" && current.id === id) {
      stopMelody();
      setCurrent(null);
      return;
    }
    stopAmbient();
    const song = SONGS.find((s) => s.id === id);
    if (!song) return;
    const ok = playMelody(song.notes, 0.42, () => setCurrent(null));
    if (!ok) { showToast(t("errors.audioFail"), "error"); return; }
    setCurrent({ kind: "song", id });
  };

  const toggleSound = (id: string) => {
    const sound = RELAX_SOUNDS.find((s) => s.id === id);
    if (!sound) return;
    if (current?.kind === "sound" && current.id === id) {
      stopAmbient();
      setCurrent(null);
      return;
    }
    stopMelody();
    const ok = startAmbient(sound.kind);
    if (!ok) { showToast(t("errors.audioFail"), "error"); return; }
    setCurrent({ kind: "sound", id });
  };

  const sections: { key: string; songs: typeof SONGS }[] = [
    { key: "musicGarden.favourites", songs: SONGS.filter((s) => s.section === "favourites") },
    { key: "musicGarden.familySongs", songs: SONGS.filter((s) => s.section === "family") },
    { key: "musicGarden.regional", songs: SONGS.filter((s) => s.section === "regional") },
  ];

  const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--line-soft)" };

  return (
    <PageShell nav="patient" header={<Header title={t("musicGarden.title")} />}>
      {profile.interests.includes("gardening") && (
        <Card className="fade-up" style={{ background: "var(--green-soft)", borderColor: "transparent", display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Sprout size={20} style={{ color: "var(--green-deep)", flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontWeight: 700, color: "var(--green-deep)" }}>{t("musicGarden.recommended")} 🌷</span>
        </Card>
      )}

      <Card className="fade-up" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <Volume2 size={22} style={{ color: "var(--green-deep)", flexShrink: 0 }} aria-hidden="true" />
        <label htmlFor="mg-vol" className="sr-only">Volume</label>
        <input id="mg-vol" type="range" min={0} max={100} value={vol} onChange={(e) => { const v = Number(e.target.value); setVol(v); setVolume(v / 100); }} style={{ flex: 1, accentColor: "var(--green)" }} />
        <span className="display" style={{ fontWeight: 800, width: 44, textAlign: "right" }}>{vol}%</span>
      </Card>

      {sections.map((sec) => (
        <div key={sec.key}>
          <SectionTitle>{sec.key === "musicGarden.favourites" ? "💛" : sec.key === "musicGarden.familySongs" ? "👨‍👩‍👧" : "🥁"} {t(sec.key)}</SectionTitle>
          <Card style={{ padding: "4px 16px" }}>
            {sec.songs.map((s) => {
              const active = current?.kind === "song" && current.id === s.id;
              return (
                <div key={s.id} style={rowStyle}>
                  <button type="button" className="btn btn-icon btn-primary" style={{ borderRadius: "50%", flexShrink: 0 }} onClick={() => toggleSong(s.id)} aria-label={`${active ? t("common.pause") : t("common.play")}: ${tx(s.title)}`}>
                    {active ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{tx(s.title)}</div>
                    {s.hint && <div className="muted" style={{ fontSize: "0.88rem" }}>{tx(s.hint)}</div>}
                  </div>
                  {active && <Tag tone="sage">♪ {t("common.play")}</Tag>}
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      <SectionTitle>🍃 {t("musicGarden.relax")}</SectionTitle>
      <Card style={{ padding: "4px 16px" }}>
        {RELAX_SOUNDS.map((s, i) => {
          const active = current?.kind === "sound" && current.id === s.id;
          return (
            <div key={s.id} style={{ ...rowStyle, borderBottom: i === RELAX_SOUNDS.length - 1 ? "none" : "1px solid var(--line-soft)" }}>
              <button type="button" className="btn btn-icon btn-soft" style={{ borderRadius: "50%", flexShrink: 0 }} onClick={() => toggleSound(s.id)} aria-label={`${active ? t("common.pause") : t("common.play")}: ${t(s.labelKey)}`}>
                {active ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
              <div style={{ flex: 1, fontWeight: 700 }}>{t(s.labelKey)}</div>
              <span style={{ fontSize: "1.3rem" }} aria-hidden="true">{["🌧", "🍃", "🐦", "💧", "🌙"][i % 5]}</span>
              {active && <Tag tone="sage">{isAmbientPlaying() ? "✓" : ""} {t("common.play")}</Tag>}
            </div>
          );
        })}
      </Card>
      <div style={{ height: 12 }} />
    </PageShell>
  );
}

/* ================= Family Messages ================= */

function MsgImage({ src, alt }: { src: string; alt: string }) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (failed) {
    return (
      <div className="card" role="alert" style={{ textAlign: "center", padding: 20 }}>
        <p style={{ fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 4px" }}>{t("errors.somethingWrong")}</p>
        <p className="muted" style={{ margin: "0 0 12px" }}>{t("errors.cantLoad")}</p>
        <Button variant="soft" onClick={() => { setFailed(false); setAttempt((a) => a + 1); }}>{t("common.retry")}</Button>
      </div>
    );
  }
  return <img src={`${src}${attempt ? `?r=${attempt}` : ""}`} alt={alt} onError={() => setFailed(true)} style={{ width: "100%", borderRadius: 18, border: "1px solid var(--line)", display: "block" }} />;
}

export function FamilyMessages() {
  const { t, tx } = useLang();
  const { family, markFamilyRead } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Family Messages", "Warm messages from the family — photos, videos, voices and notes.");
  const [open, setOpen] = useState<string | null>(null);

  const msg = family.find((m) => m.id === open);

  const openMsg = (id: string) => {
    markFamilyRead(id);
    setOpen(id);
  };

  const iconFor = (kind: string) =>
    kind === "video" ? "🎬" : kind === "photo" ? "📷" : kind === "voice" ? "🎙" : "💌";

  return (
    <PageShell nav="patient" header={<Header title={t("family.title")} />}>
      {family.length === 0 ? (
        <EmptyState emoji="💌" title={t("family.empty")} desc={t("family.emptyDesc")} />
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {family.map((m) => (
            <button key={m.id} type="button" className="card card-press leaf" style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 13, width: "100%" }} onClick={() => openMsg(m.id)} aria-label={`${tx(m.from)}: ${tx(m.preview)}`}>
              <span style={{ fontSize: "1.8rem" }} aria-hidden="true">{iconFor(m.kind)}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="display" style={{ display: "block", fontWeight: 800, fontSize: "1.08rem" }}>{tx(m.from)}</span>
                <span className="muted" style={{ display: "block", fontSize: "0.95rem" }}>{tx(m.preview)}</span>
              </span>
              {!m.read && <span style={{ background: "var(--rose-ink)", color: "#fff", borderRadius: 999, padding: "2px 10px", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }}>{t("family.unread")}</span>}
            </button>
          ))}
        </div>
      )}

      <Modal open={Boolean(msg)} onClose={() => setOpen(null)} title={msg ? tx(msg.from) : ""}>
        {msg && (
          <div>
            {msg.kind === "photo" && msg.image && <MsgImage src={msg.image} alt={tx(msg.preview)} />}
            {msg.kind === "video" && (
              <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "var(--ink)" }}>
                {msg.image && <MsgImage src={msg.image} alt={tx(msg.preview)} />}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Button variant="primary" onClick={() => showToast(t("family.playingVideo"), "success")}>
                    ▶ {t("family.playVideo")}
                  </Button>
                </div>
              </div>
            )}
            {msg.kind === "voice" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
                <button type="button" className="btn btn-icon btn-primary" style={{ borderRadius: "50%" }} onClick={() => chime("gentle")} aria-label={t("family.listenVoice")}>
                  <Play size={20} aria-hidden="true" />
                </button>
                <span style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 30 }} aria-hidden="true">
                  {[8, 16, 24, 14, 20, 10, 26, 12].map((h, i) => (<span key={i} style={{ width: 5, height: h, borderRadius: 3, background: "var(--sage)" }} />))}
                </span>
                <span style={{ fontWeight: 700 }}>{t("family.listenVoice")}</span>
              </div>
            )}
            {msg.kind === "text" && msg.body && (
              <p style={{ fontSize: "1.15rem", lineHeight: 1.7, margin: "4px 0" }}>{tx(msg.body)}</p>
            )}
            <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>{timeAgo(msg.date)}</p>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}

/* ================= My Routine (patient) ================= */

export function PatientRoutine() {
  const { t } = useLang();
  const { reminders, toggleReminderDone, isReminderDoneToday } = usePatient();
  const { showToast } = useApp();
  usePageTitle("My Routine", "Today's gentle plan with times and tasks.");

  const kindEmoji: Record<string, string> = { medicine: "💊", hydration: "💧", meal: "🍲", walk: "🚶‍♀️", appointment: "🗓" };
  const doneCount = reminders.filter(isReminderDoneToday).length;

  return (
    <PageShell nav="patient" header={<Header title={t("home.myRoutine")} />}>
      <Card className="fade-up" style={{ background: "var(--sage-soft)", borderColor: "transparent", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span className="flower-row" aria-hidden="true">
          {reminders.map((r) => (
            <span key={r.id} style={{ width: 22, height: 22, borderRadius: "50%", background: isReminderDoneToday(r) ? "var(--green)" : "var(--surface)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fdfbf3", transition: "all 0.2s ease" }}>
              {isReminderDoneToday(r) && <Check size={13} strokeWidth={3.5} />}
            </span>
          ))}
        </span>
        <span style={{ fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--green-deep)" }}>
          {doneCount}/{reminders.length} {t("routine.doneToday")}
        </span>
      </Card>

      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reminders.map((r) => {
          const done = isReminderDoneToday(r);
          return (
            <Card key={r.id} className="leaf" style={{ opacity: done ? 0.75 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "1.7rem" }} aria-hidden="true">{kindEmoji[r.kind]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="display" style={{ fontWeight: 800, fontSize: "1.08rem", textDecoration: done ? "line-through" : "none" }}>{r.label}</div>
                  <div className="muted" style={{ fontWeight: 700 }}>{r.time} · {t(`routine.${r.kind}`)}</div>
                </div>
                <button
                  type="button"
                  className={`btn ${done ? "btn-soft" : "btn-primary"}`}
                  onClick={() => { toggleReminderDone(r.id); if (!done) { chime("success"); showToast(t("common.saved"), "success"); } }}
                  aria-pressed={done}
                  style={{ flexShrink: 0 }}
                >
                  {done ? <><Check size={18} aria-hidden="true" /> {t("common.done")}</> : t("routine.markDone")}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}

/* ================= My Activity Journey ================= */

export function Journey() {
  const { t } = useLang();
  const { reminders, family, profile } = usePatient();
  usePageTitle("My Activity Journey", "A gentle picture of the garden you are growing.");

  const total = totalCompleted();
  const stage = total >= 19 ? 3 : total >= 9 ? 2 : total >= 3 ? 1 : 0;
  const stageKey = ["progress.stageSeed", "progress.stageSprout", "progress.stagePlant", "progress.stageTree"][stage];
  const favAct = favouriteActivity();
  const favTopic = favouriteTopicName();

  const stats = [
    { n: total, label: t("progress.activitiesDone"), icon: <Sparkles size={20} aria-hidden="true" /> },
    { n: favAct ? t(activityLabelKey(favAct)) : "🌱", label: t("progress.favouriteActivity"), icon: <Heart size={20} aria-hidden="true" /> },
    { n: favTopic ? t(`interests.${favTopic}`) !== `interests.${favTopic}` ? t(`interests.${favTopic}`) : topicById(favTopic).label.en : "🌿", label: t("progress.favouriteTopic"), icon: <Sprout size={20} aria-hidden="true" /> },
    { n: family.length, label: t("progress.familyMessages"), icon: <Heart size={20} aria-hidden="true" /> },
    { n: uniqueRoutineDays(reminders), label: t("progress.routineDays"), icon: <CalendarDays size={20} aria-hidden="true" /> },
  ];

  return (
    <PageShell nav="patient" header={<Header title={t("progress.title")} />}>
      <Card className="fade-up" style={{ textAlign: "center", background: "var(--surface-2)" }}>
        <svg viewBox="0 0 160 130" width="190" aria-hidden="true" style={{ margin: "0 auto", display: "block" }}>
          <ellipse cx="80" cy="118" rx="60" ry="8" fill="var(--sage-soft)" />
          <path d="M80 116V70" stroke="var(--green)" strokeWidth="6" strokeLinecap="round" />
          {stage >= 1 && <path d="M80 92c0-12 8-20 20-22-2 12-8 20-20 22z" fill="var(--sage)" />}
          {stage >= 1 && <path d="M80 100c0-9-7-16-16-17 1 9 7 16 16 17z" fill="var(--green)" />}
          {stage >= 2 && <path d="M80 70c0-14 10-24 24-26-2 14-10 24-24 26z" fill="var(--green)" />}
          {stage >= 3 && (
            <g>
              <circle cx="80" cy="38" r="20" fill="var(--green)" />
              <circle cx="60" cy="52" r="14" fill="var(--sage)" />
              <circle cx="100" cy="52" r="14" fill="var(--sage)" />
              <circle cx="74" cy="32" r="5" fill="var(--sun)" />
              <circle cx="90" cy="40" r="5" fill="var(--peach)" />
              <circle cx="80" cy="50" r="5" fill="var(--lav)" />
            </g>
          )}
          {stage === 0 && <circle cx="80" cy="108" r="8" fill="#a86a2c" />}
        </svg>
        <h2 className="display" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--green-deep)", margin: "8px 0 2px" }}>
          {total === 0 ? t("progress.noneYet") : `${t(stageKey)} · ${t("progress.growing")}`}
        </h2>
        <p className="muted" style={{ margin: 0 }}>{profile.name} 🌷</p>
      </Card>

      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        {stats.map((s, i) => (
          <Card key={i} className="leaf" style={{ gridColumn: i === 0 ? "1 / -1" : undefined, background: ["var(--green-soft)", "var(--peach-soft)", "var(--lav-soft)", "var(--sun-soft)", "var(--water-soft)"][i % 5], borderColor: "transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green-deep)", marginBottom: 4 }}>{s.icon}</div>
            <div className="display" style={{ fontSize: i === 0 ? "1.9rem" : "1.15rem", fontWeight: 800, lineHeight: 1.2 }}>{s.n}</div>
            <div className="muted" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{s.label}</div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

/* ================= Voice Mode ================= */

export function VoiceMode() {
  const { t, tx } = useLang();
  const navigate = useNavigate();
  const { reminders, isReminderDoneToday } = usePatient();
  const { settings } = useApp();
  usePageTitle("Voice Mode", "Talk to MOOL — play music, start games, ask what's next.");

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [supported] = useState(() => Boolean((window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition ?? (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition));
  const recRef = useRef<{ stop: () => void; start: () => void } | null>(null);

  const handleCommand = (text: string) => {
    const q = text.toLowerCase();
    const nowHM = new Date().toTimeString().slice(0, 5);
    const next = reminders.find((r) => !isReminderDoneToday(r) && r.time >= nowHM) ?? reminders.find((r) => !isReminderDoneToday(r));
    if (/(music|গান|সংগীত|গান বাজাও|গান শুন)/.test(q) || q.includes("play music")) {
      setReply(t("voice.replyMusic"));
      speak(t("voice.replyMusic"), settings.voiceOn);
      window.setTimeout(() => navigate("/patient/music"), 1500);
    } else if (/(game|খেল|game start|start a game)/.test(q)) {
      setReply(t("voice.replyGame"));
      speak(t("voice.replyGame"), settings.voiceOn);
      window.setTimeout(() => navigate("/patient/activities"), 1500);
    } else if (/(now|এতিয়া|এখন|what do i|কি কৰিব)/.test(q)) {
      const ans = next ? `${t("voice.replyNow")}${next.time} — ${next.label}` : t("voice.replyNone");
      setReply(ans);
      speak(ans, settings.voiceOn);
    } else {
      setReply(`${t("voice.heard")}: "${text}" 🌿`);
    }
  };

  const toggleListen = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;
    try {
      const rec = new SR() as { stop: () => void; start: () => void; lang: string; onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void; onend: () => void; onerror: () => void };
      rec.lang = "en-IN";
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        handleCommand(text);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
      setReply("");
    } catch {
      setListening(false);
    }
  };

  const commands = [
    { key: "voice.cmdMusic", icon: <Music2 size={19} aria-hidden="true" /> },
    { key: "voice.cmdGame", icon: <Sparkles size={19} aria-hidden="true" /> },
    { key: "voice.cmdNow", icon: <CalendarDays size={19} aria-hidden="true" /> },
  ];

  return (
    <PageShell nav="patient" header={<Header title={t("home.talkToMe")} back="/patient" />}>
      <div style={{ textAlign: "center" }} className="fade-up">
        <h2 className="display" style={{ fontSize: "1.5rem", fontWeight: 800, margin: "10px 0 2px" }}>{t("voice.title")}</h2>
        <p className="muted" style={{ fontWeight: 700 }}>{listening ? t("voice.listening") : t("voice.howHelp")}</p>
        <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
          <button type="button" className={`mic-big ${listening ? "listening" : ""}`} onClick={supported ? toggleListen : undefined} aria-label={t("voice.tapToSpeak")} aria-pressed={listening}>
            <Mic size={52} aria-hidden="true" />
          </button>
        </div>
        <p className="muted" style={{ fontWeight: 700 }}>{t("voice.tapToSpeak")}</p>
        {!supported && (
          <Card style={{ background: "var(--sun-soft)", borderColor: "transparent", marginTop: 12, fontWeight: 700, color: "#6f5713" }} className="pop-in">
            🌿 {t("voice.unsupported")}
          </Card>
        )}
      </div>

      {transcript && (
        <Card className="pop-in" style={{ marginTop: 16, background: "var(--surface-2)" }}>
          <div className="muted" style={{ fontWeight: 700, fontSize: "0.88rem" }}>{t("voice.heard")}</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>"{transcript}"</div>
        </Card>
      )}
      {reply && (
        <Card className="pop-in" style={{ marginTop: 12, background: "var(--green-soft)", borderColor: "transparent" }}>
          <div style={{ fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--green-deep)", fontSize: "1.1rem" }}>🌱 {reply}</div>
        </Card>
      )}

      <SectionTitle>💬 {t("voice.trySaying")}</SectionTitle>
      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {commands.map((c) => (
          <button key={c.key} type="button" className="card card-press leaf" style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", minHeight: 66 }} onClick={() => { setTranscript(t(c.key)); handleCommand(t(c.key)); }}>
            <span style={{ color: "var(--green-deep)" }}>{c.icon}</span>
            <span className="display" style={{ fontWeight: 800, fontSize: "1.05rem" }}>"{t(c.key)}"</span>
          </button>
        ))}
      </div>
      <div style={{ height: 12 }} />
    </PageShell>
  );
}

/* ================= Settings ================= */

export function PatientSettings() {
  const { t, lang, setLang } = useLang();
  const { settings, setTextSize, setVoiceOn, signOut } = useApp();
  const navigate = useNavigate();
  usePageTitle("Settings", "Language, text size and voice preferences.");

  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "as", label: "অসমীয়া" },
    { code: "bn", label: "বাংলা" },
  ];

  return (
    <PageShell nav="patient" header={<Header title={t("settings.title")} back="/patient/more" />}>
      <SectionTitle className="fade-up">🌐 {t("settings.language")}</SectionTitle>
      <div style={{ display: "flex", gap: 8 }} role="group" aria-label={t("settings.language")}>
        {langs.map((l) => (
          <button key={l.code} type="button" className={`chip ${lang === l.code ? "chip-on" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => setLang(l.code)} aria-pressed={lang === l.code}>
            {l.label}
          </button>
        ))}
      </div>

      <SectionTitle>🔠 {t("settings.textSize")}</SectionTitle>
      <div style={{ display: "flex", gap: 8 }} role="group" aria-label={t("settings.textSize")}>
        {(["small", "normal", "large"] as const).map((s) => (
          <button key={s} type="button" className={`chip ${settings.textSize === s ? "chip-on" : ""}`} style={{ flex: 1, justifyContent: "center", fontSize: s === "small" ? "0.85rem" : s === "large" ? "1.15rem" : "1rem" }} onClick={() => setTextSize(s)} aria-pressed={settings.textSize === s}>
            {t(`settings.${s}`)}
          </button>
        ))}
      </div>

      <Card className="fade-up" style={{ marginTop: 18 }}>
        <Toggle checked={settings.voiceOn} onChange={setVoiceOn} label={`🔊 ${t("settings.voiceOn")}`} />
      </Card>

      <Card className="fade-up" style={{ marginTop: 14, background: "var(--peach-soft)", borderColor: "transparent" }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#7a4a1c", lineHeight: 1.6 }}>🤝 {t("settings.caregiverNote")}</p>
      </Card>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <Button variant="outline" large onClick={() => { signOut(); navigate("/onboarding/login"); }} icon={<LogOut size={20} aria-hidden="true" />}>
          {t("common.signOut")}
        </Button>
        <p className="muted" style={{ textAlign: "center" }}>{t("settings.version")} 1.0 · 🌱 MOOL</p>
      </div>

      <FooterLegal />
    </PageShell>
  );
}

export { BookOpen, HomeIcon, SettingsIcon };
