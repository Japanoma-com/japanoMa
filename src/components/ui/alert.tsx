import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative w-full bg-shoji border-l-2 rounded-lg p-ma-6 text-left text-sm",
  {
    variants: {
      variant: {
        default: "border-l-bamboo text-sumi-light",
        destructive: "border-l-beni text-sumi-light",
        warning: "border-l-kohaku text-sumi-light",
        info: "border-l-ai text-sumi-light",
        success: "border-l-matsu text-sumi-light",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-ui font-semibold text-base text-sumi mb-ma-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-sumi-light leading-relaxed [&_p:not(:last-child)]:mb-ma-4",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
