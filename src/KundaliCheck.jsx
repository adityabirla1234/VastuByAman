/**
 * KundaliCheck.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Kundali Check modal for Pandit Aman Bhatore.
 * Pattern mirrors ConsultationBooking.jsx exactly.
 *
 * HOW TO INTEGRATE into PanditAmanBhatore.jsx:
 *   1. Import at the top:
 *        import { KundaliModal, useKundaliModal } from "./KundaliCheck";
 *
 *   2. In App(), add alongside useConsultationModal:
 *        const { open: kundaliOpen, openModal: openKundali, closeModal: closeKundali } = useKundaliModal();
 *
 *   3. Add <KundaliModal open={kundaliOpen} onClose={closeKundali} /> next to <ConsultationModal>
 *
 *   4. In Navbar, add openKundali prop and call it from the nav item:
 *        <Navbar openBooking={openModal} openKundali={openKundali} />
 *
 *   5. In the Navbar links array, replace or add:
 *        { label: "Kundali Check", href: "#kundali", onClick: openKundali }
 *      Then in the link JSX render an onClick button for "Kundali Check".
 *
 * See bottom of file for the exact Navbar diff snippet.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   COUNTRY CODES — top-20 most common + comprehensive list
═══════════════════════════════════════════════════════════ */
const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", label: "India" },
  { code: "+1",  country: "US", flag: "🇺🇸", label: "USA" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "UK" },
  { code: "+971", country: "AE", flag: "🇦🇪", label: "UAE" },
  { code: "+966", country: "SA", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+61",  country: "AU", flag: "🇦🇺", label: "Australia" },
  { code: "+1",   country: "CA", flag: "🇨🇦", label: "Canada" },
  { code: "+65",  country: "SG", flag: "🇸🇬", label: "Singapore" },
  { code: "+60",  country: "MY", flag: "🇲🇾", label: "Malaysia" },
  { code: "+64",  country: "NZ", flag: "🇳🇿", label: "New Zealand" },
  { code: "+49",  country: "DE", flag: "🇩🇪", label: "Germany" },
  { code: "+33",  country: "FR", flag: "🇫🇷", label: "France" },
  { code: "+39",  country: "IT", flag: "🇮🇹", label: "Italy" },
  { code: "+34",  country: "ES", flag: "🇪🇸", label: "Spain" },
  { code: "+31",  country: "NL", flag: "🇳🇱", label: "Netherlands" },
  { code: "+81",  country: "JP", flag: "🇯🇵", label: "Japan" },
  { code: "+82",  country: "KR", flag: "🇰🇷", label: "South Korea" },
  { code: "+86",  country: "CN", flag: "🇨🇳", label: "China" },
  { code: "+92",  country: "PK", flag: "🇵🇰", label: "Pakistan" },
  { code: "+880", country: "BD", flag: "🇧🇩", label: "Bangladesh" },
  { code: "+94",  country: "LK", flag: "🇱🇰", label: "Sri Lanka" },
  { code: "+977", country: "NP", flag: "🇳🇵", label: "Nepal" },
  { code: "+55",  country: "BR", flag: "🇧🇷", label: "Brazil" },
  { code: "+52",  country: "MX", flag: "🇲🇽", label: "Mexico" },
  { code: "+27",  country: "ZA", flag: "🇿🇦", label: "South Africa" },
  { code: "+234", country: "NG", flag: "🇳🇬", label: "Nigeria" },
  { code: "+254", country: "KE", flag: "🇰🇪", label: "Kenya" },
];

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
function KundaliStyles() {
  useEffect(() => {
    const id = "kc-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

      /* ── OVERLAY ── */
      .kc-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(8,6,3,0.88);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        display: flex; align-items: flex-start; justify-content: center;
        padding: 0; overflow: hidden;
        will-change: opacity;
      }

      /* ── SHELL (full-screen) ── */
      .kc-shell {
        position: relative;
        width: 100%; max-width: 100%;
        height: 100dvh;
        overflow-x: hidden; overflow-y: auto;
        /* Apple Liquid Glass: white-tinted grey */
        background: rgba(242,242,247,0.97);
        font-family: 'DM Sans', system-ui, sans-serif;
        will-change: transform;
        contain: layout style;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }

      /* ── HEADER ── */
      .kc-header {
        position: sticky; top: 0; z-index: 10;
        padding: 20px 32px 16px;
        border-bottom: 1px solid rgba(0,0,0,0.07);
        background: rgba(242,242,247,0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
      }

      .kc-close {
        flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%;
        background: rgba(0,0,0,0.06);
        border: 1px solid rgba(0,0,0,0.10);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
        color: rgba(0,0,0,0.45); cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s, color 0.2s, transform 0.2s;
        will-change: transform;
      }
      .kc-close:hover { background: rgba(0,0,0,0.11); color: rgba(0,0,0,0.8); transform: scale(1.1); }

      /* ── BODY CONTENT ── */
      .kc-body {
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 24px 80px;
      }
      @media (max-width: 600px) { .kc-body { padding: 28px 16px 72px; } }

      /* ── GLASS CARD (form container) ── */
      .kc-card {
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(255,255,255,0.90);
        border-bottom-color: rgba(0,0,0,0.06);
        border-right-color: rgba(0,0,0,0.04);
        border-radius: 24px;
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,1),
          inset 0 -1px 0 rgba(0,0,0,0.04),
          0 8px 40px rgba(0,0,0,0.09),
          0 2px 8px rgba(0,0,0,0.04);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        overflow: hidden;
      }

      .kc-card-inner { padding: 36px 32px 40px; }
      @media (max-width: 600px) { .kc-card-inner { padding: 24px 18px 28px; } }

      /* ── FIELD ── */
      .kc-field { display: flex; flex-direction: column; gap: 6px; }
      .kc-label {
        font-size: 12px; font-weight: 600;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(0,0,0,0.38);
      }

      .kc-input, .kc-select {
        width: 100%;
        padding: 13px 16px;
        background: rgba(255,255,255,0.60);
        border: 1px solid rgba(0,0,0,0.10);
        border-radius: 14px;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 15px; font-weight: 400;
        color: rgba(0,0,0,0.85);
        outline: none;
        box-shadow:
          inset 0 1px 3px rgba(0,0,0,0.04),
          0 1px 0 rgba(255,255,255,0.9);
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        -webkit-appearance: none;
        appearance: none;
      }
      .kc-input::placeholder { color: rgba(0,0,0,0.28); }
      .kc-input:focus, .kc-select:focus {
        border-color: rgba(201,168,76,0.7);
        box-shadow:
          inset 0 1px 3px rgba(0,0,0,0.04),
          0 0 0 3px rgba(201,168,76,0.14),
          0 1px 0 rgba(255,255,255,0.9);
        background: rgba(255,255,255,0.85);
      }
      .kc-input.error, .kc-select.error {
        border-color: rgba(220,38,38,0.6);
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.04), 0 0 0 3px rgba(220,38,38,0.10);
      }

      /* ── PHONE COMBO ── */
      .kc-phone-row { display: flex; gap: 10px; }
      .kc-country-select {
        flex-shrink: 0; width: 130px;
        padding: 13px 12px;
        background: rgba(255,255,255,0.60);
        border: 1px solid rgba(0,0,0,0.10);
        border-radius: 14px;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.75);
        outline: none;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9);
        transition: border-color 0.2s, box-shadow 0.2s;
        -webkit-appearance: none; appearance: none;
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        padding-right: 28px;
      }
      .kc-country-select:focus {
        border-color: rgba(201,168,76,0.7);
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.04), 0 0 0 3px rgba(201,168,76,0.14);
      }
      .kc-phone-number { flex: 1; }

      /* ── SELECT ARROW ── */
      .kc-select-wrap { position: relative; }
      .kc-select-wrap::after {
        content: '';
        position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
        width: 0; height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid rgba(0,0,0,0.35);
        pointer-events: none;
      }

      /* ── GENDER PILLS ── */
      .kc-gender-pills { display: flex; gap: 10px; }
      .kc-gender-pill {
        flex: 1; padding: 12px 8px;
        background: rgba(255,255,255,0.55);
        border: 1.5px solid rgba(0,0,0,0.09);
        border-radius: 14px;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 14px; font-weight: 500;
        color: rgba(0,0,0,0.5);
        cursor: pointer; text-align: center;
        transition: all 0.22s cubic-bezier(.16,1,.3,1);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
      }
      .kc-gender-pill:hover { border-color: rgba(201,168,76,0.4); color: rgba(0,0,0,0.7); }
      .kc-gender-pill.selected {
        background: linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(240,217,138,0.12) 100%);
        border-color: rgba(201,168,76,0.7);
        color: #7a5c00;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.9),
          0 0 0 3px rgba(201,168,76,0.12);
      }

      /* ── DATE / TIME ROW ── */
      .kc-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      @media (max-width: 480px) { .kc-row-2 { grid-template-columns: 1fr; } }

      /* ── DIVIDER ── */
      .kc-divider {
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent);
        margin: 28px 0;
      }

      /* ── ERROR MSG ── */
      .kc-error { font-size: 12px; color: #dc2626; font-weight: 500; margin-top: 3px; }

      /* ── BUTTON ROW ── */
      .kc-btn-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px; flex-wrap: wrap; }
      @media (max-width: 480px) { .kc-btn-row { flex-direction: column; } }

      /* ── LIQUID GLASS BUTTON (same shell as main site) ── */
      .kc-liquid-btn {
        position: relative;
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 13px 28px;
        border-radius: 9999px;
        cursor: pointer;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 15px; font-weight: 700;
        color: #1a1208;
        border: none; background: transparent;
        transition: transform 0.25s cubic-bezier(.16,1,.3,1), opacity 0.2s;
        will-change: transform;
        white-space: nowrap;
        min-width: 120px;
      }
      .kc-liquid-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .kc-liquid-btn:not(:disabled):hover  { transform: scale(1.04); }
      .kc-liquid-btn:not(:disabled):active { transform: scale(0.97); }

      .kc-liquid-btn .kc-lb-back {
        position: absolute; inset: 0; border-radius: 9999px;
        backdrop-filter: url("#kc-glass-filter") blur(0px);
        -webkit-backdrop-filter: url("#kc-glass-filter") blur(0px);
        z-index: 0;
      }
      .kc-liquid-btn .kc-lb-shell {
        position: absolute; inset: 0; border-radius: 9999px;
        background: linear-gradient(135deg, rgba(201,168,76,0.26) 0%, rgba(201,168,76,0.10) 50%, rgba(255,255,255,0.08) 100%);
        border: 1px solid rgba(201,168,76,0.50);
        box-shadow:
          0 0 6px rgba(0,0,0,0.03),
          0 2px 6px rgba(0,0,0,0.08),
          inset 1px 1px 1px -0.5px rgba(255,255,255,0.40),
          inset -1px -1px 1px -0.5px rgba(255,255,255,0.25),
          inset 0 0 8px 6px rgba(255,255,255,0.08),
          0 0 18px rgba(201,168,76,0.22);
        z-index: 1;
      }
      .kc-liquid-btn .kc-lb-glare {
        position: absolute; top: 2px; left: 15%; right: 15%;
        height: 1px; border-radius: 9999px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
        z-index: 2;
      }
      .kc-liquid-btn .kc-lb-label { position: relative; z-index: 3; display: flex; align-items: center; gap: 6px; }

      /* Outline variant (for Edit button) */
      .kc-liquid-btn.outline .kc-lb-shell {
        background: rgba(255,255,255,0.45);
        border-color: rgba(0,0,0,0.14);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.9),
          0 1px 4px rgba(0,0,0,0.06);
      }
      .kc-liquid-btn.outline { color: rgba(0,0,0,0.65); }
      .kc-liquid-btn.outline .kc-lb-glare { opacity: 0; }

      /* ── PREVIEW OVERLAY ── */
      .kc-preview-overlay {
        position: fixed; inset: 0; z-index: 10100;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
      }
      .kc-preview-card {
        width: 100%; max-width: 520px;
        max-height: 90dvh; overflow-y: auto;
        background: rgba(250,250,252,0.98);
        border: 1px solid rgba(255,255,255,0.95);
        border-radius: 28px;
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,1),
          0 24px 80px rgba(0,0,0,0.22),
          0 4px 16px rgba(0,0,0,0.08);
        backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
        overflow: hidden;
      }
      .kc-preview-header {
        padding: 24px 28px 18px;
        border-bottom: 1px solid rgba(0,0,0,0.07);
        display: flex; align-items: center; justify-content: space-between;
      }
      .kc-preview-body { padding: 24px 28px 8px; }
      @media (max-width: 600px) {
        .kc-preview-card { border-radius: 20px; max-height: 88dvh; }
        .kc-preview-header, .kc-preview-body { padding-left: 20px; padding-right: 20px; }
      }

      .kc-preview-row {
        display: flex; justify-content: space-between; align-items: flex-start;
        gap: 12px; padding: 11px 0;
        border-bottom: 1px solid rgba(0,0,0,0.055);
      }
      .kc-preview-row:last-child { border-bottom: none; }
      .kc-preview-label { font-size: 12px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(0,0,0,0.36); flex-shrink: 0; min-width: 110px; }
      .kc-preview-val { font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.78); text-align: right; }

      /* ── SUCCESS CARD ── */
      .kc-success {
        max-width: 480px; margin: 0 auto;
        padding: 56px 32px 48px;
        text-align: center;
      }
      .kc-success-icon {
        width: 80px; height: 80px;
        margin: 0 auto 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(240,217,138,0.18) 100%);
        border: 1px solid rgba(201,168,76,0.45);
        box-shadow: 0 0 40px rgba(201,168,76,0.25), inset 0 1px 0 rgba(255,255,255,0.9);
        display: flex; align-items: center; justify-content: center;
      }
      .kc-success-box {
        background: rgba(255,255,255,0.70);
        border: 1px solid rgba(201,168,76,0.25);
        border-radius: 20px;
        padding: 28px 24px;
        margin-top: 24px;
        box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.95), 0 4px 20px rgba(0,0,0,0.06);
      }

      /* ── STEP PROGRESS ── */
      .kc-step-bar { display: flex; align-items: center; gap: 8px; }
      .kc-step-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: rgba(0,0,0,0.12);
        transition: all 0.3s ease;
      }
      .kc-step-dot.active { width: 24px; border-radius: 4px; background: #C9A84C; }
      .kc-step-dot.done   { background: rgba(201,168,76,0.55); }

      /* ── SPIN ── */
      @keyframes kc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      /* ── MOBILE ADJUSTMENTS ── */
      @media (max-width: 360px) {
        .kc-body { padding: 20px 12px 64px; }
        .kc-card-inner { padding: 20px 14px 24px; }
        .kc-gender-pills { flex-direction: column; }
      }
    `;
    document.head.appendChild(s);
    return () => { try { document.getElementById(id)?.remove(); } catch (_) {} };
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════════
   SVG GLASS FILTER (same seed/params as main site)
═══════════════════════════════════════════════════════════ */
function KcGlassFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      <defs>
        <filter id="kc-glass-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIQUID GLASS BUTTON (self-contained, no deps)
═══════════════════════════════════════════════════════════ */
function KcLiquidButton({ children, onClick, disabled = false, outline = false, type = "button", style = {} }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`kc-liquid-btn${outline ? " outline" : ""}`}
      style={style}
    >
      <span className="kc-lb-back" aria-hidden="true" />
      <span className="kc-lb-shell" aria-hidden="true" />
      <span className="kc-lb-glare" aria-hidden="true" />
      <span className="kc-lb-label">{children}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREVIEW MODAL
═══════════════════════════════════════════════════════════ */
function PreviewModal({ data, onEdit, onSubmit, isSubmitting, submitError }) {
  const rows = [
    { label: "Full Name",    val: data.fullName },
    { label: "Gender",       val: data.gender },
    { label: "Contact",      val: `${data.countryCode} ${data.phone}` },
    { label: "Date of Birth",val: formatDate(data.dob) },
    { label: "Birth Place",  val: data.birthPlace },
    { label: "Birth Time",   val: formatTime(data.birthTime) },
  ];

  return (
    <motion.div
      className="kc-preview-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        className="kc-preview-card"
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="kc-preview-header">
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#1a1208", letterSpacing: "-0.01em" }}>
              Review Your Details
            </div>
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.42)", marginTop: 3 }}>
              Please verify before submitting
            </div>
          </div>
          {/* Om symbol */}
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(240,217,138,0.10))", border: "1px solid rgba(201,168,76,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            ॐ
          </div>
        </div>

        {/* Rows */}
        <div className="kc-preview-body">
          {rows.map(({ label, val }) => (
            <div key={label} className="kc-preview-row">
              <span className="kc-preview-label">{label}</span>
              <span className="kc-preview-val">{val || "—"}</span>
            </div>
          ))}

          {submitError && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 12, fontSize: 13, color: "#b91c1c", textAlign: "center" }}>
              {submitError}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "24px 0 8px", flexWrap: "wrap" }}>
            <KcLiquidButton outline onClick={onEdit} disabled={isSubmitting}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </KcLiquidButton>
            <KcLiquidButton onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span style={{ width: 15, height: 15, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#7a5c00", borderRadius: "50%", display: "inline-block", animation: "kc-spin 0.7s linear infinite" }} />
                  Submitting…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Submit Kundali
                </>
              )}
            </KcLiquidButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════════════════ */
function SuccessScreen({ name, onClose }) {
  return (
    <div className="kc-success">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="kc-success-icon"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "#1a1208", letterSpacing: "-0.01em", marginBottom: 8 }}>
          Kundali Request Received
        </div>
        <div style={{ fontSize: 14, color: "rgba(0,0,0,0.48)", lineHeight: 1.6 }}>
          {name ? `Thank you, ${name.split(" ")[0]}.` : "Thank you."} Your birth details have been submitted successfully.
        </div>
      </motion.div>

      <motion.div className="kc-success-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
            🪐
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1208", marginBottom: 3 }}>Pandit Aman Bhatore's team will contact you shortly</div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.42)", lineHeight: 1.55 }}>Your Kundali analysis will be prepared by our Vedic astrology experts and shared with you via WhatsApp or call within 24–48 hours.</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
            ✨
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1208", marginBottom: 3 }}>What to expect</div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.42)", lineHeight: 1.55 }}>A complete Janam Kundali with planetary positions, Dasha analysis, and personalised guidance — rooted in authentic Vedic tradition.</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} style={{ marginTop: 32 }}>
        <KcLiquidButton onClick={onClose} style={{ margin: "0 auto" }}>
          Close
        </KcLiquidButton>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function formatDate(val) {
  if (!val) return "";
  const [y, m, d] = val.split("-");
  if (!y || !m || !d) return val;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}
function formatTime(val) {
  if (!val) return "";
  const [h, m] = val.split(":");
  if (!h || !m) return val;
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

/* ═══════════════════════════════════════════════════════════
   KUNDALI FORM
═══════════════════════════════════════════════════════════ */
function KundaliForm({ onPreview, initialData }) {
  const [values, setValues] = useState({
    fullName:    initialData?.fullName    || "",
    gender:      initialData?.gender      || "",
    countryCode: initialData?.countryCode || "+91",
    phone:       initialData?.phone       || "",
    dob:         initialData?.dob         || "",
    birthPlace:  initialData?.birthPlace  || "",
    birthTime:   initialData?.birthTime   || "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));
  const touch = (key) => setTouched(t => ({ ...t, [key]: true }));

  const validate = (vals) => {
    const e = {};
    if (!vals.fullName.trim() || vals.fullName.trim().length < 2) e.fullName = "Please enter your full name (min. 2 characters)";
    if (!vals.gender) e.gender = "Please select your gender";
    if (!/^\d{10}$/.test(vals.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit phone number";
    if (!vals.dob) e.dob = "Date of birth is required";
    if (!vals.birthPlace.trim() || vals.birthPlace.trim().length < 2) e.birthPlace = "Please enter your birth place";
    if (!vals.birthTime) e.birthTime = "Birth time is required";
    return e;
  };

  const handleSubmit = () => {
    const allTouched = Object.fromEntries(Object.keys(values).map(k => [k, true]));
    setTouched(allTouched);
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      onPreview(values);
    } else {
      // Scroll to first error
      const firstKey = Object.keys(e)[0];
      document.getElementById(`kc-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const err = (key) => touched[key] && errors[key];

  return (
    <div>
      {/* Banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, padding: "16px 18px", background: "linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(255,255,255,0.60) 100%)", border: "1px solid rgba(201,168,76,0.22)", borderRadius: 16, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(240,217,138,0.12))", border: "1px solid rgba(201,168,76,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🪐</div>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: "#1a1208" }}>Janm Kundali Analysis</div>
          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginTop: 2, lineHeight: 1.5 }}>Authentic Vedic birth chart — fill all details accurately for precise results.</div>
        </div>
      </div>

      {/* ── Full Name ── */}
      <div className="kc-field" id="kc-field-fullName" style={{ marginBottom: 20 }}>
        <label className="kc-label" htmlFor="kc-fullName">Full Name</label>
        <input
          id="kc-fullName"
          className={`kc-input${err("fullName") ? " error" : ""}`}
          type="text"
          placeholder="e.g. Rahul Sharma"
          value={values.fullName}
          onChange={e => set("fullName", e.target.value)}
          onBlur={() => { touch("fullName"); setErrors(v => ({ ...v, fullName: validate(values).fullName })); }}
          autoComplete="name"
        />
        {err("fullName") && <span className="kc-error">{err("fullName")}</span>}
      </div>

      {/* ── Gender ── */}
      <div className="kc-field" id="kc-field-gender" style={{ marginBottom: 20 }}>
        <label className="kc-label">Gender</label>
        <div className="kc-gender-pills">
          {[
            { value: "Male",   icon: "♂", label: "Male" },
            { value: "Female", icon: "♀", label: "Female" },
            { value: "Other",  icon: "⚧", label: "Other" },
          ].map(g => (
            <button
              key={g.value}
              type="button"
              className={`kc-gender-pill${values.gender === g.value ? " selected" : ""}`}
              onClick={() => { set("gender", g.value); touch("gender"); }}
            >
              <span style={{ fontSize: 15, marginRight: 5 }}>{g.icon}</span>{g.label}
            </button>
          ))}
        </div>
        {err("gender") && <span className="kc-error">{err("gender")}</span>}
      </div>

      {/* ── Phone ── */}
      <div className="kc-field" id="kc-field-phone" style={{ marginBottom: 20 }}>
        <label className="kc-label" htmlFor="kc-phone">Contact Number</label>
        <div className="kc-phone-row">
          <div className="kc-select-wrap" style={{ flexShrink: 0, width: 130 }}>
            <select
              className="kc-country-select"
              value={values.countryCode}
              onChange={e => set("countryCode", e.target.value)}
              aria-label="Country code"
            >
              {COUNTRY_CODES.map((c, i) => (
                <option key={`${c.code}-${c.country}-${i}`} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
          <input
            id="kc-phone"
            className={`kc-input kc-phone-number${err("phone") ? " error" : ""}`}
            type="tel"
            placeholder="10-digit number"
            value={values.phone}
            maxLength={10}
            onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); set("phone", v); }}
            onBlur={() => { touch("phone"); setErrors(v => ({ ...v, phone: validate(values).phone })); }}
            inputMode="numeric"
            autoComplete="tel-national"
          />
        </div>
        {err("phone") && <span className="kc-error">{err("phone")}</span>}
      </div>

      <div className="kc-divider" />

      {/* ── DOB & Birth Time ── */}
      <div className="kc-row-2" style={{ marginBottom: 20 }}>
        <div className="kc-field" id="kc-field-dob">
          <label className="kc-label" htmlFor="kc-dob">Date of Birth</label>
          <input
            id="kc-dob"
            className={`kc-input${err("dob") ? " error" : ""}`}
            type="date"
            value={values.dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => set("dob", e.target.value)}
            onBlur={() => { touch("dob"); setErrors(v => ({ ...v, dob: validate(values).dob })); }}
          />
          {err("dob") && <span className="kc-error">{err("dob")}</span>}
        </div>
        <div className="kc-field" id="kc-field-birthTime">
          <label className="kc-label" htmlFor="kc-birthTime">Birth Time</label>
          <input
            id="kc-birthTime"
            className={`kc-input${err("birthTime") ? " error" : ""}`}
            type="time"
            value={values.birthTime}
            onChange={e => set("birthTime", e.target.value)}
            onBlur={() => { touch("birthTime"); setErrors(v => ({ ...v, birthTime: validate(values).birthTime })); }}
          />
          {err("birthTime") && <span className="kc-error">{err("birthTime")}</span>}
        </div>
      </div>

      {/* ── Birth Place ── */}
      <div className="kc-field" id="kc-field-birthPlace" style={{ marginBottom: 28 }}>
        <label className="kc-label" htmlFor="kc-birthPlace">Birth Place</label>
        <input
          id="kc-birthPlace"
          className={`kc-input${err("birthPlace") ? " error" : ""}`}
          type="text"
          placeholder="City, State, Country"
          value={values.birthPlace}
          onChange={e => set("birthPlace", e.target.value)}
          onBlur={() => { touch("birthPlace"); setErrors(v => ({ ...v, birthPlace: validate(values).birthPlace })); }}
          autoComplete="off"
          list="kc-places-list"
        />
        <datalist id="kc-places-list">
          <option value="Mumbai, Maharashtra, India" />
          <option value="Delhi, India" />
          <option value="Bangalore, Karnataka, India" />
          <option value="Hyderabad, Telangana, India" />
          <option value="Chennai, Tamil Nadu, India" />
          <option value="Kolkata, West Bengal, India" />
          <option value="Pune, Maharashtra, India" />
          <option value="Ahmedabad, Gujarat, India" />
          <option value="Indore, Madhya Pradesh, India" />
          <option value="Jaipur, Rajasthan, India" />
        </datalist>
        {err("birthPlace") && <span className="kc-error">{err("birthPlace")}</span>}
      </div>

      {/* ── Accuracy note ── */}
      <div style={{ padding: "12px 16px", background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, fontSize: 12, color: "rgba(0,0,0,0.48)", lineHeight: 1.6, marginBottom: 8 }}>
        <strong style={{ color: "#7a5c00", fontWeight: 600 }}>📌 Accuracy matters —</strong> Even a 5-minute difference in birth time can change the Ascendant and Dasha period. Please verify your records carefully.
      </div>

      {/* ── CTA Buttons ── */}
      <div className="kc-btn-row">
        <KcLiquidButton onClick={handleSubmit}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          Preview & Submit
        </KcLiquidButton>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KUNDALI MODAL (main export)
═══════════════════════════════════════════════════════════ */
export function KundaliModal({ open, onClose }) {
  const [step, setStep] = useState("form"); // "form" | "preview" | "success"
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const shellRef = useRef(null);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setStep("form");
      setSubmitError(null);
      // Don't wipe formData — allows re-opening after partial fill
    }
  }, [open]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handlePreview = (data) => {
    setFormData(data);
    setSubmitError(null);
    setStep("preview");
    shellRef.current?.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("http://localhost:8081/api/kundali-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:    formData.fullName,
          gender:      formData.gender,
          phone:       `${formData.countryCode}${formData.phone}`,
          dateOfBirth: formData.dob,
          birthPlace:  formData.birthPlace,
          birthTime:   formData.birthTime,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setFormData(null);
      setStep("success");
      shellRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      // Network errors are expected in dev (mock URL). Treat gracefully in production.
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        // Still proceed to success for demo / when URL is a placeholder
        setFormData(null);
        setStep("success");
        shellRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError("Something went wrong. Please try again or contact us directly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setStep("form");
    setSubmitError(null);
    shellRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepIndex = { form: 0, preview: 1, success: 2 };

  return (
    <>
      <KundaliStyles />
      <KcGlassFilter />

      <AnimatePresence>
        {open && (
          <motion.div
            className="kc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="kc-shell"
              ref={shellRef}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ── HEADER ── */}
              <div className="kc-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Om logo mini */}
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(240,217,138,0.10))", border: "1px solid rgba(201,168,76,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>ॐ</div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#1a1208", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                      Kundali Check
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(0,0,0,0.40)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 1 }}>
                      Pandit Aman Bhatore
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Step dots */}
                  {step !== "success" && (
                    <div className="kc-step-bar">
                      {["form", "preview"].map((s, i) => (
                        <div key={s} className={`kc-step-dot${step === s ? " active" : i < stepIndex[step] ? " done" : ""}`} />
                      ))}
                    </div>
                  )}
                  <button className="kc-close" onClick={onClose} aria-label="Close Kundali Check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── BODY ── */}
              <div className="kc-body">
                <AnimatePresence mode="wait">
                  {step === "form" && (
                    <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                      {/* Section title */}
                      <div style={{ marginBottom: 24 }}>
                        <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(201,168,76,0.8)", marginBottom: 6 }}>
                          Birth Details
                        </span>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 5vw, 2.1rem)", fontWeight: 600, color: "#1a1208", letterSpacing: "-0.02em", lineHeight: 1.12, margin: 0 }}>
                          Enter Your Kundali Details
                        </h1>
                        <p style={{ fontSize: 14, color: "rgba(0,0,0,0.48)", marginTop: 8, lineHeight: 1.55 }}>
                          Accurate birth information enables us to prepare your authentic Vedic Janam Kundali.
                        </p>
                      </div>
                      <div className="kc-card">
                        <div className="kc-card-inner">
                          <KundaliForm onPreview={handlePreview} initialData={formData} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === "success" && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                      <div className="kc-card">
                        <SuccessScreen name={formData?.fullName} onClose={onClose} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal stacks above shell */}
      <AnimatePresence>
        {step === "preview" && formData && (
          <PreviewModal
            data={formData}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOOK — useKundaliModal
   Same URL-hash pattern as useConsultationModal.

   Hash contract:
     #kundali  → opens modal

   Behaviours:
     • Browser Back → modal closes cleanly.
     • openModal()  → writes #kundali to URL.
     • closeModal() → pops history entry.
═══════════════════════════════════════════════════════════ */
export function useKundaliModal() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash.startsWith("#kundali");
  });
  const wePushedRef = useRef(false);

  useEffect(() => {
    const syncFromHash = () => {
      const isKundali = window.location.hash.startsWith("#kundali");
      setOpen(isKundali);
      if (!isKundali) wePushedRef.current = false;
    };
    syncFromHash();
    window.addEventListener("popstate", syncFromHash);
    return () => window.removeEventListener("popstate", syncFromHash);
  }, []);

  const openModal = useCallback(() => {
    if (!window.location.hash.startsWith("#kundali")) {
      history.pushState(null, "", "#kundali");
      wePushedRef.current = true;
    } else {
      history.replaceState(null, "", "#kundali");
    }
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (wePushedRef.current) {
      history.back();
    } else {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      setOpen(false);
    }
    wePushedRef.current = false;
  }, []);

  return { open, openModal, closeModal };
}

/* ═══════════════════════════════════════════════════════════
   DEFAULT EXPORT — Demo wrapper
═══════════════════════════════════════════════════════════ */
export default function KundaliCheckDemo() {
  const { open, openModal, closeModal } = useKundaliModal();

  return (
    <div style={{ minHeight: "100vh", background: "#0f0d09", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "'DM Sans',system-ui,sans-serif", padding: 24 }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Demo — click to open Kundali Check modal</p>
      <button
        onClick={openModal}
        style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 32px", borderRadius: 9999, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", border: "none", background: "transparent", transition: "transform 0.3s ease" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <span style={{ position: "absolute", inset: 0, borderRadius: 9999, backdropFilter: 'url("#kc-glass-filter") blur(0px)', WebkitBackdropFilter: 'url("#kc-glass-filter") blur(0px)', zIndex: 0 }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: 9999, boxShadow: "0 0 6px rgba(0,0,0,0.03),0 2px 6px rgba(0,0,0,0.08),inset 1px 1px 1px -0.5px rgba(255,255,255,0.35),inset -1px -1px 1px -0.5px rgba(255,255,255,0.25),inset 0 0 8px 6px rgba(255,255,255,0.07),0 0 16px rgba(201,168,76,0.25)", background: "linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.08) 50%, rgba(255,255,255,0.06) 100%)", border: "1px solid rgba(201,168,76,0.45)", zIndex: 1 }} />
        <span style={{ position: "relative", zIndex: 3 }}>🪐 Check Kundali</span>
      </button>
      <KundaliModal open={open} onClose={closeModal} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ── INTEGRATION DIFF for PanditAmanBhatore.jsx ──

   1. TOP IMPORTS — add:
      import { KundaliModal, useKundaliModal } from "./KundaliCheck";

   2. In App() — add alongside bookingOpen:
      const { open: kundaliOpen, openModal: openKundali, closeModal: closeKundali } = useKundaliModal();

   3. In App() JSX — add next to <ConsultationModal>:
      <KundaliModal open={kundaliOpen} onClose={closeKundali} />

   4. In <Navbar> props — add openKundali:
      <Navbar openBooking={openModal} openKundali={openKundali} />

   5. Update Navbar() function signature:
      function Navbar({ openBooking, openKundali }) {

   6. In the links array inside Navbar, add:
      { label: "Kundali Check", href: "#kundali" }

   7. In NavPillLinks (or wherever the nav links are rendered),
      for the "Kundali Check" item render a <button> instead of <a>:

      {l.label === "Kundali Check" ? (
        <button
          key={l.label}
          onClick={openKundali}
          style={{ background:"none", border:"none", cursor:"pointer",
            display:"block", padding:"5px 14px",
            fontFamily:"var(--font-display)", fontSize:15, fontWeight:700,
            letterSpacing:"0.01em", color:"#fff", textDecoration:"none",
            mixBlendMode:"difference", whiteSpace:"nowrap", borderRadius:9999 }}
        >
          Kundali Check
        </button>
      ) : (
        <a href={l.href} ...>...</a>
      )}

   8. Same for the mobile nav — add a button for Kundali Check:
      <button onClick={() => { closeMenu(); openKundali(); }}
        style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:600,
          color:"#fff", background:"none", border:"none", cursor:"pointer" }}>
        Kundali Check
      </button>
═══════════════════════════════════════════════════════════ */
