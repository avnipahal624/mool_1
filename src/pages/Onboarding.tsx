import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, Phone, Sprout, User } from "lucide-react";
import { FloatingPetals, FooterLegal, usePageTitle } from "../components/chrome";
import { Button, Logo } from "../components/core";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { load } from "../lib/storage";
import type { Lang } from "../lib/types";

/* ---------------- Splash ---------------- */

export function Splash() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { auth } = useApp();

  useEffect(() => {
    usePageTitleLocal("MOOL", "Memories. Our people. Our routines. Living independently.");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasLang = load<Lang | null>("lang", null) !== null;
      if (!hasLang) navigate("/onboarding/language");
      else if (!auth.signedIn) navigate("/onboarding/login");
      else navigate("/onboarding/role");
    }, 2200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", position: "relative", cursor: "pointer" }}
      onClick={() => navigate(load<Lang | null>("lang", null) ? (auth.signedIn ? "/onboarding/role" : "/onboarding/login") : "/onboarding/language")}
      role="button" tabIndex={0} aria-label={t("app.name")}
    >
      <FloatingPetals count={9} />
      <div style={{ animation: "popIn 0.9s ease both", textAlign: "center" }}>
        <Logo size={110} />
        <h1 className="display" style={{ fontSize: "2.3rem", fontWeight: 800, margin: "18px 0 4px", color: "var(--green-deep)" }}>
          {t("app.name")}
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: "1.1rem", margin: 0, animation: "fadeIn 1.2s ease 0.4s both" }}>
          {t("app.tagline")}
        </p>
        <p style={{ color: "var(--ink-mute)", fontSize: "0.95rem", marginTop: 26, animation: "fadeIn 1.2s ease 0.9s both" }}>
          {t("splash.welcome")} 🌱
        </p>
      </div>
    </div>
  );
}

function usePageTitleLocal(title: string, desc: string) {
  document.title = `${title} — Growing connections through memories`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", desc);
}

/* ---------------- Language select ---------------- */

const LANGUAGES: { code: Lang; native: string; hello: string; sub: string }[] = [
  { code: "en", native: "English", hello: "Hello", sub: "English" },
  { code: "as", native: "অসমীয়া", hello: "নমস্কাৰ", sub: "Assamese" },
  { code: "bn", native: "বাংলা", hello: "নমস্কার", sub: "Bengali" },
];

export function LanguageSelect() {
  const navigate = useNavigate();
  const { setLang, t } = useLang();
  useEffect(() => { usePageTitleLocal("Choose language", "Select English, Assamese or Bengali."); }, []);

  const tones = ["var(--green-soft)", "var(--peach-soft)", "var(--lav-soft)"];
  const inks = ["var(--green-deep)", "#7a4a1c", "#5c4b8a"];

  return (
    <div className="app-shell" style={{ position: "relative", minHeight: "100dvh" }}>
      <FloatingPetals count={6} />
      <div className="page page--wide" style={{ paddingTop: 44 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }} className="fade-up">
          <Logo size={72} />
          <h1 className="display" style={{ fontSize: "var(--fs-h-lg)", fontWeight: 800, margin: "14px 0 4px" }}>{t("onboarding.chooseLanguage")}</h1>
          <p className="muted" style={{ margin: 0 }}>{t("onboarding.languageNote")}</p>
        </div>
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {LANGUAGES.map((l, i) => (
            <button
              key={l.code}
              type="button"
              className="card card-press leaf"
              style={{ background: tones[i], borderColor: "transparent", display: "flex", alignItems: "center", gap: 16, minHeight: 88 }}
              onClick={() => { setLang(l.code); navigate("/onboarding/login"); }}
              aria-label={`${l.native} (${l.sub})`}
            >
              <span className="display" style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: inks[i], fontSize: "1.4rem", flexShrink: 0 }}>
                {l.hello.slice(0, 1)}
              </span>
              <span style={{ flex: 1 }}>
                <span className="display" style={{ display: "block", fontWeight: 800, fontSize: "1.35rem", color: inks[i] }}>{l.native}</span>
                <span style={{ color: "var(--ink-soft)" }}>{l.hello} · {l.sub}</span>
              </span>
              <Sprout size={26} style={{ color: inks[i] }} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Login ---------------- */

export function Login() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { signIn, showToast } = useApp();
  const [role, setRole] = useState<"patient" | "caregiver">("patient");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  useEffect(() => { usePageTitleLocal("Sign in", "Sign in to MOOL."); }, []);

  // Demo sign-in only: credentials are validated for presence and then
  // discarded — they are never stored, transmitted or checked against a server.
  const go = (demo: boolean, created = false) => {
    if (!demo && (!id.trim() || !pw.trim())) {
      setErr(true);
      return;
    }
    signIn(role, demo);
    showToast(created ? t("login.createdToast") : t("login.welcomeToast"), "success");
    navigate("/onboarding/role");
  };

  return (
    <div className="app-shell" style={{ position: "relative", minHeight: "100dvh" }}>
      <FloatingPetals count={5} />
      <div className="page page--wide" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }} className="fade-up">
          <Logo size={64} />
          <h1 className="display" style={{ fontSize: "var(--fs-h)", fontWeight: 800, margin: "12px 0 2px" }}>{t("login.title")}</h1>
          <p className="muted" style={{ margin: 0 }}>{t("login.subtitle")}</p>
        </div>

        <div className="card fade-up" style={{ padding: 20 }}>
          <div role="group" aria-label="Role" style={{ display: "flex", background: "var(--surface-2)", borderRadius: 16, padding: 5, gap: 5 }}>
            {(["patient", "caregiver"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className="display"
                style={{
                  flex: 1, minHeight: 50, border: "none", borderRadius: 12, cursor: "pointer",
                  fontWeight: 700, fontSize: "1.02rem",
                  background: role === r ? "var(--green)" : "transparent",
                  color: role === r ? "#fdfbf3" : "var(--ink-soft)",
                  transition: "all 0.15s ease",
                }}
              >
                {r === "patient" ? t("login.patient") : t("login.caregiver")}
              </button>
            ))}
          </div>

          <label className="label" htmlFor="login-id">{t("login.phoneEmail")}</label>
          <input id="login-id" className="input" type="text" inputMode="email" autoComplete="username" value={id} onChange={(e) => { setId(e.target.value); setErr(false); }} placeholder="98640 12345" />

          <label className="label" htmlFor="login-pw">{t("login.password")}</label>
          <input id="login-pw" className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} placeholder="••••••••" />
          {err && <p className="field-error" role="alert">⚠ {t("login.fillFields")}</p>}

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <Button large onClick={() => go(false)} icon={<Phone size={20} aria-hidden="true" />}>{t("login.signIn")}</Button>
            <div style={{ textAlign: "center" }}>
              <button type="button" className="linkish" onClick={() => go(false, true)}>{t("login.createAccount")}</button>
            </div>
          </div>
        </div>

        <div className="card leaf-r fade-up" style={{ marginTop: 16, background: "var(--peach-soft)", borderColor: "transparent" }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, color: "#7a4a1c" }}>{t("login.demoNote")}</p>
          <Button large variant="peach" onClick={() => go(true)} icon={<User size={20} aria-hidden="true" />}>{t("login.tryDemo")}</Button>
        </div>

        <FooterLegal />
      </div>
    </div>
  );
}

/* ---------------- Role selection ---------------- */

export function RoleSelect() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { signIn, auth, showToast } = useApp();
  useEffect(() => { usePageTitleLocal("Who is visiting?", "Choose patient or caregiver."); }, []);

  const choose = (role: "patient" | "caregiver") => {
    signIn(role, auth.demo);
    showToast(t("login.welcomeToast"), "success");
    navigate(role === "patient" ? "/patient" : "/caregiver");
  };

  return (
    <div className="app-shell" style={{ position: "relative", minHeight: "100dvh" }}>
      <FloatingPetals count={7} />
      <div className="page page--wide" style={{ paddingTop: 40 }}>
        <h1 className="display fade-up" style={{ fontSize: "var(--fs-h)", fontWeight: 800, textAlign: "center", margin: "8px 0 24px" }}>
          {t("role.title")}
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="stagger">
          <button type="button" className="card card-press leaf" style={{ background: "var(--peach-soft)", borderColor: "transparent", padding: 22, textAlign: "left" }} onClick={() => choose("patient")}>
            <span style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <span className="avatar" style={{ background: "var(--peach)", width: 56, height: 56, fontSize: "1.5rem" }}>মি</span>
              <span className="display" style={{ fontWeight: 800, fontSize: "1.45rem", color: "#7a4a1c" }}>{t("role.patientCard")}</span>
            </span>
            <span style={{ color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 8 }}>
              <HeartHandshake size={18} aria-hidden="true" /> {t("role.patientDesc")}
            </span>
          </button>
          <button type="button" className="card card-press leaf-r" style={{ background: "var(--sage-soft)", borderColor: "transparent", padding: 22, textAlign: "left" }} onClick={() => choose("caregiver")}>
            <span style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <span className="avatar" style={{ background: "var(--sage)", width: 56, height: 56, fontSize: "1.5rem", color: "var(--green-deep)" }}>অ</span>
              <span className="display" style={{ fontWeight: 800, fontSize: "1.45rem", color: "var(--green-deep)" }}>{t("role.caregiverCard")}</span>
            </span>
            <span style={{ color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 8 }}>
              <Sprout size={18} aria-hidden="true" /> {t("role.caregiverDesc")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
