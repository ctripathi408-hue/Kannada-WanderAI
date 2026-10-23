import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  as?: 'section' | 'div' | 'article';
  id?: string;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  yOffset = 28,
  as = 'section',
  id
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Keep animations strictly between 0.3 and 0.8 seconds
  const clampedDuration = Math.min(0.8, Math.max(0.3, duration));

  const MotionComponent = as === 'section' ? motion.section : as === 'article' ? motion.article : motion.div;

  if (shouldReduceMotion) {
    return (
      <MotionComponent id={id} className={className}>
        {children}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      id={id}
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: clampedDuration,
        delay: Math.min(0.5, delay),
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </MotionComponent>
  );
};
