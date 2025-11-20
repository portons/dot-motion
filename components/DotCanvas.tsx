
import React, { useEffect, useRef } from 'react';
import { AnimationMode, Particle, AnimationConfig, GraphData } from '../types';
import { MOUSE_RADIUS } from '../constants';

interface DotCanvasProps {
  mode: AnimationMode;
  config: AnimationConfig;
  graphData?: GraphData;
}

const DotCanvas: React.FC<DotCanvasProps> = ({ mode, config, graphData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const nodePositionsRef = useRef<Array<{x: number, y: number, label: string}>>([]);

  // --- UTILS ---
  const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

  const getColorByType = (type?: string) => {
      if (!type) return config.primaryColor;
      switch(type) {
          case 'device': return '#3b82f6'; // Blue
          case 'incident': return '#ef4444'; // Red
          case 'space': return '#a1a1aa'; // Zinc
          case 'command': return '#8b5cf6'; // Purple
          case 'asset': return '#10b981'; // Emerald
          default: return config.primaryColor;
      }
  };

  // --- SHAPE GENERATORS ---

  // 1. Loading: Sphere/Brain
  const setSphereTargets = (width: number, height: number, particles: Particle[]) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.25; 

    particles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius; 
        p.targetX = centerX + Math.cos(angle) * r;
        p.targetY = centerY + Math.sin(angle) * r;
        p.color = config.primaryColor;
        p.orbitAngle = undefined;
    });
  };

  // 2. Scanning
  const setScanningGrid = (width: number, height: number, particles: Particle[]) => {
    const padding = 20;
    particles.forEach(p => {
        p.targetX = padding + Math.random() * (width - padding * 2);
        p.targetY = padding + Math.random() * (height - padding * 2);
        p.orbitAngle = undefined;
    });
  };

  // 6. MIND MAP (The Core Request)
  const setMindMapTargets = (width: number, height: number, particles: Particle[]) => {
      if (!graphData) {
          setSphereTargets(width, height, particles);
          return;
      }

      const cx = width / 2;
      const cy = height / 2;
      const centerRadius = 50; // Radius of the central node cluster
      const satelliteDist = Math.min(width, height) * 0.35; // Distance to neighbors
      const satelliteRadius = 25; // Radius of neighbor clusters

      const neighborCount = graphData.neighbors.length;
      
      // Store node positions for rendering labels later (if we were using canvas text, but we use DOM overlay for text usually)
      nodePositionsRef.current = [{x: cx, y: cy, label: graphData.center.label}];
      graphData.neighbors.forEach((n, i) => {
          const angle = (i / neighborCount) * Math.PI * 2 - (Math.PI / 2);
          nodePositionsRef.current.push({
              x: cx + Math.cos(angle) * satelliteDist,
              y: cy + Math.sin(angle) * satelliteDist,
              label: n.node.label
          });
      });

      // Distribution: 50% Center, 30% Neighbors, 20% Lines
      const centerCount = Math.floor(particles.length * 0.5);
      const neighborParticleCount = Math.floor((particles.length * 0.3) / Math.max(1, neighborCount));
      
      particles.forEach((p, i) => {
          p.orbitAngle = undefined; // Reset complex physics

          if (i < centerCount) {
              // CENTRAL NODE
              const angle = Math.random() * Math.PI * 2;
              const r = Math.sqrt(Math.random()) * centerRadius;
              p.targetX = cx + Math.cos(angle) * r;
              p.targetY = cy + Math.sin(angle) * r;
              p.color = getColorByType(graphData.center.type);
          } else if (i < centerCount + (neighborCount * neighborParticleCount)) {
              // NEIGHBOR NODES
              const remainingIndex = i - centerCount;
              const neighborIndex = Math.floor(remainingIndex / neighborParticleCount);
              const safeIndex = Math.min(neighborIndex, neighborCount - 1);
              
              const nAngle = (safeIndex / neighborCount) * Math.PI * 2 - (Math.PI / 2);
              const nx = cx + Math.cos(nAngle) * satelliteDist;
              const ny = cy + Math.sin(nAngle) * satelliteDist;

              const angle = Math.random() * Math.PI * 2;
              const r = Math.sqrt(Math.random()) * satelliteRadius;
              
              p.targetX = nx + Math.cos(angle) * r;
              p.targetY = ny + Math.sin(angle) * r;
              p.color = getColorByType(graphData.neighbors[safeIndex].node.type);
          } else {
              // CONNECTOR LINES
              // Assign each particle to a specific connection path
              const linkIndex = i % neighborCount;
              const nAngle = (linkIndex / neighborCount) * Math.PI * 2 - (Math.PI / 2);
              const nx = cx + Math.cos(nAngle) * satelliteDist;
              const ny = cy + Math.sin(nAngle) * satelliteDist;
              
              // Random position along the line
              const t = Math.random();
              p.targetX = lerp(cx, nx, t);
              p.targetY = lerp(cy, ny, t);
              p.color = '#d4d4d8'; // Zinc-300 for connections
              p.targetNodeIndex = linkIndex; // Store which line it belongs to for animation
          }
      });
  };

  // Standard Shape Helpers
  const setCheckmarkTargets = (width: number, height: number, particles: Particle[]) => {
    const cx = width / 2;
    const cy = height / 2;
    const size = Math.min(width, height) * 0.5;
    const p1 = { x: cx - size * 0.5, y: cy };
    const p2 = { x: cx - size * 0.1, y: cy + size * 0.4 };
    const p3 = { x: cx + size * 0.5, y: cy - size * 0.5 };
    const split = Math.floor(particles.length * 0.35);
    particles.forEach((p, i) => {
        let tx, ty;
        const thick = (Math.random() - 0.5) * (size * 0.15);
        if (i < split) {
            const t = i / split;
            tx = lerp(p1.x, p2.x, t);
            ty = lerp(p1.y, p2.y, t);
        } else {
            const t = (i - split) / (particles.length - split);
            tx = lerp(p2.x, p3.x, t);
            ty = lerp(p2.y, p3.y, t);
        }
        p.targetX = tx + thick;
        p.targetY = ty + thick;
        p.color = '#10b981'; 
    });
  };

  const setErrorTargets = (width: number, height: number, particles: Particle[]) => {
    const cx = width / 2;
    const cy = height / 2;
    const size = Math.min(width, height) * 0.4;
    particles.forEach((p, i) => {
        const t = Math.random();
        const thick = (Math.random() - 0.5) * (size * 0.15);
        let tx, ty;
        if (i % 2 === 0) { tx = lerp(cx - size, cx + size, t); ty = lerp(cy - size, cy + size, t); }
        else { tx = lerp(cx + size, cx - size, t); ty = lerp(cy - size, cy + size, t); }
        p.targetX = tx + thick;
        p.targetY = ty + thick;
        p.color = '#ef4444'; 
    });
  };

  const setTriangleTargets = (width: number, height: number, particles: Particle[]) => {
    const size = Math.min(width, height) * 0.45;
    const cx = width / 2;
    const cy = height / 2 + size * 0.2; 
    const p1 = { x: cx, y: cy - size * 1.2 }; 
    const p2 = { x: cx + size, y: cy + size * 0.5 }; 
    const p3 = { x: cx - size, y: cy + size * 0.5 }; 
    const count = Math.floor(particles.length / 3);
    particles.forEach((p, i) => {
        const side = Math.floor(i / count);
        const t = (i % count) / count;
        const thick = (Math.random() - 0.5) * (size * 0.1);
        let tx, ty;
        if (side === 0) { tx = lerp(p1.x, p2.x, t); ty = lerp(p1.y, p2.y, t); }
        else if (side === 1) { tx = lerp(p2.x, p3.x, t); ty = lerp(p2.y, p3.y, t); }
        else { tx = lerp(p3.x, p1.x, t); ty = lerp(p3.y, p1.y, t); }
        p.targetX = tx + thick;
        p.targetY = ty + thick;
        p.color = '#f59e0b'; 
    });
  };

  const initParticles = (width: number, height: number) => {
    const count = config.particleCount;
    const scaleFactor = Math.max(0.6, Math.min(1.5, width / 400));
    
    if (particlesRef.current.length < count) {
        const toAdd = count - particlesRef.current.length;
        for (let i = 0; i < toAdd; i++) {
             particlesRef.current.push({
                id: particlesRef.current.length + i,
                x: width / 2,
                y: height / 2,
                vx: 0,
                vy: 0,
                baseX: 0,
                baseY: 0,
                radius: config.particleSize * scaleFactor,
                friction: 0.90,
                ease: 0.12,
                color: config.primaryColor
             });
        }
    } else if (particlesRef.current.length > count) {
        particlesRef.current = particlesRef.current.slice(0, count);
    }
    
    particlesRef.current.forEach(p => {
        p.radius = config.particleSize * scaleFactor;
    });

    updateTargets(width, height);
  };

  const updateTargets = (width: number, height: number) => {
     const particles = particlesRef.current;
     switch (mode) {
         case AnimationMode.CORE_LOADING:
             setSphereTargets(width, height, particles);
             break;
         case AnimationMode.CORE_MINDMAP:
             setMindMapTargets(width, height, particles);
             break;
         case AnimationMode.CORE_EMPTY: 
             setScanningGrid(width, height, particles);
             break;
         case AnimationMode.CORE_SUCCESS:
             setCheckmarkTargets(width, height, particles);
             break;
         case AnimationMode.CORE_WARNING:
             setTriangleTargets(width, height, particles);
             break;
         case AnimationMode.CORE_ERROR:
             setErrorTargets(width, height, particles);
             break;
     }
  };

  // --- EVENT LISTENERS ---
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          mouseRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
          };
      };
      const handleMouseLeave = () => {
          mouseRef.current = { x: -9999, y: -9999 };
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);

      return () => {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
  }, []);

  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        initParticles(width, height);
    }
  }, [config.particleCount, mode, config.colorTheme, graphData]);

  useEffect(() => {
      const handleResize = () => {
          if (containerRef.current && canvasRef.current) {
              const { width, height } = containerRef.current.getBoundingClientRect();
              canvasRef.current.width = width;
              canvasRef.current.height = height;
              initParticles(width, height);
          }
      };
      const resizeObserver = new ResizeObserver(() => {
         handleResize();
      });
      if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
      }
      window.addEventListener('resize', handleResize);
      return () => {
          window.removeEventListener('resize', handleResize);
          resizeObserver.disconnect();
      };
  }, [mode, graphData]);

  // --- RENDER LOOP ---
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Time management
    timeRef.current += 0.015 * config.baseSpeed;
    const wavePosition = (timeRef.current * 300) % (canvas.width + 200) - 100;

    // Canvas Center for calculations
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const satelliteDist = Math.min(canvas.width, canvas.height) * 0.35;

    particlesRef.current.forEach(p => {
        let targetX = p.targetX || p.x;
        let targetY = p.targetY || p.y;

        // 1. SPECIAL ANIMATION LOGIC PER MODE
        if (mode === AnimationMode.CORE_LOADING) {
             // Breathing
             p.x += Math.cos(timeRef.current + p.id) * 0.2;
             p.y += Math.sin(timeRef.current + p.id) * 0.2;
        } else if (mode === AnimationMode.CORE_MINDMAP && graphData) {
             // Flow particles along lines
             if (p.targetNodeIndex !== undefined) {
                 // This particle belongs to a connector line
                 const i = p.targetNodeIndex;
                 const neighborCount = graphData.neighbors.length;
                 const nAngle = (i / neighborCount) * Math.PI * 2 - (Math.PI / 2);
                 const nx = cx + Math.cos(nAngle) * satelliteDist;
                 const ny = cy + Math.sin(nAngle) * satelliteDist;
                 
                 // Oscillation between center and target
                 const speed = 0.02 + (p.id % 100) * 0.0001;
                 const t = (Math.sin(timeRef.current * speed + p.id) + 1) / 2; // 0 to 1
                 targetX = lerp(cx, nx, t);
                 targetY = lerp(cy, ny, t);
             }
        }

        // 2. MOUSE INTERACTION (CHAOS)
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < MOUSE_RADIUS) {
            const angle = Math.atan2(dy, dx);
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            const pushFactor = 50;
            targetX += Math.cos(angle) * force * pushFactor;
            targetY += Math.sin(angle) * force * pushFactor;
        }

        // 3. PHYSICS
        const distX = targetX - p.x;
        const distY = targetY - p.y;
        p.x += distX * p.ease;
        p.y += distY * p.ease;

        // 4. RENDER
        let color = p.color || config.primaryColor;
        let radius = p.radius;
        let alpha = 1;

        if (mode === AnimationMode.CORE_EMPTY) {
            // Scanning Logic
            color = config.colorTheme === 'dark' ? '#52525b' : '#e4e4e7'; 
            const distFromWave = Math.abs(p.x - wavePosition);
            const waveWidth = 120;
            if (distFromWave < waveWidth) {
                const intensity = 1 - (distFromWave / waveWidth);
                color = config.accentColor;
                radius = p.radius * (1 + intensity * 0.8);
                p.y -= intensity * 3;
            }
        }

        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    animationFrameRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [config, mode, graphData]);

  return (
    <div ref={containerRef} className="w-full h-full relative group">
      <canvas ref={canvasRef} className="block" />
      
      {/* TEXT OVERLAYS FOR MIND MAP */}
      {mode === AnimationMode.CORE_MINDMAP && graphData && (
        <div className="absolute inset-0 pointer-events-none">
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8 text-center">
                <div className="text-xs font-bold tracking-widest uppercase opacity-80 bg-white/80 px-2 rounded border border-zinc-100 backdrop-blur-sm">
                    {graphData.center.label}
                </div>
                <div className="text-[9px] text-zinc-500 uppercase">{graphData.center.type}</div>
            </div>

            {/* Neighbor Labels */}
            {graphData.neighbors.map((n, i) => {
                 const neighborCount = graphData.neighbors.length;
                 const angle = (i / neighborCount) * Math.PI * 2 - (Math.PI / 2);
                 // Simple trig for positioning logic, matching canvas
                 // We can use inline styles for percent positioning
                 // Center is 50%, 50%. 
                 // Radius in % is approx 35%.
                 const xPercent = 50 + Math.cos(angle) * 35;
                 const yPercent = 50 + Math.sin(angle) * 35;
                 
                 return (
                     <div 
                        key={i}
                        className="absolute flex flex-col items-center justify-center w-32 transition-all duration-500 animate-in fade-in zoom-in"
                        style={{
                            left: `${xPercent}%`,
                            top: `${yPercent}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                     >
                        {/* Spacer for the dot */}
                        <div className="h-8 w-8 mb-1" /> 
                        <div className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap">
                            {n.node.label}
                        </div>
                        <div className="text-[9px] text-zinc-500 bg-white/50 px-1 rounded mt-0.5">
                            {n.relation}
                        </div>
                     </div>
                 )
            })}
        </div>
      )}
    </div>
  );
};

export default DotCanvas;
