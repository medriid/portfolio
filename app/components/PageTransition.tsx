'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathname = useRef(pathname);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setIsTransitioning(true);
      
      // Start the flood animation
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let animationFrame: number;
      let progress = 0;
      const duration = 1200;
      const startTime = Date.now();

      const waves: Array<{ y: number; amplitude: number; frequency: number; phase: number }> = [];
      const waveCount = 8;
      
      for (let i = 0; i < waveCount; i++) {
        waves.push({
          y: window.innerHeight,
          amplitude: 20 + Math.random() * 40,
          frequency: 0.002 + Math.random() * 0.003,
          phase: Math.random() * Math.PI * 2
        });
      }

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Easing function for smooth animation
        const easeInOutCubic = (t: number) => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const easedProgress = easeInOutCubic(progress);

        // Draw multiple wave layers
        waves.forEach((wave, index) => {
          const layerProgress = Math.max(0, easedProgress - (index * 0.05));
          const baseY = window.innerHeight - (layerProgress * window.innerHeight * 1.2);
          
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);

          for (let x = 0; x <= canvas.width; x += 5) {
            const waveY = baseY + Math.sin(x * wave.frequency + wave.phase + elapsed * 0.003) * wave.amplitude * (1 - layerProgress * 0.5);
            
            if (x === 0) {
              ctx.lineTo(x, waveY);
            } else {
              ctx.lineTo(x, waveY);
            }
          }

          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();

          // Create gradient for water effect
          const gradient = ctx.createLinearGradient(0, baseY - 100, 0, canvas.height);
          const alpha = 0.15 + (index / waveCount) * 0.1;
          gradient.addColorStop(0, `rgba(100, 200, 255, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(50, 150, 255, ${alpha + 0.1})`);
          gradient.addColorStop(1, `rgba(0, 100, 200, ${alpha + 0.2})`);

          ctx.fillStyle = gradient;
          ctx.fill();
        });

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setDisplayChildren(children);
          // Fade out the canvas
          setTimeout(() => {
            setIsTransitioning(false);
          }, 100);
        }
      };

      animate();

      prevPathname.current = pathname;

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <>
      {displayChildren}
      {isTransitioning && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[9999] pointer-events-none"
          style={{
            transition: 'opacity 0.3s ease-out',
            opacity: isTransitioning ? 1 : 0
          }}
        />
      )}
    </>
  );
}
