import { cn } from "@/lib/utils"

interface AnimatedShinyTextProps {
  children: React.ReactNode
  className?: string
  shimmerWidth?: number
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <p
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
        className
      )}
      style={{
        "--shiny-width": `${shimmerWidth}px`,
      } as React.CSSProperties}
    >
      <span className="inline-block animate-shiny-text bg-gradient-to-r from-neutral-600 via-black/90 to-neutral-600 bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent transition-colors dark:from-neutral-400 dark:via-white dark:to-neutral-400">
        {children}
      </span>
    </p>
  )
} 