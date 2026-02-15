'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function Home() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      animate(buttonRef.current, {
        scale: [0.6, 1],
        opacity: [0, 1],
        duration: 1200,
        ease: 'out(3)',
      });

      animate(buttonRef.current, {
        translateY: [-6, 6],
        duration: 2400,
        ease: 'inOut(sine)',
        direction: 'alternate',
        loop: true,
      });
    }

    if (auroraRef.current) {
      animate(auroraRef.current, {
        translateX: [-30, 30],
        translateY: [-20, 20],
        rotate: [-6, 6],
        duration: 14000,
        ease: 'inOut(sine)',
        direction: 'alternate',
        loop: true,
      });
    }

    if (gridRef.current) {
      const lines = gridRef.current.querySelectorAll('.grid-line');
      lines.forEach((line, index) => {
        animate(line, {
          opacity: [0.02, 0.08],
          duration: 3200,
          ease: 'inOut(sine)',
          direction: 'alternate',
          loop: true,
          delay: index * 80,
        });
      });
    }
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#1b1f2b_0%,_#0b0d12_45%,_#050608_100%)]">
      <div
        ref={auroraRef}
        className="pointer-events-none absolute -inset-x-24 -top-24 bottom-1/3 opacity-70 blur-3xl"
        style={{
          background:
            'conic-gradient(from 120deg, rgba(99, 229, 255, 0.18), rgba(163, 106, 255, 0.12), rgba(90, 255, 200, 0.12), rgba(99, 229, 255, 0.18))',
        }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen">
        <div className="h-full w-full bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:120px_120px]" />
      </div>

      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            'radial-gradient(circle at center, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 45%, transparent 75%)',
        }}
        aria-hidden
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="grid-line absolute h-px w-full bg-white/5"
            style={{ top: `${(i + 1) * 14}%`, opacity: 0.02 }}
          />
        ))}
        {[...Array(6)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="grid-line absolute h-full w-px bg-white/5"
            style={{ left: `${(i + 1) * 14}%`, opacity: 0.02 }}
          />
        ))}
      </div>

      <Link
        ref={buttonRef}
        href="/scene"
        aria-label="Enter scene"
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white shadow-[0_18px_40px_rgba(37,129,255,0.25)] transition hover:scale-[1.04]"
        style={{ opacity: 0 }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14" />
          <path d="M13 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
