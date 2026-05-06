'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useSeason, type Season } from '@/hooks/use-season';
import {
  createParticles,
  updateParticle,
  drawSnowflake,
  drawPetal,
  drawLeaf,
  type Particle,
} from '@/lib/motion/seasonal';

const SEASON_CONFIG: Record<Season, { count: number; draw: typeof drawSnowflake } | null> = {
  winter: { count: 18, draw: drawSnowflake },
  spring: { count: 12, draw: drawPetal },
  summer: null, // No particles
  autumn: { count: 11, draw: drawLeaf },
};

export function SeasonalOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();
  const season = useSeason();

  const config = SEASON_CONFIG[season];

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.map((p) =>
      updateParticle(p, canvas.width, canvas.height)
    );

    particlesRef.current.forEach((p) => config.draw(ctx, p));
    animationRef.current = requestAnimationFrame(animate);
  }, [config]);

  useEffect(() => {
    if (reducedMotion || !config) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = createParticles(config.count, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [reducedMotion, config, animate]);

  if (reducedMotion || !config) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      aria-hidden="true"
    />
  );
}
