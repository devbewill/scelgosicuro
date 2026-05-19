"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ImmersiveSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const scale        = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5], [80, 0]);
  const textXLeft    = useTransform(scrollYProgress, [0, 0.4], [-1800, 0]);
  const textXRight   = useTransform(scrollYProgress, [0, 0.4], [1800, 0]);
  const textYTop     = useTransform(scrollYProgress, [0, 0.4], [-60, 0]);
  const textYBottom  = useTransform(scrollYProgress, [0, 0.4], [60, 0]);
  const centerScale  = useTransform(scrollYProgress, [0, 0.4], [1.4, 1]);

  return (
    <section ref={ref} className="pin-section">
      <div className="pin-sticky">
        <motion.div
          style={{ scale, borderRadius }}
          className="relative w-full h-full overflow-hidden z-10"
        >
          <img
            src="/sage-friedman.jpg"
            className="w-full h-full object-cover"
            alt="Scegli di essere sicuro"
          />
        </motion.div>

        <div className="pin-content">
          <motion.div style={{ x: textXLeft, y: textYTop }} className="pin-word pin-word-top">
            SCEGLI
          </motion.div>
          <motion.div style={{ scale: centerScale }} className="pin-word pin-word-center">
            di essere
          </motion.div>
          <motion.div style={{ x: textXRight, y: textYBottom }} className="pin-word pin-word-bottom">
            SICURO
          </motion.div>
        </div>
      </div>
    </section>
  );
}
