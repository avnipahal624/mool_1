import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, CalendarDays, CloudSun, Download, Flower2, Gamepad2, Home as HomeIcon,
  LogOut, MapPin, Menu as MenuIcon, Mic, MoreHorizontal, ShieldCheck, Sprout, Trash2, TrendingUp, X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { clearAll } from "../lib/storage";
import { IconButton } from "./core";

/* ---------- Per-page title + meta ---------- */

export function usePageTitle(title: string, desc?: string) {
  useEffect(() => {
    document.title = `${title} — MOOL`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc ?? "MOOL — Memories. Our people. Our routines. Living independently.");
  }, [title, desc]);
}

/* ---------- Header ---------- */

export function Header({ title, back, right }: { title: React.ReactNode; back?: string | true; right?: React.ReactNode }) {
  const navigate = useNavigate();
  const { t } = useLang();
  return (
    <header className="header">
      {back && (
        <IconButton ariaLabel={t("common.back")} onClick={() => (back === true ? navigate(-1) : navigate(back))} variant="outline">
          <ArrowLeft size={22} aria-hidden="true" />
        </IconButton>
      )}
      <h1 style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
      {right}
    </header>
  );
}

export function SkipButton({ onSkip }: { onSkip: () => void }) {
  const { t } = useLang();
  return (
    <button type="button" className="skip-btn" onClick={onSkip}>
      <X size={16} aria-hidden="true" />
      {t("common.skip")}
    </button>
  );
}

/* ---------- Patient bottom navigation ---------- */

export function PatientNav() {
  const { t } = useLang();
  const items = [
    { to: "/patient", key: "nav.home", icon: <HomeIcon size={22} aria-hidden="true" />, end: true },
    { to: "/patient/activities", key: "nav.activities", icon: <Gamepad2 size={22} aria-hidden="true" /> },
    { to: "/patient/memories", key: "nav.memories", icon: <BookOpen size={22} aria-hidden="true" /> },
    { to: "/patient/routine", key: "nav.routine", icon: <CalendarDays size={22} aria-hidden="true" /> },
    { to: "/patient/more", key: "nav.more", icon: <MoreHorizontal size={22} aria-hidden="true" /> },
  ];
  return (
    <nav className="nav-bottom" aria-label="Patient navigation">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} aria-label={t(it.key)}>
          <span className="nav-ic">{it.icon}</span>
          {t(it.key)}
        </NavLink>
      ))}
    </nav>
  );
}

export function CaregiverNav() {
  const { t } = useLang();
  const items = [
    { to: "/caregiver", key: "nav.garden", icon: <Sprout size={22} aria-hidden="true" />, end: true },
    { to: "/caregiver/memories", key: "nav.memories", icon: <BookOpen size={22} aria-hidden="true" /> },
    { to: "/caregiver/routine", key: "nav.routine", icon: <CalendarDays size={22} aria-hidden="true" /> },
    { to: "/caregiver/voices", key: "nav.voices", icon: <Mic size={22} aria-hidden="true" /> },
    { to: "/caregiver/insights", key: "nav.insights", icon: <TrendingUp size={22} aria-hidden="true" /> },
  ];
  return (
    <nav className="nav-bottom" aria-label="Caregiver navigation">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} aria-label={t(it.key)}>
          <span className="nav-ic">{it.icon}</span>
          {t(it.key)}
        </NavLink>
      ))}
    </nav>
  );
}

/* ---------- Caregiver overflow menu (secondary actions only) ---------- */

export function CaregiverMenu() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { signOut, showToast } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", onDoc);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onDoc); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const exportData = () => {
    try {
      const data: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("mg_")) {
          try { data[k] = JSON.parse(localStorage.getItem(k) ?? ""); } catch { data[k] = localStorage.getItem(k); }
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "memory-garden-data.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast(t("privacy.exported"), "success");
    } catch {
      showToast(t("errors.somethingWrong"), "error");
    }
    setOpen(false);
  };

  const deleteAccount = () => {
    clearAll();
    signOut();
    window.location.hash = "#/";
    window.location.reload();
  };

  return (
    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
      <IconButton ariaLabel="Menu" onClick={() => setOpen((o) => !o)} variant="outline">
        <MenuIcon size={22} aria-hidden="true" />
      </IconButton>
      {open && (
        <div className="menu-panel" role="menu">
          <button type="button" className="menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/caregiver/profile"); }}>
            <Flower2 size={18} aria-hidden="true" /> {t("profile.title")}
          </button>
          <button type="button" className="menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/caregiver/reports"); }}>
            <TrendingUp size={18} aria-hidden="true" /> {t("reports.title")}
          </button>
          <button type="button" className="menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/caregiver/location"); }}>
            <MapPin size={18} aria-hidden="true" /> {t("location.title")}
          </button>
          <button type="button" className="menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/caregiver/privacy"); }}>
            <ShieldCheck size={18} aria-hidden="true" /> {t("privacy.title")}
          </button>
          <hr className="divider" style={{ margin: "6px 0" }} />
          <button type="button" className="menu-item" role="menuitem" onClick={exportData}>
            <Download size={18} aria-hidden="true" /> {t("privacy.export")}
          </button>
          <button type="button" className="menu-item" role="menuitem" onClick={deleteAccount} style={{ color: "var(--rose-ink)" }}>
            <Trash2 size={18} aria-hidden="true" /> {t("privacy.deleteAccount")}
          </button>
          <button type="button" className="menu-item" role="menuitem" onClick={() => { signOut(); navigate("/onboarding/login"); }}>
            <LogOut size={18} aria-hidden="true" /> {t("common.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Offline / sync banners ---------- */

export function OfflineBanner() {
  const { sync } = useApp();
  const { t } = useLang();
  if (sync === "offline") {
    return (
      <div className="offline-banner" role="status">
        <CloudSun size={18} aria-hidden="true" />
        {t("offline.banner")}
      </div>
    );
  }
  if (sync === "syncing") {
    return (
      <div className="offline-banner" role="status" style={{ background: "var(--green-soft)", color: "var(--green-deep)", borderColor: "var(--sage)" }}>
        <Sprout size={18} aria-hidden="true" style={{ animation: "sway 1.2s ease-in-out infinite" }} />
        {t("offline.syncing")}
      </div>
    );
  }
  if (sync === "synced") {
    return (
      <div className="offline-banner" role="status" style={{ background: "var(--green-soft)", color: "var(--green-deep)", borderColor: "var(--sage)" }}>
        <Sprout size={18} aria-hidden="true" />
        {t("offline.upToDate")}
      </div>
    );
  }
  return null;
}

/* ---------- Toasts ---------- */

export function ToastStack() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast--${toast.kind === "info" ? "success" : toast.kind}`}
          onClick={() => dismissToast(toast.id)}
          style={{ pointerEvents: "auto", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
        >
          <Sprout size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{toast.msg}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Floating petals (ambient life) ---------- */

const PETAL_PATH = "M10 0C16 6 16 14 10 20 4 14 4 6 10 0Z";

export function FloatingPetals({ count = 7 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        delay: `${(i * 1.7) % 9}s`,
        dur: `${9 + ((i * 3) % 7)}s`,
        size: 12 + ((i * 5) % 12),
        color: ["#eec39a", "#bcaed6", "#9db48f", "#e9cd7a"][i % 4],
        rotate: (i * 47) % 360,
      })),
    [count]
  );
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {petals.map((p, i) => (
        <svg
          key={i}
          className="petal"
          style={{ left: p.left, width: p.size, height: p.size * 2, animationDelay: p.delay, animationDuration: p.dur }}
          viewBox="0 0 20 20"
        >
          <path d={PETAL_PATH} fill={p.color} opacity="0.65" transform={`rotate(${p.rotate} 10 10)`} />
        </svg>
      ))}
    </div>
  );
}

/* ---------- Page shell ---------- */

export function PageShell({ children, header, nav = "patient" }: { children: React.ReactNode; header?: React.ReactNode; nav?: "patient" | "caregiver" | "none" }) {
  return (
    <div className="app-shell">
      <OfflineBanner />
      {header}
      <main className="page">{children}</main>
      {nav === "patient" ? <PatientNav /> : nav === "caregiver" ? <CaregiverNav /> : null}
      <ToastStack />
    </div>
  );
}

/* ---------- About / legal footer ----------
   States plainly that this is a prototype with fictional demo content,
   and links the three policy pages. No fabricated company details. */

export function FooterLegal() {
  const { t } = useLang();
  return (
    <footer className="legal-footer">
      <Sprout size={18} aria-hidden="true" style={{ color: "var(--green)" }} />
      <p className="legal-footer__note">
        {t("legal.prototype")}
        <br />
        {t("legal.fictional")}
      </p>
      <nav className="legal-footer__links" aria-label="Legal">
        <Link to="/privacy-policy">{t("legal.privacy")}</Link>
        <span aria-hidden="true">·</span>
        <Link to="/terms">{t("legal.terms")}</Link>
        <span aria-hidden="true">·</span>
        <Link to="/cookies-policy">{t("legal.cookies")}</Link>
      </nav>
      <p className="legal-footer__note">{t("legal.studentProject")}</p>
    </footer>
  );
}
