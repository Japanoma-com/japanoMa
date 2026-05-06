"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent font-ui font-semibold whitespace-nowrap transition-all duration-base ease-settle outline-none select-none focus-visible:ring-2 focus-visible:ring-sumi/30 focus-visible:ring-offset-2 focus-visible:ring-offset-washi disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-ai text-washi shadow-sm hover:bg-ai-deep",
        primary:
          "bg-ai text-washi shadow-sm hover:bg-ai-deep",
        outline:
          "border-ai/30 bg-transparent text-ai-deep hover:border-ai hover:bg-ai/[0.04] active:bg-ai/[0.08]",
        secondary:
          "bg-shoji text-sumi-light shadow-sm hover:bg-washi hover:text-sumi",
        ghost:
          "text-sumi-light hover:bg-washi hover:text-sumi active:bg-bamboo/30",
        destructive:
          "bg-beni text-kinu shadow-sm hover:bg-beni/85",
        link: "text-ai underline-offset-4 hover:underline hover:text-ai-deep p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm tracking-wide",
        sm: "h-9 px-4 py-2 text-xs tracking-wide",
        lg: "h-13 px-8 py-3 text-base tracking-wide",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
