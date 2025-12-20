import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  once?: boolean;
}

export const ImageReveal = ({
  children,
  className = '',
  direction = 'left',
  delay = 0,
  duration = 0.8,
  once = true,
}: ImageRevealProps) => {
  const getInitialMask = () => {
    switch (direction) {
      case 'left':
        return 'inset(0 100% 0 0)';
      case 'right':
        return 'inset(0 0 0 100%)';
      case 'up':
        return 'inset(100% 0 0 0)';
      case 'down':
        return 'inset(0 0 100% 0)';
      default:
        return 'inset(0 100% 0 0)';
    }
  };

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={{ clipPath: getInitialMask() }}
      whileInView={{ clipPath: 'inset(0 0 0 0)' }}
      viewport={{ once, amount: 0.3 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      <motion.div
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={{ once, amount: 0.3 }}
        transition={{
          duration: duration * 1.5,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ImageReveal;
