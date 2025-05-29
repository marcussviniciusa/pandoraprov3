"use client"

import { motion } from "framer-motion"

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  variant?: {
    hidden: { y: number; opacity: number; filter: string }
    visible: { y: number; opacity: number; filter: string }
  }
  duration?: number
  delay?: number
  yOffset?: number
  inView?: boolean
}

const defaultVariant = {
  hidden: { y: 6, opacity: 0, filter: "blur(6px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)" }
}

export function BlurFade({
  children,
  className,
  variant = defaultVariant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
}: BlurFadeProps) {
  return (
    <motion.div
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true }}
      variants={variant}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
} 