import React from "react";
import { Header, PageShell, FooterLegal, usePageTitle } from "../components/chrome";
import { useLang } from "../context/LanguageContext";

/**
 * Legal pages. Body copy is intentionally in English (legal wording),
 * while navigation, titles and the footer remain fully translated.
 *
 * NOTE (compliance): these pages match what the app actually does today —
 * a local-only prototype. If a backend, real audio capture or analytics are
 * ever added, these pages must be rewritten before release.
 */

function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PageShell header={<Header title={title} back="/" />} nav="none">
      <div className="legal-prose fade-up">{children}</div>
    </PageShell>
  );
}

function UpdatedLine() {
  const when = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return <p className="muted" style={{ fontSize: "0.9rem" }}>Last updated: {when}</p>;
}

/* ---------------- Privacy Policy ---------------- */

export function PrivacyPolicy() {
  const { t } = useLang();
  usePageTitle("Privacy Policy", "What the MOOL prototype stores, why, and how long — in plain language.");
  return (
    <LegalShell title={t("legal.privacy")}>
      <p className="legal-lead">
        This page explains, in plain language, what MOOL stores and why. The short version:
        everything stays on your own device, and nothing is sent anywhere.
      </p>
      <UpdatedLine />

      <div className="legal-callout">
        MOOL is a prototype / demo application, not a live commercial product. It does not
        process real patient data. The people, memories, family messages and observations shown in the
        app are fictional demo content.
      </div>

      <h2>1. What we store</h2>
      <ul>
        <li><strong>Profile basics</strong> — the patient's first name, age, preferred language and interest tags, so activities can feel familiar.</li>
        <li><strong>Memories</strong> — the title, short text, type, tags and a "sensitive" flag for each memory a caregiver adds.</li>
        <li><strong>Voice notes</strong> — simulated in this demo. No microphone audio is recorded, stored or transmitted.</li>
        <li><strong>Diary entries</strong> — the text (or a simulated voice label) the patient chooses to save.</li>
        <li><strong>Activity history</strong> — which activities were played, rough accuracy and the patient's own "how did that feel" answer. This is used only to gently adjust difficulty — never to diagnose or score.</li>
        <li><strong>Routine reminders</strong> — times and tasks only. Dosages are never asked for or stored.</li>
        <li><strong>Preferences</strong> — language, text size and spoken-replies settings.</li>
      </ul>

      <h2>2. Where it lives</h2>
      <p>
        All of the above is kept in your browser's local storage on this device. There is no account
        server, no cloud backup and no third-party data sharing in this build.
      </p>

      <h2>3. Why we store it</h2>
      <p>
        Only to make the app work: to personalise activities from the family's memories, to remember
        routine completion, and to show the caregiver gentle, plain-language summaries — never a
        medical score.
      </p>
      <p>
        A memory marked <strong>sensitive</strong> is never used to generate any activity. That rule is
        built into the app's logic, not just this page.
      </p>

      <h2>4. How long it is kept</h2>
      <p>
        Until you remove it. You can delete individual memories and reminders at any time, export
        everything as a file (Caregiver → Privacy → Export data), or clear the whole garden
        (Caregiver → Privacy → Delete account, or clear this site's browser data).
      </p>

      <h2>5. Your choices</h2>
      <ul>
        <li>Every storage item can be viewed, exported or deleted from within the app.</li>
        <li>Nothing is shared with advertisers or analytics services — there are none in this build.</li>
        <li>Location Safety is consent-based and visible only to the caregiver side of the app.</li>
      </ul>

      <h2>6. A note for any future real deployment</h2>
      <p>
        A real release handling a patient's personal data — and a family member's voice or photo data —
        would need to comply with India's <strong>Digital Personal Data Protection (DPDP) Act</strong>,
        including lawful consent, purpose limitation and data-principal rights. That work is outside the
        scope of this prototype.
      </p>

      <FooterLegal />
    </LegalShell>
  );
}

/* ---------------- Terms & Conditions ---------------- */

export function TermsPage() {
  const { t } = useLang();
  usePageTitle("Terms & Conditions", "The terms for the MOOL prototype — a demo, not a medical device.");
  return (
    <LegalShell title={t("legal.terms")}>
      <p className="legal-lead">
        These terms apply to the MOOL prototype. By using this demo you agree to the short,
        honest points below.
      </p>
      <UpdatedLine />

      <h2>1. What this is</h2>
      <p>
        MOOL is a <strong>prototype / demo build created for a hackathon and academic
        context</strong>. It explores how families might support an older relative's memory and daily
        joy. It is <strong>not a live commercial product</strong> and has no paying users, no service
        level, and no support obligation.
      </p>

      <h2>2. Not a medical device</h2>
      <p>
        MOOL is <strong>not a certified medical device</strong> and provides <strong>no medical
        advice, diagnosis or treatment</strong>. Its activities are designed to encourage engagement,
        reminiscence and gentle cognitive stimulation — nothing more is claimed. Insights and weekly
        reports are plain-language summaries of joyful moments, never medical measurements. Always
        consult a qualified health professional about any medical concern.
      </p>

      <h2>3. Demo content is fictional</h2>
      <p>
        The patient "Mitali", her family, their messages, memories and any observations shown in the app
        are fictional demo content. They are not real endorsements, reviews or testimonials from real
        people.
      </p>

      <h2>4. Provided "as is"</h2>
      <p>
        The prototype is provided as-is and as-available, without warranties of any kind. It may change
        or disappear at any time, and stored data lives only in your browser until cleared.
      </p>

      <h2>5. Respectful use</h2>
      <p>
        Please use the app respectfully and never enter real sensitive personal data of real patients
        into a demo build.
      </p>

      <h2>6. Contact</h2>
      <p>
        This is a student project with no public contact details at this time.
        <br />
        <strong>Prototype build — not a live product.</strong>
      </p>

      <FooterLegal />
    </LegalShell>
  );
}

/* ---------------- Cookies Policy ---------------- */

export function CookiesPolicy() {
  const { t } = useLang();
  usePageTitle("Cookies Policy", "The MOOL prototype does not use tracking cookies — details here.");
  return (
    <LegalShell title={t("legal.cookies")}>
      <div className="legal-callout">
        <strong>This demo does not use tracking cookies.</strong> There are no analytics, no
        advertising and no third-party trackers in this app.
      </div>
      <UpdatedLine />

      <h2>1. What we checked</h2>
      <p>
        The codebase sets no cookies and includes no analytics or tracking libraries. (If any were ever
        added, they would be switched off by default and shown only after explicit opt-in — there is
        nothing to opt in to today.)
      </p>

      <h2>2. What we do use: local storage</h2>
      <p>
        Instead of cookies, MOOL uses your browser's <strong>local storage</strong> — a small
        private notebook that never leaves your device. It holds:
      </p>
      <ul>
        <li>your language, text size and sign-in role;</li>
        <li>memories, routine reminders and diary entries;</li>
        <li>activity history used only to tune game difficulty;</li>
        <li>family messages and voice-note placeholders.</li>
      </ul>
      <p>Clearing this site's browser data removes all of it.</p>

      <h2>3. External resources</h2>
      <p>Each external asset was reviewed for licensing:</p>
      <ul>
        <li><strong>Google Fonts</strong> (Bricolage Grotesque, Atkinson Hyperlegible, Noto Sans Bengali) — served under the SIL Open Font License; fonts only, no tracking scripts.</li>
        <li><strong>Icons</strong> — Lucide React (ISC license) and hand-drawn inline SVG motifs. No icon CDN is used.</li>
        <li><strong>Illustrations</strong> — generated for this project and bundled with it; not scraped photographs.</li>
        <li><strong>Audio</strong> — synthesised in your browser with the Web Audio API. No audio files are downloaded or streamed.</li>
      </ul>

      <h2>4. Questions</h2>
      <p>
        If a future version ever needs cookies or analytics, this page will say so first — and you will
        be asked before anything is switched on.
      </p>

      <FooterLegal />
    </LegalShell>
  );
}
