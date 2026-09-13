import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CalendarClock, Check, Download, Droplets, Footprints, Heart, Mail, MapPin, Mic,
  Pencil, Phone, Pill, Play, Plus, ShieldCheck, Share2, Sparkles, Trash2, TrendingUp, UtensilsCrossed,
} from "lucide-react";
import { FooterLegal, Header, PageShell, usePageTitle } from "../../components/chrome";
import { Button, Card, EmptyState, Modal, RecordButton, SectionTitle, Tag, Toggle } from "../../components/core";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { useApp } from "../../context/AppContext";
import { clearAll, timeAgo, uid } from "../../lib/storage";
import { chime } from "../../services/soundService";
import {
  activityLabelKey, favouriteActivity, favouriteTopicName, highEngagementType, mostSkippedType,
  uniqueRoutineDays, weekCount,
} from "../../services/adaptationEngine";
import { topicById } from "../../services/memoryService";
import type { Reminder, ReminderKind } from "../../lib/types";

const KIND_ICON: Record<ReminderKind, React.ReactNode> = {
  medicine: <Pill size={20} aria-hidden="true" />,
  hydration: <Droplets size={20} aria-hidden="true" />,
  meal: <UtensilsCrossed size={20} aria-hidden="true" />,
  walk: <Footprints size={20} aria-hidden="true" />,
  appointment: <CalendarClock size={20} aria-hidden="true" />,
};

/* ---------------- Voices ---------------- */

export function CaregiverVoices() {
  const { t, tx } = useLang();
  const { voices, addVoice, profile } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Family Voices", "Record and share family voice notes.");
  const [playing, setPlaying] = useState<string | null>(null);

  const play = (id: string) => {
    chime("gentle");
    setPlaying(id);
    window.setTimeout(() => setPlaying((p) => (p === id ? null : p)), 2600);
  };

  return (
    <PageShell
      nav="caregiver"
      header={
        <Header title={t("voices.title")} back="/caregiver" />
      }
    >
      <Card className="fade-up" style={{ background: "var(--lav-soft)", borderColor: "transparent" }}>
        <p style={{ margin: "0 0 12px", fontWeight: 700, color: "#5c4b8a" }}>{t("voices.emptyDesc")}</p>
        <RecordButton
          idleLabel={t("voices.record")}
          recordingLabel={t("addMemory.recording")}
          onDone={(secs) => {
            addVoice({ from: { en: "You (caregiver)", as: "আপুনি (যত্নকাৰী)", bn: "আপনি (যত্নশীল)" }, label: { en: `A short hello for ${profile.name}`, as: `${profile.name}ৰ বাবে এটা চমু নমস্কাৰ`, bn: `${profile.name}র জন্য একটু ছোট্ট নমস্কার` }, duration: secs });
            showToast(t("common.saved"), "success");
          }}
        />
      </Card>

      {voices.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          <EmptyState emoji="🎙" title={t("voices.empty")} desc={t("voices.emptyDesc")} />
        </div>
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {voices.map((v) => (
            <Card key={v.id} className="leaf">
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <button
                  type="button"
                  className="btn btn-icon btn-primary"
                  style={{ borderRadius: "50%", flexShrink: 0 }}
                  onClick={() => play(v.id)}
                  aria-label={`${t("common.play")}: ${tx(v.label)}`}
                >
                  {playing === v.id ? <span style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 18 }} aria-hidden="true">
                    {[0, 1, 2].map((i) => (<span key={i} style={{ width: 4, height: 8 + i * 4, background: "#fdfbf3", borderRadius: 2, animation: `sway 0.7s ease ${i * 0.12}s infinite` }} />))}
                  </span> : <Play size={20} aria-hidden="true" />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{tx(v.label)}</div>
                  <div className="muted" style={{ fontSize: "0.9rem" }}>{t("voices.from")} {tx(v.from)} · {v.duration}s · {timeAgo(v.date)}</div>
                </div>
                <Button variant="outline" icon={<Share2 size={17} aria-hidden="true" />} onClick={() => showToast(t("common.copied"), "success")}>
                  {t("common.share")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

/* ---------------- Routine (caregiver edit) ---------------- */

export function CaregiverRoutine() {
  const { t } = useLang();
  const { reminders, addReminder, updateReminder, deleteReminder } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Daily Routine", "Gentle reminders for the day — times and tasks only, never dosages.");

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ kind: ReminderKind; time: string; label: string }>({ kind: "hydration", time: "11:00", label: "" });

  const startEdit = (r: Reminder) => {
    setEditing(r.id);
    setForm({ kind: r.kind, time: r.time, label: r.label });
  };

  const submit = () => {
    if (!form.label.trim()) return;
    if (editing) {
      const r = reminders.find((x) => x.id === editing);
      if (r) updateReminder({ ...r, ...form });
    } else {
      addReminder(form);
    }
    setForm({ kind: "hydration", time: "11:00", label: "" });
    setEditing(null);
    setAdding(false);
    showToast(t("common.saved"), "success");
  };

  return (
    <PageShell
      nav="caregiver"
      header={<Header title={t("routine.title")} back="/caregiver" right={<Button variant="soft" icon={<Plus size={18} aria-hidden="true" />} onClick={() => { setAdding((a) => !a); setEditing(null); }}>{t("routine.addReminder")}</Button>} />}
    >
      <p className="muted fade-up" style={{ marginTop: 0, fontSize: "0.92rem" }}>🌿 {t("routine.noDose")}</p>

      {(adding || editing) && (
        <Card className="pop-in" style={{ marginBottom: 14, background: "var(--sage-soft)", borderColor: "transparent" }}>
          <label className="label" htmlFor="rem-kind" style={{ marginTop: 0 }}>{t("addMemory.type")}</label>
          <select id="rem-kind" className="select" value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as ReminderKind }))}>
            {(Object.keys(KIND_ICON) as ReminderKind[]).map((k) => (<option key={k} value={k}>{t(`routine.${k}`)}</option>))}
          </select>
          <label className="label" htmlFor="rem-time">{t("routine.time")}</label>
          <input id="rem-time" className="input" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          <label className="label" htmlFor="rem-label">{t("routine.taskLabel")}</label>
          <input id="rem-label" className="input" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="A glass of water" />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Button onClick={submit}>{t("common.save")}</Button>
            <Button variant="outline" onClick={() => { setAdding(false); setEditing(null); }}>{t("common.cancel")}</Button>
          </div>
        </Card>
      )}

      {reminders.length === 0 ? (
        <EmptyState emoji="🕰" title={t("routine.empty")} desc={t("routine.emptyDesc")} action={<Button onClick={() => setAdding(true)} icon={<Plus size={18} aria-hidden="true" />}>{t("routine.addReminder")}</Button>} />
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reminders.map((r) => (
            <Card key={r.id} className="leaf">
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span className="display" style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--green-deep)", width: 56, flexShrink: 0 }}>{r.time}</span>
                <span style={{ width: 42, height: 42, borderRadius: 13, background: "var(--peach-soft)", color: "#7a4a1c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {KIND_ICON[r.kind]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{r.label}</div>
                  <div className="muted" style={{ fontSize: "0.88rem" }}>{t(`routine.${r.kind}`)}</div>
                </div>
                <Button variant="outline" icon={<Pencil size={16} aria-hidden="true" />} onClick={() => startEdit(r)} ariaLabel={t("common.edit")} className="btn-icon" />
                <Button variant="danger" icon={<Trash2 size={16} aria-hidden="true" />} onClick={() => { deleteReminder(r.id); showToast(t("common.done"), "success"); }} ariaLabel={t("common.delete")} className="btn-icon" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

/* ---------------- Insights ---------------- */

export function CaregiverInsights() {
  const { t } = useLang();
  usePageTitle("Insights", "Plain-language observations about what brings joy. Never a medical score.");
  const week = weekCount();
  const high = highEngagementType();
  const favAct = favouriteActivity();
  const favTopic = favouriteTopicName();
  const skipped = mostSkippedType();

  const sentences: { icon: React.ReactNode; text: string }[] = [];
  sentences.push({ icon: <Sparkles size={20} aria-hidden="true" />, text: `${week} ${t("insights.thisWeek")}` });
  if (high) sentences.push({ icon: <Heart size={20} aria-hidden="true" />, text: `${t(activityLabelKey(high))} ${t("insights.highEngagement")}` });
  if (favAct) sentences.push({ icon: <TrendingUp size={20} aria-hidden="true" />, text: `${t(activityLabelKey(favAct))} ${t("insights.lovedBy")}` });
  if (favTopic) sentences.push({ icon: <MapPin size={20} aria-hidden="true" />, text: `${t("insights.favouriteTopic")}: ${topicLabel(favTopic, t)}` });
  if (skipped) sentences.push({ icon: <Check size={20} aria-hidden="true" />, text: `${t(activityLabelKey(skipped))} ${t("insights.gentle")}` });

  return (
    <PageShell nav="caregiver" header={<Header title={t("insights.title")} back="/caregiver" />}>
      <p className="muted fade-up" style={{ marginTop: 0 }}>{t("insights.subtitle")}</p>
      {week === 0 ? (
        <EmptyState emoji="🌷" title={t("insights.notEnough")} desc={t("insights.subtitle")} />
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sentences.map((s, i) => (
            <Card key={i} className="leaf" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--sage-soft)", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</span>
              <span style={{ fontWeight: 700, lineHeight: 1.45 }}>{s.text}</span>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function topicLabel(id: string, t: (k: string) => string): string {
  const key = `interests.${id}`;
  const v = t(key);
  return v === key ? topicById(id).label.en : v;
}

/* ---------------- Privacy ---------------- */

export function CaregiverPrivacy() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { showToast, signOut } = useApp();
  usePageTitle("Privacy", "Who can access memories, export data, and account controls.");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const accessRows = [
    { icon: <ShieldCheck size={20} aria-hidden="true" />, text: t("privacy.accessCaregiver") },
    { icon: <Heart size={20} aria-hidden="true" />, text: t("privacy.accessPatient") },
    { icon: <Bell size={20} aria-hidden="true" />, text: t("privacy.accessFamily") },
  ];

  return (
    <PageShell nav="caregiver" header={<Header title={t("privacy.title")} back="/caregiver" />}>
      <SectionTitle className="fade-up" >{t("privacy.whoCanSee")}</SectionTitle>
      <Card className="fade-up" style={{ padding: "6px 16px" }}>
        {accessRows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderBottom: i < accessRows.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
            <span style={{ color: "var(--green-deep)" }}>{r.icon}</span>
            <span style={{ fontWeight: 700 }}>{r.text}</span>
            <Check size={18} style={{ marginLeft: "auto", color: "var(--green)" }} aria-hidden="true" />
          </div>
        ))}
      </Card>

      {/* Contact details below are intentionally fictional sample values,
          clearly labelled as such — no real business contact is published yet. */}
      <Card className="fade-up" style={{ marginTop: 14, background: "var(--water-soft)", borderColor: "transparent" }}>
        <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 4 }}>{t("legal.prototype")}</div>
        <p className="muted" style={{ margin: "0 0 10px", fontSize: "0.92rem" }}>
          {t("legal.fictional")}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="linkish" href="tel:+910000000000" aria-label="Demo phone number (fictional)" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Phone size={16} aria-hidden="true" /> +91 00000 00000 (demo)
          </a>
          <a className="linkish" href="mailto:hello@memorygarden.demo" aria-label="Demo email address (fictional)" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Mail size={16} aria-hidden="true" /> hello@memorygarden.demo
          </a>
        </div>
      </Card>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <Button variant="soft" icon={<Download size={19} aria-hidden="true" />} onClick={() => showToast(t("privacy.exported"), "success")}>{t("privacy.export")}</Button>
        <Button variant="outline" onClick={() => navigate("/caregiver/memories")}>{t("common.delete")} — {t("memoryBank.title")}</Button>
        <Button variant="danger" icon={<Trash2 size={19} aria-hidden="true" />} onClick={() => setConfirmOpen(true)}>{t("privacy.deleteAccount")}</Button>
      </div>

      <FooterLegal />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t("privacy.deleteAccount")}>
        <p className="muted">{t("privacy.deleteWarn")}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button variant="danger" onClick={() => { clearAll(); signOut(); showToast(t("privacy.deleted"), "warn"); window.location.hash = "#/"; window.location.reload(); }}>
            {t("common.confirmDelete")}
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>{t("common.cancel")}</Button>
        </div>
      </Modal>
    </PageShell>
  );
}

/* ---------------- Family Alerts ---------------- */

export function CaregiverAlerts() {
  const { t, tx } = useLang();
  const { alerts, addAlert } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Family Alerts", "Calm alerts and notes between family and caregiver.");
  const [sendOpen, setSendOpen] = useState(false);

  const kindIcon: Record<string, React.ReactNode> = {
    reminder: <CalendarClock size={19} aria-hidden="true" />,
    family: <Heart size={19} aria-hidden="true" />,
    report: <TrendingUp size={19} aria-hidden="true" />,
    water: <Droplets size={19} aria-hidden="true" />,
    walk: <Footprints size={19} aria-hidden="true" />,
    love: <Heart size={19} aria-hidden="true" />,
  };

  const canned: { kind: "water" | "walk" | "love"; key: string }[] = [
    { kind: "water", key: "alerts.water" },
    { kind: "walk", key: "alerts.walk" },
    { kind: "love", key: "alerts.love" },
  ];

  return (
    <PageShell nav="caregiver" header={<Header title={t("alerts.title")} back="/caregiver" right={<Button variant="soft" icon={<Plus size={18} aria-hidden="true" />} onClick={() => setSendOpen(true)}>{t("alerts.send")}</Button>} />}>
      {alerts.length === 0 ? (
        <EmptyState emoji="🕊" title={t("alerts.empty")} desc={t("alerts.emptyDesc")} action={<Button onClick={() => setSendOpen(true)}>{t("alerts.send")}</Button>} />
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map((a) => (
            <Card key={a.id} className="leaf" style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <span style={{ width: 42, height: 42, borderRadius: 13, background: "var(--sun-soft)", color: "#6f5713", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {kindIcon[a.kind] ?? <Bell size={19} aria-hidden="true" />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{tx(a.text)}</div>
                <div className="muted" style={{ fontSize: "0.88rem" }}>{timeAgo(a.time)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={sendOpen} onClose={() => setSendOpen(false)} title={t("alerts.send")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {canned.map((c) => (
            <Button key={c.kind} variant="soft" large onClick={() => {
              addAlert({ kind: c.kind, text: { en: t(c.key), as: t(c.key), bn: t(c.key) } });
              setSendOpen(false);
              showToast(t("alerts.sent"), "success");
            }}>{t(c.key)}</Button>
          ))}
        </div>
      </Modal>
    </PageShell>
  );
}

/* ---------------- Location Safety (caregiver-only) ---------------- */

export function CaregiverLocation() {
  const { t } = useLang();
  const { location, setLocation } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Location Safety", "Consent-based location sharing and safe-zone alerts.");

  return (
    <PageShell nav="caregiver" header={<Header title={t("location.title")} back="/caregiver" />}>
      <Card className="fade-up map-card" style={{ padding: 0 }}>
        <svg viewBox="0 0 400 240" width="100%" role="img" aria-label={`${t("location.current")}: ${t("location.home")}`}>
          <rect width="400" height="240" fill="#ece6d2" />
          <path d="M0 60h400M0 130h400M0 195h400" stroke="#ddd4ba" strokeWidth="14" />
          <path d="M70 0v240M180 0v240M300 0v240" stroke="#ddd4ba" strokeWidth="12" />
          <path d="M0 60h400M0 130h400M0 195h400" stroke="#f6f1e6" strokeWidth="2" strokeDasharray="10 8" />
          <ellipse cx="330" cy="60" rx="56" ry="40" fill="#cfe0c0" />
          <ellipse cx="60" cy="200" rx="48" ry="30" fill="#cfe0c0" />
          <path d="M352 240C330 190 350 150 330 110" stroke="#a9c6c2" strokeWidth="16" fill="none" strokeLinecap="round" />
          <circle cx="180" cy="130" r="62" fill="rgba(62,107,74,0.10)" stroke="var(--green)" strokeWidth="2.5" strokeDasharray="8 6" />
          <circle cx="180" cy="130" r="9" fill="var(--green)" stroke="#fdfbf3" strokeWidth="3">
            <animate attributeName="r" values="9;11;9" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <path d="M176 96c0-8 14-8 14 0 0 6-7 8-7 14h-0c0-6-7-8-7-14z" fill="var(--rose)" transform="translate(-3,-4)" />
          <circle cx="180" cy="94" r="0" fill="none" />
          <g transform="translate(168,74)">
            <path d="M12 0C5 0 0 5 0 12c0 9 12 20 12 20s12-11 12-20C24 5 19 0 12 0z" fill="var(--rose)" />
            <circle cx="12" cy="12" r="5" fill="#fdfbf3" />
          </g>
          <text x="196" y="186" fontFamily="Bricolage Grotesque, sans-serif" fontSize="13" fontWeight="700" fill="var(--green-deep)">{t("location.safeZone")}</text>
        </svg>
      </Card>

      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        <Card className="leaf">
          <div className="muted" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t("location.current")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <MapPin size={19} style={{ color: "var(--green-deep)" }} aria-hidden="true" />
            <span style={{ fontWeight: 800, fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{t("location.home")}</span>
          </div>
          <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>{t("location.lastUpdated")}: {timeAgo(location.lastUpdated)}</div>
        </Card>

        <Card className="leaf" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--green-soft)", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Check size={22} aria-hidden="true" />
          </span>
          <div>
            <div style={{ fontWeight: 800, fontFamily: "var(--font-display)" }}>{t("location.inside")} ✓</div>
            <div className="muted" style={{ fontSize: "0.9rem" }}>{t("location.safeZone")}: {t("location.zoneNote")}</div>
          </div>
        </Card>

        <Card className="leaf">
          <Toggle checked={location.zoneAlert} onChange={(v) => { setLocation({ zoneAlert: v }); showToast(t("common.saved"), "success"); }} label={t("location.zoneAlert")} />
        </Card>

        <Card className="leaf" style={{ background: "var(--lav-soft)", borderColor: "transparent" }}>
          <Toggle checked={location.sharing} onChange={(v) => { setLocation({ sharing: v }); showToast(t("common.saved"), "success"); }} label={t("location.sharing")} />
          <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.92rem" }}>🤝 {t("location.consent")}</p>
        </Card>
      </div>
    </PageShell>
  );
}

/* ---------------- Weekly Report ---------------- */

export function WeeklyReport() {
  const { t } = useLang();
  const { reminders, family, profile } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Weekly Report", "A gentle summary of the week — never a medical report.");

  const week = weekCount();
  const favAct = favouriteActivity();
  const favTopic = favouriteTopicName();
  const routineDays = uniqueRoutineDays(reminders);
  const msgs = family.length;
  const high = highEngagementType();

  const observation = high
    ? `${t(activityLabelKey(high))} ${t("insights.highEngagement")} — ${t(activityLabelKey(high))} ${t("insights.lovedBy")}.`
    : `${profile.name} ${t("insights.lovedBy")}.`;

  return (
    <PageShell nav="caregiver" header={<Header title={t("reports.title")} back="/caregiver" right={<Button variant="outline" icon={<Share2 size={17} aria-hidden="true" />} onClick={() => showToast(t("common.copied"), "success")}>{t("common.share")}</Button>} />}>
      <h2 className="display fade-up" style={{ fontSize: "1.6rem", fontWeight: 800, margin: "4px 0 14px", color: "var(--green-deep)" }}>
        {profile.name}{t("caregiverHome.garden").replace("🌱", "")} · {t("reports.title")}
      </h2>

      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { n: week, label: t("reports.completed"), bg: "var(--green-soft)", fg: "var(--green-deep)" },
          { n: favAct ? t(activityLabelKey(favAct)) : "—", label: t("insights.favouriteActivity"), bg: "var(--peach-soft)", fg: "#7a4a1c" },
          { n: favTopic ? topicLabel(favTopic, t) : "—", label: t("insights.favouriteTopic"), bg: "var(--lav-soft)", fg: "#5c4b8a" },
          { n: routineDays, label: t("reports.routineDays"), bg: "var(--sun-soft)", fg: "#6f5713" },
          { n: msgs, label: t("reports.familyMsgs"), bg: "var(--water-soft)", fg: "#3f6b66" },
        ].map((c, i) => (
          <Card key={i} className="leaf" style={{ background: c.bg, borderColor: "transparent", gridColumn: i === 0 ? "1 / -1" : undefined }}>
            <div className="display" style={{ fontSize: i === 0 ? "2.1rem" : "1.25rem", fontWeight: 800, color: c.fg, lineHeight: 1.15 }}>{c.n}</div>
            <div className="muted" style={{ fontWeight: 700, fontSize: "0.92rem" }}>{c.label}</div>
          </Card>
        ))}
      </div>

      <SectionTitle>🌷 {t("reports.observation")}</SectionTitle>
      <Card className="fade-up" style={{ background: "var(--surface-2)" }}>
        <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.6 }}>{observation}</p>
        <p className="muted" style={{ margin: "10px 0 0", fontSize: "0.9rem" }}>{t("reports.note")}</p>
      </Card>

      <SectionTitle>{t("reports.suggested")}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className="stagger">
        {[t("reports.moreGardening"), t("reports.moreMusic"), t("reports.familyCall")].map((s) => (
          <Card key={s} className="leaf" style={{ padding: "13px 16px", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            <Mic size={18} style={{ color: "var(--green-deep)", flexShrink: 0 }} aria-hidden="true" /> {s}
          </Card>
        ))}
      </div>
      <div style={{ height: 12 }} />
    </PageShell>
  );
}

export function newId() { return uid(); }
