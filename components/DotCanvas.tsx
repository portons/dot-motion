import React, { useEffect, useRef } from 'react';
import { AnimationMode, Particle, AnimationConfig } from '../types';
import { MOUSE_RADIUS } from '../constants';

interface DotCanvasProps {
  mode: AnimationMode;
  config: AnimationConfig;
}

const DotCanvas: React.FC<DotCanvasProps> = ({ mode, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Helper: Generate targets for a Checkmark
  const getCheckmarkTarget = (index: number, total: number, cx: number, cy: number, scale: number) => {
    // A checkmark is roughly 2 lines. 
    // Line 1: (-0.5, 0) to (-0.1, 0.4)
    // Line 2: (-0.1, 0.4) to (0.6, -0.6)
    
    const shortLegCount = Math.floor(total * 0.3);
    const longLegCount = total - shortLegCount;

    let tx, ty;

    if (index < shortLegCount) {
        const t = index / shortLegCount;
        tx = -0.4 + (t * 0.3); // -0.4 to -0.1
        ty = 0 + (t * 0.4);    // 0 to 0.4
    } else {
        const t = (index - shortLegCount) / longLegCount;
        tx = -0.1 + (t * 0.7); // -0.1 to 0.6
        ty = 0.4 - (t * 1.0);  // 0.4 to -0.6
    }

    return {
        x: cx + tx * scale,
        y: cy + ty * scale
    };
  };

  // Helper: Generate targets for Exclamation Triangle
  const getWarningTarget = (index: number, total: number, cx: number, cy: number, scale: number) => {
      // 30% for exclamation mark
      const markCount = Math.floor(total * 0.3);
      const triangleCount = total - markCount;

      if (index < markCount) {
          // Exclamation Mark
          const isDot = index < markCount * 0.2; // Bottom 20% is the dot
          if (isDot) {
               return { x: cx, y: cy + scale * 0.4 };
          } else {
               // The vertical bar
               const t = (index - markCount * 0.2) / (markCount * 0.8);
               return { x: cx, y: cy + scale * 0.15 - (t * scale * 0.5) };
          }
      } else {
          // Triangle Border
          // 3 sides
          const sideIndex = (index - markCount) % 3;
          const progress = ((index - markCount) / triangleCount) * 3 % 1; // 0-1 along side
          
          // Triangle points (top, right, left) relative to center
          const top = { x: 0, y: -0.6 };
          const right = { x: 0.5, y: 0.4 };
          const left = { x: -0.5, y: 0.4 };

          let p1, p2;
          if (sideIndex === 0) { p1 = top; p2 = right; }
          else if (sideIndex === 1) { p1 = right; p2 = left; }
          else { p1 = left; p2 = top; }

          return {
              x: cx + (p1.x + (p2.x - p1.x) * progress) * scale,
              y: cy + (p1.y + (p2.y - p1.y) * progress) * scale
          };
      }
  };

  const createParticle = (width: number, height: number, id: number): Particle => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      baseX: x,
      baseY: y,
      radius: Math.random() * 1.5 + config.particleSize,
      friction: 0.92, 
      ease: 0.1,    
      alpha: 1,
      color: config.primaryColor
    };
  };

  const initParticles = (width: number, height: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < config.particleCount; i++) {
      newParticles.push(createParticle(width, height, i));
    }
    particlesRef.current = newParticles;
  };

  // --- EFFECTS ---

  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        initParticles(width, height);
    }
  }, [config.particleCount, mode]); // Re-init on mode change to reset positions

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        initParticles(width, height);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };
    const handleMouseLeave = () => {
        mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    if (containerRef.current) {
        containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (containerRef.current) {
            containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
    };
  }, []);

  // --- RENDER LOOP ---

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const render = () => {
      timeRef.current += 0.02 * config.baseSpeed;
      const time = timeRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const isDark = config.colorTheme === 'dark';
      const baseColor = isDark ? '#ffffff' : config.primaryColor;

      // Track which particles are forming shapes to color them differently
      const totalShapeParticles = Math.floor(config.particleCount * 0.7);

      particlesRef.current.forEach((p, i) => {
        let targetX = p.baseX;
        let targetY = p.baseY;
        let desiredAlpha = 1;
        let desiredColor = baseColor;
        let ease = p.ease;
        let usePhysics = false; // Should velocity be used instead of easing?

        // =========================================
        // CORE LOADING: Orbital Rings
        // =========================================
        if (mode === AnimationMode.CORE_LOADING) {
             // Multiple concentric rings
             const ringCount = 6;
             const ringIdx = i % ringCount;
             const angleOffset = (i / (config.particleCount / ringCount)) * Math.PI * 2;
             
             // Alternating rotation
             const rotationDir = ringIdx % 2 === 0 ? 1 : -1;
             const speed = 0.5 + (ringIdx * 0.2);
             const currentAngle = angleOffset + (time * rotationDir * speed);
             
             const radius = 40 + (ringIdx * 25);
             
             // Add breathing effect
             const breathe = Math.sin(time * 2) * 5;
             
             targetX = centerX + Math.cos(currentAngle) * (radius + breathe);
             targetY = centerY + Math.sin(currentAngle) * (radius + breathe);
             
             if (ringIdx === 0) {
                 desiredColor = config.accentColor; // Inner core
             }
             
             // Add a bit of chaos
             if (Math.random() > 0.98) {
                 targetX += (Math.random() - 0.5) * 10;
                 targetY += (Math.random() - 0.5) * 10;
             }
        }

        // =========================================
        // CORE SUCCESS: Verified Checkmark
        // =========================================
        else if (mode === AnimationMode.CORE_SUCCESS) {
             // 70% of particles form the checkmark/ring
             if (i < totalShapeParticles) {
                // Checkmark
                if (i < totalShapeParticles * 0.4) {
                     const t = getCheckmarkTarget(i, totalShapeParticles * 0.4, centerX, centerY, 200);
                     targetX = t.x;
                     targetY = t.y;
                     desiredColor = config.accentColor;
                     p.radius = config.particleSize * 1.5;
                } else {
                    // Outer Circle
                    const circleIdx = i - (totalShapeParticles * 0.4);
                    const totalCircle = totalShapeParticles * 0.6;
                    const angle = (circleIdx / totalCircle) * Math.PI * 2 + time;
                    targetX = centerX + Math.cos(angle) * 140;
                    targetY = centerY + Math.sin(angle) * 140;
                    desiredAlpha = 0.4;
                }
             } else {
                 // Floating ambient particles
                 const angle = (i * 0.1) + time * 0.2;
                 const r = 180 + Math.sin(i + time) * 20;
                 targetX = centerX + Math.cos(angle) * r;
                 targetY = centerY + Math.sin(angle) * r;
                 desiredAlpha = 0.2;
             }
        }

        // =========================================
        // CORE WARNING: Glitch Triangle
        // =========================================
        else if (mode === AnimationMode.CORE_WARNING) {
             if (i < totalShapeParticles) {
                 const t = getWarningTarget(i, totalShapeParticles, centerX, centerY, 250);
                 
                 // Apply Glitch
                 const isGlitching = Math.random() > (1.0 - config.chaosFactor * 0.5);
                 const glitchX = isGlitching ? (Math.random() - 0.5) * 20 : 0;
                 const glitchY = isGlitching ? (Math.random() - 0.5) * 5 : 0;
                 
                 targetX = t.x + glitchX;
                 targetY = t.y + glitchY;
                 
                 desiredColor = '#fbbf24'; // Amber
             } else {
                 // Debris falling/floating around
                 const angle = i + time;
                 targetX = centerX + Math.cos(angle) * 180;
                 targetY = centerY + Math.sin(angle * 0.5) * 180;
                 desiredAlpha = 0.3;
             }
        }

        // =========================================
        // CORE ERROR: Contained Chaos
        // =========================================
        else if (mode === AnimationMode.CORE_ERROR) {
             usePhysics = true;
             desiredColor = '#ef4444';
             
             // Add chaotic forces
             p.vx += (Math.random() - 0.5) * 0.5 * config.chaosFactor;
             p.vy += (Math.random() - 0.5) * 0.5 * config.chaosFactor;
             
             // Gravity well in center that repels intermittently
             const dx = p.x - centerX;
             const dy = p.y - centerY;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             // Pulse repulsion
             if (Math.sin(time * 5) > 0.8 && dist < 100) {
                 p.vx += (dx / dist) * 2;
                 p.vy += (dy / dist) * 2;
             }
        }

        // =========================================
        // CORE EMPTY: Searching
        // =========================================
        else if (mode === AnimationMode.CORE_EMPTY) {
             // Grid of dots
             const cols = 20;
             const col = i % cols;
             const row = Math.floor(i / cols);
             const space = 30;
             
             const gridW = cols * space;
             const offsetX = centerX - gridW/2;
             const offsetY = centerY - (config.particleCount/cols * space)/2;
             
             targetX = offsetX + col * space;
             targetY = offsetY + row * space;
             
             // Radar wave
             const waveX = (time * 100) % (width + 200) - 100;
             const distX = Math.abs(targetX - waveX);
             
             if (distX < 80) {
                 const power = 1 - (distX / 80);
                 desiredAlpha = 0.1 + power * 0.9;
                 desiredColor = config.accentColor;
                 p.radius = config.particleSize + power * 2;
                 
                 // Lift effect
                 targetY -= power * 10;
             } else {
                 desiredAlpha = 0.1;
             }
        }

        // --- INTEGRATION ---
        
        if (usePhysics) {
            // Newtonian update
            p.x += p.vx;
            p.y += p.vy;
            
            // Boundary Bounce
            const margin = p.radius;
            if (p.x < margin) { p.x = margin; p.vx *= -0.8; }
            if (p.x > width - margin) { p.x = width - margin; p.vx *= -0.8; }
            if (p.y < margin) { p.y = margin; p.vy *= -0.8; }
            if (p.y > height - margin) { p.y = height - margin; p.vy *= -0.8; }

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;

        } else {
            // Easing update (Shape forming)
            const dx = targetX - p.x;
            const dy = targetY - p.y;
            
            p.vx += dx * ease * 0.05;
            p.vy += dy * ease * 0.05;
            p.vx *= p.friction;
            p.vy *= p.friction;
            
            p.x += p.vx;
            p.y += p.vy;
        }

        // Mouse Repel
        const mdx = p.x - mouseRef.current.x;
        const mdy = p.y - mouseRef.current.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - mDist) / MOUSE_RADIUS;
            const ang = Math.atan2(mdy, mdx);
            const repelStrength = 5.0;
            p.vx += Math.cos(ang) * force * repelStrength;
            p.vy += Math.sin(ang) * force * repelStrength;
        }

        // --- DRAW ---
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = desiredColor;
        ctx.globalAlpha = desiredAlpha;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mode, config]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
    </div>
  );
};

export default DotCanvas;