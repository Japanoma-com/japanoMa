import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      // Filled card. Definition is the soft shadow at rest; hover
      // lifts; focus adds a low-alpha indigo halo (no hard ring,
      // no thick border). Consistent with the rest of the site's
      // borderless shadow vocabulary (AreaCardFrame, PhasePill).
      className={cn(
        "h-11 w-full min-w-0 rounded-lg bg-kinu px-ma-4 font-ui text-[15px] text-sumi outline-none placeholder:text-ash transition-[box-shadow,background-color] duration-base ease-settle shadow-card hover:shadow-[0_2px_8px_rgba(26,24,22,0.06)] focus:shadow-[0_0_0_3px_rgba(61,90,122,0.15),0_2px_8px_rgba(26,24,22,0.06)] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
