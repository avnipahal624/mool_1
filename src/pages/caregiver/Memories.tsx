import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, CalendarDays, Gamepad2, MapPin, Mic, Plus, ShieldAlert, Trash2, User } from "lucide-react";
import { Header, PageShell, usePageTitle } from "../../components/chrome";
import { Button, Card, Chip, EmptyState, Modal, RecordButton, SensitiveBadge, SectionTitle, Tag, Toggle } from "../../components/core";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { useApp } from "../../context/AppContext";
import { ALL_INTERESTS } from "../../data/seed";
import { memoryTopic, trPick } from "../../services/memoryService";
import type { MemoryType } from "../../lib/types";

const TYPE_META: Record<MemoryType, { key: string; icon: React.ReactNode }> = {
  person: { key: "addMemory.person", icon: <User size={20} aria-hidden="true" /> },
  place: { key: "addMemory.place", icon: <MapPin size={20} aria-hidden="true" /> },
  event: { key: "addMemory.event", icon: <CalendarDays size={20} aria-hidden="true" /> },
  story: { key: "addMemory.story", icon: <BookOpen size={20} aria-hidden="true" /> },
};

/* ---------------- Memory Bank ---------------- */

export function MemoryBank() {
  const { t, tx } = useLang();
  const navigate = useNavigate();
  const { memories } = usePatient();
  usePageTitle("Memory Bank", "All memories saved for the garden. Sensitive memories stay protected.");
  const [filter, setFilter] = useState<string>("all");

  const shown = useMemo(
    () => (filter === "all" ? memories : memories.filter((m) => m.type === filter)),
    [memories, filter]
  );

  return (
    <PageShell
      nav="caregiver"
      header={<Header title={t("memoryBank.title")} back="/caregiver" right={<Button variant="soft" icon={<Plus size={19} aria-hidden="true" />} onClick={() => navigate("/caregiver/memories/add")}>{t("memoryBank.add")}</Button>} />}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }} role="group" aria-label="Filter">
        {["all", "person", "place", "event", "story"].map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? t("common.viewAll") : t(TYPE_META[f as MemoryType].key)}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title={t("memoryBank.empty")}
          desc={t("memoryBank.emptyDesc")}
          action={<Button variant="primary" icon={<Plus size={19} aria-hidden="true" />} onClick={() => navigate("/caregiver/memories/add")}>{t("memoryBank.add")}</Button>}
        />
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shown.map((m) => (
            <Card key={m.id} onClick={() => navigate(`/caregiver/memories/${m.id}`)} ariaLabel={tx(m.title)} className="leaf">
              <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                <span style={{ width: 46, height: 46, borderRadius: 15, background: m.sensitive ? "var(--lav-soft)" : "var(--peach-soft)", color: m.sensitive ? "#5c4b8a" : "#7a4a1c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {TYPE_META[m.type].icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="display" style={{ fontWeight: 800, fontSize: "1.12rem" }}>{tx(m.title)}</div>
                  <div className="muted" style={{ fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {m.voiceNote ? `🎙 ${m.voiceNote.label} · ${m.voiceNote.duration}s` : tx(m.text)}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
                    {m.sensitive && <SensitiveBadge />}
                    {m.tags.slice(0, 3).map((tag) => (<Tag key={tag}>{t(`interests.${tag}`) !== `interests.${tag}` ? t(`interests.${tag}`) : tag}</Tag>))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div style={{ height: 10 }} />
    </PageShell>
  );
}

/* ---------------- Add Memory ---------------- */

/* DATA MINIMIZATION (reviewed): every field on this form feeds real
   functionality and nothing is collected "just in case" —
   type    → patient-facing category (People/Places/Events/Stories)
   title   → card display + Story Recall context
   text    → Story Recall question generation + detail view
   tags    → activity personalisation in activityGenerator
   sensitive → hard exclusion from all activity generation
   voice   → simulated note shown in Voices and Story Recall voice rounds
   The profile form is likewise minimal: name/age (display), preferred
   language (display + hint), interests (activity generation). */
export function AddMemory() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { addMemory } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Add a Memory", "Add a person, place, event or story to the memory bank.");

  const [type, setType] = useState<MemoryType>("story");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sensitive, setSensitive] = useState(false);
  const [voice, setVoice] = useState<{ label: string; duration: number } | null>(null);
  const [errors, setErrors] = useState<{ title?: boolean; text?: boolean }>({});

  const save = () => {
    const errs: { title?: boolean; text?: boolean } = {};
    if (!title.trim()) errs.title = true;
    if (!text.trim() && !voice) errs.text = true;
    setErrors(errs);
    if (errs.title || errs.text) return;
    const id = addMemory({
      type,
      title: { en: title.trim() },
      text: { en: text.trim() || `🎙 ${voice?.label ?? "Voice note"} (${voice?.duration ?? 0}s)` },
      tags: tags.length > 0 ? tags : ["stories"],
      sensitive,
      voiceNote: voice ?? undefined,
    });
    showToast(t("common.saved"), "success");
    navigate(`/caregiver/memories/${id}`);
  };

  return (
    <PageShell nav="caregiver" header={<Header title={t("addMemory.title")} back="/caregiver/memories" />}>
      <Card className="fade-up">
        <span className="label" style={{ marginTop: 0 }}>{t("addMemory.type")}</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }} role="group" aria-label={t("addMemory.type")}>
          {(Object.keys(TYPE_META) as MemoryType[]).map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setType(tp)}
              aria-pressed={type === tp}
              className="display"
              style={{
                minHeight: 74, borderRadius: 16, border: `2px solid ${type === tp ? "var(--green)" : "var(--line)"}`,
                background: type === tp ? "var(--green-soft)" : "var(--surface)",
                color: type === tp ? "var(--green-deep)" : "var(--ink-soft)",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
                fontWeight: 700, fontSize: "0.85rem", transition: "all 0.15s ease",
              }}
            >
              {TYPE_META[tp].icon}
              {t(TYPE_META[tp].key)}
            </button>
          ))}
        </div>

        <label className="label" htmlFor="mem-title">{t("addMemory.memoryTitle")}</label>
        <input id="mem-title" className="input" value={title} onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: false })); }} placeholder="Morning tea with Baban" />
        {errors.title && <p className="field-error" role="alert">⚠ {t("addMemory.needTitle")}</p>}

        <label className="label" htmlFor="mem-text">{t("addMemory.memoryText")} <span className="muted" style={{ fontWeight: 400 }}>— {t("addMemory.orRecord")}</span></label>
        <textarea id="mem-text" className="textarea" value={text} onChange={(e) => { setText(e.target.value); setErrors((p) => ({ ...p, text: false })); }} placeholder={t("addMemory.placeholder")} />
        {errors.text && <p className="field-error" role="alert">⚠ {t("addMemory.needText")}</p>}

        <div style={{ marginTop: 12 }}>
          {voice ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Tag tone="lav">🎙 {voice.duration}s</Tag>
              <span style={{ fontWeight: 700 }}>{t("addMemory.recorded")} ✓</span>
            </div>
          ) : (
            <RecordButton
              idleLabel={t("common.record")}
              recordingLabel={t("addMemory.recording")}
              onDone={(secs) => setVoice({ label: title.trim() || "Voice note", duration: secs })}
            />
          )}
        </div>

        <span className="label">{t("addMemory.tags")}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label={t("addMemory.tags")}>
          {ALL_INTERESTS.map((i) => (
            <Chip key={i} on={tags.includes(i)} onClick={() => setTags((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))}>
              {t(`interests.${i}`)}
            </Chip>
          ))}
        </div>

        <hr className="divider" />
        <Toggle
          checked={sensitive}
          onChange={setSensitive}
          label={t("addMemory.sensitiveToggle")}
          note={t("addMemory.sensitiveNote")}
        />
      </Card>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <Button large onClick={save}>{t("common.save")}</Button>
        <Button variant="outline" large onClick={() => navigate("/caregiver/memories")}>{t("common.cancel")}</Button>
      </div>
    </PageShell>
  );
}

/* ---------------- Memory Detail ---------------- */

export function MemoryDetail() {
  const { id } = useParams();
  const { t, tx, lang } = useLang();
  const navigate = useNavigate();
  const { memories, deleteMemory } = usePatient();
  const { showToast } = useApp();
  const mem = memories.find((m) => m.id === id);
  usePageTitle(mem ? tx(mem.title) : "Memory", "A single memory from the bank.");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!mem) {
    return (
      <PageShell nav="caregiver" header={<Header title={t("memoryBank.title")} back="/caregiver/memories" />}>
        <EmptyState emoji="🍂" title={t("notFound.title")} desc={t("notFound.desc")} action={<Button onClick={() => navigate("/caregiver/memories")}>{t("common.goHome")}</Button>} />
      </PageShell>
    );
  }

  const topic = memoryTopic(mem);
  const inspires = [
    { key: "activities.memoryMatch", to: `/patient/activity/memory?memoryId=${mem.id}`, icon: <Gamepad2 size={17} aria-hidden="true" /> },
    { key: "activities.patternMemory", to: `/patient/activity/pattern?memoryId=${mem.id}`, icon: <ShieldAlt />, },
    { key: "activities.storyRecall", to: `/patient/activity/story?memoryId=${mem.id}`, icon: <BookOpen size={17} aria-hidden="true" /> },
  ];

  return (
    <PageShell nav="caregiver" header={<Header title={tx(mem.title)} back="/caregiver/memories" />}>
      <Card className="fade-up leaf">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <Tag tone="peach">{t(TYPE_META[mem.type].key)}</Tag>
          {mem.sensitive ? <SensitiveBadge /> : <Tag tone="sage">{topic ? trPick(topic.label, lang) : ""}</Tag>}
        </div>
        <h2 className="display" style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 8px" }}>{tx(mem.title)}</h2>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{tx(mem.text)}</p>
        {mem.voiceNote && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Mic size={18} style={{ color: "#5c4b8a" }} aria-hidden="true" />
            <span style={{ fontWeight: 700 }}>{mem.voiceNote.label}</span>
            <Tag tone="lav">{mem.voiceNote.duration}s</Tag>
          </div>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
          {mem.tags.map((tag) => (<Tag key={tag}>{t(`interests.${tag}`) !== `interests.${tag}` ? t(`interests.${tag}`) : tag}</Tag>))}
        </div>
        <p className="muted" style={{ fontSize: "0.9rem", marginTop: 14, marginBottom: 0 }}>
          {t("memoryDetail.addedOn")} {new Date(mem.createdAt).toLocaleDateString()}
        </p>
      </Card>

      {!mem.sensitive && (
        <>
          <SectionTitle>{t("memoryDetail.inspire")}</SectionTitle>
          <p className="muted" style={{ marginTop: -6 }}>{t("memoryDetail.inspireNote")}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {inspires.map((a) => (
              <button key={a.key} type="button" className="chip" style={{ minHeight: 52, fontSize: "1rem" }} onClick={() => navigate(a.to)}>
                {a.icon} {t(a.key)}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 22 }}>
        <Button variant="danger" icon={<Trash2 size={18} aria-hidden="true" />} onClick={() => setConfirmOpen(true)}>
          {t("common.delete")}
        </Button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t("memoryDetail.deleteQ")}>
        <p className="muted">{t("memoryDetail.deleteNote")}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button variant="danger" onClick={() => { deleteMemory(mem.id); showToast(t("common.done"), "success"); navigate("/caregiver/memories"); }}>
            {t("common.confirmDelete")}
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>{t("common.cancel")}</Button>
        </div>
      </Modal>
    </PageShell>
  );
}

function ShieldAlt() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}
