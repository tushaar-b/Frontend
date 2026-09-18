"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface TransitionContextType {
  isTransitioning: boolean;
  startArchiveTransition: (destination?: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  startArchiveTransition: () => {},
});

export function useArchiveTransition() {
  return useContext(TransitionContext);
}

// Nodes matching the archive storyboard graph layout
const GRAPH_NODES = [
  { id: "root", x: 520, y: 280, label: "Core Memory", tag: "1987–2011", color: "#FFD269", size: 14, delay: 0.1 },
  { id: "wedding", x: 385, y: 145, label: "The Wedding Afternoon", tag: "Delhi · 1987", color: "#E87A9E", size: 10, delay: 0.35 },
  { id: "house", x: 720, y: 80, label: "The House with the Mango Tree", tag: "Pune · 1994", color: "#E87A9E", size: 10, delay: 0.45 },
  { id: "meera", x: 220, y: 380, label: "Meera, the Storyteller", tag: "Voices · 2011", color: "#F6B8CE", size: 11, delay: 0.55 },
  { id: "letter", x: 100, y: 90, label: "Anil's Letter to Meera", tag: "18 July 1994", color: "#E87A9E", size: 8, delay: 0.6 },
  { id: "recipe", x: 810, y: 320, label: "Kavita's Mango Pickle", tag: "Summer 2002", color: "#E87A9E", size: 8, delay: 0.65 },
  { id: "ticket", x: 60, y: 365, label: "Indian Railways Ticket", tag: "16 June 1976", color: "#E87A9E", size: 9, delay: 0.7 },
  { id: "voice", x: 570, y: 450, label: "Meera's Audio Memory", tag: "Spoken Word", color: "#FFD269", size: 10, delay: 0.75 },
  { id: "asha", x: 340, y: 560, label: "Grandmother Asha's Advice", tag: "July 1994", color: "#F6B8CE", size: 8, delay: 0.8 },
  { id: "train", x: 830, y: 520, label: "First Train Journey", tag: "Delhi → Bombay", color: "#E87A9E", size: 8, delay: 0.85 },
];

// Thread arcs connecting nodes
const GRAPH_THREADS = [
  // Primary radiating branches from root (520, 280)
  { d: "M520 280 C460 210 420 180 385 145", delay: 0.15, dur: 0.65, color: "#F9A436" },
  { d: "M520 280 C600 180 660 120 720 80", delay: 0.2, dur: 0.7, color: "#E87A9E" },
  { d: "M520 280 C400 320 300 350 220 380", delay: 0.25, dur: 0.65, color: "#F6B8CE" },
  { d: "M520 280 C540 340 555 400 570 450", delay: 0.3, dur: 0.6, color: "#FFD269" },
  { d: "M520 280 C660 290 740 305 810 320", delay: 0.35, dur: 0.65, color: "#F9A436" },

  // Secondary outer branching threads
  { d: "M385 145 C250 120 160 100 100 90", delay: 0.45, dur: 0.6, color: "#E87A9E" },
  { d: "M220 380 C140 370 95 365 60 365", delay: 0.5, dur: 0.55, color: "#F6B8CE" },
  { d: "M220 380 C260 470 300 520 340 560", delay: 0.55, dur: 0.6, color: "#E87A9E" },
  { d: "M810 320 C820 400 825 460 830 520", delay: 0.6, dur: 0.6, color: "#F9A436" },
  { d: "M570 450 C480 500 400 535 340 560", delay: 0.65, dur: 0.55, color: "#FFD269" },
  { d: "M570 450 C680 480 760 500 830 520", delay: 0.68, dur: 0.55, color: "#E87A9E" },
  { d: "M720 80 C770 180 795 250 810 320", delay: 0.5, dur: 0.65, color: "#F6B8CE" },
];

export function ArchiveTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<"enter" | "growing" | "morph" | "done">("enter");
  const router = useRouter();

  const startArchiveTransition = useCallback((destination: string = "/archive") => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setPhase("growing");

    // Phase 1: Growth of the graph (0 - 1400ms)
    // Phase 2: Morph and navigation (1400ms)
    const morphTimer = setTimeout(() => {
      setPhase("morph");
      router.push(destination);
    }, 1400);

    const doneTimer = setTimeout(() => {
      setIsTransitioning(false);
      setPhase("done");
    }, 2200);

    return () => {
      clearTimeout(morphTimer);
      clearTimeout(doneTimer);
    };
  }, [isTransitioning, router]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, startArchiveTransition }}>
      {children}
      <AnimatePresence>
        {isTransitioning && <GraphTransitionOverlay phase={phase} />}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

function GraphTransitionOverlay({ phase }: { phase: "enter" | "growing" | "morph" | "done" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="fixed inset-0 z-[99999] pointer-events-auto flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        backgroundColor: "#0D0709",
        background: "radial-gradient(ellipse at 50% 45%, #230B17 0%, #0D0709 70%, #080406 100%)",
      }}
    >
      {/* Background ambient firefly particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 3) * 2}px`,
              height: `${2 + (i % 3) * 2}px`,
              left: `${(i * 37) % 96}%`,
              top: `${(i * 47) % 92}%`,
              backgroundColor: i % 2 === 0 ? "#FFD269" : "#E87A9E",
              boxShadow: `0 0 10px ${i % 2 === 0 ? "rgba(255,210,105,0.8)" : "rgba(232,122,158,0.8)"}`,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2.8 + (i % 4) * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i * 0.12),
            }}
          />
        ))}
      </div>

      {/* Center Graph Canvas Container */}
      <motion.div
        className="relative w-full max-w-[1000px] h-[580px] mx-auto px-4"
        animate={
          phase === "morph"
            ? { scale: 1.08, opacity: 0.9, filter: "blur(1px)" }
            : { scale: [0.94, 1.0], opacity: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <svg
          viewBox="0 0 950 620"
          className="w-full h-full overflow-visible drop-shadow-2xl"
          fill="none"
        >
          <defs>
            <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD269" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#E87A9E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#230B17" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Central Pulsing Spark Wave */}
          <motion.circle
            cx="520"
            cy="280"
            r="120"
            fill="url(#sparkGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.6, 2.2],
              opacity: [0.8, 0.4, 0],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Animated Growing Threads (Bézier curves) */}
          {GRAPH_THREADS.map((thread, idx) => (
            <g key={idx}>
              {/* Outer soft glowing thread line */}
              <motion.path
                d={thread.d}
                stroke={thread.color}
                strokeWidth={3}
                strokeOpacity={0.4}
                filter="url(#glow)"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: thread.dur,
                  delay: thread.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              {/* Crisp inner thread line with dashes matching archive board */}
              <motion.path
                d={thread.d}
                stroke={thread.color}
                strokeWidth={1.8}
                strokeDasharray="4 6"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{
                  duration: thread.dur,
                  delay: thread.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </g>
          ))}

          {/* Blooming Memory Nodes & Card Outlines */}
          {GRAPH_NODES.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* Ripple aura */}
              <motion.circle
                r={node.size * 2.5}
                fill={node.color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 2.2],
                  opacity: [0.6, 0.3, 0],
                }}
                transition={{
                  delay: node.delay + 0.1,
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />

              {/* Glowing node sphere */}
              <motion.circle
                r={node.size}
                fill={node.color}
                stroke="#0D0709"
                strokeWidth={2.5}
                filter="url(#glow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: node.delay,
                  duration: 0.45,
                  type: "spring",
                  stiffness: 280,
                  damping: 18,
                }}
              />

              {/* Node Center Core */}
              <motion.circle
                r={node.size * 0.45}
                fill="#FFFFFF"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: node.delay + 0.15,
                  duration: 0.3,
                }}
              />

              {/* Mini Translucent Card Hologram */}
              <motion.g
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: node.delay + 0.25,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                <rect
                  x="-75"
                  y={node.y > 320 ? "-62" : "18"}
                  width="150"
                  height="42"
                  rx="6"
                  fill="#230B17"
                  fillOpacity="0.88"
                  stroke={node.color}
                  strokeWidth="1"
                  strokeOpacity="0.65"
                />
                <text
                  x="0"
                  y={node.y > 320 ? "-44" : "36"}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="'Lora', Georgia, serif"
                  fontSize="10.5"
                  fontWeight="500"
                >
                  {node.label}
                </text>
                <text
                  x="0"
                  y={node.y > 320 ? "-28" : "51"}
                  textAnchor="middle"
                  fill={node.color}
                  fontFamily="'Inter', sans-serif"
                  fontSize="8"
                  fontWeight="600"
                  letterSpacing="1px"
                >
                  {node.tag.toUpperCase()}
                </text>
              </motion.g>
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Bottom Loading Status & Typographic Atmosphere */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center mt-2 px-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div
          className="eyebrow flex items-center gap-2 mb-2.5"
          style={{ color: "#E87A9E", fontSize: "10px", letterSpacing: "2.8px" }}
        >
          <Sparkles size={13} className="text-[#FFD269] animate-pulse" />
          <span>WEAVING THE FAMILY ARCHIVE</span>
          <Sparkles size={13} className="text-[#FFD269] animate-pulse" />
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(22px, 3.2vw, 34px)",
            color: "#FAF6ED",
            fontWeight: 400,
            lineHeight: 1.2,
            textShadow: "0 2px 16px rgba(0,0,0,0.8)",
          }}
        >
          Connecting voices, photographs, and memories…
        </h3>

        {/* Shimmering Progress Bar */}
        <div className="w-56 h-[3px] bg-white/10 rounded-full mt-5 overflow-hidden relative">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #E87A9E 0%, #FFD269 50%, #F6B8CE 100%)",
              boxShadow: "0 0 12px rgba(232, 122, 158, 0.8)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.35, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
export default ArchiveTransitionProvider;
