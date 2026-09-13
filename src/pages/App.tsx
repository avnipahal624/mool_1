import React from "react";
import { HashRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LanguageProvider, useLang } from "../context/LanguageContext";
import { AppProvider, useApp } from "../context/AppContext";
import { PatientProvider } from "../context/PatientContext";
import { Button, ErrorState } from "../components/core";
import { ToastStack, usePageTitle } from "../components/chrome";

import { LanguageSelect, Login, RoleSelect, Splash } from "./Onboarding";
import { CaregiverHome, CaregiverProfile } from "./caregiver/Caregiver";
import { AddMemory, MemoryBank, MemoryDetail } from "./caregiver/Memories";
import {
  CaregiverAlerts, CaregiverInsights, CaregiverLocation, CaregiverPrivacy,
  CaregiverRoutine, CaregiverVoices, WeeklyReport,
} from "./caregiver/Care";
import { ActivitiesHub, MorePage, PatientHome } from "./patient/Home";
import { AttentionGame, MemoryMatchGame, PatternGame, StoryGame } from "./patient/Games1";
import { ColourGame, LanguageGame, MathsGame, MusicGame, ResultPage } from "./patient/Games2";
import {
  Diary, FamilyMessages, Journey, MusicGarden, PatientMemories,
  PatientRoutine, PatientSettings, VoiceMode,
} from "./patient/Life";
import { CaregiverWalletPage, PatientWalletPage, PublicSafetyCardPage } from "./patient/Wallet";
import { CookiesPolicy, PrivacyPolicy, TermsPage } from "./Legal";

/* COMPLIANCE NOTE: this project contains no analytics or tracking library,
   so there is nothing to gate behind consent. If one is ever added, it must
   default to OFF and require explicit opt-in (see /cookies-policy). */

function RequireRole({ role, children }: { role: "patient" | "caregiver"; children: React.ReactElement }) {
  const { auth } = useApp();
  if (!auth.signedIn || !auth.role) return <Navigate to="/onboarding/login" replace />;
  if (auth.role !== role) return <Navigate to={auth.role === "patient" ? "/patient" : "/caregiver"} replace />;
  return children;
}

function RequireSignedIn({ children }: { children: React.ReactElement }) {
  const { auth } = useApp();
  if (!auth.signedIn) return <Navigate to="/onboarding/login" replace />;
  return children;
}

function NotFound() {
  const { t } = useLang();
  const navigate = useNavigate();
  usePageTitle("Page not found", "This path hasn't grown yet.");
  return (
    <div className="app-shell" style={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}>
      <main className="page page--wide" style={{ width: "100%", textAlign: "center" }}>
        <svg width="110" height="110" viewBox="0 0 64 64" aria-hidden="true" style={{ margin: "0 auto", display: "block" }}>
          <path d="M32 56V30" stroke="var(--green)" strokeWidth="5" strokeLinecap="round" />
          <path d="M32 40c0-10 7-17 17-19-1 10-7 17-17 19z" fill="var(--sage)" opacity="0.5" />
          <path d="M32 46c0-8-6-14-14-15 1 8 6 14 14 15z" fill="var(--sage)" opacity="0.35" />
          <circle cx="32" cy="56" r="4" fill="#a86a2c" />
        </svg>
        <h1 className="display" style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--green-deep)", margin: "16px 0 6px" }}>
          {t("notFound.title")}
        </h1>
        <p className="muted" style={{ marginBottom: 22 }}>{t("notFound.desc")}</p>
        <Button large onClick={() => navigate("/")}>{t("common.goHome")}</Button>
        <ToastStack />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding/language" element={<LanguageSelect />} />
      <Route path="/onboarding/login" element={<Login />} />
      <Route path="/onboarding/role" element={<RequireSignedIn><RoleSelect /></RequireSignedIn>} />

      {/* -------- Legal (public, linked from every footer) -------- */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/cookies-policy" element={<CookiesPolicy />} />

      {/* -------- Patient -------- */}
      <Route path="/patient" element={<RequireRole role="patient"><PatientHome /></RequireRole>} />
      <Route path="/patient/activities" element={<RequireRole role="patient"><ActivitiesHub /></RequireRole>} />
      {/* Activity previews are open to the signed-in caregiver too ("open it for Mitali"). */}
      <Route path="/patient/activity/memory" element={<RequireSignedIn><MemoryMatchGame /></RequireSignedIn>} />
      <Route path="/patient/activity/pattern" element={<RequireSignedIn><PatternGame /></RequireSignedIn>} />
      <Route path="/patient/activity/story" element={<RequireSignedIn><StoryGame /></RequireSignedIn>} />
      <Route path="/patient/activity/attention" element={<RequireSignedIn><AttentionGame /></RequireSignedIn>} />
      <Route path="/patient/activity/language" element={<RequireSignedIn><LanguageGame /></RequireSignedIn>} />
      <Route path="/patient/activity/music" element={<RequireSignedIn><MusicGame /></RequireSignedIn>} />
      <Route path="/patient/activity/colour" element={<RequireSignedIn><ColourGame /></RequireSignedIn>} />
      <Route path="/patient/activity/maths" element={<RequireSignedIn><MathsGame /></RequireSignedIn>} />
      <Route path="/patient/activity/result" element={<RequireSignedIn><ResultPage /></RequireSignedIn>} />
      <Route path="/patient/memories" element={<RequireRole role="patient"><PatientMemories /></RequireRole>} />
      <Route path="/patient/diary" element={<RequireRole role="patient"><Diary /></RequireRole>} />
      <Route path="/patient/music" element={<RequireRole role="patient"><MusicGarden /></RequireRole>} />
      <Route path="/patient/family" element={<RequireRole role="patient"><FamilyMessages /></RequireRole>} />
      <Route path="/patient/routine" element={<RequireRole role="patient"><PatientRoutine /></RequireRole>} />
      <Route path="/patient/progress" element={<RequireRole role="patient"><Journey /></RequireRole>} />
      <Route path="/patient/voice" element={<RequireRole role="patient"><VoiceMode /></RequireRole>} />
      <Route path="/patient/settings" element={<RequireRole role="patient"><PatientSettings /></RequireRole>} />
      <Route path="/patient/more" element={<RequireRole role="patient"><MorePage /></RequireRole>} />
      <Route path="/patient/wallet" element={<RequireRole role="patient"><PatientWalletPage /></RequireRole>} />
      <Route path="/patient/wallet/safety-card" element={<RequireRole role="patient"><PublicSafetyCardPage /></RequireRole>} />

      {/* -------- Caregiver -------- */}
      <Route path="/caregiver" element={<RequireRole role="caregiver"><CaregiverHome /></RequireRole>} />
      <Route path="/caregiver/profile" element={<RequireRole role="caregiver"><CaregiverProfile /></RequireRole>} />
      <Route path="/caregiver/memories" element={<RequireRole role="caregiver"><MemoryBank /></RequireRole>} />
      <Route path="/caregiver/memories/add" element={<RequireRole role="caregiver"><AddMemory /></RequireRole>} />
      <Route path="/caregiver/memories/:id" element={<RequireRole role="caregiver"><MemoryDetail /></RequireRole>} />
      <Route path="/caregiver/voices" element={<RequireRole role="caregiver"><CaregiverVoices /></RequireRole>} />
      <Route path="/caregiver/routine" element={<RequireRole role="caregiver"><CaregiverRoutine /></RequireRole>} />
      <Route path="/caregiver/insights" element={<RequireRole role="caregiver"><CaregiverInsights /></RequireRole>} />
      <Route path="/caregiver/reports" element={<RequireRole role="caregiver"><WeeklyReport /></RequireRole>} />
      <Route path="/caregiver/privacy" element={<RequireRole role="caregiver"><CaregiverPrivacy /></RequireRole>} />
      <Route path="/caregiver/alerts" element={<RequireRole role="caregiver"><CaregiverAlerts /></RequireRole>} />
      <Route path="/caregiver/location" element={<RequireRole role="caregiver"><CaregiverLocation /></RequireRole>} />
      <Route path="/caregiver/wallet" element={<RequireRole role="caregiver"><CaregiverWalletPage /></RequireRole>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="app-shell" style={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}>
          <main className="page page--wide" style={{ width: "100%" }}>
            <ErrorState onRetry={() => { this.setState({ err: false }); window.location.hash = "#/"; window.location.reload(); }} />
            <ToastStack />
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <PatientProvider>
          <HashRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </HashRouter>
        </PatientProvider>
      </AppProvider>
    </LanguageProvider>
  );
}
