"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useArchiveTransition } from "@/components/ui/graph-transition-loader";

const IMG_BASE =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread";

const IMG = {
  plane: `${IMG_BASE}/img1.png`,
  painting: `${IMG_BASE}/img2.png`,
  breaker: `${IMG_BASE}/img3.png`,
  dog: `${IMG_BASE}/img4.png`,
  footballer: `${IMG_BASE}/img5.png`,
  jacket: `${IMG_BASE}/img6.png`,
  meadow: `${IMG_BASE}/img7.png`,
  stripes: `${IMG_BASE}/img8.png`,
} as const;

// per-image rest scale, keyed by img index (1-8). default 1, drop below to shrink.
const SCALE: Partial<Record<number, number>> = {
  1: 0.9,
  2: 0.8,
  3: 0.9,
  4: 0.8,
  5: 0.8,
  6: 0.9,
  7: 0.9,
  8: 0.7,
};
const s = (i: number) => SCALE[i] ?? 1;

// array order = stack order, back (z 2) -> front (z 9)
export const DEFAULT_CARDS: StackSpreadCard[] = [
  // top-left stripes (img08) — sm row 1 left
  {
    item: { src: IMG.stripes, alt: "Colour stripes" },
    stackOffset: { x: -8, y: -10 },
    stackRotate: -18,
    target: { x: -20, y: -34, rotate: 0, scale: s(8), w: 17, h: 22 },
    targetSm: { x: -22, y: -40 },
    z: 2,
  },
  // top-right meadow (img07) — sm row 1 right
  {
    item: { src: IMG.meadow, alt: "Wildflower meadow" },
    stackOffset: { x: 14, y: -10 },
    stackRotate: 20,
    target: { x: 32, y: -30, rotate: 0, scale: s(7), w: 18, h: 32 },
    targetSm: { x: 22, y: -40 },
    z: 3,
  },
  // mid-left jacket (img06) — sm row 2 left
  {
    item: { src: IMG.jacket, alt: "Figure in a leather jacket" },
    stackOffset: { x: -16, y: 0 },
    stackRotate: -4,
    target: { x: -36, y: -2, rotate: 0, scale: s(6), w: 15, h: 32 },
    targetSm: { x: -22, y: -19 },
    z: 4,
  },
  // top-centre footballer (img05) — sm row 2 right
  {
    item: { src: IMG.footballer, alt: "Footballer mid-kick" },
    stackOffset: { x: 1, y: -10 },
    stackRotate: -2,
    target: { x: 6, y: -32, rotate: 0, scale: s(5), w: 25, h: 30 },
    targetSm: { x: 22, y: -19 },
    z: 5,
  },
  // mid-right dog (img04) — sm row 3 left
  {
    item: { src: IMG.dog, alt: "Terrier in profile" },
    stackOffset: { x: 18, y: 1 },
    stackRotate: 6,
    target: { x: 37, y: 6, rotate: 0, scale: s(4), w: 18, h: 32 },
    targetSm: { x: -22, y: 20 },
    z: 6,
  },
  // bottom-left breaker (img03) — sm row 3 right
  {
    item: { src: IMG.breaker, alt: "Breakdancer holding a pose" },
    stackOffset: { x: -6, y: 10 },
    stackRotate: 6,
    target: { x: -24, y: 34, rotate: 0, scale: s(3), w: 22, h: 25 },
    targetSm: { x: 22, y: 20 },
    z: 7,
  },
  // bottom-centre painting (img02) — sm row 4 left
  {
    item: { src: IMG.painting, alt: "Renaissance fresco detail" },
    stackOffset: { x: 8, y: 7 },
    stackRotate: 3,
    target: { x: 2, y: 36, rotate: 0, scale: s(2), w: 20, h: 26 },
    targetSm: { x: -22, y: 40 },
    z: 8,
  },
  // bottom-right plane (img01) — sm row 4 right
  {
    item: { src: IMG.plane, alt: "Vintage fighter plane" },
    stackOffset: { x: 20, y: 12 },
    stackRotate: -7,
    target: { x: 30, y: 34, rotate: 0, scale: s(1), w: 16, h: 20 },
    targetSm: { x: 22, y: 40 },
    z: 9,
  },
];

// ---------------------------------------------------------------------------
// Mechanism
// ---------------------------------------------------------------------------

// Scroll progress where the cluster starts scattering and where it finishes.
const SCATTER_START = 0.12;
const SCATTER_END = 0.9;

const PARALLAX_X = 2.6;
const PARALLAX_Y = 2.2;
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.6 };
const parallaxDepth = (i: number, total: number) =>
  total <= 1 ? 1 : 0.55 + (i / (total - 1)) * 0.75;

const SUB = "Digital products, interfaces, and experiences built around people.";

const RESPONSIVE = {
  desktop: {
    scale: null as number | null,
    small: false,
    colX: null as number | null,
    card: null as { w: number; h: number } | null,
  },
  small: {
    scale: 0.72,
    small: true,
    colX: 22,
    card: { w: 40, h: 20 },
  },
};

function useResponsive() {
  const [r, setR] = useState(RESPONSIVE.desktop);
  useEffect(() => {
    // Touch vs. mouse, not raw width: a narrow but mouse-driven frame
    // keeps desktop scatter + pointer parallax; only real touch devices drop to column layout.
    const mq = window.matchMedia("(pointer: coarse)");
    const read = () => setR(mq.matches ? RESPONSIVE.small : RESPONSIVE.desktop);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return r;
}

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, PARALLAX_SPRING);
  const y = useSpring(rawY, PARALLAX_SPRING);

  useEffect(() => {
    if (!enabled) return;

    if (!active) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, enabled, rawX, rawY]);

  return { x, y };
}

export interface StackSpreadItem {
  src?: string;
  alt?: string;
  caption?: string;
  tag?: string;
  render?: () => React.ReactNode;
}

export interface StackSpreadTarget {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  w: number;
  h: number;
}

export interface StackSpreadCard {
  item: StackSpreadItem;
  target: StackSpreadTarget;
  /** final x/y (vw/vh) for tablet + mobile; falls back to `target` */
  targetSm?: { x: number; y: number };
  /** angle while clustered */
  stackRotate?: number;
  /** offset while clustered (vw/vh) */
  stackOffset?: { x: number; y: number };
  /** paint order, higher on top */
  z?: number;
}

function Card({
  card,
  progress,
  scrollYProgress,
  isFocal = false,
  reduce,
  clusterRotation,
  /** uniform rest-scale for every card; null = use each card's own scale */
  scaleMul,
  isSmall,
  colX,
  fixedCard,
  /** scale of the cards while clustered, before the scatter */
  stackScale,
  /** corner radius on each card, in px (desktop) */
  cardRadius,
  pointer,
  depth,
}: {
  card: StackSpreadCard;
  progress: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  isFocal?: boolean;
  reduce: boolean | null;
  clusterRotation: boolean;
  scaleMul: number | null;
  isSmall: boolean;
  colX: number | null;
  fixedCard: { w: number; h: number } | null;
  stackScale: number;
  cardRadius: number;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  depth: number;
}) {
  const { startArchiveTransition } = useArchiveTransition();
  const { item, target } = card;

  const flat = reduce === true;
  const stackRotate = flat ? 0 : clusterRotation ? card.stackRotate ?? 0 : 0;
  const stackOffset = card.stackOffset ?? { x: 0, y: 0 };
  const restScale = scaleMul ?? target.scale ?? 1;

  // Final resting spot for normal cards: column grid on small screens, scatter on desktop
  const sm = isSmall && card.targetSm ? card.targetSm : null;
  const endX = sm
    ? colX != null
      ? Math.sign(sm.x) * colX
      : sm.x
    : target.x;
  const endY = sm ? sm.y : target.y;
  const endRotate = flat || isSmall ? 0 : target.rotate;

  // --- Normal cards translate & motion ---
  const normalTranslate = useTransform(
    [progress, pointer.x, pointer.y],
    ([p, px, py]: number[]) => {
      const tx = stackOffset.x + (endX - stackOffset.x) * p;
      const ty = stackOffset.y + (endY - stackOffset.y) * p;
      const drift = depth * p;
      const dx = tx - px * PARALLAX_X * drift;
      const dy = ty - py * PARALLAX_Y * drift;
      return `calc(-50% + ${dx}vw) calc(-50% + ${dy}vh)`;
    },
  );
  const normalRotate = useTransform(progress, [0, 1], [stackRotate, endRotate]);
  const normalScale = useTransform(progress, [0, 1], [stackScale, restScale]);

  // Normal cards MUST fade out and become display: none when focal transition begins
  const normalOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= 0.22) return 1;
    if (p <= 0.27) return 1 - (p - 0.22) / 0.05;
    return 0;
  });
  const normalDisplay = useTransform(scrollYProgress, (p) => (p > 0.28 ? "none" : "block"));

  // --- Focal card (Wedding photo card that zooms, glides to Section 01 right, zooms back, morphs into Voice Card, glides to Section 02 left) ---
  const destX = isSmall ? 0 : 21.5;
  const destY = isSmall ? 18 : 0;
  const midScale = isSmall ? 1.30 : 1.65;

  // Robust functional translation avoiding calc string interpolation errors
  const focalTranslate = useTransform(scrollYProgress, (p) => {
    let x = target.x;
    let y = target.y;

    if (p <= 0.20) {
      // Act 1: scatter from stackOffset to hero target
      const t = p / 0.20;
      x = stackOffset.x + (target.x - stackOffset.x) * t;
      y = stackOffset.y + (target.y - stackOffset.y) * t;
    } else if (p <= 0.25) {
      // Hero resting hold
      x = target.x;
      y = target.y;
    } else if (p <= 0.36) {
      // Act 2: Move from hero target (33vw, -27vh) to center (0, 0)
      const t = (p - 0.25) / 0.11;
      const ease = 1 - Math.pow(1 - t, 2);
      x = target.x * (1 - ease);
      y = target.y * (1 - ease);
    } else if (p <= 0.48) {
      // Act 2: Glide from center (0, 0) to RIGHT column (+destX, destY) in Section 01
      const t = (p - 0.36) / 0.12;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      x = destX * ease;
      y = destY * ease;
    } else if (p <= 0.58) {
      // Section 01 resting hold on the right
      x = destX;
      y = destY;
    } else if (p <= 0.84) {
      // Act 3 & 4: Continuous smooth glide from RIGHT (+destX) through Center (0) to LEFT (-destX)
      const t = (p - 0.58) / 0.26;
      // Smooth cosine S-curve: goes from +1 at t=0 to -1 at t=1
      const sCurve = Math.cos(t * Math.PI);
      x = destX * sCurve;
      y = destY;
    } else {
      // Section 02 resting hold on the left
      x = -destX;
      y = destY;
    }

    return `calc(-50% + ${x.toFixed(2)}vw) calc(-50% + ${y.toFixed(2)}vh)`;
  });

  const focalScale = useTransform(scrollYProgress, (p) => {
    if (p <= 0.20) {
      const t = p / 0.20;
      return stackScale + (restScale - stackScale) * t;
    }
    if (p <= 0.25) return restScale;
    if (p <= 0.36) {
      // Zoom into center for Section 01 (restScale -> midScale)
      const t = (p - 0.25) / 0.11;
      const ease = 1 - Math.pow(1 - t, 2);
      return restScale + (midScale - restScale) * ease;
    }
    if (p <= 0.48) {
      // Settle down to right column (midScale -> 1.0)
      const t = (p - 0.36) / 0.12;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return midScale + (1.0 - midScale) * ease;
    }
    if (p <= 0.58) return 1.0;
    if (p <= 0.84) {
      // Smooth bell curve zoom: peaks at center (t = 0.5, p = 0.71)
      const t = (p - 0.58) / 0.26;
      const zoomBell = Math.sin(t * Math.PI);
      return 1.0 + (midScale - 1.0) * Math.pow(zoomBell, 1.4);
    }
    return 1.0;
  });

  const focalRotate = useTransform(scrollYProgress, (p) => {
    if (p <= 0.20) {
      const t = p / 0.20;
      return stackRotate + (endRotate - stackRotate) * t;
    }
    if (p <= 0.25) return endRotate;
    if (p <= 0.36) {
      const t = (p - 0.25) / 0.11;
      return endRotate * (1 - t);
    }
    if (p <= 0.48) {
      const t = (p - 0.36) / 0.12;
      return 2 * t;
    }
    if (p <= 0.58) return 2;
    if (p <= 0.84) {
      // Smooth rotation from +2deg to -2deg
      const t = (p - 0.58) / 0.26;
      return 2 - 4 * t;
    }
    return -2;
  });

  const focalZIndex = useTransform(scrollYProgress, (p) => (p >= 0.24 ? 35 : (card.z ?? 1)));

  const heroCaptionOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= 0.25) return 1;
    if (p <= 0.30) return 1 - (p - 0.25) / 0.05;
    return 0;
  });

  const storyFooterOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= 0.38) return 0;
    if (p <= 0.46) return (p - 0.38) / 0.08;
    if (p <= 0.58) return 1;
    if (p <= 0.65) return 1 - (p - 0.58) / 0.07;
    return 0;
  });

  // Generous, silky-smooth cross-fade between Photo Face and Voice Face (p = 0.62 to 0.76)
  const photoFaceOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= 0.62) return 1;
    if (p <= 0.74) {
      const t = (p - 0.62) / 0.12;
      return 1 - (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    }
    return 0;
  });

  const voiceFaceOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= 0.62) return 0;
    if (p <= 0.74) {
      const t = (p - 0.62) / 0.12;
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    return 1;
  });

  if (isFocal) {
    return (
      <motion.div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{
          width: isSmall ? '85vw' : 'clamp(360px, 28vw, 420px)',
          zIndex: focalZIndex,
          translate: focalTranslate,
          rotate: focalRotate,
          scale: focalScale,
        }}
      >
        {/* Unified Card Shell */}
        <div
          className="story-invitation relative w-full pointer-events-auto select-none overflow-hidden"
          style={{
            margin: 0,
            transform: 'none',
            background: '#230B17',
            border: '1px solid rgba(249,164,54,0.22)',
            boxShadow: '0 20px 55px rgba(0,0,0,0.92)',
            borderRadius: '16px',
            padding: '16px',
            minHeight: '430px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* 1. Photo Card Face (Section 01) */}
          <motion.div
            className="w-full flex flex-col justify-between h-full"
            style={{
              opacity: photoFaceOpacity,
            }}
          >
            <a
              href="/archive"
              onClick={(e) => {
                e.preventDefault();
                startArchiveTransition("/archive");
              }}
              className="block w-full cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-[8px]">
                {item.src && (
                  <img
                    src={item.src}
                    alt={item.alt ?? "The wedding photograph"}
                    draggable={false}
                    className="w-full h-[240px] object-cover"
                  />
                )}

                {/* Hero caption pill */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 pointer-events-none"
                  style={{ opacity: heroCaptionOpacity }}
                >
                  <p className="text-white text-xs font-serif italic truncate drop-shadow">
                    {item.caption ?? "The wedding afternoon · Delhi, 1987"}
                  </p>
                  {item.tag && (
                    <span className="text-[9px] uppercase tracking-wider text-[#E87A9E] block mt-0.5 font-semibold">
                      {item.tag}
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Story invitation footer */}
              <motion.div
                className="pt-5 pb-2 px-1"
                style={{ opacity: storyFooterOpacity }}
              >
                <span className="eyebrow" style={{ fontSize: '9px', marginBottom: '8px', color: '#E87A9E' }}>
                  A STORY WAITING TO BE TOLD
                </span>
                <h3 style={{ fontSize: '24px', lineHeight: 1.15, color: '#FFFFFF', margin: '4px 0 12px' }}>
                  Who was standing beside<br />the blue doorway?
                </h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#E87A9E' }}>
                  Meera may remember this afternoon. <ArrowUpRight size={16} />
                </span>
              </motion.div>
            </a>
          </motion.div>

          {/* 2. Voice Recording Card Face (Section 02) */}
          <motion.div
            className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center"
            style={{
              opacity: voiceFaceOpacity,
            }}
          >
            <span className="eyebrow" style={{ fontSize: '9.5px', justifyContent: 'center', color: '#E87A9E', marginBottom: '12px' }}>
              A QUESTION FROM YOUR FAMILY
            </span>
            <h3 style={{ fontSize: '26px', lineHeight: 1.2, color: '#FFFFFF', margin: '0 0 24px' }}>
              Do you remember<br />the blue doorway?
            </h3>
            <a
              href="/contribute/demo-question"
              aria-label="Preview recording"
              className="record-demo"
              style={{
                width: '74px',
                height: '74px',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg,#FFD269 0%,#F9A436 100%)',
                borderRadius: '50%',
                color: '#0D0709',
                outline: '1px solid #FFD269',
                outlineOffset: '7px',
                boxShadow: '0 0 35px rgba(249,164,54,0.4)',
                transition: 'all .2s',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" /><path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" />
              </svg>
            </a>
            <span style={{ fontSize: '12px', color: '#E0D7DC' }}>A little detail is enough.</span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-transform shadow-2xl"
      style={{
        width: `${fixedCard ? fixedCard.w : target.w}vw`,
        height: `${fixedCard ? fixedCard.h : target.h}vh`,
        zIndex: card.z ?? 1,
        translate: normalTranslate,
        rotate: normalRotate,
        scale: normalScale,
        opacity: normalOpacity,
        display: normalDisplay,
      }}
    >
      <CardFace item={item} cardRadius={cardRadius} />
    </motion.div>
  );
}

function CardFace({
  item,
  cardRadius,
}: {
  item: StackSpreadItem;
  cardRadius: number;
}) {
  if (item.render) {
    return (
      <div
        className="relative h-full w-full overflow-hidden max-md:rounded-[4vw] shadow-[0_16px_45px_rgba(0,0,0,0.85)]"
        style={{ borderRadius: `${cardRadius}px` }}
      >
        {item.render()}
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden max-md:rounded-[4vw] bg-[#230B17] border border-[rgba(249,164,54,0.22)] shadow-[0_16px_45px_rgba(0,0,0,0.85)]"
      style={{ borderRadius: `${cardRadius}px` }}
    >
      {item.src && (
        <img
          src={item.src}
          alt={item.alt ?? ""}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {item.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 pointer-events-none">
          <p className="text-white text-xs font-serif italic truncate drop-shadow">
            {item.caption}
          </p>
          {item.tag && (
            <span className="text-[9px] uppercase tracking-wider text-[#E87A9E] block mt-0.5 font-semibold">
              {item.tag}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export interface FireflyLayerProps {
  count?: number;
  color?: string;
  className?: string;
}

export function FireflyLayer({ count = 50, color = "#FFD269", className = "" }: FireflyLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Color palettes: Warm goldenrod (primary), luminous champagne, and gentle rose-gold
    const colorThemes = [
      { r: 255, g: 210, b: 105 }, // Warm Gold #FFD269
      { r: 249, g: 164, b: 54 },  // Deep Amber #F9A436
      { r: 255, g: 232, b: 160 }, // Bright Champagne
      { r: 246, g: 184, b: 206 }, // Subtle Rose-Gold #F6B8CE
    ];

    // Initialize fireflies with depth tiers, organic wandering sine waves, and breathing luminescence
    const fireflies = Array.from({ length: count }, () => {
      const depth = Math.random() * 0.65 + 0.35; // 0.35 (background) to 1.0 (foreground)
      const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      return {
        x: Math.random() * (width || 1200),
        y: Math.random() * (height || 800),
        depth,
        size: (Math.random() * 2.2 + 1.6) * depth,
        r: theme.r,
        g: theme.g,
        b: theme.b,
        baseAlpha: Math.random() * 0.4 + 0.55, // Prominent base brightness
        alpha: 0,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.025 + 0.012,
        speedY: (Math.random() * 0.4 + 0.18) * depth,
        speedX: (Math.random() - 0.5) * 0.25,
        sineSpeed1: Math.random() * 0.02 + 0.008,
        sineAmp1: (Math.random() * 1.8 + 0.8) * depth,
        sineSpeed2: Math.random() * 0.035 + 0.015,
        sineAmp2: Math.random() * 1.0 + 0.3,
      };
    });

    let t = 0;
    const render = () => {
      t++;
      ctx.clearRect(0, 0, width, height);

      // Additive blend mode for radiant optical luminosity
      ctx.globalCompositeOperation = "lighter";

      for (const f of fireflies) {
        f.y -= f.speedY;
        f.phase += f.phaseSpeed;
        f.x += Math.sin(t * f.sineSpeed1 + f.phase) * f.sineAmp1 + Math.cos(t * f.sineSpeed2) * f.sineAmp2 + f.speedX;

        // Wrap seamlessly around screen boundaries
        if (f.y < -30) {
          f.y = height + 20;
          f.x = Math.random() * width;
        }
        if (f.x < -30) f.x = width + 20;
        if (f.x > width + 30) f.x = -20;

        // Natural organic bioluminescent breathing (power curve for gentle warm swells)
        const rawPulse = Math.sin(f.phase);
        const breath = Math.pow(Math.max(0, rawPulse), 1.6);
        const baseline = 0.22;
        const currentAlpha = f.baseAlpha * (baseline + (1 - baseline) * breath);

        // Edge fade near screen borders
        const edgeMargin = 40;
        let edgeFade = 1;
        if (f.x < edgeMargin) edgeFade = Math.min(edgeFade, Math.max(0, f.x / edgeMargin));
        if (f.x > width - edgeMargin) edgeFade = Math.min(edgeFade, Math.max(0, (width - f.x) / edgeMargin));
        if (f.y < edgeMargin) edgeFade = Math.min(edgeFade, Math.max(0, f.y / edgeMargin));
        if (f.y > height - edgeMargin) edgeFade = Math.min(edgeFade, Math.max(0, (height - f.y) / edgeMargin));

        f.alpha = currentAlpha * edgeFade;

        if (f.alpha > 0.01) {
          const glowRadius = f.size * (6.0 + 2.5 * breath);

          // 1. Expansive soft atmospheric aura
          const outerGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowRadius);
          outerGrad.addColorStop(0, `rgba(${f.r}, ${f.g}, ${f.b}, ${f.alpha * 0.75})`);
          outerGrad.addColorStop(0.3, `rgba(${f.r}, ${f.g}, ${f.b}, ${f.alpha * 0.35})`);
          outerGrad.addColorStop(0.7, `rgba(${f.r}, ${f.g}, ${f.b}, ${f.alpha * 0.08})`);
          outerGrad.addColorStop(1, `rgba(${f.r}, ${f.g}, ${f.b}, 0)`);

          ctx.beginPath();
          ctx.arc(f.x, f.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = outerGrad;
          ctx.fill();

          // 2. Focused warm mid halo
          const midRadius = f.size * 2.6;
          const midGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, midRadius);
          midGrad.addColorStop(0, `rgba(255, 245, 215, ${f.alpha * 0.95})`);
          midGrad.addColorStop(0.45, `rgba(${f.r}, ${f.g}, ${f.b}, ${f.alpha * 0.65})`);
          midGrad.addColorStop(1, `rgba(${f.r}, ${f.g}, ${f.b}, 0)`);

          ctx.beginPath();
          ctx.arc(f.x, f.y, midRadius, 0, Math.PI * 2);
          ctx.fillStyle = midGrad;
          ctx.fill();

          // 3. Hot incandescent spark core
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 240, ${Math.min(1, f.alpha * 1.4)})`;
          ctx.fill();

          // 4. Subtle anamorphic lens glint during peak glow
          if (breath > 0.65 && f.depth > 0.6) {
            const glintLen = f.size * (2.8 + breath * 1.5);
            const glintAlpha = f.alpha * (breath - 0.65) * 1.8;
            ctx.strokeStyle = `rgba(255, 248, 220, ${glintAlpha})`;
            ctx.lineWidth = 0.75;

            // Horizontal spike
            ctx.beginPath();
            ctx.moveTo(f.x - glintLen, f.y);
            ctx.lineTo(f.x + glintLen, f.y);
            ctx.stroke();

            // Vertical spike
            ctx.beginPath();
            ctx.moveTo(f.x, f.y - glintLen * 0.65);
            ctx.lineTo(f.x, f.y + glintLen * 0.65);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ zIndex: 2 }}
    />
  );
}

export interface StackSpreadStageProps {
  cards: StackSpreadCard[];
  /** scatter scroll distance, in vh */
  scrollLength?: number;
  bgColor?: string;
  /** fan the clustered stack (default) or start flat */
  clusterRotation?: boolean;
  /** scale of the cards while clustered, before the scatter */
  stackScale?: number;
  /** corner radius on each card, in px (desktop only — mobile keeps its responsive radius) */
  cardRadius?: number;
  /** color of the centre headline and subtitle */
  textColor?: string;
  /** scroll progress (0-1) where the centre text starts fading in */
  textFadeStart?: number;
  /** show the "scroll to spread" hint at the bottom until the scatter begins */
  showScrollHint?: boolean;
  /** custom title node */
  title?: React.ReactNode;
  /** custom subtitle node */
  subtitle?: React.ReactNode;
  /** optional custom children node replacing or augmenting default text */
  children?: React.ReactNode;
  /** custom scroll hint label */
  scrollHintText?: string;
  /** enable glowing fireflies particle layer behind the cards */
  showFireflies?: boolean;
  /** firefly particle count */
  fireflyCount?: number;
  /** index of the focal card that transitions into the editorial section (default 1) */
  focalIndex?: number;
  /** enable the continuous editorial reveal transition for the focal card */
  enableEditorialReveal?: boolean;
}

export function StackSpreadStage({
  cards,
  scrollLength = 350,
  bgColor = "#ececeb",
  clusterRotation = true,
  stackScale = 0.82,
  cardRadius = 8,
  textColor = "#141414",
  textFadeStart = 0.3,
  showScrollHint = true,
  title,
  subtitle,
  children,
  scrollHintText = "Scroll",
  showFireflies = true,
  fireflyCount = 50,
  focalIndex = 1,
  enableEditorialReveal = true,
}: StackSpreadStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { startArchiveTransition } = useArchiveTransition();
  const { scale: scaleMul, small: isSmall, colX, card: fixedCard } =
    useResponsive();

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // Act 1: scatter progress (0 to 0.22)
  const progress = useTransform(
    scrollYProgress,
    [0, 0.03, 0.18, 0.22],
    [0, 0, 1, 1],
  );

  // centre text always fades in on scroll, and fades out when focal transition begins
  const [spread, setSpread] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    setSpread((was) => (was ? p > 0.985 : p >= 0.999));
  });
  const parallaxEnabled = reduce !== true && !isSmall;
  const pointer = usePointerParallax(spread, parallaxEnabled);

  const noScale = reduce === true;
  const copyOpacity = useTransform(scrollYProgress, (p) => {
    if (p < 0.03) return 0;
    if (p < 0.10) return (p - 0.03) / 0.07;
    if (p <= 0.22) return 1;
    if (p <= 0.27) return 1 - (p - 0.22) / 0.05;
    return 0;
  });
  const copyDisplay = useTransform(scrollYProgress, (p) => (p > 0.28 ? "none" : "flex"));
  const copyScale = useTransform(scrollYProgress, [0.03, 0.12], [0.88, 1]);

  // Editorial Section 01 reveal on the left during Act 2 (p = 0.36 to 0.67)
  const sec1Opacity = useTransform(scrollYProgress, (p) => {
    if (p < 0.36) return 0;
    if (p <= 0.46) return (p - 0.36) / 0.10;
    if (p <= 0.58) return 1;
    if (p <= 0.67) return 1 - (p - 0.58) / 0.09;
    return 0;
  });
  const sec1TranslateX = useTransform(scrollYProgress, (p) => {
    if (p < 0.36) return -40;
    if (p <= 0.46) return -40 * (1 - (p - 0.36) / 0.10);
    if (p <= 0.58) return 0;
    if (p <= 0.67) return -30 * ((p - 0.58) / 0.09);
    return -30;
  });
  const sec1Display = useTransform(scrollYProgress, (p) => (p < 0.32 || p > 0.68 ? "none" : "flex"));

  // Editorial Section 02 reveal on the right during Act 4 (p = 0.72 to 1.00)
  const sec2Opacity = useTransform(scrollYProgress, (p) => {
    if (p < 0.72) return 0;
    if (p <= 0.84) return (p - 0.72) / 0.12;
    return 1;
  });
  const sec2TranslateX = useTransform(scrollYProgress, (p) => {
    if (p < 0.72) return 40;
    if (p <= 0.84) return 40 * (1 - (p - 0.72) / 0.12);
    return 0;
  });
  const sec2Display = useTransform(scrollYProgress, (p) => (p < 0.70 ? "none" : "flex"));

  // scroll hint: visible while clustered, gone by the time the scatter starts
  const hintOpacity = useTransform(scrollYProgress, (p) => (p > 0.04 ? 0 : 1 - p / 0.04));
  const hintDisplay = useTransform(scrollYProgress, (p) => (p > 0.04 ? "none" : "flex"));

  return (
    <section
      ref={wrapRef}
      className="relative w-full"
      style={{ height: `${scrollLength}vh`, backgroundColor: bgColor }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* glowing fireflies particle layer behind the cards */}
        {showFireflies && <FireflyLayer count={fireflyCount} />}

        {/* Editorial Section 01 - revealed during second act on the left */}
        {enableEditorialReveal && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            style={{
              opacity: sec1Opacity,
              display: sec1Display,
            }}
          >
            <div className="editorial w-full pointer-events-auto" style={{ background: "transparent" }}>
              <motion.div style={{ x: sec1TranslateX }}>
                <div
                  className="eyebrow"
                  style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "1.2px",
                    color: "#E87A9E",
                    marginBottom: "18px",
                  }}
                >
                  01/ FOLLOW THE THREAD
                </div>
                <h2
                  style={{
                    fontFamily: "'Londrina Solid', sans-serif",
                    fontSize: "clamp(38px, 4.3vw, 68px)",
                    fontWeight: 900,
                    lineHeight: 1.0,
                    letterSpacing: "-0.5px",
                    color: "#FFFFFF",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                    margin: 0,
                  }}
                >
                  Some stories are still
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'Luxurious Script', cursive",
                      fontSize: "clamp(46px, 5.0vw, 78px)",
                      fontWeight: 400,
                      lineHeight: 1.15,
                      color: "#F6B8CE",
                      letterSpacing: "0px",
                      whiteSpace: "nowrap",
                      marginTop: "-2px",
                      textTransform: "none",
                    }}
                  >
                    between the photographs.
                  </span>
                </h2>
                <p
                  style={{
                    fontFamily: "'Narnoor', sans-serif",
                    fontSize: "17px",
                    lineHeight: 1.7,
                    fontWeight: 400,
                    color: "#E0D7DC",
                    maxWidth: "460px",
                    marginTop: "22px",
                    marginBottom: "26px",
                  }}
                >
                  A familiar face. A place you almost remember.<br />
                  Begin with one little question, and see where it takes you.
                </p>
                <a
                  className="text-link cursor-pointer"
                  href="/archive"
                  onClick={(e) => {
                    e.preventDefault();
                    startArchiveTransition("/archive");
                  }}
                >
                  Discover a missing story <ArrowRight size={17} />
                </a>
              </motion.div>
              {/* Right column: space where the focal wedding card settles in Section 01 */}
              <div className="hidden md:block pointer-events-none" />
            </div>
          </motion.div>
        )}

        {/* Editorial Section 02 - revealed during third act on the right */}
        {enableEditorialReveal && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            style={{
              opacity: sec2Opacity,
              display: sec2Display,
            }}
          >
            <div className="editorial w-full pointer-events-auto" style={{ background: "transparent" }}>
              {/* Left column: space where the morphed voice card settles in Section 02 */}
              <div className="hidden md:block pointer-events-none" />

              {/* Right column: Section 02 Editorial text */}
              <motion.div style={{ x: sec2TranslateX }}>
                <div
                  className="eyebrow"
                  style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "1.2px",
                    color: "#E87A9E",
                    marginBottom: "18px",
                  }}
                >
                  02/ MAKE ROOM FOR A VOICE
                </div>
                <h2
                  style={{
                    fontFamily: "'Londrina Solid', sans-serif",
                    fontSize: "clamp(38px, 4.3vw, 68px)",
                    fontWeight: 900,
                    lineHeight: 1.0,
                    letterSpacing: "-0.5px",
                    color: "#FFFFFF",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                    margin: 0,
                  }}
                >
                  One question.
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'Luxurious Script', cursive",
                      fontSize: "clamp(46px, 5.0vw, 78px)",
                      fontWeight: 400,
                      lineHeight: 1.15,
                      color: "#F6B8CE",
                      letterSpacing: "0px",
                      whiteSpace: "nowrap",
                      marginTop: "-2px",
                      textTransform: "none",
                    }}
                  >
                    their own words.
                  </span>
                </h2>
                <p
                  style={{
                    fontFamily: "'Narnoor', sans-serif",
                    fontSize: "17px",
                    lineHeight: 1.7,
                    fontWeight: 400,
                    color: "#E0D7DC",
                    maxWidth: "460px",
                    marginTop: "22px",
                    marginBottom: "26px",
                  }}
                >
                  No perfect telling needed. Just an invitation to remember,<br />
                  in the voice you know by heart.
                </p>
                <a className="text-link" href="/contribute/demo-question">
                  Try a little remembering <ArrowRight size={17} />
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* scattering cards */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              progress={progress}
              scrollYProgress={scrollYProgress}
              isFocal={enableEditorialReveal && i === focalIndex}
              reduce={reduce}
              clusterRotation={clusterRotation}
              scaleMul={scaleMul}
              isSmall={isSmall}
              colX={colX}
              fixedCard={fixedCard}
              stackScale={stackScale}
              cardRadius={cardRadius}
              pointer={pointer}
              depth={parallaxEnabled ? parallaxDepth(i, cards.length) : 0}
            />
          ))}
        </div>

        {/* centre text / children - rendered strictly above cards (z-30) */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center max-md:px-8 pointer-events-none"
          style={{
            opacity: copyOpacity,
            display: copyDisplay,
            scale: noScale ? 1 : copyScale,
          }}
        >
          {children ? (
            <div className="pointer-events-auto flex flex-col items-center justify-center">
              {children}
            </div>
          ) : (
            <>
              {title ? (
                <div className="w-full pointer-events-auto">{title}</div>
              ) : (
                <h2
                  className="w-full whitespace-pre-line text-[4.5vw] font-normal leading-none! tracking-tight max-md:text-[10vw]"
                  style={{ color: textColor }}
                >
                  Design
                  <span className="opacity-60"> That </span>
                  Responds.
                </h2>
              )}
              {subtitle ? (
                <div className="pointer-events-auto">{subtitle}</div>
              ) : (
                <p
                  className="mt-[1.2vw] w-full max-w-[42ch] text-[1.15vw] leading-relaxed tracking-tight max-md:mt-3 max-md:text-[3.6vw]"
                  style={{ color: textColor, opacity: 0.6 }}
                >
                  {SUB}
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* scroll hint */}
        {showScrollHint && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-20 flex flex-col items-center gap-[0.6vh] text-[0.8vw] font-medium uppercase tracking-[0.2em] max-md:bottom-6 max-md:gap-1 max-md:text-[2.8vw]"
            style={{ color: textColor, opacity: hintOpacity, display: hintDisplay }}
          >
            <span>{scrollHintText}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce max-md:h-[4vw] max-md:w-[4vw]"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export interface StackSpreadProps {
  cards?: StackSpreadCard[];
  /** scatter scroll distance, in vh */
  scrollLength?: number;
  bgColor?: string;
  /** fan the clustered stack (default) or start flat */
  clusterRotation?: boolean;
  /** scale of the cards while clustered, before the scatter */
  stackScale?: number;
  /** corner radius on each card, in px (desktop only — mobile keeps its responsive radius) */
  cardRadius?: number;
  /** color of the centre headline and subtitle */
  textColor?: string;
  /** scroll progress (0-1) where the centre text starts fading in */
  textFadeStart?: number;
  /** show the "scroll to spread" hint at the bottom until the scatter begins */
  showScrollHint?: boolean;
  /** custom title node */
  title?: React.ReactNode;
  /** custom subtitle node */
  subtitle?: React.ReactNode;
  /** optional custom children node replacing or augmenting default text */
  children?: React.ReactNode;
  /** custom scroll hint label */
  scrollHintText?: string;
  /** enable glowing fireflies particle layer behind the cards */
  showFireflies?: boolean;
  /** firefly particle count */
  fireflyCount?: number;
  /** index of the focal card that transitions into the editorial section (default 1) */
  focalIndex?: number;
  /** enable the continuous editorial reveal transition for the focal card */
  enableEditorialReveal?: boolean;
}

export default function StackSpread({
  cards = DEFAULT_CARDS,
  scrollLength = 350,
  bgColor = "#ececeb",
  clusterRotation = true,
  stackScale = 0.82,
  cardRadius = 8,
  textColor = "#141414",
  textFadeStart = 0.3,
  showScrollHint = true,
  title,
  subtitle,
  children,
  scrollHintText = "Scroll",
  showFireflies = true,
  fireflyCount = 50,
  focalIndex = 1,
  enableEditorialReveal = true,
}: StackSpreadProps) {
  return (
    <StackSpreadStage
      cards={cards}
      scrollLength={scrollLength}
      bgColor={bgColor}
      clusterRotation={clusterRotation}
      stackScale={stackScale}
      cardRadius={cardRadius}
      textColor={textColor}
      textFadeStart={textFadeStart}
      showScrollHint={showScrollHint}
      title={title}
      subtitle={subtitle}
      children={children}
      scrollHintText={scrollHintText}
      showFireflies={showFireflies}
      fireflyCount={fireflyCount}
      focalIndex={focalIndex}
      enableEditorialReveal={enableEditorialReveal}
    />
  );
}
