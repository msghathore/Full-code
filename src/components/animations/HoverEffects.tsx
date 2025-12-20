import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoverProps {
  children: ReactNode;
  className?: string;
}

// Scale up on hover with smooth transition
export const ScaleOnHover = ({ children, className = '' }: HoverProps) => (
  <motion.div
    className={className}
    whileHover={{
      scale: 1.05,
      transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
    }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);

// Glow effect on hover (for dark themed sites)
export const GlowOnHover = ({ children, className = '' }: HoverProps) => (
  <motion.div
    className={className}
    whileHover={{
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
      transition: { duration: 0.3 },
    }}
  >
    {children}
  </motion.div>
);

// Lift effect on hover (card-like elements)
export const LiftOnHover = ({ children, className = '' }: HoverProps) => (
  <motion.div
    className={className}
    whileHover={{
      y: -8,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
    }}
    whileTap={{ y: -4 }}
  >
    {children}
  </motion.div>
);

// Tilt 3D effect on hover
export const TiltOnHover = ({ children, className = '' }: HoverProps) => (
  <motion.div
    className={className}
    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    whileHover={{
      rotateX: 5,
      rotateY: -5,
      transition: { duration: 0.3 },
    }}
  >
    {children}
  </motion.div>
);

// Shine/shimmer effect on hover
export const ShineOnHover = ({ children, className = '' }: HoverProps) => (
  <motion.div
    className={`relative overflow-hidden ${className}`}
    whileHover="hover"
  >
    {children}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
      variants={{
        hover: {
          x: '200%',
          transition: { duration: 0.6, ease: 'easeInOut' },
        },
      }}
    />
  </motion.div>
);
