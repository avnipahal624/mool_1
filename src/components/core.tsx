import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Flower2, Home as HomeIcon, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

/* ---------- Buttons ---------- */

type Variant = "primary" | "soft" | "peach" | "lav" | "sun" | "outline" | "danger" | "plain";

export function Button({
  children, variant = "primary", large, icon, className = "", onClick, disabled, type = "button", ariaLabel,
}: {
  children?: React.ReactNode;
  variant?: Variant;
  large?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  const cls = ["btn"];
  if (variant !== "plain") cls.push(`btn-${variant}`);
  if (large) cls.push("btn-large");
  cls.push(className);
  return (
    <button type={type} className={cls.join(" ")} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, ariaLabel, className = "", variant = "plain" }: {
  children: React.ReactNode; onClick?: () => void; ariaLabel: string; className?: string; variant?: Variant;
}) {
  const cls = ["btn", "btn-icon"];
  if (variant !== "plain") cls.push(`btn-${variant}`);
  cls.push(className);
  return (
    <button type="button" className={cls.join(" ")} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/* ---------- Cards ---------- */

export function Card({ children, className = "", onClick, role, ariaLabel, style }: {
  children: React.ReactNode; className?: string; onClick?: () => void; role?: string; ariaLabel?: string; style?: React.CSSProperties;
}) {
  const base = `card ${onClick ? "card-press" : ""} ${className}`;
  if (onClick) {
    return (
      <button type="button" className={base} onClick={onClick} role={role} aria-label={ariaLabel} style={style}>
        {children}
      </button>
    );
  }
  return <div className={base} style={style}>{children}</div>;
}

export function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`display ${className}`} style={{ fontSize: "1.35rem", fontWeight: 800, margin: "22px 0 10px" }}>{children}</h2>;
}

/* ---------- Chips & tags ---------- */

export function Chip({ children, on, onClick, ariaLabel }: { children: React.ReactNode; on?: boolean; onClick?: () => void; ariaLabel?: string }) {
  return (
    <button type="button" className={`chip ${on ? "chip-on" : ""}`} onClick={onClick} aria-pressed={on} aria-label={ariaLabel}>
      {on && <Check size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Tag({ children, tone = "sage" }: { children: React.ReactNode; tone?: "sage" | "lav" | "sun" | "peach" }) {
  const bg = tone === "sage" ? "var(--sage-soft)" : tone === "lav" ? "var(--lav-soft)" : tone === "sun" ? "var(--sun-soft)" : "var(--peach-soft)";
  const fg = tone === "sage" ? "var(--green-deep)" : tone === "lav" ? "#5c4b8a" : tone === "sun" ? "#6f5713" : "#7a4a1c";
  return (
    <span className="tag" style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
}

export function SensitiveBadge() {
  const { t } = useLang();
  return (
    <span className="badge-sensitive">
      <ShieldGlyph />
      {t("memoryBank.sensitive")}
    </span>
  );
}

function ShieldGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* ---------- Toggle ---------- */

export function Toggle({ checked, onChange, label, note }: { checked: boolean; onChange: (v: boolean) => void; label: string; note?: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{label}</span>
        <label className="switch">
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
          <span className="track" aria-hidden="true" />
          <span className="knob" aria-hidden="true">
            {checked ? <Check size={14} strokeWidth={3.5} /> : null}
          </span>
        </label>
      </div>
      {note && <p className="muted" style={{ fontSize: "0.92rem", marginTop: 4, marginBottom: 0 }}>{note}</p>}
    </div>
  );
}

/* ---------- States ---------- */

export function EmptyState({ emoji, title, desc, action }: { emoji: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="card leaf" style={{ textAlign: "center", padding: "30px 22px" }}>
      <div style={{ fontSize: "2.6rem", lineHeight: 1 }} aria-hidden="true">{emoji}</div>
      <h3 className="display" style={{ fontSize: "1.3rem", fontWeight: 800, margin: "12px 0 6px" }}>{title}</h3>
      <p className="muted" style={{ margin: "0 0 16px" }}>{desc}</p>
      {action}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <div className="card" role="alert" style={{ textAlign: "center", padding: "28px 20px" }}>
      <div style={{ display: "flex", justifyContent: "center", color: "var(--rose-ink)" }}>
        <AlertTriangle size={34} aria-hidden="true" />
      </div>
      <h3 className="display" style={{ fontSize: "1.25rem", fontWeight: 800, margin: "12px 0 4px" }}>{t("errors.somethingWrong")}</h3>
      <p className="muted" style={{ margin: "0 0 16px" }}>{t("errors.cantLoad")}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {onRetry && (
          <Button variant="soft" onClick={onRetry} icon={<RefreshCw size={18} aria-hidden="true" />}>{t("common.retry")}</Button>
        )}
        <Button variant="outline" onClick={() => navigate("/")} icon={<HomeIcon size={18} aria-hidden="true" />}>{t("common.goHome")}</Button>
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h3 className="display" style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: 0 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ---------- Flower meter (gentle, labelled accuracy) ---------- */

export function FlowerMeter({ correct, total }: { correct: number; total: number }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div className="flower-row" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <Flower2 key={i} size={26} fill={i < correct ? "var(--sun)" : "none"} color={i < correct ? "#b98e1f" : "var(--line)"} strokeWidth={2} />
        ))}
      </div>
      <span style={{ fontWeight: 700, color: "var(--ink-soft)" }}>
        {correct} / {total} {t("result.correctOf")}
      </span>
    </div>
  );
}

/* ---------- Simulated recorder ---------- */

export function RecordButton({ onDone, idleLabel, recordingLabel }: { onDone: (seconds: number) => void; idleLabel: string; recordingLabel: string }) {
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);

  const start = () => {
    setRecording(true);
    setSecs(0);
    timer.current = window.setInterval(() => setSecs((s) => s + 1), 1000);
  };

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setRecording(false);
    onDone(Math.max(2, secs));
  };

  return (
    <button
      type="button"
      className={`btn ${recording ? "btn-danger" : "btn-soft"}`}
      onClick={recording ? stop : start}
      aria-pressed={recording}
      style={{ minHeight: 56 }}
    >
      {recording ? (
        <>
          <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--rose)", animation: "recBlink 1s infinite" }} />
          {recordingLabel} · {secs}s
        </>
      ) : (
        <>
          <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--rose)" }} />
          {idleLabel}
        </>
      )}
    </button>
  );
}

/* ---------- Logo ---------- */

export function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="MOOL">
      <circle cx="32" cy="32" r="30" fill="var(--surface)" stroke="var(--sage)" strokeWidth="2" />
      <path d="M32 50V28" stroke="var(--green)" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 34c0-9 6-15 15-16-1 9-6 15-15 16z" fill="var(--green)" />
      <path d="M32 40c0-7-5-12-12-13 1 7 5 12 12 13z" fill="var(--sage)" />
      <path d="M22 52c3-2 17-2 20 0" stroke="var(--rose)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
