import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, BookOpen, CalendarDays, Clock, MapPin, Sprout, TrendingUp, Wallet,
} from "lucide-react";
import { CaregiverMenu, Header, PageShell, usePageTitle } from "../../components/chrome";
import { Button, Card, Chip, SectionTitle, Tag } from "../../components/core";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { useApp } from "../../context/AppContext";
import { activityLabelKey, recentLog, todayCount } from "../../services/adaptationEngine";
import { ALL_INTERESTS } from "../../data/seed";
import type { Lang } from "../../lib/types";

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return "greeting.morning";
  if (h < 17) return "greeting.afternoon";
  return "greeting.evening";
}

/* ---------------- Caregiver Home ---------------- */

export function CaregiverHome() {
  const { t, tx } = useLang();
  const navigate = useNavigate();
  const { profile, memories, reminders, isReminderDoneToday, alerts } = usePatient();
  usePageTitle("Caregiver Dashboard", `${profile.name}'s garden — memories, routine and gentle insights.`);

  const done = todayCount();
  const log = recentLog(4);
  const nowHM = new Date().toTimeString().slice(0, 5);
  const next =
    reminders.find((r) => !isReminderDoneToday(r) && r.time >= nowHM) ??
    reminders.find((r) => !isReminderDoneToday(r));

  const cards = [
    { to: "/caregiver/memories", icon: <BookOpen size={22} aria-hidden="true" />, title: t("caregiverHome.memoryBank"), desc: t("caregiverHome.memoryBankDesc"), bg: "var(--surface)", fg: "var(--text)", extra: `${memories.length} ${t("caregiverHome.memoriesCount")}` },
    { to: "/caregiver/routine", icon: <CalendarDays size={22} aria-hidden="true" />, title: t("caregiverHome.routineCard"), desc: t("caregiverHome.routineDesc"), bg: "var(--surface)", fg: "var(--text)" },
    { to: "/caregiver/insights", icon: <TrendingUp size={22} aria-hidden="true" />, title: t("caregiverHome.insightsCard"), desc: t("caregiverHome.insightsDesc"), bg: "var(--surface)", fg: "var(--text)" },
    { to: "/caregiver/alerts", icon: <Bell size={22} aria-hidden="true" />, title: t("caregiverHome.alertsCard"), desc: t("caregiverHome.alertsDesc"), bg: "var(--surface)", fg: "var(--text)", extra: alerts.length > 0 ? `${alerts.length}` : undefined },
    { to: "/caregiver/location", icon: <MapPin size={22} aria-hidden="true" />, title: t("caregiverHome.locationCard"), desc: t("caregiverHome.locationDesc"), bg: "var(--surface)", fg: "var(--text)" },
    { to: "/caregiver/reports", icon: <Sprout size={22} aria-hidden="true" />, title: t("caregiverHome.reportCard"), desc: t("caregiverHome.reportDesc"), bg: "var(--surface)", fg: "var(--text)" },
  ];

  return (
    <PageShell
      nav="caregiver"
      header={
        <Header
          title={`${t(greetingKey())} 🌿`}
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button type="button" className="btn btn-icon btn-outline" onClick={() => navigate("/caregiver/profile")} aria-label={t("profile.title")}>
                <span className="avatar" style={{ width: 38, height: 38, fontSize: "1rem" }}>{profile.name.slice(0, 1)}</span>
              </button>
              <CaregiverMenu />
            </div>
          }
        />
      }
    >
      <div className="fade-up" style={{ marginTop: 6 }}>
        <h2 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 14px", color: "var(--text)" }}>
          {profile.name}{t("caregiverHome.garden")}
        </h2>
      </div>

      <Card className="fade-up" onClick={() => navigate("/caregiver/insights")} ariaLabel={t("caregiverHome.insightsCard")} style={{ borderColor: "var(--primary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 54, height: 54, borderRadius: 16, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-deep)", flexShrink: 0 }}>
            <Sprout size={28} aria-hidden="true" />
          </span>
          <div>
            <div className="display" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.1, color: "var(--text)" }}>{done}</div>
            <div className="muted" style={{ fontWeight: 700 }}>{t("caregiverHome.activitiesToday")}</div>
          </div>
        </div>
      </Card>

      {next && (
        <Card className="fade-up" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <Clock size={22} style={{ color: "var(--accent-deep)", flexShrink: 0 }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--accent-deep)" }}>{t("caregiverHome.nextReminder")}</div>
            <div className="muted">{next.time} · {next.label} · {t(`routine.${next.kind}`)}</div>
          </div>
          <Button variant="sun" onClick={() => navigate("/caregiver/routine")}>{t("nav.routine")}</Button>
        </Card>
      )}

      <Card className="fade-up card-press" onClick={() => navigate("/caregiver/wallet")} style={{ marginTop: 12, background: "var(--secondary-soft)", borderColor: "var(--secondary)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--secondary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Wallet size={24} aria-hidden="true" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--secondary-deep)", marginBottom: 2 }}>{t("caregiverHome.personalWallet")}</div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{t("caregiverHome.walletDesc")}</div>
        </div>
      </Card>

      <SectionTitle>{t("nav.garden")}</SectionTitle>
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cards.map((c) => (
          <button key={c.to} type="button" className="card card-press" style={{ background: c.bg, borderColor: "var(--border-soft)", padding: 16, textAlign: "left", display: "block" }} onClick={() => navigate(c.to)} aria-label={c.title}>
            <span style={{ color: "var(--primary)", display: "block", marginBottom: 10 }}>{c.icon}</span>
            <span className="display" style={{ display: "block", fontWeight: 700, fontSize: "1.05rem", color: c.fg, lineHeight: 1.2 }}>{c.title}</span>
            <span className="muted" style={{ fontSize: "0.88rem" }}>{c.desc}</span>
            {c.extra && <span style={{ display: "block", marginTop: 6, fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>{c.extra}</span>}
          </button>
        ))}
      </div>

      <SectionTitle>{t("caregiverHome.recent")}</SectionTitle>
      {log.length === 0 ? (
        <p className="muted">{t("caregiverHome.noRecent")}</p>
      ) : (
        <Card className="fade-up" style={{ padding: "6px 16px", borderColor: "var(--border-soft)" }}>
          {log.map((e, i) => (
            <div key={e.ts + i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < log.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-deep)", flexShrink: 0 }}>
                <Sprout size={19} aria-hidden="true" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{e.skipped ? `${t("common.skip")} — ${t(activityLabelKey(e.type))}` : t(activityLabelKey(e.type))}</div>
                <div className="muted" style={{ fontSize: "0.9rem" }}>{new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              {!e.skipped && <Tag tone="sage">{e.correct}/{e.total} ✓</Tag>}
            </div>
          ))}
        </Card>
      )}
      <div style={{ height: 10 }} />
    </PageShell>
  );
}

/* ---------------- Patient Profile ---------------- */

export function CaregiverProfile() {
  const { t } = useLang();
  const { profile, updateProfile } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Patient Profile", "Edit Mitali's name, age, language and interests.");

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(String(profile.age));
  const [prefLang, setPrefLang] = useState<Lang>(profile.preferredLanguage);
  const [interests, setInterests] = useState<string[]>(profile.interests);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const save = () => {
    updateProfile({
      name: name.trim() || profile.name,
      age: Math.max(1, parseInt(age, 10) || profile.age),
      preferredLanguage: prefLang,
      interests: interests.length > 0 ? interests : profile.interests,
    });
    showToast(t("common.saved"), "success");
  };

  const langOpts: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "as", label: "অসমীয়া (Assamese)" },
    { code: "bn", label: "বাংলা (Bengali)" },
  ];

  return (
    <PageShell nav="caregiver" header={<Header title={t("profile.title")} back />}>
      <Card className="fade-up">
        <label className="label" htmlFor="pf-name" style={{ marginTop: 0 }}>{t("profile.name")}</label>
        <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="label" htmlFor="pf-age">{t("profile.age")}</label>
        <input id="pf-age" className="input" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />

        <label className="label" htmlFor="pf-lang">{t("profile.preferredLanguage")}</label>
        <select id="pf-lang" className="select" value={prefLang} onChange={(e) => setPrefLang(e.target.value as Lang)}>
          {langOpts.map((o) => (<option key={o.code} value={o.code}>{o.label}</option>))}
        </select>

        <span className="label">{t("profile.interests")}</span>
        <p className="muted" style={{ fontSize: "0.92rem", marginTop: -4 }}>{t("profile.interestNote")}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label={t("profile.interests")}>
          {ALL_INTERESTS.map((i) => (
            <Chip key={i} on={interests.includes(i)} onClick={() => toggleInterest(i)}>
              {t(`interests.${i}`)}
            </Chip>
          ))}
        </div>
      </Card>
      <div style={{ marginTop: 16 }}>
        <Button large onClick={save}>{t("common.save")}</Button>
      </div>
    </PageShell>
  );
}

