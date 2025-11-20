import React, { useEffect, useRef } from 'react';
import { AnimationMode, Particle, AnimationConfig, AnimationStatus } from '../types';
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

  // --- UTILS ---
  
  const createParticle = (width: number, height: number, id: number): Particle => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      baseX: x,
      baseY: y,
      radius: Math.random() * 1.5 + config.particleSize,
      friction: 0.90 + Math.random() * 0.05,
      ease: 0.05 + Math.random() * 0.05,
      group: Math.floor(Math.random() * 5),
      angle: Math.random() * Math.PI * 2,
      alpha: 1,
      hue: 0,
      life: 1,
      locked: false
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
  }, [config.particleCount, config.particleSize]);

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
  }, [config.particleCount]);

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

  // --- ANIMATION LOOP ---

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Animation Loop
    const render = () => {
      timeRef.current += 0.01 * config.baseSpeed;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const time = timeRef.current;

      // Clear
      ctx.clearRect(0, 0, width, height);
      
      const isDark = config.colorTheme === 'dark';
      const mainColor = isDark ? '#ffffff' : config.primaryColor;
      
      // --- GLOBAL MODE CONFIGS ---
      
      // IOT COMMAND CONFIGS
      const cmdSourceX = width * 0.2;
      const cmdTargetX = width * 0.8;
      const cmdY = centerY;

      particlesRef.current.forEach((p, index) => {
        let targetX = p.baseX;
        let targetY = p.baseY;
        let alpha = 1;
        let radius = p.radius;
        let color = mainColor;

        // -------------------------------------------------
        // GENERAL MODES
        // -------------------------------------------------

        if (mode === AnimationMode.IDLE_SWARM) {
            const noiseX = Math.sin(time + p.id * 0.01) * 20 * config.chaosFactor;
            const noiseY = Math.cos(time + p.id * 0.02) * 20 * config.chaosFactor;
            targetX = p.baseX + noiseX;
            targetY = p.baseY + noiseY;
        } 
        else if (mode === AnimationMode.VOICE_LISTENING) {
            const normalizeX = (p.id / config.particleCount) * width;
            const wave1 = Math.sin(normalizeX * 0.02 + time * 10) * 50;
            const wave2 = Math.sin(normalizeX * 0.05 - time * 5) * 30;
            const amplitude = (wave1 + wave2) * (Math.sin(time) * 0.5 + 1);
            targetX = normalizeX;
            targetY = centerY + amplitude;
        }
        else if (mode === AnimationMode.PROCESSING_RING) {
             const angle = (p.id / config.particleCount) * Math.PI * 2 + time;
             const r = 150 + Math.sin(p.id * 0.1 + time * 5) * 10;
             targetX = centerX + Math.cos(angle) * r;
             targetY = centerY + Math.sin(angle) * r;
        }
        else if (mode === AnimationMode.SUCCESS_CHECK) {
             const progress = p.id / config.particleCount;
             // Checkmark geometry
             if (progress < 0.3) {
                 const t = progress / 0.3;
                 targetX = (centerX - 60) + t * 60;
                 targetY = centerY + t * 60;
             } else {
                 const t = (progress - 0.3) / 0.7;
                 targetX = centerX + t * 100;
                 targetY = (centerY + 60) - t * 160;
             }
             targetX += (Math.random() - 0.5) * 5; 
             targetY += (Math.random() - 0.5) * 5;
             color = config.accentColor;
        }
        else if (mode === AnimationMode.ALERT_ERROR) {
            // Form a hazard triangle
            const side = 300;
            const h = side * (Math.sqrt(3)/2);
            const triangleProgress = p.id / config.particleCount;
            
            let edgeX, edgeY;
            if (triangleProgress < 0.33) { // Left side
               const t = triangleProgress / 0.33;
               edgeX = centerX - (side/2) + t * (side/2);
               edgeY = centerY + (h/2) - t * h;
            } else if (triangleProgress < 0.66) { // Right side
               const t = (triangleProgress - 0.33) / 0.33;
               edgeX = centerX + t * (side/2);
               edgeY = centerY - (h/2) + t * h;
            } else { // Bottom
               const t = (triangleProgress - 0.66) / 0.34;
               edgeX = centerX + (side/2) - t * side;
               edgeY = centerY + (h/2);
            }
            
            // Glitch effect
            const glitch = Math.random() < (0.1 * config.chaosFactor) ? 50 : 2;
            targetX = edgeX + (Math.random() - 0.5) * glitch;
            targetY = edgeY + (Math.random() - 0.5) * glitch;
            
            // Debris falling
            if (p.id % 10 === 0) {
                targetY += Math.sin(time * 10 + p.id) * 20;
            }

            color = Math.random() > 0.8 ? config.accentColor : '#ef4444'; // Red
        }
        
        // -------------------------------------------------
        // IOT MODES
        // -------------------------------------------------

        else if (mode === AnimationMode.IOT_TELEMETRY) {
            // Three lanes of data
            const laneHeight = 100;
            const lane = p.group ? p.group % 3 : 0;
            
            if (lane === 0) {
                // Sine Wave Lane (Analog Signal)
                const x = (p.id / (config.particleCount/3)) * width;
                const y = (centerY - laneHeight) + Math.sin(x * 0.02 + time * 5) * 30;
                targetX = x;
                targetY = y;
            } else if (lane === 1) {
                // Packet Stream Lane (Digital Data)
                // Recycle particles continuously left to right
                if (p.x > width + 50) p.x = -50;
                const speed = 5 * config.baseSpeed;
                
                // Bunching: Create "packets"
                // We use the ID to create gaps
                const isPacket = Math.sin(p.id * 0.1) > 0;
                if (!isPacket) alpha = 0.1;

                p.vx = speed;
                p.vy = 0;
                
                targetX = p.x + p.vx; // Direct manipulation
                targetY = centerY;
                
                // Override physics later
            } else {
                 // Binary Noise Lane (Raw Data)
                 const col = (p.id % 50);
                 const row = Math.floor(p.id / 50);
                 const gridX = (width / 50) * col;
                 const gridY = (centerY + laneHeight) + (row % 5) * 10;
                 
                 // Blink effect
                 if (Math.random() > 0.9) alpha = 0;
                 
                 targetX = gridX;
                 targetY = gridY;
            }
        }

        else if (mode === AnimationMode.IOT_COMMAND) {
            // Source Node
            const isSource = p.id < 50;
            const isTarget = p.id > config.particleCount - 50;
            const isStream = !isSource && !isTarget;

            if (isSource) {
                // Orbit Source
                const ang = time * 2 + p.id;
                targetX = cmdSourceX + Math.cos(ang) * 30;
                targetY = cmdY + Math.sin(ang) * 30;
            } else if (isTarget) {
                // Orbit Target
                let ang = time * 2 + p.id;
                let r = 30;
                
                if (config.status === AnimationStatus.SUCCESS) {
                    r = 60 + Math.sin(time * 20) * 10; // Pulse big
                    color = config.accentColor;
                } else if (config.status === AnimationStatus.ERROR) {
                    r = 30 + (Math.random() - 0.5) * 20; // Shaking
                    color = '#ef4444';
                }
                
                targetX = cmdTargetX + Math.cos(ang) * r;
                targetY = cmdY + Math.sin(ang) * r;
            } else {
                // Stream Particles
                if (config.status === AnimationStatus.IDLE) {
                    // Lazy float between
                    const t = (p.id % 100) / 100;
                    targetX = cmdSourceX + t * (cmdTargetX - cmdSourceX);
                    targetY = cmdY + Math.sin(t * Math.PI * 4 + time) * 10;
                    alpha = 0.3;
                } else if (config.status === AnimationStatus.ACTIVE) {
                    // Fast stream
                    const cycle = (time * 2 + (p.id * 0.005)) % 1;
                    targetX = cmdSourceX + cycle * (cmdTargetX - cmdSourceX);
                    targetY = cmdY + (Math.random()-0.5) * 10; // Tight beam
                    color = config.accentColor;
                } else if (config.status === AnimationStatus.SUCCESS) {
                    // Shockwave outward from target
                    const d = Math.sqrt(Math.pow(p.x - cmdTargetX, 2) + Math.pow(p.y - cmdY, 2));
                    const angle = Math.atan2(p.y - cmdY, p.x - cmdTargetX);
                    targetX = p.x + Math.cos(angle) * 10;
                    targetY = p.y + Math.sin(angle) * 10;
                    alpha = Math.max(0, 1 - d/300);
                } else if (config.status === AnimationStatus.ERROR) {
                    // Hit target and bounce back or scatter
                    const cycle = (time * 2 + (p.id * 0.005)) % 1;
                    const lx = cmdSourceX + cycle * (cmdTargetX - cmdSourceX);
                    
                    if (lx > cmdTargetX - 50) {
                        // Scatter/Reject
                        targetX = lx - 20 + (Math.random()-0.5)*50;
                        targetY = cmdY + (Math.random()-0.5)*100;
                        color = '#ef4444';
                    } else {
                        targetX = lx;
                        targetY = cmdY;
                    }
                }
            }
        }

        else if (mode === AnimationMode.IOT_OTA) {
            // Visual: A chip (grid) filling up with logic
            const chipW = 200;
            const chipH = 140;
            const cols = 20;
            const rows = 14;
            const cellW = chipW / cols;
            const cellH = chipH / rows;
            
            // Is this particle part of the grid?
            const gridCapacity = cols * rows;
            
            if (p.id < gridCapacity) {
                // Grid Particle
                const col = p.id % cols;
                const row = Math.floor(p.id / cols);
                targetX = (centerX - chipW/2) + col * cellW;
                targetY = (centerY - chipH/2) + row * cellH;
                
                // Filling logic
                let fillPercentage = 0;
                if (config.status === AnimationStatus.ACTIVE) fillPercentage = (time * 0.2) % 1.2;
                if (config.status === AnimationStatus.SUCCESS) fillPercentage = 1.0;
                if (config.status === AnimationStatus.IDLE) fillPercentage = 0;
                
                const myPos = p.id / gridCapacity;
                
                if (myPos < fillPercentage) {
                    color = config.accentColor; // Filled
                    radius = config.particleSize * 1.5;
                } else {
                    alpha = 0.2; // Empty slot
                }
                
                if (config.status === AnimationStatus.SUCCESS) {
                    // Pulse effect on success
                    if (Math.random() > 0.95) color = '#ffffff';
                }
            } else {
                // Downloading particles (Cloud to Chip)
                if (config.status === AnimationStatus.ACTIVE) {
                    const progress = (time + p.id * 0.01) % 1;
                    // Bezier from top to center
                    const sx = centerX + (Math.random()-0.5)*300;
                    const sy = -50;
                    targetX = sx * (1-progress) + centerX * progress;
                    targetY = sy * (1-progress) + (centerY - chipH/2) * progress;
                    
                    if (progress > 0.9) alpha = 0; // Disappear into chip
                } else {
                    // Float around
                    targetX = centerX + Math.cos(time + p.id) * 200;
                    targetY = centerY + Math.sin(time + p.id) * 200;
                    alpha = 0.1;
                }
            }
        }

        else if (mode === AnimationMode.IOT_INCIDENT) {
             // Central Node
             const angle = (p.id / config.particleCount) * Math.PI * 2 + time * 0.2;
             
             if (config.status === AnimationStatus.ACTIVE) {
                 // Frantic, pulsing red zone
                 const r = 100 + Math.random() * 50;
                 targetX = centerX + Math.cos(angle) * r;
                 targetY = centerY + Math.sin(angle) * r;
                 color = '#ef4444';
                 
                 // Emit rings
                 if (p.id % 20 === 0) {
                     const ringR = (time * 100 + p.id) % 300;
                     targetX = centerX + Math.cos(angle) * ringR;
                     targetY = centerY + Math.sin(angle) * ringR;
                     alpha = 1 - (ringR / 300);
                 }
             } else {
                 // Stable monitoring
                 const r = 150;
                 targetX = centerX + Math.cos(angle) * r;
                 targetY = centerY + Math.sin(angle) * r;
             }
        }
        
        else if (mode === AnimationMode.IOT_PAIRING) {
             // Two swarms merging
             const centerL = centerX - 100;
             const centerR = centerX + 100;
             
             let attraction = 0; // 0 to 1
             if (config.status === AnimationStatus.ACTIVE) attraction = (Math.sin(time) + 1) / 2; // Pulse
             if (config.status === AnimationStatus.SUCCESS) attraction = 1; 
             
             const whichSwarm = p.id % 2; // 0 or 1
             
             let myCenter = whichSwarm === 0 ? centerL : centerR;
             
             // Merge logic
             const finalCenter = centerX;
             const currentCenter = myCenter + (finalCenter - myCenter) * attraction;
             
             const angle = p.id + time;
             const r = 60;
             
             targetX = currentCenter + Math.cos(angle) * r;
             targetY = centerY + Math.sin(angle) * r;
             
             if (attraction > 0.9) color = config.accentColor;
        }
        
        else if (mode === AnimationMode.IOT_SECURITY) {
             // Radar Sweep
             const sweepAngle = (time * 2) % (Math.PI * 2);
             
             // Map particle to polar coordinates
             const pAngle = (p.id / config.particleCount) * Math.PI * 2;
             const pRadius = Math.random() * 250;
             
             // Position
             targetX = centerX + Math.cos(pAngle) * pRadius;
             targetY = centerY + Math.sin(pAngle) * pRadius;
             
             // Radar highlight logic
             // Calculate difference between sweep angle and particle angle
             let angleDiff = sweepAngle - pAngle;
             // Normalize to -PI to PI
             while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
             while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
             
             if (angleDiff > 0 && angleDiff < 0.5) {
                 // In the sweep
                 color = config.accentColor;
                 radius = p.radius * 2;
                 alpha = 1;
             } else {
                 // Fade out trail
                 alpha = 0.1;
             }
             
             if (config.status === AnimationStatus.ERROR) {
                 // Detected threat
                 if (p.id % 50 === 0) {
                     color = '#ef4444';
                     alpha = 1;
                     radius = 5;
                 }
             }
        }

        else if (mode === AnimationMode.IOT_TOPOLOGY) {
             // Existing topology logic...
             const groups = 5;
             const groupIndex = p.group || 0;
             const groupAngle = (groupIndex / groups) * Math.PI * 2;
             const groupRadius = 180;
             const groupX = centerX + Math.cos(groupAngle) * groupRadius;
             const groupY = centerY + Math.sin(groupAngle) * groupRadius;

             const isTraveller = p.id % 20 === 0;
             if (isTraveller) {
                const travelSpeed = time * 0.5;
                const fromNode = Math.floor(travelSpeed) % groups;
                const toNode = (fromNode + 1) % groups;
                const t = travelSpeed % 1;
                const g1Angle = (fromNode / groups) * Math.PI * 2;
                const g2Angle = (toNode / groups) * Math.PI * 2;
                const x1 = centerX + Math.cos(g1Angle) * groupRadius;
                const y1 = centerY + Math.sin(g1Angle) * groupRadius;
                const x2 = centerX + Math.cos(g2Angle) * groupRadius;
                const y2 = centerY + Math.sin(g2Angle) * groupRadius;
                targetX = x1 + (x2 - x1) * t;
                targetY = y1 + (y2 - y1) * t;
             } else {
                const orbitAngle = time * 2 + p.id;
                targetX = groupX + Math.cos(orbitAngle) * (30 * config.chaosFactor + 10);
                targetY = groupY + Math.sin(orbitAngle) * (30 * config.chaosFactor + 10);
             }
        }

        // --- PHYSICS ENGINE ---
        
        // Ease towards target
        // IOT_TELEMETRY handles its own X movement, others use easing
        if (mode !== AnimationMode.IOT_TELEMETRY) {
             const dx = targetX - p.x;
             const dy = targetY - p.y;
             p.vx += dx * p.ease * 0.1;
             p.vy += dy * p.ease * 0.1;
             p.vx *= p.friction;
             p.vy *= p.friction;
             p.x += p.vx;
             p.y += p.vy;
        } else if (mode === AnimationMode.IOT_TELEMETRY && p.group !== 1) {
             // For non-stream lanes in telemetry, ease Y only
             const dy = targetY - p.y;
             const dx = targetX - p.x;
             p.vx += dx * 0.2;
             p.vy += dy * 0.2;
             p.vx *= 0.8; 
             p.vy *= 0.8;
             p.x += p.vx;
             p.y += p.vy;
        } else if (mode === AnimationMode.IOT_TELEMETRY && p.group === 1) {
            // Hard set for digital stream to prevent easing lag
            p.y += (targetY - p.y) * 0.1;
        }

        // Mouse Repulsion
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
            const dirX = dx / distance;
            const dirY = dy / distance;
            p.x += dirX * force * 20;
            p.y += dirY * force * 20;
        }

        // --- DRAW ---
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Connections
        if (config.connectionThreshold > 0) {
             // Simple optimization: only check neighbor in array
             for (let j = 1; j < 3; j++) {
                 const p2 = particlesRef.current[(index + j) % config.particleCount];
                 const dx = p.x - p2.x;
                 const dy = p.y - p2.y;
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 if (dist < config.connectionThreshold) {
                     ctx.beginPath();
                     ctx.strokeStyle = color;
                     ctx.globalAlpha = (1 - (dist / config.connectionThreshold)) * alpha;
                     ctx.lineWidth = 0.5;
                     ctx.moveTo(p.x, p.y);
                     ctx.lineTo(p2.x, p2.y);
                     ctx.stroke();
                     ctx.globalAlpha = 1.0;
                 }
             }
        }

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
        className={`block w-full h-full ${config.colorTheme === 'dark' ? 'bg-zinc-900' : 'bg-transparent'}`}
      />
      {/* SVG Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default DotCanvas;