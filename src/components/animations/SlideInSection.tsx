import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface SlideInSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  once?: boolean;
  delay?: number;
}

export const SlideInSection = ({
  children,
  className = '',
  direction = 'up',
  distance = 100,
  once = true,
  delay = 0,
}: SlideInSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, y: 0 };
      case 'right':
        return { x: distance, y: 0 };
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      default:
        return { x: 0, y: distance };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        ...getInitialPosition(),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

// Horizontal scroll reveal - content moves as you scroll
export const HorizontalScrollSection = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);

  return (
    <div ref={targetRef} className={`overflow-hidden ${className}`}>
      <motion.div style={{ x }} className="flex">
        {children}
      </motion.div>
    </div>
  );
};

export default SlideInSection;
