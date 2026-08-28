import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';

/**
 * Reusable smooth scroll container using Framer Motion.
 * Provides inertia/momentum physics to browser scrolling.
 */
export default function SmoothScroll({ children }) {
  const scrollRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(0);

  // Sync virtual scroll spacer height with actual page content height
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const handleResize = () => {
      if (scrollRef.current) {
        setPageHeight(scrollRef.current.getBoundingClientRect().height);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(scrollRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const transformY = useTransform(scrollY, (value) => -value);
  
  // Spring configurations for fluid, buttery-smooth scrolling
  const physicsY = useSpring(transformY, {
    stiffness: 65,
    damping: 20,
    mass: 0.5
  });

  return (
    <>
      <motion.div
        ref={scrollRef}
        style={{ y: physicsY }}
        className="fixed top-0 left-0 right-0 overflow-hidden w-full will-change-transform z-10"
      >
        {children}
      </motion.div>
      {/* Spacer to simulate native scroll height */}
      <div style={{ height: pageHeight }} className="w-full pointer-events-none" />
    </>
  );
}
