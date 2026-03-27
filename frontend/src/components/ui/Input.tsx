import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    const id = React.useId()

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="text-start text-sm font-semibold text-on-surface-variant font-body"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            "flex h-12 w-full rounded-md bg-surface-container-high px-3 py-2 text-sm text-on-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-on-surface-variant/50",
            "transition-all duration-200 ease-in-out",
            // resting state uses surface_container_high
            "border-b-2 border-transparent outline-none", 
            // focused state transitions to surface_container_lowest with a subtle secondary (Amber) 2px bottom-stroke
            "focus:bg-surface-container-lowest focus:border-secondary focus:ring-0 focus:shadow-sm",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
