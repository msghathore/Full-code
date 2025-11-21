import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  element: HTMLDivElement;
}

export const DynamicBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const gradient = gradientRef.current;
    if (!container || !gradient) return;

    // Create particles
    const createParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full pointer-events-none';
        particle.style.background = `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)`;
        particle.style.width = `${Math.random() * 4 + 2}px`;
        particle.style.height = particle.style.width;

        const particleObj: Particle = {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: parseFloat(particle.style.width),
          opacity: Math.random() * 0.5 + 0.1,
          element: particle
        };

        container.appendChild(particle);
        particles.push(particleObj);
      }
      return particles;
    };

    particlesRef.current = createParticles();

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Update gradient position
      gsap.to(gradient, {
        background: `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.02) 40%, transparent 60%)`,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    // Scroll handler for parallax
    const handleScroll = () => {
      const scrollY = window.scrollY;
      gsap.to(container, {
        y: scrollY * 0.5,
        duration: 0.1,
        ease: 'none'
      });
    };

    // Animation loop
    const animate = () => {
      particlesRef.current.forEach((particle, index) => {
        // Mouse attraction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.vx += (dx / distance) * force * 0.02;
          particle.vy += (dy / distance) * force * 0.02;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary check
        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -0.8;
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -0.8;

        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Update element
        gsap.set(particle.element, {
          x: particle.x,
          y: particle.y,
          opacity: particle.opacity
        });
      });

      requestAnimationFrame(animate);
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      particlesRef.current.forEach(particle => {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: 'transform' }}
    >
      {/* Dynamic gradient overlay */}
      <div
        ref={gradientRef}
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 50%)'
        }}
      />

      {/* Additional parallax layers */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          transform: 'translateY(var(--scroll-y, 0))',
          willChange: 'transform'
        }}
      />
    </div>
  );
};