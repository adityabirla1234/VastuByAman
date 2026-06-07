/**
 * ConsultationBooking.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium consultation booking system for Pandit Aman Bhatore.
 *
 * HOW TO INTEGRATE:
 *   1. npm install framer-motion react-hook-form zod @hookform/resolvers
 *      react-phone-input-2
 *   2. Import & add <ConsultationModal> anywhere in PanditAmanBhatore.jsx
 *   3. Replace LiquidButton hrefs (e.g. href="#contact") with
 *      onClick={() => setBookingOpen(true)}
 *
 * USAGE EXAMPLE (inside App() or CTA / Navbar / Hero component):
 *   const [bookingOpen, setBookingOpen] = useState(false);
 *   ...
 *   <ConsultationModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
 *   <button onClick={() => setBookingOpen(true)}>Book Now</button>
 *
 * The component is fully self-contained — styles, validation, uploads, preview.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/* ─── phone input (CDN / npm: react-phone-input-2) ─── */
/* If not installed, a fallback <PhoneFallback> is used. */
let PhoneInput = null;
try {
  PhoneInput = require("react-phone-input-2").default;
} catch (_) {}

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#F0D98A";
const GOLD_DARK = "#8B6914";
const BG_DARK = "#0f0d09";
const BG_CARD = "rgba(255,255,255,0.04)";
const BORDER_GOLD = "rgba(201,168,76,0.25)";

/* ── Contact config — serve this from an env-var at build time in production.
   Never commit a real phone number directly in source; bots harvest them within
   hours. In Create React App: REACT_APP_WHATSAPP_NUMBER=91XXXXXXXXXX
   In Vite: VITE_WHATSAPP_NUMBER=91XXXXXXXXXX ── */
const WHATSAPP_NUMBER =
  (typeof import_meta_env !== "undefined" && import_meta_env?.VITE_WHATSAPP_NUMBER) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_WHATSAPP_NUMBER) ||
  "917049001004";

const ACCEPTED_IMAGE = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPTED_DOC   = [...ACCEPTED_IMAGE, "application/pdf"];
const MAX_SIZE_MB     = 10;
const MAX_SIZE_BYTES  = MAX_SIZE_MB * 1024 * 1024;

/* ═══════════════════════════════════════════════════════════
   ZOD SCHEMAS
═══════════════════════════════════════════════════════════ */
const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

const fileSchema = (accept, label) =>
  z.any().refine((f) => f instanceof File, { message: `${label} is required` })
    .refine((f) => accept.includes(f?.type?.toLowerCase()) || accept.some(a => f?.name?.toLowerCase().endsWith(a.split("/")[1])),
      { message: "Unsupported file format" })
    .refine((f) => f?.size <= MAX_SIZE_BYTES, { message: `File must be under ${MAX_SIZE_MB}MB` });

const onlineSchema = z.object({
  fullName:      z.string().trim().min(2, "Please enter your full name").max(100, "Name must be under 100 characters"),
  address:       z.string().trim().min(5, "Please enter your current address").max(500, "Address must be under 500 characters"),
  phone:         z.string().regex(phoneRegex, "Valid phone number required"),
  profession:    z.string().trim().min(2, "Please enter your profession").max(100, "Profession must be under 100 characters"),
  degreePhoto:   fileSchema(ACCEPTED_IMAGE, "House Degree Photo"),
  map2D:         fileSchema(ACCEPTED_DOC, "2D Map"),
});

const offlineSchema = z.object({
  fullName:      z.string().trim().min(2, "Please enter your full name").max(100, "Name must be under 100 characters"),
  phone:         z.string().regex(phoneRegex, "Valid phone number required"),
  address:       z.string().trim().min(5, "Please enter your current address").max(500, "Address must be under 500 characters"),
  profession:    z.string().trim().min(2, "Please enter your profession").max(100, "Profession must be under 100 characters"),
  siteFront:     fileSchema(ACCEPTED_IMAGE, "Front Site Photo"),
});

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES (injected once)
═══════════════════════════════════════════════════════════ */
function BookingStyles() {
  useEffect(() => {
    const id = "cb-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

      .cb-overlay{
        position:fixed;inset:0;z-index:9999;
        background:rgba(8,6,3,0.85);
        backdrop-filter:blur(20px);
        -webkit-backdrop-filter:blur(20px);
        display:flex;align-items:flex-start;justify-content:center;
        padding:0;
        overflow:hidden;
        will-change:opacity;
      }

      .cb-shell{
        position:relative;
        width:100%;max-width:100%;
        height:100dvh;
        overflow-x:hidden;
        overflow-y:auto;
        background:rgba(248,246,243,0.97);
        font-family:'DM Sans',system-ui,sans-serif;
        will-change:transform;
        contain:layout style;
        -webkit-overflow-scrolling:touch;
        overscroll-behavior:contain;
      }

      /* ── HEADER BAND ── */
      .cb-header{
        position:sticky;top:0;z-index:10;
        padding:24px 36px 20px;
        border-bottom:1px solid rgba(0,0,0,0.08);
        background:rgba(248,246,243,0.95);
        backdrop-filter:blur(16px);
        -webkit-backdrop-filter:blur(16px);
        display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
        will-change:transform;
      }
      .cb-close{
        flex-shrink:0;width:36px;height:36px;border-radius:50%;
        background:rgba(0,0,0,0.06);
        border:1px solid rgba(0,0,0,0.12);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.8);
        color:rgba(0,0,0,0.5);cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        transition:background .2s,color .2s,transform .2s;
        margin-top:4px;
        will-change:transform;
      }
      .cb-close:hover{background:rgba(0,0,0,0.12);color:rgba(0,0,0,0.85);transform:scale(1.1)}

      /* ── TYPE SELECTION ── */
      .cb-type-grid{
        display:grid;grid-template-columns:1fr 1fr;gap:20px;
        padding:36px;
      }
      @media(max-width:600px){ .cb-type-grid{grid-template-columns:1fr;padding:20px} }

      .cb-type-card{
        position:relative;padding:32px 28px;border-radius:24px;
        background:rgba(255,255,255,0.06);
        border:1px solid rgba(255,255,255,0.14);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.22),
          inset 0 -1px 0 rgba(0,0,0,0.12),
          0 8px 32px rgba(0,0,0,0.28);
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
        cursor:pointer;
        transition:border-color .3s,transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s;
        overflow:hidden;
        text-align:left;
        display:flex;flex-direction:column;gap:16px;
        will-change:transform;
      }
      .cb-type-card::before{
        content:'';position:absolute;inset:0;
        background:radial-gradient(ellipse 80% 80% at 30% 20%,rgba(255,255,255,0.07) 0%,transparent 60%);
        opacity:0;transition:opacity .4s;pointer-events:none;
        border-radius:24px;
      }
      .cb-type-card:hover{
        border-color:rgba(201,168,76,0.45);
        transform:translateY(-6px);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.28),
          inset 0 -1px 0 rgba(0,0,0,0.10),
          0 24px 60px rgba(0,0,0,0.4),
          0 0 40px rgba(201,168,76,0.10),
          0 0 0 1px rgba(201,168,76,0.12);
      }
      .cb-type-card:hover::before{opacity:1}

      .cb-type-icon{
        width:64px;height:64px;border-radius:18px;
        background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);
        display:flex;align-items:center;justify-content:center;
        color:#C9A84C;flex-shrink:0;
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);
        transition:background .3s,transform .3s;
      }
      .cb-type-card:hover .cb-type-icon{background:rgba(201,168,76,0.18);transform:scale(1.08)}

      .cb-badge{
        position:absolute;top:16px;right:16px;
        padding:4px 12px;border-radius:9999px;
        background:linear-gradient(135deg,#C9A84C,#8B6914);
        font-size:11px;font-weight:600;letter-spacing:0.08em;
        color:#0d0906;text-transform:uppercase;
      }

      /* ── FORM ── */
      .cb-form-wrap{padding:0 36px 36px}
      @media(max-width:600px){.cb-form-wrap{padding:0 20px 20px}}

      .cb-form{display:flex;flex-direction:column;gap:20px}

      .cb-field{display:flex;flex-direction:column;gap:6px}
      .cb-field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      @media(max-width:600px){.cb-field-row{grid-template-columns:1fr}}

      .cb-label{
        font-size:12px;font-weight:600;letter-spacing:0.1em;
        text-transform:uppercase;color:rgba(139,105,20,0.85);
      }
      .cb-label span{color:rgba(200,40,40,0.8);margin-left:2px}

      .cb-input{
        width:100%;padding:14px 18px;
        background:rgba(255,255,255,0.88);
        border:1px solid rgba(0,0,0,0.12);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.9),0 1px 3px rgba(0,0,0,0.06);
        border-radius:14px;color:#1a1208;
        font-family:'DM Sans',system-ui,sans-serif;
        font-size:15px;outline:none;
        transition:border-color .25s,box-shadow .25s,background .25s;
        -webkit-appearance:none;
      }
      .cb-input::placeholder{color:rgba(0,0,0,0.30)}
      .cb-input:focus{
        border-color:rgba(201,168,76,0.65);
        background:linear-gradient(135deg,rgba(255,255,255,0.90) 0%,rgba(255,250,235,0.75) 100%);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.95),0 0 0 3px rgba(201,168,76,0.15),0 4px 16px rgba(0,0,0,0.08);
      }
      .cb-input.valid{border-color:rgba(40,170,80,0.55);box-shadow:inset 0 1px 0 rgba(255,255,255,0.9),0 0 0 3px rgba(40,170,80,0.10)}
      .cb-input.invalid{border-color:rgba(220,50,50,0.55);box-shadow:inset 0 1px 0 rgba(255,255,255,0.9),0 0 0 3px rgba(220,50,50,0.10);animation:cb-shake .4s ease}
      @keyframes cb-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}

      .cb-textarea{resize:vertical;min-height:80px}

      .cb-error{
        display:flex;align-items:center;gap:6px;
        font-size:12px;color:rgba(255,110,110,0.9);
        animation:cb-fade-in .25s ease;
      }
      @keyframes cb-fade-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

      .cb-success-tick{
        position:absolute;right:14px;top:50%;transform:translateY(-50%);
        color:rgba(80,200,120,0.9);pointer-events:none;
      }

      /* ── PHONE ── */
      .cb-phone-wrap .react-tel-input .form-control{
        width:100%!important;padding:14px 18px 14px 54px!important;
        background:rgba(255,255,255,0.04)!important;
        border:1px solid rgba(201,168,76,0.2)!important;
        border-radius:12px!important;color:#1a1208!important;
        font-family:'DM Sans',system-ui,sans-serif!important;
        font-size:15px!important;height:auto!important;
        transition:border-color .25s,box-shadow .25s!important;
      }
      .cb-phone-wrap .react-tel-input .form-control:focus{
        border-color:rgba(201,168,76,0.65)!important;
        box-shadow:0 0 0 3px rgba(201,168,76,0.1)!important;
      }
      .cb-phone-wrap .react-tel-input .flag-dropdown{
        background:rgba(255,255,255,0.05)!important;
        border:1px solid rgba(201,168,76,0.2)!important;
        border-radius:12px 0 0 12px!important;
      }
      .cb-phone-wrap .react-tel-input .selected-flag:hover,
      .cb-phone-wrap .react-tel-input .selected-flag:focus,
      .cb-phone-wrap .react-tel-input .flag-dropdown.open .selected-flag{
        background:rgba(201,168,76,0.1)!important;
      }
      .cb-phone-wrap .react-tel-input .country-list{
        background:#f5f3ef!important;border:1px solid rgba(201,168,76,0.2)!important;
        border-radius:12px!important;margin-top:4px!important;
        box-shadow:0 20px 60px rgba(0,0,0,0.7)!important;
      }
      .cb-phone-wrap .react-tel-input .country-list .country:hover,
      .cb-phone-wrap .react-tel-input .country-list .country.highlight{
        background:rgba(201,168,76,0.12)!important;
      }
      .cb-phone-wrap .react-tel-input .country-list .country-name,
      .cb-phone-wrap .react-tel-input .country-list .dial-code{
        color:#e0d8cc!important;
      }
      .cb-phone-wrap.valid .react-tel-input .form-control{border-color:rgba(80,200,120,0.5)!important;box-shadow:0 0 0 3px rgba(80,200,120,0.08)!important}
      .cb-phone-wrap.invalid .react-tel-input .form-control{border-color:rgba(255,80,80,0.5)!important;box-shadow:0 0 0 3px rgba(255,80,80,0.08)!important}

      /* ── FILE UPLOAD ── */
      .cb-upload-zone{
        border:1.5px dashed rgba(201,168,76,0.4);border-radius:14px;
        padding:28px 20px;text-align:center;cursor:pointer;
        background:rgba(201,168,76,0.04);
        transition:border-color .25s,background .25s,transform .2s;
        position:relative;overflow:hidden;
      }
      .cb-upload-zone:hover,.cb-upload-zone.drag{
        border-color:rgba(201,168,76,0.65);
        background:rgba(201,168,76,0.08);
        transform:scale(1.01);
      }
      .cb-upload-zone.valid{border-color:rgba(40,170,80,0.5);border-style:solid;background:rgba(40,170,80,0.05)}
      .cb-upload-zone.invalid{border-color:rgba(220,50,50,0.5);border-style:solid;background:rgba(220,50,50,0.04)}

      .cb-upload-preview{
        display:flex;align-items:center;gap:12px;
        background:rgba(255,255,255,0.7);border-radius:10px;
        padding:12px 14px;margin-top:10px;
        border:1px solid rgba(201,168,76,0.2);
        animation:cb-fade-in .3s ease;
      }
      .cb-upload-img-thumb{
        width:48px;height:48px;border-radius:8px;object-fit:cover;
        border:1px solid rgba(201,168,76,0.2);flex-shrink:0;
      }

      /* ── STEP PROGRESS ── */
      .cb-steps{
        display:flex;align-items:center;gap:0;
        padding:0 36px 24px;
      }
      @media(max-width:600px){.cb-steps{padding:0 20px 20px}}
      .cb-step-item{display:flex;align-items:center;gap:8px;flex:1}
      .cb-step-circle{
        width:28px;height:28px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:12px;font-weight:700;flex-shrink:0;
        transition:background .3s,border-color .3s,color .3s;
      }
      .cb-step-line{flex:1;height:1px;background:rgba(0,0,0,0.15);transition:background .3s}
      .cb-step-line.active{background:rgba(201,168,76,0.7)}

      /* ── SUBMIT BTN (Liquid Glass) ── */
      .cb-submit{
        width:100%;padding:16px 24px;border-radius:9999px;
        font-family:'DM Sans',system-ui,sans-serif;
        font-size:16px;font-weight:700;letter-spacing:0.02em;
        cursor:pointer;border:none;
        transition:opacity .3s,transform .2s,box-shadow .3s;
        position:relative;overflow:hidden;
      }
      .cb-submit:disabled{
        opacity:0.38;cursor:not-allowed;
        background:rgba(0,0,0,0.06);color:rgba(0,0,0,0.28);
        box-shadow:none;border:1px solid rgba(0,0,0,0.10);
      }
      .cb-submit:not(:disabled){
        background:linear-gradient(135deg,rgba(201,168,76,0.30) 0%,rgba(201,168,76,0.14) 50%,rgba(255,255,255,0.08) 100%);
        border:1px solid rgba(201,168,76,0.48);
        color:#1a1208;
        box-shadow:
          0 8px 32px rgba(201,168,76,0.22),
          inset 0 1px 0 rgba(255,255,255,0.32),
          inset 0 -1px 0 rgba(0,0,0,0.12);
        will-change:transform;
      }
      .cb-submit:not(:disabled)::before{
        content:'';position:absolute;top:2px;left:15%;right:15%;height:1px;border-radius:9999px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent);
        pointer-events:none;
      }
      .cb-submit:not(:disabled):hover{
        transform:translateY(-2px) scale(1.01);
        box-shadow:
          0 14px 44px rgba(201,168,76,0.32),
          inset 0 1px 0 rgba(255,255,255,0.38),
          inset 0 0 20px 6px rgba(255,255,255,0.05);
        border-color:rgba(201,168,76,0.65);
      }
      .cb-submit:not(:disabled):active{transform:translateY(0) scale(0.98)}

      /* ── PREVIEW MODAL ── */
      .cb-preview-overlay{
        position:fixed;inset:0;z-index:10001;
        background:rgba(8,6,3,0.80);
        backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
        display:flex;align-items:flex-start;justify-content:center;
        padding:0;overflow:hidden;
        will-change:opacity;
      }
      .cb-preview-shell{
        width:100%;max-width:100%;
        height:100dvh;
        overflow-y:auto;overflow-x:hidden;
        background:rgba(250,248,244,0.98);
        padding:36px;
        font-family:'DM Sans',system-ui,sans-serif;
        -webkit-overflow-scrolling:touch;
        overscroll-behavior:contain;
      }
      .cb-preview-row{
        display:flex;justify-content:space-between;align-items:flex-start;
        padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.07);
        gap:16px;
      }
      .cb-preview-label{font-size:12px;color:rgba(139,105,20,0.80);text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap}
      .cb-preview-value{font-size:14px;color:#1a1208;text-align:right;word-break:break-word}

      /* ── SUCCESS ── */
      .cb-success{
        padding:60px 36px;text-align:center;
        display:flex;flex-direction:column;align-items:center;gap:16px;
      }
      .cb-success-ring{
        width:88px;height:88px;border-radius:50%;
        background:rgba(80,200,120,0.1);
        border:2px solid rgba(80,200,120,0.4);
        display:flex;align-items:center;justify-content:center;
        animation:cb-success-pop .5s cubic-bezier(.16,1,.3,1);
      }
      @keyframes cb-success-pop{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}

      /* Scrollbar inside modal */
      .cb-shell::-webkit-scrollbar,.cb-preview-shell::-webkit-scrollbar{width:4px}
      .cb-shell::-webkit-scrollbar-thumb,.cb-preview-shell::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.4);border-radius:2px}

      /* Gold divider */
      .cb-gold-divider{
        height:1px;
        background:linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent);
        margin:4px 0;
      }

      /* ── DESKTOP CONTENT CENTERING ──
         Shell is full-screen on all devices.
         On wide screens, constrain content width
         so it doesn't stretch uncomfortably. */
      @media(min-width:900px){
        .cb-header{ padding:28px calc((100% - 860px)/2 + 0px) 24px }
        .cb-steps{ padding-left:calc((100% - 860px)/2);padding-right:calc((100% - 860px)/2) }
        .cb-type-grid{ max-width:860px;margin:0 auto }
        .cb-form-wrap{ max-width:860px;margin:0 auto }
        .cb-success{ max-width:860px;margin:0 auto }
      }

      /* ── MOBILE PADDING TIGHTENING (≤600px) ── */
      @media(max-width:600px){
        .cb-header{ padding:18px 20px 16px }
        .cb-steps{ padding:0 16px 16px }
      }
    `;
    document.head.appendChild(s);
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════════
   SMALL REUSABLE UI
═══════════════════════════════════════════════════════════ */
const GoldDivider = () => <div className="cb-gold-divider" />;

function OmDiamond() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 1L19 10L10 19L1 10Z" stroke={GOLD} strokeWidth="1" fill="rgba(201,168,76,0.08)" />
      <text x="10" y="13.5" textAnchor="middle" fill={GOLD} fontSize="9" fontFamily="serif">ॐ</text>
    </svg>
  );
}

function SectionHeader({ step, title, subtitle }) {
  return (
    <div style={{ padding: "28px 36px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <OmDiamond />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)" }}>
          {step}
        </span>
      </div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "clamp(1.5rem, 4vw, 2rem)",
        fontWeight: 700, color: "#1a1208", lineHeight: 1.2, marginBottom: 8,
      }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: "rgba(26,18,8,0.55)", lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className="cb-error">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {msg}
    </div>
  );
}

function SuccessTick() {
  return (
    <span className="cb-success-tick">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(80,200,120,0.9)" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   FIELD WRAPPER
═══════════════════════════════════════════════════════════ */
function Field({ label, error, isValid, children, required = true }) {
  return (
    <div className="cb-field">
      <label className="cb-label">{label}{required && <span>*</span>}</label>
      <div style={{ position: "relative" }}>
        {children}
        {isValid && !error && <SuccessTick />}
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHONE FIELD
═══════════════════════════════════════════════════════════ */
function PhoneField({ value, onChange, error, isValid }) {
  const cls = `cb-phone-wrap${isValid && !error ? " valid" : ""}${error ? " invalid" : ""}`;

  /* Always use the built-in approach — reliable on all devices including laptop keyboards.
     react-phone-input-2 is kept as an enhancement if installed. */
  if (PhoneInput) {
    return (
      <div className={cls}>
        <PhoneInput
          country="in"
          value={value.replace(/^\+/, "")}
          onChange={(phone) => onChange("+" + phone)}
          enableSearch
          inputProps={{ maxLength: 17 }}
          preferredCountries={["in", "us", "gb", "ae", "ca", "au"]}
        />
      </div>
    );
  }

  /* Robust fallback — works with laptop numpad, number keys, paste, etc. */
  const countryOptions = [
    { code: "+91",  label: "🇮🇳 +91" },
    { code: "+1",   label: "🇺🇸 +1" },
    { code: "+44",  label: "🇬🇧 +44" },
    { code: "+971", label: "🇦🇪 +971" },
    { code: "+61",  label: "🇦🇺 +61" },
  ];

  /* Derive selected country prefix and local number from current value */
  const matchedPrefix = countryOptions
    .sort((a, b) => b.code.length - a.code.length)
    .find(c => value.startsWith(c.code))?.code || "+91";
  const localNumber = value.startsWith(matchedPrefix)
    ? value.slice(matchedPrefix.length).replace(/^\s/, "")
    : value.replace(/^\+\d{1,4}/, "").replace(/^\s/, "");

  const handleCountryChange = (e) => {
    onChange(e.target.value + localNumber);
  };

  const handleNumberInput = (e) => {
    /* Accept digits typed from any key (number row, numpad, paste) */
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 12);
    onChange(matchedPrefix + digitsOnly);
  };

  const inputClass = `cb-input${isValid && !error ? " valid" : ""}${error ? " invalid" : ""}`;

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select
        value={matchedPrefix}
        onChange={handleCountryChange}
        style={{
          padding: "14px 10px",
          borderRadius: 14,
          background: "linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(180,175,168,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
          color: "#1a1208",
          fontFamily: "inherit",
          fontSize: 14,
          cursor: "pointer",
          flexShrink: 0,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {countryOptions.map(c => (
          <option key={c.code} value={c.code} style={{ background: "#f5f3ef" }}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        className={inputClass}
        type="text"          /* NOT type="number" — avoids browser quirks */
        inputMode="numeric"  /* shows numeric keyboard on mobile */
        pattern="[0-9]*"
        placeholder="Enter phone number"
        maxLength={10}
        value={localNumber}
        onChange={handleNumberInput}
        autoComplete="tel"
        style={{ flex: 1 }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAGIC-BYTE VALIDATION (Fix #2)
   Browser-level defence: checks actual file header bytes, not
   just the MIME type or extension (both trivially spoofed).
   Always enforce the same check server-side as well.
═══════════════════════════════════════════════════════════ */
const MAGIC_BYTES = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/jpg":  [[0xFF, 0xD8, 0xFF]],
  "image/png":  [[0x89, 0x50, 0x4E, 0x47]],
  "image/webp": null, // checked via string "WEBP" at offset 8
  "image/heic": null, // checked via "ftyp" at offset 4
  "image/heif": null,
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

async function validateMagicBytes(file) {
  try {
    const slice = file.slice(0, 12);
    const buf = await slice.arrayBuffer();
    const bytes = new Uint8Array(buf);

    const mime = file.type.toLowerCase();

    if (mime === "image/webp") {
      // RIFF????WEBP
      const header = String.fromCharCode(...bytes.slice(0, 12));
      return header.startsWith("RIFF") && header.slice(8, 12) === "WEBP";
    }
    if (mime === "image/heic" || mime === "image/heif") {
      // ISO BMFF: "ftyp" box at offset 4
      const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      return ftyp === "ftyp";
    }

    const signatures = MAGIC_BYTES[mime];
    if (!signatures) return true; // unknown type — let server-side handle it

    return signatures.some((sig) =>
      sig.every((byte, i) => bytes[i] === byte)
    );
  } catch {
    return false; // if we can't read the buffer, reject it
  }
}

/* ═══════════════════════════════════════════════════════════
   FILE UPLOAD ZONE
═══════════════════════════════════════════════════════════ */
function UploadZone({ label, accept, acceptLabel, value, onChange, error }) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(null);
  const [magicError, setMagicError] = useState(null);
  const inputRef = useRef(null);

  /* Restore preview thumbnail when a File is pre-populated (edit flow) */
  useEffect(() => {
    if (!(value instanceof File) || preview) return;
    if (value.type.startsWith("image/") || value.name.match(/\.(heic|heif)$/i)) {
      const url = URL.createObjectURL(value);
      setPreview({ type: "image", url, name: value.name, size: value.size });
    } else if (value.type === "application/pdf") {
      setPreview({ type: "pdf", name: value.name, size: value.size });
    } else {
      setPreview({ type: "file", name: value.name, size: value.size });
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setMagicError(null);

    // Magic-byte check — catches spoofed MIME / extensions
    const valid = await validateMagicBytes(file);
    if (!valid) {
      setMagicError("File content does not match its declared type. Please upload a genuine image or PDF.");
      onChange(null);
      return;
    }

    onChange(file);
    if (file.type.startsWith("image/") || file.name.match(/\.(heic|heif)$/i)) {
      const url = URL.createObjectURL(file);
      setPreview({ type: "image", url, name: file.name, size: file.size });
    } else if (file.type === "application/pdf") {
      setPreview({ type: "pdf", name: file.name, size: file.size });
    } else {
      setPreview({ type: "file", name: file.name, size: file.size });
    }
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleRemove = useCallback(() => {
    onChange(null);
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange, preview]);

  const isValid = value instanceof File && !error;
  const cls = `cb-upload-zone${drag ? " drag" : ""}${isValid ? " valid" : ""}${error ? " invalid" : ""}`;

  return (
    <div className="cb-field">
      <label className="cb-label">{label}<span>*</span></label>
      <div
        className={cls}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          style={{ display: "none" }}
          onChange={(e) => processFile(e.target.files?.[0])}
          aria-hidden="true"
        />

        {/* Icon */}
        <div style={{ marginBottom: 10 }}>
          {isValid ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(80,200,120,0.8)" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.7">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        {isValid ? (
          <p style={{ fontSize: 13, color: "rgba(80,200,120,0.9)", fontWeight: 600 }}>File attached ✓</p>
        ) : (
          <>
            <p style={{ fontSize: 14, color: "rgba(26,18,8,0.70)", marginBottom: 4 }}>
              <span style={{ color: "#1a1208", fontWeight: 700 }}>Click to upload</span> or drag & drop
            </p>
            <p style={{ fontSize: 11, color: "rgba(26,18,8,0.38)", letterSpacing: "0.05em" }}>{acceptLabel} · Max {MAX_SIZE_MB}MB</p>
          </>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="cb-upload-preview">
          {preview.type === "image" && preview.url && (
            <img src={preview.url} alt="preview" className="cb-upload-img-thumb" />
          )}
          {preview.type === "pdf" && (
            <div style={{ width: 48, height: 48, borderRadius: 8, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,120,120,0.8)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          )}
          {preview.type === "file" && (
            <div style={{ width: 48, height: 48, borderRadius: 8, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: "#e0d8cc", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{preview.name}</p>
            <p style={{ fontSize: 11, color: "rgba(26,18,8,0.42)", marginTop: 2 }}>{(preview.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            style={{ flexShrink: 0, background: "none", border: "none", color: "rgba(26,18,8,0.35)", cursor: "pointer", padding: 4, transition: "color .2s" }}
            aria-label="Remove file"
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,80,80,0.8)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(26,18,8,0.35)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      <ErrorMsg msg={error || magicError} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════════════════════ */
function StepBar({ current }) {
  const steps = ["Select Type", "Fill Details", "Preview & Submit"];
  return (
    <div className="cb-steps">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="cb-step-item">
            <div className="cb-step-circle" style={{
              background: done ? GOLD : active ? "rgba(201,168,76,0.18)" : "rgba(0,0,0,0.06)",
              border: `1px solid ${done || active ? GOLD : "rgba(0,0,0,0.15)"}`,
              color: done ? "#0d0906" : active ? GOLD_DARK : "rgba(0,0,0,0.30)",
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (i + 1)}
            </div>
            <span style={{ fontSize: 11, color: active ? GOLD_DARK : done ? "rgba(139,105,20,0.7)" : "rgba(0,0,0,0.30)", fontWeight: active ? 700 : 400, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
              {label}
            </span>
            {i < steps.length - 1 && <div className={`cb-step-line${done ? " active" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TYPE SELECTION SCREEN
═══════════════════════════════════════════════════════════ */
function TypeSelection({ onSelect }) {
  return (
    <div>
      <SectionHeader
        step="Step 1 of 3"
        title="Choose Your Consultation"
        subtitle="Select the type of Vastu consultation that best suits your needs."
      />
      <div className="cb-type-grid">
        {/* ONLINE */}
        <motion.div
          className="cb-type-card"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("online")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSelect("online")}
          aria-label="Select Online Consultation"
        >
          <div className="cb-type-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 700, color: "#1a1208", marginBottom: 8, lineHeight: 1.2 }}>
              Online Consultation
            </h3>
            <p style={{ fontSize: 13, color: "rgba(30,24,10,0.60)", lineHeight: 1.7, marginBottom: 16 }}>
              Remote Vastu analysis — no physical visit required. Submit your property details digitally and receive expert guidance, remedies &amp; a full written report from anywhere in the world.
            </p>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "No site visit — fully digital",
              "Guidance & remedies via report",
              "48-hour turnaround",
              "Ideal for global clients",
            ].map((pt, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(30,24,10,0.70)" }}>
                <svg style={{ flexShrink: 0, marginTop: 2 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_DARK} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {pt}
              </li>
            ))}
          </ul>
          <div style={{
            marginTop: "auto",
            padding: "14px 20px",
            background: "linear-gradient(135deg,rgba(201,168,76,0.20) 0%,rgba(201,168,76,0.07) 100%)",
            border: "1px solid rgba(201,168,76,0.35)",
            borderRadius: 14,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18),inset 0 -1px 0 rgba(0,0,0,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 14, color: GOLD_DARK, fontWeight: 700 }}>Book Online →</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD_DARK} strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </motion.div>

        {/* OFFLINE */}
        <motion.div
          className="cb-type-card"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("offline")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSelect("offline")}
          aria-label="Select Offline Consultation"
        >
          <div className="cb-badge">Recommended</div>
          <div className="cb-type-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 700, color: "#1a1208", marginBottom: 8, lineHeight: 1.2 }}>
              Offline Consultation
            </h3>
            <p style={{ fontSize: 13, color: "rgba(30,24,10,0.60)", lineHeight: 1.7, marginBottom: 16 }}>
              Pandit Aman Bhatore physically visits your property for an in-depth on-site Vastu analysis. Submit your details here and a consultation date will be scheduled post-booking.
            </p>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "In-person site visit by Pandit ji",
              "Comprehensive on-site analysis",
              "Scheduled on a planned date",
              "Best for residential & commercial",
            ].map((pt, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(30,24,10,0.70)" }}>
                <svg style={{ flexShrink: 0, marginTop: 2 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_DARK} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {pt}
              </li>
            ))}
          </ul>
          <div style={{
            marginTop: "auto",
            padding: "14px 20px",
            background: "linear-gradient(135deg,rgba(255,255,255,0.55) 0%,rgba(240,235,220,0.35) 100%)",
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 14,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(0,0,0,0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 14, color: "rgba(26,18,8,0.65)", fontWeight: 700 }}>Schedule Visit →</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(26,18,8,0.45)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </motion.div>
      </div>

      {/* Trust strip */}
      <div style={{ display: "flex", justifyContent: "center", gap: 28, padding: "0 36px 32px", flexWrap: "wrap" }}>
        {[
          { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "100% Confidential" },
          { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", text: "15+ Years Expertise" },
          { icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", text: "5000+ Happy Clients" },
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(26,18,8,0.42)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8"><path d={t.icon}/></svg>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREVIEW MODAL
═══════════════════════════════════════════════════════════ */
function PreviewModal({ type, data, onClose, onConfirm, isSubmitting, submitError }) {
  const rows = type === "online" ? [
    { label: "Full Name", value: data.fullName },
    { label: "Current Address", value: data.address },
    { label: "Phone", value: data.phone },
    { label: "Profession", value: data.profession },
    { label: "Degree of House Photo", value: data.degreePhoto?.name },
    { label: "2D Map", value: data.map2D?.name },
  ] : [
    { label: "Full Name", value: data.fullName },
    { label: "Phone", value: data.phone },
    { label: "Current Address", value: data.address },
    { label: "Profession", value: data.profession },
    { label: "Site Front Photo", value: data.siteFront?.name },
  ];

  return (
    <motion.div
      className="cb-preview-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="cb-preview-shell"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <OmDiamond />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(139,105,20,0.75)" }}>Review</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1208" }}>
              Confirm Your Details
            </h2>
          </div>
          <div style={{ padding: "6px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 9999, fontSize: 12, color: GOLD, fontWeight: 600 }}>
            {type === "online" ? "🌐 Online" : "🏠 Offline"}
          </div>
        </div>

        <GoldDivider />

        <div style={{ margin: "16px 0" }}>
          {rows.map((r, i) => (
            <div key={i} className="cb-preview-row">
              <span className="cb-preview-label">{r.label}</span>
              <span className="cb-preview-value">{r.value || "—"}</span>
            </div>
          ))}
        </div>

        <GoldDivider />

        <p style={{ fontSize: 12, color: "rgba(26,18,8,0.42)", margin: "16px 0", lineHeight: 1.6, textAlign: "center" }}>
          By submitting, you confirm the above information is accurate. Pandit Aman Bhatore's team will contact you within 24 hours.
        </p>

        {/* Submission error banner — only shown when the API call fails */}
        {submitError && (
          <div style={{
            marginBottom: 12, padding: "12px 16px",
            background: "rgba(220,50,50,0.08)", border: "1px solid rgba(220,50,50,0.30)",
            borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(220,50,50,0.85)" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 13, color: "rgba(180,40,40,0.9)", lineHeight: 1.5, margin: 0 }}>{submitError}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: "14px",
              position: "relative",
              border: "1px solid rgba(0,0,0,0.10)",
              background: "linear-gradient(135deg,rgba(255,255,255,0.70) 0%,rgba(240,235,220,0.50) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.90),inset 0 -1px 0 rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 9999,
              color: "rgba(26,18,8,0.65)",
              fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "transform .2s,border-color .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)"; }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1.03)"}
          >
            ← Edit Details
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="cb-submit"
            style={{ flex: 2 }}
          >
            {isSubmitting ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3"/>
                  <path d="M21 12a9 9 0 00-9-9"/>
                </svg>
                Submitting…
              </span>
            ) : "✦ Confirm & Submit"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════════════════ */
function SuccessScreen({ type, name, onClose }) {
  return (
    <div className="cb-success">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(253,250,244,0.96) 100%)",
          border: "1px solid rgba(201,168,76,0.35)",
          borderRadius: 28,
          padding: "48px 40px 40px",
          boxShadow: [
            "0 4px 6px rgba(0,0,0,0.04)",
            "0 20px 60px rgba(0,0,0,0.10)",
            "0 0 0 1px rgba(255,255,255,0.8) inset",
            "0 1px 0 rgba(255,255,255,1) inset",
            "0 0 80px rgba(201,168,76,0.08)",
          ].join(","),
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle top gold shimmer line */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)",
          borderRadius: 9999,
        }} />

        {/* Radial glow behind checkmark */}
        <div style={{
          position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(80,200,120,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Checkmark ring */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.2 }}
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(80,200,120,0.15) 0%, rgba(80,200,120,0.06) 100%)",
            border: "1.5px solid rgba(80,200,120,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 0 0 8px rgba(80,200,120,0.06), 0 8px 24px rgba(80,200,120,0.12)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(40,180,90,0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        {/* Om Diamond */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}
        >
          <OmDiamond />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(1.6rem,4vw,2.1rem)",
            fontWeight: 700,
            color: "#1a1208",
            marginBottom: 14,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Booking Received, {name?.split(" ")[0]}!
        </motion.h2>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
            margin: "0 auto 18px",
            width: "60%",
          }}
        />

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 15, color: "rgba(26,18,8,0.58)", lineHeight: 1.75, marginBottom: 10 }}
        >
          Your{" "}
          <strong style={{ color: "#CC6600", fontWeight: 600 }}>
            {type === "online" ? "Online" : "Offline"} Consultation
          </strong>{" "}
          request has been submitted successfully. Pandit Aman Bhatore's team will reach out within{" "}
          <strong style={{ color: "#CC6600", fontWeight: 600 }}>24 hours</strong> to confirm your appointment.
        </motion.p>

        {/* Sanskrit quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: 13,
            color: "rgba(139,105,20,0.55)",
            fontStyle: "italic",
            marginBottom: 36,
            letterSpacing: "0.02em",
            fontFamily: "'Cormorant Garamond',serif",
          }}
        >
          ॥ जहाँ ऊर्जा प्रवाहित होती है, वहाँ समृद्धि फलती है ॥
        </motion.p>

        {/* Back to Website button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "13px 36px",
              position: "relative",
              border: "1px solid rgba(201,168,76,0.45)",
              background: "linear-gradient(135deg,rgba(201,168,76,0.22) 0%,rgba(201,168,76,0.10) 50%,rgba(255,255,255,0.06) 100%)",
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              color: "#8B6914",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.5)",
                "inset 0 -1px 0 rgba(0,0,0,0.06)",
                "0 4px 16px rgba(201,168,76,0.16)",
              ].join(","),
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              transition: "transform .2s, box-shadow .2s, border-color .2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.65)";
              e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.5),0 8px 28px rgba(201,168,76,0.24)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.45)";
              e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.5),inset 0 -1px 0 rgba(0,0,0,0.06),0 4px 16px rgba(201,168,76,0.16)";
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1.03)"}
          >
            Back to Website
          </button>
        </motion.div>

        {/* Bottom subtle glow */}
        <div style={{
          position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: 160, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
        }} />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ONLINE FORM
═══════════════════════════════════════════════════════════ */
function OnlineForm({ onPreview, onBack, defaultValues }) {
  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, touchedFields, isValid } } = useForm({
    resolver: zodResolver(onlineSchema),
    mode: "onChange",
  });

  /* Restore previously entered data when user clicks "Edit Details" */
  useEffect(() => {
    if (!defaultValues) return;
    const { degreePhoto, map2D, ...textFields } = defaultValues;
    reset(textFields);
    if (degreePhoto instanceof File) setValue("degreePhoto", degreePhoto, { shouldValidate: true, shouldTouch: true });
    if (map2D instanceof File) setValue("map2D", map2D, { shouldValidate: true, shouldTouch: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const v = (field) => ({
    isValid: !errors[field] && touchedFields[field],
    error: errors[field]?.message,
  });

  const onSubmit = (data) => onPreview(data);

  return (
    <form className="cb-form-wrap" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ paddingTop: 8, paddingBottom: 4 }}>
        <GoldDivider />
      </div>

      <div className="cb-form" style={{ paddingTop: 20 }}>
        {/* Row 1 */}
        <div className="cb-field-row">
          <Field label="Full Name" {...v("fullName")}>
            <input
              className={`cb-input${v("fullName").isValid ? " valid" : ""}${v("fullName").error ? " invalid" : ""}`}
              placeholder="Your full name"
              aria-label="Full Name"
              maxLength={100}
              {...register("fullName")}
            />
          </Field>
          <Field label="Profession" {...v("profession")}>
            <input
              className={`cb-input${v("profession").isValid ? " valid" : ""}${v("profession").error ? " invalid" : ""}`}
              placeholder="Your profession / occupation"
              aria-label="Profession"
              maxLength={100}
              {...register("profession")}
            />
          </Field>
        </div>

        {/* Phone */}
        <Field label="Contact Number" {...v("phone")}>
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <PhoneField
                value={field.value}
                onChange={field.onChange}
                error={v("phone").error}
                isValid={v("phone").isValid}
              />
            )}
          />
        </Field>

        {/* Address */}
        <Field label="Current Address" {...v("address")}>
          <textarea
            className={`cb-input cb-textarea${v("address").isValid ? " valid" : ""}${v("address").error ? " invalid" : ""}`}
            placeholder="Your full current address"
            aria-label="Current Address"
            maxLength={500}
            {...register("address")}
          />
        </Field>

        {/* House Degree — photo upload only */}
        <div className="cb-field-row">
          <Controller
            name="degreePhoto"
            control={control}
            render={({ field }) => (
              <UploadZone
                label="Degree of House (घर का डिग्री) — Upload Photo"
                accept={ACCEPTED_IMAGE}
                acceptLabel="JPG · PNG · WEBP · HEIC"
                value={field.value}
                onChange={(f) => { setValue("degreePhoto", f, { shouldValidate: true, shouldTouch: true }); }}
                error={errors.degreePhoto?.message}
              />
            )}
          />
          <Controller
            name="map2D"
            control={control}
            render={({ field }) => (
              <UploadZone
                label="Upload 2D Map"
                accept={ACCEPTED_DOC}
                acceptLabel="JPG · PNG · WEBP · HEIC · PDF"
                value={field.value}
                onChange={(f) => { setValue("map2D", f, { shouldValidate: true, shouldTouch: true }); }}
                error={errors.map2D?.message}
              />
            )}
          />
        </div>

        {/* Bottom actions */}
        <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "14px 20px",
              position: "relative",
              border: "1px solid rgba(0,0,0,0.10)",
              background: "linear-gradient(135deg,rgba(255,255,255,0.70) 0%,rgba(240,235,220,0.50) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.90),inset 0 -1px 0 rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 9999,
              color: "rgba(26,18,8,0.72)", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "transform .2s,box-shadow .2s,border-color .2s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)"; }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1.05)"}
            aria-label="Go back"
          >
            ←
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="cb-submit"
            style={{ flex: 1 }}
          >
            {isValid ? "Preview & Continue →" : "Complete All Fields to Continue"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   OFFLINE FORM
═══════════════════════════════════════════════════════════ */
function OfflineForm({ onPreview, onBack, defaultValues }) {
  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, touchedFields, isValid } } = useForm({
    resolver: zodResolver(offlineSchema),
    mode: "onChange",
  });

  /* Restore previously entered data when user clicks "Edit Details" */
  useEffect(() => {
    if (!defaultValues) return;
    const { siteFront, ...textFields } = defaultValues;
    reset(textFields);
    if (siteFront instanceof File) setValue("siteFront", siteFront, { shouldValidate: true, shouldTouch: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const v = (field) => ({
    isValid: !errors[field] && touchedFields[field],
    error: errors[field]?.message,
  });

  const onSubmit = (data) => onPreview(data);

  return (
    <form className="cb-form-wrap" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ paddingTop: 8, paddingBottom: 4 }}>
        <GoldDivider />
      </div>

      <div className="cb-form" style={{ paddingTop: 20 }}>
        <div className="cb-field-row">
          <Field label="Full Name" {...v("fullName")}>
            <input
              className={`cb-input${v("fullName").isValid ? " valid" : ""}${v("fullName").error ? " invalid" : ""}`}
              placeholder="Your full name"
              aria-label="Full Name"
              maxLength={100}
              {...register("fullName")}
            />
          </Field>
          <Field label="Profession" {...v("profession")}>
            <input
              className={`cb-input${v("profession").isValid ? " valid" : ""}${v("profession").error ? " invalid" : ""}`}
              placeholder="Your profession / occupation"
              aria-label="Profession"
              maxLength={100}
              {...register("profession")}
            />
          </Field>
        </div>

        <Field label="Contact Number" {...v("phone")}>
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <PhoneField
                value={field.value}
                onChange={field.onChange}
                error={v("phone").error}
                isValid={v("phone").isValid}
              />
            )}
          />
        </Field>

        <Field label="Current Address" {...v("address")}>
          <textarea
            className={`cb-input cb-textarea${v("address").isValid ? " valid" : ""}${v("address").error ? " invalid" : ""}`}
            placeholder="Your full current address"
            aria-label="Current Address"
            maxLength={500}
            {...register("address")}
          />
        </Field>

        {/* Important note for offline */}
        <div style={{ padding: "14px 16px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 12, display: "flex", gap: 12 }}>
          <svg style={{ flexShrink: 0, marginTop: 2 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ fontSize: 13, color: "rgba(26,18,8,0.55)", lineHeight: 1.6 }}>
            Upload a photo of the <strong style={{ color: "#1a1208" }}>front side of the site</strong>. The photo must clearly show the date &amp; time stamp.
          </p>
        </div>

        <Controller
          name="siteFront"
          control={control}
          render={({ field }) => (
            <UploadZone
              label="Front Photo of Site (with Date & Time)"
              accept={ACCEPTED_IMAGE}
              acceptLabel="JPG · PNG · WEBP · HEIC · HEIF"
              value={field.value}
              onChange={(f) => { setValue("siteFront", f, { shouldValidate: true, shouldTouch: true }); }}
              error={errors.siteFront?.message}
            />
          )}
        />

        <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "14px 20px",
              position: "relative",
              border: "1px solid rgba(0,0,0,0.10)",
              background: "linear-gradient(135deg,rgba(255,255,255,0.70) 0%,rgba(240,235,220,0.50) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.90),inset 0 -1px 0 rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 9999,
              color: "rgba(26,18,8,0.72)", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "transform .2s,box-shadow .2s,border-color .2s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)"; }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1.05)"}
            aria-label="Go back"
          >
            ←
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="cb-submit"
            style={{ flex: 1 }}
          >
            {isValid ? "Preview & Continue →" : "Complete All Fields to Continue"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════ */
export function ConsultationModal({ open, onClose }) {
  /* step: "type" | "form" | "preview" | "success" */
  const [step, setStep] = useState("type");
  const [consultType, setConsultType] = useState(null); // "online" | "offline"
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shellRef = useRef(null);

  /* On open, read consultType from URL hash so a refreshed page
     restores the correct step (e.g. #consultation/online → online form) */
  useEffect(() => {
    if (open) {
      const hash = window.location.hash; // e.g. "#consultation/online"
      const parts = hash.split("/");
      const typeFromHash = parts[1]; // "online" | "offline" | undefined
      if (typeFromHash === "online" || typeFromHash === "offline") {
        setConsultType(typeFromHash);
        setStep("form");
      } else {
        setStep("type");
        setConsultType(null);
      }
    }
  }, [open]);

  /* Reset on close */
  useEffect(() => {
    if (!open) {
      setTimeout(() => { setStep("type"); setConsultType(null); setFormData(null); setSubmitError(null); }, 400);
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Prevent body scroll + overscroll on mobile when modal is open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [open]);

  /* Scroll shell to top when step changes */
  useEffect(() => { shellRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const handleTypeSelect = useCallback((type) => {
    setConsultType(type);
    setStep("form");
    // Write the selected type into the hash so refresh restores this step
    history.replaceState(null, "", `#consultation/${type}`);
  }, []);

  const handlePreview = useCallback((data) => {
    setFormData(data);
    setStep("preview");
  }, []);

  /* ── Double-submit guard: a ref prevents concurrent submissions even
     if isSubmitting state update hasn't flushed yet. ── */
  const submittingRef = useRef(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return; // block concurrent clicks
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    /* AbortController gives the request a hard 30-second timeout */
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        payload.append(key, val);
      });
      payload.append("consultationType", consultType);

      const response = await fetch("http://localhost:8081/api/book-consultation", {
        method: "POST",
        signal: controller.signal,
        headers: {
          /* Custom header acts as a lightweight CSRF signal.
             Pair this with server-side validation:
             reject requests where X-Requested-With is absent. */
          "X-Requested-With": "XMLHttpRequest",
        },
        body: payload,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        /* Surface the HTTP error — never show success for a failed request */
        let detail = "";
        try { detail = await response.text(); } catch (_) {}
        throw new Error(`Server error ${response.status}${detail ? `: ${detail}` : ""}`);
      }

      setStep("success");
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      setSubmitError(
        isTimeout
          ? "The request timed out. Please check your connection and try again."
          : "Submission failed. Please try again or contact us on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }, [formData, consultType]);

  const stepIndex = { type: 0, form: 1, preview: 2, success: 3 }[step];

  if (!open) return null;

  return (
    <>
      <BookingStyles />
      {/* SVG liquid-glass filter — same as PanditAmanBhatore.jsx navbar */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="liquid-glass-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
            <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
            <feComposite in="finalBlur" in2="finalBlur" operator="over" />
          </filter>
        </defs>
      </svg>
      <AnimatePresence>
        {open && (
          <motion.div
            className="cb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Book Consultation"
          >
            <motion.div
              ref={shellRef}
              className="cb-shell"
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="cb-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>🪷</span>
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)" }}>
                      वास्तु परामर्श
                    </span>
                  </div>
                  <h1 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                    fontWeight: 700, color: "#1a1208", lineHeight: 1.15,
                  }}>
                    Book with <span style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pandit Aman Bhatore</span>
                  </h1>
                </div>
                <button
                  className="cb-close"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Step bar — hidden on success */}
              {step !== "success" && (
                <div style={{ paddingTop: 20 }}>
                  <StepBar current={Math.min(stepIndex, 2)} />
                </div>
              )}

              {/* Content */}
              <AnimatePresence mode="wait">
                {step === "type" && (
                  <motion.div key="type" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <TypeSelection onSelect={handleTypeSelect} />
                  </motion.div>
                )}

                {step === "form" && consultType === "online" && (
                  <motion.div key="online-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <SectionHeader
                      step="Step 2 of 3 — Online Consultation"
                      title="Your Details"
                      subtitle="All fields are mandatory. Your information is kept 100% confidential."
                    />
                    <OnlineForm onPreview={handlePreview} onBack={() => setStep("type")} defaultValues={formData} />
                  </motion.div>
                )}

                {step === "form" && consultType === "offline" && (
                  <motion.div key="offline-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <SectionHeader
                      step="Step 2 of 3 — Offline Consultation"
                      title="Your Details"
                      subtitle="All fields are mandatory. A site visit will be scheduled after submission."
                    />
                    <OfflineForm onPreview={handlePreview} onBack={() => setStep("type")} defaultValues={formData} />
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                    <SuccessScreen type={consultType} name={formData?.fullName} onClose={onClose} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal — rendered outside shell so it stacks on top */}
      <AnimatePresence>
        {step === "preview" && formData && (
          <PreviewModal
            type={consultType}
            data={formData}
            onClose={() => { setStep("form"); setSubmitError(null); }}
            onConfirm={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </AnimatePresence>

      {/* Spin keyframe for submit loader */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOOK — useConsultationModal
   URL-hash-aware modal controller.

   Hash contract:
     #consultation           → open modal at type-selection step
     #consultation/online    → open modal pre-selecting Online
     #consultation/offline   → open modal pre-selecting Offline

   Behaviours:
     • Page refresh  → hash preserved by browser → modal re-opens.
     • Browser Back  → popstate fires → modal closes cleanly.
     • openModal()   → writes #consultation to the URL.
     • closeModal()  → pops history entry so Back still works.
═══════════════════════════════════════════════════════════ */
export function useConsultationModal() {
  // Derive initial open state from the hash so modal is open
  // immediately on the first render after a refresh.
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash.startsWith("#consultation");
  });

  // Track whether we pushed a history entry (so we know whether
  // to call history.back() or just replaceState on close).
  const wePushedRef = useRef(false);

  /* Sync open state from URL hash — handles refresh + back button */
  useEffect(() => {
    const syncFromHash = () => {
      const isConsultation = window.location.hash.startsWith("#consultation");
      setOpen(isConsultation);
      if (!isConsultation) wePushedRef.current = false;
    };
    syncFromHash();
    window.addEventListener("popstate", syncFromHash);
    return () => window.removeEventListener("popstate", syncFromHash);
  }, []);

  /* Open — push a history entry so the Back button closes the modal */
  const openModal = useCallback((type) => {
    const hash = type ? `#consultation/${type}` : "#consultation";
    if (!window.location.hash.startsWith("#consultation")) {
      history.pushState(null, "", hash);
      wePushedRef.current = true;
    } else {
      history.replaceState(null, "", hash);
    }
    setOpen(true);
  }, []);

  /* Close — pop our history entry or just strip the hash */
  const closeModal = useCallback(() => {
    if (wePushedRef.current) {
      history.back(); // triggers popstate → syncFromHash sets open=false
    } else {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      setOpen(false);
    }
    wePushedRef.current = false;
  }, []);

  return { open, openModal, closeModal };
}

/* ═══════════════════════════════════════════════════════════
   DEFAULT EXPORT — Standalone routed page at /consultation-booking
   Renders the full ConsultationModal UI directly as a page.
   On close, navigates back to homepage.
═══════════════════════════════════════════════════════════ */
export default function ConsultationBookingPage() {
  // On this standalone route the modal is always open.
  // We bypass the hash-based hook — calling openModal() would append
  // "#consultation" to "/consultation-booking" on mount.
  const handleClose = () => {
    window.location.href = "/";
  };

  return (
    <>
      <BookingStyles />
      <ConsultationModal open={true} onClose={handleClose} />
    </>
  );
}
