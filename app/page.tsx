'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function Home() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      animate(buttonRef.current, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 1500,
        ease: 'out(3)',
        delay: 500,
      });

      animate(buttonRef.current, {
        translateY: [-10, 10],
        duration: 2000,
        ease: 'inOut(sine)',
        alternate: true,
        loop: true,
      });

      buttonRef.current.addEventListener('mouseenter', () => {
        if (buttonRef.current) {
          animate(buttonRef.current, {
            rotate: 360,
            duration: 800,
            ease: 'inOut(2)',
          });
        }
      });
    }

    if (particlesRef.current) {
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = Math.random() > 0.5 ? '#ffffff' : '#000000';
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.3';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particlesRef.current.appendChild(particle);

        animate(particle, {
          translateX: () => Math.random() * 200 - 100,
          translateY: () => Math.random() * 200 - 100,
          scale: [1, 1.5],
          opacity: [0.3, 0.6],
          duration: Math.random() * 2000 + 3000,
          ease: 'inOut(sine)',
          alternate: true,
          loop: true,
          delay: Math.random() * 2000,
        });
      }
    }

    const lines = document.querySelectorAll('.grid-line');
    lines.forEach((line, index) => {
      animate(line, {
        opacity: [0, 0.1],
        duration: 4000,
        ease: 'inOut(sine)',
        loop: true,
        delay: index * 100,
        alternate: true,
      });
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden"
    >
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="grid-line absolute w-full h-px bg-white"
            style={{ top: `${(i + 1) * 10}%` }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="grid-line absolute h-full w-px bg-white"
            style={{ left: `${(i + 1) * 10}%` }}
          />
        ))}
      </div>

      <Link
        ref={buttonRef}
        href="/scene"
        className="relative z-10 px-16 py-8 bg-white text-black font-bold text-2xl tracking-wider border-4 border-black hover:bg-black hover:text-white hover:border-white transition-colors duration-300 cursor-pointer select-none"
        style={{ opacity: 0, transform: 'scale(0)' }}
      >
        ENTER
      </Link>

      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-white opacity-50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-white opacity-50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-white opacity-50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-white opacity-50" />
    </div>
  );
}
