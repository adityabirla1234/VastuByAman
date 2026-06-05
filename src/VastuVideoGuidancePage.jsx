/**
 * ════════════════════════════════════════════════════════════════════
 *  VastuVideoGuidancePage.jsx
 *
 *  DEDICATED ROUTE PAGE — Video Guidance
 *  ──────────────────────────────────────────────────────────────────
 *  This is a full, standalone page — NOT a scroll section. The nav
 *  link navigates here as a separate route. It contains:
 *
 *   • Light theme design (white bg, dark text, subtle shadows)
 *   • LiquidButton component (from the shared component spec)
 *   • All 4 video cards (expandable, scroll-reveal, hover effects)
 *   • Instagram CTA section with camera icon & LiquidButton
 *   • Full-bleed hero header
 *   • Responsive grid (2-col → 1-col)
 *   • Back navigation to the main site
 *
 *  ROUTING INTEGRATION:
 *  ──────────────────────────────────────────────────────────────────
 *  In App.jsx:
 *    import { BrowserRouter, Routes, Route } from "react-router-dom";
 *    import PanditAmanBhatore from "./PanditAmanBhatore";
 *    import VastuVideoGuidancePage from "./VastuVideoGuidancePage";
 *
 *    <BrowserRouter>
 *      <Routes>
 *        <Route path="/"               element={<PanditAmanBhatore />} />
 *        <Route path="/video-guidance" element={<VastuVideoGuidancePage />} />
 *      </Routes>
 *    </BrowserRouter>
 * ════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

/* ─────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS — Light theme matching reference design
───────────────────────────────────────────────────────────────────────── */
const DESIGN_CSS = `
  :root {
    /* ── Surfaces — LIGHT THEME ── */
    --vp-bg:                  #f8f7f5;
    --vp-surface-low:         #f0eeeb;
    --vp-surface:             #ffffff;
    --vp-surface-high:        #ffffff;
    --vp-surface-highest:     #ffffff;

    /* ── On-surface ── */
    --vp-on-surface:          #1a1209;
    --vp-on-surface-var:      #4a4035;
    --vp-outline:             #8a8070;
    --vp-outline-var:         #d8d0c4;

    /* ── Brand ── */
    --vp-primary:             #5a5a9e;
    --vp-primary-on:          #ffffff;
    --vp-accent:              #B8860B;
    --vp-accent-bright:       #C9A84C;
    --vp-accent-dim:          #8B6914;

    /* ── Typography ── */
    --vp-font-display:        'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif;
    --vp-font-body:           'Inter', system-ui, sans-serif;

    /* ── Spacing ── */
    --vp-gap:                 24px;
    --vp-section-gap:         100px;
    --vp-glass-pad:           32px;

    /* ── Radius ── */
    --vp-r-sm:                4px;
    --vp-r-md:                12px;
    --vp-r-lg:                16px;
    --vp-r-xl:                20px;
    --vp-r-pill:              9999px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .vp-root {
    min-height: 100vh;
    background: var(--vp-bg);
    color: var(--vp-on-surface);
    font-family: var(--vp-font-body);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* ── Ambient blobs — very subtle on light bg ── */
  .vp-ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    overflow: hidden;
  }
  .vp-blob {
    position: absolute; border-radius: 50%;
    filter: blur(120px); opacity: 0;
    animation: vp-blob-in 2s ease forwards;
  }
  .vp-blob--1 {
    width: 700px; height: 700px; top: -200px; left: -200px;
    background: radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%);
    animation-delay: 0.2s;
  }
  .vp-blob--2 {
    width: 600px; height: 600px; bottom: 0; right: -180px;
    background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
    animation-delay: 0.5s;
  }
  .vp-blob--3 {
    width: 400px; height: 400px; top: 50%; left: 50%; transform: translate(-50%,-50%);
    background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%);
    animation-delay: 0.8s;
  }
  @keyframes vp-blob-in { from { opacity: 0; } to { opacity: 1; } }

  /* ── NAVBAR ── */
  .vp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(20px, 5vw, 56px);
    background: rgba(248,247,245,0.88);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
    border-bottom: 1px solid rgba(0,0,0,0.07);
    transition: background 0.4s ease;
  }
  .vp-nav--top {
    background: rgba(248,247,245,0.5);
    border-bottom-color: transparent;
  }
  .vp-nav-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; color: var(--vp-on-surface);
  }
  .vp-nav-logo-title {
    font-family: var(--vp-font-display);
    font-size: 15px; font-weight: 700; letter-spacing: 0.01em;
    color: var(--vp-on-surface);
  }
  .vp-nav-logo-sub {
    font-size: 10px; font-weight: 400;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--vp-on-surface-var); opacity: 0.7;
  }
  .vp-nav-back {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--vp-font-display);
    font-size: 14px; font-weight: 600; letter-spacing: 0.01em;
    color: var(--vp-on-surface-var);
    text-decoration: none;
    padding: 7px 16px;
    border-radius: var(--vp-r-pill);
    border: 1px solid rgba(0,0,0,0.12);
    background: rgba(0,0,0,0.04);
    transition: all 0.25s ease;
    cursor: pointer;
  }
  .vp-nav-back:hover {
    color: var(--vp-on-surface);
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.08);
  }

  /* ── HERO ── */
  .vp-hero {
    position: relative; z-index: 1;
    padding: 120px clamp(20px, 6vw, 80px) 24px;
    text-align: center; max-width: 1280px; margin: 0 auto;
  }
  .vp-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--vp-font-display);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--vp-accent); margin-bottom: 20px;
  }
  .vp-eyebrow-line {
    display: block; width: 32px; height: 1px;
    background: linear-gradient(to right, transparent, var(--vp-accent));
  }
  .vp-eyebrow-line--r {
    background: linear-gradient(to left, transparent, var(--vp-accent));
  }
  .vp-hero-title {
    font-family: var(--vp-font-display);
    font-size: clamp(2.4rem, 6vw, 4.5rem);
    font-weight: 700; line-height: 1.08; letter-spacing: -0.04em;
    margin-bottom: 24px;
    color: var(--vp-on-surface);
  }
  .vp-hero-sub {
    font-family: var(--vp-font-body);
    font-size: clamp(1rem, 2vw, 1.2rem);
    font-weight: 400; line-height: 1.8;
    color: var(--vp-on-surface-var);
    max-width: 580px; margin: 0 auto;
  }
  .vp-hero-stats {
    display: flex; justify-content: center;
    gap: clamp(24px, 5vw, 56px); flex-wrap: wrap;
  }
  .vp-stat { text-align: center; }
  .vp-stat-num {
    font-family: var(--vp-font-display);
    font-size: 2rem; font-weight: 700; letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--vp-accent-dim) 0%, var(--vp-accent-bright) 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .vp-stat-label {
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--vp-outline); margin-top: 4px;
  }

  /* ── DIVIDER ── */
  .vp-divider {
    position: relative; z-index: 1;
    max-width: 1280px; margin: 0 auto;
    padding: 0 clamp(20px, 6vw, 80px);
    display: flex; align-items: center; gap: 16px;
  }
  .vp-divider-line {
    flex: 1; height: 1px;
    background: linear-gradient(to right, transparent, var(--vp-outline-var), transparent);
  }
  .vp-divider-mark { font-size: 18px; color: var(--vp-accent-bright); line-height: 1; }

  /* ── VIDEO GRID ── */
  .vp-grid-section {
    position: relative; z-index: 1;
    max-width: 1280px; margin: 0 auto;
    padding: 32px clamp(20px, 6vw, 80px) 0;
  }
  .vp-section-label {
    font-family: var(--vp-font-display);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--vp-outline); margin-bottom: 28px;
    display: flex; align-items: center; gap: 12px;
  }
  .vp-section-label::after {
    content: ''; flex: 1; height: 1px;
    background: var(--vp-outline-var); opacity: 0.8;
  }
  .vp-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px;
  }
  @media (max-width: 768px) {
    .vp-grid { grid-template-columns: 1fr !important; gap: 20px; }
    .vp-hero { padding: 100px 20px 24px; }
    .vp-grid-section { padding: 24px 20px 0; }
  }

  /* ── CARD ── */
  .vp-card {
    position: relative;
    border-radius: var(--vp-r-xl);
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    overflow: hidden; will-change: transform;
    transition:
      transform   0.5s cubic-bezier(.16,1,.3,1),
      box-shadow  0.5s cubic-bezier(.16,1,.3,1),
      border-color 0.3s ease;
  }
  .vp-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(201,168,76,0.25);
    border-color: rgba(201,168,76,0.35);
  }
  .vp-card::before { display: none; }
  .vp-card-gold-line {
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(to right, var(--vp-accent-dim), var(--vp-accent-bright), var(--vp-accent-dim));
    opacity: 0; transition: opacity 0.4s ease; pointer-events: none; z-index: 2;
  }
  .vp-card:hover .vp-card-gold-line { opacity: 1; }

  /* ── Transcript block ── */
  .vp-transcript {
    border-top: 1px solid rgba(0,0,0,0.07);
    margin: 0;
  }
  .vp-transcript summary {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--vp-accent);
    cursor: pointer; list-style: none; user-select: none;
    transition: color 0.2s;
  }
  .vp-transcript summary::-webkit-details-marker { display: none; }
  .vp-transcript summary:hover { color: var(--vp-accent-dim); }
  .vp-transcript summary svg { transition: transform 0.25s; flex-shrink: 0; }
  .vp-transcript[open] summary svg { transform: rotate(180deg); }
  .vp-transcript-body {
    padding: 4px 20px 16px;
    font-size: 12.5px; line-height: 1.8;
    color: var(--vp-on-surface-var);
    white-space: pre-wrap;
  }

  /* ── Author row ── */
  .vp-author {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 20px 12px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .vp-avatar {
    width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 50%; overflow: hidden;
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.25);
    display: flex; align-items: center; justify-content: center;
  }
  .vp-author-name {
    font-family: var(--vp-font-display);
    font-size: 13px; font-weight: 700;
    color: var(--vp-on-surface);
    letter-spacing: -0.01em; line-height: 1.3;
  }
  .vp-author-role {
    font-size: 11px; color: var(--vp-outline); margin-top: 1px;
  }

  /* ── Thumbnail ── */
  .vp-thumb {
    position: relative; aspect-ratio: 16 / 9;
    overflow: hidden; background: #1a1209;
  }
  .vp-thumb img {
    width: 100%; height: 100%; object-fit: contain; display: block;
    transition: transform 0.6s cubic-bezier(.16,1,.3,1);
  }
  .vp-card:hover .vp-thumb img { transform: scale(1.04); }
  .vp-thumb-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 50%);
    pointer-events: none;
  }
  /* vp-thumb-frosted intentionally removed — it caused edge blurring */

  /* ── Inline video player ── */
  .vp-video-player {
    position: absolute; inset: 0; width: 100%; height: 100%;
    background: #000; display: block; outline: none;
  }
  .vp-video-close {
    position: absolute; top: 8px; right: 8px; z-index: 10;
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(0,0,0,0.60); border: 1px solid rgba(255,255,255,0.25);
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; line-height: 1;
    transition: background 0.2s;
  }
  .vp-video-close:hover { background: rgba(201,168,76,0.80); }
  .vp-duration {
    position: absolute; bottom: 12px; right: 14px;
    background: rgba(0,0,0,0.72); color: #fff;
    font-family: var(--vp-font-display);
    font-size: 11px; font-weight: 700;
    padding: 3px 9px; border-radius: 6px; letter-spacing: 0.04em;
  }
  .vp-play {
    position: absolute; top: 50%; left: 50%;
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.95);
    display: flex; align-items: center; justify-content: center;
    color: #1a1209; cursor: pointer; text-decoration: none;
    box-shadow: 0 4px 20px rgba(0,0,0,0.22);
    transition: transform 0.35s cubic-bezier(.16,1,.3,1),
                background 0.25s ease, color 0.25s ease;
    padding-left: 3px;
  }
  .vp-card:hover .vp-play {
    transform: translate(-50%,-50%) scale(1.15);
    background: rgba(201,168,76,0.95);
    border-color: rgba(201,168,76,1);
    color: #fff;
  }

  /* ── Card body ── */
  .vp-body { padding: 20px 22px 22px; }
  .vp-card-title {
    font-family: var(--vp-font-display);
    font-size: clamp(1rem, 2vw, 1.15rem); font-weight: 700;
    color: var(--vp-on-surface); letter-spacing: -0.02em;
    line-height: 1.3; margin-bottom: 10px;
  }
  .vp-card-desc {
    font-family: var(--vp-font-body);
    font-size: 14px; font-weight: 400;
    color: var(--vp-on-surface-var); line-height: 1.7; margin-bottom: 16px;
  }
  .vp-more {
    background: none; border: none; cursor: pointer;
    color: var(--vp-accent); font-size: 13px; font-weight: 600;
    font-family: var(--vp-font-body); padding: 0;
    text-decoration: underline; text-underline-offset: 3px; transition: color 0.2s;
  }
  .vp-more:hover { color: var(--vp-accent-bright); }
  .vp-meta {
    display: flex; align-items: center;
    justify-content: space-between; gap: 8px; flex-wrap: wrap;
  }
  .vp-tag {
    display: inline-flex; padding: 4px 12px;
    background: rgba(184,134,11,0.08);
    border: 1px solid rgba(184,134,11,0.2);
    border-radius: var(--vp-r-pill);
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--vp-accent); font-family: var(--vp-font-display);
  }
  .vp-date {
    font-size: 11px; color: var(--vp-outline);
    font-family: var(--vp-font-body); letter-spacing: 0.04em; white-space: nowrap;
  }
  .vp-translate-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer;
    font-family: var(--vp-font-body);
    font-size: 12px; font-weight: 600;
    color: var(--vp-accent);
    padding: 0; letter-spacing: 0.01em;
    text-decoration: underline; text-underline-offset: 3px;
    text-decoration-color: rgba(184,134,11,0.35);
    transition: color 0.2s ease, text-decoration-color 0.2s ease;
    white-space: nowrap;
  }
  .vp-translate-btn:hover {
    color: var(--vp-accent-bright);
    text-decoration-color: var(--vp-accent-bright);
  }
  .vp-translate-btn svg {
    flex-shrink: 0; opacity: 0.85;
  }

  /* ── INSTAGRAM CTA ── */
  .vp-cta {
    position: relative; z-index: 1;
    max-width: 1280px; margin: var(--vp-section-gap) auto 0;
    padding: 0 clamp(20px, 6vw, 80px);
  }
  .vp-cta-inner {
    position: relative; border-radius: 28px; overflow: hidden;
    padding: clamp(56px, 8vw, 80px) clamp(32px, 6vw, 80px);
    text-align: center;
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 8px 40px rgba(0,0,0,0.08);
  }
  .vp-cta-inner::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    pointer-events: none;
  }
  .vp-cta-blob { position: absolute; border-radius: 50%; pointer-events: none; }
  .vp-cta-blob--1 {
    width: 400px; height: 400px; top: -150px; left: -100px;
    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
    filter: blur(80px);
  }
  .vp-cta-blob--2 {
    width: 350px; height: 350px; bottom: -120px; right: -80px;
    background: radial-gradient(circle, rgba(220,39,67,0.05) 0%, transparent 70%);
    filter: blur(80px);
  }
  .vp-cta-ig-ring {
    display: inline-flex; align-items: center; justify-content: center;
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    box-shadow: 0 8px 24px rgba(220,39,67,0.28);
    margin-bottom: 28px;
  }
  .vp-cta-title {
    font-family: var(--vp-font-display);
    font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 700;
    letter-spacing: -0.03em; line-height: 1.12;
    color: var(--vp-on-surface); margin-bottom: 16px;
  }
  .vp-cta-sub {
    font-family: var(--vp-font-body);
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    font-weight: 400; line-height: 1.8;
    color: var(--vp-on-surface-var);
    max-width: 520px; margin: 0 auto 40px;
  }
  .vp-ig-handle {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 20px; border-radius: var(--vp-r-pill);
    background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.1);
    font-family: var(--vp-font-display); font-size: 13px; font-weight: 600;
    color: var(--vp-on-surface-var); margin-top: 28px; letter-spacing: 0.02em;
  }
  .vp-ig-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #bc1888;
    animation: vp-pulse 2s ease-in-out infinite;
  }
  @keyframes vp-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.5; transform: scale(0.85); }
  }

  /* ── FOOTER ── */
  .vp-footer {
    position: relative; z-index: 1;
    padding: 48px clamp(20px, 6vw, 80px) 40px;
    max-width: 1280px; margin: 80px auto 0;
    border-top: 1px solid var(--vp-outline-var);
    display: flex; align-items: center;
    justify-content: space-between; flex-wrap: wrap; gap: 16px;
  }
  .vp-footer-copy {
    font-size: 12px; color: var(--vp-outline);
    font-family: var(--vp-font-body); letter-spacing: 0.02em;
  }
  .vp-footer-links { display: flex; gap: 24px; }
  .vp-footer-links a {
    font-size: 12px; color: var(--vp-outline);
    font-family: var(--vp-font-body); text-decoration: none;
    letter-spacing: 0.02em; transition: color 0.2s;
  }
  .vp-footer-links a:hover { color: var(--vp-on-surface); }

  @keyframes vp-shimmer-gold {
    0%   { background-position: 200% center; }
    100% { background-position: -100% center; }
  }

  /* ── Mobile nav ── */
  .vp-mobile-nav {
    position: fixed; inset: 0; z-index: 1100;
    background: rgba(248,247,245,0.97);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    transform: translateX(100%);
    transition: transform .45s cubic-bezier(.16,1,.3,1);
    display: flex; flex-direction: column;
    justify-content: center; align-items: center; gap: 32px;
  }
  .vp-mobile-nav.open { transform: translateX(0); }
  .vp-mobile-nav-close {
    position: absolute; top: 20px; right: 20px; z-index: 1101;
    background: none; border: none; color: rgba(26,18,9,0.5); cursor: pointer; padding: 4px;
  }
  .vp-mobile-nav a {
    font-family: var(--vp-font-display);
    font-size: 28px; font-weight: 600;
    color: var(--vp-on-surface); text-decoration: none;
    letter-spacing: -0.02em; transition: color 0.2s;
  }
  .vp-mobile-nav a.active { color: var(--vp-accent); }
  .vp-nav-links-desktop { display: flex; align-items: center; gap: 12px; }
  @media(max-width: 833px) {
    .vp-nav-links-desktop { display: none !important; }
    .vp-nav-hamburger { display: block !important; }
  }
  .vp-nav-hamburger {
    display: none; background: none; border: none;
    color: rgba(26,18,9,0.7); cursor: pointer; padding: 4px;
  }

  @media (max-width: 480px) {
    .vp-hero-stats { gap: 20px; }
    .vp-cta-inner  { padding: 48px 24px; border-radius: 20px; }
    .vp-footer     { flex-direction: column; align-items: flex-start; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────
   CSS INJECTION — runs synchronously at module load time (before first paint)
   This eliminates the Flash of Unstyled Content (FOUC) that occurs when
   styles are injected inside useEffect (which fires after the first render).
───────────────────────────────────────────────────────────────────────── */
(function injectPageStyles() {
  const id = "vastu-video-page-styles";
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = DESIGN_CSS;
  document.head.appendChild(tag);
})();

function usePageStyles() {
  // No-op: styles are now injected synchronously at module load above.
  // Kept so call sites don't need to change.
}

/* ─────────────────────────────────────────────────────────────────────────
   SVG GLASS FILTER
───────────────────────────────────────────────────────────────────────── */
function GlassFilter() {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id="liquid-glass-filter"
          x="0%" y="0%" width="100%" height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise" baseFrequency="0.05 0.05"
            numOctaves="1" seed="1" result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic" in2="blurredNoise"
            scale="70" xChannelSelector="R" yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LIQUID BUTTON COMPONENT
───────────────────────────────────────────────────────────────────────── */
function LiquidButton({
  children,
  href,
  onClick,
  size = "md",
  variant = "default",
  style = {},
  className = "",
  ...rest
}) {
  const Tag = href ? "a" : "button";
  const isExternal = href && /^https?:\/\//.test(href);
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  const sizeStyles = {
    sm:  { padding: "10px 24px", fontSize: 14 },
    md:  { padding: "14px 32px", fontSize: 16 },
    lg:  { padding: "18px 44px", fontSize: 18 },
  };

  const variantStyles = {
    default: {
      glassGradient: "linear-gradient(135deg, rgba(26,18,9,0.12) 0%, rgba(26,18,9,0.06) 50%, rgba(0,0,0,0.04) 100%)",
      glassBorder:   "1px solid rgba(26,18,9,0.18)",
      glassGlow:     "0 0 20px rgba(26,18,9,0.06)",
      textColor:     "#1a1209",
    },
    gold: {
      glassGradient: "linear-gradient(135deg, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.10) 50%, rgba(255,255,255,0.06) 100%)",
      glassBorder:   "1px solid rgba(201,168,76,0.52)",
      glassGlow:     "0 0 24px rgba(201,168,76,0.32)",
      textColor:     "#7a5a00",
    },
    instagram: {
      glassGradient: "linear-gradient(135deg, rgba(220,39,67,0.18) 0%, rgba(188,24,136,0.10) 50%, rgba(255,255,255,0.04) 100%)",
      glassBorder:   "1px solid rgba(220,39,67,0.35)",
      glassGlow:     "0 0 24px rgba(188,24,136,0.22)",
      textColor:     "#fff",
    },
  };

  const vStyle = variantStyles[variant] || variantStyles.default;
  const sStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <Tag
      href={href}
      onClick={onClick}
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        ...sStyle,
        borderRadius: 9999,
        cursor: "pointer",
        textDecoration: "none",
        fontFamily: "var(--vp-font-display)",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: vStyle.textColor,
        border: "none",
        background: "transparent",
        transition: "transform 0.35s cubic-bezier(.16,1,.3,1)",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      onMouseDown={e  => (e.currentTarget.style.transform = "scale(0.96)")}
      onMouseUp={e    => (e.currentTarget.style.transform = "scale(1.06)")}
      {...externalProps}
      {...rest}
    >
      {/* Layer 0 — liquid glass distortion backdrop */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, borderRadius: 9999,
          backdropFilter: 'url("#liquid-glass-filter") blur(0px)',
          WebkitBackdropFilter: 'url("#liquid-glass-filter") blur(0px)',
          zIndex: 0,
        }}
      />
      {/* Layer 1 — glass shell */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, borderRadius: 9999, zIndex: 1,
          background: vStyle.glassGradient,
          border: vStyle.glassBorder,
          boxShadow: [
            "0 0 6px rgba(0,0,0,0.04)",
            "0 2px 8px rgba(0,0,0,0.08)",
            "inset 3px 3px 0.5px -3px rgba(255,255,255,0.5)",
            "inset -3px -3px 0.5px -3px rgba(255,255,255,0.3)",
            "inset 1px 1px 1px -0.5px rgba(255,255,255,0.7)",
            "inset -1px -1px 1px -0.5px rgba(255,255,255,0.5)",
            "inset 0 0 8px 6px rgba(255,255,255,0.15)",
            vStyle.glassGlow,
          ].join(","),
        }}
      />
      {/* Layer 2 — top glare streak */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2, left: "12%", right: "12%", height: 1,
          borderRadius: 9999,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.80), transparent)",
          zIndex: 2,
        }}
      />
      {/* Layer 3 — content */}
      <span style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", gap: 10 }}>
        {children}
      </span>
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SPARKLES TEXT
───────────────────────────────────────────────────────────────────────── */
function SparkleParticle({ id, x, y, color, delay, scale }) {
  return (
    <motion.svg
      key={id}
      style={{ pointerEvents: "none", position: "absolute", zIndex: 20 }}
      initial={{ opacity: 0, left: x, top: y }}
      animate={{ opacity: [0, 1, 0], scale: [0, scale, 0], rotate: [75, 120, 150] }}
      transition={{ duration: 0.8, repeat: Infinity, delay }}
      width="16" height="16" viewBox="0 0 21 21"
    >
      <path
        d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
        fill={color}
      />
    </motion.svg>
  );
}

function SparklesText({ text, colors = { first: "#C9A84C", second: "#B8860B" }, sparklesCount = 8, style = {}, textStyle = {} }) {
  const [sparkles, setSparkles] = useState([]);
  const lastUpdateRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const gen = () => {
      const x = `${Math.random() * 100}%`, y = `${Math.random() * 100}%`;
      return {
        id: `${x}-${y}-${Date.now()}-${Math.random()}`,
        x, y,
        color: Math.random() > 0.5 ? colors.first : colors.second,
        delay: Math.random() * 2,
        scale: Math.random() * 1 + 0.3,
        lifespan: Math.random() * 10 + 5,
      };
    };
    setSparkles(Array.from({ length: sparklesCount }, gen));
    const tick = (now) => {
      rafRef.current = requestAnimationFrame(tick);
      if (now - lastUpdateRef.current < 400) return;
      lastUpdateRef.current = now;
      setSparkles(cur => cur.map(s => s.lifespan <= 0 ? gen() : { ...s, lifespan: s.lifespan - 0.4 }));
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [colors.first, colors.second, sparklesCount]);

  return (
    <span style={{ display: "inline-block", position: "relative", ...style }}>
      {sparkles.map(s => <SparkleParticle key={s.id} {...s} />)}
      <strong style={{ position: "relative", zIndex: 1, ...textStyle }}>{text}</strong>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   VIDEO DATA
───────────────────────────────────────────────────────────────────────── */
const VIDEO_DATA = [
  {
    id: "vv1",
    title: "भूमि दोष: नया घर और ये 8 गलतियाँ!",
    titleEn: "New Home: 8 Fatal Vastu Mistakes!",
    description: "जब भी हम नया घर बनाते हैं तो भूमि खनन और जीव-जंतुओं की हत्या से भूमि दोष और अन्य दोष लगते हैं। वास्तु शास्त्र कहता है कि ऐसे आठ प्रकार के दोष होते हैं, जिन्हें दूर करने के लिए वास्तु शांति और गृह प्रवेश पूजन करना आवश्यक है।",
    fullDescription: "जब भी हम नया घर बनाते हैं तो भूमि खनन और जीव-जंतुओं की हत्या से भूमि दोष और अन्य दोष लगते हैं। वास्तु शास्त्र कहता है कि ऐसे आठ प्रकार के दोष होते हैं, जिन्हें दूर करने के लिए वास्तु शांति और गृह प्रवेश पूजन करना आवश्यक है।",
    descriptionEn: "Building a new house causes Vastu defects through excavation and harming small creatures. Vastu Shastra identifies eight such defects, which require Vastu Shanti and Griha Pravesh Puja to fix.",
    fullDescriptionEn: "Building a new house causes Vastu defects through excavation and harming small creatures. Vastu Shastra identifies eight such defects, which require Vastu Shanti and Griha Pravesh Puja to fix.",
    transcript: `Namaskar doston. Aaj hum baat karenge ek bahut zaroori vishay ke baare mein — naye ghar mein hone wale Bhoomi Dosh ke baare mein.

Jab bhi hum naya ghar banate hain, toh zameen ki khudaai hoti hai. Is khudaai mein kai chhote-chhote jeev-jantu maare jaate hain — cheentiyan, keede, aur bhoomi mein rehne wale prani. Vastu Shastra kehta hai ki yeh Bhoomi Dosh ka kaaran banta hai — yaani zameen ka dosh.

Vastu Shastra mein aath prakar ke Bhoomi Dosh bataye gaye hain:
Pehla — Angarak Dosh: khoon ya maas ki boo wali zameen.
Doosra — Shwabhav Dosh: zameen ka swabhav sahi na hona.
Teesra — Jal Dosh: ghar ke neeche paani ki naali ya puraana kuan hona.
Chautha — Agni Dosh: zameen mein puraani raakh ya jalii hui cheezein hona.
Paanchva — Vaayu Dosh: zameen ke neeche gas ya dabaav ka hona.
Chhatha — Aakash Dosh: upar se koi negative energy ya beam ka effect.
Saatva — Prithvi Dosh: zameen ka dhalna ya titna.
Aathva — Bhoomi Sthapana Dosh: ghar ki neenv galat jagah rakhna.

In sab doshon ka nivaaran karne ke liye Vastu Shaanti puja aur Griha Pravesh puja karwana bahut zaroori hai. Isse ghar mein positive energy aati hai, parivar sukhi rehta hai, aur sampannata aati hai.

Agar aap naya ghar bana rahe hain ya khareed rahe hain, toh pehle ek vastu visheshagya se salah zaroor lein. Main hoon Pandit Aman Bhatore — online aur offline dono tarah ki vastu salah ke liye aap mujhse sampark kar sakte hain.`,
    category: "SPATIAL HARMONY",
    duration: "0:40",
    thumbnail: "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_00000000ed607208bced0eaeadd7c4a6.png?updatedAt=1780218015100&ik-s=d9172b1bca1681c9ded134ee116f3ff79564c616",
    youtubeUrl: "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/VID-20260531-WA0002.mp4?updatedAt=1780218132547&ik-s=f521452a311e40fb7a8b71b81c0c1678f1959cfa",
  },
  {
    id: "vv2",
    title: "घर में विनाशक दोष",
    titleEn: "Destructive flaw in the house",
    description: "डेढ़ लाख रुपये खर्च करके पूरे घर की रेमेडी करवाई...लेकिन फायदा नहीं हुआ। आखिर में पता चला असली दोष घर के इसी हिस्से में छिपा था। क्या आपके घर में भी यही गलती है? एक बार जरूर चेक करें।",
    fullDescription: "डेढ़ लाख रुपये खर्च करके पूरे घर की रेमेडी करवाई...लेकिन फायदा नहीं हुआ। आखिर में पता चला असली दोष घर के इसी हिस्से में छिपा था। क्या आपके घर में भी यही गलती है? एक बार जरूर चेक करें।, वास्तु लेंस के माध्यम से रंग सिद्धांत और किसी भी शयनकक्ष लेआउट में नकारात्मक ऊर्जा क्षेत्रों को बेअसर करने के तरीके बताती है।",
    descriptionEn: "Spent one and a half lakh rupees (Rs. 1,50,000) to get remedies done for the entire house... but it didn't help. Finally, it was discovered that the real defect was hidden in this exact part of the house. Does your home have the same mistake too? Make sure to check it once.",
    fullDescriptionEn: "Spent one and a half lakh rupees (Rs. 1,50,000) to get remedies done for the entire house... but it didn't help. Finally, it was discovered that the real defect was hidden in this exact part of the house. Does your home have the same mistake too? Make sure to check it once.",
    transcript: `Namaskar doston. Aaj main aapko ek aisi sacchi kahani sunata hoon jo bahut log jhel rahe hain.

Ek parivar ne apne ghar ki vastu remedies par poore dedh lakh rupaye kharch kiye. Patthar badle, rang badle, yantra lagwaye — sab kuch kiya. Lekin ghar mein na sukh aaya, na samridhi. Pareshaniyan jaari raheen.

Phir unho ne mujhse sampark kiya. Main ghar gaya, compass liya, aur poora ghar check kiya. Aur tab pata chala — asli dosh ghar ke ek khaas hisse mein chhupa tha jise pehle kisi ne dhyan hi nahi diya tha.

Yeh tha unka Brahmasthana — yaani ghar ka madhya bhaag — jo bilkul block tha. Ek bhari almari wahan rakhi thi, puri sunlight rok rahi thi, aur energy ka flow ruka hua tha. Vastu Shastra ke anusaar, Brahmasthana ko hamesha khula aur saaf rakhna chahiye. Yahan koi bhaari furniture, pillar, ya tooti cheez nahi honi chahiye.

Jab hum ne woh almari hatai aur Brahmasthana ko saaf kiya, toh kuch hi hafte mein parivar ne farq mahsoos karna shuru kar diya.

Doston, agar aapke ghar mein bhi lagaatar pareshaniyan hain — bimari, kharcha, jhagde — toh ek baar apna Brahmasthana zaroor check karein. Kya woh saaf hai? Kya wahan roshni aati hai?

Main hoon Pandit Aman Bhatore. Vastu Dosh aur uske upay ke liye mujhse online ya offline sampark karein.`,
    category: "SPATIAL HARMONY",
    duration: "1:06",
    thumbnail: "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_0000000001e471f8bedea56eec0f13f8.png?updatedAt=1780218014310&ik-s=fbb611ef5caeac84da6956b7b2b50dda738ecbac",
    youtubeUrl: "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/VID-20260531-WA0005.mp4?updatedAt=1780218024734&ik-s=c6130f311371775a22910cdd5648f2f4d3003888",
  },
  {
    id: "vv3",
    title: "बिमारी और कर्ज़ा: कारण और वास्तु उपाय",
    titleEn: "Illness & Debt: The Vastu Link",
    description: "दोस्तों, कई बार घर में कोई न कोई बीमार ही रहता है और पैसों का खर्च बढ़ता जाता है। क्या आपने सोचा है कि इसके पीछे वास्तु दोष भी हो सकता है? अग्नि कोण, ईशान कोण और नैऋत्य कोण में बने लेटबाथ, या गलत जगह बने दरवाज़े - ये सब गंभीर स्वास्थ्य समस्याओं के कारण बनते हैं।",
    fullDescription: "दोस्तों, कई बार घर में कोई न कोई बीमार ही रहता है और पैसों का खर्च बढ़ता जाता है। क्या आपने सोचा है कि इसके पीछे वास्तु दोष भी हो सकता है? अग्नि कोण, ईशान कोण और नैऋत्य कोण में बने लेटबाथ, या गलत जगह बने दरवाज़े - ये सब गंभीर स्वास्थ्य समस्याओं के कारण बनते हैं।",
    descriptionEn: "Friends, many times someone or the other in the house constantly falls ill and expenses keep increasing. Have you ever thought that a Vastu defect could be behind this? Toilets and bathrooms built in the Southeast (Agni Kona), Northeast (Ishaan Kona), and Southwest (Nairitya Kona), or doors placed in the wrong direction—all of these are causes of serious health problems.",
    fullDescriptionEn: "Friends, many times someone or the other in the house constantly falls ill and expenses keep increasing. Have you ever thought that a Vastu defect could be behind this? Toilets and bathrooms built in the Southeast (Agni Kona), Northeast (Ishaan Kona), and Southwest (Nairitya Kona), or doors placed in the wrong direction—all of these are causes of serious health problems.",
    transcript: `Namaskar doston. Main hoon Pandit Aman Bhatore, aur aaj hum baat karenge ek aisi problem ke baare mein jo bahut gharon mein hoti hai — lagaatar bimari aur badh ta karz.

Kya aapke ghar mein bhi koi na koi hamesha beemar rehta hai? Dawaiyon ka kharcha badh raha hai? Savings khatam ho rahi hain? Toh ek baar apne ghar ka Vastu zaroor check karein.

Vastu Shastra ke anusaar, kuch khaas dishaaon mein bane bathroom aur toilet ghar mein negative energy failaate hain jo seedha health aur finance ko nuksaan pahunchati hai.

Teesra — Agni Kona yaani South-East direction. Yahan bathroom hona Agni tatva ko kharab karta hai, jisse ghar mein bimari aati hai.

Doosra — Ishaan Kona yaani North-East direction. Yeh Jal tatva aur puja ka kona hai. Yahan shauchalay hona bohot badi galti hai — isse rishton mein tanaav aata hai aur paise nahi tikते.

Teesra — Nairitya Kona yaani South-West. Yeh sthirta ka kona hai. Yahan toilet hone se ghar ke mukhiya ki sehat kharab hoti hai aur karz badhta hai.

Iske alawa, galat jagah bane darwaaze bhi negative energy ka raasta bante hain.

Upay kya hain? Agar aap in dishaaon mein bathroom hata nahi sakte, toh copper strips lagwayein, sea salt rakhein, aur Vastu yantra ka upyog karein. Aur sabse zaroori — ek anubhavi Vastu consultant se milein.

Main hoon Pandit Aman Bhatore — online aur offline Vastu consultation ke liye aaj hi sampark karein aur apne ghar ko rogmukt aur rin-mukt banayein.`,
    category: "WELLNESS",
    duration: "0:55",
    thumbnail: "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_0000000057a07208a3d56791ec6e83f2.png?updatedAt=1780218014446&ik-s=36a9b24951b006123a4776a88a187903da00bcf7",
    youtubeUrl: "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/VID-20260531-WA0001.mp4?updatedAt=1780218023481&ik-s=1e835a828ffc3d0b5a0403b90319879245517b89",
  },
  {
    id: "vv4",
    title: "दुकान/फैक्ट्री में पैसा नहीं टिक रहा?",
    titleEn: "Business Losing Money? Check This Vastu!",
    description: "बिजनेस में लगातार रुकावट, मजदूर टिक नहीं रहे और पैसा नहीं रुक रहा? हो सकता है वजह आपकी मशीन की गलत दिशा हो ! जानिए ईशान कोण से जुड़ी यह महत्वपूर्ण वास्तु जानकारी। ",
    fullDescription: "बिजनेस में लगातार रुकावट, मजदूर टिक नहीं रहे और पैसा नहीं रुक रहा? हो सकता है वजह आपकी मशीन की गलत दिशा हो ! जानिए ईशान कोण से जुड़ी यह महत्वपूर्ण वास्तु जानकारी। ",
    descriptionEn: "Frequent business disruptions, high staff turnover, and money loss? Your machinery direction could be wrong! Learn key Northeast (Ishan) Vastu tips here.",
    fullDescriptionEn: "Frequent business disruptions, high staff turnover, and money loss? Your machinery direction could be wrong! Learn key Northeast (Ishan) Vastu tips here.",
    transcript: `Namaskar doston. Main hoon Pandit Aman Bhatore. Aaj hum baat karenge ek bahut important topic ke baare mein — dukaan ya factory mein paisa kyun nahi tikta.

Agar aapke business mein lagaatar rukawatein aa rahi hain, mazdoor nahi tik rahe, customers nahi aa rahe, aur paisa kama ke bhi haath mein nahi rehta — toh yeh sirf market ka problem nahi hai. Kaafi baar iska karan Vastu Dosh hota hai.

Sabse common problem jo main dekhta hoon commercial properties mein — woh hai machinon ki galat disha.

Vastu Shastra kehta hai ki bhaari machinery aur industrial equipment ko South, South-West, ya West disha mein rakhna chahiye. Yeh sthir dishaayein hain — inse production stable rehti hai, mazdoor tikke rehte hain, aur kaam mein continuity aati hai.

Lekin agar machinery North-East yaani Ishaan Kona mein rakhi hai — toh yeh bahut bada Vastu Dosh hai. Ishaan Kona Jal tatva aur devo ka kona hai. Yahan bhaari equipment rakhne se yeh kona dab jaata hai. Iska seedha asar hota hai — business mein rukawat, financial loss, aur mazdooron ka aana-jaana.

Doosri common galti — owner ya manager ki kursi ka South ya West ki taraf peeth hona. Owner ko hamesha North ya East ki taraf munh karke baithna chahiye. Isse decision-making power aur financial growth badti hai.

Teesra — cash counter ya till machine ko North direction mein rakhein. North Kubera ka kona hai — dhan ki disha. Isse cash flow improve hota hai.

Agar aap apni factory ya dukaan ka Vastu check karwana chahte hain, toh mujhse online ya offline sampark karein. Floor plan aur photo bhejkar bhi remote consultation ho sakti hai.`,
    category: "BUSINESS GROWTH",
    duration: "1:04",
    thumbnail: "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_00000000778872089f40bb813884269a.png?updatedAt=1780218014534&ik-s=e0e7f459144c7dbf50aa5c539edca5d05c000f57",
    youtubeUrl: "https://ik.imagekit.io/h2kruhqvd/VideoGalleryByAman/Video1.mp4",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   VIDEO CARD
   ── Buffering strategy ──────────────────────────────────────────────────
   1. Page load        → nothing fetched (preload="none"), zero bandwidth waste
   2. User hovers card → Range: bytes=0-524288 fetch fires silently
                         (512 KB ≈ first 8–10 s of compressed video)
                         Browser caches this chunk; server responds 206
   3. User clicks play → <video> mounts with preload="none" so it immediately
                         reads the already-cached first chunk → plays instantly
   4. onPlay fires     → preload flipped to "auto" so the browser fetches the
                         remaining bytes in the background while the user watches
   5. User reaches ~8s → next portion already buffered → zero stall
   ── Bug fixes ───────────────────────────────────────────────────────────
   FIX 1 — Single active video: activeVideoId/setActiveVideoId lifted to
            VideoGrid parent. When this card starts playing it registers
            itself as active; when another card becomes active this card
            pauses and resets to thumbnail automatically.
   FIX 2 — Scroll-away auto-pause: a second IntersectionObserver watches
            the .vp-thumb element at threshold=0 (fires the instant even
            1px leaves the viewport). When the video scrolls out of view
            it pauses. It does NOT auto-resume — user must press play
            manually. Works identically on mobile, tablet, and desktop
            because IntersectionObserver is viewport-aware on all devices.
───────────────────────────────────────────────────────────────────────── */
function VideoCard({ video, index, activeVideoId, setActiveVideoId }) {
  const [expanded,    setExpanded]    = useState(false);
  const [visible,     setVisible]     = useState(false);
  const [translated,  setTranslated]  = useState(false);
  const [playing,     setPlaying]     = useState(false);
  const cardRef      = useRef(null);
  const thumbRef     = useRef(null); // watched by scroll-away observer
  const videoRef     = useRef(null);
  const preloadedRef = useRef(false); // guard against duplicate hover fetches

  // ── Scroll-reveal (card entrance animation) ──────────────────────────
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── FIX 2: Scroll-away auto-pause ────────────────────────────────────
  // Watches the thumb/player frame. threshold:0 means the callback fires
  // the instant any part of the element exits the viewport — works on all
  // devices. Does NOT resume on re-entry; that is intentional by design.
  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      },
      { threshold: 0 } // fires the moment element is even 1px out of view
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []); // intentionally no deps — observer is set up once and lives forever

  // ── FIX 1: Pause this card when another card becomes active ──────────
  useEffect(() => {
    if (activeVideoId !== video.id && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      // Do NOT reset currentTime — user may want to resume where they left off
    }
    // If activeVideoId changed away from us and we were playing, close the player
    if (activeVideoId !== video.id && playing) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setPlaying(false);
      preloadedRef.current = false;
    }
  }, [activeVideoId, video.id, playing]);

  // ── Step 2: Hover → range-fetch first 512 KB into browser cache ──────
  const handleMouseEnter = useCallback(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    fetch(video.youtubeUrl, {
      headers: { Range: "bytes=0-524288" },
    }).catch(() => {});
  }, [video.youtubeUrl]);

  // ── Step 3: Play button clicked ──────────────────────────────────────
  const handlePlay = () => {
    setActiveVideoId(video.id); // FIX 1: tell siblings to stop
    setPlaying(true);
  };

  // ── Step 3 cont: once <video> mounts, autoplay ───────────────────────
  useEffect(() => {
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [playing]);

  // ── Step 4: onPlay → background buffering for rest of file ───────────
  const handleVideoPlay = () => {
    if (videoRef.current) {
      videoRef.current.preload = "auto";
    }
  };

  // ── Close → pause, reset, return to thumbnail ────────────────────────
  const handleClose = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setPlaying(false);
    setActiveVideoId(null); // release the active slot
    preloadedRef.current = false;
  };

  const shortDesc = translated ? video.descriptionEn     : video.description;
  const fullDesc  = translated ? video.fullDescriptionEn : video.fullDescription;
  const cardTitle = translated ? video.titleEn            : video.title;

  return (
    <div
      ref={cardRef}
      className="vp-card"
      onMouseEnter={handleMouseEnter}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: [
          `opacity   0.7s cubic-bezier(.16,1,.3,1) ${index * 0.14}s`,
          `transform 0.7s cubic-bezier(.16,1,.3,1) ${index * 0.14}s`,
        ].join(", "),
      }}
    >
      {/* Author row */}
      <div className="vp-author">
        <div className="vp-avatar" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="18" fill="rgba(201,168,76,0.12)" />
            <text x="18" y="23" textAnchor="middle" fontSize="16" fontFamily="serif" fill="#C9A84C">ॐ</text>
          </svg>
        </div>
        <div>
          <div className="vp-author-name">Pandit Aman Bhatore</div>
          <div className="vp-author-role">Vastu Consultant</div>
        </div>
      </div>

      {/* Thumbnail / Inline Player — ref watched by scroll-away observer */}
      <div className="vp-thumb" ref={thumbRef}>
        {playing ? (
          <>
            <video
              ref={videoRef}
              className="vp-video-player"
              src={video.youtubeUrl}
              poster={video.thumbnail}
              preload="none"
              controls
              playsInline
              onPlay={handleVideoPlay}
              aria-label={cardTitle}
            />
            <button
              className="vp-video-close"
              onClick={handleClose}
              aria-label="Close video"
              title="Close"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <img src={video.thumbnail} alt={cardTitle} loading="lazy" />
            <div className="vp-thumb-overlay" />
            <div className="vp-duration">{video.duration}</div>
            <button
              className="vp-play"
              onClick={handlePlay}
              aria-label={`Play ${cardTitle}`}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Body */}
      <div className="vp-body">
        <h3 className="vp-card-title">{cardTitle}</h3>
        <p className="vp-card-desc">
          {expanded ? fullDesc : shortDesc}
          {" "}
          <button className="vp-more" onClick={() => setExpanded(v => !v)}>
            {expanded ? "less" : "more"}
          </button>
        </p>
        <div className="vp-meta">
          <span className="vp-tag">{video.category}</span>
          <button
            className="vp-translate-btn"
            onClick={() => { setTranslated(v => !v); setExpanded(false); }}
            aria-label={translated ? "See original in Hindi" : "See English translation"}
          >
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" />
              <path d="M2 5h12" /><path d="M7 2h1" />
              <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
            </svg>
            {translated ? "See original" : "See translation"}
          </button>
        </div>
      </div>

      {/* Transcript — crawlable by Googlebot, collapsed by default for users */}
      <details className="vp-transcript">
        <summary>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Video Transcript
        </summary>
        <div className="vp-transcript-body">{video.transcript}</div>
      </details>

      <div className="vp-card-gold-line" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   VIDEO GRID — owns activeVideoId so only one video plays at a time
───────────────────────────────────────────────────────────────────────── */
function VideoGrid() {
  const [activeVideoId, setActiveVideoId] = useState(null);
  return (
    <div className="vp-grid">
      {VIDEO_DATA.map((video, i) => (
        <VideoCard
          key={video.id}
          video={video}
          index={i}
          activeVideoId={activeVideoId}
          setActiveVideoId={setActiveVideoId}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   NAV LINKS
───────────────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "About",          href: "/#about"    },
  { label: "Video Guidance", href: "/video-guidance", active: true },
  { label: "Gallery",        href: "/#gallery"  },
  { label: "Contact",        href: "/#contact"  },
];

/* ─────────────────────────────────────────────────────────────────────────
   PILL NAV LINKS
───────────────────────────────────────────────────────────────────────── */
function NavPillLinks({ links }) {
  const [cursor, setCursor] = useState({ left: 0, width: 0, opacity: 0 });
  const refs = useRef({});

  const handleEnter = useCallback((href) => {
    const el = refs.current[href];
    if (!el) return;
    const { width } = el.getBoundingClientRect();
    setCursor({ left: el.offsetLeft, width, opacity: 1 });
  }, []);

  const handleLeave = useCallback(() => {
    setCursor(prev => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <ul
      onMouseLeave={handleLeave}
      style={{
        position: "relative",
        display: "flex", alignItems: "center",
        listStyle: "none", margin: 0,
        padding: "3px", gap: 0,
        borderRadius: 9999,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.04)",
      }}
    >
      {/* Sliding gold cursor */}
      <li
        aria-hidden="true"
        style={{
          position: "absolute", top: 3,
          height: "calc(100% - 6px)",
          borderRadius: 9999,
          background: "rgba(184,134,11,0.12)",
          left: cursor.left, width: cursor.width, opacity: cursor.opacity,
          transition: "left 0.22s cubic-bezier(.16,1,.3,1), width 0.22s cubic-bezier(.16,1,.3,1), opacity 0.18s ease",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      {links.map((l) => (
        <li
          key={l.href}
          ref={el => { refs.current[l.href] = el; }}
          onMouseEnter={() => handleEnter(l.href)}
          style={{ position: "relative", zIndex: 1 }}
        >
          <a
            href={l.href}
            style={{
              display: "block",
              padding: "5px 14px",
              fontFamily: "var(--vp-font-display)",
              fontSize: 15, fontWeight: 600,
              letterSpacing: "0.01em",
              color: l.active ? "var(--vp-accent)" : "var(--vp-on-surface)",
              textDecoration: "none",
              mixBlendMode: "normal",
              whiteSpace: "nowrap",
              borderRadius: 9999,
              borderBottom: l.active ? "2px solid var(--vp-accent)" : "2px solid transparent",
              paddingBottom: l.active ? "3px" : "5px",
            }}
            aria-current={l.active ? "page" : undefined}
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────────────── */
function PageNav() {
  const [atTop, setAtTop]           = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setAtTop(window.scrollY < 60);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const closeMenu = () => {
    setMobileOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <>
      <nav className={`vp-nav${atTop ? " vp-nav--top" : ""}`}>
        {/* Logo */}
        <a className="vp-nav-logo" href="/" aria-label="Pandit Aman Bhatore — Home">
          <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21" stroke="url(#pgNavGold)" strokeWidth="1.2" fill="rgba(201,120,20,0.10)" />
              <circle cx="22" cy="22" r="17.5" stroke="url(#pgNavGold)" strokeWidth="0.7" strokeDasharray="2.2 2.8" fill="none" />
              {[0,45,90,135,180,225,270,315].map((deg, i) => {
                const r = 20, rad = (deg * Math.PI) / 180;
                return <circle key={i} cx={22 + r * Math.sin(rad)} cy={22 - r * Math.cos(rad)} r="0.9" fill="#E8922A" opacity="0.85" />;
              })}
              <text x="22" y="27" textAnchor="middle" fontSize="18" fontFamily="serif" fill="url(#pgNavGold)">ॐ</text>
              <defs>
                <linearGradient id="pgNavGold" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#FF9933" />
                  <stop offset="50%"  stopColor="#E8C96A" />
                  <stop offset="100%" stopColor="#C97820" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="vp-nav-logo-sub">Pandit</div>
            <div className="vp-nav-logo-title">Aman Bhatore</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="vp-nav-links-desktop">
          <NavPillLinks links={NAV_LINKS} />
          <LiquidButton
            onClick={() => navigate("/#consultation")}
            size="sm"
            variant="gold"
            style={{ fontSize: 13, padding: "7px 18px", fontWeight: 700 }}
          >
            Book Session
          </LiquidButton>
        </div>

        {/* Mobile hamburger */}
        <button
          className="vp-nav-hamburger"
          aria-label="Open menu"
          onClick={() => { setMobileOpen(true); document.body.style.overflow = "hidden"; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Mobile slide-out menu */}
      <div className={`vp-mobile-nav${mobileOpen ? " open" : ""}`} role="dialog" aria-modal="true">
        <button className="vp-mobile-nav-close" aria-label="Close menu" onClick={closeMenu}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {NAV_LINKS.map(l => (
          <a
            key={l.href}
            href={l.href}
            className={l.active ? "active" : ""}
            onClick={closeMenu}
          >
            {l.label}
          </a>
        ))}

        <LiquidButton
          onClick={() => { closeMenu(); navigate("/#consultation"); }}
          size="md"
          variant="gold"
          style={{ marginTop: 8, fontSize: 18, padding: "14px 36px" }}
        >
          Book Session
        </LiquidButton>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────────────────────── */
function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <header
      className="vp-hero"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {/* Eyebrow */}
      <div className="vp-eyebrow">
        <span className="vp-eyebrow-line" />
        Expert Curation
        <span className="vp-eyebrow-line vp-eyebrow-line--r" />
      </div>

      {/* Title */}
      <h1 className="vp-hero-title">
        Vastu Video{" "}
        <SparklesText
          text="Insights"
          colors={{ first: "#C9A84C", second: "#B8860B" }}
          sparklesCount={9}
          textStyle={{
            background: "linear-gradient(135deg, #B8860B 0%, #C9A84C 45%, #B8860B 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        />
      </h1>

      {/* Subtitle */}
      <p className="vp-hero-sub">
        Learn practical Vastu principles through expert video guidance.
        Discover the ancient science of spatial harmony translated for
        the modern luxury home.
      </p>


    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   INSTAGRAM CTA SECTION
───────────────────────────────────────────────────────────────────────── */
function InstagramCTA() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="vp-cta">
      <div
        ref={ref}
        className="vp-cta-inner"
        style={{
          opacity:   visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(36px)",
          transition: "opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <div className="vp-cta-blob vp-cta-blob--1" aria-hidden="true" />
        <div className="vp-cta-blob vp-cta-blob--2" aria-hidden="true" />

        {/* Instagram gradient ring icon */}
        <div className="vp-cta-ig-ring" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
          </svg>
        </div>

        <h2 className="vp-cta-title">Explore More on Instagram</h2>

        <p className="vp-cta-sub">
          Discover exclusive Vastu insights, practical daily tips, and
          behind-the-scenes content from Pandit Aman Bhatore's consultations
          — all on Instagram.
        </p>

        <LiquidButton
          href="https://www.instagram.com/p.amanbhatore/"
          size="lg"
          variant="gold"
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
          </svg>
          Follow on Instagram
        </LiquidButton>

        <div className="vp-ig-handle">
          <span className="vp-ig-dot" />
          @p.amanbhatore

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ROOT PAGE EXPORT
───────────────────────────────────────────────────────────────────────── */
export default function VastuVideoGuidancePage() {
  usePageStyles();

  return (
    <div className="vp-root">
      <Helmet>
        {/* ── Fonts: preconnect first, then stylesheet — eliminates FOUC & render-blocking ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        />

        {/* ── Primary meta ── */}
        <html lang="hi" />
        <title>Free Vastu Guidance Videos | Pandit Aman Bhatore</title>
        <meta
          name="description"
          content="Watch free Vastu Shastra videos by Pandit Aman Bhatore. Learn about Vastu dosh, home energy remedies, business growth tips & more. In Hindi & English."
        />
        <meta name="keywords" content="vastu video guidance, vastu shastra videos hindi, vastu dosh remedies video, pandit aman bhatore videos, vastu for new home, vastu for business loss" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://panditamanbhatore.com/video-guidance" />

        {/* ── hreflang: page serves Hindi + English content ── */}
        <link rel="alternate" hrefLang="en-in" href="https://panditamanbhatore.com/video-guidance" />
        <link rel="alternate" hrefLang="hi-in" href="https://panditamanbhatore.com/video-guidance" />
        <link rel="alternate" hrefLang="x-default" href="https://panditamanbhatore.com/video-guidance" />

        {/* ── Open Graph ── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://panditamanbhatore.com/video-guidance" />
        <meta property="og:site_name" content="Pandit Aman Bhatore" />
        <meta property="og:title" content="Free Vastu Guidance Videos | Pandit Aman Bhatore" />
        <meta
          property="og:description"
          content="Watch free Vastu Shastra videos in Hindi & English. Vastu dosh for new homes, illness & debt remedies, business Vastu tips and more."
        />
        <meta property="og:image" content="https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_0000000081907206b81e6a97425fa241.png?updatedAt=1780645974051&ik-s=2db2e9e0b00f92011b1b00993e252a0dd666f37e" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="hi_IN" />
        <meta property="og:locale:alternate" content="en_IN" />

        {/* ── Twitter / X Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Vastu Guidance Videos | Pandit Aman Bhatore" />
        <meta
          name="twitter:description"
          content="Watch free Vastu Shastra videos in Hindi & English. Dosh remedies, home & business tips."
        />
        <meta name="twitter:image" content="https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_0000000081907206b81e6a97425fa241.png?updatedAt=1780645974051&ik-s=2db2e9e0b00f92011b1b00993e252a0dd666f37e" />

        {/* ── BreadcrumbList schema ── */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://panditamanbhatore.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Video Guidance",
                "item": "https://panditamanbhatore.com/video-guidance"
              }
            ]
          }
        `}</script>

        {/* ── VideoObject schema for all 4 videos ── */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Vastu Shastra Video Guidance by Pandit Aman Bhatore",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "VideoObject",
                  "name": "New Home: 8 Fatal Vastu Mistakes (भूमि दोष: नया घर और ये 8 गलतियाँ!)",
                  "description": "Building a new house causes Vastu defects through excavation and harming small creatures. Vastu Shastra identifies eight such defects which require Vastu Shanti and Griha Pravesh Puja to fix.",
                  "thumbnailUrl": "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_00000000ed607208bced0eaeadd7c4a6.png",
                  "contentUrl": "https://www.instagram.com/reel/DPJV6pgDMDQ/",
                  "embedUrl": "https://www.instagram.com/reel/DPJV6pgDMDQ/embed/",
                  "uploadDate": "2026-05-31",
                  "duration": "PT40S",
                  "inLanguage": ["hi", "en"],
                  "author": { "@type": "Person", "name": "Pandit Aman Bhatore" }
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "VideoObject",
                  "name": "Destructive Vastu Flaw in the House (घर में विनाशक दोष)",
                  "description": "Discover how a hidden Vastu defect in one part of your house can cause problems even after spending on full remedies. Check if your home has the same mistake.",
                  "thumbnailUrl": "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_0000000001e471f8bedea56eec0f13f8.png",
                  "contentUrl": "https://www.instagram.com/reel/DYeudrChSWf/",
                  "embedUrl": "https://www.instagram.com/reel/DYeudrChSWf/embed/",
                  "uploadDate": "2026-05-31",
                  "duration": "PT1M6S",
                  "inLanguage": ["hi", "en"],
                  "author": { "@type": "Person", "name": "Pandit Aman Bhatore" }
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "VideoObject",
                  "name": "Illness & Debt: The Vastu Link (बिमारी और कर्ज़ा: कारण और वास्तु उपाय)",
                  "description": "Learn how toilets and doors placed in the wrong Vastu zones — Southeast, Northeast, and Southwest — cause persistent health problems and financial drain.",
                  "thumbnailUrl": "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_0000000057a07208a3d56791ec6e83f2.png",
                  "contentUrl": "https://www.instagram.com/reel/DOn3p81k_p6/",
                  "embedUrl": "https://www.instagram.com/reel/DOn3p81k_p6/embed/",
                  "uploadDate": "2026-05-31",
                  "duration": "PT55S",
                  "inLanguage": ["hi", "en"],
                  "author": { "@type": "Person", "name": "Pandit Aman Bhatore" }
                }
              },
              {
                "@type": "ListItem",
                "position": 4,
                "item": {
                  "@type": "VideoObject",
                  "name": "Business Losing Money? Check This Vastu! (दुकान/फैक्ट्री में पैसा नहीं टिक रहा?)",
                  "description": "Frequent business disruptions, high staff turnover, and money loss could be due to wrong machinery direction. Learn key Northeast (Ishan Kona) Vastu tips for your shop or factory.",
                  "thumbnailUrl": "https://ik.imagekit.io/chedcztb6/VideoGalleryPtAman/file_00000000778872089f40bb813884269a.png",
                  "contentUrl": "https://www.instagram.com/reel/DYmcx3iBp9z/",
                  "embedUrl": "https://www.instagram.com/reel/DYmcx3iBp9z/embed/",
                  "uploadDate": "2026-05-31",
                  "duration": "PT1M4S",
                  "inLanguage": ["hi", "en"],
                  "author": { "@type": "Person", "name": "Pandit Aman Bhatore" }
                }
              }
            ]
          }
        `}</script>
      </Helmet>

      <GlassFilter />

      {/* Subtle ambient blobs */}
      <div className="vp-ambient" aria-hidden="true">
        <div className="vp-blob vp-blob--1" />
        <div className="vp-blob vp-blob--2" />
        <div className="vp-blob vp-blob--3" />
      </div>

      <PageNav />
      <Hero />

      {/* Section divider */}
      <div className="vp-divider" aria-hidden="true">
        <div className="vp-divider-line" />
        <span className="vp-divider-mark">✦</span>
        <span style={{ fontSize: 20, color: "#C9A84C", lineHeight: 1 }}>🪷</span>
        <span className="vp-divider-mark">✦</span>
        <div className="vp-divider-line" style={{ background: "linear-gradient(to left, transparent, var(--vp-outline-var), transparent)" }} />
      </div>

      {/* Video grid — activeVideoId ensures only one plays at a time */}
      <main className="vp-grid-section" id="videos">
        <div className="vp-section-label">All Videos</div>
        <VideoGrid />
      </main>

      <InstagramCTA />

      <footer className="vp-footer">
        <p className="vp-footer-copy">
          © 2024 Vastu Harmony by Aman Bhatore. All rights reserved.
        </p>
        <nav className="vp-footer-links" aria-label="Footer navigation">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/#contact">Contact</a>
        </nav>
      </footer>
    </div>
  );
}
