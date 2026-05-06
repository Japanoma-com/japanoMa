import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-ui text-sm font-medium uppercase tracking-wide whitespace-nowrap transition-colors duration-base ease-settle outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ai/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-ai text-kinu hover:bg-ai-deep",
        outline:
          "border-bamboo bg-transparent text-sumi-light hover:bg-washi",
        secondary:
          "bg-washi text-sumi-light hover:bg-washi/80",
        ghost:
          "hover:bg-washi hover:text-sumi",
        destructive:
          "bg-beni text-kinu hover:bg-beni/80",
        link: "text-ai underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-ma-6 py-ma-3",
        sm: "h-8 px-ma-4 py-ma-2 text-xs",
        lg: "h-12 px-ma-8 py-ma-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
