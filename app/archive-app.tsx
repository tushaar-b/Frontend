'use client';
import { ArrowUpRight, ArrowRight, Play, AudioLines, Sparkle } from 'lucide-react';
import StackSpread, { type StackSpreadCard } from '@/components/ui/stack-spread';
import ShinyButton from '@/components/ui/shiny-button';
import { ArchiveTransitionProvider, useArchiveTransition } from '@/components/ui/graph-transition-loader';

export function Brand() { return <a href="/" className="brand"><Sparkle size={29} strokeWidth={1} /><span>MNEMOVAULT</span></a> }
export function Wave() { return <span className="wave" aria-hidden="true">{Array.from({ length: 37 }, (_, i) => <i key={i} style={{ height: 8 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * .6)) * 25 }} />)}</span> }

const ARCHIVE_CARDS: StackSpreadCard[] = [
  // 1. Top-left: The House with the Mango Tree (Pune, 1994)
  {
    item: {
      src: "/images/house.png",
      alt: "The house with the mango tree, Pune 1994",
      caption: "The house with the mango tree · Pune, 1994",
      tag: "Photographs",
    },
    stackOffset: { x: -10, y: -12 },
    stackRotate: -14,
    target: { x: -33, y: -29, rotate: -4, scale: 1.02, w: 29, h: 38 },
    targetSm: { x: -22, y: -40 },
    z: 2,
  },
  // 2. Top-right: The Wedding Afternoon (Delhi, 1987)
  {
    item: {
      src: "/images/wedding.png",
      alt: "The wedding afternoon, Delhi 1987",
      caption: "The wedding afternoon · Delhi, 1987",
      tag: "Photographs",
    },
    stackOffset: { x: 14, y: -12 },
    stackRotate: 16,
    target: { x: 33, y: -27, rotate: 4, scale: 1.04, w: 30, h: 40 },
    targetSm: { x: 22, y: -40 },
    z: 3,
  },
  // 3. Mid-left: Anil's letter to Meera (18 July 1994)
  {
    item: {
      render: () => (
        <div className="letter h-full w-full p-7 overflow-hidden flex flex-col justify-between select-none bg-[#280C1B] text-white border border-[rgba(249,164,54,0.25)] shadow-2xl">
          <small className="text-[#E87A9E] text-[10.5px] tracking-[2.5px] font-semibold block uppercase">PUNE, 18 JULY 1994</small>
          <p className="font-serif italic text-[17px] leading-[1.52] my-2.5 text-white">
            My dear Meera,<br /><br />
            The house is smaller than we imagined. But there is a mango tree in the courtyard, and already it feels like ours.<br /><br />
            Come soon. There is so much to tell.
          </p>
          <em className="text-[#F6B8CE] font-serif italic text-[16px] block text-right">With love, Anil</em>
        </div>
      ),
    },
    stackOffset: { x: -16, y: 0 },
    stackRotate: -5,
    target: { x: -39, y: 0, rotate: -3, scale: 0.96, w: 24, h: 38 },
    targetSm: { x: -22, y: -19 },
    z: 4,
  },
  // 4. Top-center: Indian Railways Ticket (16 June 1976)
  {
    item: {
      render: () => (
        <div className="ticket !static !w-full !h-full !transform-none !bottom-auto !left-auto p-6 overflow-hidden flex flex-col justify-between select-none bg-[#162E25] text-white border border-[rgba(249,164,54,0.3)] shadow-2xl border-t-[3px] border-t-double border-b-[3px] border-b-double border-[#F9A436]">
          <small className="text-[#E87A9E] text-[10px] tracking-[2.5px] font-semibold block uppercase">INDIAN RAILWAYS</small>
          <strong className="flex items-center gap-3 font-serif text-[21px] text-white my-1.5">
            DELHI <ArrowRight size={20} className="text-[#E87A9E]" /> BOMBAY
          </strong>
          <span className="font-mono text-[10px] text-[#E87A9E] block">SECOND CLASS · 16 JUNE 1976</span>
          <div className="font-mono text-[10px] border-t border-dashed border-[rgba(249,164,54,0.3)] pt-2.5 text-[#E0D7DC]">
            № 047219 &nbsp; ———— &nbsp; ONE JOURNEY
          </div>
        </div>
      ),
    },
    stackOffset: { x: 1, y: -14 },
    stackRotate: -2,
    target: { x: 0, y: -39, rotate: 1, scale: 0.94, w: 27, h: 31 },
    targetSm: { x: 22, y: -19 },
    z: 5,
  },
  // 5. Mid-right: Meera's Audio Recording Memory
  {
    item: {
      render: () => (
        <div className="hero-audio !static !w-full !h-full !transform-none !bottom-auto !right-auto p-6 overflow-hidden flex items-center gap-5 select-none bg-[#230B17] text-white border border-[rgba(232,122,158,0.28)] shadow-2xl rounded-[4px]">
          <span className="audio-play grid place-items-center text-[#E87A9E] bg-[#2B0E1B] border border-[rgba(249,164,54,0.38)] rounded-full w-12 h-12 shrink-0">
            <AudioLines size={24} />
          </span>
          <div className="min-w-0">
            <small className="block text-[9px] tracking-[1.5px] text-[#E87A9E] uppercase font-semibold">MEERA&apos;S MEMORY</small>
            <Wave />
            <span className="block font-serif italic text-[17px] mt-1.5 text-[#E87A9E] truncate">“Oh, I remember that afternoon…”</span>
          </div>
          <small className="font-mono text-[11px] text-[#E0D7DC] ml-auto shrink-0">0:42</small>
        </div>
      ),
    },
    stackOffset: { x: 18, y: 2 },
    stackRotate: 7,
    target: { x: 39, y: 6, rotate: 3, scale: 0.96, w: 27, h: 30 },
    targetSm: { x: -22, y: 20 },
    z: 6,
  },
  // 6. Bottom-left: Meera, the Storyteller (Photographs / Voices)
  {
    item: {
      src: "/images/meera.png",
      alt: "Meera, the storyteller",
      caption: "Meera, the storyteller · Around 2011",
      tag: "Voices",
    },
    stackOffset: { x: -8, y: 11 },
    stackRotate: 5,
    target: { x: -32, y: 32, rotate: -3, scale: 1.0, w: 26, h: 35 },
    targetSm: { x: 22, y: 20 },
    z: 7,
  },
  // 7. Bottom-center: Kavita's Mango Pickle Recipe Note
  {
    item: {
      render: () => (
        <div className="letter h-full w-full p-6 overflow-hidden flex flex-col justify-between select-none bg-[#280C1B] text-white border border-[rgba(249,164,54,0.22)] shadow-2xl">
          <small className="text-[#E87A9E] text-[10px] tracking-[2px] font-semibold block uppercase">PUNE · SUMMER 2002</small>
          <p className="font-serif italic text-[16px] leading-[1.48] my-2.5 text-white">
            Green mangoes, mustard seeds, turmeric, chilli and salt. Dry the mango pieces in the afternoon sun. Warm the oil, then let it cool.
          </p>
          <em className="text-[#F6B8CE] font-serif italic text-[15px] block text-right">Kavita&apos;s recipe</em>
        </div>
      ),
    },
    stackOffset: { x: 7, y: 10 },
    stackRotate: 4,
    target: { x: 0, y: 39, rotate: -1, scale: 0.94, w: 27, h: 30 },
    targetSm: { x: -22, y: 40 },
    z: 8,
  },
  // 8. Bottom-right: Grandmother Asha's Tea & Home Note
  {
    item: {
      render: () => (
        <div className="letter h-full w-full p-6 overflow-hidden flex flex-col justify-between select-none bg-[#280C1B] text-white border border-[rgba(249,164,54,0.22)] shadow-2xl">
          <small className="text-[#E87A9E] text-[10px] tracking-[2px] font-semibold block uppercase">DELHI · JULY 1994</small>
          <p className="font-serif italic text-[16px] leading-[1.48] my-2.5 text-white">
            Have you reached safely? Put the kettle on before you unpack. A house begins to feel like home with the first cup of tea.
          </p>
          <em className="text-[#F6B8CE] font-serif italic text-[15px] block text-right">Asha</em>
        </div>
      ),
    },
    stackOffset: { x: 20, y: 13 },
    stackRotate: -8,
    target: { x: 33, y: 33, rotate: 5, scale: 0.96, w: 26, h: 32 },
    targetSm: { x: 22, y: 40 },
    z: 9,
  },
];

export default function ArchiveApp() {
  const { startArchiveTransition } = useArchiveTransition();

  return (
    <div className="welcome">
      <header className="welcome-nav">
        <Brand />
        <nav>
          <a href="#how-it-works">How it works</a>
          <ShinyButton
            onClick={() => startArchiveTransition("/archive")}
            className="nav-archive-shiny"
            fillColor="#280C1B"
            labelColor="#FFD269"
            accentColor="#F9A436"
            accentSoftColor="#FFD269"
            cornerRadius={4}
            sweepDuration={3}
            arcWidth={14}
            style={{
              padding: '11px 20px',
              fontSize: '13px',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)',
            }}
          >
            Open sample archive <ArrowUpRight size={16} />
          </ShinyButton>
        </nav>
      </header>
      <main>
        <StackSpread
          cards={ARCHIVE_CARDS}
          bgColor="#0D0709"
          textColor="#FFFFFF"
          scrollLength={700}
          stackScale={1.12}
          scrollHintText="Scroll to follow the thread"
          clusterRotation={true}
          cardRadius={7}
          showFireflies={true}
          fireflyCount={50}
          focalIndex={1}
          enableEditorialReveal={true}
        >
          <div className="flex flex-col items-center max-w-[840px] px-4 pointer-events-auto">
            <div className="eyebrow" style={{ color: '#E87A9E', marginBottom: '22px', letterSpacing: '2.5px', textShadow: '0 2px 12px rgba(13,7,9,0.9)' }}>
              <span style={{ width: '25px', height: '1px', background: '#E87A9E', display: 'inline-block' }} />
              THE LIVING FAMILY ARCHIVE
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(44px, 5.2vw, 86px)', letterSpacing: '-2px', lineHeight: 1.02, color: '#FFFFFF', textShadow: '0 4px 30px rgba(13,7,9,0.95), 0 1px 12px rgba(13,7,9,0.85)' }}>
              A photograph keeps a moment.<br />
              <em style={{ color: '#F6B8CE', textShadow: '0 0 30px rgba(232,122,158,0.45), 0 4px 20px rgba(13,7,9,0.95)', fontStyle: 'italic', fontWeight: 400 }}>A voice brings it home.</em>
            </h1>
            <p style={{ marginTop: '24px', fontSize: '15px', lineHeight: 1.85, color: '#E0D7DC', maxWidth: '520px', textShadow: '0 2px 18px rgba(13,7,9,0.95), 0 1px 8px rgba(13,7,9,0.85)' }}>
              Gather the photographs, voices, and little details that make your family yours.
              Discover the stories still waiting to be told.
            </p>
            <p className="hero-note" style={{ fontSize: '12px', color: '#A898A0', marginTop: '28px', letterSpacing: '0.5px', textShadow: '0 2px 14px rgba(13,7,9,0.9)' }}>
              Start with a photograph. Follow the thread.
            </p>
          </div>
        </StackSpread>
        <div className="welcome-divider">
          <span>EVERY FAMILY HAS AN ARCHIVE. SOME OF IT LIVES IN PEOPLE.</span>
          <span>SCROLL TO FOLLOW THE THREAD ↓</span>
        </div>
        <section className="film-invitation">
          <img src="/images/house.png" alt="Illustrative family home with a mango tree" width={1200} height={650} />
          <div>
            <span className="eyebrow">03 / BRING IT ALL TOGETHER</span>
            <h2>A story you can<br /><em>return to.</em></h2>
            <a className="light-button" href="/film"><Play size={16} /> Watch the Mehra family story</a>
          </div>
        </section>
        <section className="closing" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            className="eyebrow"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '1.2px',
              color: '#E87A9E',
              marginBottom: '18px',
              justifyContent: 'center',
            }}
          >
            THE NEXT CHAPTER STARTS WITH A QUESTION
          </span>
          <h2
            style={{
              fontFamily: "'Londrina Solid', sans-serif",
              fontSize: 'clamp(38px, 4.3vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-0.5px',
              color: '#FFFFFF',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              margin: '0 0 35px 0',
              textAlign: 'center',
            }}
          >
            There is a story only
            <span
              style={{
                display: 'block',
                fontFamily: "'Luxurious Script', cursive",
                fontSize: 'clamp(46px, 5.0vw, 78px)',
                fontWeight: 400,
                lineHeight: 1.15,
                color: '#F6B8CE',
                letterSpacing: '0px',
                whiteSpace: 'nowrap',
                marginTop: '-2px',
                textTransform: 'none',
              }}
            >
              someone you love can tell.
            </span>
          </h2>
          <ShinyButton
            onClick={() => startArchiveTransition("/archive")}
            fillColor="#280C1B"
            labelColor="#FFD269"
            accentColor="#F9A436"
            accentSoftColor="#FFD269"
            cornerRadius={4}
            sweepDuration={3}
            arcWidth={14}
            style={{
              padding: '15px 28px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 6px 28px rgba(249, 164, 54, 0.25)',
              display: 'inline-flex',
            }}
          >
            Explore the sample archive <ArrowRight size={17} />
          </ShinyButton>
        </section>
      </main>
      <footer>
        <Brand />
        <span>A fictional family. A very real kind of connection.</span>
        <span>Sample archive · Illustrative imagery</span>
      </footer>
    </div>
  );
}
