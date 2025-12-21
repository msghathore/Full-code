import { motion } from 'framer-motion';
import { memo } from 'react';

interface AnimatedUserIconProps {
  className?: string;
  size?: number;
  onClick?: () => void;
}

const AnimatedUserIconComponent = ({ className = '', size = 36, onClick }: AnimatedUserIconProps) => {
  return (
    <motion.a
      href="/auth"
      className={`cursor-pointer block relative ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 4px 12px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(255,255,255,0.15))',
      }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Glow filter */}
        <defs>
          <filter id="userGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Head with forehead, ears, and thin chin - realistic human silhouette */}
        <motion.path
          d="M12 2C9.8 2 8 3.8 8 6v1c0 0.2-0.3 0.4-0.5 0.4-0.4 0-0.7 0.3-0.7 0.7v1.2c0 0.4 0.3 0.7 0.7 0.7 0.2 0 0.5 0.2 0.5 0.4v1c0 1.8 1.2 3.3 2.8 3.8L12 17l1.2-1.8c1.6-0.5 2.8-2 2.8-3.8v-1c0-0.2 0.3-0.4 0.5-0.4 0.4 0 0.7-0.3 0.7-0.7V8.1c0-0.4-0.3-0.7-0.7-0.7-0.2 0-0.5-0.2-0.5-0.4V6c0-2.2-1.8-4-4-4z"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#userGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />

        {/* Body/Shoulders - curved path */}
        <motion.path
          d="M4 23v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#userGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        />

        {/* Subtle pulsing glow - head */}
        <motion.path
          d="M12 2C9.8 2 8 3.8 8 6v1c0 0.2-0.3 0.4-0.5 0.4-0.4 0-0.7 0.3-0.7 0.7v1.2c0 0.4 0.3 0.7 0.7 0.7 0.2 0 0.5 0.2 0.5 0.4v1c0 1.8 1.2 3.3 2.8 3.8L12 17l1.2-1.8c1.6-0.5 2.8-2 2.8-3.8v-1c0-0.2 0.3-0.4 0.5-0.4 0.4 0 0.7-0.3 0.7-0.7V8.1c0-0.4-0.3-0.7-0.7-0.7-0.2 0-0.5-0.2-0.5-0.4V6c0-2.2-1.8-4-4-4z"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Subtle pulsing glow - body */}
        <motion.path
          d="M4 23v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </motion.svg>
    </motion.a>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export const AnimatedUserIcon = memo(AnimatedUserIconComponent);

export default AnimatedUserIcon;
