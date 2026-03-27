import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { elevation?: "lowest" | "low" | "high" }
>(({ className, elevation = "lowest", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl p-6", // 1rem radius (16px), spacing-6 (1.5rem padding)
        {
          "bg-surface-container-lowest": elevation === "lowest", // Default card surface
          "bg-surface-container-low": elevation === "low",       // Sits on surface
          "bg-surface-container-high": elevation === "high",     // Inset objects
        },
        // Ambient shadows for "Hero" donate cards or specific elements, can be added via className
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

export { Card }
