"use client"

import Link from "next/link"
import { buttonVariants } from "./button"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

type ButtonLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
} & VariantProps<typeof buttonVariants>

export function ButtonLink({ href, children, variant, size, className }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size, className }))}>
      {children}
    </Link>
  )
}
