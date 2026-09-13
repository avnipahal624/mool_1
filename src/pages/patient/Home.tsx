import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, Gamepad2, Heart, LogOut, Mic, Music2, Puzzle, Settings as SettingsIcon, Sparkles, Sprout, Wallet } from "lucide-react";
import { FloatingPetals, FooterLegal, Header, PageShell, usePageTitle } from "../../components/chrome";
import { Card, SectionTitle } from "../../components/core";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { useApp } from "../../context/AppContext";
import { totalCompleted } from "../../services/adaptationEngine";
import { pickTopicN } from "../../services/adaptationEngine";
import { topicById, trPick } from "../../services/memoryService";
import { MotifIcon } from "../../data/motifs";
import { chime } from "../../services/soundService";

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return "greeting.morning";
  if (h < 17) return "greeting.afternoon";
  return "greeting.evening";
}

/* ---------------- Garden visual ---------------- */

function GardenVisual({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 220 110" width="100%" role="img" aria-label="garden" style={{ display: "block" }}>
      <ellipse cx="110" cy="98" rx="92" ry="10" fill="var(--sage-soft)" />
      <path d="M30 96c10-6 26-6 36 0M92 96c10-6 26-6 36 0M154 96c10-6 26-6 36 0" stroke="var(--sage)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g style={{ transformOrigin: "110px 96px", animation: "growUp 0.8s ease both" }}>
        <path d="M110 96V60" stroke="var(--green)" strokeWidth="5" strokeLinecap="round" />
        {stage >= 1 && <path d="M110 74c0-10 7-17 17-18-1 10-7 17-17 18z" fill="var(--sage)" />}
        {stage >= 2 && <path d="M110 82c0-8-6-14-14-15 1 8 6 14 14 15z" fill="var(--green)" />}
        {stage >= 2 && <path d="M110 60c0-12 8-20 20-22-2 12-8 20-20 22z" fill="var(--green)" />}
        {stage >= 3 && (
          <g>
            <circle cx="110" cy="34" r="15" fill="var(--green)" />
            <circle cx="94" cy="44" r="11" fill="var(--sage)" />
            <circle cx="126" cy="44" r="11" fill="var(--sage)" />
            <circle cx="104" cy="30" r="4" fill="var(--sun)" />
            <circle cx="118" cy="36" r="4" fill="var(--peach)" />
            <circle cx="110" cy="44" r="4" fill="var(--lav)" />
          </g>
        )}
        {stage === 0 && <circle cx="110" cy="90" r="6" fill="#a86a2c" />}
      </g>
      {[40, 70, 150, 180].map((x, i) => (
        <g key={x} style={{ animation: `sway ${2.6 + i * 0.3}s ease-in-out ${i * 0.4}s infinite`, transformOrigin: `${x}px 96px` }}>
          <path d={`M${x} 96v-14`} stroke="var(--green)" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx={x} cy={78} r="5.5" fill={["var(--peach)", "var(--lav)", "var(--sun)", "var(--peach)"][i]} />
        </g>
      ))}
    </svg>
  );
}

/* ---------------- Patient Home ---------------- */

export function PatientHome() {
  const { t, tx } = useLang();
  const navigate = useNavigate();
  const { profile, unreadFamily, reminders, isReminderDoneToday } = usePatient();
  usePageTitle("Patient Home", `A warm start to the day for ${profile.name}.`);

  const [orientation, setOrientation] = useState<"ask" | "shown" | "off">(() =>
    sessionStorage.getItem("mg_orientation") === "done" ? "off" : "ask"
  );

  const total = totalCompleted();
  const stage = total >= 19 ? 3 : total >= 9 ? 2 : total >= 3 ? 1 : 0;

  const dateStr = new Date().toLocaleDateString(
    { en: "en-IN", as: "as-IN", bn: "bn-IN" }[useLangRaw()] ?? "en-IN",
    { weekday: "long", day: "numeric", month: "long" }
  );

  const cards = [
    { to: "/patient/activity/memory", title: t("home.memoryGame"), desc: t("home.memoryGameDesc"), motif: "lotus", bg: "var(--primary-soft)", fg: "var(--primary-deep)" },
    { to: "/patient/music", title: t("home.music"), desc: t("home.musicDesc"), motif: "dotara", bg: "var(--secondary-soft)", fg: "var(--secondary-deep)" },
    { to: "/patient/voice", title: t("home.talkToMe"), desc: t("home.talkDesc"), motif: "bird", bg: "var(--accent-soft)", fg: "var(--accent-deep)" },
    { to: "/patient/routine", title: t("home.myRoutine"), desc: t("home.routineDesc"), motif: "teacup", bg: "var(--surface-2)", fg: "var(--text-muted)" },
  ];

  return (
    <PageShell nav="patient" header={<Header title={`${t(greetingKey())}, ${profile.name}`} />}>
      <div style={{ position: "relative" }}>
        <FloatingPetals count={5} />
        <p className="muted fade-up" style={{ marginTop: 0, fontWeight: 700 }}>{dateStr}</p>
        <h2 className="display fade-up" style={{ fontSize: "var(--fs-h)", fontWeight: 800, margin: "0 0 16px", color: "var(--green-deep)", lineHeight: 1.25 }}>
          {t("home.whatToday")}
        </h2>
      </div>

      {unreadFamily > 0 && (
        <button type="button" className="card card-press fade-up" style={{ width: "100%", background: "var(--accent-soft)", borderColor: "var(--accent)", display: "flex", alignItems: "center", gap: 14, marginBottom: 16, textAlign: "left", padding: "18px 20px" }} onClick={() => navigate("/patient/family")} aria-label={t("home.voiceWaiting")}>
          <Mic size={24} style={{ color: "var(--accent-deep)", flexShrink: 0 }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "var(--accent-deep)", fontSize: "1.05rem" }}>A message from family</div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: 2 }}>A new voice message is waiting</div>
          </div>
        </button>
      )}

      {orientation === "ask" && (
        <Card className="fade-up" style={{ marginBottom: 16, background: "var(--secondary-soft)", borderColor: "var(--secondary)" }}>
          <p style={{ fontWeight: 700, margin: "0 0 12px", fontFamily: "var(--font-display)", color: "var(--secondary-deep)" }}>🗓 {t("home.orientationQ")}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setOrientation("shown"); sessionStorage.setItem("mg_orientation", "done"); chime("gentle"); }}>
              {t("common.yes")}
            </button>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setOrientation("off"); sessionStorage.setItem("mg_orientation", "done"); }}>
              {t("common.no")}
            </button>
          </div>
        </Card>
      )}
      {orientation === "shown" && (
        <Card className="pop-in" style={{ marginBottom: 16, background: "var(--secondary-soft)", borderColor: "var(--secondary)", textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--secondary-deep)" }}>{t("home.orientationShown")} <span className="display" style={{ fontWeight: 800, color: "var(--secondary-deep)" }}>{dateStr}</span></p>
          <p className="muted" style={{ margin: "4px 0 0" }}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </Card>
      )}

      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cards.map((c) => (
          <button key={c.to} type="button" className="card card-press" style={{ background: c.bg, borderColor: "var(--border-soft)", padding: "20px 22px", textAlign: "left", display: "flex", alignItems: "center", gap: 16, minHeight: 90 }} onClick={() => navigate(c.to)} aria-label={c.title}>
            <span style={{ flexShrink: 0 }}><MotifIcon id={c.motif} size={48} /></span>
            <div style={{ flex: 1 }}>
              <span className="display" style={{ display: "block", fontWeight: 700, fontSize: "1.15rem", color: c.fg, lineHeight: 1.2 }}>{c.title}</span>
              <span className="muted" style={{ fontSize: "0.92rem", marginTop: 3, display: "block" }}>{c.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <SectionTitle>🌿 {t("home.personalWallet")}</SectionTitle>
      <Card className="fade-up card-press" onClick={() => navigate("/patient/wallet")} style={{ background: "var(--secondary-soft)", borderColor: "var(--secondary)", padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--secondary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Wallet size={26} aria-hidden="true" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--secondary-deep)", marginBottom: 3 }}>{t("home.walletTitle")}</div>
          <div style={{ fontSize: "0.92rem", color: "var(--text-muted)" }}>{t("home.walletDesc")}</div>
        </div>
      </Card>

      <SectionTitle>🌱 {t("home.yourGarden")}</SectionTitle>
      <Card className="fade-up" style={{ background: "var(--surface)", padding: "16px 18px 8px", borderColor: "var(--border-soft)" }}>
        <GardenVisual stage={stage} />
        <p className="muted" style={{ textAlign: "center", margin: "8px 0 12px", fontWeight: 700, fontSize: "0.95rem" }}>
          {total} · {t("home.gardenNote")}
        </p>
      </Card>
      <div style={{ height: 12 }} />
    </PageShell>
  );
}

import { useLang as useLangRawFn } from "../../context/LanguageContext";
function useLangRaw(): string {
  return useLangRawFn().lang;
}

/* ---------------- Activities Hub ---------------- */

export function ActivitiesHub() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { profile } = usePatient();
  usePageTitle("Activities", "Personalized activities grown from your memories, plus quick games.");

  const hub = useMemo(() => {
    const items = [
      { route: "memory", key: "activities.memoryMatch", motif: "marigold" },
      { route: "pattern", key: "activities.patternMemory", motif: "butterfly" },
      { route: "story", key: "activities.storyRecall", motif: "radio" },
      { route: "attention", key: "activities.attention", motif: "sun" },
      { route: "language", key: "activities.language", motif: "flute" },
      { route: "music", key: "activities.musicAct", motif: "dhol" },
    ];
    return items.map((it) => {
      const topicId = pickTopicN(profile, it.route, 1)[0];
      return { ...it, topic: trPick(topicById(topicId).label, lang) };
    });
  }, [profile, lang]);

  return (
    <PageShell nav="patient" header={<Header title={t("activities.title")} />}>
      <SectionTitle className="fade-up">✨ {t("activities.forYou")}</SectionTitle>
      <p className="muted fade-up" style={{ marginTop: -6, fontSize: "0.92rem" }}>{t("activities.forYouNote")}</p>
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {hub.map((a) => (
          <button key={a.route} type="button" className="card card-press" style={{ padding: 16, textAlign: "left", minHeight: 132, display: "flex", flexDirection: "column", background: "var(--surface)", borderColor: "var(--border-soft)" }} onClick={() => navigate(`/patient/activity/${a.route}`)} aria-label={`${t(a.key)} — ${a.topic}`}>
            <span><MotifIcon id={a.motif} size={46} /></span>
            <span className="display" style={{ display: "block", fontWeight: 700, fontSize: "1.05rem", marginTop: 10, lineHeight: 1.2, color: "var(--text)" }}>{t(a.key)}</span>
            <span className="muted" style={{ fontSize: "0.85rem", marginTop: 3 }}>🌿 {a.topic}</span>
          </button>
        ))}
      </div>

      <SectionTitle>⚡ {t("activities.quick")}</SectionTitle>
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button type="button" className="card card-press" style={{ background: "var(--accent-soft)", borderColor: "var(--border-soft)", padding: 16, textAlign: "left", minHeight: 110 }} onClick={() => navigate("/patient/activity/colour")} aria-label={t("activities.colourMatch")}>
          <span style={{ display: "flex", gap: 5, marginBottom: 10 }} aria-hidden="true">
            {["#B94A48", "#6F9FA0", "#C89B3C"].map((c) => (<span key={c} style={{ width: 20, height: 20, borderRadius: 6, background: c }} />))}
          </span>
          <span className="display" style={{ display: "block", fontWeight: 700, fontSize: "1.05rem", color: "var(--accent-deep)" }}>{t("activities.colourMatch")}</span>
        </button>
        <button type="button" className="card card-press" style={{ background: "var(--secondary-soft)", borderColor: "var(--border-soft)", padding: 16, textAlign: "left", minHeight: 110 }} onClick={() => navigate("/patient/activity/maths")} aria-label={t("activities.maths")}>
          <span className="display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--secondary-deep)", display: "block", marginBottom: 6 }}>₹ 50 − 20</span>
          <span className="display" style={{ display: "block", fontWeight: 700, fontSize: "1.05rem", color: "var(--secondary-deep)" }}>{t("activities.maths")}</span>
        </button>
      </div>
      <div style={{ height: 12 }} />
    </PageShell>
  );
}

/* ---------------- More page ---------------- */

export function MorePage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { signOut } = useApp();
  const { unreadFamily } = usePatient();
  usePageTitle("More", "Music garden, diary, family messages, journey and settings.");

  const items = [
    { to: "/patient/music", icon: <Music2 size={22} aria-hidden="true" />, label: t("musicGarden.title"), bg: "var(--secondary-soft)", fg: "var(--secondary-deep)" },
    { to: "/patient/diary", icon: <BookOpen size={22} aria-hidden="true" />, label: t("diary.title"), bg: "var(--primary-soft)", fg: "var(--primary-deep)" },
    { to: "/patient/family", icon: <Heart size={22} aria-hidden="true" />, label: t("family.title"), bg: "var(--accent-soft)", fg: "var(--accent-deep)", badge: unreadFamily },
    { to: "/patient/progress", icon: <Sprout size={22} aria-hidden="true" />, label: t("progress.title"), bg: "var(--surface-2)", fg: "var(--text-muted)" },
    { to: "/patient/voice", icon: <Mic size={22} aria-hidden="true" />, label: t("home.talkToMe"), bg: "var(--surface-2)", fg: "var(--text-muted)" },
    { to: "/patient/settings", icon: <SettingsIcon size={22} aria-hidden="true" />, label: t("settings.title"), bg: "var(--surface-2)", fg: "var(--text-muted)" },
  ];

  return (
    <PageShell nav="patient" header={<Header title={t("nav.more")} />}>
      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it) => (
          <button key={it.to} type="button" className="card card-press" style={{ background: it.bg, borderColor: "var(--border-soft)", display: "flex", alignItems: "center", gap: 14, minHeight: 74, textAlign: "left", width: "100%", padding: "18px 20px" }} onClick={() => navigate(it.to)} aria-label={it.label}>
            <span style={{ color: it.fg, display: "flex" }}>{it.icon}</span>
            <span className="display" style={{ fontWeight: 700, fontSize: "1.1rem", color: it.fg, flex: 1 }}>{it.label}</span>
            {it.badge ? (
              <span style={{ background: "var(--danger)", color: "#fff", borderRadius: 999, padding: "2px 10px", fontWeight: 700, fontSize: "0.9rem" }}>{it.badge} {t("family.unread")}</span>
            ) : (
              <Sparkles size={16} style={{ color: it.fg, opacity: 0.5 }} aria-hidden="true" />
            )}
          </button>
        ))}
        <button type="button" className="card card-press" style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 66, textAlign: "left", width: "100%", color: "var(--danger-deep)", borderColor: "var(--border-soft)" }} onClick={() => { signOut(); navigate("/onboarding/login"); }} aria-label={t("common.signOut")}>
          <LogOut size={22} aria-hidden="true" />
          <span className="display" style={{ fontWeight: 700, fontSize: "1.05rem" }}>{t("common.signOut")}</span>
        </button>
      </div>
      <FooterLegal />
    </PageShell>
  );
}

export { Gamepad2, CalendarDays, Puzzle };
