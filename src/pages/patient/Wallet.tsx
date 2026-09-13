import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Eye, Home as HomeIcon, Lock, MapPin, Phone, Shield, User } from "lucide-react";
import { Header, PageShell, usePageTitle } from "../../components/chrome";
import { Button, Card, EmptyState, Modal, SectionTitle, Toggle } from "../../components/core";
import { useLang } from "../../context/LanguageContext";
import { usePatient } from "../../context/PatientContext";
import { useApp } from "../../context/AppContext";
import type { FamilyContact, PatientWallet, PublicSafetyCard } from "../../lib/types";

/* ================= Patient Wallet (Private View) ================= */

export function PatientWalletPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { wallet, profile } = usePatient();
  usePageTitle("Personal Wallet", "Your important information is safely kept here.");

  const primaryContact = wallet.familyContacts.find((c) => c.isPrimary);

  return (
    <PageShell nav="patient" header={<Header title={t("wallet.title")} back />}>
      <Card className="fade-up" style={{ background: "var(--primary-soft)", borderColor: "var(--primary)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800 }}>
            {wallet.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-deep)" }}>{wallet.name}</div>
            <div style={{ color: "var(--text-muted)", fontWeight: 700 }}>{wallet.age} {t("wallet.years")}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary-deep)", fontSize: "0.9rem" }}>
          <Shield size={16} aria-hidden="true" />
          <span style={{ fontWeight: 700 }}>{t("wallet.protected")}</span>
        </div>
      </Card>

      <SectionTitle>🏠 {t("wallet.home")}</SectionTitle>
      <Card className="fade-up">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <MapPin size={22} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t("wallet.address")}</div>
            <div style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>{wallet.homeAddress}</div>
          </div>
        </div>
      </Card>

      <SectionTitle>👩 {t("wallet.familyContact")}</SectionTitle>
      {primaryContact ? (
        <Card className="fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800 }}>
              {primaryContact.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{primaryContact.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{primaryContact.relationship}</div>
            </div>
          </div>
          <a href={`tel:${primaryContact.phone}`} className="btn btn-primary btn-large" style={{ textDecoration: "none", display: "flex" }}>
            <Phone size={20} aria-hidden="true" />
            {t("wallet.callFamily")}
          </a>
        </Card>
      ) : (
        <EmptyState emoji="👨‍👩‍👧" title={t("wallet.noContact")} desc={t("wallet.noContactDesc")} />
      )}

      <SectionTitle>🗣 {t("wallet.language")}</SectionTitle>
      <Card className="fade-up">
        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          {wallet.preferredLanguage === "as" ? "অসমীয়া (Assamese)" : wallet.preferredLanguage === "bn" ? "বাংলা (Bengali)" : "English"}
        </div>
      </Card>

      {wallet.careNotes && (
        <>
          <SectionTitle>📝 {t("wallet.careNotes")}</SectionTitle>
          <Card className="fade-up">
            <div style={{ lineHeight: 1.6, color: "var(--text)" }}>{wallet.careNotes}</div>
          </Card>
        </>
      )}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <Button large variant="primary" onClick={() => navigate("/patient/wallet/safety-card")} icon={<Eye size={20} aria-hidden="true" />}>
          {t("wallet.viewSafetyCard")}
        </Button>
        <Button large variant="outline" onClick={() => navigate("/patient")} icon={<HomeIcon size={20} aria-hidden="true" />}>
          {t("common.goHome")}
        </Button>
      </div>
    </PageShell>
  );
}

/* ================= Public Safety Card ================= */

export function PublicSafetyCardPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { wallet } = usePatient();
  usePageTitle("Safety Card", "Show this card if you need help.");

  const [showHelp, setShowHelp] = useState(false);
  const primaryContact = wallet.familyContacts.find((c) => c.isPrimary);

  const safetyCard: PublicSafetyCard = {
    name: wallet.publicSafetyCard.showName ? wallet.name : "",
    preferredLanguage: wallet.preferredLanguage,
    primaryContact: wallet.publicSafetyCard.showFamilyContact && primaryContact ? {
      name: primaryContact.name,
      relationship: primaryContact.relationship,
      phone: primaryContact.phone,
    } : undefined,
    helpMessage: t("wallet.helpMessage"),
  };

  return (
    <PageShell nav="none" header={<Header title={t("wallet.safetyCard")} back />}>
      <Card className="fade-up" style={{ background: "var(--accent-soft)", borderColor: "var(--accent)", padding: "24px 20px", marginBottom: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>🌿</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-deep)", margin: "0 0 8px" }}>
            {t("wallet.iMayNeedHelp")}
          </h2>
        </div>

        {safetyCard.name && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: 4 }}>
              {t("wallet.myNameIs")}
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text)" }}>
              {safetyCard.name}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20, padding: "16px", background: "var(--surface)", borderRadius: "var(--r-md)" }}>
          <div style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: 8 }}>
            {t("wallet.preferredLanguage")}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>
            {safetyCard.preferredLanguage === "as" ? "অসমীয়া (Assamese)" : safetyCard.preferredLanguage === "bn" ? "বাংলা (Bengali)" : "English"}
          </div>
        </div>

        {safetyCard.primaryContact && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: 8 }}>
              👨‍👩‍👧 {t("wallet.pleaseContact")}
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              {safetyCard.primaryContact.name}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
              {safetyCard.primaryContact.relationship}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", marginTop: 20 }}>
          {t("wallet.thankYou")}
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {safetyCard.primaryContact && (
          <a href={`tel:${safetyCard.primaryContact.phone}`} className="btn btn-primary btn-large" style={{ textDecoration: "none", display: "flex", minHeight: 60 }}>
            <Phone size={24} aria-hidden="true" />
            {t("wallet.callFamily")}
          </a>
        )}
        <Button large variant="soft" onClick={() => setShowHelp(true)} icon={<HomeIcon size={24} aria-hidden="true" />}>
          {t("wallet.helpMeGetHome")}
        </Button>
        <Button large variant="outline" onClick={() => navigate("/patient/wallet")} icon={<ArrowLeft size={20} aria-hidden="true" />}>
          {t("common.back")}
        </Button>
      </div>

      <Modal open={showHelp} onClose={() => setShowHelp(false)} title={t("wallet.letsGetYouHome")}>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 16 }}>
          {t("wallet.dontHaveToRemember")}
        </p>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 20, color: "var(--primary-deep)", fontWeight: 700 }}>
          {t("wallet.familyNotified")}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {safetyCard.primaryContact && (
            <a href={`tel:${safetyCard.primaryContact.phone}`} className="btn btn-primary btn-large" style={{ textDecoration: "none", display: "flex" }}>
              <Phone size={20} aria-hidden="true" />
              {t("wallet.callMyFamily")}
            </a>
          )}
          <Button variant="outline" large onClick={() => setShowHelp(false)}>
            {t("common.back")}
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}

/* ================= Caregiver Wallet Management ================= */

export function CaregiverWalletPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { wallet, updateWallet } = usePatient();
  const { showToast } = useApp();
  usePageTitle("Patient Wallet", "Manage patient's personal wallet and safety card.");

  const [editMode, setEditMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [editData, setEditData] = useState<PatientWallet>(wallet);

  const save = () => {
    updateWallet(editData);
    showToast(t("wallet.walletSaved"), "success");
    setEditMode(false);
  };

  const primaryContact = wallet.familyContacts.find((c) => c.isPrimary);

  if (editMode) {
    return (
      <PageShell nav="caregiver" header={<Header title={t("wallet.editWallet")} back />}>
        <Card className="fade-up">
          <label className="label" htmlFor="wallet-name" style={{ marginTop: 0 }}>{t("wallet.patientName")}</label>
          <input id="wallet-name" className="input" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />

          <label className="label" htmlFor="wallet-age">{t("wallet.age")}</label>
          <input id="wallet-age" className="input" type="number" value={editData.age} onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) || 0 })} />

          <label className="label" htmlFor="wallet-address">{t("wallet.homeAddress")}</label>
          <textarea id="wallet-address" className="textarea" value={editData.homeAddress} onChange={(e) => setEditData({ ...editData, homeAddress: e.target.value })} />

          <label className="label" htmlFor="wallet-care">{t("wallet.careNotes")}</label>
          <textarea id="wallet-care" className="textarea" value={editData.careNotes || ""} onChange={(e) => setEditData({ ...editData, careNotes: e.target.value })} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Button onClick={save}>{t("common.save")}</Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>{t("common.cancel")}</Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (privacyMode) {
    return (
      <PageShell nav="caregiver" header={<Header title={t("wallet.privacySettings")} back />}>
        <Card className="fade-up">
          <p style={{ fontWeight: 700, marginBottom: 16, color: "var(--primary-deep)" }}>
            {t("wallet.privacyExplanation")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Toggle
              checked={editData.publicSafetyCard.showName}
              onChange={(v) => setEditData({ ...editData, publicSafetyCard: { ...editData.publicSafetyCard, showName: v } })}
              label={t("wallet.showName")}
            />
            <Toggle
              checked={editData.publicSafetyCard.showLanguage}
              onChange={(v) => setEditData({ ...editData, publicSafetyCard: { ...editData.publicSafetyCard, showLanguage: v } })}
              label={t("wallet.showLanguage")}
            />
            <Toggle
              checked={editData.publicSafetyCard.showFamilyContact}
              onChange={(v) => setEditData({ ...editData, publicSafetyCard: { ...editData.publicSafetyCard, showFamilyContact: v } })}
              label={t("wallet.showFamilyContact")}
            />
            <Toggle
              checked={editData.publicSafetyCard.showAddress}
              onChange={(v) => setEditData({ ...editData, publicSafetyCard: { ...editData.publicSafetyCard, showAddress: v } })}
              label={t("wallet.showAddress")}
              note={t("wallet.addressWarning")}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Button onClick={() => { updateWallet(editData); showToast(t("wallet.privacySaved"), "success"); setPrivacyMode(false); }}>
              {t("common.save")}
            </Button>
            <Button variant="outline" onClick={() => setPrivacyMode(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell nav="caregiver" header={<Header title={t("wallet.patientWallet")} back />}>
      <Card className="fade-up" style={{ background: "var(--primary-soft)", borderColor: "var(--primary)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800 }}>
            {wallet.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-deep)" }}>{wallet.name}</div>
            <div style={{ color: "var(--text-muted)", fontWeight: 700 }}>{wallet.age} {t("wallet.years")}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary-deep)", fontSize: "0.9rem" }}>
          <Shield size={16} aria-hidden="true" />
          <span style={{ fontWeight: 700 }}>{t("wallet.safetyCardActive")}</span>
        </div>
      </Card>

      <SectionTitle>👩 {t("wallet.primaryCaregiver")}</SectionTitle>
      {primaryContact && (
        <Card className="fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800 }}>
              {primaryContact.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{primaryContact.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{primaryContact.relationship}</div>
            </div>
          </div>
        </Card>
      )}

      <SectionTitle>🏠 {t("wallet.homeLocation")}</SectionTitle>
      <Card className="fade-up">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <MapPin size={22} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t("wallet.saved")}</div>
            <div style={{ color: "var(--text-muted)", lineHeight: 1.5, fontSize: "0.95rem" }}>{wallet.homeAddress}</div>
          </div>
        </div>
      </Card>

      <SectionTitle>👨‍👩‍👧 {t("wallet.familyContacts")}</SectionTitle>
      <Card className="fade-up">
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-deep)" }}>
          {wallet.familyContacts.length}
        </div>
        <div style={{ color: "var(--text-muted)", fontWeight: 700 }}>{t("wallet.contacts")}</div>
      </Card>

      <SectionTitle>📍 {t("wallet.locationSharing")}</SectionTitle>
      <Card className="fade-up">
        <Toggle
          checked={wallet.locationSharingEnabled}
          onChange={(v) => { updateWallet({ ...wallet, locationSharingEnabled: v }); showToast(t("wallet.locationUpdated"), "success"); }}
          label={wallet.locationSharingEnabled ? t("wallet.on") : t("wallet.off")}
          note={t("wallet.locationNote")}
        />
      </Card>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <Button large variant="primary" onClick={() => { setEditData(wallet); setEditMode(true); }} icon={<Edit size={20} aria-hidden="true" />}>
          {t("wallet.editWallet")}
        </Button>
        <Button large variant="soft" onClick={() => { setEditData(wallet); setPrivacyMode(true); }} icon={<Lock size={20} aria-hidden="true" />}>
          {t("wallet.privacySettings")}
        </Button>
      </div>
    </PageShell>
  );
}
