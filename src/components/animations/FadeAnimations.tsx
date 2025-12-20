import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

const createFadeVariants = (
  direction: 'up' | 'down' | 'left' | 'right' | 'none',
  distance: number = 40
): Variants => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
};

export const FadeIn = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: FadeProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount }}
    variants={createFadeVariants('none')}
    transition={{
      duration,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);

export const FadeInUp = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: FadeProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount }}
    variants={createFadeVariants('up')}
    transition={{
      duration,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);

export const FadeInDown = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: FadeProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount }}
    variants={createFadeVariants('down')}
    transition={{
      duration,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);

export const FadeInLeft = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: FadeProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount }}
    variants={createFadeVariants('left')}
    transition={{
      duration,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);

export const FadeInRight = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: FadeProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount }}
    variants={createFadeVariants('right')}
    transition={{
      duration,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);
