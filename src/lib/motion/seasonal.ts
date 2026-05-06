'use client';

export interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * -1, // Start above viewport
    size: 2 + Math.random() * 4,
    speed: 0.3 + Math.random() * 0.5,
    opacity: 0.15 + Math.random() * 0.15,
    rotation: Math.random() * 360,
    rotationSpeed: -0.5 + Math.random() * 1,
  }));
}

export function updateParticle(p: Particle, width: number, height: number): Particle {
  const newY = p.y + p.speed;
  const newX = p.x + Math.sin(p.y * 0.01) * 0.3; // Gentle drift
  const newRotation = p.rotation + p.rotationSpeed;

  if (newY > height) {
    return { ...p, y: -p.size, x: Math.random() * width, rotation: newRotation };
  }
  return { ...p, y: newY, x: newX, rotation: newRotation };
}

export function drawSnowflake(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
  ctx.fill();
}

export function drawPetal(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(200, 160, 160, ${p.opacity})`;
  ctx.fill();
  ctx.restore();
}

export function drawLeaf(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(155, 123, 79, ${p.opacity})`; // Cedar-toned
  ctx.fill();
  ctx.restore();
}
