import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const SOFT = [0.22, 1, 0.36, 1] as const;

type RiseProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

/** The only entrance animation in the product.
 *  Replaces SplitText, AnimatedCounter, FloatingOrb and every staggered
 *  orb/scale entrance across the old pages. */
export const Rise = ({ children, delay = 0, className }: RiseProps) => {
  const still = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: SOFT }}
    >
      {children}
    </motion.div>
  );
};

/** Stagger helper — keep to three children, 60ms apart. */
export const RiseGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(className)}>
    {React.Children.map(children, (child, i) => (
      <Rise delay={i * 0.06}>{child}</Rise>
    ))}
  </div>
);

/** Layout settle for filtered lists (Discover, Applications, Deliverables).
 *  Wrap the mapped items in <AnimatePresence> and give each this motion. */
export const listItemMotion = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: SOFT },
} as const;

export { SOFT as SOFT_EASE };
