import { ConsultationModal, useConsultationModal } from "./ConsultationBooking";
import { KundaliModal, useKundaliModal } from "./KundaliCheck";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { HelmetProvider, Helmet } from "react-helmet-async";

/* ═══════════════════════════════════════════════
   SPARKLES TEXT
   Self-contained sparkle animation component.
   Uses framer-motion for particle animation.
   Colors default to site's gold palette.
═══════════════════════════════════════════════ */
function SparkleParticle({ id, x, y, color, delay, scale }) {
  return (
    <motion.svg
      key={id}
      style={{ pointerEvents: "none", position: "absolute", zIndex: 20 }}
      initial={{ opacity: 0, left: x, top: y }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, scale, 0],
        rotate: [75, 120, 150],
      }}
      transition={{ duration: 0.8, repeat: Infinity, delay }}
      width="18"
      height="18"
      viewBox="0 0 21 21"
    >
      <path
        d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
        fill={color}
      />
    </motion.svg>
  );
}

/**
 * SparklesText — wraps any text with animated gold sparkle particles.
 * Renders as an inline-block span so it fits naturally inside headings
 * and paragraphs without breaking layout.
 *
 * Props:
 *   text          {string}  — the text to display (required)
 *   colors        {object}  — { first, second } hex colors for particles
 *   sparklesCount {number}  — how many sparkles to show at once (default 10)
 *   style         {object}  — extra inline styles on the outer span
 *   className     {string}  — extra CSS class names
 */
function SparklesText({
  text,
  colors = { first: "#C9A84C", second: "#F0D98A" },
  sparklesCount = 10,
  style = {},
  className = "",
}) {
  const [sparkles, setSparkles] = useState([]);
  // Throttle updates: only re-render every ~400ms to avoid scroll jank
  const lastUpdateRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const generateStar = () => {
      const starX = `${Math.random() * 100}%`;
      const starY = `${Math.random() * 100}%`;
      const color = Math.random() > 0.5 ? colors.first : colors.second;
      const delay = Math.random() * 2;
      const scale = Math.random() * 1 + 0.3;
      const lifespan = Math.random() * 10 + 5;
      const id = `${starX}-${starY}-${Date.now()}-${Math.random()}`;
      return { id, x: starX, y: starY, color, delay, scale, lifespan };
    };

    const newSparkles = Array.from({ length: sparklesCount }, generateStar);
    setSparkles(newSparkles);

    // Use RAF-based loop throttled to ~400ms instead of 100ms setInterval
    // This prevents 10fps forced re-renders that block scroll compositor
    const tick = (now) => {
      rafRef.current = requestAnimationFrame(tick);
      if (now - lastUpdateRef.current < 400) return;
      lastUpdateRef.current = now;
      setSparkles((current) =>
        current.map((star) =>
          star.lifespan <= 0 ? generateStar() : { ...star, lifespan: star.lifespan - 0.4 }
        )
      );
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [colors.first, colors.second, sparklesCount]);

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        ...style,
      }}
    >
      {sparkles.map((sparkle) => (
        <SparkleParticle key={sparkle.id} {...sparkle} />
      ))}
      <strong style={{ position: "relative", zIndex: 1 }}>{text}</strong>
    </span>
  );
}

/* ═══════════════════════════════════════════════
   CONFIG
   ─────────────────────────────────────────────
   Move sensitive values to environment variables
   before deploying. Never commit real phone
   numbers in client-side source — bots harvest
   them within hours of deployment.

   ImageKit signed URLs (ik-s=...) in HERO_IMAGES
   and GALLERY are intentionally readable by every
   visitor. Move image serving through a server-side
   proxy or use unsigned URLs from a private bucket
   to prevent unauthorised transformation abuse.
═══════════════════════════════════════════════ */
const WHATSAPP_NUMBER =
  (typeof process !== "undefined" && process.env?.REACT_APP_WHATSAPP_NUMBER) ||
  "917049001004"; // ← Replace via REACT_APP_WHATSAPP_NUMBER / VITE_WHATSAPP_NUMBER env var

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const HERO_IMAGES = [
  {
    // ── Replace desktopSrc with your actual desktop image URL ──
    desktopSrc: "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_000000005668722f84ff8c1082738caf.png?updatedAt=1779706183215",
    // ── Replace mobileSrc with your actual mobile/tablet image URL ──
    mobileSrc:  "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_000000003c40720ba004267a4d50ec2c.png?updatedAt=1779790818023&ik-s=5a0a861d6768ed19464ef80d9c1c3d5f28082db7",
    alt: "Pandit Aman Bhatore – expert Vastu Shastra consultant in Indore performing residential consultation",
  },
  {
    desktopSrc: "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_00000000ebb8722fb5ca8e6888f1f49e.png?updatedAt=1779706935402",
    mobileSrc:  "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_00000000fecc72079bfa1a266cbdaa84.png?updatedAt=1779795511531&ik-s=809a1869995049d491dcc1881d54d7714e6ef4e9",
    alt: "Vastu-aligned home interior design by Pandit Aman Bhatore – bringing peace and prosperity through Vedic principles",
  },
  {
    desktopSrc: "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_0000000032cc722f97c9ce39274ef6e4.png?updatedAt=1779706933900",
    mobileSrc:  "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_000000004a4c71fa9cc60f860bef1dfb.png?updatedAt=1779795512380&ik-s=1e203d741d91bfad5fdf24c45fd9c95982879d14",
    alt: "Sacred Vastu architecture consultation by Pandit Aman Bhatore – balancing energy in homes and offices across India",
  },
];

// ── About section portrait — swap these two URLs for your own images ──
const ABOUT_IMAGE = {
  // Tall/portrait crop — shown on laptop & desktop (image sits in the LEFT column)
  desktopSrc: "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_0000000077807207b7f1323decfd4140.png?updatedAt=1779861409856&ik-s=e53758c62ed25f20ed4865afd4aa21e44f5ca3ce",
  // Wide/landscape crop — shown on mobile & tablet (image sits in the TOP row)
  mobileSrc:  "https://ik.imagekit.io/chedcztb6/VASTUBYAMAN/file_00000000229871faa1180fc1a6f7e7e2.png?updatedAt=1779861410672&ik-s=a7778170c1f76c860961da01fbb5a364c635bbac",
  alt: "Pandit Aman Bhatore – Vastu Shastra and Vedic astrology expert with 10+ years experience, Indore, India",
};



const WHY_US = [
  { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", title: "Authentic Traditional Knowledge", desc: "Rooted in centuries-old Vedic texts, our guidance preserves the true essence of Vastu Shastra as it was always meant to be practiced." },
  { icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z", title: "Personalized Solutions", desc: "Every consultation is uniquely crafted for your specific space, goals, and family dynamics — no generic templates." },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Scientific + Spiritual Approach", desc: "We bridge ancient wisdom with modern understanding, offering solutions that resonate with both the logical and spiritual mind." },
  { icon: "M12 2a10 10 0 100 20A10 10 0 0012 2z M2 12h20", title: "Online & Offline Support", desc: "Whether you're in your city or across the world, our consultation services reach you wherever you are." },
  { icon: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6", title: "Affordable Consultations", desc: "Premium Vastu guidance that doesn't break the bank. Transparent pricing, no hidden charges." },
  { icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", title: "Proven Client Transformations", desc: "Thousands of real success stories — from business growth to family harmony — stand as our greatest testimonials." },
];

const TESTIMONIALS = [
  { name: "Rajesh Kumar",   role: "Business Owner, Delhi",        rating: 5, text: "After Pandit Aman Bhatore's consultation, our business revenue increased by 40% within 3 months. The changes he suggested seemed small but the impact was massive.", avatar: "RK" },
  { name: "Priya Sharma",   role: "Homemaker, Rajasthan",             rating: 5, text: "Our family was going through constant conflicts and health issues. After the Vastu correction, there is such peace and positivity in our home now. Deeply grateful.", avatar: "PS" },
  { name: "Arvind Mehta",   role: "Software Engineer, Indore",  rating: 5, text: "I was skeptical at first, but the online consultation was thorough and the remedies were practical. My career has seen tremendous growth since then.", avatar: "AM" },
  { name: "Sunita Agarwal", role: "Restaurant Owner, Jharkhand",      rating: 5, text: "My restaurant was struggling for 2 years. Post Vastu consultation, within 6 months we went from near-closure to fully booked every weekend.", avatar: "SA" },
  { name: "Vikram Singh",   role: "Real Estate Developer,Ahmedabad",   rating: 5, text: "Pandit ji's plot analysis saved me from a major financial disaster. His detailed report revealed energy issues I never considered. Truly an expert of the highest order.", avatar: "VS" },
];


/* ── GALLERY images — LEFT(0-4) · CENTRE(5-7) · RIGHT(8-12) ── */
const GALLERY = [
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151742.jpg?updatedAt=1779968093611&ik-s=6631cbf48db488802e2d10a23529bb30c14a0ed9",  label: "Luxury residential Vastu consultation by Pandit Aman Bhatore – Indore"                               },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151834.jpg?updatedAt=1779968118799&ik-s=4f4552ad5694d7a5e9b90d8fa5dc442874706890",  label: "Office Vastu session by Pandit Aman Bhatore – commercial space energy alignment"                     },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151805.jpg?updatedAt=1779968096789&ik-s=99201dc8ef45e21e79232c9bb8e58128b5c6bbd1",  label: "Client Vastu consultation with Pandit Aman Bhatore – personalised Vedic guidance"                    },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151456.jpg?updatedAt=1779968090786&ik-s=e5eea81f87c08bb1a013a2732b2462323202d2ce",  label: "Commercial interior Vastu analysis – direction and zone optimisation for business growth"             },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151534.jpg?updatedAt=1779968092822&ik-s=575de5b48ebb2a3de73fd121b4c64a2eb9a3b094",  label: "Vastu planning session – floor plan analysis and directional mapping for home"                       },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151516.jpg?updatedAt=1779968118812&ik-s=ddd58a83963fcf4c4e708f5598d7740bf75b45ce",  label: "Property Vastu analysis – plot selection and energy profiling by Vastu expert Indore"                },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151442.jpg?updatedAt=1779968092616&ik-s=1f418289e0698348ad24a032f37555c6d1f1384b",  label: "Sacred architecture and Vastu design consultation – Vedic principles applied to modern buildings"     },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151913.jpg?updatedAt=1779968090229&ik-s=7db48fec3009f470ba17f6943e4e3a4873b966fb",  label: "Harmonious home interiors after Vastu correction – positive energy and family well-being"            },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151609.jpg?updatedAt=1779968097091&ik-s=cdad1f5cfcc15eeb24779dc3631c11f2d28d9554",  label: "Online Vastu consultation in progress – remote Vastu analysis via floor plans and photos"            },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151545.jpg?updatedAt=1779968117817&ik-s=9343919d481669464cbe707fad7204b06fb1cfc3",  label: "Residential Vastu harmony – bedroom and living room zone balancing by Pandit Aman Bhatore"          },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151753.jpg?updatedAt=1779968096641&ik-s=1db18434e7ee165ffba12b1e9d15c86db7ce91fa",  label: "Commercial space Vastu correction – office layout and desk placement for productivity"               },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151657.jpg?updatedAt=1779968096193&ik-s=29868d9dbb042e2b282f1c1a987af15cdc81bd77",  label: "Vastu energy alignment for business – directional corrections improving cash flow and footfall"      },
  { src: "https://ik.imagekit.io/chedcztb6/galleryForVastuByAman/IMG_20260528_151901.jpg?updatedAt=1779968095478&ik-s=21c577a194cd6a59069424dd5fbc5ad76ee1ac61",  label: "Positive Vastu-aligned spaces – industrial unit consultation for factory efficiency and safety"      },
];

const FAQS = [
  { q: "What is Vastu Shastra?", a: "Vastu Shastra is an ancient Indian science of architecture and space that harmonizes human dwellings with natural forces and cosmic energies. It uses directional principles and elemental theory to create spaces that promote well-being, prosperity, and peace." },
  { q: "How does Vastu help in real life?", a: "Vastu creates a balanced flow of energy in your environment, which directly influences mental clarity, relationships, health, and financial growth. Properly aligned spaces reduce subconscious stress and create conditions for positive outcomes." },
  { q: "Do online consultations work as effectively?", a: "Absolutely. With detailed floor plans, compass directions, and photographs, an expert like Pandit Aman Bhatore can conduct a thorough remote analysis. The vast majority of our online clients report the same powerful results as in-person sessions." },
  { q: "How long does a consultation take?", a: "A standard residential consultation takes 2–4 hours. Commercial or industrial analyses may take longer. You'll receive a comprehensive written report within 2–3 business days." },
  { q: "What are the consultation charges?", a: "Fees vary based on property type and size. We offer transparent, affordable pricing with no hidden charges. Contact us via WhatsApp or the booking form for a personalized quote." },
  { q: "Can Vastu genuinely improve business growth?", a: "Yes — many clients have reported significant improvements including increased footfall, better team dynamics, and improved cash flow after Vastu corrections. Pandit Aman Bhatore has helped hundreds of businesses transform through strategic energy alignment." },
];

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
// Shared debounce for resize listeners — prevents layout thrashing on window resize
function useResizeDebounced(callback, delay = 150) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useEffect(() => {
    let timer;
    const handler = () => { clearTimeout(timer); timer = setTimeout(() => callbackRef.current(), delay); };
    window.addEventListener("resize", handler, { passive: true });
    return () => { window.removeEventListener("resize", handler); clearTimeout(timer); };
  }, [delay]);
}

const SvgIcon = ({ path, size = 24, stroke = "currentColor", strokeWidth = 1.5, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const Stars = ({ count = 5 }) => (
  <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const SunMark = ({ size = 14, stroke = "#0d0906" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
  </svg>
);

/* ═══════════════════════════════════════════════
   LIQUID GLASS BUTTON
   Ported from liquid-glass-button.tsx — no external
   deps; SVG filter is self-contained.
═══════════════════════════════════════════════ */
function GlassFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      <defs>
        <filter
          id="liquid-glass-filter"
          x="0%" y="0%" width="100%" height="100%"
          colorInterpolationFilters="sRGB"
        >
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

function LiquidButton({ children, href, style = {}, className = "", ...props }) {
  const Tag = href ? "a" : "button";

  /* External link safety — prevent tab-napping via window.opener */
  const isExternal = href && /^https?:\/\//.test(href);
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <Tag
      href={href}
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "14px 32px",
        borderRadius: 9999,
        cursor: "pointer",
        textDecoration: "none",
        fontFamily: "var(--font-display)",
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "#fff",
        border: "none",
        background: "transparent",
        transition: "transform 0.3s ease",
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1.05)"}
      {...externalProps}
      {...props}
    >
      {/* Glass morphism backdrop layer */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          backdropFilter: 'url("#liquid-glass-filter") blur(0px)',
          WebkitBackdropFilter: 'url("#liquid-glass-filter") blur(0px)',
          zIndex: 0,
        }}
      />
      {/* Liquid glass shadow shell */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          boxShadow: [
            "0 0 6px rgba(0,0,0,0.03)",
            "0 2px 6px rgba(0,0,0,0.08)",
            "inset 3px 3px 0.5px -3px rgba(255,255,255,0.18)",
            "inset -3px -3px 0.5px -3px rgba(255,255,255,0.12)",
            "inset 1px 1px 1px -0.5px rgba(255,255,255,0.35)",
            "inset -1px -1px 1px -0.5px rgba(255,255,255,0.25)",
            "inset 0 0 8px 6px rgba(255,255,255,0.07)",
            "inset 0 0 2px 2px rgba(255,255,255,0.04)",
            "0 0 16px rgba(201,168,76,0.25)",
          ].join(","),
          background: "linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.08) 50%, rgba(255,255,255,0.06) 100%)",
          border: "1px solid rgba(201,168,76,0.45)",
          zIndex: 1,
        }}
      />
      {/* Top glare streak */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: "15%",
          right: "15%",
          height: 1,
          borderRadius: 9999,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
          zIndex: 2,
        }}
      />
      {/* Content */}
      <span style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", gap: 8 }}>
        {children}
      </span>
    </Tag>
  );
}

/* ═══════════════════════════════════════════════
   SHIMMER TEXT
   Ported from shimmer-text.tsx — pure CSS keyframe
   animation; no framer-motion / motion dep needed.
═══════════════════════════════════════════════ */
function ShimmerText({
  children,
  as: Tag = "span",
  color = "var(--accent)",       // base text colour
  shimmerColor = "rgba(255,255,255,0.75)", // highlight colour
  duration = 1.8,                // seconds per sweep
  delay = 0.8,                   // initial delay
  style = {},
  className = "",
}) {
  /* Inject keyframes once */
  useEffect(() => {
    const id = "shimmer-text-kf";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes shimmer-sweep {
        0%   { background-position: 250% center; }
        100% { background-position: -100% center; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  const shimmerStyle = {
    display: "inline-block",
    background: `linear-gradient(to right, ${color} 0%, ${shimmerColor} 40%, ${shimmerColor} 60%, ${color} 100%)`,
    backgroundSize: "50% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "250%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: color,               /* fallback */
    animation: `shimmer-sweep ${duration}s linear ${delay}s infinite`,
    animationFillMode: "both",
    ...style,
  };

  return (
    <Tag className={className} style={shimmerStyle}>
      {children}
    </Tag>
  );
}


/* ═══════════════════════════════════════════════
   CONTAINER SCROLL ANIMATION
   Ported from container-scroll-animation.tsx.
   Replicates framer-motion useScroll + useTransform
   with a plain scroll listener — zero extra deps.
═══════════════════════════════════════════════ */
function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowH = window.innerHeight;
        const total = rect.height + windowH;
        const scrolled = windowH - rect.top;
        setProgress(Math.min(Math.max(scrolled / total, 0), 1));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [ref]);
  return progress;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const progress = useScrollProgress(containerRef);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { setIsMobile(window.innerWidth <= 768); }, []);
  useResizeDebounced(() => setIsMobile(window.innerWidth <= 768));

  const rotate    = lerp(20, 0, progress);
  const scale     = lerp(isMobile ? 0.7 : 1.05, isMobile ? 0.9 : 1, progress);
  const translateY = lerp(0, -100, progress);

  return (
    <div
      ref={containerRef}
      style={{
        /* ↓ Reduced from 78rem/90rem — removes excess dead space above/below the card */
        height: isMobile ? "62rem" : "72rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        /* ↓ Reduced horizontal padding on desktop so card feels anchored */
        padding: isMobile ? "8px" : "40px",
        overflow: "hidden",
      }}
    >
      <div style={{
        /* ↓ Reduced top/bottom padding inside the scroll container:
             - Desktop: 80px top (was 160) / 60px bottom (was 160) — tightens gap under hero & before stats
             - Mobile:  24px top (was 40)  / 12px bottom (was 20) */
        paddingTop: isMobile ? 24 : 80,
        paddingBottom: isMobile ? 12 : 60,
        width: "100%",
        position: "relative",
        perspective: "1000px",
      }}>
        {/* Header translates up as you scroll */}
        <div style={{ transform: isMobile ? "none" : `translateY(${translateY}px)`, maxWidth: "64rem", margin: "0 auto", textAlign: "center" }}>
          {titleComponent}
        </div>

        {/* 3-D perspective card */}
        <div style={{
          transform: `rotateX(${rotate}deg) scale(${scale})`,
          transformOrigin: "center top",
          transition: "transform 0.04s linear",
          willChange: "transform",
          boxShadow: "0 0 #0000004d,0 9px 20px #0000004a,0 37px 37px #00000042,0 84px 50px #00000026,0 149px 60px #0000000a,0 233px 65px #00000003",
          maxWidth: "64rem",
          /* ↓ marginTop reduced from -48px to -24px on desktop — softens the 3D tilt
               entry without the card overlapping its title too aggressively */
          marginTop: isMobile ? "16px" : "-24px",
          marginLeft: "auto",
          marginRight: "auto",
          height: isMobile ? "46rem" : "48rem",
          width: "100%",
          border: "4px solid #6C6C6C",
          padding: isMobile ? "8px" : "24px",
          background: "#222222",
          borderRadius: "30px",
        }}>
          <div style={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
            borderRadius: 16,
            background: "#1a1410",
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}


function useScrollReveal() {
  useEffect(() => {
    // Defer observer setup until after first paint so it doesn't compete
    // with the critical rendering path on page load
    const rafId = requestAnimationFrame(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });

      const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
      els.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    });
    return () => cancelAnimationFrame(rafId);
  }, []);
}

function useCounter() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || "";
          if (isNaN(target)) return;
          const duration = 1500;
          const start = performance.now();
          const update = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    const els = document.querySelectorAll("[data-target]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════ */
function GlobalStyles() {
  /* Google Fonts are now loaded via <Helmet> in App() using preconnect +
     stylesheet <link> tags — this eliminates the FOUC that occurred when
     fonts were injected inside useEffect (after first paint). */

  /* Returned as a real <style> JSX element — present on the very first
     browser paint, no flash of unstyled HTML ever. */
  const css = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{
        --accent:#C9A84C;--accent-on-dark:#E8C96A;--accent-focus:#D4B55A;
        --canvas:#ffffff;--canvas-parchment:#f5f5f7;
        --tile-dark-1:#1a1410;--tile-dark-2:#1e1812;--tile-dark-3:#141008;
        --ink:#1d1d1f;--ink-80:#333333;--ink-48:#7a7a7a;
        --on-dark:#f5f5f7;--on-dark-muted:#a8a09a;
        --hairline:#e0e0e0;--border-soft:rgba(0,0,0,0.08);
        --font-display:"SF Pro Display",system-ui,-apple-system,BlinkMacSystemFont,"Inter",sans-serif;
        --font-text:"SF Pro Text",system-ui,-apple-system,BlinkMacSystemFont,"Inter",sans-serif;
        --sp-xs:8px;--sp-sm:12px;--sp-md:17px;--sp-lg:24px;--sp-xl:32px;--sp-xxl:48px;--sp-section:80px;
        --r-sm:8px;--r-md:11px;--r-lg:18px;--r-pill:9999px;
      }
      html{scroll-behavior:smooth}
      body{font-family:var(--font-text);font-size:17px;font-weight:400;line-height:1.47;letter-spacing:-0.374px;color:var(--ink);background:var(--canvas);overflow-x:hidden;-webkit-font-smoothing:antialiased;opacity:0;transition:opacity 0.18s ease}
      body.ready{opacity:1}
      ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--tile-dark-3)}::-webkit-scrollbar-thumb{background:var(--accent);border-radius:3px}
      section[id],footer[id]{scroll-margin-top:52px}

      /* Typography */
      .t-hero{font-family:var(--font-display);font-size:clamp(2.8rem,7vw,5.5rem);font-weight:600;line-height:1.07;letter-spacing:-0.28px}
      .t-display-lg{font-family:var(--font-display);font-size:clamp(2rem,4vw,2.5rem);font-weight:600;line-height:1.1}
      .t-display-md{font-family:var(--font-display);font-size:clamp(1.6rem,3vw,2.125rem);font-weight:600;line-height:1.19;letter-spacing:-0.374px}
      .t-lead{font-family:var(--font-display);font-size:clamp(1rem,2vw,1.25rem);font-weight:400;line-height:1.47}
      .t-caption{font-family:var(--font-text);font-size:14px;font-weight:400;line-height:1.43;letter-spacing:-0.224px}
      .eyebrow{display:block;font-family:var(--font-text);font-size:12px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px}
      .eyebrow-light{color:var(--ink-48)}.eyebrow-dark{color:var(--accent-on-dark);opacity:.7}.eyebrow-accent{color:var(--accent)}

      /* Gold shimmer */
      .gold-text{background:linear-gradient(135deg,#C9A84C 0%,#F0D98A 45%,#C9A84C 65%,#E8C96A 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer-gold 4s linear infinite}
      @keyframes shimmer-gold{0%{background-position:0% center}100%{background-position:200% center}}

      /* Animations */
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

      /* Reveal */
      .reveal{opacity:0;transform:translateY(40px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
      .reveal.visible{opacity:1;transform:translateY(0)}
      .reveal-left{opacity:0;transform:translateX(-50px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
      .reveal-left.visible{opacity:1;transform:translateX(0)}
      .reveal-right{opacity:0;transform:translateX(50px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
      .reveal-right.visible{opacity:1;transform:translateX(0)}
      .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}.d5{transition-delay:.5s}.d6{transition-delay:.6s}

      /* Tile system */
      .tile{padding:var(--sp-section) var(--sp-xl);position:relative;overflow:hidden;content-visibility:auto;contain-intrinsic-size:0 800px}
      .tile-light{background:var(--canvas);color:var(--ink)}
      .tile-parchment{background:var(--canvas-parchment);color:var(--ink)}
      .tile-dark{background:var(--tile-dark-1);color:var(--on-dark)}
      .tile-dark-2{background:var(--tile-dark-2);color:var(--on-dark)}
      .tile-dark-3{background:var(--tile-dark-3);color:var(--on-dark)}
      .tile-inner{max-width:980px;margin:0 auto}
      .tile-inner-wide{max-width:1200px;margin:0 auto}

      /* Buttons */
      .btn-primary{display:inline-flex;align-items:center;gap:6px;padding:11px 22px;background:var(--accent);color:#0d0906;font-family:var(--font-text);font-size:17px;font-weight:600;letter-spacing:-0.374px;border:none;border-radius:var(--r-pill);cursor:pointer;text-decoration:none;transition:background .3s,transform .2s;white-space:nowrap}
      .btn-primary:hover{background:var(--accent-focus)}.btn-primary:active{transform:scale(0.96)}
      .btn-wa{display:inline-flex;align-items:center;gap:10px;padding:11px 22px;background:#25D366;color:#fff;font-family:var(--font-text);font-size:17px;font-weight:400;border:none;border-radius:var(--r-pill);cursor:pointer;text-decoration:none;transition:background .3s,transform .2s;white-space:nowrap}
      .btn-wa:hover{background:#128C7E}.btn-wa:active{transform:scale(0.96)}

      /* Cards */
      .util-card-dark{background:rgba(255,255,255,.04);border:1px solid rgba(232,201,106,.15);border-radius:var(--r-lg);padding:var(--sp-lg);transition:transform .4s cubic-bezier(.16,1,.3,1),border-color .3s}
      .util-card-dark:hover{transform:translateY(-6px);border-color:rgba(232,201,106,.4)}
      .util-card-dark h3{transition:color .3s}.util-card-dark:hover h3{color:var(--accent-on-dark)!important}
      .svc-icon{width:56px;height:56px;border-radius:var(--r-md);background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:var(--sp-md);transition:background .3s,transform .3s}
      .util-card-dark:hover .svc-icon{background:rgba(201,168,76,.2);transform:scale(1.08)}

      .why-card{display:flex;gap:16px;padding:24px 20px;border-radius:var(--r-lg);background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.12);transition:border-color .3s,transform .4s cubic-bezier(.16,1,.3,1)}
      .why-card:hover{border-color:rgba(201,168,76,.35);transform:translateY(-4px)}
      .why-card>div:first-child{transition:background .3s,transform .3s}.why-card:hover>div:first-child{background:rgba(201,168,76,.2)!important;transform:scale(1.08)}

      /* Grids */
      .services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
      .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
      .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-xxl);align-items:center}
      /* Stats grid — margin-top reduced from --sp-xl (32px) to 16px to close the gap
         between the About card container and the stats numbers */
      .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--hairline);border-left:1px solid var(--hairline);margin-top:16px}
      .stat-cell{border-right:1px solid var(--hairline);border-bottom:1px solid var(--hairline);padding:20px 12px;text-align:center}
      .stat-num{font-family:var(--font-display);font-size:clamp(1.6rem,3vw,2.2rem);font-weight:600;letter-spacing:-0.02em;color:var(--accent)}
      .stat-label{font-size:13px;color:var(--ink-48);margin-top:4px;letter-spacing:-0.02em}
      .testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:40px}
      /* Gallery — replaced by .gallery-sticky-wrap system below */

      /* Nav */
      nav#navbar{position:fixed;top:0;left:0;right:0;z-index:1000;height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(0,0,0,0.72);backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);transition:background .4s}
      nav#navbar.at-top{background:linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,transparent 100%);border-bottom-color:transparent;backdrop-filter:none;-webkit-backdrop-filter:none}
      .nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none}
      .nav-links{display:flex;align-items:center;gap:28px}
      .nav-links a{font-family:var(--font-display);font-size:15px;font-weight:700;letter-spacing:0.01em;color:rgba(255,255,255,.95);text-decoration:none;transition:color .2s}
      .nav-links a:hover{color:#fff}
      .nav-cta{padding:8px 18px;background:var(--accent);color:#0d0906;font-family:var(--font-display);font-size:14px;font-weight:700;letter-spacing:0.01em;border:none;border-radius:var(--r-pill);cursor:pointer;text-decoration:none;transition:background .2s,transform .2s}
      .nav-cta:hover{background:var(--accent-focus)}.nav-cta:active{transform:scale(0.96)}
      .nav-hamburger{display:none;background:none;border:none;color:rgba(255,255,255,.85);cursor:pointer;padding:4px}
      @media(max-width:833px){.nav-links{display:none!important}.nav-hamburger{display:block!important}}

      /* Mobile Nav */
      .mobile-nav{position:fixed;inset:0;z-index:1100;background:rgba(0,0,0,0.96);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);transform:translateX(100%);transition:transform .45s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:36px}
      .mobile-nav.open{transform:translateX(0)}
      .mobile-nav-close{position:absolute;top:20px;right:20px;z-index:1101;background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer}
      .mobile-nav a{font-family:var(--font-display);font-size:28px;font-weight:600;color:#fff;text-decoration:none;letter-spacing:-0.28px}

      /* Hero */
      #hero{position:relative;height:100svh;min-height:600px;overflow:hidden;padding:0}
      @media(max-width:1024px){#hero{height:88svh;min-height:unset}}
      .hero-slide{position:absolute;inset:0;opacity:0;transition:opacity 2s cubic-bezier(.4,0,.2,1);will-change:opacity}
      .hero-slide.active{opacity:1}
      .hero-slide img{width:100%;height:100%;object-fit:cover;object-position:center;transform:scale(1) translateZ(0);transition:transform 8s ease;will-change:transform}
      .hero-slide.active img{transform:scale(1.06) translateZ(0)}
      .hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.08) 0%,transparent 40%,rgba(0,0,0,0.35) 100%);z-index:1}
      .hero-dots{position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:3}
      .hero-dot{width:6px;border-radius:3px;background:rgba(255,255,255,.35);border:none;cursor:pointer;transition:all .4s ease}
      .hero-dot.active{height:28px;background:var(--accent-on-dark)}.hero-dot:not(.active){height:6px}

      /* Portrait */
      .portrait-wrap{position:relative}
      .portrait-inner{border-radius:32px 80px 32px 80px;overflow:hidden;border:1px solid rgba(201,168,76,.3);aspect-ratio:4/5;background:linear-gradient(160deg,var(--tile-dark-2) 0%,var(--tile-dark-1) 100%);display:flex;align-items:center;justify-content:center;position:relative}
      .portrait-badge{position:absolute;bottom:32px;right:-16px;background:var(--accent);border-radius:var(--r-lg);padding:16px 20px;text-align:center;box-shadow:0 8px 32px rgba(201,168,76,.4);animation:float 4s ease-in-out infinite}
      .exp-tag{padding:7px 14px;border:1px solid rgba(201,168,76,.3);border-radius:var(--r-pill);font-size:13px;color:var(--ink-48);background:rgba(201,168,76,.05);transition:border-color .2s,color .2s}
      .exp-tag:hover{border-color:var(--accent);color:var(--accent)}


      /* Testimonials */
      .testi-card{background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r-lg);padding:var(--sp-lg);transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s}
      .testi-card:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,.1)}

      /* ═══════════════════════════════════════════════════════════════════
         GALLERY — sticky-scroll 3-column layout
         Mirrors the reference component exactly:
           Col A (left)   — 5 images, scrolls normally, h-96 each
           Col B (centre) — 3 images, position:sticky top:0, fills 100vh
           Col C (right)  — 5 images, scrolls normally, h-96 each
         Responsive:
           ≤ 1024 px  → 2 cols, centre becomes a normal scroll col
           ≤ 600 px   → 1 col stacked, all images h-64
      ═══════════════════════════════════════════════════════════════════ */

      /* ── Outer section wrapper ── */
      .gallery-section{
        background:var(--tile-dark-3);
        padding:80px 0 0;
        position:relative;
        /* NOTE: overflow must NOT be hidden here — it would break position:sticky */
      }
      .gallery-header{
        text-align:center;
        padding:0 var(--sp-xl);
        margin-bottom:48px;
      }

      /* ── 3-col grid ── */
      .gallery-sticky-wrap{
        display:grid;
        grid-template-columns:1fr 1fr 1fr;
        gap:8px;
        align-items:start;
        padding:0 8px;
      }

      /* Scrolling outer columns */
      .gallery-col-scroll{
        display:grid;
        gap:8px;
      }

      /* Sticky centre column — offset by navbar height so it doesn't hide behind nav */
      .gallery-col-sticky{
        position:sticky;
        top:54px;                    /* match navbar height */
        height:calc(100vh - 54px);
        display:grid;
        grid-template-rows:1fr 1fr 1fr;
        gap:8px;
      }

      /* On touch devices, show captions always (no hover) */
      @media(hover:none){
        .gallery-caption{ opacity:1 }
        .gallery-caption span{ transform:translateY(0) }
      }

      /* Every figure */
      .gallery-fig{
        position:relative;
        overflow:hidden;
        border-radius:var(--r-md);
        margin:0;
        background:var(--tile-dark-2);
      }
      .gallery-fig-scroll{ height:384px }
      .gallery-fig-sticky{ height:100% }

      .gallery-fig img{
        width:100%;height:100%;
        object-fit:cover;display:block;
        transition:transform .6s cubic-bezier(.16,1,.3,1);
      }
      .gallery-fig:hover img{ transform:scale(1.05) }

      /* Caption */
      .gallery-caption{
        position:absolute;inset:0;
        background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 52%);
        opacity:0;transition:opacity .35s;
        display:flex;align-items:flex-end;
        padding:14px 16px;
        border-radius:var(--r-md);
      }
      .gallery-fig:hover .gallery-caption{ opacity:1 }
      .gallery-caption span{
        transform:translateY(8px);transition:transform .35s;
        display:block;font-size:11px;color:#fff;
        letter-spacing:.12em;text-transform:uppercase;font-weight:600;
      }
      .gallery-fig:hover .gallery-caption span{ transform:translateY(0) }

      /* Gold border accent */
      .gallery-fig::after{
        content:'';position:absolute;inset:0;
        border-radius:var(--r-md);
        border:1px solid transparent;
        transition:border-color .35s;pointer-events:none;
      }
      .gallery-fig:hover::after{ border-color:rgba(201,168,76,.4) }

      /* Bottom fade seal — sits after the grid, not sticky */
      .gallery-fade-seal{
        height:96px;
        background:linear-gradient(to top,var(--tile-dark-3) 0%,transparent 100%);
        pointer-events:none;
        margin-top:-96px;        /* overlap the last grid row */
        position:relative;
        z-index:10;
      }

      /* ── Responsive ─────────────────────────────────────────────────────
         Sticky maths — left col must be taller than viewport:
           Desktop  ≤1024px : 5 imgs × 220px = 1100px  > ~768-1024vh  ✓
           Mobile   ≤768px  : 7 imgs × 180px = 1260px  > ~600-768vh   ✓
           Small    ≤480px  : 7 imgs × 148px = 1036px  > ~480-600vh   ✓
         JS redistributes images into 2 cols on mobile so CSS just needs
         to handle sizing — NO display:none needed.
      ─────────────────────────────────────────────────────────────────── */

      /* Tablet — 3 cols still, just shorter images */
      @media(max-width:1024px){
        .gallery-fig-scroll{ height:220px }
      }

      /* Mobile — JS switches to .gallery-2col which is 2 cols */
      .gallery-2col{
        grid-template-columns:1fr 1fr !important;
        gap:6px;
        padding:0 6px;
      }
      @media(max-width:768px){
        .gallery-fig-scroll{ height:180px }
        /* Sticky col height: full viewport minus navbar */
        .gallery-col-sticky{
          top:54px;
          height:calc(100vh - 54px);
        }
      }
      @media(max-width:480px){
        .gallery-2col{ gap:4px; padding:0 4px; }
        .gallery-fig-scroll{ height:148px }
        .gallery-col-sticky{
          top:52px;
          height:calc(100vh - 52px);
        }
      }

      /* FAQ */
      .faq-item{border-top:1px solid var(--hairline);padding:20px 0;transition:background .3s;border-radius:var(--r-sm);padding-left:8px;padding-right:8px;margin:0 -8px}
      .faq-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;text-align:left;color:var(--ink);font-family:var(--font-text);font-size:17px;font-weight:600;letter-spacing:-0.374px;padding:0}
      .faq-btn svg{flex-shrink:0;transition:transform .3s}
      .faq-btn.open{color:var(--accent)}.faq-btn.open svg{stroke:var(--accent);transform:rotate(45deg)}
      .faq-body{max-height:0;overflow:hidden;transition:max-height .5s cubic-bezier(.16,1,.3,1)}
      .faq-body.open{max-height:300px}
      .faq-body-inner{padding:12px 0 4px;color:var(--ink-48);line-height:1.6;font-size:17px}

      /* CTA */
      #cta-tile{background:var(--tile-dark-3);text-align:center}
      #cta-tile::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(201,168,76,.015) 60px,rgba(201,168,76,.015) 61px);pointer-events:none;z-index:0}
      .cta-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border:1px solid rgba(201,168,76,.3);border-radius:var(--r-pill);background:rgba(201,168,76,.07);margin-bottom:24px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--accent-on-dark)}

      /* Footer */
      footer{background:var(--canvas-parchment);padding:64px var(--sp-xl) 28px;border-top:1px solid var(--hairline)}
      .footer-grid{display:grid;grid-template-columns:2fr 1fr 1.5fr;gap:48px;max-width:1200px;margin:0 auto 48px}
      .footer-link{display:block;font-family:var(--font-text);font-size:14px;color:var(--ink-80);text-decoration:none;line-height:2.2;letter-spacing:-0.224px;transition:color .2s;position:relative}
      .footer-link:hover{color:var(--accent)}
      .footer-link::after{content:'';position:absolute;bottom:-1px;left:0;width:0;height:1px;background:var(--accent);transition:width .3s}
      .footer-link:hover::after{width:100%}
      .footer-heading{font-family:var(--font-text);font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-48);margin-bottom:16px}
      .footer-bottom{max-width:1200px;margin:0 auto;padding-top:20px;border-top:1px solid var(--hairline);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
      .footer-copy{font-size:12px;color:var(--ink-48);letter-spacing:-0.12px}
      .social-chip{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:rgba(0,0,0,.055);border:1px solid var(--hairline);color:var(--ink-64);text-decoration:none;transition:background .22s,color .22s,border-color .22s,transform .18s,box-shadow .22s}
      .social-chip svg{display:block}
      .social-chip:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.10)}
      .social-chip.yt:hover{background:#FF0000;border-color:#FF0000;color:#fff}
      .social-chip.fb:hover{background:#1877F2;border-color:#1877F2;color:#fff}
      .social-chip.ig:hover{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285AEB 90%);border-color:#d6249f;color:#fff}

      /* WA Float */

      /* Mandala */
      .mandala-dec{position:absolute;pointer-events:none;opacity:.04;animation:spin-slow 80s linear infinite;will-change:transform}

      /* Slider */
      .slider-wrap{position:relative;overflow:hidden}
      .slider-track{display:flex;transition:transform .5s cubic-bezier(.16,1,.3,1);will-change:transform;transform:translateZ(0)}
      .slider-dots{display:flex;justify-content:center;gap:6px;margin-top:20px}
      .slider-dot{width:6px;height:6px;border-radius:3px;background:rgba(201,168,76,.25);border:none;cursor:pointer;padding:0;transition:all .4s}
      .slider-dot.active{width:20px;background:var(--accent)}
      .slider-nav{flex-shrink:0;width:32px;height:32px;border-radius:50%;border:1px solid rgba(201,168,76,.3);background:rgba(0,0,0,.6);backdrop-filter:blur(8px);color:var(--accent-on-dark);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .3s}
      .slider-nav:hover{background:rgba(201,168,76,.15);border-color:var(--accent)}

      /* Responsive */
      @media(max-width:1024px){
        .about-grid{grid-template-columns:1fr!important;gap:40px!important}
        .footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important}
        .stats-grid{grid-template-columns:repeat(2,1fr)!important}
      }
      @media(max-width:768px){
        .tile{padding:64px 18px!important}
        .services-grid,.why-grid,.testi-grid,.footer-grid{grid-template-columns:1fr!important}
        .portrait-badge{right:8px;bottom:16px}.portrait-inner{border-radius:24px}
        .cta-btns-row{flex-direction:column;align-items:center}
        .footer-grid{gap:28px!important}
      }
      @media(max-width:480px){
        nav#navbar{height:52px}
      }
    `;
  return <style>{css}</style>;
}

/* ═══════════════════════════════════════════════
   NAV HEADER — animated sliding-pill nav
   (framer-motion behaviour replicated with CSS
   transitions + React state; no extra deps needed)
═══════════════════════════════════════════════ */
function NavPillLinks({ links, openKundali }) {
  const [cursor, setCursor] = useState({ left: 0, width: 0, opacity: 0 });
  const refs = useRef({});

  const handleEnter = useCallback((href) => {
    const el = refs.current[href];
    if (!el) return;
    const { width } = el.getBoundingClientRect();
    setCursor({ left: el.offsetLeft, width, opacity: 1 });
  }, []);

  const handleLeave = useCallback(() => {
    setCursor((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  /* Shared text style for both <a> and <button> nav items */
  const navItemStyle = {
    display: "block",
    padding: "5px 14px",
    fontFamily: "var(--font-display)",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.01em",
    color: "#fff",
    textDecoration: "none",
    mixBlendMode: "difference",
    whiteSpace: "nowrap",
    borderRadius: 9999,
  };

  return (
    <ul
      onMouseLeave={handleLeave}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        listStyle: "none",
        margin: 0,
        padding: "3px",
        gap: 0,
        borderRadius: 9999,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.07)",
      }}
    >
      {/* Sliding cursor */}
      <li
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3,
          height: "calc(100% - 6px)",
          borderRadius: 9999,
          background: "var(--accent)",
          left: cursor.left,
          width: cursor.width,
          opacity: cursor.opacity,
          transition: "left 0.22s cubic-bezier(.16,1,.3,1), width 0.22s cubic-bezier(.16,1,.3,1), opacity 0.18s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {links.map((l) => (
        <li
          key={l.href}
          ref={(el) => { refs.current[l.href] = el; }}
          onMouseEnter={() => handleEnter(l.href)}
          style={{ position: "relative", zIndex: 1 }}
        >
          {l.label === "Kundali Check" ? (
            <button
              onClick={openKundali}
              style={{ ...navItemStyle, background: "none", border: "none", cursor: "pointer" }}
            >
              {l.label}
            </button>
          ) : (
            <a href={l.href} style={navItemStyle}>
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ═══════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════ */
function Navbar({ openBooking, openKundali }) {
  const [atTop, setAtTop] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setAtTop(window.scrollY < 80);
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

  const links = [
    { label: "About",          href: "#about" },
    { label: "Testimonials",   href: "#testimonials" },
    { label: "FAQ",            href: "#faq" },
    { label: "Video Guidance", href: "/video-guidance" },
    { label: "Gallery",        href: "#gallery" },
    { label: "Contact",        href: "#contact" },
    { label: "Kundali Check",   href: "#kundali" },
  ];

  return (
    <>
      <nav id="navbar" className={atTop ? "at-top" : ""}>
        <a className="nav-logo" href="#hero">
          {/* ॐ Om badge — saffron lotus ring with Om symbol */}
          <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer glow ring */}
              <circle cx="22" cy="22" r="21" stroke="url(#omGold)" strokeWidth="1.2" fill="rgba(201,120,20,0.10)" />
              {/* Inner decorative ring */}
              <circle cx="22" cy="22" r="17.5" stroke="url(#omGold)" strokeWidth="0.7" strokeDasharray="2.2 2.8" fill="none" />
              {/* 8 petal dots around ring */}
              {[0,45,90,135,180,225,270,315].map((deg, i) => {
                const r = 20, rad = (deg * Math.PI) / 180;
                return <circle key={i} cx={22 + r * Math.sin(rad)} cy={22 - r * Math.cos(rad)} r="0.9" fill="#E8922A" opacity="0.85" />;
              })}
              {/* ॐ Om glyph */}
              <text
                x="22" y="27"
                textAnchor="middle"
                fontSize="18"
                fontFamily="serif"
                fill="url(#omGold)"
                style={{ filter: "drop-shadow(0 0 3px rgba(232,146,42,0.7))" }}
              >ॐ</text>
              <defs>
                <linearGradient id="omGold" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF9933" />
                  <stop offset="50%" stopColor="#E8C96A" />
                  <stop offset="100%" stopColor="#C97820" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-text)", fontSize: 9, fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>Pandit</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, letterSpacing: "0.01em", color: "#fff" }}>Aman Bhatore</div>
          </div>
        </a>

        {/* Animated pill nav — replaces plain link list */}
        <div className="nav-links" style={{ alignItems: "center", gap: 12 }}>
          <NavPillLinks links={links} openKundali={openKundali} />
          <LiquidButton onClick={openBooking} style={{ fontSize: 13, padding: "6px 18px", fontWeight: 700 }}>
            Book Now
          </LiquidButton>
        </div>

        <button className="nav-hamburger" aria-label="Open menu"
          onClick={() => { setMobileOpen(true); document.body.style.overflow = "hidden"; }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <button className="mobile-nav-close" aria-label="Close menu" onClick={closeMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {links.map((l) =>
          l.label === "Kundali Check" ? (
            <button
              key="kundali"
              onClick={() => { closeMenu(); openKundali(); }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 600,
                color: "#fff",
                background: "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: "-0.28px",
              }}
            >
              Kundali Check
            </button>
          ) : (
            <a key={l.href} href={l.href} onClick={closeMenu}>{l.label}</a>
          )
        )}
        <LiquidButton
          style={{ marginTop: 8, fontSize: 18, padding: "14px 36px" }}
          onClick={() => { closeMenu(); openBooking(); }}
        >
          Book Consultation
        </LiquidButton>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════ */
function Hero({ openBooking }) {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(id);
  }, []);

  useResizeDebounced(() => setIsMobile(window.innerWidth <= 1024));

  return (
    <section id="hero" aria-label="Hero">
      {/* Visually hidden H1 — read by Google and screen readers, invisible to sighted users */}
      <h1 style={{ position:"absolute", width:1, height:1, padding:0, margin:-1, overflow:"hidden", clip:"rect(0,0,0,0)", whiteSpace:"nowrap", border:0 }}>
        Expert Vastu Consultant in India – Pandit Aman Bhatore
      </h1>
      <p style={{ position:"absolute", width:1, height:1, padding:0, margin:-1, overflow:"hidden", clip:"rect(0,0,0,0)", whiteSpace:"nowrap", border:0 }}>
        Home • Office • Commercial • Industrial • Online Vastu Consultation
      </p>
      {HERO_IMAGES.map((img, i) => (
        <div key={i} className={`hero-slide ${i === active ? "active" : ""}`}>
          <img
            src={isMobile ? img.mobileSrc : img.desktopSrc}
            alt={img.alt}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? "sync" : "async"}
          />
        </div>
      ))}
      <div className="hero-overlay" aria-hidden="true" />

      {/* Hero CTA — liquid glass button centred over the slides */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: isMobile ? 28 : 80,
        gap: 20,
        textAlign: "center",
        pointerEvents: "none",
      }}>
        <div style={{ pointerEvents: "auto" }}>
          <LiquidButton onClick={openBooking} style={{ fontSize: 18, padding: "16px 40px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Book a Consultation
          </LiquidButton>
        </div>
      </div>
      <div className="hero-dots" aria-label="Slide navigation">
        {HERO_IMAGES.map((_, i) => (
          <button key={i} className={`hero-dot ${i === active ? "active" : ""}`}
            aria-label={`Slide ${i + 1}`} onClick={() => setActive(i)} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   ABOUT  — powered by ContainerScroll animation
═══════════════════════════════════════════════ */
function About({ openBooking }) {
  const stats = [
    { target: 10,   suffix: "+", label: "Years Experience" },
    { target: 5000, suffix: "+", label: "Happy Clients" },
    { target: 1000, suffix: "+", label: "Properties Analyzed" },
    { value: "24×7",             label: "Hours Guidance" },
  ];

  const tags = ["Residential Vastu", "Commercial Vastu", "Industrial Vastu", "Plot Selection", "Astrology Guidance"];

  const [isMobile, setIsMobile] = useState(false);
  // Separate flag for image source: tablet + mobile both use the landscape/wide crop
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  useEffect(() => {
    const w = window.innerWidth;
    setIsMobile(w <= 768);
    setIsTabletOrMobile(w <= 1024);
  }, []);
  useResizeDebounced(() => {
    const w = window.innerWidth;
    setIsMobile(w <= 768);
    setIsTabletOrMobile(w <= 1024);
  });

  /* ── Animated stat number — self-contained, React-state driven ── */
  const AnimatedStat = ({ target, suffix, fontSize }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const triggered = useRef(false);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          observer.disconnect();
          const duration = 1500;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(ease * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }, { threshold: 0.1 });
      observer.observe(el);
      return () => observer.disconnect();
    }, [target]);
    return <div ref={ref} style={{ fontFamily: "var(--font-display)", fontSize, fontWeight: 600, color: "var(--accent)" }}>{count.toLocaleString()}{suffix}</div>;
  };

  /* ── Shared stats + CTA block (rendered outside card on mobile, inside on desktop) ── */
  const StatsAndCTA = ({ mobile }) => (
    <>
      {/* Stats grid — 2×2 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        borderTop: "1px solid rgba(201,168,76,.15)",
        borderLeft: "1px solid rgba(201,168,76,.15)",
        marginBottom: 20,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            borderRight: "1px solid rgba(201,168,76,.15)",
            borderBottom: "1px solid rgba(201,168,76,.15)",
            padding: mobile ? "16px 10px" : "14px 10px",
            textAlign: "center",
          }}>
            {s.value
              ? <div style={{ fontFamily: "var(--font-display)", fontSize: mobile ? "1.6rem" : "clamp(1.2rem,2.5vw,1.7rem)", fontWeight: 600, color: "var(--accent)" }}>{s.value}</div>
              : <AnimatedStat target={s.target} suffix={s.suffix} fontSize={mobile ? "1.6rem" : "clamp(1.2rem,2.5vw,1.7rem)"} />
            }
            <div style={{ fontSize: mobile ? "12px" : "clamp(10px,1.1vw,12px)", color: "var(--on-dark-muted)", marginTop: 4, letterSpacing: "0.02em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: mobile ? "center" : "left" }}>
        <LiquidButton onClick={openBooking} style={{ fontSize: mobile ? "15px" : "clamp(13px,1.5vw,15px)", padding: mobile ? "13px 32px" : "11px 24px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Book a Consultation
        </LiquidButton>
      </div>
    </>
  );

  return (
    <section id="about" aria-label="About" style={{ background: "var(--tile-dark-3)", overflow: "hidden" }}>
      <ContainerScroll
        titleComponent={
          <div style={{ paddingBottom: 32 }}>
            {/* Eyebrow */}
            <span style={{
              display: "block",
              fontFamily: "var(--font-text)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(232,201,106,.6)",
              marginBottom: 16,
            }}>
              About the Expert
            </span>

            {/* Headline */}
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem,4vw,3rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              color: "var(--on-dark)",
              marginBottom: 14,
            }}>
              Meet{" "}
              <SparklesText
                text="Pandit Aman Bhatore"
                style={{ color: "#C9A84C" }}
                sparklesCount={12}
              />
            </h2>

            {/* Sub-line */}
            <p style={{
              fontFamily: "var(--font-text)",
              fontSize: "clamp(0.95rem,2vw,1.1rem)",
              color: "var(--on-dark-muted)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}>
              A decade of Vedic mastery, thousands of transformed spaces — scroll to discover the expert behind the energy.
            </p>
          </div>
        }
      >
        {/* ── Card interior: stacked on mobile, side-by-side on desktop ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "40% 60%",
          gridTemplateRows: isMobile ? "260px 1fr" : "1fr",
          height: "100%",
          overflow: "hidden",
        }}>

          {/* PORTRAIT — top on mobile, left on desktop */}
          <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <img
              src={isTabletOrMobile ? ABOUT_IMAGE.mobileSrc : ABOUT_IMAGE.desktopSrc}
              alt={ABOUT_IMAGE.alt}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: isMobile
                ? "linear-gradient(to bottom, transparent 55%, var(--tile-dark-1) 100%)"
                : "linear-gradient(to right, transparent 60%, var(--tile-dark-1) 100%), linear-gradient(to top, rgba(26,20,16,.9) 0%, transparent 50%)",
            }} />
            {/* Name badge */}
            <div style={{ position: "absolute", bottom: 14, left: 14 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.02em", color: "var(--accent-on-dark)" }}>
                <SparklesText
                  text="Pandit Aman Bhatore"
                  sparklesCount={6}
                  style={{ fontSize: "0.85rem", fontFamily: "var(--font-display)", color: "var(--accent-on-dark)" }}
                />
              </div>
              <div style={{ fontSize: 10, color: "rgba(232,201,106,.6)", letterSpacing: "0.1em", marginTop: 3, textTransform: "uppercase" }}>
                Vastu Shastra Consultant
              </div>
            </div>
            {/* Floating years badge */}
            <div style={{
              position: "absolute", top: 14, right: 14,
              background: "var(--accent)", borderRadius: 12, padding: "8px 12px", textAlign: "center",
              boxShadow: "0 8px 24px rgba(201,168,76,.45)", animation: "float 4s ease-in-out infinite",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? "1.2rem" : "1.5rem", fontWeight: 700, color: "#0d0906", lineHeight: 1 }}>10+</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,.55)", letterSpacing: "0.09em", textTransform: "uppercase", marginTop: 2 }}>Yrs Exp</div>
            </div>
          </div>

          {/* BIO — below on mobile, right on desktop */}
          <div style={{
            background: "var(--tile-dark-1)",
            padding: isMobile ? "20px 18px 24px" : "clamp(16px,3vw,36px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: isMobile ? "flex-start" : "center",
            overflowY: "auto",
          }}>
            <p style={{ color: "var(--on-dark-muted)", fontSize: isMobile ? "0.88rem" : "clamp(0.8rem,1.5vw,0.95rem)", lineHeight: 1.65, marginBottom: 14 }}>
              With over a decade of dedicated practice in Vastu Shastra and Vedic astrology,{" "}
              <SparklesText
                text="Pandit Aman Bhatore"
                sparklesCount={8}
                style={{ fontWeight: 600, color: "var(--on-dark)", fontSize: "inherit" }}
              />{" "}
              has transformed thousands of homes and businesses across India, blending ancient Vedic wisdom with modern architectural sensibility.
            </p>
            <p style={{ color: "var(--on-dark-muted)", fontSize: isMobile ? "0.88rem" : "clamp(0.8rem,1.5vw,0.95rem)", lineHeight: 1.65, marginBottom: 18 }}>
              Specialising in{" "}
              <span style={{ fontWeight: 600, color: "var(--on-dark)" }}>residential, commercial &amp; industrial Vastu</span>{" "}
              consultations, he delivers personalised, actionable remedies that bring tangible peace, prosperity, and positive energy.
            </p>

            {/* Specialty tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: isMobile ? 0 : 20 }}>
              {tags.map((tag) => (
                <span key={tag} style={{
                  padding: "5px 12px",
                  border: "1px solid rgba(201,168,76,.3)",
                  borderRadius: 9999,
                  fontSize: isMobile ? "11px" : "clamp(10px,1.2vw,13px)",
                  color: "var(--on-dark-muted)",
                  background: "rgba(201,168,76,.07)",
                  whiteSpace: "nowrap",
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Desktop only: stats + CTA inside the card */}
            {!isMobile && <div style={{ marginTop: 20 }}><StatsAndCTA mobile={false} /></div>}
          </div>
        </div>
      </ContainerScroll>

      {/* Mobile only: stats + CTA outside the card, below it */}
      {isMobile && (
        <div style={{
          maxWidth: "520px",
          margin: "0 auto",
          padding: "20px 20px 48px",
        }}>
          <StatsAndCTA mobile={true} />
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SERVICES
   Desktop  : 3-col auto-fit grid (unchanged)
   Tablet   : 2 cards visible, auto-slides 1 card
              every 1.5 s; pause on touch-hold
   Mobile   : 1 card visible, auto-slides every 2 s;
              pause on touch-hold
   Arrows + dots rendered BELOW the slider on both
   touch breakpoints.
═══════════════════════════════════════════════ */

  /* ─────────────────────────────────────────────
   Desktop  (> 1024 px): standard auto-fit grid,
                         existing .why-card style
   Tablet + Mobile (≤ 1024 px): sticky-scroll
     stack powered by framer-motion motion.div.
     Cards use liquid glass aesthetic:
       • blurred backdrop
       • grey-tinted translucent fill
       • inset glare highlights
       • tiered sticky top values for stacking
   ─────────────────────────────────────────────
   IMPORTANT: The .tile CSS class sets
   overflow:hidden which would break position:sticky
   for the stack. We override it on this section
   only via inline style={{ overflow:"visible" }}.
═══════════════════════════════════════════════ */

/**
 * WhyStickyCard — a single stacking card for mobile/tablet.
 * Uses motion.div with layout="position" for smooth
 * position transitions as cards animate into view.
 */
function WhyStickyCard({ index, children }) {
  /* Navbar is 54px; base offset gives 10px breathing room below it.
     Each successive card is 15px lower, creating the visible stack offset. */
  const STICKY_BASE = 64;
  const STEP_Y      = 15;
  const STEP_Z      = 10;

  return (
    <motion.div
      layout="position"
      style={{
        position: "sticky",
        top: STICKY_BASE + index * STEP_Y,
        zIndex: (index + 1) * STEP_Z,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "translateZ(0)",
        willChange: "transform",
        marginBottom: 20,
        touchAction: "pan-y",
      }}
    >
      {children}
    </motion.div>
  );
}

function WhyUs() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > 1024 : true
  );

  useResizeDebounced(() => setIsDesktop(window.innerWidth > 1024));

  return (
    /*
     * overflow:"visible" overrides .tile's overflow:hidden so that
     * position:sticky works correctly inside the scroll container.
     * clip-path is NOT used so no ancestor clips the sticky children.
     */
    <section
      className="tile tile-parchment"
      aria-label="Why choose us"
      style={{ overflow: "visible" }}
    >
      <div className="tile-inner-wide">

        {/* ── Section header (shared across breakpoints) ── */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="eyebrow eyebrow-light reveal">Why Trust Us</span>
          <h2 className="t-display-lg reveal d1" style={{ marginTop: 8 }}>
            The <span className="gold-text">Bhatore Difference</span>
          </h2>
        </div>

        {/* ════════════════════════════════════════
            DESKTOP — liquid glass grey-tinted grid
        ════════════════════════════════════════ */}
        {isDesktop && (
          <div className="why-grid">
            {WHY_US.map((r, i) => (
              <article
                key={i}
                className={`reveal d${(i % 3) + 1}`}
                role="article"
                style={{
                  position: "relative",
                  borderRadius: 20,
                  padding: "24px 22px 22px",
                  overflow: "hidden",
                  cursor: "default",

                  /* Glass fill */
                  background: "rgba(202, 202, 215, 0.44)",
                  backdropFilter: "blur(16px) saturate(140%)",
                  WebkitBackdropFilter: "blur(16px) saturate(140%)",

                  /* Crisp glass border */
                  border: "1px solid rgba(238, 238, 252, 0.78)",

                  /* Layered shadows: outer depth + inset glass highlights */
                  boxShadow: [
                    "0 10px 40px rgba(0,0,0,0.09)",
                    "0 2px 8px rgba(0,0,0,0.05)",
                    "inset 0 1.5px 0 rgba(255,255,255,0.82)",
                    "inset 0 -1px 0 rgba(0,0,0,0.05)",
                    "inset 1px 0 0 rgba(255,255,255,0.55)",
                    "inset -1px 0 0 rgba(255,255,255,0.38)",
                  ].join(", "),

                  transition: "transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = [
                    "0 18px 56px rgba(0,0,0,0.13)",
                    "0 4px 14px rgba(0,0,0,0.07)",
                    "inset 0 1.5px 0 rgba(255,255,255,0.88)",
                    "inset 0 -1px 0 rgba(0,0,0,0.05)",
                    "inset 1px 0 0 rgba(255,255,255,0.6)",
                    "inset -1px 0 0 rgba(255,255,255,0.42)",
                  ].join(", ");
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = [
                    "0 10px 40px rgba(0,0,0,0.09)",
                    "0 2px 8px rgba(0,0,0,0.05)",
                    "inset 0 1.5px 0 rgba(255,255,255,0.82)",
                    "inset 0 -1px 0 rgba(0,0,0,0.05)",
                    "inset 1px 0 0 rgba(255,255,255,0.55)",
                    "inset -1px 0 0 rgba(255,255,255,0.38)",
                  ].join(", ");
                }}
              >
                {/* Top glare streak */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute", top: 0, left: "8%", right: "8%",
                    height: 1,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.90), transparent)",
                    borderRadius: 9999,
                  }}
                />

                {/* Ghost card number */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute", top: 14, right: 18,
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.2rem, 3vw, 3rem)",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "rgba(150,145,140,0.14)",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Card content row: icon + text */}
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {/* Icon badge */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                      background: "rgba(201,168,76,.13)",
                      border: "1px solid rgba(201,168,76,.38)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--accent)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 2px 8px rgba(201,168,76,0.12)",
                    }}
                  >
                    <SvgIcon path={r.icon} size={22} />
                  </div>

                  {/* Text */}
                  <div style={{ paddingTop: 3 }}>
                    <h3 style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: 8,
                      letterSpacing: "-0.01em",
                    }}>
                      {r.title}
                    </h3>
                    <p className="t-caption" style={{ color: "var(--ink-48)", lineHeight: 1.65 }}>
                      {r.desc}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════
            MOBILE / TABLET — sticky-scroll stack

            HEIGHT FORMULA — fixes dead-space bug:
            ─────────────────────────────────────
            Each card ≈ 200px tall (icon + title +
            2-3 lines + padding). The container only
            needs: (N+1) × 200px + 40px
              N cards   → scroll all cards into view
              +1 card   → let user read the last one
              +40px     → bottom pad before next section
            At N=6: 7 × 200 + 40 = 1440px ≈ 170vh
            vs old 70vh × 6 = 420vh (2.5× too tall).
        ════════════════════════════════════════ */}
        {!isDesktop && (
          <div
            aria-label="Why us card stack"
            style={{
              position: "relative",
              perspective: "1000px",
              minHeight: `calc(${(WHY_US.length + 1) * 200}px + 40px)`,
              paddingBottom: 40,
            }}
          >
            {WHY_US.map((r, i) => (
              <WhyStickyCard key={i} index={i}>
                {/*
                  ── Liquid glass card ──────────────────────────
                  Design language:
                    • Greyish translucent fill (rgba ~42% opacity)
                    • backdrop-filter blur + saturate
                    • Multi-layer inset box-shadow for glass depth
                    • 1px top highlight (the "glare streak")
                    • Gold-tinted icon container matching site palette
                    • Faint card-number ghost in the top-right corner
                */}
                <article
                  style={{
                    position: "relative",
                    borderRadius: 20,
                    padding: "24px 22px 22px",
                    overflow: "hidden",

                    /* Glass fill — slightly blue-grey tint */
                    background: "rgba(202, 202, 215, 0.44)",
                    backdropFilter: "blur(16px) saturate(140%)",
                    WebkitBackdropFilter: "blur(16px) saturate(140%)",

                    /* Crisp glass border */
                    border: "1px solid rgba(238, 238, 252, 0.78)",

                    /* Layered shadows: outer depth + inset glass highlights */
                    boxShadow: [
                      "0 10px 40px rgba(0,0,0,0.09)",
                      "0 2px 8px rgba(0,0,0,0.05)",
                      /* Top inner highlight — the defining glass "shine" */
                      "inset 0 1.5px 0 rgba(255,255,255,0.82)",
                      /* Bottom inner shadow — slight depth */
                      "inset 0 -1px 0 rgba(0,0,0,0.05)",
                      /* Left/right inner edge gleam */
                      "inset 1px 0 0 rgba(255,255,255,0.55)",
                      "inset -1px 0 0 rgba(255,255,255,0.38)",
                    ].join(", "),
                  }}
                >
                  {/* ── Top glare streak (liquid glass signature) ── */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute", top: 0, left: "8%", right: "8%",
                      height: 1,
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.90), transparent)",
                      borderRadius: 9999,
                    }}
                  />

                  {/* ── Ghost card number (decorative, top-right) ── */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute", top: 14, right: 18,
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2.2rem, 7vw, 3rem)",
                      fontWeight: 800,
                      lineHeight: 1,
                      color: "rgba(150,145,140,0.14)",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* ── Card content row: icon + text ── */}
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

                    {/* Icon badge */}
                    <div
                      aria-hidden="true"
                      style={{
                        width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                        background: "rgba(201,168,76,.13)",
                        border: "1px solid rgba(201,168,76,.38)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--accent)",
                        /* Inset shine on the icon badge itself */
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 2px 8px rgba(201,168,76,0.12)",
                      }}
                    >
                      <SvgIcon path={r.icon} size={22} />
                    </div>

                    {/* Text */}
                    <div style={{ paddingTop: 3 }}>
                      <h3 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "var(--ink)",
                        marginBottom: 8,
                        letterSpacing: "-0.01em",
                      }}>
                        {r.title}
                      </h3>
                      <p className="t-caption" style={{ color: "var(--ink-48)", lineHeight: 1.65 }}>
                        {r.desc}
                      </p>
                    </div>
                  </div>
                </article>
              </WhyStickyCard>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════ */
function TestiCard({ t }) {
  return (
    <div className="testi-card" role="article">
      <Stars count={t.rating} />
      <p style={{ color: "var(--ink-48)", lineHeight: 1.7, fontSize: 15, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),#8B5A0A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#0d0906", flexShrink: 0 }} aria-hidden="true">{t.avatar}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>{t.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-48)", marginTop: 2 }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const total = TESTIMONIALS.length;
  const go = (i) => setIdx((i + total) % total);

  useEffect(() => {
    const id = setInterval(() => go(idx + 1), 4000);
    return () => clearInterval(id);
  }, [idx]);

  return (
    <section id="testimonials" className="tile tile-dark-2" aria-label="Testimonials">
      <div className="tile-inner-wide">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="eyebrow reveal" style={{ color: "rgba(232,201,106,.6)" }}>Client Stories</span>
          <h2 className="t-display-lg reveal d1" style={{ color: "var(--on-dark)", marginTop: 8 }}>
            Voices of <span className="gold-text">Transformation</span>
          </h2>
        </div>

        {/* Desktop grid */}
        <div className="testi-grid" style={{ display: "none" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`reveal d${(i % 3) + 1}`}><TestiCard t={t} /></div>
          ))}
        </div>

        {/* Responsive: show grid on md+, slider on mobile via CSS */}
        <style>{`
          @media(min-width:641px){ .testi-grid-r{display:grid!important} .testi-slider-r{display:none!important} }
          @media(max-width:640px){ .testi-grid-r{display:none!important} .testi-slider-r{display:block!important} }
        `}</style>

        <div className="testi-grid-r testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`reveal d${(i % 3) + 1}`}><TestiCard t={t} /></div>
          ))}
        </div>

        <div className="testi-slider-r" style={{ display: "none" }}>
          <div className="slider-wrap">
            <div className="slider-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{ flex: "0 0 100%", padding: "0 8px", boxSizing: "border-box" }}><TestiCard t={t} /></div>
              ))}
            </div>
          </div>
          {/* Controls row — arrows flank the dots, all rendered below the card */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
            <button className="slider-nav" onClick={() => go(idx - 1)} aria-label="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="slider-dots" style={{ margin: 0 }}>
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className={`slider-dot ${i === idx ? "active" : ""}`} onClick={() => setIdx(i)} aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
            <button className="slider-nav" onClick={() => go(idx + 1)} aria-label="Next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Internal link: Testimonials → FAQ ──
          Guides users naturally down the trust funnel:
          social proof → common questions → booking.   */}
      <div style={{ textAlign: "center", marginTop: 36, paddingBottom: 8 }}>
        <a
          href="#faq"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            color: "rgba(232,201,106,0.85)",
            textDecoration: "none",
            letterSpacing: "0.01em",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(232,201,106,0.85)"}
          aria-label="Read frequently asked questions about Vastu Shastra consultation"
        >
          Have questions about Vastu? Read our FAQ
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
/* ═══════════════════════════════════════════════
   GALLERY — sticky-scroll 3-column layout
   Left   (indices 0-4)  : 5 images, scroll normally
   Centre (indices 5-7)  : 3 images, sticky 100vh
   Right  (indices 8-12) : 5 images, scroll normally
═══════════════════════════════════════════════ */
function Gallery() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth <= 768); }, []);
  useResizeDebounced(() => setIsMobile(window.innerWidth <= 768));

  /* Desktop (>768px): 5 left · 3 centre sticky · 5 right  = 13
     Mobile  (≤768px): 7 left · 6 centre sticky            = 13 — all shown */
  const leftImgs   = isMobile ? GALLERY.slice(0, 7)  : GALLERY.slice(0, 5);
  const centreImgs = isMobile ? GALLERY.slice(7, 13) : GALLERY.slice(5, 8);
  const rightImgs  = isMobile ? []                   : GALLERY.slice(8, 13);

  const Caption = ({ label }) => (
    <div className="gallery-caption" aria-hidden="true">
      <span>{label}</span>
    </div>
  );

  return (
    <section id="gallery" aria-label="Gallery" className="gallery-section">

      {/* Section header */}
      <div className="gallery-header">
        <span className="eyebrow reveal" style={{ color: "rgba(232,201,106,.6)" }}>
          Our Work
        </span>
        <h2 className="t-display-lg reveal d1" style={{ color: "var(--on-dark)", marginTop: 8 }}>
          Glimpses of <span className="gold-text">Sacred Work</span>
        </h2>
      </div>

      {/* sticky-scroll grid */}
      <div className={`gallery-sticky-wrap${isMobile ? " gallery-2col" : ""}`}>

        {/* LEFT — always scrolls */}
        <div className="gallery-col-scroll" aria-label="Gallery left column">
          {leftImgs.map((img, i) => (
            <figure key={i} className="gallery-fig gallery-fig-scroll">
              <img src={img.src} alt={img.alt} loading="lazy" />
              <Caption label={img.label} />
            </figure>
          ))}
        </div>

        {/* CENTRE — always sticky, row count adapts */}
        <div
          className="gallery-col-sticky"
          style={{ gridTemplateRows: `repeat(${centreImgs.length}, 1fr)` }}
          aria-label="Gallery centre column"
        >
          {centreImgs.map((img, i) => (
            <figure key={i} className="gallery-fig gallery-fig-sticky">
              <img src={img.src} alt={img.alt} loading="lazy" />
              <Caption label={img.label} />
            </figure>
          ))}
        </div>

        {/* RIGHT — desktop only, rendered conditionally */}
        {rightImgs.length > 0 && (
          <div className="gallery-col-scroll" aria-label="Gallery right column">
            {rightImgs.map((img, i) => (
              <figure key={i} className="gallery-fig gallery-fig-scroll">
                <img src={img.src} alt={img.alt} loading="lazy" />
                <Caption label={img.label} />
              </figure>
            ))}
          </div>
        )}

      </div>

      {/* Bottom fade seal */}
      <div className="gallery-fade-seal" aria-hidden="true" />

    </section>
  );
}

/* ═══════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════ */
function FAQ() {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="tile tile-parchment" aria-label="FAQ">
      <div className="tile-inner" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="eyebrow eyebrow-light reveal">Frequently Asked</span>
          <h2 className="t-display-lg reveal d1" style={{ marginTop: 8 }}>
            Common <span className="gold-text">Questions</span>
          </h2>
        </div>
        {FAQS.map((item, i) => (
          <div key={i} className="faq-item">
            <button
              className={`faq-btn ${open === i ? "open" : ""}`}
              aria-expanded={open === i}
              onClick={() => toggle(i)}
            >
              <span>{item.q}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-48)" strokeWidth="1.5" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className={`faq-body ${open === i ? "open" : ""}`}>
              <div className="faq-body-inner">{item.a}</div>
            </div>
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--hairline)" }} />

        {/* ── Internal link: FAQ → Contact / Book ──
            Completes the conversion funnel: awareness →
            trust → questions answered → ready to book.  */}
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <a
            href="#contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
              letterSpacing: "0.01em",
              opacity: 0.9,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
            aria-label="Book a Vastu Shastra consultation with Pandit Aman Bhatore"
          >
            Ready to transform your space? Book a consultation
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CTA
═══════════════════════════════════════════════ */
function CTA({ openBooking }) {
  return (
    <section id="cta-tile" className="tile" aria-label="Call to action">
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%,rgba(201,168,76,.08) 0%,transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />
      <div className="tile-inner" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="cta-badge reveal">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          Begin Your Transformation
        </div>
        <h2 className="t-display-lg reveal d1" style={{ color: "var(--on-dark)", marginBottom: 16 }}>
          Bring Positivity, Prosperity<br />&amp; <span className="gold-text">Peace Into Your Life</span>
        </h2>
        <p className="t-lead reveal d2" style={{ color: "var(--on-dark-muted)", maxWidth: 560, margin: "0 auto 40px" }}>
          Take the first step toward a harmonious, prosperous life. Book your personalized Vastu consultation with{" "}
          <SparklesText
            text="Pandit Aman Bhatore"
            sparklesCount={10}
            style={{ color: "var(--accent-on-dark)" }}
          />{" "}
          today.
        </p>
        <div className="reveal d3 cta-btns-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <LiquidButton onClick={openBooking}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
            Book Consultation Now
          </LiquidButton>
          <LiquidButton
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            rel="noopener noreferrer"
            style={{ background: "transparent" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.843L0 24l6.337-1.508A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-5.007-1.374l-.359-.213-3.724.888.931-3.617-.234-.372A9.768 9.768 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
            </svg>
            Chat on WhatsApp
          </LiquidButton>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
function Footer() {
  const quickLinks = ["Home", "About", "Testimonials", "FAQ", "Gallery", "Contact"];

  /* ── Branded SVG icons for YouTube, Facebook, Instagram ── */
  const YTIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
    </svg>
  );

  const FBIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
    </svg>
  );

  const IGIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );

  return (
    <footer id="contact" role="contentinfo">
      <div className="footer-grid">

        {/* ── Brand — exact replica of the navbar Om logo ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            {/* Om badge — identical SVG to the navbar */}
            <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="22" cy="22" r="21" stroke="url(#footerOmGold)" strokeWidth="1.2" fill="rgba(201,120,20,0.10)" />
                <circle cx="22" cy="22" r="17.5" stroke="url(#footerOmGold)" strokeWidth="0.7" strokeDasharray="2.2 2.8" fill="none" />
                {[0,45,90,135,180,225,270,315].map((deg, i) => {
                  const r = 20, rad = (deg * Math.PI) / 180;
                  return <circle key={i} cx={22 + r * Math.sin(rad)} cy={22 - r * Math.cos(rad)} r="0.9" fill="#E8922A" opacity="0.85" />;
                })}
                <text x="22" y="27" textAnchor="middle" fontSize="18" fontFamily="serif"
                  fill="url(#footerOmGold)" style={{ filter: "drop-shadow(0 0 3px rgba(232,146,42,0.5))" }}>ॐ</text>
                <defs>
                  <linearGradient id="footerOmGold" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF9933" />
                    <stop offset="50%" stopColor="#E8C96A" />
                    <stop offset="100%" stopColor="#C97820" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Name — same typographic scale as navbar */}
            <div>
              <div style={{ fontFamily: "var(--font-text)", fontSize: 9, fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-48)" }}>Pandit</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, letterSpacing: "0.01em", color: "var(--ink)" }}>Aman Bhatore</div>
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: "var(--ink-48)", lineHeight: 1.75, maxWidth: 268, marginBottom: 18 }}>
            Authentic Vastu Shastra guidance for homes, offices, and businesses since 2013.
          </p>
          <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-48)", borderLeft: "2px solid var(--accent)", paddingLeft: 12, lineHeight: 1.65, maxWidth: 268 }}>
            "Where energy flows in harmony, life flourishes in abundance."
          </p>

          {/* Social icons */}
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <a href="https://youtube.com/@p.amanbhatore?si=Rmmxzt3nBDdU5_sP" className="social-chip yt" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <YTIcon />
            </a>
            <a href="https://www.facebook.com/share/191bEcAaMP/" className="social-chip fb" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FBIcon />
            </a>
            <a href="https://www.instagram.com/p.amanbhatore/" className="social-chip ig" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <IGIcon />
            </a>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div>
          <div className="footer-heading">Quick Links</div>
          {quickLinks.map((l) => {
            const href = l === "Home" ? "#hero" : `#${l.toLowerCase()}`;
            return (
              <a key={l} href={href} className="footer-link">{l}</a>
            );
          })}
        </div>

        {/* ── Contact — <address> + LocalBusiness microdata ── */}
        <div>
          <div className="footer-heading">Contact</div>
          <address itemScope itemType="https://schema.org/LocalBusiness" style={{ fontStyle: "normal" }}>
            <meta itemProp="name" content="Pandit Aman Bhatore" />

            {/* Phone */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
              </svg>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-48)", marginBottom: 2 }}>Phone</div>
                <a href="tel:+917049001004" itemProp="telephone" style={{ fontSize: 13.5, color: "var(--ink-80)", lineHeight: 1.5, textDecoration: "none", fontWeight: 500 }}>+91 70490 01004</a>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>
              </svg>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-48)", marginBottom: 2 }}>Email</div>
                <a href="mailto:amanbhatore1998@gmail.com" itemProp="email" style={{ fontSize: 13.5, color: "var(--ink-80)", lineHeight: 1.5, textDecoration: "none", fontWeight: 500 }}>amanbhatore1998@gmail.com</a>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-48)", marginBottom: 2 }}>Location</div>
                <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{ fontSize: 13.5, color: "var(--ink-80)", lineHeight: 1.6, fontWeight: 500 }}>
                  <span itemProp="addressLocality">Indore</span>,{" "}
                  <span itemProp="addressRegion">Madhya Pradesh</span>,{" "}
                  <span itemProp="addressCountry">India</span>
                  <br /><span style={{ fontSize: 12, color: "var(--ink-48)", fontWeight: 400 }}>Online Worldwide</span>
                </span>
              </div>
            </div>

            {/* Hours */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-48)", marginBottom: 2 }}>Hours</div>
                <span itemProp="openingHours" content="Mo,Tu,We,Th,Fr,Sa,Su 09:00-21:00" style={{ fontSize: 13.5, color: "var(--ink-80)", lineHeight: 1.5, fontWeight: 500 }}>Everyday &nbsp;9 AM – 9 PM</span>
              </div>
            </div>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2025 Pandit Aman Bhatore. All rights reserved.</p>
        <p className="footer-copy">Designed with 🙏 for Divine Guidance</p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   FLOATING WIDGETS
═══════════════════════════════════════════════ */



/* ═══════════════════════════════════════════════
   REFRESH SCROLL BEHAVIOUR
   ─────────────────────────────────────────────
   Desktop / laptop  (> 768 px):
     • Saves scrollY to sessionStorage before unload
     • On mount: restores that exact position so the
       user lands on the same section they refreshed from
   Mobile / tablet   (≤ 768 px):
     • Always scrolls to top (Hero) on refresh —
       mid-page refresh on mobile is disorienting
   Both:
     • history.scrollRestoration = "manual" so the
       browser's own restoration never fights us
═══════════════════════════════════════════════ */
function useRefreshBehavior() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    /* Hand scroll control entirely to us */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    // If there's a #consultation hash, the modal will open —
    // don't fight it with scroll restoration; stay at top.
    const hasConsultationHash = window.location.hash.startsWith("#consultation");

    const isMobile = window.innerWidth <= 768;

    if (hasConsultationHash) {
      // Modal opening — scroll to top so the overlay covers the page cleanly
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ""; });
    } else if (isMobile) {
      /* Mobile / tablet — always return to top */
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ""; });
    } else {
      /* Desktop — restore position saved before the refresh */
      const saved = sessionStorage.getItem("scrollY");
      if (saved !== null) {
        const y = parseInt(saved, 10);
        /* Validate before use: reject NaN, Infinity, and out-of-range values.
           A tampered sessionStorage entry (e.g. from a browser extension)
           could otherwise supply an unexpected scroll position. */
        if (Number.isFinite(y) && y >= 0 && y <= 1_000_000) {
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo(0, y);
          requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ""; });
        }
      }
      sessionStorage.removeItem("scrollY");
    }

    /* Save position just before the page unloads (only on desktop, only without modal) */
    const saveScroll = () => {
      if (window.innerWidth > 768 && !window.location.hash.startsWith("#consultation")) {
        sessionStorage.setItem("scrollY", String(window.scrollY));
      }
    };
    window.addEventListener("beforeunload", saveScroll);
    return () => window.removeEventListener("beforeunload", saveScroll);
  }, []);
}

/* ═══════════════════════════════════════════════
   PRELOADER
   Full-screen sacred preloader with sparkling
   Hindi text animation. Fades out once site loads.
   Responsive for mobile, tablet, and desktop.
═══════════════════════════════════════════════ */
function PreloaderSparkle({ x, y, size, delay, color }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        pointerEvents: "none",
      }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        rotate: [0, 90, 180],
      }}
      transition={{ duration: 1.4 + Math.random() * 0.8, repeat: Infinity, delay }}
    >
      <svg viewBox="0 0 21 21" width={size} height={size}>
        <path
          d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}

function Preloader({ onComplete }) {
  const [phase, setPhase] = useState("enter"); // "enter" | "hold" | "exit"

  /* Inject preloader keyframes */
  useEffect(() => {
    const id = "preloader-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes pl-shimmer {
          0%   { background-position: 300% center; }
          100% { background-position: -100% center; }
        }
        @keyframes pl-glow-pulse {
          0%, 100% { text-shadow:
            0 0 20px rgba(201,168,76,0.8),
            0 0 40px rgba(201,168,76,0.5),
            0 0 80px rgba(201,168,76,0.3); }
          50% { text-shadow:
            0 0 30px rgba(240,217,138,1),
            0 0 60px rgba(201,168,76,0.8),
            0 0 100px rgba(201,168,76,0.5),
            0 0 140px rgba(201,168,76,0.2); }
        }
        @keyframes pl-divider-expand {
          from { width: 0; opacity: 0; }
          to   { width: 180px; opacity: 1; }
        }
        @keyframes pl-om-spin {
          0%   { transform: rotate(0deg) scale(1); opacity: 0.15; }
          50%  { transform: rotate(180deg) scale(1.08); opacity: 0.25; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.15; }
        }
        @keyframes pl-ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50%       { transform: scale(1.06); opacity: 0.35; }
        }
        @keyframes pl-dot-bounce {
          0%, 80%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          40%            { transform: scaleY(1.0); opacity: 1; }
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  /* Timeline: 0.6s enter → 2.2s hold → exit → onComplete */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 2800);
    const t3 = setTimeout(() => onComplete(), 3500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  /* 36 sparkles distributed across the full screen */
  const sparkles = useRef(
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: `${(i * 2.78 + Math.sin(i) * 15 + 50) % 95}%`,
      y: `${(i * 7.1 + Math.cos(i * 1.3) * 20 + 10) % 90}%`,
      size: 8 + Math.floor(Math.sin(i * 0.9 + 1) * 7 + 7),
      delay: (i * 0.11) % 2.2,
      color: i % 3 === 0 ? "#F0D98A" : i % 3 === 1 ? "#C9A84C" : "#fff8e7",
    }))
  ).current;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.65, ease: "easeInOut" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
        /* Rich dark saffron-maroon gradient background */
        background: "radial-gradient(ellipse at 50% 40%, #2a1505 0%, #1a0c02 45%, #0d0600 100%)",
      }}
    >
      {/* ── Decorative mandala-style rings ── */}
      {[220, 330, 450, 580].map((r, i) => (
        <div
          key={r}
          style={{
            position: "absolute",
            width: r,
            height: r,
            borderRadius: "50%",
            border: `${i % 2 === 0 ? 1 : 0.5}px solid rgba(201,168,76,${0.12 - i * 0.02})`,
            animation: `pl-ring-pulse ${3 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Faint Om symbol watermark ── */}
      <div
        style={{
          position: "absolute",
          fontSize: "clamp(180px, 35vw, 320px)",
          color: "rgba(201,168,76,0.08)",
          fontFamily: "serif",
          lineHeight: 1,
          userSelect: "none",
          animation: "pl-om-spin 18s linear infinite",
          pointerEvents: "none",
        }}
      >
        ॐ
      </div>

      {/* ── All sparkles ── */}
      {sparkles.map((s) => (
        <PreloaderSparkle key={s.id} {...s} />
      ))}

      {/* ── Main content card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: phase !== "exit" ? 1 : 0.6, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          padding: "clamp(28px, 6vw, 56px) clamp(24px, 8vw, 72px)",
          borderRadius: 20,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.2)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.15)",
          backdropFilter: "blur(8px)",
          textAlign: "center",
          maxWidth: "clamp(320px, 88vw, 640px)",
          width: "100%",
        }}
      >
        {/* Top divider with lotus dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 40, height: 1, background: "linear-gradient(to right, transparent, #C9A84C)" }} />
          <span style={{ fontSize: 18, color: "#C9A84C", lineHeight: 1 }}>✦</span>
          <span style={{ fontSize: 22, color: "#F0D98A", lineHeight: 1 }}>🪷</span>
          <span style={{ fontSize: 18, color: "#C9A84C", lineHeight: 1 }}>✦</span>
          <div style={{ width: 40, height: 1, background: "linear-gradient(to left, transparent, #C9A84C)" }} />
        </div>

        {/* Line 1 — जय श्री राम */}
        <div
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Devanagari MT', serif",
            fontSize: "clamp(26px, 7vw, 52px)",
            fontWeight: 900,
            letterSpacing: "0.04em",
            lineHeight: 1.15,
            marginBottom: 6,
            background: "linear-gradient(to right, #8B6914 0%, #C9A84C 20%, #F0D98A 40%, #fff8e0 55%, #F0D98A 70%, #C9A84C 85%, #8B6914 100%)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "pl-shimmer 2.2s linear infinite, pl-glow-pulse 2s ease-in-out infinite",
            animationDelay: "0s, 0.4s",
          }}
        >
          जय श्री राम
        </div>

        {/* Thin gold separator line */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(to right, transparent, #C9A84C, #F0D98A, #C9A84C, transparent)",
            marginBottom: 14,
            animation: "pl-divider-expand 0.9s ease-out 0.3s both",
            alignSelf: "stretch",
            opacity: 0.6,
          }}
        />

        {/* Line 2 — पंडित अमन भटोरे */}
        <div
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Devanagari MT', serif",
            fontSize: "clamp(18px, 4.5vw, 34px)",
            fontWeight: 700,
            letterSpacing: "0.03em",
            lineHeight: 1.3,
            marginBottom: 4,
            background: "linear-gradient(to right, #A07828 0%, #C9A84C 25%, #F0D98A 50%, #C9A84C 75%, #A07828 100%)",
            backgroundSize: "250% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "pl-shimmer 2.8s linear 0.3s infinite",
          }}
        >
          पंडित अमन भटोरे
        </div>

        {/* Line 3 — वास्तु विमर्श */}
        <div
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Devanagari MT', serif",
            fontSize: "clamp(13px, 3vw, 20px)",
            fontWeight: 500,
            letterSpacing: "0.12em",
            lineHeight: 1.4,
            marginBottom: 24,
            background: "linear-gradient(to right, #7a5c1e 0%, #C9A84C 30%, #F0D98A 50%, #C9A84C 70%, #7a5c1e 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "pl-shimmer 3.4s linear 0.6s infinite",
            opacity: 0.9,
          }}
        >
          वास्तु विमर्श
        </div>

        {/* Loading indicator — 3 animated bars */}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 22 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 16,
                borderRadius: 3,
                background: "linear-gradient(to top, #8B6914, #F0D98A)",
                animation: `pl-dot-bounce 1.1s ease-in-out ${i * 0.14}s infinite`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>

        {/* Bottom decorative row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
          <div style={{ width: 40, height: 1, background: "linear-gradient(to right, transparent, #C9A84C)" }} />
          <span style={{ fontSize: 13, color: "rgba(201,168,76,0.7)", letterSpacing: "0.2em", fontFamily: "serif" }}>॥ ॐ ॥</span>
          <div style={{ width: 40, height: 1, background: "linear-gradient(to left, transparent, #C9A84C)" }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
export default function App() {
  useScrollReveal();
  useCounter();
  useRefreshBehavior();

  // Skip preloader when navigating from another page via hash links
  const [loading, setLoading] = useState(() => {
    const hash = window.location.hash;
    const skipHashes = ["#consultation", "#about", "#gallery", "#contact"];
    return !skipHashes.some(h => hash.startsWith(h));
  });
  const handlePreloaderDone = useCallback(() => setLoading(false), []);

  const { open: bookingOpen, openModal, closeModal } = useConsultationModal();
  const { open: kundaliOpen, openModal: openKundali, closeModal: closeKundali } = useKundaliModal();

  useEffect(() => {
    document.body.classList.add("ready");
  }, []);

  // Open consultation modal when redirected with ?book=1
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("book") === "1") {
      openModal();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loading]);

  return (
    <HelmetProvider>
      <Helmet>
        {/* ── Primary meta ── */}
        <html lang="en" />
        <title>Pandit Aman Bhatore | Expert Vastu Consultant in Indore, India</title>
        <meta
          name="description"
          content="Book a Vastu Shastra consultation with Pandit Aman Bhatore — 10+ years, 5,000+ clients. Home, office & industrial Vastu. Online & offline. Serving all of India."
        />
        <meta name="keywords" content="vastu consultant indore, vastu shastra expert india, pandit aman bhatore, online vastu consultation, home vastu correction, vastu for business, vedic astrology" />
        <meta name="author" content="Pandit Aman Bhatore" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://panditamanbhatore.com/" />

        {/* ── hreflang: serves Hindi + English content ── */}
        <link rel="alternate" hrefLang="en-in" href="https://panditamanbhatore.com/" />
        <link rel="alternate" hrefLang="hi-in" href="https://panditamanbhatore.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://panditamanbhatore.com/" />

        {/* ── Open Graph (Facebook, WhatsApp, LinkedIn) ── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://panditamanbhatore.com/" />
        <meta property="og:site_name" content="Pandit Aman Bhatore" />
        <meta property="og:title" content="Pandit Aman Bhatore | Expert Vastu Consultant in Indore, India" />
        <meta
          property="og:description"
          content="Transform your home, office or business with expert Vastu guidance. 5,000+ properties analysed across India. Book your consultation today."
        />
        <meta property="og:image" content="https://panditamanbhatore.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:locale" content="en_IN" />

        {/* ── Twitter / X Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pandit Aman Bhatore | Expert Vastu Consultant in Indore, India" />
        <meta
          name="twitter:description"
          content="Transform your home, office or business with expert Vastu guidance. 5,000+ properties analysed across India."
        />
        <meta name="twitter:image" content="https://panditamanbhatore.com/og-image.png" />

        {/* ── Geo / Local SEO ── */}
        <meta name="geo.region" content="IN-MP" />
        <meta name="geo.placename" content="Indore, Madhya Pradesh" />
        <meta name="geo.position" content="22.7196;75.8577" />
        <meta name="ICBM" content="22.7196, 75.8577" />

        {/* ── Fonts: preconnect first, then stylesheet — eliminates FOUC ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
        />

        {/* ── JSON-LD: LocalBusiness + Person + AggregateRating + Reviews ── */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "name": "Pandit Aman Bhatore — Vastu Shastra Consultant",
            "description": "Expert Vastu Shastra consultant offering residential, commercial & industrial consultations across India.",
            "url": "https://panditamanbhatore.com",
            "telephone": "+91-7049001004",
            "priceRange": "₹₹",
            "areaServed": "India",
            "founder": {
              "@type": "Person",
              "name": "Pandit Aman Bhatore",
              "jobTitle": "Vastu Shastra Consultant",
              "knowsAbout": ["Vastu Shastra", "Vedic Astrology", "Jyotish", "Residential Vastu", "Commercial Vastu"]
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Indore",
              "addressRegion": "Madhya Pradesh",
              "addressCountry": "IN"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "bestRating": "5",
              "worstRating": "1",
              "ratingCount": "5",
              "reviewCount": "5"
            },
            "review": [
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Rajesh Kumar" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                "reviewBody": "After Pandit Aman Bhatore's consultation, our business revenue increased by 40% within 3 months. The changes he suggested seemed small but the impact was massive.",
                "datePublished": "2026-01-15"
              },
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Priya Sharma" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                "reviewBody": "Our family was going through constant conflicts and health issues. After the Vastu correction, there is such peace and positivity in our home now. Deeply grateful.",
                "datePublished": "2026-02-10"
              },
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Arvind Mehta" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                "reviewBody": "I was skeptical at first, but the online consultation was thorough and the remedies were practical. My career has seen tremendous growth since then.",
                "datePublished": "2026-03-05"
              },
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Sunita Agarwal" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                "reviewBody": "My restaurant was struggling for 2 years. Post Vastu consultation, within 6 months we went from near-closure to fully booked every weekend.",
                "datePublished": "2026-03-22"
              },
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Vikram Singh" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                "reviewBody": "Pandit ji's plot analysis saved me from a major financial disaster. His detailed report revealed energy issues I never considered. Truly an expert of the highest order.",
                "datePublished": "2026-04-18"
              }
            ],
            "sameAs": [
              "https://www.instagram.com/panditamanbhatore"
            ]
          }
        `}</script>

        {/* ── JSON-LD: FAQPage ── */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Vastu Shastra?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Vastu Shastra is an ancient Indian science of architecture and space that harmonizes human dwellings with natural forces and cosmic energies. It uses directional principles and elemental theory to create spaces that promote well-being, prosperity, and peace."
                }
              },
              {
                "@type": "Question",
                "name": "How does Vastu help in real life?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Vastu creates a balanced flow of energy in your environment, which directly influences mental clarity, relationships, health, and financial growth. Properly aligned spaces reduce subconscious stress and create conditions for positive outcomes."
                }
              },
              {
                "@type": "Question",
                "name": "Do online Vastu consultations work as effectively?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. With detailed floor plans, compass directions, and photographs, an expert like Pandit Aman Bhatore can conduct a thorough remote analysis. The vast majority of online clients report the same powerful results as in-person sessions."
                }
              },
              {
                "@type": "Question",
                "name": "How long does a Vastu consultation take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A standard residential consultation takes 2–4 hours. Commercial or industrial analyses may take longer. You will receive a comprehensive written report within 2–3 business days."
                }
              },
              {
                "@type": "Question",
                "name": "What are the Vastu consultation charges?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Fees vary based on property type and size. We offer transparent, affordable pricing with no hidden charges. Contact us via WhatsApp or the booking form for a personalised quote."
                }
              },
              {
                "@type": "Question",
                "name": "Can Vastu genuinely improve business growth?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes — many clients have reported significant improvements including increased footfall, better team dynamics, and improved cash flow after Vastu corrections. Pandit Aman Bhatore has helped hundreds of businesses transform through strategic energy alignment."
                }
              }
            ]
          }
        `}</script>

        {/* ── JSON-LD: BreadcrumbList ── */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://panditamanbhatore.com/"
              }
            ]
          }
        `}</script>
      </Helmet>

    <div style={{ minHeight: "100vh" }}>
      <GlobalStyles />
      <GlassFilter />
      {loading && <Preloader onComplete={handlePreloaderDone} />}
      <Navbar openBooking={openModal} openKundali={openKundali} />        {/* ← pass openModal */}
      <Hero openBooking={openModal} />          {/* ← pass openModal */}
      <About openBooking={openModal} /> 
      <WhyUs />
      <Testimonials />
      <Gallery />
      <FAQ />
      <CTA openBooking={openModal} />           {/* ← pass openModal */}
      <Footer />

      {/* ─── ADD THIS ─── */}
      <ConsultationModal open={bookingOpen} onClose={closeModal} />
      <KundaliModal open={kundaliOpen} onClose={closeKundali} />
    </div>
    </HelmetProvider>
  );
}
