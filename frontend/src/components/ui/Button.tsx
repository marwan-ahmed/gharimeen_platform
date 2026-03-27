import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          "px-4 py-2", // Base padding
          {
            // Primary: Teal Gradient, White Text, No Border
            "bg-gradient-to-br from-primary to-primary-container text-white shadow-sm hover:opacity-90":
              variant === "primary",
            // Secondary: Transparent, Ghost Border (outline-variant 20%)
            "bg-transparent border border-outline-variant/20 text-on-background hover:bg-surface-container-low":
              variant === "secondary",
            // Tertiary: No border, Teal Text
            "bg-transparent text-primary hover:bg-primary/10":
              variant === "tertiary",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
