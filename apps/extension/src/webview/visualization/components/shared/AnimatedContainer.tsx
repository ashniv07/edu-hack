import { motion, AnimatePresence, type Variants, type Transition } from 'framer-motion';
import type { AnimationType, AnimationState } from '../../types';
import { ANIMATION, COLORS } from '../../constants';

// Animation variants for different animation types
const createVariants = (type: AnimationType): Variants => {
  switch (type) {
    case 'fade-in':
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      };

    case 'fade-out':
      return {
        initial: { opacity: 1 },
        animate: { opacity: 0.3 },
        exit: { opacity: 0 },
      };

    case 'highlight':
      return {
        initial: { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
        animate: {
          boxShadow: [
            '0 0 0 0 rgba(59, 130, 246, 0)',
            '0 0 0 4px rgba(59, 130, 246, 0.4)',
            '0 0 0 0 rgba(59, 130, 246, 0)',
          ],
        },
      };

    case 'pulse-error':
      return {
        initial: { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        animate: {
          boxShadow: [
            '0 0 0 0 rgba(239, 68, 68, 0)',
            '0 0 0 4px rgba(239, 68, 68, 0.4)',
            '0 0 0 0 rgba(239, 68, 68, 0)',
          ],
        },
      };

    case 'connect':
      return {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
      };

    case 'disconnect':
      return {
        initial: { pathLength: 1, opacity: 1 },
        animate: { pathLength: 0, opacity: 0 },
      };

    case 'declare':
      return {
        initial: { opacity: 0, y: -20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
      };

    case 'assign':
      return {
        initial: { backgroundColor: COLORS.ui.background },
        animate: {
          backgroundColor: [COLORS.ui.background, COLORS.ui.highlight, COLORS.ui.background],
        },
      };

    case 'free':
      return {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: 0.4,
          scale: 0.95,
          filter: 'grayscale(100%)',
        },
      };

    case 'dereference':
      return {
        initial: { scale: 1 },
        animate: {
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0 0 rgba(59, 130, 246, 0)',
            '0 0 0 3px rgba(59, 130, 246, 0.3)',
            '0 0 0 0 rgba(59, 130, 246, 0)',
          ],
        },
      };

    case 'move':
      return {
        initial: { x: 0 },
        animate: { x: [0, 10, 0] },
      };

    case 'borrow':
      return {
        initial: { borderStyle: 'solid' },
        animate: { borderStyle: 'dashed' },
      };

    default:
      return {
        initial: {},
        animate: {},
      };
  }
};

// Map animation state to appropriate variant key
const stateToVariant: Record<AnimationState, string> = {
  entering: 'animate',
  exiting: 'exit',
  active: 'animate',
  idle: 'initial',
  error: 'animate',
};

interface AnimatedContainerProps {
  children: React.ReactNode;
  animationType?: AnimationType;
  animationState?: AnimationState;
  isActive?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedContainer({
  children,
  animationType = 'fade-in',
  animationState = 'idle',
  isActive = true,
  duration = ANIMATION.duration.normal / 1000,
  delay = 0,
  className,
  style,
}: AnimatedContainerProps) {
  const variants = createVariants(animationType);
  const variantKey = stateToVariant[animationState];

  const transition: Transition = {
    duration,
    delay: delay / 1000,
    ease: 'easeInOut',
  };

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          className={className}
          style={style}
          variants={variants}
          initial="initial"
          animate={variantKey}
          exit="exit"
          transition={transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Specialized animated components
interface AnimatedPathProps {
  d: string;
  stroke: string;
  strokeWidth?: number;
  animationType: 'connect' | 'disconnect';
  duration?: number;
  delay?: number;
}

export function AnimatedPath({
  d,
  stroke,
  strokeWidth = 2,
  animationType,
  duration = 0.5,
  delay = 0,
}: AnimatedPathProps) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      initial={{ pathLength: animationType === 'connect' ? 0 : 1, opacity: animationType === 'connect' ? 0 : 1 }}
      animate={{ pathLength: animationType === 'connect' ? 1 : 0, opacity: animationType === 'connect' ? 1 : 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    />
  );
}

interface PulseIndicatorProps {
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function PulseIndicator({
  color = COLORS.status.info,
  size = 8,
  style,
}: PulseIndicatorProps) {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        ...style,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
